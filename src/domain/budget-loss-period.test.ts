/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/7.2, FT-003.27.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {describe,expect,it} from 'vitest';
import {resolveBudgetLossPeriod} from './budget-loss-period';
import {INITIAL_CALENDARS} from './defaults';
import type {CalendarConfiguration} from './scenario';
/** Seleciona o cadastro real sem reconstruir sua proveniência ou seus parâmetros. */
function initialBudget():Extract<CalendarConfiguration,{kind:'budget'}> {
  const calendar=INITIAL_CALENDARS.find(c=>c.kind==='budget');
  if(!calendar||calendar.kind!=='budget')throw Error('Calendário canônico ausente');return calendar;
}
describe('Período declarado dos dias perdidos',()=>{
  it('conserva compatibilidade do registro legado e não presume mês',()=>{
    const calendar=initialBudget();
    expect(calendar).not.toHaveProperty('lostDaysPeriod');
    expect(resolveBudgetLossPeriod(calendar)).toMatchObject({status:'unavailable',calendarId:calendar.id,code:'unresolved-loss-period'});
  });
  it('aceita apenas declaração mensal explícita sem reescrever a identidade',()=>{
    const calendar={...initialBudget(),id:' calendário ',lostDaysPeriod:'month' as const};
    expect(resolveBudgetLossPeriod(calendar)).toEqual({status:'ready',calendarId:' calendário ',period:'month'});
  });
  it('não normaliza silenciosamente perdas de dia,semana ou ano',()=>{
    for(const lostDaysPeriod of ['day','week','year'] as const)
      expect(resolveBudgetLossPeriod({...initialBudget(),lostDaysPeriod})).toMatchObject({status:'unavailable',code:'unsupported-loss-period'});
  });
  it('mantém calendário civil e configuração inválida fora desta interpretação',()=>{
    const base=initialBudget();
    const dated:CalendarConfiguration={id:'civil',name:'Civil',kind:'dated',provenance:base.provenance,startDate:'2026-10-01',endDate:'2026-10-31',workingWeekdays:[1],excludedDates:[]};
    expect(resolveBudgetLossPeriod(dated)).toMatchObject({status:'unavailable',code:'unsupported-calendar'});
    for(const bad of [null,{...base,id:'   '}])
      expect(resolveBudgetLossPeriod(bad as unknown as CalendarConfiguration)).toMatchObject({status:'unavailable',code:'invalid-calendar'});
  });
  it('preserva cadastros,JSON,determinismo e imutabilidade sem congelar o chamador',()=>{
    const calendar={...initialBudget(),lostDaysPeriod:'month' as const},before=JSON.stringify([calendar,INITIAL_CALENDARS]);
    const first=resolveBudgetLossPeriod(calendar);
    expect(first).toEqual(resolveBudgetLossPeriod(calendar));expect(Object.isFrozen(first)).toBe(true);
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);expect(Object.isFrozen(calendar)).toBe(false);
    expect(JSON.stringify([calendar,INITIAL_CALENDARS])).toBe(before);
    expect(Object.isFrozen(resolveBudgetLossPeriod(initialBudget()))).toBe(true);
  });
});
