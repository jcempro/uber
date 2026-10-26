/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§7.2, FT-003.24b.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import {calculateMonthlyAvailability} from './monthly-availability';
import type {MonthlyAvailabilityValues} from './monthly-availability';
import type {ExactRational,ExactLimits} from './exact';
const budget=Object.freeze({maxInputLength:256,maxDigits:64});
/** Par literal para identidades exatas, sem preços/defaults financeiros. */
const r=(numerator:string,denominator='1'):ExactRational=>Object.freeze({numerator,denominator});
/** Exige disponibilidade explícita e estrutura imutável, nunca falha como zero. */
function value(scheduled:ExactRational,lost:ExactRational,hours:ExactRational,limits:ExactLimits=budget):MonthlyAvailabilityValues {
  const result=calculateMonthlyAvailability(scheduled,lost,hours,limits);
  if(result.status!=='ready')throw Error(JSON.stringify(result));
  expect(Object.isFrozen(result)).toBe(true);expect(Object.isFrozen(result.value)).toBe(true);
  expect(Object.isFrozen(result.value.effectiveWorkingDaysPerMonth)).toBe(true);
  expect(Object.isFrozen(result.value.connectedHoursPerMonth)).toBe(true);return result.value;
}
describe('Perdas e horas na mesma competência mensal',()=>{
  it('aplica a regra canônica de perdas sobre120/7 dias sem arredondar',()=>{
    const rcf=readFileSync(new URL('../../RCF.md',import.meta.url),'utf8');
    expect(rcf).toContain('dias efetivos = programados − perdidos');
    expect(value(r('120','7'),r('2'),r('3'))).toEqual({effectiveWorkingDaysPerMonth:r('106','7'),connectedHoursPerMonth:r('318','7')});
    expect(value(r('120','7'),r('0'),r('3'))).toEqual({effectiveWorkingDaysPerMonth:r('120','7'),connectedHoursPerMonth:r('360','7')});
  });
  it('preserva indisponibilidade total como zero de dias/horas,sem declarar custos zero',()=>{
    for(const[scheduled,lost]of [[r('120','7'),r('120','7')],[r('0'),r('0')]])
      expect(value(scheduled,lost,r('3'))).toEqual({effectiveWorkingDaysPerMonth:r('0'),connectedHoursPerMonth:r('0')});
  });
  it('rejeita dias/perdas negativos,perdas excessivas e jornada fora do dia físico',()=>{
    for(const[scheduled,lost,hours]of [[r('-1'),r('0'),r('3')],[r('120','7'),r('-1'),r('3')],[r('120','7'),r('18'),r('3')],[r('120','7'),r('0'),r('0')],[r('120','7'),r('0'),r('25')]])
      expect(calculateMonthlyAvailability(scheduled,lost,hours,budget)).toMatchObject({status:'unavailable',code:'invalid-calendar'});
  });
  it('não transforma perdas ausentes em zero e preserva falhas de representação/recurso',()=>{
    for(const bad of [undefined,{status:'ready',value:r('0')},r('01')])
      expect(calculateMonthlyAvailability(r('120','7'),bad as unknown as ExactRational,r('3'),budget)).toMatchObject({status:'unavailable',code:'invalid-rational'});
    expect(calculateMonthlyAvailability(null as unknown as ExactRational,r('0'),r('3'),{maxInputLength:0,maxDigits:64})).toEqual({status:'unavailable',code:'invalid-budget',reason:'Orçamento inválido: maxInputLength não é inteiro positivo seguro.'});
    expect(calculateMonthlyAvailability(r('1'),r('0'),r('3'),{maxInputLength:256,maxDigits:1})).toMatchObject({status:'unavailable',code:'resource-budget'});
  });
  it('mantém perdas e jornadas fracionárias e aceita24 horas como limite do núcleo',()=>{
    expect(value(r('3'),r('1','2'),r('3','2'))).toEqual({effectiveWorkingDaysPerMonth:r('5','2'),connectedHoursPerMonth:r('15','4')});
    expect(value(r('1'),r('0'),r('24'))).toEqual({effectiveWorkingDaysPerMonth:r('1'),connectedHoursPerMonth:r('24')});
  });
  it('preserva entradas,JSON,determinismo e falhas congeladas',()=>{
    const scheduled=r('120','7'),lost=r('2'),hours=r('3'),before=JSON.stringify([scheduled,lost,hours,budget]);
    const first=calculateMonthlyAvailability(scheduled,lost,hours,budget);
    expect(first).toEqual(calculateMonthlyAvailability(scheduled,lost,hours,budget));
    expect(JSON.stringify([scheduled,lost,hours,budget])).toBe(before);expect(JSON.parse(JSON.stringify(first))).toEqual(first);
    expect(Object.isFrozen(calculateMonthlyAvailability(scheduled,r('18'),hours,budget))).toBe(true);
  });
});
