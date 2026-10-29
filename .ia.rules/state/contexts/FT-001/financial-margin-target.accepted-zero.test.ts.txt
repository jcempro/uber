import { describe, it, expect } from 'vitest';
import { calculateFinancialMarginTarget } from './financial-margin-target';
import type { FinancialMarginTargetInput, FinancialMarginComparison } from './financial-margin-target';
const policy = { maxInputLength: 256, maxDigits: 64 };
function r(numerator: string, denominator = '1') { return {numerator,denominator}; }
function baseInput(): FinancialMarginTargetInput {
  return {kind:'projection',contextId:'synthetic-margin',period:'month',creditedRevenue:r('1000'),fixedCosts:r('300'),usageCosts:r('40'),extraordinaryCosts:r('0'),fixedTaxes:r('0'),titheRate:r('1','10'),revenueTaxRate:r('1','20'),requiredMarginPercent:r('50')};
}
function root(input: FinancialMarginTargetInput) {
  const result = calculateFinancialMarginTarget(input,policy);
  if (result.status !== 'conditional') throw Error(result.reason);
  expect(result.kind).toBe('projection');
  expect(result.contextId).toBe(input.contextId);
  expect(result.period).toBe(input.period);
  expect(result.financialAssessment).toBe('not-evaluated');
  expect(result.costCoverage).toBe('not-evaluated');
  expect(result.taxAssessment).toBe('not-evaluated');
  expect(result.projection.status).toBe('ready');
  expect(result.projection.financialAssessment).toBe('not-evaluated');
  return result;
}
function readyAssessment(result: FinancialMarginComparison) {
  if (result.status !== 'ready') throw Error(result.reason);
  return result;
}
describe('financial-margin-target', () => {
  it('margem modelada compara percentuais normalizados', () => {
    const rows = [
      { percent: '50', ratio: r('1', '2'), slack: r('1', '100'), reaches: true },
      { percent: '52', ratio: r('13', '25'), slack: r('-1', '100'), reaches: false },
    ];
    for (const row of rows) {
      const result = root({ ...baseInput(), requiredMarginPercent: r(row.percent) });
      expect(result.projection.value.operatingCost).toEqual(r('340'));
      expect(result.projection.value.plannedTotalCost).toEqual(r('490'));
      expect(result.projection.value.netProfit).toEqual(r('510'));
      expect(result.projection.value.remainingRevenueFactor).toEqual(r('17','20'));
      expect(result.projection.value.margin).toEqual({status:'ready',value:r('51','100')});
      const assessment = readyAssessment(result.value.assessment);
      expect(result.value.requiredMarginPercent).toEqual(r(row.percent));
      expect(result.value.requiredMarginRatio).toEqual(row.ratio);
      expect(assessment.signedMarginSlack).toEqual(row.slack);
      expect(assessment.reachesModeledMargin).toBe(row.reaches);
    }
  });
  it('aceita metas0/100/101 sem limitar artificialmente o percentual', () => {
    const rows = [
      { percent: '0', ratio: r('0'), slack: r('1'), reaches: true },
      { percent: '100', ratio: r('1'), slack: r('0'), reaches: true },
      { percent: '101', ratio: r('101','100'), slack: r('-1','100'), reaches: false },
    ];
    for (const row of rows) {
      const result = root({ ...baseInput(), creditedRevenue:r('100'),fixedCosts:r('0'),usageCosts:r('0'),extraordinaryCosts:r('0'),fixedTaxes:r('0'),titheRate:r('0'),revenueTaxRate:r('0'),requiredMarginPercent:r(row.percent) });
      expect(result.projection.value.operatingCost).toEqual(r('0'));
      expect(result.projection.value.plannedTotalCost).toEqual(r('0'));
      expect(result.projection.value.netProfit).toEqual(r('100'));
      expect(result.projection.value.remainingRevenueFactor).toEqual(r('1'));
      expect(result.projection.value.margin).toEqual({status:'ready',value:r('1')});
      const assessment = readyAssessment(result.value.assessment);
      expect(result.value.requiredMarginPercent).toEqual(r(row.percent));
      expect(result.value.requiredMarginRatio).toEqual(row.ratio);
      expect(assessment.signedMarginSlack).toEqual(row.slack);
      expect(assessment.reachesModeledMargin).toBe(row.reaches);
    }
  });
  it('receita zero mantém comparação de margem indisponível', () => {
    const result = root({...baseInput(),creditedRevenue:r('0')});
    expect(result.projection.value.operatingCost).toEqual(r('340'));
    expect(result.projection.value.plannedTotalCost).toEqual(r('340'));
    expect(result.projection.value.netProfit).toEqual(r('-340'));
    expect(result.projection.value.remainingRevenueFactor).toEqual(r('17','20'));
    expect(result.value.requiredMarginPercent).toEqual(r('50'));
    expect(result.value.requiredMarginRatio).toEqual(r('1','2'));
    const assessment = result.value.assessment;
    if (assessment.status !== 'unavailable') throw Error('Margem deveria estar indisponível');
    expect(assessment.code).toBe('margin-unavailable');
    expect(assessment.margin).toBe(result.projection.value.margin);
    expect(assessment.margin.status).toBe('unavailable');
    expect(assessment.margin.code).toBe('zero-revenue');
    expect(assessment.margin.calculation).toBeNull();
    expect(assessment.reason).toBe(assessment.margin.reason);
    expect(assessment.reason.length).toBeGreaterThan(0);
    expect(assessment).not.toHaveProperty('reachesModeledMargin');
    expect(assessment).not.toHaveProperty('signedMarginSlack');
  });
});
