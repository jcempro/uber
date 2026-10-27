/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/7.2, FT-003.28.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type { CalendarConfiguration, WorkSchedule } from './scenario';
import type { NumericParameter } from './model';
import { inspectExactLimits } from './exact-budget';
import type { ExactLimits } from './exact-budget';
import { resolveBudgetLossPeriod } from './budget-loss-period';
import type { BudgetLossPeriodResult } from './budget-loss-period';
import { resolveNumericParameter } from './numeric-parameter';
import type { NumericParameterResolution } from './numeric-parameter';
import { calculateBudgetCalendar } from './budget-calendar';
import type { BudgetCalendarInput, BudgetCalendarValues, BudgetCalendarFailure } from './budget-calendar';

/** Vínculo imutável entre um campo do kernel e o resultado original de seu parâmetro. */
export type CalendarParameterBinding = {
  readonly field: Exclude<keyof BudgetCalendarInput, 'kind'>;
  readonly resolution: NumericParameterResolution;
};
/** Falha de contexto ou dependências, sem perder os diagnósticos dos componentes. */
export type ConfiguredBudgetCalendarFailure = {
  readonly status: 'unavailable';
  readonly code: 'invalid-budget' | 'invalid-configuration' | 'unsupported-calendar' | 'calendar-dependencies' | 'calculation-unavailable';
  readonly reason: string;
  readonly calendarId: string | null;
  readonly scheduleId: string | null;
  readonly bindings: readonly CalendarParameterBinding[];
  readonly lossPeriod: BudgetLossPeriodResult | null;
  readonly calculation: BudgetCalendarFailure | null;
};
/** Calendário matematicamente resolvido sob suas entradas; não certifica finanças ou evidência. */
export type ConfiguredBudgetCalendarResult =
  | { readonly status: 'ready'; readonly calendarId: string; readonly scheduleId: string; readonly value: BudgetCalendarValues; readonly bindings: readonly CalendarParameterBinding[]; readonly lossPeriod: Extract<BudgetLossPeriodResult, { status: 'ready' }> }
  | ConfiguredBudgetCalendarFailure;

const emptyBindings: readonly CalendarParameterBinding[] = Object.freeze([]);
/** Compõe uma falha com componentes originais imutáveis, sem fornecer valores fictícios. */
function unavailable(
  code: ConfiguredBudgetCalendarFailure['code'],
  reason: string,
  calendarId: string | null = null,
  scheduleId: string | null = null,
  bindings: readonly CalendarParameterBinding[] = emptyBindings,
  lossPeriod: BudgetLossPeriodResult | null = null,
  calculation: BudgetCalendarFailure | null = null,
): ConfiguredBudgetCalendarFailure {
  return Object.freeze({ status: 'unavailable', code, reason, calendarId, scheduleId, bindings, lossPeriod, calculation });
}

/**
 * Liga os cinco IDs/unidades ao kernel, conservando estados, identidades e diagnósticos.
 * A coleção já foi selecionada pelo chamador; não escolhe precedência nem valida
 * esquema integral, relógios, datas, proveniência ou versão de estado assíncrono.
 * Outros resultados independentes da disponibilidade devem continuar por suas dependências.
 */
export function resolveConfiguredBudgetCalendar(
  calendar: CalendarConfiguration,
  schedule: WorkSchedule,
  parameters: readonly NumericParameter[],
  limits: ExactLimits,
): ConfiguredBudgetCalendarResult {
  const policy = inspectExactLimits(limits);
  if (!policy.valid) return unavailable('invalid-budget', policy.reason);
  if (calendar === null || typeof calendar !== 'object' || typeof calendar.id !== 'string' || calendar.id.trim() === '' ||
      schedule === null || typeof schedule !== 'object' || typeof schedule.id !== 'string' || schedule.id.trim() === '') {
    return unavailable('invalid-configuration', 'Calendário e jornada precisam de identidades válidas.');
  }
  const lossPeriod = resolveBudgetLossPeriod(calendar);
  if (calendar.kind !== 'budget') {
    return unavailable('unsupported-calendar', 'O calendário civil exige apuração específica por competência.', calendar.id, schedule.id, emptyBindings, lossPeriod);
  }
  const daysPerWeek = resolveNumericParameter(calendar.daysPerWeekParameterId, 'working-day/week', parameters, policy.limits);
  const daysPerMonth = resolveNumericParameter(calendar.daysPerMonthParameterId, 'day/month', parameters, policy.limits);
  const monthsPerYear = resolveNumericParameter(calendar.monthsPerYearParameterId, 'month/year', parameters, policy.limits);
  const lostWorkingDaysPerMonth = resolveNumericParameter(calendar.lostDaysParameterId, 'working-day', parameters, policy.limits);
  const hoursPerWorkingDay = resolveNumericParameter(schedule.durationHoursParameterId, 'h', parameters, policy.limits);
  const bindings: readonly CalendarParameterBinding[] = Object.freeze([
    Object.freeze({ field: 'daysPerWeek' as const, resolution: daysPerWeek }),
    Object.freeze({ field: 'daysPerMonth' as const, resolution: daysPerMonth }),
    Object.freeze({ field: 'monthsPerYear' as const, resolution: monthsPerYear }),
    Object.freeze({ field: 'lostWorkingDaysPerMonth' as const, resolution: lostWorkingDaysPerMonth }),
    Object.freeze({ field: 'hoursPerWorkingDay' as const, resolution: hoursPerWorkingDay }),
  ]);
  // Expor todas as dependências conhecidas, mesmo com período ou quantidade não resolvidos.
  if (lossPeriod.status !== 'ready' || daysPerWeek.status !== 'ready' || daysPerMonth.status !== 'ready' || monthsPerYear.status !== 'ready' || lostWorkingDaysPerMonth.status !== 'ready' || hoursPerWorkingDay.status !== 'ready') {
    return unavailable('calendar-dependencies', 'Há entradas ou período das perdas não resolvidos; consulte os vínculos.', calendar.id, schedule.id, bindings, lossPeriod);
  }
  const calculated = calculateBudgetCalendar({
    kind: 'budget',
    daysPerWeek: daysPerWeek.value,
    daysPerMonth: daysPerMonth.value,
    monthsPerYear: monthsPerYear.value,
    lostWorkingDaysPerMonth: lostWorkingDaysPerMonth.value,
    hoursPerWorkingDay: hoursPerWorkingDay.value,
  }, policy.limits);
  if (calculated.status !== 'ready') {
    return unavailable('calculation-unavailable', calculated.reason, calendar.id, schedule.id, bindings, lossPeriod, calculated);
  }
  return Object.freeze({ status: 'ready', calendarId: calendar.id, scheduleId: schedule.id, value: calculated.value, bindings, lossPeriod });
}
