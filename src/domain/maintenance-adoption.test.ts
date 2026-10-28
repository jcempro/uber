/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/6.2, FT-003.38b.1c.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createAdoptedMaintenanceCatalog } from './maintenance-adoption';
import { createInitialMaintenanceCatalog } from './maintenance';
import { MAINTENANCE_RATE_REFERENCES, type InitialProfileId } from './defaults';
import type { HistoricalMaintenanceAdoption } from './maintenance-adoption-schema';
import { INITIAL_MAINTENANCE_PARAMETERS, INITIAL_MAINTENANCE_COST_ITEMS, INITIAL_MAINTENANCE_REQUIREMENTS } from './initial-scenarios';
const rcf = readFileSync(new URL('../../RCF.md',import.meta.url),'utf8');
const section = rcf.split('### 6.2 Provisões por quilômetro')[1]?.split('## 7. Calendário')[0];
if (!section?.includes('hipótese opcional explicitamente adotada')) throw new Error('Referência canônica de adoção ausente');
const rows = section.split(/\r?\n/).filter(line=>line.startsWith('|')).slice(2).map(line=>line.split('|').slice(1,-1).map(cell=>cell.replaceAll('*','').trim())).filter(row=>!row[0].includes('Total derivado'));
const profiles = ['optimistic','balanced','pessimistic'] as const;
const adoption = Object.freeze({kind:'adopt-historical-hypothesis',reason:'  fundamento sintético preservado  '} as const);
/** Confere árvore congelada sem confundir readonly de tipos com runtime. */
function frozen(value: unknown): void {
  if (value === null || typeof value !== 'object') return;
  expect(Object.isFrozen(value)).toBe(true);
  for (const child of Object.values(value)) frozen(child);
}
describe('Adoção explícita de hipótese histórica de manutenção', () => {
  it('seleciona21taxas diretamente da fonte canônica, sem total adicional', () => {
    expect(rows).toHaveLength(7);
    for (const [index,profile] of profiles.entries()) {
      const catalog = createAdoptedMaintenanceCatalog('scenario-'+profile,profile,adoption);
      expect(catalog.parameters.map(p=>({name:p.name,input:p.input}))).toEqual(rows.map(row=>({name:row[0],input:{status:'provided',value:row[index+1].replace(',','.')}})));
      expect(catalog.parameters).toHaveLength(rows.length);
    }
  });
  it('não ativa os seeds nem troca ausência por zero fora da adoção', () => {
    createAdoptedMaintenanceCatalog('scenario-balanced','balanced',adoption);
    for (const p of INITIAL_MAINTENANCE_PARAMETERS) { expect(p.input.status).toBe('not-provided'); expect(p.input).not.toHaveProperty('value'); }
    for (const item of INITIAL_MAINTENANCE_COST_ITEMS) expect(item.enabled).toBe(false);
    for (const r of INITIAL_MAINTENANCE_REQUIREMENTS) expect(r.status).toBe('unverified');
    expect(createInitialMaintenanceCatalog('a','balanced').parameters.every(p=>p.input.status==='not-provided')).toBe(true);
  });
  it('rejeita declaração ausente, inválida, extra ou sem fundamento no runtime', () => {
    for (const value of [undefined,null,{},false,{kind:adoption.kind,reason:' '},{...adoption,kind:'estimate'},{...adoption,extra:true}])
      expect(()=>createAdoptedMaintenanceCatalog('a','balanced',value as unknown as HistoricalMaintenanceAdoption)).toThrow(/Adoção inválida/);
  });
  it('reutiliza rejeição de IDs e perfis sem coerção', () => {
    for (const id of ['', ' ', null, 0]) expect(()=>createAdoptedMaintenanceCatalog(id as unknown as string,'balanced',adoption)).toThrow(/scenarioId inválido/);
    expect(()=>createAdoptedMaintenanceCatalog('a','unknown' as InitialProfileId,adoption)).toThrow(/profileId inválido/);
  });
  it('identifica estimativa condicional e preserva fundamento bruto e escopo', () => {
    const catalog = createAdoptedMaintenanceCatalog(' a','balanced',adoption);
    for (const row of [...catalog.parameters,...catalog.items,...catalog.requirements]) {
      expect(row.provenance.kind).toBe('estimate'); expect(row.provenance.reliability).toBe('conditional');
      expect(row.provenance.source).toContain('RCF.md §6.2'); expect(row.provenance.source).toContain('balanced'); expect(row.provenance.source).toContain(adoption.reason);
      expect(row.provenance.source).toContain('Hipótese histórica expressamente adotada');
      expect(row.provenance.scope).toEqual({kind:'scenario',scenarioId:' a'});
      expect(row.provenance.date).toBeNull(); expect(row.provenance.competence).toBeNull();
    }
  });
  it('preserva IDs e liga cada requisito somente a seu item e parâmetro', () => {
    const scenarioId=' a', base=createInitialMaintenanceCatalog(scenarioId,'balanced'), catalog=createAdoptedMaintenanceCatalog(scenarioId,'balanced',adoption);
    expect(catalog.parameters.map(p=>p.id)).toEqual(base.parameters.map(p=>p.id)); expect(catalog.items.map(p=>p.id)).toEqual(base.items.map(p=>p.id)); expect(catalog.requirements.map(p=>p.id)).toEqual(base.requirements.map(p=>p.id));
    for (const item of catalog.items) { expect(item.enabled).toBe(true); expect(catalog.parameters.filter(p=>p.id===item.amountParameterId&&p.category===item.category)).toHaveLength(1); }
    for (const r of catalog.requirements) {
      const matching=catalog.items.filter(item=>item.category===r.category); expect(matching).toHaveLength(1);
      expect(r.status).toBe('applicable'); if(r.status!=='applicable') throw new Error('Adoção sem requisito aplicável');
      expect(r.costItemIds).toEqual([matching[0].id]); expect(r.reason).toBe(adoption.reason);
    }
  });
  it('congela profundamente e repete resultados sem mutar catálogos ou decisão', () => {
    const before=JSON.stringify([MAINTENANCE_RATE_REFERENCES,adoption]);
    for(const profile of profiles) { const catalog=createAdoptedMaintenanceCatalog('a',profile,adoption); frozen(catalog); expect(catalog).toEqual(createAdoptedMaintenanceCatalog('a',profile,adoption)); }
    expect(JSON.stringify([MAINTENANCE_RATE_REFERENCES,adoption])).toBe(before);
  });
  it('mantém provisão e validade desconhecida sem inventar apuração financeira', () => {
    const catalog=createAdoptedMaintenanceCatalog('a','balanced',adoption);
    expect(Object.keys(catalog).sort()).toEqual(['items','parameters','requirements']);
    for(const item of catalog.items) { expect(item.recognition).toBe('planned-reserve'); expect(item.nature).toBe('usage-variable'); expect(item.basis).toEqual({kind:'usage',unit:'km'}); expect(item.validity).toEqual({start:null,end:null}); expect(item.eventId).toBeNull(); expect(item.reconcilesReserveId).toBeNull(); }
  });
});
