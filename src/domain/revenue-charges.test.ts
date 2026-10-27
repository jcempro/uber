/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§8.2, FT-003.34d.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {describe,expect,it} from 'vitest';
import {calculateRevenueCharges} from './revenue-charges';
import type {RevenueChargesInput} from './revenue-charges';
const limits={maxInputLength:256,maxDigits:128};
const r=(numerator:string,denominator='1')=>({numerator,denominator});
function input():RevenueChargesInput{return {creditedRevenue:r('1000'),titheRate:r('1','10'),revenueTaxRate:r('1','20')};}
describe('Encargos sobre repasse e fator remanescente, sem parecer fiscal',()=>{
  it('aplica q e tau sobre o repasse,sem abater custos nem usar preço do passageiro',()=>{
    // RCF8.2: qB=100,tauB=50,G=1-0,10-0,05=0,85.
    for(const trips of [0,1,10]){
      const source={...input(),operatingCost:r('900'),passengerPrice:r('10000'),trips};
      expect(calculateRevenueCharges(source,limits)).toMatchObject({status:'ready',tithe:r('100'),receiptTax:r('50'),remainingRevenueFactor:r('17','20'),taxAssessment:'not-evaluated'});
    }
    expect(calculateRevenueCharges({...input(),creditedRevenue:r('9007199254740993'),revenueTaxRate:r('0')},limits)).toMatchObject({status:'ready',tithe:r('9007199254740993','10'),receiptTax:r('0')});
  });
  it('mantém cálculo direto com Gzero/negativo e receita0 sem autorizar inversa',()=>{
    expect(calculateRevenueCharges({...input(),revenueTaxRate:r('9','10')},limits)).toMatchObject({status:'ready',remainingRevenueFactor:r('0')});
    expect(calculateRevenueCharges({...input(),revenueTaxRate:r('1')},limits)).toMatchObject({status:'ready',remainingRevenueFactor:r('-1','10'),tithe:r('100'),receiptTax:r('1000')});
    expect(calculateRevenueCharges({...input(),creditedRevenue:r('0')},limits)).toMatchObject({status:'ready',tithe:r('0'),receiptTax:r('0'),remainingRevenueFactor:r('17','20')});
    expect(calculateRevenueCharges(input(),limits)).not.toHaveProperty('breakEvenRevenue');
  });
  it('recusa ausência/negativo/racional inválido sem inventar taxa0 ou padrão de dízimo',()=>{
    for(const field of ['creditedRevenue','titheRate','revenueTaxRate'] as const){
      expect(calculateRevenueCharges({...input(),[field]:undefined} as unknown as RevenueChargesInput,limits)).toMatchObject({status:'unavailable',field,calculation:{code:'invalid-rational'}});
      expect(calculateRevenueCharges({...input(),[field]:r('-1')},limits)).toMatchObject({status:'unavailable',code:'invalid-input',field});
    }
    expect(calculateRevenueCharges({...input(),revenueTaxRate:r('1','0')},limits)).toMatchObject({status:'unavailable',field:'revenueTaxRate',calculation:{code:'invalid-rational'}});
  });
  it('preserva orçamento,recursos,JSON,determinismo e imutabilidade sem certificar tributo',()=>{
    expect(calculateRevenueCharges(null as unknown as RevenueChargesInput,{maxInputLength:0,maxDigits:128})).toMatchObject({status:'unavailable',code:'invalid-budget'});
    expect(calculateRevenueCharges(input(),{maxInputLength:256,maxDigits:1})).toMatchObject({status:'unavailable',calculation:{code:'resource-budget'}});
    const source=input(),before=JSON.stringify(source),first=calculateRevenueCharges(source,limits);
    expect(first).toEqual(calculateRevenueCharges(source,limits));expect(JSON.stringify(source)).toBe(before);expect(Object.isFrozen(source)).toBe(false);
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);expect(Object.isFrozen(first)).toBe(true);
    if(first.status!=='ready')throw Error('Expected ready');for(const x of[first.tithe,first.receiptTax,first.remainingRevenueFactor])expect(Object.isFrozen(x)).toBe(true);
    expect(first.taxAssessment).toBe('not-evaluated');expect(first).not.toHaveProperty('viable');expect(first).not.toHaveProperty('taxLegality');
  });
});
