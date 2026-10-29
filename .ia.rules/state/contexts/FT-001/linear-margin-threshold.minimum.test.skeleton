import { describe, it, expect } from 'vitest';
import { calculateConditionalLinearMarginThreshold } from './linear-margin-threshold';
import type { LinearMarginThresholdInput } from './linear-margin-threshold';

const policy = { maxInputLength: 256, maxDigits: 64 };

function r(numerator: string, denominator = '1') {
  return { numerator, denominator };
}

function baseInput(): LinearMarginThresholdInput {
  return {
    kind: 'projection',
    contextId: 'synthetic-linear-margin',
    period: 'month',
    fixedCosts: r('300'),
    usageCosts: r('40'),
    extraordinaryCosts: r('0'),
    fixedTaxes: r('0'),
    titheRate: r('1', '10'),
    revenueTaxRate: r('1', '20'),
    requiredMarginPercent: r('50'),
    model: { kind: 'fixed-usage-linear', reason: 'uso fixo declarado' }
  };
}

function root(input: LinearMarginThresholdInput) {
  const result = calculateConditionalLinearMarginThreshold(input, policy);
  if (result.status !== 'conditional') {
    throw new Error(result.reason);
  }
  expect(result.kind).toBe('projection');
  expect(result.contextId).toBe(input.contextId);
  expect(result.period).toBe(input.period);
  expect(result.model).toStrictEqual(input.model);
  expect(result.financialAssessment).toBe('not-evaluated');
  expect(result.costCoverage).toBe('not-evaluated');
  expect(result.taxAssessment).toBe('not-evaluated');
  expect(result.revenueDomain).toBe('strictly-positive');
  return result;
}

describe('linear-margin-threshold', () => {
  it('mínimo positivo do modelo declarado', () => {
    const result = root(baseInput());
    expect(result.value).toStrictEqual({
      operatingCost: { numerator: '340', denominator: '1' },
      requiredMarginPercent: { numerator: '50', denominator: '1' },
      requiredMarginRatio: { numerator: '1', denominator: '2' },
      remainingRevenueFactor: { numerator: '17', denominator: '20' },
      marginRevenueFactor: { numerator: '7', denominator: '20' },
      solution: {
          case: 'minimum',
          minimumCreditedRevenue: { numerator: '6800', denominator: '7' },
          infimumCreditedRevenue: { numerator: '6800', denominator: '7' },
          minimumAttained: true
      }
    });
  });
});
