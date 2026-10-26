/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/6.2/8, FT-003.14c/003.14d.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { readFileSync } from 'node:fs';
import Decimal from 'decimal.js';
import { describe, expect, it } from 'vitest';
import { createInitialMaintenanceParameters, createInitialMaintenanceCatalog } from './maintenance';
import { NUMERIC_RULES } from './validation';
import type { InitialProfileId } from './defaults';
import { INITIAL_PROFILE_REFERENCES, MAINTENANCE_RATE_REFERENCES, MAINTENANCE_REFERENCE_METADATA } from './defaults';

const ids = ['optimistic', 'balanced', 'pessimistic'] as const;
const canonical = readFileSync(new URL('../../RCF.md', import.meta.url), 'utf8');
const section = canonical.split('### 6.2 Provisões por quilômetro')[1]?.split('## 7. Calendário')[0];
if (!section) throw new Error('Seção canônica de manutenção ausente');
const cells = section.split(/\r?\n/).filter(line => line.startsWith('|')).map(line => line.split('|').slice(1,-1).map(cell => cell.replaceAll('*','').trim()));
const rows = cells.slice(2).filter(row => !row[0].includes('Total derivado'));
const totals = cells.find(row => row[0].includes('Total derivado'));
if (!totals) throw new Error('Total canônico de conferência ausente');

/** Verifica toda a árvore de referências, evitando ciclos e sem tratar primitivas como mutáveis. */
function assertFrozen(value: unknown, seen = new Set<object>()): void {
  if (typeof value !== 'object' || value === null || seen.has(value)) return;
  seen.add(value);
  expect(Object.isFrozen(value)).toBe(true);
  for (const child of Object.values(value)) assertFrozen(child, seen);
}


describe('Parâmetros de manutenção materializados da fonte normativa', () => {
  it('preserva sete rubricas e21valores diretamente da tabela do RCF', () => {
    expect(rows).toHaveLength(7);
    for (const [index,id] of ids.entries()) {
      const result = createInitialMaintenanceParameters('scenario-'+id,id);
      expect(result.map(p => ({name:p.name,value:p.input.status==='provided'?p.input.value:undefined})))
        .toEqual(rows.map(row => ({name:row[0],value:row[index+1].replace(',','.')})));
    }
  });
  it('confere somas dos parâmetros com os totais derivados canônicos, sem nova entrada de total', () => {
    for (const [index,id] of ids.entries()) {
      const result = createInitialMaintenanceParameters('scenario-'+id,id);
      const values = result.map(p => { if(p.input.status!=='provided') throw new Error('Valor canônico ausente'); return p.input.value; });
      expect(Decimal.sum(...values).eq(totals[index+1].replace(',','.'))).toBe(true);
      expect(result).toHaveLength(rows.length);
    }
  });
  it('mantém unidade, domínio e estimativa em escopo de cenário, sem pagamento ou cobertura presumidos', () => {
    for (const id of ids) for (const [index,p] of createInitialMaintenanceParameters('scenario-'+id,id).entries()) {
      expect(p.category).toBe(MAINTENANCE_RATE_REFERENCES[index].id);
      expect(p.unit).toBe('BRL/km'); expect(p.required).toBe(true);
      expect(p.constraints).toBe(NUMERIC_RULES.nonNegative); expect(p.dependencies).toEqual([]);
      expect(p.provenance).toEqual({kind:'estimate',source:'RCF.md §6.2',date:null,competence:null,scope:{kind:'scenario',scenarioId:'scenario-'+id},reliability:'estimated'});
      expect(p.input.status).toBe('provided');
    }
  });
  it('preserva IDs brutos e identidades estáveis, distinguindo cenários sem colisões', () => {
    const all = ['a',' a','a|b'].flatMap(s => {
      const values = createInitialMaintenanceParameters(s,'balanced');
      for (const p of values) expect(JSON.parse(p.id)).toEqual(['maintenance-rate',s,p.category]);
      return values.map(p => p.id);
    });
    expect(new Set(all).size).toBe(all.length);
    expect(createInitialMaintenanceParameters('a','optimistic').map(p=>p.id))
      .toEqual(createInitialMaintenanceParameters('a','pessimistic').map(p=>p.id));
  });
  it('congela profundamente e repete resultados sem modificar os catálogos', () => {
    const before = JSON.stringify([INITIAL_PROFILE_REFERENCES,MAINTENANCE_RATE_REFERENCES,MAINTENANCE_REFERENCE_METADATA]);
    for (const id of ids) {
      const result = createInitialMaintenanceParameters('scenario-'+id,id);
      assertFrozen(result);
      expect(result).toEqual(createInitialMaintenanceParameters('scenario-'+id,id));
    }
    expect(JSON.stringify([INITIAL_PROFILE_REFERENCES,MAINTENANCE_RATE_REFERENCES,MAINTENANCE_REFERENCE_METADATA])).toBe(before);
  });
  it('rejeita IDs e perfis inválidos com diagnóstico previsto, sem coerção silenciosa', () => {
    // Conversões só introduzem entradas adversariais na fronteira runtime da fixture.
    for (const value of ['', ' ', '\t', null, 0, false])
      expect(() => createInitialMaintenanceParameters(value as unknown as string,'balanced')).toThrow(/scenarioId inválido/);
    for (const value of ['unknown','',null])
      expect(() => createInitialMaintenanceParameters('scenario',value as unknown as InitialProfileId)).toThrow(/profileId inválido/);
  });

  it('liga sete reservas e requisitos aos parâmetros canônicos sem duplicar quantias', () => {
    for (const [index,id] of ids.entries()) {
      const scenarioId = 'scenario-'+id, catalog = createInitialMaintenanceCatalog(scenarioId,id);
      expect(catalog.parameters.map(p=>({name:p.name,value:p.input.status==='provided'?p.input.value:undefined})))
        .toEqual(rows.map(row=>({name:row[0],value:row[index+1].replace(',','.')})));
      expect(catalog.items).toHaveLength(rows.length); expect(catalog.requirements).toHaveLength(rows.length);
      for (const item of catalog.items) {
        const p = catalog.parameters.find(p=>p.id===item.amountParameterId);
        expect(p).toBeDefined();
        expect(p?.provenance.scope).toEqual({kind:'scenario',scenarioId});
        expect(item).toEqual({
          id:JSON.stringify(['maintenance-reserve',scenarioId,p?.category]),
          name:p?.name,category:p?.category,enabled:true,nature:'usage-variable',
          basis:{kind:'usage',unit:'km'},amountParameterId:p?.id,provenance:p?.provenance,
          validity:{start:null,end:null},recognition:'planned-reserve',
          eventId:null,reconcilesReserveId:null,allocationRuleId:null,
        });
        expect(catalog.requirements.find(r=>r.category===item.category)).toEqual({
          id:JSON.stringify(['maintenance-requirement',scenarioId,item.category]),
          name:item.name,category:item.category,provenance:item.provenance,
          status:'applicable',costItemIds:[item.id],
        });
      }
    }
  });
  it('retorna apenas o catálogo congelado e determinístico sem alterar referências', () => {
    const before = JSON.stringify([INITIAL_PROFILE_REFERENCES,MAINTENANCE_RATE_REFERENCES,MAINTENANCE_REFERENCE_METADATA]);
    for (const id of ids) {
      const catalog = createInitialMaintenanceCatalog('scenario-'+id,id);
      expect(Object.keys(catalog).sort()).toEqual(['items','parameters','requirements']);
      assertFrozen(catalog);
      expect(catalog).toEqual(createInitialMaintenanceCatalog('scenario-'+id,id));
    }
    expect(JSON.stringify([INITIAL_PROFILE_REFERENCES,MAINTENANCE_RATE_REFERENCES,MAINTENANCE_REFERENCE_METADATA])).toBe(before);
  });
  it('isola identidades de parâmetros, itens e requisitos entre cenários sem normalizar IDs', () => {
    const a = createInitialMaintenanceCatalog('a','balanced'), b = createInitialMaintenanceCatalog(' a','balanced');
    const aIds = [...a.parameters,...a.items,...a.requirements].map(x=>x.id);
    const bIds = [...b.parameters,...b.items,...b.requirements].map(x=>x.id);
    expect(new Set([...aIds,...bIds]).size).toBe(aIds.length+bIds.length);
    const changedProfile = createInitialMaintenanceCatalog('a','optimistic');
    expect([...changedProfile.parameters,...changedProfile.items,...changedProfile.requirements].map(x=>x.id)).toEqual(aIds);
  });
  it('rejeita argumentos inválidos no catálogo completo sem gerar resultado parcial enganoso', () => {
    expect(()=>createInitialMaintenanceCatalog(' ','balanced')).toThrow(/scenarioId inválido/);
    expect(()=>createInitialMaintenanceCatalog(null as unknown as string,'balanced')).toThrow(/scenarioId inválido/);
    expect(()=>createInitialMaintenanceCatalog('a','unknown' as unknown as InitialProfileId)).toThrow(/profileId inválido/);
  });
});
