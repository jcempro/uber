/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§7.2, FT-003.24.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import {calculateBudgetCalendar} from './budget-calendar';
import type {BudgetCalendarInput,BudgetCalendarValues} from './budget-calendar';
import type {ExactRational,ExactLimits} from './exact';
const budget=Object.freeze({maxInputLength:256,maxDigits:64});
/** Par literal independente, sem conversão aproximada. */
const r=(numerator:string,denominator='1'):ExactRational=>Object.freeze({numerator,denominator});
const base=Object.freeze({kind:'budget' as const,daysPerWeek:r('4'),daysPerMonth:r('30'),monthsPerYear:r('12'),lostWorkingDaysPerMonth:r('0'),hoursPerWorkingDay:r('3')});
/** Resolve somente a fixture explicitamente fornecida, sem defaults do produto. */
function value(input:BudgetCalendarInput=base,limits:ExactLimits=budget):BudgetCalendarValues {
  const result=calculateBudgetCalendar(input,limits);
  if(result.status!=='ready')throw Error(JSON.stringify(result));
  expect(Object.isFrozen(result)).toBe(true);expect(Object.isFrozen(result.value)).toBe(true);
  return result.value;
}
describe('Calendário orçamentário mensal identificado e exato',()=>{
  it('vincula4×30/7 ao RCF canônico e preserva360dias estatísticos',()=>{
    const rcf=readFileSync(new URL('../../RCF.md',import.meta.url),'utf8');
    expect(rcf).toMatch(/4\s*×\s*30\/7/);
    expect(rcf).toContain('360 dias orçamentários');
    expect(value()).toEqual({kind:'budget',calendarDaysPerYear:r('360'),scheduledWorkingDaysPerMonth:r('120','7'),effectiveWorkingDaysPerMonth:r('120','7'),effectiveWorkingDaysPerWeek:r('4'),effectiveWorkingDaysPerYear:r('1440','7'),connectedHoursPerMonth:r('360','7'),connectedHoursPerWeek:r('12'),connectedHoursPerYear:r('4320','7')});
  });
  it('deduz perdas expressamente mensais sem arredondar dias ou horas',()=>{
    expect(value({...base,lostWorkingDaysPerMonth:r('2')})).toEqual({kind:'budget',calendarDaysPerYear:r('360'),scheduledWorkingDaysPerMonth:r('120','7'),effectiveWorkingDaysPerMonth:r('106','7'),effectiveWorkingDaysPerWeek:r('53','15'),effectiveWorkingDaysPerYear:r('1272','7'),connectedHoursPerMonth:r('318','7'),connectedHoursPerWeek:r('53','5'),connectedHoursPerYear:r('3816','7')});
  });
  it('permite perdas totais e zero dias sem ocultar o calendário do período',()=>{
    for(const input of [{...base,lostWorkingDaysPerMonth:r('120','7')},{...base,daysPerWeek:r('0')}]){
      const result=value(input);expect(result.calendarDaysPerYear).toEqual(r('360'));
      for(const key of ['effectiveWorkingDaysPerMonth','effectiveWorkingDaysPerWeek','effectiveWorkingDaysPerYear','connectedHoursPerMonth','connectedHoursPerWeek','connectedHoursPerYear'] as const)expect(result[key]).toEqual(r('0'));
    }
  });
  it('recalcula a partir de convenções editadas sem tratar orçamento como datas reais',()=>{
    expect(value({...base,daysPerWeek:r('2'),daysPerMonth:r('14'),monthsPerYear:r('2'),lostWorkingDaysPerMonth:r('1'),hoursPerWorkingDay:r('2')})).toEqual({kind:'budget',calendarDaysPerYear:r('28'),scheduledWorkingDaysPerMonth:r('4'),effectiveWorkingDaysPerMonth:r('3'),effectiveWorkingDaysPerWeek:r('3','2'),effectiveWorkingDaysPerYear:r('6'),connectedHoursPerMonth:r('6'),connectedHoursPerWeek:r('3'),connectedHoursPerYear:r('12')});
  });
  it('rejeita limites físicos e perdas maiores que dias programados sem clamp',()=>{
    for(const override of [{daysPerWeek:r('8')},{daysPerWeek:r('-1')},{daysPerMonth:r('0')},{monthsPerYear:r('0')},{lostWorkingDaysPerMonth:r('-1')},{lostWorkingDaysPerMonth:r('18')},{hoursPerWorkingDay:r('0')},{hoursPerWorkingDay:r('25')}])
      expect(calculateBudgetCalendar({...base,...override},budget)).toMatchObject({status:'unavailable',code:'invalid-calendar'});
  });
  it('não substitui perda ausente por zero nem extrai wrappers como valores',()=>{
    for(const lost of [undefined,{status:'ready',value:r('0')}])
      expect(calculateBudgetCalendar({...base,lostWorkingDaysPerMonth:lost} as unknown as BudgetCalendarInput,budget)).toMatchObject({status:'unavailable',code:'invalid-rational'});
    expect(calculateBudgetCalendar(null as unknown as BudgetCalendarInput,budget)).toMatchObject({status:'unavailable',code:'invalid-calendar'});
  });
  it('mantém calendário civil fora deste núcleo orçamentário',()=>{
    expect(calculateBudgetCalendar({...base,kind:'dated'} as unknown as BudgetCalendarInput,budget)).toMatchObject({status:'unavailable',code:'unsupported-calendar'});
  });
  it('prioriza orçamento inválido e propaga indisponibilidade técnica sem juízo financeiro',()=>{
    expect(calculateBudgetCalendar(null as unknown as BudgetCalendarInput,{maxInputLength:0,maxDigits:64})).toEqual({status:'unavailable',code:'invalid-budget',reason:'Orçamento inválido: maxInputLength não é inteiro positivo seguro.'});
    expect(calculateBudgetCalendar(base,{maxInputLength:256,maxDigits:1})).toMatchObject({status:'unavailable',code:'resource-budget'});
  });
  it('preserva entradas,determinismo,JSON e imutabilidade de todos os racionais',()=>{
    const before=JSON.stringify([base,budget]),first=calculateBudgetCalendar(base,budget);
    expect(first).toEqual(calculateBudgetCalendar(base,budget));expect(JSON.stringify([base,budget])).toBe(before);
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);
    const values=value();for(const field of Object.values(values))if(typeof field==='object')expect(Object.isFrozen(field)).toBe(true);
    expect(Object.isFrozen(calculateBudgetCalendar({...base,hoursPerWorkingDay:r('25')},budget))).toBe(true);
  });
});
