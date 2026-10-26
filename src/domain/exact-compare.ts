/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.1/8.2, FT-003.23.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */

import type { ExactLimits } from './exact-budget.js';
import { inspectExactLimits } from './exact-budget.js';
import type { ExactRational } from './exact.js';
import type { ExactRationalFailure } from './exact-rational.js';
import {
  inspectExactRational,
  loadExactRational,
  fitsProduct,
} from './exact-rational.js';

/** Falhas técnicas da comparação, sem juízo financeiro. */
export type ExactComparisonFailure = ExactRationalFailure | { readonly status: 'unavailable'; readonly code: 'invalid-budget'; readonly reason: string };

/** Ordem adimensional: -1 menor, 0 igual, 1 maior; ou indisponibilidade explícita. */
export type ExactComparisonResult = { readonly status: 'ready'; readonly order: -1 | 0 | 1 } | ExactComparisonFailure;

/**
 * Compara dois racionais exatamente, respeitando materialização e orçamento técnico.
 * @param left Primeiro operando na representação racional de strings.
 * @param right Segundo operando na representação racional de strings.
 * @param limits Orçamento técnico explícito, validado antes de qualquer materialização.
 * @returns Ordem adimensional congelada ou falha técnica, sem conversão monetária.
 */
export function compareExactRationals(
  left: ExactRational,
  right: ExactRational,
  limits: ExactLimits
): ExactComparisonResult {
  // 1. Inspect de limits: falha estrutural → unavailable/invalid-budget
  const policy = inspectExactLimits(limits);
  if (!policy.valid) {
    return Object.freeze({ status: 'unavailable', code: 'invalid-budget', reason: policy.reason });
  }

  const { limits: l } = policy;

  // Reutilizar estrutura, comprimento, formato e falhas dos helpers aceitos.
  if (!inspectExactRational(left)) {
    return Object.freeze({
      status: 'unavailable',
      code: 'invalid-rational',
      reason: 'Operando esquerdo inválido: estrutura de racional exato.',
    });
  }
  const leftFraction = loadExactRational(left, l);
  if ('status' in leftFraction) {
    return Object.freeze(leftFraction);
  }

  if (!inspectExactRational(right)) {
    return Object.freeze({
      status: 'unavailable',
      code: 'invalid-rational',
      reason: 'Operando direito inválido: estrutura de racional exato.',
    });
  }
  const rightFraction = loadExactRational(right, l);
  if ('status' in rightFraction) {
    return Object.freeze(rightFraction);
  }

  // 4. Guardas de orçamento antes da aritmética
  try {
    const cap = 10n ** BigInt(l.maxDigits) - 1n;

    // A comparação materializa só os dois produtos cruzados; não cria a.d*b.d.
    const aN = leftFraction.n;
    const aD = leftFraction.d;
    const bN = rightFraction.n;
    const bD = rightFraction.d;

    if (!fitsProduct(aN, bD, cap)) {
      return Object.freeze({
        status: 'unavailable',
        code: 'resource-budget',
        reason: 'Orçamento de recurso excedido: produto a.n * b.d.',
      });
    }
    if (!fitsProduct(bN, aD, cap)) {
      return Object.freeze({
        status: 'unavailable',
        code: 'resource-budget',
        reason: 'Orçamento de recurso excedido: produto b.n * a.d.',
      });
    }


    // Guardar diferença antes de Fraction.compare, que a materializa antes da ordem.
    // x + y representa a diferença; sinais opostos cancelam sem crescer.
    const x = leftFraction.s * aN * bD;
    const ySign = -rightFraction.s;
    const y = ySign * bN * aD;

    const ax = x < 0n ? -x : x;
    const ay = y < 0n ? -y : y;

    // Sinais iguais: overflow se ax + ay > cap
    if ((x >= 0n) === (y >= 0n)) {
      if (ax > cap - ay) {
        return Object.freeze({
          status: 'unavailable',
          code: 'resource-budget',
          reason: 'Orçamento de recurso excedido: diferença intermediária ultrapassa limite.',
        });
      }
    }

    // A biblioteca determina a ordem exata; number é apenas enum adimensional.
    const order = leftFraction.compare(rightFraction);
    if (order !== -1 && order !== 0 && order !== 1) {
      return Object.freeze({ status: 'unavailable', code: 'arithmetic-failure', reason: 'Comparação retornou ordem inválida.' });
    }
    return Object.freeze({ status: 'ready', order });
  } catch {
    return Object.freeze({
      status: 'unavailable',
      code: 'arithmetic-failure',
      reason: 'Falha aritmética durante comparação exata.',
    });
  }
}
