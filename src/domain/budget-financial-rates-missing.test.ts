import { describe, it, expect } from 'vitest';
import { calculateBudgetFinancialRates } from './budget-financial-rates';
import type { BudgetFinancialRatesInput, BudgetWorkingRateResult } from './budget-financial-rates';
import type { BudgetAmountResult } from './budget-amount';
import type { BudgetPeriod } from './model';

function r(numerator: string, denominator = '1') {
  return { numerator, denominator };
}

function root(input: BudgetFinancialRatesInput) {
  const result = calculateBudgetFinancialRates(input, { maxInputLength: 256, maxDigits: 64 });
  if (result.status !== 'conditional') {
    throw Error(result.reason);
  }
  return result;
}

function verifyWorkingRate(result: BudgetWorkingRateResult) {
  if (result.status !== 'ready') {
    throw Error(result.reason);
  }
  return result;
}

function verifyAmount(result: BudgetAmountResult, period: BudgetPeriod, amount: string) {
  if (result.status !== 'ready') throw Error(result.reason);
  expect(result.value).toEqual(r(amount));
  expect(result.sourcePeriod).toBe('month');
  expect(result.targetPeriod).toBe(period);
  expect(result.basis).toBe('budget-calendar-period');
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

describe('budget-financial-rates-missing', () => {
  it('horas ausentes bloqueiam apenas taxa horária', () => {
    const input = baseInput();
    const result = root({ ...input, calendar: { ...input.calendar, hoursPerWorkingDay: null } });

    expect(result.status).toBe('conditional');
    expect(result.currency).toBe('BRL');
    expect(result.sourceBasis).toBe('budget-calendar-period');
    expect(result.financialAssessment).toBe('not-evaluated');
    expect(result.source).toEqual({status:'ready',value:r('3200'),sourcePeriod:'month',targetPeriod:'month',basis:'budget-calendar-period'});

    verifyAmount(result.perMonth, 'month', '3200');
    verifyAmount(result.perWeek, 'week', '800');
    verifyAmount(result.perYear, 'year', '38400');

    const perWorkingDay = verifyWorkingRate(result.perWorkingDay);
    expect(perWorkingDay.unit).toBe('BRL/working-day');
    expect(perWorkingDay.amountPeriod).toBe('month');
    expect(perWorkingDay.sourceAmount).toEqual(r('3200', '1'));
    expect(perWorkingDay.denominator).toEqual(r('16', '1'));
    expect(perWorkingDay.value).toEqual(r('200', '1'));

    const perConnectedHour = result.perConnectedHour;
    if (perConnectedHour.status !== 'unavailable') throw Error('Taxa horária deveria estar indisponível.');
    expect(perConnectedHour.code).toBe('missing-calendar-input');
    expect(perConnectedHour.dependency).toBe('hoursPerWorkingDay');
    expect(typeof perConnectedHour.reason).toBe('string');
    expect(perConnectedHour.reason.length).toBeGreaterThan(0);
    expect(perConnectedHour.diagnostic).toBeNull();
    expect(perConnectedHour.denominator).toBeNull();
  });

  it('meses por ano ausentes bloqueiam apenas montante anual', () => {
    const input = baseInput();
    const result = root({ ...input, calendar: { ...input.calendar, monthsPerYear: null } });

    expect(result.status).toBe('conditional');
    expect(result.currency).toBe('BRL');
    expect(result.sourceBasis).toBe('budget-calendar-period');
    expect(result.financialAssessment).toBe('not-evaluated');
    expect(result.source).toEqual({status:'ready',value:r('3200'),sourcePeriod:'month',targetPeriod:'month',basis:'budget-calendar-period'});

    verifyAmount(result.perMonth, 'month', '3200');
    verifyAmount(result.perWeek, 'week', '800');

    const perYear = result.perYear;
    if (perYear.status !== 'unavailable' || !('dependency' in perYear)) throw Error('Montante anual deveria estar indisponível por calendário.');
    expect(perYear.code).toBe('missing-calendar-input');
    expect(perYear.dependency).toBe('monthsPerYear');
    expect(typeof perYear.reason).toBe('string');
    expect(perYear.reason.length).toBeGreaterThan(0);

    const perWorkingDay = verifyWorkingRate(result.perWorkingDay);
    expect(perWorkingDay.unit).toBe('BRL/working-day');
    expect(perWorkingDay.amountPeriod).toBe('month');
    expect(perWorkingDay.sourceAmount).toEqual(r('3200', '1'));
    expect(perWorkingDay.denominator).toEqual(r('16', '1'));
    expect(perWorkingDay.value).toEqual(r('200', '1'));

    const perConnectedHour = verifyWorkingRate(result.perConnectedHour);
    expect(perConnectedHour.unit).toBe('BRL/connected-hour');
    expect(perConnectedHour.amountPeriod).toBe('month');
    expect(perConnectedHour.sourceAmount).toEqual(r('3200', '1'));
    expect(perConnectedHour.denominator).toEqual(r('64', '1'));
    expect(perConnectedHour.value).toEqual(r('50', '1'));
  });
});
