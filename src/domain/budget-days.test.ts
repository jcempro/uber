/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§7.2, FT-003.24a.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import {calculateScheduledBudgetDays} from './budget-days';
import type {ExactRational,ExactLimits} from './exact';
const budget=Object.freeze({maxInputLength:256,maxDigits:64});
/** Par literal independente, sem aproximação ou defaults financeiros. */
const r=(numerator:string,denominator='1'):ExactRational=>Object.freeze({numerator,denominator});
/** Exige disponibilidade e imutabilidade sem confundir falha com dias zero. */
function value(week:ExactRational,month:ExactRational,limits:ExactLimits=budget):ExactRational {
  const result=calculateScheduledBudgetDays(week,month,limits);
  if(result.status!=='ready')throw Error(JSON.stringify(result));
  expect(Object.isFrozen(result)).toBe(true);expect(Object.isFrozen(result.value)).toBe(true);return result.value;
}
describe('Dias programados do mês orçamentário',()=>{
  it('vincula ao RCF canônico4×30/7 e não usa16dias',()=>{
    const rcf=readFileSync(new URL('../../RCF.md',import.meta.url),'utf8');
    expect(rcf).toMatch(/4\s*×\s*30\/7/);
    expect(value(r('4'),r('30'))).toEqual(r('120','7'));
  });
  it('respeita zero,semana completa e premissas editadas',()=>{
    expect(value(r('0'),r('30'))).toEqual(r('0'));
    expect(value(r('7'),r('30'))).toEqual(r('30'));
    expect(value(r('2'),r('14'))).toEqual(r('4'));
    expect(value(r('8','2'),r('30'))).toEqual(r('120','7'));
  });
  it('rejeita domínio incoerente sem clamp',()=>{
    for(const[week,month]of [[r('8'),r('30')],[r('-1'),r('30')],[r('4'),r('0')],[r('4'),r('-1')]])
      expect(calculateScheduledBudgetDays(week,month,budget)).toMatchObject({status:'unavailable',code:'invalid-calendar'});
  });
  it('prioriza orçamento e preserva falhas de representação ou recurso',()=>{
    expect(calculateScheduledBudgetDays(null as unknown as ExactRational,r('30'),{maxInputLength:0,maxDigits:64})).toEqual({status:'unavailable',code:'invalid-budget',reason:'Orçamento inválido: maxInputLength não é inteiro positivo seguro.'});
    for(const bad of [undefined,r('01'),{status:'ready',value:r('4')}]){
      expect(calculateScheduledBudgetDays(bad as unknown as ExactRational,r('30'),budget)).toMatchObject({status:'unavailable',code:'invalid-rational'});
      expect(calculateScheduledBudgetDays(r('4'),bad as unknown as ExactRational,budget)).toMatchObject({status:'unavailable',code:'invalid-rational'});
    }
    expect(calculateScheduledBudgetDays(r('4'),r('30'),{maxInputLength:256,maxDigits:1})).toMatchObject({status:'unavailable',code:'resource-budget'});
  });
  it('preserva entradas,JSON,determinismo e falhas congeladas',()=>{
    const week=r('4'),month=r('30'),before=JSON.stringify([week,month,budget]);
    const first=calculateScheduledBudgetDays(week,month,budget);
    expect(first).toEqual(calculateScheduledBudgetDays(week,month,budget));
    expect(JSON.stringify([week,month,budget])).toBe(before);
    expect(JSON.parse(JSON.stringify(first))).toEqual({status:'ready',value:r('120','7')});
    expect(Object.isFrozen(calculateScheduledBudgetDays(r('8'),month,budget))).toBe(true);
  });
});
