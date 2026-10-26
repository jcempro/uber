/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§7.2/8.1, FT-003.24c.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type { ExactRational } from './exact';
import { inspectExactLimits } from './exact-budget';
import type { ExactLimits } from './exact-budget';
import { calculateExactProduct } from './exact-product';
import { compareExactRationals } from './exact-compare';
import { calculateScheduledBudgetDays } from './budget-days';
import { calculateMonthlyAvailability } from './monthly-availability';
import type { MonthlyAvailabilityFailure } from './monthly-availability';

/** Entradas resolvidas para um mês orçamentário; perdas mensais são obrigatórias. */
export type BudgetCalendarInput = {
  readonly kind: 'budget';
  readonly daysPerWeek: ExactRational;
  readonly daysPerMonth: ExactRational;
  readonly monthsPerYear: ExactRational;
  readonly lostWorkingDaysPerMonth: ExactRational;
  readonly hoursPerWorkingDay: ExactRational;
};
/** Equivalentes da mesma convenção estatística, sem alegação de demanda ou lucro. */
export type BudgetCalendarValues = {
  readonly kind: 'budget';
  readonly calendarDaysPerYear: ExactRational;
  readonly scheduledWorkingDaysPerMonth: ExactRational;
  readonly effectiveWorkingDaysPerMonth: ExactRational;
  readonly effectiveWorkingDaysPerWeek: ExactRational;
  readonly effectiveWorkingDaysPerYear: ExactRational;
  readonly connectedHoursPerMonth: ExactRational;
  readonly connectedHoursPerWeek: ExactRational;
  readonly connectedHoursPerYear: ExactRational;
};
/** Falhas preservadas dos helpers ou tentativa de usar calendário civil neste núcleo. */
export type BudgetCalendarFailure = MonthlyAvailabilityFailure | {
  readonly status: 'unavailable';
  readonly code: 'unsupported-calendar';
  readonly reason: string;
};
/** Calendário composto imutável, ou indisponibilidade explícita. */
export type BudgetCalendarResult = {
  readonly status: 'ready';
  readonly value: BudgetCalendarValues;
} | BudgetCalendarFailure;

/**
 * Compõe o mês estatístico e seus equivalentes semanais e anuais sem arredondar.
 * Não resolve estados/proveniência de parâmetros, datas reais ou dias restantes.
 */
export function calculateBudgetCalendar(input: BudgetCalendarInput, limits: ExactLimits): BudgetCalendarResult {
  const policy = inspectExactLimits(limits);
  if (!policy.valid) {
    return Object.freeze({ status: 'unavailable', code: 'invalid-budget', reason: policy.reason });
  }
  if (input === null || typeof input !== 'object') {
    return Object.freeze({ status: 'unavailable', code: 'invalid-calendar', reason: 'Calendário inválido: entradas ausentes ou não objeto.' });
  }
  if (input.kind !== 'budget') {
    return Object.freeze({ status: 'unavailable', code: 'unsupported-calendar', reason: 'Esta operação exige calendário orçamentário; datas reais requerem sua própria competência.' });
  }
  const zero: ExactRational = Object.freeze({ numerator: '0', denominator: '1' });
  const seven: ExactRational = Object.freeze({ numerator: '7', denominator: '1' });
  const months = compareExactRationals(input.monthsPerYear, zero, policy.limits);
  if (months.status !== 'ready') return months;
  if (months.order <= 0) {
    return Object.freeze({ status: 'unavailable', code: 'invalid-calendar', reason: 'Calendário inválido: meses do ano orçamentário devem ser positivos.' });
  }
  const scheduled = calculateScheduledBudgetDays(input.daysPerWeek, input.daysPerMonth, policy.limits);
  if (scheduled.status !== 'ready') return scheduled;
  const available = calculateMonthlyAvailability(scheduled.value, input.lostWorkingDaysPerMonth, input.hoursPerWorkingDay, policy.limits);
  if (available.status !== 'ready') return available;
  // RCF§7.2: sete dias por semana; ano composto destes meses, sem calendário civil.
  // O fator semanal é uma razão exata reutilizada, não uma segunda fonte de configuração.
  const weeklyFactor = calculateExactProduct('divide', seven, input.daysPerMonth, policy.limits);
  if (weeklyFactor.status !== 'ready') return weeklyFactor;
  const calendarYear = calculateExactProduct('multiply', input.daysPerMonth, input.monthsPerYear, policy.limits);
  if (calendarYear.status !== 'ready') return calendarYear;
  const effectiveWeek = calculateExactProduct('multiply', available.value.effectiveWorkingDaysPerMonth, weeklyFactor.value, policy.limits);
  if (effectiveWeek.status !== 'ready') return effectiveWeek;
  const effectiveYear = calculateExactProduct('multiply', available.value.effectiveWorkingDaysPerMonth, input.monthsPerYear, policy.limits);
  if (effectiveYear.status !== 'ready') return effectiveYear;
  const hoursWeek = calculateExactProduct('multiply', available.value.connectedHoursPerMonth, weeklyFactor.value, policy.limits);
  if (hoursWeek.status !== 'ready') return hoursWeek;
  const hoursYear = calculateExactProduct('multiply', available.value.connectedHoursPerMonth, input.monthsPerYear, policy.limits);
  if (hoursYear.status !== 'ready') return hoursYear;
  return Object.freeze({
    status: 'ready',
    value: Object.freeze({
      kind: 'budget',
      calendarDaysPerYear: calendarYear.value,
      scheduledWorkingDaysPerMonth: scheduled.value,
      effectiveWorkingDaysPerMonth: available.value.effectiveWorkingDaysPerMonth,
      effectiveWorkingDaysPerWeek: effectiveWeek.value,
      effectiveWorkingDaysPerYear: effectiveYear.value,
      connectedHoursPerMonth: available.value.connectedHoursPerMonth,
      connectedHoursPerWeek: hoursWeek.value,
      connectedHoursPerYear: hoursYear.value,
    }),
  });
}
