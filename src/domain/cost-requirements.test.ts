/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.1/8.2, FT-003.16.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { INITIAL_UNVERIFIED_COST_REQUIREMENTS } from './cost-requirements';
import { INITIAL_COST_REQUIREMENTS, INITIAL_MAINTENANCE_REQUIREMENTS } from './initial-scenarios';

const canonical = readFileSync(new URL('../../RCF.md',import.meta.url),'utf8');

describe('Pendências explícitas de custos fora da manutenção', () => {
  it('mantém cada referência vinculada a trecho existente da seção canônica indicada', () => {
    expect(INITIAL_UNVERIFIED_COST_REQUIREMENTS.length).toBeGreaterThan(0);
    for (const r of INITIAL_UNVERIFIED_COST_REQUIREMENTS) {
      const match = /^RCF\.md §(8\.[12]) \| (.+)$/.exec(r.provenance.source);
      if (!match) throw new Error('Referência normativa malformada');
      const marker = match[1]==='8.1'?'### 8.1 Classificação':'### 8.2 Fórmulas';
      const section = canonical.split(marker)[1]?.split('### 8.')[0];
      if (!section) throw new Error('Seção canônica ausente');
      expect(section).toContain(match[2]);
    }
  });
  it('conserva lacunas e motivos sem inventar valores ou inaplicabilidade', () => {
    for (const r of INITIAL_UNVERIFIED_COST_REQUIREMENTS) {
      expect(r.status).toBe('unverified'); expect(r.reason?.trim().length).toBeGreaterThan(0);
      expect(r).not.toHaveProperty('costItemIds'); expect(r).not.toHaveProperty('value'); expect(r).not.toHaveProperty('amount');
      expect(r.provenance).toMatchObject({kind:'gap',reliability:'unverified',date:null,competence:null,scope:{kind:'global'}});
    }
  });
  it('reúne as pendências e a manutenção sem duplicar registros canônicos', () => {
    expect(INITIAL_COST_REQUIREMENTS).toHaveLength(INITIAL_UNVERIFIED_COST_REQUIREMENTS.length+INITIAL_MAINTENANCE_REQUIREMENTS.length);
    for (const r of [...INITIAL_UNVERIFIED_COST_REQUIREMENTS,...INITIAL_MAINTENANCE_REQUIREMENTS])
      expect(INITIAL_COST_REQUIREMENTS.find(x=>x.id===r.id)).toBe(r);
    expect(INITIAL_COST_REQUIREMENTS.some(r=>r.status==='unverified')).toBe(true);
    expect(new Set(INITIAL_COST_REQUIREMENTS.map(r=>r.id)).size).toBe(INITIAL_COST_REQUIREMENTS.length);
  });
  it('mantém identidades e metadados congelados sem fechar a taxonomia de custos', () => {
    expect(Object.isFrozen(INITIAL_UNVERIFIED_COST_REQUIREMENTS)).toBe(true);
    expect(Object.isFrozen(INITIAL_COST_REQUIREMENTS)).toBe(true);
    expect(new Set(INITIAL_UNVERIFIED_COST_REQUIREMENTS.map(r=>r.category)).size).toBe(INITIAL_UNVERIFIED_COST_REQUIREMENTS.length);
    for (const r of INITIAL_UNVERIFIED_COST_REQUIREMENTS) {
      expect(JSON.parse(r.id)).toEqual(['initial-cost-requirement',r.category]);
      for (const value of [r,r.provenance,r.provenance.scope]) expect(Object.isFrozen(value)).toBe(true);
    }
  });
});
