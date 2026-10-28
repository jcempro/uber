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
import { INITIAL_MAINTENANCE_PARAMETERS, INITIAL_MAINTENANCE_COST_ITEMS, INITIAL_MAINTENANCE_REQUIREMENTS } from './initial-scenarios';
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
  it('preserva sete rubricas do RCF sem adotar automaticamente suas taxas', () => {
    expect(rows).toHaveLength(7);
    for (const id of ids) {
      const result = createInitialMaintenanceParameters('scenario-'+id,id);
      expect(result.map(p => p.name)).toEqual(rows.map(row => row[0]));
      for (const p of result) {
        expect(p.input.status).toBe('not-provided');
        expect(p.input).not.toHaveProperty('value');
      }
    }
  });
  it('preserva totais apenas na tabela histórica, sem total operacional presumido', () => {
    for (const [index,id] of ids.entries()) {
      const result = createInitialMaintenanceParameters('scenario-'+id,id);
      const values = MAINTENANCE_RATE_REFERENCES.map(row => row.rates[id]);
      expect(result.every(p => p.input.status === 'not-provided')).toBe(true);
      expect(Decimal.sum(...values).eq(totals[index+1].replace(',','.'))).toBe(true);
      expect(result).toHaveLength(rows.length);
    }
  });
  it('mantém unidade e domínio com lacuna explícita em escopo de cenário', () => {
    for (const id of ids) for (const [index,p] of createInitialMaintenanceParameters('scenario-'+id,id).entries()) {
      expect(p.category).toBe(MAINTENANCE_RATE_REFERENCES[index].id);
      expect(p.unit).toBe('BRL/km'); expect(p.required).toBe(true);
      expect(p.constraints).toBe(NUMERIC_RULES.nonNegative); expect(p.dependencies).toEqual([]);
      expect(p.provenance).toEqual({kind:'gap',source:'RCF.md §6.2',date:null,competence:null,scope:{kind:'scenario',scenarioId:'scenario-'+id},reliability:'unverified'});
      expect(p.input.status).toBe('not-provided');
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

  it('liga sete itens pendentes aos parâmetros sem duplicar quantias', () => {
    for (const id of ids) {
      const scenarioId = 'scenario-'+id, catalog = createInitialMaintenanceCatalog(scenarioId,id);
      expect(catalog.parameters.map(p=>p.name)).toEqual(rows.map(row=>row[0]));
      expect(catalog.parameters.every(p=>p.input.status==='not-provided')).toBe(true);
      expect(catalog.items).toHaveLength(rows.length); expect(catalog.requirements).toHaveLength(rows.length);
      for (const item of catalog.items) {
        const p = catalog.parameters.find(p=>p.id===item.amountParameterId);
        expect(p).toBeDefined();
        expect(p?.provenance.scope).toEqual({kind:'scenario',scenarioId});
        expect(item).toEqual({
          id:JSON.stringify(['maintenance-reserve',scenarioId,p?.category]),
          name:p?.name,category:p?.category,enabled:false,nature:'usage-variable',
          basis:{kind:'usage',unit:'km'},amountParameterId:p?.id,provenance:p?.provenance,
          validity:{start:null,end:null},recognition:'planned-reserve',
          eventId:null,reconcilesReserveId:null,allocationRuleId:null,
        });
        expect(catalog.requirements.find(r=>r.category===item.category)).toEqual({
          id:JSON.stringify(['maintenance-requirement',scenarioId,item.category]),
          name:item.name,category:item.category,provenance:item.provenance,
          status:'unverified',reason:expect.stringMatching(/\S/),
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
  it('RCF vigente impede taxa operacional implícita ou zero em todos os perfis', () => {
    expect(section).toContain('O sistema NÃO DEVE impô-los como custos operacionais ativos por padrão');
    for (const profile of ids) {
      const pending = createInitialMaintenanceParameters('no-adoption-'+profile,profile);
      expect(pending).toHaveLength(rows.length);
      for (const parameter of pending) {
        expect(parameter.input).toEqual({status:'not-provided',reason:expect.stringMatching(/\S/)});
        expect(parameter.input).not.toHaveProperty('value');
        expect(parameter.provenance.kind).toBe('gap');
        expect(parameter.provenance.reliability).toBe('unverified');
      }
    }
  });
  it('cenários iniciais mantêm manutenção pendente sem itens ativos ou adoção por perfil', () => {
    expect(section).toContain('hipótese opcional explicitamente adotada');
    const count = ids.length * rows.length;
    expect(INITIAL_MAINTENANCE_PARAMETERS).toHaveLength(count);
    expect(INITIAL_MAINTENANCE_COST_ITEMS).toHaveLength(count);
    expect(INITIAL_MAINTENANCE_REQUIREMENTS).toHaveLength(count);
    for (const parameter of INITIAL_MAINTENANCE_PARAMETERS) {
      expect(parameter.input).toEqual({status:'not-provided',reason:expect.stringMatching(/\S/)});
      expect(parameter.input).not.toHaveProperty('value');
    }
    for (const item of INITIAL_MAINTENANCE_COST_ITEMS) expect(item.enabled).toBe(false);
    for (const requirement of INITIAL_MAINTENANCE_REQUIREMENTS) {
      expect(requirement.status).toBe('unverified');
      expect(requirement).not.toHaveProperty('costItemIds');
      expect(requirement.status==='unverified' && /\S/.test(requirement.reason)).toBe(true);
    }
  });

});
