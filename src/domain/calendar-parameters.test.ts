/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/7.2, FT-003.28.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {describe,expect,it} from 'vitest';
import {resolveConfiguredBudgetCalendar} from './calendar-parameters';
import {INITIAL_CALENDARS,INITIAL_WORK_SCHEDULES,INITIAL_TIME_PARAMETERS} from './defaults';
import type {CalendarConfiguration,WorkSchedule} from './scenario';
import type {NumericInput,NumericParameter} from './model';
const budget=Object.freeze({maxInputLength:256,maxDigits:64});
/** Usa as referências reais, sem reconstruir os cadastros ou suas unidades. */
function initial() {
  const calendar=INITIAL_CALENDARS.find(c=>c.kind==='budget'),schedule=INITIAL_WORK_SCHEDULES[0];
  if(!calendar||calendar.kind!=='budget'||!schedule)throw Error('Cadastros ausentes');return{calendar,schedule};
}
/** Hipótese declarada na fixture; não modifica o parâmetro real que continua não informado. */
function withLoss(input:NumericInput):readonly NumericParameter[] {
  return INITIAL_TIME_PARAMETERS.map(p=>p.id==='time-lost-days'?{...p,input,provenance:{...p.provenance,kind:'illustrative-hypothesis' as const,source:'fixture mensal explícita',reliability:'conditional' as const}}:p);
}
describe('Ligação dos cadastros ao calendário orçamentário',()=>{
  it('mantém o cadastro inicial incompleto e mostra os dois motivos sem presumir zero',()=>{
    const{calendar,schedule}=initial();
    const result=resolveConfiguredBudgetCalendar(calendar,schedule,INITIAL_TIME_PARAMETERS,budget);
    if(result.status!=='unavailable')throw Error('Expected incomplete');
    expect(result.code).toBe('calendar-dependencies');expect(result.bindings).toHaveLength(5);
    expect(result.lossPeriod).toMatchObject({status:'unavailable',code:'unresolved-loss-period'});
    expect(result.bindings.find(b=>b.field==='lostWorkingDaysPerMonth')?.resolution).toMatchObject({status:'unavailable',code:'unresolved-input',inputStatus:'not-provided',parameterId:'time-lost-days'});
    expect(result).not.toHaveProperty('value');
  });
  it('liga mês explicitamente declarado e conserva hipótesezero sem elevá-la a confirmação',()=>{
    const{calendar,schedule}=initial();
    const result=resolveConfiguredBudgetCalendar({...calendar,lostDaysPeriod:'month'},schedule,withLoss({status:'assumed-zero',value:'0'}),budget);
    if(result.status!=='ready')throw Error(JSON.stringify(result));
    expect(result.value.scheduledWorkingDaysPerMonth).toEqual({numerator:'120',denominator:'7'});
    expect(result.value.connectedHoursPerMonth).toEqual({numerator:'360',denominator:'7'});
    expect(result.value.calendarDaysPerYear).toEqual({numerator:'360',denominator:'1'});
    expect(result.lossPeriod).toEqual({status:'ready',calendarId:calendar.id,period:'month'});
    expect(result.bindings.find(b=>b.field==='lostWorkingDaysPerMonth')?.resolution).toMatchObject({status:'ready',inputStatus:'assumed-zero'});
    expect(result.calendarId).toBe(calendar.id);expect(result.scheduleId).toBe(schedule.id);
  });
  it('usa o ID da jornada selecionada e perdas fornecidas em vez de fixar3horas',()=>{
    const{calendar}=initial(),schedule=INITIAL_WORK_SCHEDULES[1];
    if(!schedule)throw Error('Jornada média ausente');
    const result=resolveConfiguredBudgetCalendar({...calendar,lostDaysPeriod:'month'},schedule,withLoss({status:'provided',value:'2'}),budget);
    if(result.status!=='ready')throw Error(JSON.stringify(result));
    expect(result.value.effectiveWorkingDaysPerMonth).toEqual({numerator:'106',denominator:'7'});
    expect(result.value.connectedHoursPerMonth).toEqual({numerator:'636',denominator:'7'});
    expect(result.bindings.find(b=>b.field==='hoursPerWorkingDay')?.resolution).toMatchObject({status:'ready',parameterId:schedule.durationHoursParameterId,unit:'h'});
  });
  it('preserva diagnósticos por campo para ID ausente,duplicado e unidade incorreta',()=>{
    const{calendar,schedule}=initial(),configured={...calendar,lostDaysPeriod:'month' as const},params=withLoss({status:'provided',value:'0'});
    const hours=params.find(p=>p.id===schedule.durationHoursParameterId);if(!hours)throw Error('Parâmetro ausente');
    const cases=[
      {items:params.filter(p=>p.id!==calendar.daysPerMonthParameterId),field:'daysPerMonth',code:'missing-parameter'},
      {items:[...params,hours],field:'hoursPerWorkingDay',code:'ambiguous-parameter'},
      {items:params.map(p=>p.id===calendar.daysPerMonthParameterId?{...p,unit:'h'}:p),field:'daysPerMonth',code:'incompatible-unit'},
    ];
    for(const c of cases){
      const result=resolveConfiguredBudgetCalendar(configured,schedule,c.items,budget);
      if(result.status!=='unavailable')throw Error('Expected unavailable');
      expect(result.code).toBe('calendar-dependencies');
      expect(result.bindings.find(b=>b.field===c.field)?.resolution).toMatchObject({status:'unavailable',code:c.code});
      expect(result).not.toHaveProperty('value');
    }
  });
  it('separa períodos não suportados,civil,configuração inválida e orçamento prioritário',()=>{
    const{calendar,schedule}=initial();
    const wrong=resolveConfiguredBudgetCalendar({...calendar,lostDaysPeriod:'year'},schedule,withLoss({status:'provided',value:'0'}),budget);
    expect(wrong).toMatchObject({status:'unavailable',code:'calendar-dependencies',lossPeriod:{status:'unavailable',code:'unsupported-loss-period'}});
    const dated:CalendarConfiguration={id:'civil',kind:'dated',name:'Civil',provenance:calendar.provenance,startDate:'2026-10-01',endDate:'2026-10-31',workingWeekdays:[1],excludedDates:[]};
    expect(resolveConfiguredBudgetCalendar(dated,schedule,INITIAL_TIME_PARAMETERS,budget)).toMatchObject({status:'unavailable',code:'unsupported-calendar'});
    expect(resolveConfiguredBudgetCalendar(calendar,null as unknown as WorkSchedule,INITIAL_TIME_PARAMETERS,budget)).toMatchObject({status:'unavailable',code:'invalid-configuration'});
    expect(resolveConfiguredBudgetCalendar(null as unknown as CalendarConfiguration,null as unknown as WorkSchedule,INITIAL_TIME_PARAMETERS,{maxInputLength:0,maxDigits:64})).toMatchObject({status:'unavailable',code:'invalid-budget',reason:'Orçamento inválido: maxInputLength não é inteiro positivo seguro.'});
  });
  it('preserva o diagnóstico original na camada que rejeita cada domínio',()=>{
    const{calendar,schedule}=initial(),configured={...calendar,lostDaysPeriod:'month' as const};
    // Perdas18 respeitam o campo não negativo, mas excedem os120/7 dias do contexto.
    expect(resolveConfiguredBudgetCalendar(configured,schedule,withLoss({status:'provided',value:'18'}),budget)).toMatchObject({status:'unavailable',code:'calculation-unavailable',calculation:{status:'unavailable',code:'invalid-calendar'}});
    // O cadastro canônico já limita a jornada a24h;25 é rejeitado antes do kernel.
    const params=withLoss({status:'provided',value:'0'}).map(p=>p.id===schedule.durationHoursParameterId?{...p,input:{status:'provided' as const,value:'25'}}:p);
    const result=resolveConfiguredBudgetCalendar(configured,schedule,params,budget);
    if(result.status!=='unavailable')throw Error('Expected unavailable');
    expect(result.code).toBe('calendar-dependencies');
    expect(result.bindings.find(b=>b.field==='hoursPerWorkingDay')?.resolution).toMatchObject({status:'invalid',parameterId:schedule.durationHoursParameterId,unit:'h',validation:{valid:false,code:'out-of-range'}});
    expect(result.calculation).toBeNull();expect(result).not.toHaveProperty('value');
  });
  it('não transforma recursos insuficientes em cenário inviável nem perde os diagnósticos',()=>{
    const{calendar,schedule}=initial();
    const result=resolveConfiguredBudgetCalendar({...calendar,lostDaysPeriod:'month'},schedule,withLoss({status:'provided',value:'0'}),{maxInputLength:256,maxDigits:1});
    if(result.status!=='unavailable')throw Error('Expected unavailable');
    expect(result.code).toBe('calendar-dependencies');
    expect(result.bindings.find(b=>b.field==='daysPerMonth')?.resolution).toMatchObject({status:'unavailable',code:'resource-budget'});
  });
  it('preserva argumentos,JSON,determinismo e todos os vínculos imutáveis',()=>{
    const{calendar,schedule}=initial(),configured={...calendar,lostDaysPeriod:'month' as const},params=withLoss({status:'assumed-zero',value:'0'});
    const before=JSON.stringify([configured,schedule,params,budget]);
    const first=resolveConfiguredBudgetCalendar(configured,schedule,params,budget);
    expect(first).toEqual(resolveConfiguredBudgetCalendar(configured,schedule,params,budget));expect(JSON.stringify([configured,schedule,params,budget])).toBe(before);
    expect(Object.isFrozen(configured)).toBe(false);expect(Object.isFrozen(first)).toBe(true);expect(Object.isFrozen(first.bindings)).toBe(true);
    for(const binding of first.bindings){expect(Object.isFrozen(binding)).toBe(true);expect(Object.isFrozen(binding.resolution)).toBe(true);}
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);
    if(first.status!=='ready')throw Error('Expected ready');expect(Object.isFrozen(first.value)).toBe(true);expect(Object.isFrozen(first.lossPeriod)).toBe(true);
  });
});
