/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§7.2/8.1, FT-003.29.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import {convertBudgetCalendarAmount} from './budget-amount';
import type {BudgetAmountContext} from './budget-amount';
import type {BudgetPeriod} from './model';
import type {ExactRational,ExactLimits} from './exact';
const budget=Object.freeze({maxInputLength:256,maxDigits:64});
/** Quantia literal independente, sem taxa financeira/default operacional inventado. */
const r=(numerator:string,denominator='1'):ExactRational=>Object.freeze({numerator,denominator});
const context:BudgetAmountContext=Object.freeze({kind:'budget',daysPerMonth:r('30'),monthsPerYear:r('12')});
/** Exige disponibilidade exata e metadados que distinguem calendário de trabalho. */
function value(amount:ExactRational,from:BudgetPeriod,to:BudgetPeriod,ctx:BudgetAmountContext=context,limits:ExactLimits=budget):ExactRational {
  const result=convertBudgetCalendarAmount(amount,from,to,ctx,limits);
  if(result.status!=='ready')throw Error(JSON.stringify(result));
  expect(Object.isFrozen(result)).toBe(true);expect(Object.isFrozen(result.value)).toBe(true);
  expect(result.sourcePeriod).toBe(from);expect(result.targetPeriod).toBe(to);expect(result.basis).toBe('budget-calendar-period');return result.value;
}
describe('Quantias por período de calendário orçamentário',()=>{
  it('segue as três identidades de normalização do RCF canônico sem quatro semanas fictícias',()=>{
    const rcf=readFileSync(new URL('../../RCF.md',import.meta.url),'utf8');
    expect(rcf).toContain('mensal equivalente de anual = anual/12');
    expect(rcf).toContain('semanal equivalente de mensal em mês de 30 dias = mensal×7/30');
    expect(rcf).toContain('anual de mensal = mensal×12');
    expect(value(r('12'),'year','month')).toEqual(r('1'));
    expect(value(r('30'),'month','week')).toEqual(r('7'));
    expect(value(r('1'),'month','year')).toEqual(r('12'));
    expect(value(r('1'),'month','week')).toEqual(r('7','30'));
  });
  it('cobre as16rotas por um oráculo independente de dias canônicos por período',()=>{
    // RCF§7.2: semana7,mês30,ano360; uma unidade/dia implica estes totais.
    const spans={day:'1',week:'7',month:'30',year:'360'};
    const periods=['day','week','month','year'] as const;
    for(const from of periods)for(const to of periods)expect(value(r(spans[from]),from,to)).toEqual(r(spans[to]));
  });
  it('não exige dados cancelados da razão nem disponibilidade de trabalho',()=>{
    const missing:BudgetAmountContext={kind:'budget'};
    for(const period of ['day','week','month','year'] as const)expect(value(r('2','4'),period,period,missing)).toEqual(r('1','2'));
    expect(value(r('1'),'day','week',missing)).toEqual(r('7'));
    expect(value(r('7'),'week','day',missing)).toEqual(r('1'));
    expect(value(r('12'),'year','month',{kind:'budget',monthsPerYear:r('12')})).toEqual(r('1'));
    expect(value(r('7'),'week','month',{kind:'budget',daysPerMonth:r('30')})).toEqual(r('30'));
  });
  it('usa convenções editadas explicitamente,sem retornar aos padrões30/12',()=>{
    const edited:BudgetAmountContext={kind:'budget',daysPerMonth:r('31'),monthsPerYear:r('10')};
    expect(value(r('31'),'month','day',edited)).toEqual(r('1'));
    expect(value(r('31'),'month','week',edited)).toEqual(r('7'));
    expect(value(r('10'),'year','month',edited)).toEqual(r('1'));
    expect(value(r('1'),'month','year',edited)).toEqual(r('10'));
  });
  it('recusa somente dependências necessárias ausentes ou inválidas,e separa civil/período desconhecido',()=>{
    expect(convertBudgetCalendarAmount(r('1'),'month','week',{kind:'budget'},budget)).toMatchObject({status:'unavailable',code:'missing-calendar-input',dependency:'daysPerMonth'});
    expect(convertBudgetCalendarAmount(r('1'),'year','month',{kind:'budget'},budget)).toMatchObject({status:'unavailable',code:'missing-calendar-input',dependency:'monthsPerYear'});
    expect(convertBudgetCalendarAmount(r('1'),'month','week',{kind:'budget',daysPerMonth:r('0')},budget)).toMatchObject({status:'unavailable',code:'invalid-calendar',dependency:'daysPerMonth'});
    expect(convertBudgetCalendarAmount(r('1'),'year','month',{kind:'budget',monthsPerYear:r('-1')},budget)).toMatchObject({status:'unavailable',code:'invalid-calendar',dependency:'monthsPerYear'});
    expect(convertBudgetCalendarAmount(r('1'),'month','week',{kind:'dated'} as unknown as BudgetAmountContext,budget)).toMatchObject({status:'unavailable',code:'unsupported-calendar'});
    expect(convertBudgetCalendarAmount(r('1'),'fortnight' as unknown as BudgetPeriod,'week',context,budget)).toMatchObject({status:'unavailable',code:'invalid-period'});
    expect(convertBudgetCalendarAmount(r('1e3'),'month','month',context,budget)).toMatchObject({status:'unavailable',code:'invalid-rational'});
  });
  it('preserva perdas assinadas,zero e razões recorrentes sem arredondamento',()=>{
    expect(value(r('-30'),'month','week')).toEqual(r('-7'));
    expect(value(r('0'),'year','month')).toEqual(r('0'));
    expect(value(r('1'),'year','month')).toEqual(r('1','12'));
    expect(value(r('7','30'),'week','month')).toEqual(r('1'));
  });
  it('prioriza orçamento e propaga recursos insuficientes sem inventar resultado financeiro',()=>{
    expect(convertBudgetCalendarAmount(r('1'),'month','week',null as unknown as BudgetAmountContext,{maxInputLength:0,maxDigits:64})).toMatchObject({status:'unavailable',code:'invalid-budget',reason:'Orçamento inválido: maxInputLength não é inteiro positivo seguro.'});
    expect(convertBudgetCalendarAmount(r('9'),'month','year',{kind:'budget',monthsPerYear:r('9')},{maxInputLength:256,maxDigits:1})).toMatchObject({status:'unavailable',code:'resource-budget'});
    expect(value(r('9'),'month','year',{kind:'budget',monthsPerYear:r('9')},{maxInputLength:256,maxDigits:2})).toEqual(r('81'));
  });
  it('preserva entradas,JSON,determinismo e imutabilidade sem congelar o chamador',()=>{
    const amount={numerator:'-30',denominator:'1'},ctx:BudgetAmountContext={kind:'budget',daysPerMonth:r('30'),monthsPerYear:r('12')},before=JSON.stringify([amount,ctx,budget]);
    const first=convertBudgetCalendarAmount(amount,'month','week',ctx,budget);
    expect(first).toEqual(convertBudgetCalendarAmount(amount,'month','week',ctx,budget));
    expect(JSON.stringify([amount,ctx,budget])).toBe(before);expect(Object.isFrozen(amount)).toBe(false);expect(Object.isFrozen(ctx)).toBe(false);
    expect(Object.isFrozen(first)).toBe(true);expect(JSON.parse(JSON.stringify(first))).toEqual(first);
    expect(Object.isFrozen(convertBudgetCalendarAmount(r('1'),'month','week',{kind:'budget'},budget))).toBe(true);
  });
});
