/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§8.2, FT-003.40.1a.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { describe, it, expect } from 'vitest';
import {
  calculateConditionalLinearRevenueThreshold,
  type LinearRevenueThresholdInput,
} from './linear-revenue-threshold';
import type { ExactLimits } from './exact-budget';
import { calculateFinancialProjection } from './financial-result';

function exact(n: number, d: number) {
  return { numerator: String(n), denominator: String(d) };
}

function makeLimits(): ExactLimits {
  return { maxInputLength: 1000, maxDigits: 100 };
}

describe('calculateConditionalLinearRevenueThreshold', () => {
  const limits = makeLimits();

  it('deve calcular B=400 para A=340, G=17/20, alvo=0', () => {
    const input: LinearRevenueThresholdInput = {
      kind: 'projection',
      contextId: 'test-001',
      period: 'month',
      fixedCosts: exact(100, 1),
      usageCosts: exact(200, 1),
      extraordinaryCosts: exact(30, 1),
      fixedTaxes: exact(10, 1),
      titheRate: exact(1, 10),
      revenueTaxRate: exact(1, 20),
      targetProfit: exact(0, 1),
      model: { kind: 'fixed-usage-linear', reason: 'caso-base' },
    };
    const result = calculateConditionalLinearRevenueThreshold(input, limits);
    expect(result).toMatchObject({
      kind: 'projection',
      contextId: 'test-001',
      value: {
        requiredCreditedRevenue: { numerator: '400', denominator: '1' },
      },
    });
  });

  it('deve calcular B=1000 para A=340, G=17/20, alvo=510', () => {
    const input: LinearRevenueThresholdInput = {
      kind: 'projection',
      contextId: 'test-002',
      period: 'month',
      fixedCosts: exact(100, 1),
      usageCosts: exact(200, 1),
      extraordinaryCosts: exact(30, 1),
      fixedTaxes: exact(10, 1),
      titheRate: exact(1, 10),
      revenueTaxRate: exact(1, 20),
      targetProfit: exact(510, 1),
      model: { kind: 'fixed-usage-linear', reason: 'com-lucro' },
    };
    const result = calculateConditionalLinearRevenueThreshold(input, limits);
    expect(result).toMatchObject({
      kind: 'projection',
      contextId: 'test-002',
      value: {
        requiredCreditedRevenue: { numerator: '1000', denominator: '1' },
      },
    });
  });

  it('deve calcular B=390 com A=330, encargos=0 e alvo=60', () => {
    const input: LinearRevenueThresholdInput = {
      kind: 'projection',
      contextId: 'test-003',
      period: 'month',
      fixedCosts: exact(100, 1),
      usageCosts: exact(200, 1),
      extraordinaryCosts: exact(30, 1),
      fixedTaxes: exact(0, 1),
      titheRate: exact(0, 1),
      revenueTaxRate: exact(0, 1),
      targetProfit: exact(60, 1),
      model: { kind: 'fixed-usage-linear', reason: 'sem-encargos' },
    };
    const result = calculateConditionalLinearRevenueThreshold(input, limits);
    expect(result).toMatchObject({
      kind: 'projection',
      contextId: 'test-003',
      value: {
        requiredCreditedRevenue: { numerator: '390', denominator: '1' },
      },
    });
  });

  it('deve calcular B=200 para A=80, alvo=100, q=1/10, tau=0', () => {
    const input: LinearRevenueThresholdInput = {
      kind: 'projection',
      contextId: 'test-004',
      period: 'month',
      fixedCosts: exact(80, 1),
      usageCosts: exact(0, 1),
      extraordinaryCosts: exact(0, 1),
      fixedTaxes: exact(0, 1),
      titheRate: exact(1, 10),
      revenueTaxRate: exact(0, 1),
      targetProfit: exact(100, 1),
      model: { kind: 'fixed-usage-linear', reason: 'base-200' },
    };
    const result = calculateConditionalLinearRevenueThreshold(input, limits);
    expect(result).toMatchObject({
      kind: 'projection',
      contextId: 'test-004',
      value: {
        requiredCreditedRevenue: { numerator: '200', denominator: '1' },
      },
    });
  });

  it('deve calcular B=3600/17 para A=80, alvo=100, q=1/10, tau=1/20', () => {
    const input: LinearRevenueThresholdInput = {
      kind: 'projection',
      contextId: 'test-005',
      period: 'month',
      fixedCosts: exact(80, 1),
      usageCosts: exact(0, 1),
      extraordinaryCosts: exact(0, 1),
      fixedTaxes: exact(0, 1),
      titheRate: exact(1, 10),
      revenueTaxRate: exact(1, 20),
      targetProfit: exact(100, 1),
      model: { kind: 'fixed-usage-linear', reason: 'base-3600/17' },
    };
    const result = calculateConditionalLinearRevenueThreshold(input, limits);
    expect(result).toMatchObject({
      kind: 'projection',
      contextId: 'test-005',
      value: {
        requiredCreditedRevenue: { numerator: '3600', denominator: '17' },
      },
    });
  });

  it('deve bloquear G=0 com A=alvo=0', () => {
    const input: LinearRevenueThresholdInput = {
      kind: 'projection',
      contextId: 'test-006',
      period: 'month',
      fixedCosts: exact(0, 1),
      usageCosts: exact(0, 1),
      extraordinaryCosts: exact(0, 1),
      fixedTaxes: exact(0, 1),
      titheRate: exact(1, 1),
      revenueTaxRate: exact(0, 1),
      targetProfit: exact(0, 1),
      model: { kind: 'fixed-usage-linear', reason: 'G-zero' },
    };
    const result = calculateConditionalLinearRevenueThreshold(input, limits);
    expect(result).toMatchObject({
      code: 'non-positive-revenue-factor',
    });
  });

  it('deve bloquear G negativo com alvo positivo', () => {
    const input: LinearRevenueThresholdInput = {
      kind: 'projection',
      contextId: 'test-007',
      period: 'month',
      fixedCosts: exact(0, 1),
      usageCosts: exact(0, 1),
      extraordinaryCosts: exact(0, 1),
      fixedTaxes: exact(0, 1),
      titheRate: exact(6, 10),
      revenueTaxRate: exact(5, 10),
      targetProfit: exact(100, 1),
      model: { kind: 'fixed-usage-linear', reason: 'G-negativo' },
    };
    const result = calculateConditionalLinearRevenueThreshold(input, limits);
    expect(result).toMatchObject({
      code: 'non-positive-revenue-factor',
    });
  });

  it('deve bloquear alvo negativo', () => {
    const input: LinearRevenueThresholdInput = {
      kind: 'projection',
      contextId: 'test-008',
      period: 'month',
      fixedCosts: exact(100, 1),
      usageCosts: exact(200, 1),
      extraordinaryCosts: exact(30, 1),
      fixedTaxes: exact(10, 1),
      titheRate: exact(1, 10),
      revenueTaxRate: exact(1, 20),
      targetProfit: exact(-10, 1),
      model: { kind: 'fixed-usage-linear', reason: 'alvo-negativo' },
    };
    const result = calculateConditionalLinearRevenueThreshold(input, limits);
    expect(result).toMatchObject({
      code: 'invalid-target',
    });
  });
});

// Controles adicionais derivados de RCF§8.2 e contratos de estados/exatidão, não da função sob teste.
const thresholdBudget:ExactLimits={maxInputLength:256,maxDigits:64};
function thresholdRational(numerator:string,denominator='1'){return {numerator,denominator};}
function thresholdFixture():LinearRevenueThresholdInput{return {kind:'projection',contextId:'fixture-limiar',period:'month',fixedCosts:thresholdRational('100'),usageCosts:thresholdRational('200'),extraordinaryCosts:thresholdRational('30'),fixedTaxes:thresholdRational('10'),titheRate:thresholdRational('0'),revenueTaxRate:thresholdRational('0'),targetProfit:thresholdRational('60'),model:{kind:'fixed-usage-linear',reason:'Fixture matemática sintética; custos e uso constantes declarados'}};}
function thresholdFrozen(value:unknown):void {if(value!==null&&typeof value==='object'){expect(Object.isFrozen(value)).toBe(true);for(const child of Object.values(value))thresholdFrozen(child);}}
describe('Contrato condicional, diagnósticos e fronteiras do limiar',()=>{
  it('A340 e alvo60 sem encargos proporcionais exigem400, com lucro60 no cálculo direto',()=>{
    const input=thresholdFixture(),result=calculateConditionalLinearRevenueThreshold(input,thresholdBudget);
    expect(result).toMatchObject({status:'conditional',kind:'projection',financialAssessment:'not-evaluated',costCoverage:'not-evaluated',taxAssessment:'not-evaluated',value:{operatingCost:thresholdRational('340'),requiredCreditedRevenue:thresholdRational('400'),targetProfit:thresholdRational('60'),remainingRevenueFactor:thresholdRational('1')}});
    if(result.status!=='conditional')throw Error('Esperado limiar condicional');
    expect(calculateFinancialProjection({...input,creditedRevenue:result.value.requiredCreditedRevenue},thresholdBudget)).toMatchObject({status:'ready',value:{netProfit:thresholdRational('60')}});
  });
  it('modelo, alvo e custos ausentes ou inválidos preservam falhas reais',()=>{
    for(const input of [null,{...thresholdFixture(),model:undefined},{...thresholdFixture(),model:{kind:'outro',reason:'Declarado'}},{...thresholdFixture(),model:{kind:'fixed-usage-linear',reason:' '}},{...thresholdFixture(),model:{kind:'fixed-usage-linear',reason:12}}]){
      const result=calculateConditionalLinearRevenueThreshold(input as unknown as LinearRevenueThresholdInput,thresholdBudget);
      expect(result).toMatchObject({status:'unavailable',code:'unsupported-model',projection:null,calculation:null});thresholdFrozen(result);
    }
    expect(calculateConditionalLinearRevenueThreshold({...thresholdFixture(),targetProfit:thresholdRational('-1')},thresholdBudget)).toMatchObject({status:'unavailable',code:'invalid-target'});
    expect(calculateConditionalLinearRevenueThreshold({...thresholdFixture(),targetProfit:thresholdRational('1','0')},thresholdBudget)).toMatchObject({status:'unavailable',code:'calculation-unavailable',calculation:{status:'unavailable',code:'invalid-rational'}});
    expect(calculateConditionalLinearRevenueThreshold({...thresholdFixture(),fixedCosts:thresholdRational('-1')},thresholdBudget)).toMatchObject({status:'unavailable',code:'projection-unavailable',projection:{status:'unavailable',code:'invalid-input',field:'fixedCosts'}});
    expect(calculateConditionalLinearRevenueThreshold({...thresholdFixture(),fixedTaxes:undefined} as unknown as LinearRevenueThresholdInput,thresholdBudget)).toMatchObject({status:'unavailable',code:'projection-unavailable',projection:{status:'unavailable',code:'calculation-unavailable',field:'fixedTaxes'}});
    expect(calculateConditionalLinearRevenueThreshold({...thresholdFixture(),kind:'actual'} as unknown as LinearRevenueThresholdInput,thresholdBudget)).toMatchObject({status:'unavailable',code:'projection-unavailable',projection:{code:'unsupported-kind'}});
  });
  it('preserva inteiros acima de2^53 e bloqueia orçamento insuficiente',()=>{
    const input={...thresholdFixture(),fixedCosts:thresholdRational('9007199254740993'),usageCosts:thresholdRational('0'),extraordinaryCosts:thresholdRational('0'),fixedTaxes:thresholdRational('0'),targetProfit:thresholdRational('1')};
    expect(calculateConditionalLinearRevenueThreshold(input,thresholdBudget)).toMatchObject({status:'conditional',value:{requiredCreditedRevenue:thresholdRational('9007199254740994')}});
    expect(calculateConditionalLinearRevenueThreshold(input,{maxInputLength:256,maxDigits:1})).toMatchObject({status:'unavailable',code:'projection-unavailable',projection:{code:'calculation-unavailable',calculation:{code:'resource-budget'}}});
    expect(calculateConditionalLinearRevenueThreshold(input,{maxInputLength:256,maxDigits:0})).toMatchObject({status:'unavailable',code:'invalid-budget'});
  });
  it('saídas são snapshots congelados e repetíveis sem alterar entradas',()=>{
    const model={kind:'fixed-usage-linear' as const,reason:' razão literal '},target=thresholdRational('2','2'),input={...thresholdFixture(),contextId:' contexto ',model,targetProfit:target},before=JSON.stringify(input);
    const result=calculateConditionalLinearRevenueThreshold(input,thresholdBudget);expect(calculateConditionalLinearRevenueThreshold(input,thresholdBudget)).toEqual(result);thresholdFrozen(result);
    expect(result).toMatchObject({status:'conditional',contextId:' contexto ',model:{reason:' razão literal '},value:{targetProfit:thresholdRational('1')}});
    expect(JSON.stringify(input)).toBe(before);expect(Object.isFrozen(input)).toBe(false);expect(Object.isFrozen(model)).toBe(false);expect(Object.isFrozen(target)).toBe(false);
    model.reason='alterada';target.numerator='999';expect(result).toMatchObject({model:{reason:' razão literal '},value:{targetProfit:thresholdRational('1')}});
  });
});
