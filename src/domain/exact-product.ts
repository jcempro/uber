/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.1/8.2, FT-003.20.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */

import type Fraction from 'fraction.js';
import { inspectExactLimits } from './exact-budget.js';
import type { ExactLimits, ExactRational } from './exact.js';
import { inspectExactRational, loadExactRational, fitsProduct, serializeExactRational } from './exact-rational';

/** Operações suportadas: multiplicação e divisão exatas. */
export type ExactProductOperation = 'multiply' | 'divide';

/** Resultado da operação exata: pronto ou falha descritiva. */
export type ExactProductResult =
  | { readonly status: 'ready'; readonly value: ExactRational }
  | { readonly status: 'unavailable'; readonly code: ExactProductFailureCode; readonly reason: string };

/** Códigos de falha da operação exata. */
export type ExactProductFailureCode =
  | 'invalid-budget'
  | 'invalid-operation'
  | 'invalid-rational'
  | 'resource-budget'
  | 'division-by-zero'
  | 'arithmetic-failure';

/** Representação de falha da operação exata. */
export type ExactProductFailure = Extract<ExactProductResult, { status: 'unavailable' }>;

/**
 * Calcula o produto ou divisão exata de dois racionais, respeitando orçamento técnico.
 * @param operation Operação: 'multiply' ou 'divide'.
 * @param left Racional exato esquerdo.
 * @param right Racional exato direito.
 * @param limits Orçamento técnico.
 * @returns Resultado pronto com valor congelado ou falha descritiva.
 */
export function calculateExactProduct(
  operation: ExactProductOperation,
  left: ExactRational,
  right: ExactRational,
  limits: ExactLimits
): ExactProductResult {
  // 1. Validar orçamento
  const policy = inspectExactLimits(limits);
  if (!policy.valid) {
    return Object.freeze({ status: 'unavailable', code: 'invalid-budget' as const, reason: policy.reason });
  }
  const l = policy.limits;

  // 2. Validar operação
  if (operation !== 'multiply' && operation !== 'divide') {
    return Object.freeze({
      status: 'unavailable',
      code: 'invalid-operation' as const,
      reason: 'Operação inválida: somente multiply e divide são suportadas.',
    });
  }

  // 3. Validar racionais de entrada
  if (!inspectExactRational(left)) {
    return Object.freeze({
      status: 'unavailable',
      code: 'invalid-rational' as const,
      reason: 'Racional esquerdo inválido: formato ou conteúdo incorreto.',
    });
  }

  if (!inspectExactRational(right)) {
    return Object.freeze({
      status: 'unavailable',
      code: 'invalid-rational' as const,
      reason: 'Racional direito inválido: formato ou conteúdo incorreto.',
    });
  }

  // 4. Carregar racionais com orçamento
  const leftF = loadExactRational(left, l);
  if ('status' in leftF) return leftF;

  const rightF = loadExactRational(right, l);
  if ('status' in rightF) return rightF;

  const a = leftF;
  const b = rightF;

  // 5. Verificar divisão por zero
  if (operation === 'divide' && b.n === 0n) {
    return Object.freeze({
      status: 'unavailable',
      code: 'division-by-zero' as const,
      reason: 'Divisão por zero: racional direito igual a zero.',
    });
  }

  // A sentinela usa N+1 dígitos técnicos; os produtos de trabalho devem caber em N.
  // Proteger também cap e guardas: falha de recurso não é entrada financeira inválida.
  try {
  // 6. Guarda antes dos produtos, pois a biblioteca reduz somente após materializá-los.
  const cap = 10n ** BigInt(l.maxDigits) - 1n;

  let fits = false;
  if (operation === 'multiply') {
    // fits(a.n, b.n) && fits(a.d, b.d)
    fits = fitsProduct(a.n, b.n, cap) && fitsProduct(a.d, b.d, cap);
  } else {
    // divide: fits(a.n, b.d) && fits(a.d, b.n)
    fits = fitsProduct(a.n, b.d, cap) && fitsProduct(a.d, b.n, cap);
  }

  if (!fits) {
    return Object.freeze({
      status: 'unavailable',
      code: 'resource-budget' as const,
      reason: 'Orçamento de recurso excedido: materialização intermediária ultrapassa limite.',
    });
  }

  // 7. Executar operação com a biblioteca, sem arredondamento ou redução própria.
    let f: Fraction;
    if (operation === 'multiply') {
      f = a.mul(b);
    } else {
      f = a.div(b);
    }

    // Valor retornado: sinal no numerador, denominador positivo, congelado
    const value = serializeExactRational(f);

    return Object.freeze({ status: 'ready' as const, value });
  } catch {
    return Object.freeze({
      status: 'unavailable',
      code: 'arithmetic-failure' as const,
      reason: 'Falha aritmética durante operação.',
    });
  }
}
