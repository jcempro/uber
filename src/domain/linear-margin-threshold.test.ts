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

  it('it2: all-positive (2 rows)', () => {
    // row1: q=0, tau=0, L=100 → G=1, m=1, H=0
    {
      const input: LinearMarginThresholdInput = {
        ...baseInput(),
        fixedCosts: r('0'),
        usageCosts: r('0'),
        extraordinaryCosts: r('0'),
        fixedTaxes: r('0'),
        titheRate: r('0'),
        revenueTaxRate: r('0'),
        requiredMarginPercent: r('100')
      };
      const result = root(input);
      expect(result.value.operatingCost).toStrictEqual(r('0'));
      expect(result.value.requiredMarginPercent).toStrictEqual(r('100'));
      expect(result.value.requiredMarginRatio).toStrictEqual(r('1'));
      expect(result.value.remainingRevenueFactor).toStrictEqual(r('1'));
      expect(result.value.marginRevenueFactor).toStrictEqual(r('0'));
      expect(result.value.solution.case).toBe('all-positive');
      expect(result.value.solution.minimumCreditedRevenue).toBeNull();
      expect(result.value.solution.infimumCreditedRevenue).toStrictEqual(r('0'));
      expect(result.value.solution.minimumAttained).toBe(false);
    }

    // row2: q=1/10, tau=1/20, L=50 → G=17/20, m=1/2, H=7/20
    {
      const input: LinearMarginThresholdInput = {
        ...baseInput(),
        fixedCosts: r('0'),
        usageCosts: r('0'),
        extraordinaryCosts: r('0'),
        fixedTaxes: r('0'),
        titheRate: r('1', '10'),
        revenueTaxRate: r('1', '20'),
        requiredMarginPercent: r('50')
      };
      const result = root(input);
      expect(result.value.operatingCost).toStrictEqual(r('0'));
      expect(result.value.requiredMarginPercent).toStrictEqual(r('50'));
      expect(result.value.requiredMarginRatio).toStrictEqual(r('1','2'));
      expect(result.value.remainingRevenueFactor).toStrictEqual(r('17','20'));
      expect(result.value.marginRevenueFactor).toStrictEqual(r('7','20'));
      expect(result.value.solution.case).toBe('all-positive');
      expect(result.value.solution.minimumCreditedRevenue).toBeNull();
      expect(result.value.solution.infimumCreditedRevenue).toStrictEqual(r('0'));
      expect(result.value.solution.minimumAttained).toBe(false);
    }
  });

  it('it3: none (4 rows)', () => {
    // row1: A=340, q=0, tau=0, L=100 → H=0, G=1, m=1
    {
      const input: LinearMarginThresholdInput = {
        ...baseInput(),
        fixedCosts: r('300'),
        usageCosts: r('40'),
        extraordinaryCosts: r('0'),
        fixedTaxes: r('0'),
        titheRate: r('0'),
        revenueTaxRate: r('0'),
        requiredMarginPercent: r('100')
      };
      const result = root(input);
      expect(result.value.operatingCost).toStrictEqual(r('340'));
      expect(result.value.requiredMarginPercent).toStrictEqual(r('100'));
      expect(result.value.requiredMarginRatio).toStrictEqual(r('1'));
      expect(result.value.remainingRevenueFactor).toStrictEqual(r('1'));
      expect(result.value.marginRevenueFactor).toStrictEqual(r('0'));
      expect(result.value.solution.case).toBe('none');
      expect(result.value.solution.minimumCreditedRevenue).toBeNull();
      expect(result.value.solution.infimumCreditedRevenue).toBeNull();
      expect(result.value.solution.minimumAttained).toBe(false);
    }

    // row2: A=340, q=0, tau=0, L=101 → H=-1/100, G=1, m=101/100
    {
      const input: LinearMarginThresholdInput = {
        ...baseInput(),
        fixedCosts: r('300'),
        usageCosts: r('40'),
        extraordinaryCosts: r('0'),
        fixedTaxes: r('0'),
        titheRate: r('0'),
        revenueTaxRate: r('0'),
        requiredMarginPercent: r('101')
      };
      const result = root(input);
      expect(result.value.operatingCost).toStrictEqual(r('340'));
      expect(result.value.requiredMarginPercent).toStrictEqual(r('101'));
      expect(result.value.requiredMarginRatio).toStrictEqual(r('101','100'));
      expect(result.value.remainingRevenueFactor).toStrictEqual(r('1'));
      expect(result.value.marginRevenueFactor).toStrictEqual(r('-1','100'));
      expect(result.value.solution.case).toBe('none');
      expect(result.value.solution.minimumCreditedRevenue).toBeNull();
      expect(result.value.solution.infimumCreditedRevenue).toBeNull();
      expect(result.value.solution.minimumAttained).toBe(false);
    }

    // row3: A=0, q=0, tau=0, L=101 → H=-1/100, G=1, m=101/100
    {
      const input: LinearMarginThresholdInput = {
        ...baseInput(),
        fixedCosts: r('0'),
        usageCosts: r('0'),
        extraordinaryCosts: r('0'),
        fixedTaxes: r('0'),
        titheRate: r('0'),
        revenueTaxRate: r('0'),
        requiredMarginPercent: r('101')
      };
      const result = root(input);
      expect(result.value.operatingCost).toStrictEqual(r('0'));
      expect(result.value.requiredMarginPercent).toStrictEqual(r('101'));
      expect(result.value.requiredMarginRatio).toStrictEqual(r('101','100'));
      expect(result.value.remainingRevenueFactor).toStrictEqual(r('1'));
      expect(result.value.marginRevenueFactor).toStrictEqual(r('-1','100'));
      expect(result.value.solution.case).toBe('none');
      expect(result.value.solution.minimumCreditedRevenue).toBeNull();
      expect(result.value.solution.infimumCreditedRevenue).toBeNull();
      expect(result.value.solution.minimumAttained).toBe(false);
    }

    // row4: A=0, q=1, tau=1/10, L=0 → G=-1/10, m=0, H=-1/10
    {
      const input: LinearMarginThresholdInput = {
        ...baseInput(),
        fixedCosts: r('0'),
        usageCosts: r('0'),
        extraordinaryCosts: r('0'),
        fixedTaxes: r('0'),
        titheRate: r('1'),
        revenueTaxRate: r('1', '10'),
        requiredMarginPercent: r('0')
      };
      const result = root(input);
      expect(result.value.operatingCost).toStrictEqual(r('0'));
      expect(result.value.requiredMarginPercent).toStrictEqual(r('0'));
      expect(result.value.requiredMarginRatio).toStrictEqual(r('0'));
      expect(result.value.remainingRevenueFactor).toStrictEqual(r('-1','10'));
      expect(result.value.marginRevenueFactor).toStrictEqual(r('-1','10'));
      expect(result.value.solution.case).toBe('none');
      expect(result.value.solution.minimumCreditedRevenue).toBeNull();
      expect(result.value.solution.infimumCreditedRevenue).toBeNull();
      expect(result.value.solution.minimumAttained).toBe(false);
    }
  });

  it('modelo inválido impede o cálculo da inversa',()=>{
    for(const model of [null,undefined,{kind:'outro',reason:'Declarado'},{kind:'fixed-usage-linear',reason:' '},{kind:'fixed-usage-linear',reason:12}]){
      const input=baseInput();
      expect(Reflect.set(input,'model',model)).toBe(true);
      const result=calculateConditionalLinearMarginThreshold(input,policy);
      if(result.status!=='unavailable')throw Error('Esperado unavailable');
      expect(result).toMatchObject({status:'unavailable',code:'unsupported-model',marginTarget:null,calculation:null});
      expect(result.reason).not.toBe('');
      expect(result).not.toHaveProperty('value');
    }
  });

it('orçamento técnico inválido precede avaliação financeira', () => {
  const result = calculateConditionalLinearMarginThreshold(
    {
      ...baseInput(),
      model: {kind:'fixed-usage-linear',reason:' '},
      requiredMarginPercent: r('-1')
    },
    { ...policy, maxDigits: 0 }
  );

  if (result.status !== 'unavailable') {
    throw new Error('Esperado status unavailable');
  }

  expect(result.code).toBe('invalid-budget');
  expect(result.reason).not.toBe('');
  expect(result.marginTarget).toBeNull();
  expect(result.calculation).toBeNull();
  expect(result).not.toHaveProperty('value');
});

it('rejeita margem negativa mantendo projeção válida', () => {
  const result = calculateConditionalLinearMarginThreshold({ ...baseInput(), requiredMarginPercent: r('-1') }, policy);
  if (result.status !== 'unavailable') throw Error('Esperado unavailable');
  const marginTarget=result.marginTarget;
  if(marginTarget===null||marginTarget.status!=='unavailable')throw Error('Diagnóstico de margem deveria existir');
  expect(marginTarget.code).toBe(result.code);
  expect(result.reason).toBe(marginTarget.reason);
  expect(result.calculation).toBe(marginTarget.calculation);
  expect(marginTarget).not.toHaveProperty('value');
  expect(result.code).toBe('invalid-target');
  expect(result.reason).toContain('requiredMarginPercent');
  expect(result.reason).not.toBe('');
  expect(result.calculation).toBeNull();
  expect(result).not.toHaveProperty('value');
  const projection = marginTarget.projection;
  if (projection === null || projection.status !== 'ready') throw Error('Projeção deveria permanecer válida');
  expect(projection.value.netProfit).toEqual(r('-340'));
  expect(projection.value.margin).toMatchObject({status:'unavailable',code:'zero-revenue',calculation:null});
});

it('rejeita racional de margem inválido preservando diagnóstico', () => {
  const result = calculateConditionalLinearMarginThreshold({ ...baseInput(), requiredMarginPercent: r('1', '0') }, policy);
  if (result.status !== 'unavailable') throw Error('Esperado unavailable');
  const marginTarget=result.marginTarget;
  if(marginTarget===null||marginTarget.status!=='unavailable')throw Error('Diagnóstico de margem deveria existir');
  expect(marginTarget.code).toBe(result.code);
  expect(result.reason).toBe(marginTarget.reason);
  expect(result.calculation).toBe(marginTarget.calculation);
  expect(marginTarget).not.toHaveProperty('value');
  expect(result.code).toBe('invalid-target');
  const calculation = result.calculation;
  if (calculation === null) throw Error('Diagnóstico deveria existir');
  expect(calculation.status).toBe('unavailable');
  expect(calculation.code).toBe('invalid-rational');
  expect(result.reason).toBe(calculation.reason);
  expect(result.reason).not.toBe('');
  const projection = marginTarget.projection;
  if (projection === null || projection.status !== 'ready') throw Error('Projeção deveria permanecer válida');
  expect(projection.value.netProfit).toEqual(r('-340'));
  expect(projection.value.margin).toMatchObject({status:'unavailable',code:'zero-revenue',calculation:null});
  expect(result).not.toHaveProperty('value');
});

it('projeção inválida preserva diagnóstico e impede comparação de margem', () => {
  const result = calculateConditionalLinearMarginThreshold(
    {
      ...baseInput(),
      fixedCosts: r('-1')
    },
    policy
  );

  if (result.status !== 'unavailable') {
    throw new Error('Esperado status unavailable');
  }

  const marginTarget=result.marginTarget;
  if(marginTarget===null||marginTarget.status!=='unavailable')throw Error('Diagnóstico de margem deveria existir');
  expect(marginTarget.code).toBe(result.code);
  expect(result.reason).toBe(marginTarget.reason);
  expect(result.calculation).toBe(marginTarget.calculation);
  expect(marginTarget).not.toHaveProperty('value');
  expect(result.code).toBe('projection-unavailable');
  expect(result.reason).not.toBe('');
  expect(marginTarget.projection).not.toBeNull();
  expect(result.calculation).toBeNull();

  expect(result).not.toHaveProperty('value');
  const projection = marginTarget.projection;
  if (projection === null || projection.status !== 'unavailable') {
    throw new Error('Esperada projeção indisponível');
  }

  expect(projection.code).toBe('invalid-input');
  expect(projection.field).toBe('fixedCosts');
  expect(projection.calculation).toBeNull();
  expect(projection.reason).toBe(result.reason);
  expect(projection).not.toHaveProperty('value');
});

it('meta ausente não se transforma em zero', () => {
  const input = baseInput();
  expect(Reflect.deleteProperty(input, 'requiredMarginPercent')).toBe(true);
  expect(input).not.toHaveProperty('requiredMarginPercent');
  const result = calculateConditionalLinearMarginThreshold(input, policy);
  if (result.status !== 'unavailable') throw Error('Esperado unavailable');
  const marginTarget=result.marginTarget;
  if(marginTarget===null||marginTarget.status!=='unavailable')throw Error('Diagnóstico de margem deveria existir');
  expect(marginTarget.code).toBe(result.code);
  expect(result.reason).toBe(marginTarget.reason);
  expect(result.calculation).toBe(marginTarget.calculation);
  expect(marginTarget).not.toHaveProperty('value');
  expect(result.code).toBe('invalid-target');
  const calculation = result.calculation;
  if (calculation === null) throw Error('Diagnóstico deveria existir');
  expect(calculation.status).toBe('unavailable');
  expect(calculation.code).toBe('invalid-rational');
  expect(result.reason).toBe(calculation.reason);
  expect(result.reason).not.toBe('');
  const projection = marginTarget.projection;
  if (projection === null || projection.status !== 'ready') throw Error('Projeção deveria permanecer válida');
  expect(projection.value.netProfit).toEqual(r('-340'));
  expect(projection.value.margin).toMatchObject({status:'unavailable',code:'zero-revenue',calculation:null});
  expect(result).not.toHaveProperty('value');
});

it('limite técnico da meta não se transforma em meta inválida', () => {
  const result = calculateConditionalLinearMarginThreshold({ ...baseInput(), requiredMarginPercent: r('1'.repeat(65)) }, policy);
  if (result.status !== 'unavailable') throw Error('Esperado unavailable');
  const marginTarget=result.marginTarget;
  if(marginTarget===null||marginTarget.status!=='unavailable')throw Error('Diagnóstico de margem deveria existir');
  expect(marginTarget.code).toBe(result.code);
  expect(result.reason).toBe(marginTarget.reason);
  expect(result.calculation).toBe(marginTarget.calculation);
  expect(marginTarget).not.toHaveProperty('value');
  expect(result.code).toBe('calculation-unavailable');
  const calculation = result.calculation;
  if (calculation === null) throw Error('Diagnóstico deveria existir');
  expect(calculation.status).toBe('unavailable');
  expect(calculation.code).toBe('resource-budget');
  expect(result.reason).toBe(calculation.reason);
  expect(result.reason).not.toBe('');
  const projection = marginTarget.projection;
  if (projection === null || projection.status !== 'ready') throw Error('Projeção deveria permanecer válida');
  expect(projection.value.netProfit).toEqual(r('-340'));
  expect(projection.value.margin).toMatchObject({status:'unavailable',code:'zero-revenue',calculation:null});
  expect(result).not.toHaveProperty('value');
});
});
