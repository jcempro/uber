/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.1/8.2, FT-003.20.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */

import Fraction from 'fraction.js';
import { inspectExactLimits } from './exact-budget.js';
import type { ExactLimits, ExactRational } from './exact.js';

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
 * Verifica somente objeto e campos string; formato é validado após limitar comprimento.
 * @param value Valor a validar.
 * @returns true quando os dois campos são strings.
 */
function inspectExactRational(value: unknown): value is ExactRational {
  if (value === null || typeof value !== 'object') return false;
  const candidate = value as ExactRational;
  if (typeof candidate.numerator !== 'string' || typeof candidate.denominator !== 'string') return false;
  return true;
}

/**
 * Carrega um racional exato em Fraction, validando comprimento e dígitos antes de BigInt.
 * @param rational Racional exato validado.
 * @param limits Orçamento técnico.
 * @returns Fraction congelado ou falha com código e motivo.
 */
function loadExactRational(rational: ExactRational, limits: ExactLimits): Fraction | ExactProductFailure {
  const numStr = rational.numerator;
  const denStr = rational.denominator;

  // Comprimento UTF-16 da string de entrada ≤ maxInputLength
  if (numStr.length > limits.maxInputLength || denStr.length > limits.maxInputLength) {
    return Object.freeze({
      status: 'unavailable' as const,
      code: 'resource-budget' as const,
      reason: 'Orçamento de recurso excedido: comprimento da representação do racional.',
    });
  }

  // Formato canônico somente após limitar comprimento, antes de BigInt.
  if (!/^-?(?:0|[1-9]\d*)$/.test(numStr) || !/^[1-9]\d*$/.test(denStr)) {
    return Object.freeze({
      status: 'unavailable' as const,
      code: 'invalid-rational' as const,
      reason: 'Racional inválido: representação inteira não canônica.',
    });
  }

  // Contar dígitos sem sinal do numerador e comprimento do denominador
  const numDigits = numStr.replace(/^-/, '').length;
  const denDigits = denStr.length;

  if (numDigits > limits.maxDigits || denDigits > limits.maxDigits) {
    return Object.freeze({
      status: 'unavailable' as const,
      code: 'resource-budget' as const,
      reason: 'Orçamento de recurso excedido: dígitos do racional.',
    });
  }

  try {
    const numerator = BigInt(numStr);
    const denominator = BigInt(denStr);

    if (denominator === 0n) {
      return Object.freeze({
        status: 'unavailable' as const,
        code: 'invalid-rational' as const,
        reason: 'Racional inválido: denominador zero.',
      });
    }

    // Fraction.js normaliza no construtor; campos canônicos, sem sinal no denominador
    const f = new Fraction(numerator, denominator);
    return Object.freeze(f);
  } catch {
    return Object.freeze({
      status: 'unavailable' as const,
      code: 'arithmetic-failure' as const,
      reason: 'Falha aritmética ao materializar racional exato.',
    });
  }
}

/**
 * Verifica se o produto de dois BigInts cabe no limite técnico antes da materialização.
 * @param x Primeiro fator.
 * @param y Segundo fator.
 * @param cap Limite técnico (cap = 10^maxDigits - 1).
 * @returns true se x * y ≤ cap ou x === 0n.
 */
function fitsProduct(x: bigint, y: bigint, cap: bigint): boolean {
  return x === 0n || y <= cap / x;
}

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
    const value: ExactRational = Object.freeze({
      numerator: (f.s * f.n).toString(),
      denominator: f.d.toString(),
    });

    return Object.freeze({ status: 'ready' as const, value });
  } catch {
    return Object.freeze({
      status: 'unavailable',
      code: 'arithmetic-failure' as const,
      reason: 'Falha aritmética durante operação.',
    });
  }
}
