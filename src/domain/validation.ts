/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§2/4, FT-003.3.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */

import Decimal from 'decimal.js';
import type { DecimalText, NumericConstraints } from './model.js';
/** Códigos fechados do catálogo declarativo, sem converter ausência em zero. */
export type NumericValidationCode = 'required' | 'type' | 'invalid-decimal' | 'negative' | 'out-of-range' | 'invalid-constraints';
/** Resultado imutável: texto preservado no sucesso, motivo explícito sem valor na falha. */
export type NumericValidationResult = { readonly valid: true; readonly value: DecimalText } | { readonly valid: false; readonly code: NumericValidationCode; readonly message: string };

/** Regras numéricas predefinidas, profundamente readonly e congeladas. */
export const NUMERIC_RULES = Object.freeze({
  nonNegative: Object.freeze({ minimum: '0', maximum: null, minimumInclusive: true, maximumInclusive: true }),
  positive: Object.freeze({ minimum: '0', maximum: null, minimumInclusive: false, maximumInclusive: true }),
  fraction: Object.freeze({ minimum: '0', maximum: '1', minimumInclusive: true, maximumInclusive: true }),
});

/** Regex para validação léxica de número decimal (base 10, sem hex/bin). */
const DECIMAL_LEXICAL_REGEX = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

/** Valida limites e inclusividade sem coerção, rejeitando domínio vazio, negativos, não finitos e underflow. */
function validateConstraints(constraints: unknown): boolean {
  if (constraints === null || typeof constraints !== 'object') return false;
  const c = constraints as NumericConstraints;
  if ((typeof c.minimum !== 'string' && c.minimum !== null) || (typeof c.maximum !== 'string' && c.maximum !== null)) return false;
  if (typeof c.minimumInclusive !== 'boolean' || typeof c.maximumInclusive !== 'boolean') return false;
  if ((c.minimum !== null && !DECIMAL_LEXICAL_REGEX.test(c.minimum)) || (c.maximum !== null && !DECIMAL_LEXICAL_REGEX.test(c.maximum))) return false;
  /** Converte limite lexical já conferido; null representa extremo ausente ou inválido, discriminado pelo chamador. */
  const parseLimit = (value: string | null): Decimal | null => {
    if (value === null) return null;
    try {
      const d = new Decimal(value);
      if (!d.isFinite() || d.lt(0)) return null;
      if (d.isZero()) {
        const mantissa = value.split(/[eE]/)[0];
        if (/[1-9]/.test(mantissa)) return null;
      }
      return d;
    } catch {
      return null;
    }
  };
  const minDecimal = parseLimit(c.minimum);
  const maxDecimal = parseLimit(c.maximum);
  if ((minDecimal === null && c.minimum !== null) || (maxDecimal === null && c.maximum !== null)) return false;
  if (c.minimum !== null && c.maximum !== null) {
    if (minDecimal!.eq(maxDecimal!)) return c.minimumInclusive && c.maximumInclusive;
    if (minDecimal!.gt(maxDecimal!)) return false;
  }
  return true;
}

/**
 * Valida o valor numérico conforme as restrições.
 * Retorna NumericValidationResult.
 */
export function validateDecimalText(value: unknown, constraints: NumericConstraints): NumericValidationResult {
  // Validação da configuração primeiro
  if (!validateConstraints(constraints)) {
    return Object.freeze({
      valid: false,
      code: 'invalid-constraints' as NumericValidationCode,
      message: 'Configuração de restrições inválida.',
    });
  }

  // required: null, undefined, string vazia ou somente whitespace
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    return Object.freeze({
      valid: false,
      code: 'required' as NumericValidationCode,
      message: 'Valor obrigatório.',
    });
  }

  // type: não string
  if (typeof value !== 'string') {
    return Object.freeze({
      valid: false,
      code: 'type' as NumericValidationCode,
      message: 'Valor deve ser texto.',
    });
  }

  // invalid-decimal: whitespace periférico, vírgula, hex/bin, NaN, Infinity, expoente inválido, malformed
  if (!DECIMAL_LEXICAL_REGEX.test(value)) {
    return Object.freeze({
      valid: false,
      code: 'invalid-decimal' as NumericValidationCode,
      message: 'Formato numérico inválido.',
    });
  }

  // Parse com Decimal.js
  let decimalValue: Decimal;
  try {
    decimalValue = new Decimal(value);
  } catch {
    return Object.freeze({
      valid: false,
      code: 'invalid-decimal' as NumericValidationCode,
      message: 'Formato numérico inválido.',
    });
  }

  // Rejeitar não finito (NaN, Infinity, -Infinity)
  if (!decimalValue.isFinite()) {
    return Object.freeze({
      valid: false,
      code: 'invalid-decimal' as NumericValidationCode,
      message: 'Valor não é finito.',
    });
  }

  // negative: Decimal.lt(0) ou -0 matemático
  const isNegative = decimalValue.lt(0);
  const isNegativeZero = decimalValue.isZero() && decimalValue.isNegative();

  if (isNegative || isNegativeZero) {
    return Object.freeze({
      valid: false,
      code: 'negative' as NumericValidationCode,
      message: 'Valor não pode ser negativo.',
    });
  }

  // out-of-range: limites
  if (constraints.minimum !== null) {
    const min = new Decimal(constraints.minimum);
    if (constraints.minimumInclusive) {
      if (decimalValue.lt(min)) {
        return Object.freeze({
          valid: false,
          code: 'out-of-range' as NumericValidationCode,
          message: 'Valor abaixo do mínimo permitido.',
        });
      }
    } else {
      if (decimalValue.lte(min)) {
        return Object.freeze({
          valid: false,
          code: 'out-of-range' as NumericValidationCode,
          message: 'Valor abaixo do mínimo permitido.',
        });
      }
    }
  }

  if (constraints.maximum !== null) {
    const max = new Decimal(constraints.maximum);
    if (constraints.maximumInclusive) {
      if (decimalValue.gt(max)) {
        return Object.freeze({
          valid: false,
          code: 'out-of-range' as NumericValidationCode,
          message: 'Valor acima do máximo permitido.',
        });
      }
    } else {
      if (decimalValue.gte(max)) {
        return Object.freeze({
          valid: false,
          code: 'out-of-range' as NumericValidationCode,
          message: 'Valor acima do máximo permitido.',
        });
      }
    }
  }

  // Sucesso: preserva string exatamente
  return Object.freeze({
    valid: true,
    value: value,
  });
}
