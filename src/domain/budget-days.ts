/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§7.2, FT-003.24a.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type { ExactRational } from './exact';
import type { ExactLimits } from './exact-budget';
import { inspectExactLimits } from './exact-budget';
import { calculateExactProduct } from './exact-product';
import type { ExactProductFailure } from './exact-product';
import { compareExactRationals } from './exact-compare';
import type { ExactComparisonFailure } from './exact-compare';

/** Falha técnica preservada ou violação do domínio do calendário orçamentário. */
export type BudgetDaysFailure = ExactProductFailure | ExactComparisonFailure | {
  readonly status: 'unavailable';
  readonly code: 'invalid-calendar';
  readonly reason: string;
};
/** Dias equivalentes programados por mês; não representa disponibilidade efetiva ou receita. */
export type BudgetDaysResult = {
  readonly status: 'ready';
  readonly value: ExactRational;
} | BudgetDaysFailure;

/**
 * Calcula dias/semana × dias/mês ÷7, mantendo a convenção orçamentária explícita.
 * Não desconta ausências, não escolhe datas e não presume perdas zero.
 */
export function calculateScheduledBudgetDays(
  daysPerWeek: ExactRational,
  daysPerMonth: ExactRational,
  limits: ExactLimits,
): BudgetDaysResult {
  const policy = inspectExactLimits(limits);
  if (!policy.valid) {
    return Object.freeze({ status: 'unavailable', code: 'invalid-budget', reason: policy.reason });
  }
  const zero: ExactRational = Object.freeze({ numerator: '0', denominator: '1' });
  const seven: ExactRational = Object.freeze({ numerator: '7', denominator: '1' });
  const weeklyLower = compareExactRationals(daysPerWeek, zero, policy.limits);
  if (weeklyLower.status !== 'ready') return weeklyLower;
  const weeklyUpper = compareExactRationals(daysPerWeek, seven, policy.limits);
  if (weeklyUpper.status !== 'ready') return weeklyUpper;
  const monthlyLower = compareExactRationals(daysPerMonth, zero, policy.limits);
  if (monthlyLower.status !== 'ready') return monthlyLower;
  if (weeklyLower.order < 0 || weeklyUpper.order > 0 || monthlyLower.order <= 0) {
    return Object.freeze({
      status: 'unavailable',
      code: 'invalid-calendar',
      reason: 'Calendário inválido: dias por semana devem estar entre 0 e 7 e dias por mês devem ser positivos.',
    });
  }
  // RCF§7.2: a razão recorrente permanece exata, sem reduzir o mês a quatro semanas.
  const product = calculateExactProduct('multiply', daysPerWeek, daysPerMonth, policy.limits);
  if (product.status !== 'ready') return product;
  return calculateExactProduct('divide', product.value, seven, policy.limits);
}
