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
  it('fator de receita não positivo não bloqueia avaliação direta', () => {
    const rows = [
      { tax: r('0'), factor: r('0'), total: r('100'), profit: r('0'), margin: r('0'), reaches: true },
      { tax: r('1','10'), factor: r('-1','10'), total: r('110'), profit: r('-10'), margin: r('-1','10'), reaches: false },
    ];
    for (const row of rows) {
      const result = root({...baseInput(),creditedRevenue:r('100'),fixedCosts:r('0'),usageCosts:r('0'),extraordinaryCosts:r('0'),fixedTaxes:r('0'),titheRate:r('1'),revenueTaxRate:row.tax,requiredMarginPercent:r('0')});
      expect(result.projection.value.operatingCost).toEqual(r('0'));
      expect(result.projection.value.plannedTotalCost).toEqual(row.total);
      expect(result.projection.value.netProfit).toEqual(row.profit);
      expect(result.projection.value.remainingRevenueFactor).toEqual(row.factor);
      expect(result.projection.value.margin).toEqual({status:'ready',value:row.margin});
      const assessment = readyAssessment(result.value.assessment);
      expect(result.value.requiredMarginPercent).toEqual(r('0'));
      expect(result.value.requiredMarginRatio).toEqual(r('0'));
      expect(assessment.signedMarginSlack).toEqual(row.margin);
      expect(assessment.reachesModeledMargin).toBe(row.reaches);
    }
  });

it('rejeita margem negativa mantendo projeção válida', () => {
  const result = calculateFinancialMarginTarget({ ...baseInput(), requiredMarginPercent: r('-1') }, policy);
  if (result.status !== 'unavailable') throw Error('Esperado unavailable');
  expect(result.code).toBe('invalid-target');
  expect(result.reason).toContain('requiredMarginPercent');
  expect(result.reason).not.toBe('');
  expect(result.calculation).toBeNull();
  expect(result).not.toHaveProperty('value');
  const projection = result.projection;
  if (projection === null || projection.status !== 'ready') throw Error('Projeção deveria permanecer válida');
  expect(projection.value.netProfit).toEqual(r('510'));
  expect(projection.value.margin).toEqual({ status: 'ready', value: r('51', '100') });
});

it('rejeita racional de margem inválido preservando diagnóstico', () => {
  const result = calculateFinancialMarginTarget({ ...baseInput(), requiredMarginPercent: r('1', '0') }, policy);
  if (result.status !== 'unavailable') throw Error('Esperado unavailable');
  expect(result.code).toBe('invalid-target');
  const calculation = result.calculation;
  if (calculation === null) throw Error('Diagnóstico deveria existir');
  expect(calculation.status).toBe('unavailable');
  expect(calculation.code).toBe('invalid-rational');
  expect(result.reason).toBe(calculation.reason);
  expect(result.reason).not.toBe('');
  const projection = result.projection;
  if (projection === null || projection.status !== 'ready') throw Error('Projeção deveria permanecer válida');
  expect(projection.value.netProfit).toEqual(r('510'));
  expect(projection.value.margin).toEqual({ status: 'ready', value: r('51', '100') });
  expect(result).not.toHaveProperty('value');
});

it('orçamento técnico inválido precede avaliação financeira', () => {
  const result = calculateFinancialMarginTarget(
    {
      ...baseInput(),
      creditedRevenue: r('-1'),
      requiredMarginPercent: r('-1')
    },
    { ...policy, maxDigits: 0 }
  );

  if (result.status !== 'unavailable') {
    throw new Error('Esperado status unavailable');
  }

  expect(result.code).toBe('invalid-budget');
  expect(result.reason).not.toBe('');
  expect(result.projection).toBeNull();
  expect(result.calculation).toBeNull();
  expect(result).not.toHaveProperty('value');
});

it('projeção inválida preserva diagnóstico e impede comparação de margem', () => {
  const result = calculateFinancialMarginTarget(
    {
      ...baseInput(),
      creditedRevenue: r('-1')
    },
    policy
  );

  if (result.status !== 'unavailable') {
    throw new Error('Esperado status unavailable');
  }

  expect(result.code).toBe('projection-unavailable');
  expect(result.reason).not.toBe('');
  expect(result.projection).not.toBeNull();
  expect(result.calculation).toBeNull();

  expect(result).not.toHaveProperty('value');
  const projection = result.projection;
  if (projection === null || projection.status !== 'unavailable') {
    throw new Error('Esperada projeção indisponível');
  }

  expect(projection.code).toBe('invalid-input');
  expect(projection.field).toBe('creditedRevenue');
  expect(projection.calculation).toBeNull();
  expect(projection.reason).toBe(result.reason);
  expect(projection).not.toHaveProperty('value');
});

it('meta ausente não se transforma em zero', () => {
  const input = baseInput();
  expect(Reflect.deleteProperty(input, 'requiredMarginPercent')).toBe(true);
  expect(input).not.toHaveProperty('requiredMarginPercent');
  const result = calculateFinancialMarginTarget(input, policy);
  if (result.status !== 'unavailable') throw Error('Esperado unavailable');
  expect(result.code).toBe('invalid-target');
  const calculation = result.calculation;
  if (calculation === null) throw Error('Diagnóstico deveria existir');
  expect(calculation.status).toBe('unavailable');
  expect(calculation.code).toBe('invalid-rational');
  expect(result.reason).toBe(calculation.reason);
  expect(result.reason).not.toBe('');
  const projection = result.projection;
  if (projection === null || projection.status !== 'ready') throw Error('Projeção deveria permanecer válida');
  expect(projection.value.netProfit).toEqual(r('510'));
  expect(projection.value.margin).toEqual({ status: 'ready', value: r('51', '100') });
  expect(result).not.toHaveProperty('value');
});

it('limite técnico da meta não se transforma em meta inválida', () => {
  const result = calculateFinancialMarginTarget({ ...baseInput(), requiredMarginPercent: r('1'.repeat(65)) }, policy);
  if (result.status !== 'unavailable') throw Error('Esperado unavailable');
  expect(result.code).toBe('calculation-unavailable');
  const calculation = result.calculation;
  if (calculation === null) throw Error('Diagnóstico deveria existir');
  expect(calculation.status).toBe('unavailable');
  expect(calculation.code).toBe('resource-budget');
  expect(result.reason).toBe(calculation.reason);
  expect(result.reason).not.toBe('');
  const projection = result.projection;
  if (projection === null || projection.status !== 'ready') throw Error('Projeção deveria permanecer válida');
  expect(projection.value.netProfit).toEqual(r('510'));
  expect(projection.value.margin).toEqual({ status: 'ready', value: r('51', '100') });
  expect(result).not.toHaveProperty('value');
});

it('saída pronta é congelada e isolada de entradas mutáveis', () => {
  const target = r('100', '2');
  const cost = r('300');
  const input = { ...baseInput(), requiredMarginPercent: target, fixedCosts: cost };
  const before = JSON.stringify(input);
  const result = root(input);
  const assessment = readyAssessment(result.value.assessment);
  const margin = result.projection.value.margin;
  if (margin.status !== 'ready') throw Error('Esperada margem pronta');
  const snapshot = JSON.stringify(result);

  expect(Object.isFrozen(input)).toBe(false);
  expect(Object.isFrozen(target)).toBe(false);
  expect(Object.isFrozen(cost)).toBe(false);
  expect(JSON.stringify(input)).toBe(before);

  const nodes = [
    result,
    result.value,
    result.value.requiredMarginPercent,
    result.value.requiredMarginRatio,
    assessment,
    assessment.signedMarginSlack,
    result.projection,
    result.projection.value,
    margin,
    margin.value
  ];
  for (const node of nodes) {
    expect(Object.isFrozen(node)).toBe(true);
  }

  expect(result.value.requiredMarginPercent).toEqual(r('50'));
  expect(result.value.requiredMarginRatio).toEqual(r('1', '2'));
  expect(assessment.signedMarginSlack).toEqual(r('1', '100'));
  expect(assessment.reachesModeledMargin).toBe(true);
  expect(result.projection.value.netProfit).toEqual(r('510'));
  expect(margin.value).toEqual(r('51', '100'));
  expect(result.value.requiredMarginPercent).not.toBe(target);

  target.numerator = '0';
  target.denominator = '1';
  cost.numerator = '999';
  input.contextId = 'mutated';

  expect(JSON.stringify(result)).toBe(snapshot);
});

it('margem indefinida mantém saída congelada e isolada', () => {
  const target = r('100', '2');
  const input = { ...baseInput(), creditedRevenue: r('0'), requiredMarginPercent: target };
  const before = JSON.stringify(input);
  const result = root(input);
  const assessment = result.value.assessment;
  if (assessment.status !== 'unavailable') throw Error('Margem deveria estar indisponível');
  const snapshot = JSON.stringify(result);
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.value)).toBe(true);
  expect(Object.isFrozen(result.value.requiredMarginPercent)).toBe(true);
  expect(Object.isFrozen(result.value.requiredMarginRatio)).toBe(true);
  expect(Object.isFrozen(assessment)).toBe(true);
  expect(Object.isFrozen(assessment.margin)).toBe(true);
  expect(Object.isFrozen(result.projection)).toBe(true);
  expect(Object.isFrozen(result.projection.value)).toBe(true);
  expect(Object.isFrozen(input)).toBe(false);
  expect(Object.isFrozen(target)).toBe(false);
  expect(JSON.stringify(input)).toBe(before);
  expect(assessment.code).toBe('margin-unavailable');
  expect(assessment.margin.code).toBe('zero-revenue');
  expect(assessment.margin).toBe(result.projection.value.margin);
  expect(result.value.requiredMarginPercent).toEqual(r('50'));
  expect(result.value.requiredMarginRatio).toEqual(r('1', '2'));
  target.numerator = '0';
  input.contextId = 'mutated';
  expect(JSON.stringify(result)).toBe(snapshot);
});

it('falha técnica mantém raiz e diagnóstico congelados', () => {
  const target = r('1'.repeat(65));
  const input = { ...baseInput(), requiredMarginPercent: target };
  const before = JSON.stringify(input);
  const result = calculateFinancialMarginTarget(input, policy);
  if (result.status !== 'unavailable') throw Error('Status deveria ser unavailable');
  expect(result.code).toBe('calculation-unavailable');
  const calculation = result.calculation;
  if (calculation === null) throw Error('Calculation não deveria ser null');
  expect(calculation.code).toBe('resource-budget');
  expect(result.reason).toBe(calculation.reason);
  expect(result.reason.length).toBeGreaterThan(0);
  const projection = result.projection;
  if (projection === null || projection.status !== 'ready') throw Error('Projection deveria ser ready');
  const snapshot = JSON.stringify(result);
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(calculation)).toBe(true);
  expect(Object.isFrozen(projection)).toBe(true);
  expect(Object.isFrozen(projection.value)).toBe(true);
  expect(Object.isFrozen(input)).toBe(false);
  expect(Object.isFrozen(target)).toBe(false);
  expect(JSON.stringify(input)).toBe(before);
  expect(result).not.toHaveProperty('value');
  target.numerator = '0';
  input.contextId = 'mutated';
  expect(JSON.stringify(result)).toBe(snapshot);
});
});
