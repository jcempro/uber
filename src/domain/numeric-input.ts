/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8, FT-003.25.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type { NumericInput, NumericConstraints } from './model';
import { inspectExactLimits } from './exact-budget';
import type { ExactLimits } from './exact-budget';
import { parseExactDecimal } from './exact';
import type { ExactDecimalResult, ExactRational } from './exact';

/** Estados com valor, sem promover hipótese a evidência confirmada. */
export type QuantifiedNumericInputStatus = Extract<NumericInput, { readonly value: string }>['status'];
/** Estados com motivo e sem valor numérico, preservados individualmente. */
export type UnresolvedNumericInputStatus = Extract<NumericInput, { readonly reason: string }>['status'];
/** Quantidade exata disponível, diagnóstico original ou dependência não resolvida. */
export type NumericInputResolution =
  | { readonly status: 'ready'; readonly inputStatus: QuantifiedNumericInputStatus; readonly value: ExactRational }
  | Exclude<ExactDecimalResult, { readonly status: 'ready' }>
  | { readonly status: 'unavailable'; readonly code: 'unresolved-input'; readonly inputStatus: UnresolvedNumericInputStatus; readonly reason: string }
  | { readonly status: 'unavailable'; readonly code: 'invalid-input-state'; readonly reason: string };

/** Recusa uma estrutura contraditória sem atribuir valor ou reformular sua evidência. */
function invalidState(): NumericInputResolution {
  return Object.freeze({ status: 'unavailable', code: 'invalid-input-state', reason: 'Estado de entrada numérica inválido ou contraditório.' });
}

/**
 * Converte somente estados quantificados pelo parser comum e conserva sua natureza.
 * ready indica disponibilidade matemática, não completude de custos ou confirmação financeira.
 * IDs, unidade, proveniência e competência continuam no parâmetro canônico do chamador.
 */
export function resolveNumericInput(
  input: NumericInput,
  constraints: NumericConstraints,
  limits: ExactLimits,
): NumericInputResolution {
  const policy = inspectExactLimits(limits);
  if (!policy.valid) {
    return Object.freeze({ status: 'unavailable', code: 'invalid-budget', reason: policy.reason });
  }
  if (input === null || typeof input !== 'object') return invalidState();
  if (input.status === 'provided' || input.status === 'confirmed-zero' || input.status === 'assumed-zero') {
    // Os estados de zero têm contrato literal; provided preserva a gramática decimal existente.
    if (input.status !== 'provided' && input.value !== '0') return invalidState();
    const parsed = parseExactDecimal(input.value, constraints, policy.limits);
    if (parsed.status !== 'ready') return parsed;
    return Object.freeze({ status: 'ready', inputStatus: input.status, value: parsed.value });
  }
  if (input.status === 'absent' || input.status === 'not-provided' || input.status === 'not-applicable' || input.status === 'invalid') {
    if ('value' in input || typeof input.reason !== 'string' || input.reason.trim() === '') return invalidState();
    return Object.freeze({ status: 'unavailable', code: 'unresolved-input', inputStatus: input.status, reason: input.reason });
  }
  return invalidState();
}
