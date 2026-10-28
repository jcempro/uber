import { describe, it, expect } from 'vitest';
import type { ExactRational } from './exact';
import type { BudgetFinancialRatesInput } from './budget-financial-rates';
import { calculateBudgetFinancialRates } from './budget-financial-rates';

function r(n: string, d = '1'): ExactRational {
  return { numerator: n, denominator: d };
}

describe('budget-financial-rates-signed', () => {
  it('quantia negativa preserva sinal e períodos', () => {
    const input: BudgetFinancialRatesInput = {
      currency: 'BRL',
      sourceBasis: 'budget-calendar-period',
      amount: r('-320', '1'),
      sourcePeriod: 'month',
      calendar: {
        kind: 'budget',
        daysPerMonth: r('28'),
        monthsPerYear: r('12'),
        daysPerWeek: r('4'),
        lostWorkingDaysPerMonth: r('0'),
        hoursPerWorkingDay: r('4'),
      },
    };
    const limits = { maxInputLength: 256, maxDigits: 64 };
    const result = calculateBudgetFinancialRates(input, limits);

    if (result.status !== 'conditional') throw Error(result.reason);
    expect(result.currency).toBe('BRL');
    expect(result.sourceBasis).toBe('budget-calendar-period');
    expect(result.source.status).toBe('ready');
    expect(result.source.value).toEqual(r('-320', '1'));
    expect(result.source.sourcePeriod).toBe('month');
    expect(result.source.targetPeriod).toBe('month');
    expect(result.source.basis).toBe('budget-calendar-period');
    expect(result.financialAssessment).toBe('not-evaluated');

    if (result.perMonth.status !== 'ready') throw Error(result.perMonth.reason);
    expect(result.perMonth.sourcePeriod).toBe(input.sourcePeriod);
    expect(result.perMonth.targetPeriod).toBe('month');
    expect(result.perMonth.basis).toBe('budget-calendar-period');
    expect(result.perMonth.value).toEqual(r('-320', '1'));

    if (result.perWeek.status !== 'ready') throw Error(result.perWeek.reason);
    expect(result.perWeek.sourcePeriod).toBe(input.sourcePeriod);
    expect(result.perWeek.targetPeriod).toBe('week');
    expect(result.perWeek.basis).toBe('budget-calendar-period');
    expect(result.perWeek.value).toEqual(r('-80', '1'));

    if (result.perYear.status !== 'ready') throw Error(result.perYear.reason);
    expect(result.perYear.sourcePeriod).toBe(input.sourcePeriod);
    expect(result.perYear.targetPeriod).toBe('year');
    expect(result.perYear.basis).toBe('budget-calendar-period');
    expect(result.perYear.value).toEqual(r('-3840', '1'));

    if (result.perWorkingDay.status !== 'ready') throw Error(result.perWorkingDay.reason);
    expect(result.perWorkingDay.unit).toBe('BRL/working-day');
    expect(result.perWorkingDay.amountPeriod).toBe('month');
    expect(result.perWorkingDay.sourceAmount).toEqual(r('-320', '1'));
    expect(result.perWorkingDay.denominator).toEqual(r('16', '1'));
    expect(result.perWorkingDay.value).toEqual(r('-20', '1'));

    if (result.perConnectedHour.status !== 'ready') throw Error(result.perConnectedHour.reason);
    expect(result.perConnectedHour.unit).toBe('BRL/connected-hour');
    expect(result.perConnectedHour.amountPeriod).toBe('month');
    expect(result.perConnectedHour.sourceAmount).toEqual(r('-320', '1'));
    expect(result.perConnectedHour.denominator).toEqual(r('64', '1'));
    expect(result.perConnectedHour.value).toEqual(r('-5', '1'));
  });

  it('dia de calendário conserva identidade de origem', () => {
    const input: BudgetFinancialRatesInput = {
      currency: 'BRL',
      sourceBasis: 'budget-calendar-period',
      amount: r('100', '1'),
      sourcePeriod: 'day',
      calendar: {
        kind: 'budget',
        daysPerMonth: r('28'),
        monthsPerYear: r('12'),
        daysPerWeek: r('4'),
        lostWorkingDaysPerMonth: r('0'),
        hoursPerWorkingDay: r('4'),
      },
    };
    const limits = { maxInputLength: 256, maxDigits: 64 };
    const result = calculateBudgetFinancialRates(input, limits);

    if (result.status !== 'conditional') throw Error(result.reason);
    expect(result.currency).toBe('BRL');
    expect(result.sourceBasis).toBe('budget-calendar-period');
    expect(result.source.status).toBe('ready');
    expect(result.source.value).toEqual(r('100', '1'));
    expect(result.source.sourcePeriod).toBe('day');
    expect(result.source.targetPeriod).toBe('day');
    expect(result.source.basis).toBe('budget-calendar-period');
    expect(result.financialAssessment).toBe('not-evaluated');

    if (result.perMonth.status !== 'ready') throw Error(result.perMonth.reason);
    expect(result.perMonth.sourcePeriod).toBe(input.sourcePeriod);
    expect(result.perMonth.targetPeriod).toBe('month');
    expect(result.perMonth.basis).toBe('budget-calendar-period');
    expect(result.perMonth.value).toEqual(r('2800', '1'));

    if (result.perWeek.status !== 'ready') throw Error(result.perWeek.reason);
    expect(result.perWeek.sourcePeriod).toBe(input.sourcePeriod);
    expect(result.perWeek.targetPeriod).toBe('week');
    expect(result.perWeek.basis).toBe('budget-calendar-period');
    expect(result.perWeek.value).toEqual(r('700', '1'));

    if (result.perYear.status !== 'ready') throw Error(result.perYear.reason);
    expect(result.perYear.sourcePeriod).toBe(input.sourcePeriod);
    expect(result.perYear.targetPeriod).toBe('year');
    expect(result.perYear.basis).toBe('budget-calendar-period');
    expect(result.perYear.value).toEqual(r('33600', '1'));

    if (result.perWorkingDay.status !== 'ready') throw Error(result.perWorkingDay.reason);
    expect(result.perWorkingDay.unit).toBe('BRL/working-day');
    expect(result.perWorkingDay.amountPeriod).toBe('month');
    expect(result.perWorkingDay.sourceAmount).toEqual(r('2800', '1'));
    expect(result.perWorkingDay.denominator).toEqual(r('16', '1'));
    expect(result.perWorkingDay.value).toEqual(r('175', '1'));
    expect(result.source.value).not.toEqual(result.perWorkingDay.value);

    if (result.perConnectedHour.status !== 'ready') throw Error(result.perConnectedHour.reason);
    expect(result.perConnectedHour.unit).toBe('BRL/connected-hour');
    expect(result.perConnectedHour.amountPeriod).toBe('month');
    expect(result.perConnectedHour.sourceAmount).toEqual(r('2800', '1'));
    expect(result.perConnectedHour.denominator).toEqual(r('64', '1'));
    expect(result.perConnectedHour.value).toEqual(r('175', '4'));
  });
});
