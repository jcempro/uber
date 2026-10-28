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

describe('budget-financial-rates', () => {
  it('quantia mensal com dias efetivos', () => {
    const input: BudgetFinancialRatesInput = {
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

    const result = root(input);
    expect(result.currency).toBe('BRL');
    expect(result.sourceBasis).toBe('budget-calendar-period');
    expect(result.financialAssessment).toBe('not-evaluated');
    expect(result.source).toEqual({status:'ready',value:r('3200'),sourcePeriod:'month',targetPeriod:'month',basis:'budget-calendar-period'});
    verifyAmount(result.perMonth, 'month', '3200');
    verifyAmount(result.perWeek, 'week', '800');
    verifyAmount(result.perYear, 'year', '38400');

    const perWorkingDay = verifyWorkingRate(result.perWorkingDay);
    expect(perWorkingDay.value).toEqual(r('200', '1'));
    expect(perWorkingDay.value).not.toEqual(r('800', '7'));
    expect(perWorkingDay.denominator).toEqual(r('16', '1'));
    expect(perWorkingDay.unit).toBe('BRL/working-day');
    expect(perWorkingDay.amountPeriod).toBe('month');
    expect(perWorkingDay.sourceAmount).toEqual(r('3200', '1'));

    const perConnectedHour = verifyWorkingRate(result.perConnectedHour);
    expect(perConnectedHour.value).toEqual(r('50', '1'));
    expect(perConnectedHour.denominator).toEqual(r('64', '1'));
    expect(perConnectedHour.unit).toBe('BRL/connected-hour');
    expect(perConnectedHour.amountPeriod).toBe('month');
    expect(perConnectedHour.sourceAmount).toEqual(r('3200', '1'));
  });

  it('perdas alteram taxas sem alterar montantes', () => {
    const input: BudgetFinancialRatesInput = {
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
        lostWorkingDaysPerMonth: r('4'),
      },
    };

    const result = root(input);
    expect(result.currency).toBe('BRL');
    expect(result.sourceBasis).toBe('budget-calendar-period');
    expect(result.financialAssessment).toBe('not-evaluated');
    expect(result.source).toEqual({status:'ready',value:r('3200'),sourcePeriod:'month',targetPeriod:'month',basis:'budget-calendar-period'});
    verifyAmount(result.perMonth, 'month', '3200');
    verifyAmount(result.perWeek, 'week', '800');
    verifyAmount(result.perYear, 'year', '38400');

    const perWorkingDay = verifyWorkingRate(result.perWorkingDay);
    expect(perWorkingDay.value).toEqual(r('800', '3'));
    expect(perWorkingDay.denominator).toEqual(r('12', '1'));
    expect(perWorkingDay.unit).toBe('BRL/working-day');
    expect(perWorkingDay.amountPeriod).toBe('month');
    expect(perWorkingDay.sourceAmount).toEqual(r('3200', '1'));

    const perConnectedHour = verifyWorkingRate(result.perConnectedHour);
    expect(perConnectedHour.value).toEqual(r('200', '3'));
    expect(perConnectedHour.denominator).toEqual(r('48', '1'));
    expect(perConnectedHour.unit).toBe('BRL/connected-hour');
    expect(perConnectedHour.amountPeriod).toBe('month');
    expect(perConnectedHour.sourceAmount).toEqual(r('3200', '1'));
  });
});
