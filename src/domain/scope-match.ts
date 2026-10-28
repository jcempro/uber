/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§4, FT-003.39.2.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { safeParse } from 'valibot';
import type { ParameterScope } from './model';
import { PARAMETER_SCOPE_STRUCTURE_SCHEMA } from './parameter-scope-schema';

/** IDs declarados pelo chamador; não comprova vínculo cadastral entre cenário e veículo. */
export interface ScopeMatchContext {
  readonly vehicleId?: string | null;
  readonly scenarioId?: string | null;
}

/** Correspondência estrutural/literal não escolhe substituição específica nem admite custos. */
export type ScopeMatchResult =
  | { readonly status: 'scope-matched' | 'outside-scope'; readonly scope: ParameterScope;
      readonly targetId: string | null; readonly precedence: 'not-evaluated' }
  | { readonly status: 'unavailable'; readonly code: 'invalid-scope' | 'missing-context-id' | 'invalid-context-id';
      readonly field: 'scope' | 'vehicleId' | 'scenarioId'; readonly reason: string;
      readonly precedence: 'not-evaluated' };

/** Confere somente o escopo declarado. Fora dele não significa custo zero ou inaplicável. */
export function matchParameterScope(scope: ParameterScope, context?: ScopeMatchContext): ScopeMatchResult {
  const parsed = safeParse(PARAMETER_SCOPE_STRUCTURE_SCHEMA, scope);
  if (!parsed.success) return Object.freeze({ status: 'unavailable', code: 'invalid-scope', field: 'scope',
    reason: 'Escopo inválido; confira a estrutura e o identificador declarado.', precedence: 'not-evaluated' });
  const snapshot = Object.freeze({ ...parsed.output });
  if (snapshot.kind === 'global') return Object.freeze({ status: 'scope-matched', scope: snapshot,
    targetId: null, precedence: 'not-evaluated' });
  const field = snapshot.kind === 'vehicle' ? 'vehicleId' : 'scenarioId';
  const targetId = context?.[field];
  if (targetId === undefined || targetId === null) return Object.freeze({ status: 'unavailable',
    code: 'missing-context-id', field, reason: 'Informe o identificador do contexto correspondente ao escopo.',
    precedence: 'not-evaluated' });
  const target = snapshot.kind === 'vehicle' ? { kind: 'vehicle', vehicleId: targetId }
    : { kind: 'scenario', scenarioId: targetId };
  if (typeof targetId !== 'string' || !safeParse(PARAMETER_SCOPE_STRUCTURE_SCHEMA, target).success)
    return Object.freeze({ status: 'unavailable', code: 'invalid-context-id', field,
      reason: 'O identificador do contexto deve ser textual e não vazio.', precedence: 'not-evaluated' });
  const sourceId = snapshot.kind === 'vehicle' ? snapshot.vehicleId : snapshot.scenarioId;
  return Object.freeze({ status: sourceId === targetId ? 'scope-matched' : 'outside-scope',
    scope: snapshot, targetId, precedence: 'not-evaluated' });
}
