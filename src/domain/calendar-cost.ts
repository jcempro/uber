/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.1, FT-003.30.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type { CostItem, NumericParameter, BudgetPeriod } from './model';
import type { ExactRational } from './exact';
import { inspectExactLimits } from './exact-budget';
import type { ExactLimits } from './exact-budget';
import { resolveNumericParameter } from './numeric-parameter';
import type { NumericParameterResolution } from './numeric-parameter';
import { compareExactRationals } from './exact-compare';
import { convertBudgetCalendarAmount } from './budget-amount';
import type { BudgetAmountContext, BudgetAmountResult } from './budget-amount';

/** Apenas quantificação; incidência, vigência, reconhecimento e reconciliação seguem pendentes. */
export type CalendarCostAmountResult =
  | { readonly status: 'ready'; readonly costId: string; readonly value: ExactRational; readonly sourcePeriod: BudgetPeriod; readonly targetPeriod: BudgetPeriod; readonly parameter: Extract<NumericParameterResolution, { status: 'ready' }>; readonly ledgerAdmission: 'not-evaluated' }
  | { readonly status: 'excluded'; readonly costId: string; readonly reason: 'disabled'; readonly ledgerAdmission: 'not-evaluated' }
  | { readonly status: 'unavailable'; readonly costId: string | null; readonly code: 'invalid-budget' | 'invalid-cost' | 'unsupported-cost-basis' | 'amount-unavailable' | 'calculation-unavailable'; readonly reason: string; readonly parameter: NumericParameterResolution | null; readonly calculation: Exclude<BudgetAmountResult, { status: 'ready' }> | null };

/** Guarda o diagnóstico original sem convertê-lo em custo zero ou custo admitido. */
function unavailable(
  code: Extract<CalendarCostAmountResult, { status: 'unavailable' }>['code'],
  reason: string,
  costId: string | null = null,
  parameter: NumericParameterResolution | null = null,
  calculation: Exclude<BudgetAmountResult, { status: 'ready' }> | null = null,
): CalendarCostAmountResult {
  return Object.freeze({ status: 'unavailable', costId, code, reason, parameter, calculation });
}

/**
 * Quantifica um item por calendário e período, sem admiti-lo ao demonstrativo.
 * BRL é quantia na incidência explícita do item; BRL/period explicita a mesma base.
 * Outras moedas ou período divergente não são convertidos implicitamente.
 * Coleção já selecionada pelo chamador; não escolhe precedência, vigência ou reconciliação.
 */
export function resolveCalendarCostAmount(
  cost: CostItem,
  parameters: readonly NumericParameter[],
  targetPeriod: BudgetPeriod,
  context: BudgetAmountContext,
  limits: ExactLimits,
): CalendarCostAmountResult {
  const policy = inspectExactLimits(limits);
  if (!policy.valid) return unavailable('invalid-budget', policy.reason);
  if (cost === null || typeof cost !== 'object' || typeof cost.id !== 'string' || cost.id.trim() === '' ||
      typeof cost.enabled !== 'boolean') {
    return unavailable('invalid-cost', 'Custo inválido: identidade e estado de ativação são obrigatórios.');
  }
  if (!cost.enabled) return Object.freeze({ status: 'excluded', costId: cost.id, reason: 'disabled', ledgerAdmission: 'not-evaluated' });
  if (cost.basis === null || typeof cost.basis !== 'object' || cost.basis.kind !== 'calendar') {
    return unavailable('unsupported-cost-basis', 'Este quantificador exige incidência por calendário; uso, evento pontual e regra customizada precisam de tratamento próprio.', cost.id);
  }
  const sourcePeriod = cost.basis.period;
  let parameter = resolveNumericParameter(cost.amountParameterId, 'BRL/' + sourcePeriod, parameters, policy.limits);
  // Compatibilidade dimensional declarada: a incidência do item qualifica uma quantia BRL.
  if (parameter.status === 'unavailable' && parameter.code === 'incompatible-unit' && parameter.unit === 'BRL') {
    parameter = resolveNumericParameter(cost.amountParameterId, 'BRL', parameters, policy.limits);
  }
  if (parameter.status !== 'ready') {
    return unavailable('amount-unavailable', 'A quantia do custo não está disponível; consulte o parâmetro original.', cost.id, parameter);
  }
  const zero: ExactRational = Object.freeze({ numerator: '0', denominator: '1' });
  const nonNegative = compareExactRationals(parameter.value, zero, policy.limits);
  if (nonNegative.status !== 'ready') return unavailable('calculation-unavailable', nonNegative.reason, cost.id, parameter, nonNegative);
  if (nonNegative.order < 0) return unavailable('invalid-cost', 'A quantia de um custo deve ser não negativa.', cost.id, parameter);
  const normalized = convertBudgetCalendarAmount(parameter.value, sourcePeriod, targetPeriod, context, policy.limits);
  if (normalized.status !== 'ready') return unavailable('calculation-unavailable', normalized.reason, cost.id, parameter, normalized);
  return Object.freeze({
    status: 'ready',
    costId: cost.id,
    value: normalized.value,
    sourcePeriod: normalized.sourcePeriod,
    targetPeriod: normalized.targetPeriod,
    parameter,
    ledgerAdmission: 'not-evaluated',
  });
}
