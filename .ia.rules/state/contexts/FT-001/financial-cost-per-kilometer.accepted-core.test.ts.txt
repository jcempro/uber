import { describe, it, expect } from 'vitest';
import { calculateFinancialCostPerKilometer } from './financial-cost-per-kilometer';
import type { FinancialCostPerKilometerInput, FinancialCostPerKilometerMetric } from './financial-cost-per-kilometer';
const policy = { maxInputLength: 256, maxDigits: 64 };
function r(numerator: string, denominator = '1') { return {numerator,denominator}; }
function baseInput(): FinancialCostPerKilometerInput {
  return {kind:'projection',contextId:'synthetic-cost-km',period:'month',creditedRevenue:r('1000'),fixedCosts:r('300'),usageCosts:r('40'),extraordinaryCosts:r('0'),fixedTaxes:r('0'),titheRate:r('1','10'),revenueTaxRate:r('1','20'),totalDistance:r('100')};
}
function root(input: FinancialCostPerKilometerInput) {
  const result = calculateFinancialCostPerKilometer(input,policy);
  if (result.status !== 'conditional') throw Error(result.reason);
  expect(result.kind).toBe('projection');
  expect(result.contextId).toBe(input.contextId);
  expect(result.period).toBe(input.period);
  expect(result.financialAssessment).toBe('not-evaluated');
  expect(result.costCoverage).toBe('not-evaluated');
  expect(result.taxAssessment).toBe('not-evaluated');
  expect(result.costBasis).toBe('planned-total-cost');
  expect(result.distanceBasis).toBe('total-distance');
  expect(result.projection.status).toBe('ready');
  expect(result.projection.financialAssessment).toBe('not-evaluated');
  return result;
}
function readyCost(result: FinancialCostPerKilometerMetric) {
  if (result.status !== 'ready') throw Error(result.reason);
  return result;
}
describe('financial-cost-per-kilometer',()=>{
  it('inclui fixos,uso,extraordinários,encargos e alíquotas sobre receita creditada',()=>{
    // RCF8.2 literal: Coper=F+V+E+Tfix; LLF=B-qB-tauB-Coper.
    // Fixture: 100+200+30+10=340;1000-100-50-340=510;margem51%.
    const result=root({...baseInput(),creditedRevenue:r('1000'),fixedCosts:r('100'),usageCosts:r('200'),extraordinaryCosts:r('30'),fixedTaxes:r('10'),revenueTaxRate:r('1','20')});
    expect(result.projection).toMatchObject({status:'ready',kind:'projection',contextId:'synthetic-cost-km',period:'month',financialAssessment:'not-evaluated',value:{operatingCost:r('340'),tithe:r('100'),receiptTax:r('50'),plannedTotalCost:r('490'),netProfit:r('510'),remainingRevenueFactor:r('17','20'),margin:{status:'ready',value:r('51','100')}}});
    expect(result.value.totalDistance).toEqual(r('100'));
    expect(readyCost(result.value.costPerKilometer)).toStrictEqual({status:'ready',value:r('49','10')});
  });

  it('mantém fixos com receita zero e não inventa margem por divisão0',()=>{
    const result=root({...baseInput(),creditedRevenue:r('0')});
    expect(result.projection).toMatchObject({status:'ready',value:{operatingCost:r('340'),tithe:r('0'),receiptTax:r('0'),netProfit:r('-340'),plannedTotalCost:r('340'),margin:{status:'unavailable',code:'zero-revenue'}}});
    expect(result.value.totalDistance).toEqual(r('100'));
    expect(readyCost(result.value.costPerKilometer)).toStrictEqual({status:'ready',value:r('17','5')});
  });

  it('inclui extraordinários e tributos fixos no custo por km',()=>{
    // RCF8.2 literal: Coper=F+V+E+Tfix; LLF=B-qB-tauB-Coper.
    // Fixture: 300+40+20+10=370;1000-100-50-370=480;margem48%.
    const result=root({...baseInput(),creditedRevenue:r('1000'),fixedCosts:r('300'),usageCosts:r('40'),extraordinaryCosts:r('20'),fixedTaxes:r('10'),revenueTaxRate:r('1','20')});
    expect(result.projection).toMatchObject({status:'ready',kind:'projection',contextId:'synthetic-cost-km',period:'month',financialAssessment:'not-evaluated',value:{operatingCost:r('370'),tithe:r('100'),receiptTax:r('50'),plannedTotalCost:r('520'),netProfit:r('480'),remainingRevenueFactor:r('17','20'),margin:{status:'ready',value:r('12','25')}}});
    expect(result.value.totalDistance).toEqual(r('100'));
    expect(readyCost(result.value.costPerKilometer)).toStrictEqual({status:'ready',value:r('26','5')});
  });

  it('distância varia sem apagar ou duplicar custos fixos',()=>{
    // RCF8.2 literal: Coper=F+V+E+Tfix; LLF=B-qB-tauB-Coper.
    // Fixture: 300+40+20+10=370;1000-100-50-370=480;margem48%.
    const result=root({...baseInput(),totalDistance:r('200'),creditedRevenue:r('1000'),fixedCosts:r('300'),usageCosts:r('40'),extraordinaryCosts:r('20'),fixedTaxes:r('10'),revenueTaxRate:r('1','20')});
    expect(result.projection).toMatchObject({status:'ready',kind:'projection',contextId:'synthetic-cost-km',period:'month',financialAssessment:'not-evaluated',value:{operatingCost:r('370'),tithe:r('100'),receiptTax:r('50'),plannedTotalCost:r('520'),netProfit:r('480'),remainingRevenueFactor:r('17','20'),margin:{status:'ready',value:r('12','25')}}});
    expect(result.value.totalDistance).toEqual(r('200'));
    expect(readyCost(result.value.costPerKilometer)).toStrictEqual({status:'ready',value:r('13','5')});
  });
});
