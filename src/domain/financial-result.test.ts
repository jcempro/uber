/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§7.2/8.2/F16, FT-003.34.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {describe,expect,it} from 'vitest';
import {calculateFinancialProjection} from './financial-result';
import type {FinancialProjectionInput} from './financial-result';
const limits={maxInputLength:256,maxDigits:128};
const r=(numerator:string,denominator='1')=>({numerator,denominator});
function input():FinancialProjectionInput{
  return {kind:'projection',contextId:'scenario-jornada-meta',period:'month',creditedRevenue:r('100'),fixedCosts:r('80'),usageCosts:r('40'),extraordinaryCosts:r('0'),fixedTaxes:r('0'),titheRate:r('1','10'),revenueTaxRate:r('0')};
}
describe('Resultado financeiro projetado do RCF8.2 sem certificação de completude',()=>{
  it('inclui fixos,uso,extraordinários,encargos e alíquotas sobre receita creditada',()=>{
    // RCF8.2 literal: Coper=F+V+E+Tfix; LLF=B-qB-tauB-Coper.
    // Fixture: 100+200+30+10=340;1000-100-50-340=510;margem51%.
    const result=calculateFinancialProjection({...input(),creditedRevenue:r('1000'),fixedCosts:r('100'),usageCosts:r('200'),extraordinaryCosts:r('30'),fixedTaxes:r('10'),revenueTaxRate:r('1','20')},limits);
    expect(result).toMatchObject({status:'ready',kind:'projection',contextId:'scenario-jornada-meta',period:'month',financialAssessment:'not-evaluated',value:{operatingCost:r('340'),tithe:r('100'),receiptTax:r('50'),plannedTotalCost:r('490'),netProfit:r('510'),remainingRevenueFactor:r('17','20'),margin:{status:'ready',value:r('51','100')}}});
  });
  it('mantém prejuízo com10viagens e não usa atividade para aprovar resultado',()=>{
    const original=input();
    for(const tripCount of [1,10,100]){
      const withActivity={...original,tripCount,passengerPrice:r('10000')};
      expect(calculateFinancialProjection(withActivity,limits)).toMatchObject({status:'ready',value:{operatingCost:r('120'),tithe:r('10'),plannedTotalCost:r('130'),netProfit:r('-30'),margin:{value:r('-3','10')}}});
    }
    // O trecho isolado teria100-40=60, mas não paga os80 fixos nem dízimo.
    const single={...original,tripCount:1};expect(calculateFinancialProjection(single,limits)).not.toHaveProperty('viable');
  });
  it('mantém fixos com receita zero e não inventa margem por divisão0',()=>{
    expect(calculateFinancialProjection({...input(),creditedRevenue:r('0'),usageCosts:r('0')},limits)).toMatchObject({status:'ready',value:{operatingCost:r('80'),tithe:r('0'),receiptTax:r('0'),netProfit:r('-80'),plannedTotalCost:r('80'),margin:{status:'unavailable',code:'zero-revenue'}}});
  });
  it('preserva exatidão acima de2^53 e frações sem arredondamento',()=>{
    const result=calculateFinancialProjection({...input(),creditedRevenue:r('9007199254740993'),fixedCosts:r('0'),usageCosts:r('0')},limits);
    expect(result).toMatchObject({status:'ready',value:{tithe:r('9007199254740993','10'),netProfit:r('81064793292668937','10'),margin:{status:'ready',value:r('9','10')}}});
  });
  it('não confunde resultado direto com inversão quando fator restante é não positivo',()=>{
    expect(calculateFinancialProjection({...input(),fixedCosts:r('0'),usageCosts:r('0'),revenueTaxRate:r('1')},limits)).toMatchObject({status:'ready',value:{remainingRevenueFactor:r('-1','10'),netProfit:r('-10'),plannedTotalCost:r('110')}});
  });
  it('recusa ausência/negativos/racionais inválidos e modo real sem presumir0',()=>{
    const absent={...input(),usageCosts:undefined} as unknown as FinancialProjectionInput;
    expect(calculateFinancialProjection(absent,limits)).toMatchObject({status:'unavailable',field:'usageCosts'});
    expect(calculateFinancialProjection({...input(),fixedCosts:r('-1')},limits)).toMatchObject({status:'unavailable',code:'invalid-input',field:'fixedCosts'});
    expect(calculateFinancialProjection({...input(),creditedRevenue:r('1','0')},limits)).toMatchObject({status:'unavailable',calculation:{code:'invalid-rational'}});
    expect(calculateFinancialProjection({...input(),kind:'actual'} as unknown as FinancialProjectionInput,limits)).toMatchObject({status:'unavailable',code:'unsupported-kind'});
  });
  it('prioriza orçamento técnico e expõe recursos insuficientes sem aprovação artificial',()=>{
    expect(calculateFinancialProjection(null as unknown as FinancialProjectionInput,{maxInputLength:0,maxDigits:128})).toMatchObject({status:'unavailable',code:'invalid-budget'});
    expect(calculateFinancialProjection(input(),{maxInputLength:256,maxDigits:1})).toMatchObject({status:'unavailable',calculation:{code:'resource-budget'}});
  });
  it('preserva fontes,JSON,determinismo,imutabilidade e projeção não certificada',()=>{
    const source=input(),before=JSON.stringify(source),first=calculateFinancialProjection(source,limits);
    expect(first).toEqual(calculateFinancialProjection(source,limits));expect(JSON.stringify(source)).toBe(before);expect(Object.isFrozen(source)).toBe(false);
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);expect(Object.isFrozen(first)).toBe(true);
    if(first.status!=='ready')throw Error('Expected ready');
    expect(Object.isFrozen(first.value)).toBe(true);
    for(const key of ['operatingCost','tithe','receiptTax','plannedTotalCost','netProfit','remainingRevenueFactor'] as const)expect(Object.isFrozen(first.value[key])).toBe(true);
    expect(Object.isFrozen(first.value.margin)).toBe(true);expect(first.financialAssessment).toBe('not-evaluated');
    expect(first).not.toHaveProperty('actual');expect(first).not.toHaveProperty('viable');expect(first).not.toHaveProperty('breakEvenRevenue');
  });
});
