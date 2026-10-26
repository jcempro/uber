/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§7.2, FT-003.24b.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type { ExactRational } from './exact';
import { inspectExactLimits } from './exact-budget';
import type { ExactLimits } from './exact-budget';
import { calculateExactProduct } from './exact-product';
import type { ExactProductFailure } from './exact-product';
import { calculateExactSum } from './exact-sum';
import type { ExactSumFailure } from './exact-sum';
import { compareExactRationals } from './exact-compare';
import type { ExactComparisonFailure } from './exact-compare';

/** Falha original da álgebra ou violação do domínio mensal de disponibilidade. */
export type MonthlyAvailabilityFailure = ExactProductFailure | ExactSumFailure | ExactComparisonFailure | {
  readonly status: 'unavailable';
  readonly code: 'invalid-calendar';
  readonly reason: string;
};
/** Valores equivalentes do mesmo mês, sem promessa de demanda ou resultado econômico. */
export type MonthlyAvailabilityValues = {
  readonly effectiveWorkingDaysPerMonth: ExactRational;
  readonly connectedHoursPerMonth: ExactRational;
};
/** Disponibilidade calculada ou falha explícita, sem transformar ausência em zero. */
export type MonthlyAvailabilityResult = {
  readonly status: 'ready';
  readonly value: MonthlyAvailabilityValues;
} | MonthlyAvailabilityFailure;

/**
 * Deduz perdas mensais explícitas e multiplica dias efetivos pela jornada diária.
 * O chamador deve resolver a competência das perdas; este núcleo não aplica defaults.
 */
export function calculateMonthlyAvailability(
  scheduledWorkingDaysPerMonth: ExactRational,
  lostWorkingDaysPerMonth: ExactRational,
  hoursPerWorkingDay: ExactRational,
  limits: ExactLimits,
): MonthlyAvailabilityResult {
  const policy = inspectExactLimits(limits);
  if (!policy.valid) {
    return Object.freeze({ status: 'unavailable', code: 'invalid-budget', reason: policy.reason });
  }
  const zero: ExactRational = Object.freeze({ numerator: '0', denominator: '1' });
  const maximumHours: ExactRational = Object.freeze({ numerator: '24', denominator: '1' });
  const scheduledLower = compareExactRationals(scheduledWorkingDaysPerMonth, zero, policy.limits);
  if (scheduledLower.status !== 'ready') return scheduledLower;
  const lostLower = compareExactRationals(lostWorkingDaysPerMonth, zero, policy.limits);
  if (lostLower.status !== 'ready') return lostLower;
  const hoursLower = compareExactRationals(hoursPerWorkingDay, zero, policy.limits);
  if (hoursLower.status !== 'ready') return hoursLower;
  const hoursUpper = compareExactRationals(hoursPerWorkingDay, maximumHours, policy.limits);
  if (hoursUpper.status !== 'ready') return hoursUpper;
  const lostUpper = compareExactRationals(lostWorkingDaysPerMonth, scheduledWorkingDaysPerMonth, policy.limits);
  if (lostUpper.status !== 'ready') return lostUpper;
  if (scheduledLower.order < 0 || lostLower.order < 0 || hoursLower.order <= 0 || hoursUpper.order > 0 || lostUpper.order > 0) {
    return Object.freeze({
      status: 'unavailable',
      code: 'invalid-calendar',
      reason: 'Disponibilidade inválida: dias e perdas não negativos, perdas até os dias programados e jornada maior que 0 e até 24 horas.',
    });
  }
  // RCF§7.2: perdas não são clampadas nem presumidas; podem consumir todos os dias.
  const effective = calculateExactSum('subtract', scheduledWorkingDaysPerMonth, lostWorkingDaysPerMonth, policy.limits);
  if (effective.status !== 'ready') return effective;
  const hours = calculateExactProduct('multiply', effective.value, hoursPerWorkingDay, policy.limits);
  if (hours.status !== 'ready') return hours;
  return Object.freeze({
    status: 'ready',
    value: Object.freeze({
      effectiveWorkingDaysPerMonth: effective.value,
      connectedHoursPerMonth: hours.value,
    }),
  });
}
