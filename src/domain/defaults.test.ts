/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§6.2, FT-003.5.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { readFileSync } from 'node:fs';
import Decimal from 'decimal.js';
import { describe, expect, it } from 'vitest';
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

describe('referências de manutenção vinculadas à fonte canônica', () => {
  it('preserva os três perfis iniciais sem fechar o cadastro de cenários', () => {
    expect(INITIAL_PROFILE_REFERENCES.map(p => p.id)).toEqual(ids);
    expect(INITIAL_PROFILE_REFERENCES.map(p => p.name)).toEqual(cells[0].slice(1));
  });
  it('preserva sete rubricas e21 valores sem recadastrar oráculos monetários', () => {
    expect(rows).toHaveLength(7);
    expect(MAINTENANCE_RATE_REFERENCES.map(row => ({name:row.name,rates:row.rates}))).toEqual(rows.map(row => ({
      name:row[0],rates:Object.fromEntries(ids.map((id,index) => [id,row[index+1].replace(',','.')]))
    })));
  });
  it('confere somas decimais com os totais derivados do RCF', () => {
    for (const [index,id] of ids.entries()) {
      const actual = Decimal.sum(...MAINTENANCE_RATE_REFERENCES.map(row => row.rates[id]));
      expect(actual.eq(totals[index+1].replace(',','.'))).toBe(true);
    }
  });
  it('identifica estimativa/provisão sem fingir pagamento ou data conhecida', () => {
    expect(MAINTENANCE_REFERENCE_METADATA).toEqual({
      unit:'BRL/km',nature:'usage-variable',recognition:'planned-reserve',
      provenance:{kind:'estimate',source:'RCF.md §6.2',date:null,competence:null,scope:{kind:'global'},reliability:'estimated'}
    });
  });
  it('congela profundamente as referências usadas para criar estado editável', () => {
    assertFrozen(INITIAL_PROFILE_REFERENCES);
    assertFrozen(MAINTENANCE_RATE_REFERENCES);
    assertFrozen(MAINTENANCE_REFERENCE_METADATA);
  });
  it('mantém identidades e não cria entrada adicional de total', () => {
    const expected = ['oil-service','tires-alignment','brakes-fluids','suspension-steering','cvt-preventive','battery-consumables','routine-repairs'];
    expect(MAINTENANCE_RATE_REFERENCES.map(row => row.id)).toEqual(expected);
    expect(new Set(MAINTENANCE_RATE_REFERENCES.map(row => row.id)).size).toBe(rows.length);
    for (const row of MAINTENANCE_RATE_REFERENCES) expect(row).not.toHaveProperty('total');
  });
});
