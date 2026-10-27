/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8, FT-003.26.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type { NumericParameter } from './model';
import { inspectExactLimits } from './exact-budget';
import type { ExactLimits } from './exact-budget';
import { resolveNumericInput } from './numeric-input';
import type { NumericInputResolution } from './numeric-input';

/** Falha de política, referência, identidade ou unidade contratada. */
export type NumericParameterLookupFailure = {
  readonly status: 'unavailable';
  readonly code: 'invalid-budget' | 'invalid-reference' | 'missing-parameter' | 'ambiguous-parameter' | 'incompatible-unit';
  readonly parameterId: string | null;
  readonly unit: string | null;
  readonly reason: string;
};
/** Resolução matemática mantém seu status original e ganha identidade/unidade canônicas. */
export type NumericParameterResolution =
  | (NumericInputResolution & { readonly parameterId: string; readonly unit: string })
  | NumericParameterLookupFailure;

/** Valida a coleção em runtime sem promover seus elementos a any. */
function isParameterArray(value: unknown): boolean {
  return Array.isArray(value);
}
/** Produz diagnóstico imutável sem escolher silenciosamente um candidato. */
function failure(
  code: NumericParameterLookupFailure['code'],
  parameterId: string | null,
  unit: string | null,
  reason: string,
): NumericParameterLookupFailure {
  return Object.freeze({ status: 'unavailable', code, parameterId, unit, reason });
}

/**
 * Resolve um ID exato na coleção já selecionada pelo chamador para seu contexto.
 * Não valida o esquema integral, não escolhe precedência e não certifica proveniência.
 * A unidade deve corresponder ao contrato declarado; nenhuma conversão é presumida.
 */
export function resolveNumericParameter(
  parameterId: string,
  expectedUnit: string,
  parameters: readonly NumericParameter[],
  limits: ExactLimits,
): NumericParameterResolution {
  const policy = inspectExactLimits(limits);
  if (!policy.valid) return failure('invalid-budget', null, null, policy.reason);
  if (typeof parameterId !== 'string' || parameterId.trim() === '' ||
      typeof expectedUnit !== 'string' || expectedUnit.trim() === '' || !isParameterArray(parameters)) {
    return failure('invalid-reference', null, null, 'Referência inválida: ID e unidade não vazios e coleção de parâmetros são obrigatórios.');
  }
  // trim só detecta branco; a identidade utilizada na busca permanece literal.
  const matches = parameters.filter(parameter => parameter !== null && typeof parameter === 'object' && parameter.id === parameterId);
  if (matches.length > 1) {
    return failure('ambiguous-parameter', parameterId, null, 'Mais de um parâmetro possui o ID solicitado; resolva a identidade ou precedência explicitamente.');
  }
  const parameter = matches[0];
  if (!parameter) return failure('missing-parameter', parameterId, null, 'Parâmetro referenciado não encontrado.');
  if (parameter.unit !== expectedUnit) {
    return failure('incompatible-unit', parameterId, typeof parameter.unit === 'string' ? parameter.unit : null, 'A unidade do parâmetro não corresponde ao contrato esperado: ' + expectedUnit + '.');
  }
  const resolved = resolveNumericInput(parameter.input, parameter.constraints, policy.limits);
  // Copiar apenas strings e resultados já imutáveis; não congelar nem expor o registro mutável.
  return Object.freeze({ ...resolved, parameterId: parameter.id, unit: parameter.unit });
}
