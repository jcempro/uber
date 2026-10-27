/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.2, FT-003.34b.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {describe,expect,it} from 'vitest';
import {resolveFinancialProjectionInput} from './financial-input';
import type {FinancialProjectionInput,FinancialInputField} from './financial-input';
const limits={maxInputLength:256,maxDigits:128};
const r=(numerator:string,denominator='1')=>({numerator,denominator});
function input():FinancialProjectionInput{
  return {kind:'projection',contextId:'context',period:'month',creditedRevenue:r('100'),fixedCosts:r('80'),usageCosts:r('40'),extraordinaryCosts:r('0'),fixedTaxes:r('0'),titheRate:r('1','10'),revenueTaxRate:r('0')};
}
describe('Entradas financeiras explícitas, sem certificação ou cálculo de resultado',()=>{
  it('preserva os sete valores explícitos e normaliza racionais sem arredondar',()=>{
    const source={...input(),creditedRevenue:r('90071992547409930','10'),titheRate:r('2','20')};
    expect(resolveFinancialProjectionInput(source,limits)).toMatchObject({status:'ready',financialAssessment:'not-evaluated',value:{creditedRevenue:r('9007199254740993'),titheRate:r('1','10'),fixedCosts:r('80')}});
    // Taxa agregada>1 é válida como operando; não é prova de admissibilidade ou viabilidade.
    expect(resolveFinancialProjectionInput({...input(),revenueTaxRate:r('2')},limits)).toMatchObject({status:'ready',financialAssessment:'not-evaluated'});
  });
  it('não supõe zero para nenhum dos sete campos nem usa preço do passageiro como receita',()=>{
    const fields:readonly FinancialInputField[]=['creditedRevenue','fixedCosts','usageCosts','extraordinaryCosts','fixedTaxes','titheRate','revenueTaxRate'];
    for(const field of fields){
      const missing={...input(),[field]:undefined,passengerPrice:r('10000')} as unknown as FinancialProjectionInput;
      expect(resolveFinancialProjectionInput(missing,limits)).toMatchObject({status:'unavailable',field,calculation:{code:'invalid-rational'}});
      expect(resolveFinancialProjectionInput({...input(),[field]:r('-1')},limits)).toMatchObject({status:'unavailable',code:'invalid-input',field});
    }
  });
  it('prioriza orçamento,recusa contexto/período/modo e conserva falhas matemáticas',()=>{
    expect(resolveFinancialProjectionInput(null as unknown as FinancialProjectionInput,{maxInputLength:0,maxDigits:128})).toMatchObject({status:'unavailable',code:'invalid-budget'});
    expect(resolveFinancialProjectionInput({...input(),kind:'actual'} as unknown as FinancialProjectionInput,limits)).toMatchObject({status:'unavailable',code:'unsupported-kind'});
    expect(resolveFinancialProjectionInput({...input(),contextId:' '},limits)).toMatchObject({status:'unavailable',code:'invalid-input'});
    expect(resolveFinancialProjectionInput({...input(),period:'hour'} as unknown as FinancialProjectionInput,limits)).toMatchObject({status:'unavailable',code:'invalid-input'});
    expect(resolveFinancialProjectionInput({...input(),usageCosts:r('1','0')},limits)).toMatchObject({status:'unavailable',field:'usageCosts',calculation:{code:'invalid-rational'}});
    expect(resolveFinancialProjectionInput(input(),{maxInputLength:256,maxDigits:1})).toMatchObject({status:'unavailable',calculation:{code:'resource-budget'}});
  });
  it('retorna snapshot profundo estável sem congelar entradas nem inferir lucro/cobertura',()=>{
    const source=input(),before=JSON.stringify(source),first=resolveFinancialProjectionInput(source,limits);
    expect(first).toEqual(resolveFinancialProjectionInput(source,limits));expect(JSON.stringify(source)).toBe(before);expect(Object.isFrozen(source)).toBe(false);expect(Object.isFrozen(source.creditedRevenue)).toBe(false);
    expect(Object.isFrozen(first)).toBe(true);expect(JSON.parse(JSON.stringify(first))).toEqual(first);
    if(first.status!=='ready')throw Error('Expected ready');
    expect(Object.isFrozen(first.value)).toBe(true);expect(Object.isFrozen(first.value.creditedRevenue)).toBe(true);
    expect(first.value.creditedRevenue).not.toBe(source.creditedRevenue);
    expect(first).not.toHaveProperty('netProfit');expect(first).not.toHaveProperty('viable');expect(first).not.toHaveProperty('covered');
  });
});
