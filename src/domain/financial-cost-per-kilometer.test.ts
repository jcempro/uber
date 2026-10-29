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

it('Kzero mantém custo completo e suspende somente custo por km',()=>{
    // RCF8.2 literal: Coper=F+V+E+Tfix; LLF=B-qB-tauB-Coper.
    // Fixture: 100+200+30+10=340;1000-100-50-340=510;margem51%.
    const result=root({...baseInput(),totalDistance:r('0'),creditedRevenue:r('1000'),fixedCosts:r('100'),usageCosts:r('200'),extraordinaryCosts:r('30'),fixedTaxes:r('10'),revenueTaxRate:r('1','20')});
    expect(result.projection).toMatchObject({status:'ready',kind:'projection',contextId:'synthetic-cost-km',period:'month',financialAssessment:'not-evaluated',value:{operatingCost:r('340'),tithe:r('100'),receiptTax:r('50'),plannedTotalCost:r('490'),netProfit:r('510'),remainingRevenueFactor:r('17','20'),margin:{status:'ready',value:r('51','100')}}});
    expect(result.value.totalDistance).toEqual(r('0'));
    const metric=result.value.costPerKilometer;
    if(metric.status!=='unavailable')throw Error('Esperado custo/km indefinido');
    expect(metric.code).toBe('zero-distance');
    expect(metric.reason).not.toBe('');
    expect(metric.calculation).toBeNull();
    expect(metric).not.toHaveProperty('value');
  });

it('receita e custos zero não tornam custo por km definido com Kzero',()=>{
    const result=root({...baseInput(),creditedRevenue:r('0'),fixedCosts:r('0'),usageCosts:r('0'),extraordinaryCosts:r('0'),fixedTaxes:r('0'),totalDistance:r('0')});
    expect(result.projection).toMatchObject({status:'ready',value:{operatingCost:r('0'),tithe:r('0'),receiptTax:r('0'),netProfit:r('0'),plannedTotalCost:r('0'),margin:{status:'unavailable',code:'zero-revenue'}}});
    expect(result.value.totalDistance).toEqual(r('0'));
    const metric=result.value.costPerKilometer;
    if(metric.status!=='unavailable')throw Error('Esperado custo/km indefinido');
    expect(metric.code).toBe('zero-distance');
    expect(metric.reason).not.toBe('');
    expect(metric.calculation).toBeNull();
    expect(metric).not.toHaveProperty('value');
  });

it('rejeita distância negativa mantendo projeção válida', () => {
  const result = calculateFinancialCostPerKilometer({ ...baseInput(), totalDistance: r('-1') }, policy);
  if (result.status !== 'unavailable') throw Error('Esperado unavailable');
  expect(result.code).toBe('invalid-distance');
  expect(result.reason).toContain('totalDistance');
  expect(result.reason).not.toBe('');
  expect(result.calculation).toBeNull();
  expect(result).not.toHaveProperty('value');
  const projection = result.projection;
  if (projection === null || projection.status !== 'ready') throw Error('Projeção deveria permanecer válida');
  expect(projection.value.netProfit).toEqual(r('510'));
  expect(projection.value.margin).toEqual({ status: 'ready', value: r('51', '100') });
});

it('rejeita racional de distância inválido preservando diagnóstico', () => {
  const result = calculateFinancialCostPerKilometer({ ...baseInput(), totalDistance: r('1', '0') }, policy);
  if (result.status !== 'unavailable') throw Error('Esperado unavailable');
  expect(result.code).toBe('invalid-distance');
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

it('distância ausente não se transforma em zero', () => {
  const input = baseInput();
  expect(Reflect.deleteProperty(input, 'totalDistance')).toBe(true);
  expect(input).not.toHaveProperty('totalDistance');
  const result = calculateFinancialCostPerKilometer(input, policy);
  if (result.status !== 'unavailable') throw Error('Esperado unavailable');
  expect(result.code).toBe('invalid-distance');
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

it('limite técnico da distância não vira distância inválida', () => {
  const result = calculateFinancialCostPerKilometer({ ...baseInput(), totalDistance: r('1'.repeat(65)) }, policy);
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

it('orçamento inválido precede receita e distância negativas', () => {
  const result = calculateFinancialCostPerKilometer(
    {
      ...baseInput(),
      creditedRevenue: r('-1'),
      totalDistance: r('-1')
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

it('projeção inválida preserva diagnóstico e impede custo por km', () => {
  const result = calculateFinancialCostPerKilometer(
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

it('falha técnica da divisão preserva projeção e distância válidas', () => {
  const result = root({ ...baseInput(), totalDistance:r('1','1'.repeat(64)) });
  expect(result.value.totalDistance).toEqual(r('1','1'.repeat(64)));
  const metric=result.value.costPerKilometer;
  if (metric.status !== 'unavailable') throw Error('Esperado metric unavailable');
  expect(metric.code).toBe('calculation-unavailable');
  const calculation = metric.calculation;
  if (calculation === null) throw Error('Diagnóstico deveria existir');
  expect(calculation.status).toBe('unavailable');
  expect(calculation.code).toBe('resource-budget');
  expect(metric.reason).toBe(calculation.reason);
  expect(metric.reason).not.toBe('');
  const projection = result.projection;
  if (projection === null || projection.status !== 'ready') throw Error('Projeção deveria permanecer válida');
  expect(projection.value.netProfit).toEqual(r('510'));
  expect(projection.value.margin).toEqual({ status: 'ready', value: r('51', '100') });
  expect(metric).not.toHaveProperty('value');
});
});

function costKmFrozen(value:unknown):void {if(value!==null&&typeof value==='object'){expect(Object.isFrozen(value)).toBe(true);for(const child of Object.values(value))costKmFrozen(child);}}
describe('financial-cost-per-kilometer snapshots',()=>{
it('snapshot pronto captura política e normaliza distância',()=>{
    // RCF8.2 literal: Coper=F+V+E+Tfix; LLF=B-qB-tauB-Coper.
    // Fixture: 100+200+30+10=340;1000-100-50-340=510;margem51%.
      let lengthReads = 0;
  let digitReads = 0;
  const limits = {
    get maxInputLength() {
      lengthReads += 1;
      return lengthReads === 1 ? 256 : 0;
    },
    get maxDigits() {
      digitReads += 1;
      return digitReads === 1 ? 64 : 0;
    }
  };
  const distance=r('200','2');
  const cost=r('100');
  const input={...({...baseInput(),creditedRevenue:r('1000'),fixedCosts:r('100'),usageCosts:r('200'),extraordinaryCosts:r('30'),fixedTaxes:r('10'),revenueTaxRate:r('1','20')}),totalDistance:distance,fixedCosts:cost};
  const before=JSON.stringify(input);
  const result=calculateFinancialCostPerKilometer(input,limits);
  if(result.status!=='conditional')throw Error(result.reason);
  expect(result.value.totalDistance).not.toBe(distance);

    expect(result.projection).toMatchObject({status:'ready',kind:'projection',contextId:'synthetic-cost-km',period:'month',financialAssessment:'not-evaluated',value:{operatingCost:r('340'),tithe:r('100'),receiptTax:r('50'),plannedTotalCost:r('490'),netProfit:r('510'),remainingRevenueFactor:r('17','20'),margin:{status:'ready',value:r('51','100')}}});
    expect(result.value.totalDistance).toEqual(r('100'));
    expect(readyCost(result.value.costPerKilometer)).toStrictEqual({status:'ready',value:r('49','10')});
    const outputSnapshot=JSON.stringify(result);
  costKmFrozen(result);
  expect(JSON.stringify(input)).toBe(before);
  for(const item of [input,distance,cost,limits])expect(Object.isFrozen(item)).toBe(false);
  distance.numerator='0';distance.denominator='1';cost.numerator='999';input.contextId='mutated';
  expect(JSON.stringify(result)).toBe(outputSnapshot);
  expect(lengthReads).toBe(1);expect(digitReads).toBe(1);
});

it('snapshot Kzero preserva custo e política',()=>{
    // RCF8.2 literal: Coper=F+V+E+Tfix; LLF=B-qB-tauB-Coper.
    // Fixture: 100+200+30+10=340;1000-100-50-340=510;margem51%.
      let lengthReads = 0;
  let digitReads = 0;
  const limits = {
    get maxInputLength() {
      lengthReads += 1;
      return lengthReads === 1 ? 256 : 0;
    },
    get maxDigits() {
      digitReads += 1;
      return digitReads === 1 ? 64 : 0;
    }
  };
  const distance=r('0');
  const cost=r('100');
  const input={...({...baseInput(),totalDistance:r('0'),creditedRevenue:r('1000'),fixedCosts:r('100'),usageCosts:r('200'),extraordinaryCosts:r('30'),fixedTaxes:r('10'),revenueTaxRate:r('1','20')}),totalDistance:distance,fixedCosts:cost};
  const before=JSON.stringify(input);
  const result=calculateFinancialCostPerKilometer(input,limits);
  if(result.status!=='conditional')throw Error(result.reason);
  expect(result.value.totalDistance).not.toBe(distance);

    expect(result.projection).toMatchObject({status:'ready',kind:'projection',contextId:'synthetic-cost-km',period:'month',financialAssessment:'not-evaluated',value:{operatingCost:r('340'),tithe:r('100'),receiptTax:r('50'),plannedTotalCost:r('490'),netProfit:r('510'),remainingRevenueFactor:r('17','20'),margin:{status:'ready',value:r('51','100')}}});
    expect(result.value.totalDistance).toEqual(r('0'));
    const metric=result.value.costPerKilometer;
    if(metric.status!=='unavailable')throw Error('Esperado custo/km indefinido');
    expect(metric.code).toBe('zero-distance');
    expect(metric.reason).not.toBe('');
    expect(metric.calculation).toBeNull();
    expect(metric).not.toHaveProperty('value');
    const outputSnapshot=JSON.stringify(result);
  costKmFrozen(result);
  expect(JSON.stringify(input)).toBe(before);
  for(const item of [input,distance,cost,limits])expect(Object.isFrozen(item)).toBe(false);
  distance.numerator='0';distance.denominator='1';cost.numerator='999';input.contextId='mutated';
  expect(JSON.stringify(result)).toBe(outputSnapshot);
  expect(lengthReads).toBe(1);expect(digitReads).toBe(1);
});

it('snapshot falha de validação técnica preserva entradas', () => {
    let lengthReads = 0;
  let digitReads = 0;
  const limits = {
    get maxInputLength() {
      lengthReads += 1;
      return lengthReads === 1 ? 256 : 0;
    },
    get maxDigits() {
      digitReads += 1;
      return digitReads === 1 ? 64 : 0;
    }
  };
  const distance=r('1'.repeat(65));
  const cost=r('300');
  const input={...({ ...baseInput(), totalDistance: r('1'.repeat(65)) }),totalDistance:distance,fixedCosts:cost};
  const before=JSON.stringify(input);
  const result=calculateFinancialCostPerKilometer(input,limits);

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
  const outputSnapshot=JSON.stringify(result);
  costKmFrozen(result);
  expect(JSON.stringify(input)).toBe(before);
  for(const item of [input,distance,cost,limits])expect(Object.isFrozen(item)).toBe(false);
  distance.numerator='0';distance.denominator='1';cost.numerator='999';input.contextId='mutated';
  expect(JSON.stringify(result)).toBe(outputSnapshot);
  expect(lengthReads).toBe(1);expect(digitReads).toBe(1);
});

it('snapshot falha da divisão preserva métrica e política', () => {
    let lengthReads = 0;
  let digitReads = 0;
  const limits = {
    get maxInputLength() {
      lengthReads += 1;
      return lengthReads === 1 ? 256 : 0;
    },
    get maxDigits() {
      digitReads += 1;
      return digitReads === 1 ? 64 : 0;
    }
  };
  const distance=r('1','1'.repeat(64));
  const cost=r('300');
  const input={...({ ...baseInput(), totalDistance:r('1','1'.repeat(64)) }),totalDistance:distance,fixedCosts:cost};
  const before=JSON.stringify(input);
  const result=calculateFinancialCostPerKilometer(input,limits);
  if(result.status!=='conditional')throw Error(result.reason);
  expect(result.value.totalDistance).not.toBe(distance);

  expect(result.value.totalDistance).toEqual(r('1','1'.repeat(64)));
  const metric=result.value.costPerKilometer;
  if (metric.status !== 'unavailable') throw Error('Esperado metric unavailable');
  expect(metric.code).toBe('calculation-unavailable');
  const calculation = metric.calculation;
  if (calculation === null) throw Error('Diagnóstico deveria existir');
  expect(calculation.status).toBe('unavailable');
  expect(calculation.code).toBe('resource-budget');
  expect(metric.reason).toBe(calculation.reason);
  expect(metric.reason).not.toBe('');
  const projection = result.projection;
  if (projection === null || projection.status !== 'ready') throw Error('Projeção deveria permanecer válida');
  expect(projection.value.netProfit).toEqual(r('510'));
  expect(projection.value.margin).toEqual({ status: 'ready', value: r('51', '100') });
  expect(metric).not.toHaveProperty('value');
  const outputSnapshot=JSON.stringify(result);
  costKmFrozen(result);
  expect(JSON.stringify(input)).toBe(before);
  for(const item of [input,distance,cost,limits])expect(Object.isFrozen(item)).toBe(false);
  distance.numerator='0';distance.denominator='1';cost.numerator='999';input.contextId='mutated';
  expect(JSON.stringify(result)).toBe(outputSnapshot);
  expect(lengthReads).toBe(1);expect(digitReads).toBe(1);
});
});
