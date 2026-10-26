/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.1, FT-003.18.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */

import Decimal from 'decimal.js';
import Fraction from 'fraction.js';
import type { NumericConstraints } from './model.js';
import type { NumericValidationResult } from './validation.js';
import { validateDecimalText } from './validation.js';

/** Construtor privado: a conversão em fração não altera a configuração decimal compartilhada. */
const ExactDecimal = Decimal.clone();

/**
 * Representação racional exata: numerador e denominador como strings (sem BigInt),
 * normalizada, sinal no numerador, denominador positivo, JSON-serializável.
 */
export type ExactRational = {
  readonly numerator: string;
  readonly denominator: string;
};

/**
 * Limites de orçamento técnico explícito do chamador.
 * maxInputLength: contagem UTF-16 da string de entrada.
 * maxDigits: limite de dígitos materializados ANTES da redução.
 */
export type ExactLimits = {
  readonly maxInputLength: number;
  readonly maxDigits: number;
};

/**
 * Resultado da conversão decimal→racional exata.
 * ready: sucesso com valor racional congelado.
 * invalid: entrada inválida conforme validateDecimalText (código/mensagem preservados).
 * unavailable: falha de orçamento ou aritmética (não reflete validade da entrada).
 */
export type ExactDecimalResult =
  /** Valor normalizado disponível, sem certificação de evidência financeira. */
  | { readonly status: 'ready'; readonly value: ExactRational }
  /** Rejeição do catálogo comum, com diagnóstico original preservado. */
  | { readonly status: 'invalid'; readonly validation: Extract<NumericValidationResult, { valid: false }> }
  /** Cálculo indisponível por orçamento/configuração/falha, sem invalidar automaticamente o dado financeiro. */
  | { readonly status: 'unavailable'; readonly code: 'invalid-budget' | 'resource-budget' | 'arithmetic-failure'; readonly reason: string };

/**
 * Valida orçamento e converte decimal para racional exato.
 * @param input Texto bruto sujeito ao catálogo numérico comum, sem extração de estados ou coerção.
 * @param constraints Domínio declarado pelo chamador, validado pelo mecanismo comum.
 * @param limits Orçamento técnico explícito, anterior à materialização de inteiros; não é teto financeiro.
 * @returns Resultado congelado: valor normalizado, diagnóstico comum ou indisponibilidade distinta de entrada inválida.
 * Falhas reconhecidas são resultados, não exceções de campo; não modifica argumentos, configuração global ou estado externo.
 */
export function parseExactDecimal(
  input: unknown,
  constraints: NumericConstraints,
  limits: ExactLimits
): ExactDecimalResult {
  // 1. Orçamento inválido: limits nulo/não-objeto ou campos não Number.isSafeInteger/≤0
  if (limits === null || typeof limits !== 'object') {
    return Object.freeze({
      status: 'unavailable',
      code: 'invalid-budget' as const,
      reason: 'Orçamento inválido: limits ausente ou não objeto.',
    });
  }

  const l = limits as ExactLimits;
  if (!Number.isSafeInteger(l.maxInputLength) || l.maxInputLength <= 0) {
    return Object.freeze({
      status: 'unavailable',
      code: 'invalid-budget' as const,
      reason: 'Orçamento inválido: maxInputLength não é inteiro positivo seguro.',
    });
  }
  if (!Number.isSafeInteger(l.maxDigits) || l.maxDigits <= 0) {
    return Object.freeze({
      status: 'unavailable',
      code: 'invalid-budget' as const,
      reason: 'Orçamento inválido: maxDigits não é inteiro positivo seguro.',
    });
  }

  // 2. Orçamento de recurso: input string.length > maxInputLength
  if (typeof input === 'string' && input.length > l.maxInputLength) {
    return Object.freeze({
      status: 'unavailable',
      code: 'resource-budget' as const,
      reason: 'Orçamento de recurso excedido: comprimento da entrada.',
    });
  }

  // 3. Validação do valor decimal
  const validation = validateDecimalText(input, constraints);
  if (!validation.valid) {
    return Object.freeze({
      status: 'invalid' as const,
      validation: Object.freeze(validation),
    });
  }

  // 4. Orçamento de expansão: contadores de dígitos antes de toFraction/BigInt
  try {
    const d = new ExactDecimal(validation.value);
    const sig = BigInt(d.sd());
    const e = BigInt(d.e);
    const limit = BigInt(l.maxDigits);

    const num = sig > e + 1n ? sig : e + 1n;
    const rawScale = sig - e - 1n;
    const scale = rawScale > 0n ? rawScale : 0n;
    const den = scale + 1n;

    if (num > limit || den > limit) {
      return Object.freeze({
        status: 'unavailable',
        code: 'resource-budget' as const,
        reason: 'Orçamento de recurso excedido: expansão de dígitos.',
      });
    }

    // 5. Conversão para racional exato
    const [n, denFrac] = d.toFraction();
    const numerator = BigInt(n.toFixed(0));
    const denominator = BigInt(denFrac.toFixed(0));

    const f = new Fraction(numerator, denominator);
    const value: ExactRational = Object.freeze({
      numerator: (f.s * f.n).toString(),
      denominator: f.d.toString(),
    });

    return Object.freeze({
      status: 'ready' as const,
      value,
    });
  } catch {
    return Object.freeze({
      status: 'unavailable',
      code: 'arithmetic-failure' as const,
      reason: 'Falha aritmética durante conversão decimal→racional.',
    });
  }
}
