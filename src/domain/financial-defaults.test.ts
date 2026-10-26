/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§5/8/11, FT-003.10.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { readFileSync } from 'node:fs';
import Decimal from 'decimal.js';
import { describe, expect, it } from 'vitest';
import type { NumericParameter } from './model';
import type { FinancialObjective } from './scenario';
import { INITIAL_FINANCIAL_OBJECTIVES, INITIAL_FINANCIAL_PARAMETERS } from './defaults';
import { validateDecimalText } from './validation';

const rcf=readFileSync(new URL('../../RCF.md',import.meta.url),'utf8'),lines=rcf.split(/\r?\n/);
const salaryRow=lines.find(l=>l.includes('Salário mínimo 2026'));
const goalRows=[lines.find(l=>l.includes('| Objetivo principal')),lines.find(l=>l.includes('| Objetivo adicional'))];
const titheRow=lines.find(l=>l.includes('| Dízimo'));
if (!salaryRow || !titheRow || goalRows.some(r=>!r)) throw new Error('Fonte financeira canônica ausente');
const money=[...salaryRow.matchAll(/R\$\s*([\d.]+,\d{2})/g)].map(m=>m[1].replaceAll('.','').replace(',','.'));
const fractions=goalRows.map(r=>r?.match(/(\d+)%/)?.[1]);
const tithe=titheRow.match(/(\d+)%/)?.[1];
const reference=JSON.parse(readFileSync(new URL('../../.ia.rules/state/contexts/FT-001/salary-reference-2026.json',import.meta.url),'utf8')) as {source:string;issuedDate:string;competence:string;monthlyAmountBRL:string};

/** Obtém parâmetro referenciado; ausência não é valor zero. */
function parameter(id:string):NumericParameter {
  const p=INITIAL_FINANCIAL_PARAMETERS.find(p=>p.id===id);
  if (!p) throw new Error('Referência ausente: '+id);
  return p;
}
/** Só extrai entrada fornecida; não usa fallback para dados essenciais ausentes. */
function provided(id:string):string {
  const input=parameter(id).input;
  if(input.status!=='provided') throw new Error('Valor não fornecido: '+id);
  return input.value;
}
/** Seleciona definição salarial inicial, sem tratar qualquer outro modo como equivalente. */
function definition(objective:FinancialObjective) {
  const d=objective.definition;
  if(d.kind!=='salary-fraction') throw new Error('Objetivo inicial não salarial');
  return d;
}
/** Confere a árvore congelada usada para copiar o futuro estado editável. */
function assertFrozen(value:unknown):void {
  if(value===null||typeof value!=='object') return;
  expect(Object.isFrozen(value)).toBe(true);
  for(const child of Object.values(value)) assertFrozen(child);
}
describe('objetivos de lucro e referência financeira datada',()=>{
  it('mantém2 objetivos com vínculos únicos e somente5 entradas independentes',()=>{
    expect(INITIAL_FINANCIAL_OBJECTIVES).toHaveLength(2);
    expect(INITIAL_FINANCIAL_PARAMETERS).toHaveLength(5);
    expect(new Set(INITIAL_FINANCIAL_OBJECTIVES.map(o=>o.id)).size).toBe(2);
    expect(new Set(INITIAL_FINANCIAL_PARAMETERS.map(p=>p.id)).size).toBe(5);
    for(const o of INITIAL_FINANCIAL_OBJECTIVES) {
      const d=definition(o); expect(parameter(d.salaryParameterId)).toBeDefined(); expect(parameter(d.fractionParameterId)).toBeDefined();
    }
  });
  it('preserva salário mensal da fonte e proveniência oficial de2026',()=>{
    const p=parameter(definition(INITIAL_FINANCIAL_OBJECTIVES[0]).salaryParameterId);
    expect(provided(p.id)).toBe(money[0]); expect(provided(p.id)).toBe(reference.monthlyAmountBRL);
    expect(p.unit).toBe('BRL/month'); expect(p.provenance.kind).toBe('dated-official-fact');
    expect(p.provenance.source).toBe(reference.source); expect(salaryRow).toContain(reference.source);
    expect(p.provenance.date).toBe(reference.issuedDate); expect(p.provenance.competence).toBe(reference.competence);
  });
  it('preserva as frações percentuais da fonte, sem limitar toda meta a100%',()=>{
    for(const [i,o] of INITIAL_FINANCIAL_OBJECTIVES.entries()) {
      const p=parameter(definition(o).fractionParameterId);
      expect(new Decimal(provided(p.id)).times('100').eq(fractions[i]??'NaN')).toBe(true);
      expect(p.unit).toBe('ratio'); expect(validateDecimalText('2',p.constraints).valid).toBe(true);
    }
  });
  it('confere alvos derivados contra totais normativos sem guardá-los como entrada',()=>{
    for(const [i,o] of INITIAL_FINANCIAL_OBJECTIVES.entries()) {
      const d=definition(o);
      expect(new Decimal(provided(d.salaryParameterId)).times(provided(d.fractionParameterId)).eq(money[i+1])).toBe(true);
    }
  });
  it('registra dízimo sobre receita creditada sem importar taxa horária salarial',()=>{
    const p=parameter('finance-tithe-rate');
    expect(new Decimal(provided(p.id)).times('100').eq(tithe??'NaN')).toBe(true);
    expect(p.name).toMatch(/creditada/); expect(p.unit).toBe('ratio');
    expect(INITIAL_FINANCIAL_PARAMETERS.every(p=>p.unit==='ratio'||p.unit==='BRL/month')).toBe(true);
  });
  it('Lmin da operação não é piso por viagem nem zero presumido',()=>{
    const p=parameter('finance-minimum-operation-profit');
    expect(p.input.status).toBe('not-provided'); expect(p.input).not.toHaveProperty('value');
    expect(p.unit).toBe('BRL/month'); expect(p.provenance.kind).toBe('gap'); expect(p.required).toBe(true);
    expect(INITIAL_FINANCIAL_PARAMETERS.some(p=>p.id.includes('trip'))).toBe(false);
  });
  it('aplica domínios positivos/não negativos e de proporção nos papéis pertinentes',()=>{
    expect(validateDecimalText('0',parameter('finance-salary-reference').constraints).valid).toBe(false);
    expect(validateDecimalText('1.01',parameter('finance-tithe-rate').constraints).valid).toBe(false);
    expect(validateDecimalText('-0.01',parameter('finance-goal-partial').constraints).valid).toBe(false);
    expect(validateDecimalText('0',parameter('finance-minimum-operation-profit').constraints).valid).toBe(true);
  });
  it('congela dados e distingue decisões/lacunas da referência oficial',()=>{
    assertFrozen(INITIAL_FINANCIAL_OBJECTIVES); assertFrozen(INITIAL_FINANCIAL_PARAMETERS);
    for(const p of INITIAL_FINANCIAL_PARAMETERS) {
      expect(p.provenance.scope).toEqual({kind:'global'}); expect(p.dependencies).toEqual([]);
      if(p.id!=='finance-salary-reference') {expect(p.provenance.date).toBeNull();expect(p.provenance.competence).toBeNull();}
    }
  });
});
