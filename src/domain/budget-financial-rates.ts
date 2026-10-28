/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§7.2/8.2/8.3, FT-003.40.4c.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {inspectExactLimits,type ExactLimits} from './exact-budget';
import type {ExactRational} from './exact';
import type {BudgetPeriod} from './model';
import {convertBudgetCalendarAmount,type BudgetAmountContext,type BudgetAmountResult} from './budget-amount';
import {calculateScheduledBudgetDays} from './budget-days';
import {calculateEffectiveMonthlyWorkingDays,calculateMonthlyAvailability} from './monthly-availability';
import {calculateExactProduct} from './exact-product';
import {compareExactRationals} from './exact-compare';
export interface BudgetFinancialRateContext extends BudgetAmountContext {
  readonly daysPerWeek?:ExactRational|null;
  readonly lostWorkingDaysPerMonth?:ExactRational|null;
  readonly hoursPerWorkingDay?:ExactRational|null;
}
export interface BudgetFinancialRatesInput {
  readonly currency:'BRL';readonly sourceBasis:'budget-calendar-period';readonly amount:ExactRational;
  readonly sourcePeriod:BudgetPeriod;readonly calendar:BudgetFinancialRateContext;
}
export type BudgetRateFailure=Extract<BudgetAmountResult|ReturnType<typeof calculateScheduledBudgetDays>|ReturnType<typeof calculateEffectiveMonthlyWorkingDays>|ReturnType<typeof calculateMonthlyAvailability>|ReturnType<typeof calculateExactProduct>|ReturnType<typeof compareExactRationals>,{status:'unavailable'}>;
type WorkingUnit='BRL/working-day'|'BRL/connected-hour';
type WorkingFailureCode='source-unavailable'|'missing-calendar-input'|'calendar-unavailable'|'non-positive-availability'|'calculation-unavailable';
export type BudgetWorkingRateResult=
  | {readonly status:'ready';readonly unit:WorkingUnit;readonly amountPeriod:'month';readonly sourceAmount:ExactRational;readonly denominator:ExactRational;readonly value:ExactRational}
  | {readonly status:'unavailable';readonly code:WorkingFailureCode;readonly dependency:string|null;readonly reason:string;readonly diagnostic:BudgetRateFailure|null;readonly denominator:ExactRational|null};
export type BudgetFinancialRatesResult=
  | {readonly status:'conditional';readonly currency:'BRL';readonly sourceBasis:'budget-calendar-period';readonly source:Extract<BudgetAmountResult,{status:'ready'}>;readonly financialAssessment:'not-evaluated';readonly perMonth:BudgetAmountResult;readonly perWeek:BudgetAmountResult;readonly perYear:BudgetAmountResult;readonly perWorkingDay:BudgetWorkingRateResult;readonly perConnectedHour:BudgetWorkingRateResult}
  | {readonly status:'unavailable';readonly code:'invalid-budget'|'unsupported-input'|'source-unavailable';readonly reason:string;readonly source:BudgetAmountResult|null};
function unavailableWorking(code:WorkingFailureCode,dependency:string|null,reason:string,diagnostic:BudgetRateFailure|null=null,denominator:ExactRational|null=null):BudgetWorkingRateResult{return Object.freeze({status:'unavailable',code,dependency,reason,diagnostic,denominator});}
/** Denominador já calculado em mês; não aceita zero/negativo e não arredonda lucro assinado. */
function divideMonthlyAmount(amount:ExactRational,denominator:ExactRational,unit:WorkingUnit,limits:ExactLimits):BudgetWorkingRateResult {
  const sign=compareExactRationals(denominator,Object.freeze({numerator:'0',denominator:'1'}),limits);
  if(sign.status!=='ready')return unavailableWorking('calculation-unavailable',null,sign.reason,sign);
  if(sign.order<=0)return unavailableWorking('non-positive-availability',null,'Disponibilidade mensal deve ser positiva para calcular este indicador.',null,denominator);
  const ratio=calculateExactProduct('divide',amount,denominator,limits);
  return ratio.status!=='ready'?unavailableWorking('calculation-unavailable',null,ratio.reason,ratio):Object.freeze({status:'ready',unit,amountPeriod:'month',sourceAmount:amount,denominator,value:ratio.value});
}
/** Conversão estatística condicional; nenhum resultado confirma realização financeira. */
export function calculateBudgetFinancialRates(input:BudgetFinancialRatesInput,limits:ExactLimits):BudgetFinancialRatesResult {
  const limitValidation=inspectExactLimits(limits);
  if(!limitValidation.valid)return Object.freeze({status:'unavailable',code:'invalid-budget',reason:limitValidation.reason,source:null});

  if(typeof input!=='object'||input===null)return Object.freeze({status:'unavailable',code:'unsupported-input',reason:'Input deve ser um objeto não nulo.',source:null});
  if(input.currency!=='BRL')return Object.freeze({status:'unavailable',code:'unsupported-input',reason:'Moeda suportada é apenas BRL.',source:null});
  if(input.sourceBasis!=='budget-calendar-period')return Object.freeze({status:'unavailable',code:'unsupported-input',reason:'Base de origem suportada é apenas budget-calendar-period.',source:null});

  const identity=convertBudgetCalendarAmount(input.amount,input.sourcePeriod,input.sourcePeriod,input.calendar,limitValidation.limits);
  if(identity.status!=='ready')return Object.freeze({status:'unavailable',code:'source-unavailable',reason:identity.reason,source:identity});

  const perMonth=convertBudgetCalendarAmount(identity.value,identity.sourcePeriod,'month',input.calendar,limitValidation.limits);
  const perWeek=convertBudgetCalendarAmount(identity.value,identity.sourcePeriod,'week',input.calendar,limitValidation.limits);
  const perYear=convertBudgetCalendarAmount(identity.value,identity.sourcePeriod,'year',input.calendar,limitValidation.limits);

  const finish=(perWorkingDay:BudgetWorkingRateResult,perConnectedHour:BudgetWorkingRateResult):BudgetFinancialRatesResult => {
    return Object.freeze({
      status:'conditional',
      currency:'BRL',
      sourceBasis:'budget-calendar-period',
      source:identity,
      financialAssessment:'not-evaluated',
      perMonth,
      perWeek,
      perYear,
      perWorkingDay,
      perConnectedHour
    });
  };

  if(perMonth.status!=='ready')return finish(unavailableWorking('source-unavailable','perMonth',perMonth.reason,perMonth),unavailableWorking('source-unavailable','perMonth',perMonth.reason,perMonth));

  const daysPerMonth=input.calendar.daysPerMonth;
  const daysPerWeek=input.calendar.daysPerWeek;
  const lostWorkingDaysPerMonth=input.calendar.lostWorkingDaysPerMonth;

  if(daysPerMonth===undefined||daysPerMonth===null)return finish(unavailableWorking('missing-calendar-input','daysPerMonth','daysPerMonth ausente.',null),unavailableWorking('missing-calendar-input','daysPerMonth','daysPerMonth ausente.',null));
  if(daysPerWeek===undefined||daysPerWeek===null)return finish(unavailableWorking('missing-calendar-input','daysPerWeek','daysPerWeek ausente.',null),unavailableWorking('missing-calendar-input','daysPerWeek','daysPerWeek ausente.',null));
  if(lostWorkingDaysPerMonth===undefined||lostWorkingDaysPerMonth===null)return finish(unavailableWorking('missing-calendar-input','lostWorkingDaysPerMonth','lostWorkingDaysPerMonth ausente.',null),unavailableWorking('missing-calendar-input','lostWorkingDaysPerMonth','lostWorkingDaysPerMonth ausente.',null));

  const scheduled=calculateScheduledBudgetDays(daysPerWeek,daysPerMonth,limitValidation.limits);
  if(scheduled.status!=='ready')return finish(unavailableWorking('calendar-unavailable','scheduledWorkingDaysPerMonth',scheduled.reason,scheduled),unavailableWorking('calendar-unavailable','scheduledWorkingDaysPerMonth',scheduled.reason,scheduled));
  const effective=calculateEffectiveMonthlyWorkingDays(scheduled.value,lostWorkingDaysPerMonth,limitValidation.limits);
  if(effective.status!=='ready')return finish(unavailableWorking('calendar-unavailable','effectiveWorkingDaysPerMonth',effective.reason,effective),unavailableWorking('calendar-unavailable','effectiveWorkingDaysPerMonth',effective.reason,effective));

  const perWorkingDay=divideMonthlyAmount(perMonth.value,effective.value,'BRL/working-day',limitValidation.limits);

  const hoursPerWorkingDay=input.calendar.hoursPerWorkingDay;
  if(hoursPerWorkingDay===undefined||hoursPerWorkingDay===null)return finish(perWorkingDay,unavailableWorking('missing-calendar-input','hoursPerWorkingDay','hoursPerWorkingDay ausente.',null));
  const availability=calculateMonthlyAvailability(scheduled.value,lostWorkingDaysPerMonth,hoursPerWorkingDay,limitValidation.limits);
  if(availability.status!=='ready')return finish(perWorkingDay,unavailableWorking('calendar-unavailable','connectedHoursPerMonth',availability.reason,availability));
  const perConnectedHour=divideMonthlyAmount(perMonth.value,availability.value.connectedHoursPerMonth,'BRL/connected-hour',limitValidation.limits);
  return finish(perWorkingDay,perConnectedHour);
}
