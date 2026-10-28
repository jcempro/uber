/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§8.3, FT-003.40.2.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { describe, it, expect } from 'vitest';
import type { ExactRational } from './exact';
import type { BudgetPeriod } from './model';
import type { FinancialTargetGapInput } from './financial-target-gap';
import { calculateFinancialTargetGap } from './financial-target-gap';
import type { ExactLimits } from './exact-budget';

function makeRational(numerator: string, denominator: string): ExactRational {
  return { numerator, denominator };
}

function makeLimits(): ExactLimits {
  return { maxInputLength: 1000, maxDigits: 100 };
}

function makeInput(overrides: Partial<FinancialTargetGapInput>): FinancialTargetGapInput {
  return {
    kind: 'projection' as const,
    contextId: 'test',
    period: 'month' as BudgetPeriod,
    creditedRevenue: makeRational('1000', '1'),
    fixedCosts: makeRational('100', '1'),
    usageCosts: makeRational('200', '1'),
    extraordinaryCosts: makeRational('30', '1'),
    fixedTaxes: makeRational('10', '1'),
    titheRate: makeRational('1', '10'),
    revenueTaxRate: makeRational('1', '20'),
    targetProfit: makeRational('600', '1'),
    ...overrides,
  };
}

describe('calculateFinancialTargetGap', () => {
  it('B1000,F100,V200,E30,Tfix10,q1/10,tau1/20,alvo600 → LLF510,folga-90,déficitMeta90,cobertura0,true/false', () => {
    const input = makeInput({
      creditedRevenue: makeRational('1000', '1'),
      fixedCosts: makeRational('100', '1'),
      usageCosts: makeRational('200', '1'),
      extraordinaryCosts: makeRational('30', '1'),
      fixedTaxes: makeRational('10', '1'),
      titheRate: makeRational('1', '10'),
      revenueTaxRate: makeRational('1', '20'),
      targetProfit: makeRational('600', '1'),
    });
    const result = calculateFinancialTargetGap(input, makeLimits());
    expect(result.status).toBe('conditional');
    if (result.status !== 'conditional') {
      throw new Error('Expected conditional');
    }
    expect(result.value.signedTargetSlack.numerator).toBe('-90');
    expect(result.value.signedTargetSlack.denominator).toBe('1');
    expect(result.value.profitShortfall.numerator).toBe('90');
    expect(result.value.profitShortfall.denominator).toBe('1');
    expect(result.value.modeledCoverageShortfall.numerator).toBe('0');
    expect(result.value.modeledCoverageShortfall.denominator).toBe('1');
    expect(result.value.coversModeledCosts).toBe(true);
    expect(result.value.reachesModeledTarget).toBe(false);
  
    expect(result).toMatchObject({costCoverage:'not-evaluated',taxAssessment:'not-evaluated',projection:{value:{netProfit:{numerator:'510',denominator:'1'},margin:{status:'ready',value:{numerator:'51',denominator:'100'}}}}});
  });

  it('alvo510 → igualdade/0/atinge; alvo400 → folga110/excedente não oculto', () => {
    const input1 = makeInput({ targetProfit: makeRational('510', '1') });
    const result1 = calculateFinancialTargetGap(input1, makeLimits());
    expect(result1.status).toBe('conditional');
    if (result1.status !== 'conditional') {
      throw new Error('Expected conditional');
    }
    expect(result1.value.signedTargetSlack.numerator).toBe('0');
    expect(result1.value.signedTargetSlack.denominator).toBe('1');
    expect(result1.value.reachesModeledTarget).toBe(true);

    const input2 = makeInput({ targetProfit: makeRational('400', '1') });
    const result2 = calculateFinancialTargetGap(input2, makeLimits());
    expect(result2.status).toBe('conditional');
    if (result2.status !== 'conditional') {
      throw new Error('Expected conditional');
    }
    expect(result2.value.signedTargetSlack.numerator).toBe('110');
    expect(result2.value.signedTargetSlack.denominator).toBe('1');
    expect(result2.value.reachesModeledTarget).toBe(true);
  });

  it('B100,F80,V40,E/Tfix0,q1/10,tau0,alvo100 → LLF-30,folga-130,déficitMeta130,cobertura30,false/false', () => {
    const input = makeInput({
      creditedRevenue: makeRational('100', '1'),
      fixedCosts: makeRational('80', '1'),
      usageCosts: makeRational('40', '1'),
      extraordinaryCosts: makeRational('0', '1'),
      fixedTaxes: makeRational('0', '1'),
      titheRate: makeRational('1', '10'),
      revenueTaxRate: makeRational('0', '1'),
      targetProfit: makeRational('100', '1'),
    });
    const result = calculateFinancialTargetGap(input, makeLimits());
    expect(result.status).toBe('conditional');
    if (result.status !== 'conditional') {
      throw new Error('Expected conditional');
    }
    expect(result.value.signedTargetSlack.numerator).toBe('-130');
    expect(result.value.signedTargetSlack.denominator).toBe('1');
    expect(result.value.profitShortfall.numerator).toBe('130');
    expect(result.value.profitShortfall.denominator).toBe('1');
    expect(result.value.modeledCoverageShortfall.numerator).toBe('30');
    expect(result.value.modeledCoverageShortfall.denominator).toBe('1');
    expect(result.value.coversModeledCosts).toBe(false);
    expect(result.value.reachesModeledTarget).toBe(false);
  });

  it('tripsPerHour1/10/100 não muda resultado', () => {
    const input1 = makeInput({
      creditedRevenue: makeRational('100', '1'),
      fixedCosts: makeRational('80', '1'),
      usageCosts: makeRational('40', '1'),
      extraordinaryCosts: makeRational('0', '1'),
      fixedTaxes: makeRational('0', '1'),
      titheRate: makeRational('1', '10'),
      revenueTaxRate: makeRational('0', '1'),
      targetProfit: makeRational('100', '1'),
    });

    for(const tripsPerHour of [1,10,100]) {
      const varied={...input1,tripsPerHour};
      expect(calculateFinancialTargetGap(varied,makeLimits())).toMatchObject({status:'conditional',costCoverage:'not-evaluated',projection:{value:{netProfit:{numerator:'-30',denominator:'1'}}},value:{signedTargetSlack:{numerator:'-130',denominator:'1'},profitShortfall:{numerator:'130',denominator:'1'},modeledCoverageShortfall:{numerator:'30',denominator:'1'},coversModeledCosts:false,reachesModeledTarget:false}});
    }
  });

  it('B0/F80/demaiscustos0/alvo0 → LLF-80/ambosdéficits80/margemzero-revenue', () => {
    const input = makeInput({
      creditedRevenue: makeRational('0', '1'),
      fixedCosts: makeRational('80', '1'),
      usageCosts: makeRational('0', '1'),
      extraordinaryCosts: makeRational('0', '1'),
      fixedTaxes: makeRational('0', '1'),
      titheRate: makeRational('0', '1'),
      revenueTaxRate: makeRational('0', '1'),
      targetProfit: makeRational('0', '1'),
    });
    const result = calculateFinancialTargetGap(input, makeLimits());
    expect(result.status).toBe('conditional');
    if (result.status !== 'conditional') {
      throw new Error('Expected conditional');
    }
    expect(result.value.signedTargetSlack.numerator).toBe('-80');
    expect(result.value.signedTargetSlack.denominator).toBe('1');
    expect(result.value.profitShortfall.numerator).toBe('80');
    expect(result.value.profitShortfall.denominator).toBe('1');
    expect(result.value.modeledCoverageShortfall.numerator).toBe('80');
    expect(result.value.modeledCoverageShortfall.denominator).toBe('1');
    expect(result.value.coversModeledCosts).toBe(false);
    expect(result.value.reachesModeledTarget).toBe(false);
  
    expect(result.projection.value.margin).toMatchObject({status:'unavailable',code:'zero-revenue'});
  });

  it('B0/custos0/alvo0 → booleansmodelo true, costCoverage not-evaluated', () => {
    const input = makeInput({
      creditedRevenue: makeRational('0', '1'),
      fixedCosts: makeRational('0', '1'),
      usageCosts: makeRational('0', '1'),
      extraordinaryCosts: makeRational('0', '1'),
      fixedTaxes: makeRational('0', '1'),
      titheRate: makeRational('0', '1'),
      revenueTaxRate: makeRational('0', '1'),
      targetProfit: makeRational('0', '1'),
    });
    const result = calculateFinancialTargetGap(input, makeLimits());
    expect(result.status).toBe('conditional');
    if (result.status !== 'conditional') {
      throw new Error('Expected conditional');
    }
    expect(result.value.coversModeledCosts).toBe(true);
    expect(result.value.reachesModeledTarget).toBe(true);
    expect(result.costCoverage).toBe('not-evaluated');
  });

  it('B100/A20/q1/10,tau9/10 → G0/LLF-20 e tau1 → Gnegativo/LLF-30, desvios condicionais continuam computáveis', () => {
    const input1 = makeInput({
      creditedRevenue: makeRational('100', '1'),
      fixedCosts: makeRational('20', '1'),
      usageCosts: makeRational('0', '1'),
      extraordinaryCosts: makeRational('0', '1'),
      fixedTaxes: makeRational('0', '1'),
      titheRate: makeRational('1', '10'),
      revenueTaxRate: makeRational('9', '10'),
      targetProfit: makeRational('0', '1'),
    });
    const result1 = calculateFinancialTargetGap(input1, makeLimits());
    expect(result1.status).toBe('conditional');
    if (result1.status !== 'conditional') {
      throw new Error('Expected conditional');
    }
    expect(result1.value.signedTargetSlack.numerator).toBe('-20');
    expect(result1.value.signedTargetSlack.denominator).toBe('1');

    const input2 = makeInput({
      creditedRevenue: makeRational('100', '1'),
      fixedCosts: makeRational('20', '1'),
      usageCosts: makeRational('0', '1'),
      extraordinaryCosts: makeRational('0', '1'),
      fixedTaxes: makeRational('0', '1'),
      titheRate: makeRational('1', '10'),
      revenueTaxRate: makeRational('1', '1'),
      targetProfit: makeRational('0', '1'),
    });
    const result2 = calculateFinancialTargetGap(input2, makeLimits());
    expect(result2.status).toBe('conditional');
    if (result2.status !== 'conditional') {
      throw new Error('Expected conditional');
    }
    expect(result2.value.signedTargetSlack.numerator).toBe('-30');
    expect(result2.value.signedTargetSlack.denominator).toBe('1');
  });

  it('alvo negativo/malformado, custo ausente e orçamento inválido preservam diagnósticos sem zero', () => {
    const inputInvalidTarget = makeInput({ targetProfit: makeRational('-1', '1') });
    const resultInvalidTarget = calculateFinancialTargetGap(inputInvalidTarget, makeLimits());
    expect(resultInvalidTarget.status).toBe('unavailable');
    expect(resultInvalidTarget).toMatchObject({status:'unavailable',code:'invalid-target'});

    const inputInvalidBudget = makeInput({ targetProfit: makeRational('1', '1') });
    const resultInvalidBudget = calculateFinancialTargetGap(inputInvalidBudget, { maxInputLength: 0, maxDigits: 0 });
    expect(resultInvalidBudget.status).toBe('unavailable');
    expect(resultInvalidBudget).toMatchObject({status:'unavailable',code:'invalid-budget'});
  
    expect(calculateFinancialTargetGap(makeInput({targetProfit:makeRational('1','0')}),makeLimits())).toMatchObject({status:'unavailable',code:'calculation-unavailable',calculation:{code:'invalid-rational'}});
    expect(calculateFinancialTargetGap({...makeInput({}),targetProfit:undefined} as unknown as FinancialTargetGapInput,makeLimits())).toMatchObject({status:'unavailable',code:'calculation-unavailable',calculation:{code:'invalid-rational'}});
    expect(calculateFinancialTargetGap({...makeInput({}),fixedTaxes:undefined} as unknown as FinancialTargetGapInput,makeLimits())).toMatchObject({status:'unavailable',code:'projection-unavailable',projection:{code:'calculation-unavailable',field:'fixedTaxes'}});
    expect(calculateFinancialTargetGap(makeInput({targetProfit:makeRational('9'.repeat(101),'1')}),makeLimits())).toMatchObject({status:'unavailable',code:'calculation-unavailable',calculation:{code:'resource-budget'}});
  });

  it('B9007199254740993/F9007199254740992/outroscustos-taxas0/alvo2 → LLF1/folga-1/déficit1 exatos e recursos insuficientes bloqueiam', () => {
    const input = makeInput({
      creditedRevenue: makeRational('9007199254740993', '1'),
      fixedCosts: makeRational('9007199254740992', '1'),
      usageCosts: makeRational('0', '1'),
      extraordinaryCosts: makeRational('0', '1'),
      fixedTaxes: makeRational('0', '1'),
      titheRate: makeRational('0', '1'),
      revenueTaxRate: makeRational('0', '1'),
      targetProfit: makeRational('2', '1'),
    });
    const result = calculateFinancialTargetGap(input, makeLimits());
    expect(result.status).toBe('conditional');
    if (result.status !== 'conditional') {
      throw new Error('Expected conditional');
    }
    expect(result.value.signedTargetSlack.numerator).toBe('-1');
    expect(result.value.signedTargetSlack.denominator).toBe('1');
    expect(result.value.profitShortfall.numerator).toBe('1');
    expect(result.value.profitShortfall.denominator).toBe('1');
    expect(result.value.modeledCoverageShortfall.numerator).toBe('0');
    expect(result.value.modeledCoverageShortfall.denominator).toBe('1');
  
    expect(calculateFinancialTargetGap(input,{maxInputLength:1000,maxDigits:1})).toMatchObject({status:'unavailable',code:'projection-unavailable',projection:{code:'calculation-unavailable',calculation:{code:'resource-budget'}}});
  });

  it('freeze/snapshots/repetição/entradaintacta/IDsbrutos/flagscondicionais', () => {
    const mutableTarget={numerator:'1020',denominator:'2'};
    const input = makeInput({contextId:' contexto ',targetProfit:mutableTarget});
    const before=JSON.stringify(input);
    const result1 = calculateFinancialTargetGap(input, makeLimits());
    const result2 = calculateFinancialTargetGap(input, makeLimits());
    expect(result1.status).toBe('conditional');
    expect(result2.status).toBe('conditional');
    if (result1.status !== 'conditional' || result2.status !== 'conditional') {
      throw new Error('Expected conditional');
    }
    expect(result1.value.signedTargetSlack.numerator).toBe(result2.value.signedTargetSlack.numerator);
    expect(result1.value.signedTargetSlack.denominator).toBe(result2.value.signedTargetSlack.denominator);
    expect(result1.value.targetProfit.numerator).toBe(result2.value.targetProfit.numerator);
    expect(result1.value.targetProfit.denominator).toBe(result2.value.targetProfit.denominator);
    expect(result1.projection.contextId).toBe(result2.projection.contextId);
    expect(result1.projection.period).toBe(result2.projection.period);
  
    function frozen(value:unknown):void {if(value!==null&&typeof value==='object'){expect(Object.isFrozen(value)).toBe(true);for(const child of Object.values(value))frozen(child);}}
    frozen(result1);expect(JSON.stringify(input)).toBe(before);expect(Object.isFrozen(input)).toBe(false);expect(Object.isFrozen(mutableTarget)).toBe(false);
    expect(result1).toMatchObject({contextId:' contexto ',costCoverage:'not-evaluated',taxAssessment:'not-evaluated',value:{targetProfit:{numerator:'510',denominator:'1'}}});
    mutableTarget.numerator='0';expect(result1.value.targetProfit).toEqual({numerator:'510',denominator:'1'});
  });
});
