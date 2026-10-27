/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§8.1/8.2, FT-003.34c.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {describe,expect,it} from 'vitest';
import {calculateOperatingCost} from './operating-cost';
import type {OperatingCostInput,OperatingCostComponent} from './operating-cost';
const limits={maxInputLength:256,maxDigits:128};
const r=(numerator:string,denominator='1')=>({numerator,denominator});
function input():OperatingCostInput {
  return {fixedCosts:r('100'),usageCosts:r('200'),extraordinaryCosts:r('30'),fixedTaxes:r('10')};
}
describe('Custo operacional algébrico sem certificado de admissão',()=>{
  it('soma as quatro parcelas do RCF8.2 com frações e valores acima de2^53',()=>{
    // Fonte independente: C_oper=F+V+E+Tfix;100+200+30+10=340.
    expect(calculateOperatingCost(input(),limits)).toMatchObject({status:'ready',value:r('340'),costAdmission:'not-evaluated'});
    expect(calculateOperatingCost({fixedCosts:r('1','3'),usageCosts:r('1','6'),extraordinaryCosts:r('0'),fixedTaxes:r('0')},limits)).toMatchObject({status:'ready',value:r('1','2')});
    expect(calculateOperatingCost({fixedCosts:r('9007199254740993'),usageCosts:r('1'),extraordinaryCosts:r('0'),fixedTaxes:r('0')},limits)).toMatchObject({status:'ready',value:r('9007199254740994')});
  });
  it('não depende de receita/atividade nem apaga fixos com rodagem zero',()=>{
    for(const trips of [0,1,10]){
      const withActivity={fixedCosts:r('80'),usageCosts:r('0'),extraordinaryCosts:r('0'),fixedTaxes:r('0'),trips,kilometres:r('0'),revenue:undefined,hours:undefined};
      expect(calculateOperatingCost(withActivity,limits)).toMatchObject({status:'ready',value:r('80'),costAdmission:'not-evaluated'});
    }
    expect(calculateOperatingCost({fixedCosts:r('0'),usageCosts:r('0'),extraordinaryCosts:r('0'),fixedTaxes:r('0')},limits)).toMatchObject({status:'ready',value:r('0')});
  });
  it('não troca componentes ausentes/negativos por zero e preserva falhas originais',()=>{
    const components:readonly OperatingCostComponent[]=['fixedCosts','usageCosts','extraordinaryCosts','fixedTaxes'];
    for(const component of components){
      expect(calculateOperatingCost({...input(),[component]:undefined} as unknown as OperatingCostInput,limits)).toMatchObject({status:'unavailable',component,calculation:{code:'invalid-rational'}});
      expect(calculateOperatingCost({...input(),[component]:r('-1')},limits)).toMatchObject({status:'unavailable',code:'invalid-cost',component});
    }
    expect(calculateOperatingCost({...input(),fixedTaxes:r('1','0')},limits)).toMatchObject({status:'unavailable',component:'fixedTaxes',calculation:{code:'invalid-rational'}});
  });
  it('respeita recursos e imutabilidade,sem emitir lucro,cobertura ou custo admitido',()=>{
    expect(calculateOperatingCost(null as unknown as OperatingCostInput,{maxInputLength:0,maxDigits:128})).toMatchObject({status:'unavailable',code:'invalid-budget'});
    const small={fixedCosts:r('5'),usageCosts:r('5'),extraordinaryCosts:r('0'),fixedTaxes:r('0')};
    expect(calculateOperatingCost(small,{maxInputLength:256,maxDigits:1})).toMatchObject({status:'unavailable',calculation:{code:'resource-budget'}});
    const source=input(),before=JSON.stringify(source),first=calculateOperatingCost(source,limits);
    expect(first).toEqual(calculateOperatingCost(source,limits));expect(JSON.stringify(source)).toBe(before);expect(Object.isFrozen(source)).toBe(false);
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);expect(Object.isFrozen(first)).toBe(true);
    if(first.status!=='ready')throw Error('Expected ready');
    expect(Object.isFrozen(first.value)).toBe(true);expect(first.costAdmission).toBe('not-evaluated');
    expect(first).not.toHaveProperty('profit');expect(first).not.toHaveProperty('viable');expect(first).not.toHaveProperty('complete');
  });
});
