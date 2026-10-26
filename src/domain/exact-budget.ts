/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§2/4/8.1, FT-003.19.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
/**
 * Limites de orçamento técnico explícito do chamador.
 * maxInputLength: contagem UTF-16 da string de entrada.
 * maxDigits: limite de dígitos materializados ANTES da redução.
 */
export type ExactLimits = {
  readonly maxInputLength: number;
  readonly maxDigits: number;
};
/** Validação de política técnica: não determina validade de valor financeiro nem define orçamento padrão. */
export type ExactLimitValidation =
  /** Política estruturalmente válida; snapshot congelado sem congelar o argumento original. */
  | { readonly valid: true; readonly limits: ExactLimits }
  /** Política rejeitada com o mesmo motivo usado pela ponte decimal. */
  | { readonly valid: false; readonly reason: string };

/**
 * Confere uma política técnica e cria snapshot imutável, sem defaults.
 * @param value Objeto de configuração, não parâmetro financeiro nem estado importado confiável.
 * @returns Sucesso com os dois inteiros positivos seguros ou motivo pt-BR; não modifica o argumento.
 * Validade estrutural não comprova memória disponível: política real pertence ao controlador.
 */
export function inspectExactLimits(value: unknown): ExactLimitValidation {
  if (value === null || typeof value !== 'object') return Object.freeze({valid:false,reason:'Orçamento inválido: limits ausente ou não objeto.'});
  const candidate = value as ExactLimits;
  const maxInputLength = candidate.maxInputLength, maxDigits = candidate.maxDigits;
  if (!Number.isSafeInteger(maxInputLength) || maxInputLength <= 0) return Object.freeze({valid:false,reason:'Orçamento inválido: maxInputLength não é inteiro positivo seguro.'});
  if (!Number.isSafeInteger(maxDigits) || maxDigits <= 0) return Object.freeze({valid:false,reason:'Orçamento inválido: maxDigits não é inteiro positivo seguro.'});
  return Object.freeze({valid:true,limits:Object.freeze({maxInputLength,maxDigits})});
}
