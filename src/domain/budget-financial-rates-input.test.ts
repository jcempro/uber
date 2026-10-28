import { describe, it, expect } from 'vitest';
import { calculateBudgetFinancialRates } from './budget-financial-rates';
import type { BudgetFinancialRatesInput } from './budget-financial-rates';
import { inspectExactLimits } from './exact-budget';
import type { ExactLimits } from './exact-budget';
import { convertBudgetCalendarAmount } from './budget-amount';

function r(numerator: string, denominator = '1') {
  return { numerator, denominator };
}

function baseInput(): BudgetFinancialRatesInput {
  return {
      currency: 'BRL',
      sourceBasis: 'budget-calendar-period',
      amount: r('3200', '1'),
      sourcePeriod: 'month',
      calendar: {
        kind: 'budget',
        daysPerMonth: r('28'),
        monthsPerYear: r('12'),
        daysPerWeek: r('4'),
        hoursPerWorkingDay: r('4'),
        lostWorkingDaysPerMonth: r('0'),
      },
    };
}

const policy = { maxInputLength: 256, maxDigits: 64 };

// Únicos casts: fronteira de fixtures inválidas; nenhum cast de resultado.
function invoke(input: unknown, limits: unknown = policy) {
  const result = calculateBudgetFinancialRates(input as BudgetFinancialRatesInput, limits as ExactLimits);
  if (result.status !== 'unavailable') throw Error('Entrada deveria ser rejeitada.');
  return result;
}

function canonicalSource(input: unknown) {
  const candidate = input as BudgetFinancialRatesInput;
  const result = convertBudgetCalendarAmount(candidate.amount, candidate.sourcePeriod, candidate.sourcePeriod, candidate.calendar, policy);
  if (result.status !== 'unavailable') throw Error('Origem canônica deveria ser rejeitada.');
  return result;
}

function invalidPolicyReason(limits: unknown) {
  const result = inspectExactLimits(limits);
  if (result.valid) throw Error('Política deveria ser rejeitada.');
  return result.reason;
}

describe('budget-financial-rates-input', () => {
  it('política inválida preserva motivo e não calcula origem', () => {
    const limitsList = [
      { maxInputLength: 0, maxDigits: 64 },
      { maxInputLength: 256, maxDigits: 0 }
    ];
    for (const limits of limitsList) {
      const result = invoke(baseInput(), limits);
      expect(result.status).toBe('unavailable');
      expect(result.code).toBe('invalid-budget');
      expect(result.source).toBeNull();
      expect(result.reason).toBe(invalidPolicyReason(limits));
      expect(result.reason).not.toBe('');
    }
  });

  it('entrada não suportada não gera origem financeira', () => {
    const inputs = [
      null,
      { ...baseInput(), currency: 'USD' },
      { ...baseInput(), sourceBasis: 'working-day' }
    ];
    for (const input of inputs) {
      const result = invoke(input);
      expect(result.status).toBe('unavailable');
      expect(result.code).toBe('unsupported-input');
      expect(result.source).toBeNull();
      expect(typeof result.reason).toBe('string');
      expect(result.reason).not.toBe('');
    }
  });

  it('quantia ou período inválido preserva diagnóstico da origem', () => {
    const testCases = [
      { input: { ...baseInput(), amount: r('3200', '0') }, code: 'invalid-rational' },
      { input: { ...baseInput(), sourcePeriod: 'quarter' }, code: 'invalid-period' }
    ];
    for (const item of testCases) {
      const expected = canonicalSource(item.input);
      expect(expected.code).toBe(item.code);
      const result = invoke(item.input);
      expect(result.status).toBe('unavailable');
      expect(result.code).toBe('source-unavailable');
      expect(result.source).toEqual(expected);
      expect(result.reason).toBe(expected.reason);
      expect(result.reason).not.toBe('');
    }
  });

  it('calendário não suportado preserva diagnóstico da origem', () => {
    const inputs = [
      { ...baseInput(), calendar: { ...baseInput().calendar, kind: 'real' } },
      { ...baseInput(), calendar: null },
      { ...baseInput(), calendar: undefined }
    ];
    for (const input of inputs) {
      const expected = canonicalSource(input);
      expect(expected.code).toBe('unsupported-calendar');
      const result = invoke(input);
      expect(result.status).toBe('unavailable');
      expect(result.code).toBe('source-unavailable');
      expect(result.source).toEqual(expected);
      expect(result.reason).toBe(expected.reason);
      expect(result.reason).not.toBe('');
    }
  });
});
