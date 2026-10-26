/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.1/8.2, FT-003.22.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */

import type Fraction from 'fraction.js';
import type { ExactLimits } from './exact-budget.js';
import { inspectExactLimits } from './exact-budget.js';
import type { ExactRational } from './exact.js';
import type { ExactRationalFailure } from './exact-rational.js';
import {
  inspectExactRational,
  loadExactRational,
  fitsProduct,
  serializeExactRational,
} from './exact-rational.js';

/** Operação exata: adição ou subtração. */
export type ExactSumOperation = 'add' | 'subtract';

/** Falha da operação de soma/subtração. */
export type ExactSumFailure = ExactRationalFailure | { readonly status: 'unavailable'; readonly code: 'invalid-budget' | 'invalid-operation'; readonly reason: string };

/** Resultado da operação exata. */
export type ExactSumResult = { readonly status: 'ready'; readonly value: ExactRational } | ExactSumFailure;

/**
 * Calcula soma ou subtração exata de dois racionais, respeitando orçamento técnico.
 * @param operation Operação: 'add' ou 'subtract'.
 * @param left Primeiro operando, já validado como ExactRational.
 * @param right Segundo operando, já validado como ExactRational.
 * @param limits Orçamento técnico explícito, validado antes de qualquer materialização.
 * @returns Resultado congelado: valor racional ou falha técnica (sem juízo financeiro).
 */
export function calculateExactSum(
  operation: ExactSumOperation,
  left: ExactRational,
  right: ExactRational,
  limits: ExactLimits
): ExactSumResult {
  // 1. Inspect de limits: falha estrutural → unavailable/invalid-budget
  const policy = inspectExactLimits(limits);
  if (!policy.valid) {
    return Object.freeze({ status: 'unavailable', code: 'invalid-budget', reason: policy.reason });
  }

  const { limits: l } = policy;

  // 2. Operação inválida antes de operandos
  if (operation !== 'add' && operation !== 'subtract') {
    return Object.freeze({
      status: 'unavailable',
      code: 'invalid-operation',
      reason: 'Operação inválida: somente add ou subtract são permitidas.',
    });
  }

  // 3. Inspect e load de operandos: falha → unavailable/invalid-rational
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

    // fitsProduct para cada produto cruzado: a.n * b.d, b.n * a.d, a.d * b.d
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
    if (!fitsProduct(aD, bD, cap)) {
      return Object.freeze({
        status: 'unavailable',
        code: 'resource-budget',
        reason: 'Orçamento de recurso excedido: produto a.d * b.d.',
      });
    }

    // 5. Soma/subtração com guarda de overflow de sinal igual
    // x = a.s * a.n * b.d; y = (op === 'add' ? b.s : -b.s) * b.n * a.d
    const x = leftFraction.s * aN * bD;
    const ySign = operation === 'add' ? rightFraction.s : -rightFraction.s;
    const y = ySign * bN * aD;

    const ax = x < 0n ? -x : x;
    const ay = y < 0n ? -y : y;

    // Sinais iguais: overflow se ax + ay > cap
    if ((x >= 0n) === (y >= 0n)) {
      if (ax > cap - ay) {
        return Object.freeze({
          status: 'unavailable',
          code: 'resource-budget',
          reason: 'Orçamento de recurso excedido: overflow na soma de magnitudes.',
        });
      }
    }

    // 6. Aplicar operação com Fraction.js e serializar
    let resultFraction: Fraction;
    if (operation === 'add') {
      resultFraction = leftFraction.add(rightFraction);
    } else {
      resultFraction = leftFraction.sub(rightFraction);
    }

    const resultRational = serializeExactRational(resultFraction);

    return Object.freeze({
      status: 'ready' as const,
      value: resultRational,
    });
  } catch {
    return Object.freeze({
      status: 'unavailable',
      code: 'arithmetic-failure',
      reason: 'Falha aritmética durante operação de soma/subtração.',
    });
  }
}
