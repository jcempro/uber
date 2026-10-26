/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.1/8.2, FT-003.21.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import Fraction from 'fraction.js';
import type { ExactLimits } from './exact-budget';
import type { ExactRational } from './exact';

/** Falha interna de representação ou materialização, sem juízo financeiro. */
export type ExactRationalFailure = {
  readonly status: 'unavailable';
  readonly code: 'invalid-rational' | 'resource-budget' | 'arithmetic-failure';
  readonly reason: string;
};

/**
 * Helpers internos da álgebra: limits já validado por inspectExactLimits.
 * inspectExactRational verifica campos; loadExactRational limita strings e valida formato.
 * fitsProduct recebe magnitudes não negativas de Fraction e cap positivo.
 * Fraction permanece interno; a fronteira JSON recebe somente serializeExactRational.
 */
/**
 * Verifica somente objeto e campos string; formato é validado após limitar comprimento.
 * @param value Valor a validar.
 * @returns true quando os dois campos são strings.
 */
export function inspectExactRational(value: unknown): value is ExactRational {
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
export function loadExactRational(rational: ExactRational, limits: ExactLimits): Fraction | ExactRationalFailure {
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
export function fitsProduct(x: bigint, y: bigint, cap: bigint): boolean {
  return x === 0n || y <= cap / x;
}

/** Serializa Fraction normalizado em par imutável de strings, sem arredondar. */
export function serializeExactRational(f: Fraction): ExactRational {
    const value: ExactRational = Object.freeze({
      numerator: (f.s * f.n).toString(),
      denominator: f.d.toString(),
    });
    return value;
}
