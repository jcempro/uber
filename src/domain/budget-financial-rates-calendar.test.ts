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

function verifyUnavailableWorking(result: BudgetWorkingRateResult) {
    if (result.status !== 'unavailable') throw Error('Taxa horária deveria estar indisponível.');
  return result;
}

function verifyMissingAmount(result: BudgetAmountResult) {
    if (result.status !== 'unavailable' || !('dependency' in result)) throw Error('Montante anual deveria estar indisponível por calendário.');
  return result;
}

describe('budget-financial-rates-calendar', () => {
  it('dias por semana ausentes bloqueiam apenas taxas de trabalho', () => {
    const input: BudgetFinancialRatesInput = { ...baseInput(), calendar: { ...baseInput().calendar, daysPerWeek: null } };
    const result = root(input);
    expect(result.currency).toBe('BRL');
    expect(result.sourceBasis).toBe('budget-calendar-period');
    expect(result.financialAssessment).toBe('not-evaluated');
    expect(result.source).toEqual({status:'ready',value:r('3200'),sourcePeriod:'month',targetPeriod:'month',basis:'budget-calendar-period'});

    verifyAmount(result.perMonth, 'month', '3200');
    verifyAmount(result.perWeek, 'week', '800');
    verifyAmount(result.perYear, 'year', '38400');
    const day = verifyUnavailableWorking(result.perWorkingDay);
    expect(day).toMatchObject({code:'missing-calendar-input',dependency:'daysPerWeek',denominator:null,diagnostic:null});
    expect(day.reason.trim().length).toBeGreaterThan(0);
    const hour = verifyUnavailableWorking(result.perConnectedHour);
    expect(hour).toMatchObject({code:'missing-calendar-input',dependency:'daysPerWeek',denominator:null,diagnostic:null});
    expect(hour.reason.trim().length).toBeGreaterThan(0);
  });

  it('perdas mensais ausentes bloqueiam apenas taxas de trabalho', () => {
    const input: BudgetFinancialRatesInput = { ...baseInput(), calendar: { ...baseInput().calendar, lostWorkingDaysPerMonth: undefined } };
    const result = root(input);
    expect(result.currency).toBe('BRL');
    expect(result.sourceBasis).toBe('budget-calendar-period');
    expect(result.financialAssessment).toBe('not-evaluated');
    expect(result.source).toEqual({status:'ready',value:r('3200'),sourcePeriod:'month',targetPeriod:'month',basis:'budget-calendar-period'});

    verifyAmount(result.perMonth, 'month', '3200');
    verifyAmount(result.perWeek, 'week', '800');
    verifyAmount(result.perYear, 'year', '38400');
    const day = verifyUnavailableWorking(result.perWorkingDay);
    expect(day).toMatchObject({code:'missing-calendar-input',dependency:'lostWorkingDaysPerMonth',denominator:null,diagnostic:null});
    expect(day.reason.trim().length).toBeGreaterThan(0);
    const hour = verifyUnavailableWorking(result.perConnectedHour);
    expect(hour).toMatchObject({code:'missing-calendar-input',dependency:'lostWorkingDaysPerMonth',denominator:null,diagnostic:null});
    expect(hour.reason.trim().length).toBeGreaterThan(0);
  });

  it('dias por mês ausentes preservam identidade mensal e anual', () => {
    const input: BudgetFinancialRatesInput = { ...baseInput(), calendar: { ...baseInput().calendar, daysPerMonth: null } };
    const result = root(input);
    expect(result.currency).toBe('BRL');
    expect(result.sourceBasis).toBe('budget-calendar-period');
    expect(result.financialAssessment).toBe('not-evaluated');
    expect(result.source).toEqual({status:'ready',value:r('3200'),sourcePeriod:'month',targetPeriod:'month',basis:'budget-calendar-period'});

    verifyAmount(result.perMonth, 'month', '3200');
    verifyAmount(result.perYear, 'year', '38400');
    const week = verifyMissingAmount(result.perWeek);
    expect(week).toMatchObject({code:'missing-calendar-input',dependency:'daysPerMonth'});
    expect(week.reason.trim().length).toBeGreaterThan(0);
    const day = verifyUnavailableWorking(result.perWorkingDay);
    expect(day).toMatchObject({code:'missing-calendar-input',dependency:'daysPerMonth',denominator:null,diagnostic:null});
    expect(day.reason.trim().length).toBeGreaterThan(0);
    const hour = verifyUnavailableWorking(result.perConnectedHour);
    expect(hour).toMatchObject({code:'missing-calendar-input',dependency:'daysPerMonth',denominator:null,diagnostic:null});
    expect(hour.reason.trim().length).toBeGreaterThan(0);
  });

  it('origem diária sem dias por mês preserva semana', () => {
    const input: BudgetFinancialRatesInput = {
      ...baseInput(),
      amount: r('100', '1'),
      sourcePeriod: 'day',
      calendar: { ...baseInput().calendar, daysPerMonth: undefined }
    };
    const result = root(input);
    expect(result.currency).toBe('BRL');
    expect(result.sourceBasis).toBe('budget-calendar-period');
    expect(result.financialAssessment).toBe('not-evaluated');
    expect(result.source).toEqual({status:'ready',value:r('100'),sourcePeriod:'day',targetPeriod:'day',basis:'budget-calendar-period'});

    expect(result.perWeek).toEqual({
      status: 'ready',
      value: r('700', '1'),
      sourcePeriod: 'day',
      targetPeriod: 'week',
      basis: 'budget-calendar-period'
    });
    const month = verifyMissingAmount(result.perMonth);
    expect(month).toMatchObject({code:'missing-calendar-input',dependency:'daysPerMonth'});
    expect(month.reason.trim().length).toBeGreaterThan(0);
    const year = verifyMissingAmount(result.perYear);
    expect(year).toMatchObject({code:'missing-calendar-input',dependency:'daysPerMonth'});
    expect(year.reason.trim().length).toBeGreaterThan(0);
    const day = verifyUnavailableWorking(result.perWorkingDay);
    expect(day).toMatchObject({code:'source-unavailable',dependency:'perMonth',denominator:null});
    expect(day.reason.trim().length).toBeGreaterThan(0);
    expect(day.diagnostic).toBe(result.perMonth);
    expect(day.reason).toBe(month.reason);
    const hour = verifyUnavailableWorking(result.perConnectedHour);
    expect(hour).toMatchObject({code:'source-unavailable',dependency:'perMonth',denominator:null});
    expect(hour.reason.trim().length).toBeGreaterThan(0);
    expect(hour.diagnostic).toBe(result.perMonth);
    expect(hour.reason).toBe(month.reason);
  });
});
