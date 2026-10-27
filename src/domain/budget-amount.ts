/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§7.2/8.1, FT-003.29.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type { BudgetPeriod } from './model';
import type { ExactRational } from './exact';
import { inspectExactLimits } from './exact-budget';
import type { ExactLimits } from './exact-budget';
import { calculateExactProduct } from './exact-product';
import type { ExactProductFailure } from './exact-product';
import { compareExactRationals } from './exact-compare';
import type { ExactComparisonFailure } from './exact-compare';

/** Convenção orçamentária; null/ausência não significam zero nem defaults30/12. */
export type BudgetAmountContext = {
  readonly kind: 'budget';
  readonly daysPerMonth?: ExactRational | null;
  readonly monthsPerYear?: ExactRational | null;
};
/** Quantia por período de calendário orçamentário; day não representa dia trabalhado. */
export type BudgetAmountResult =
  | { readonly status: 'ready'; readonly value: ExactRational; readonly sourcePeriod: BudgetPeriod; readonly targetPeriod: BudgetPeriod; readonly basis: 'budget-calendar-period' }
  | ExactProductFailure
  | ExactComparisonFailure
  | { readonly status: 'unavailable'; readonly code: 'invalid-period' | 'unsupported-calendar'; readonly reason: string }
  | { readonly status: 'unavailable'; readonly code: 'missing-calendar-input' | 'invalid-calendar'; readonly dependency: 'daysPerMonth' | 'monthsPerYear'; readonly reason: string };

/** Operando de uma ligação dimensional fechada, sem linguagem executável externa. */
type Operand = 'seven' | 'daysPerMonth' | 'monthsPerYear';
/** Passo exato delegado à biblioteca, nunca arredondamento monetário. */
type Step = readonly ['multiply' | 'divide', Operand];

// Razões simplificadas antes de exigir dados: identidade e dia↔semana dispensam mês/ano.
const plans: Readonly<Record<BudgetPeriod, Readonly<Record<BudgetPeriod, readonly Step[]>>>> = {
  day: { day: [], week: [['multiply','seven']], month: [['multiply','daysPerMonth']], year: [['multiply','daysPerMonth'],['multiply','monthsPerYear']] },
  week: { day: [['divide','seven']], week: [], month: [['multiply','daysPerMonth'],['divide','seven']], year: [['multiply','daysPerMonth'],['multiply','monthsPerYear'],['divide','seven']] },
  month: { day: [['divide','daysPerMonth']], week: [['multiply','seven'],['divide','daysPerMonth']], month: [], year: [['multiply','monthsPerYear']] },
  year: { day: [['divide','monthsPerYear'],['divide','daysPerMonth']], week: [['multiply','seven'],['divide','monthsPerYear'],['divide','daysPerMonth']], month: [['divide','monthsPerYear']], year: [] },
};
/** Reconhece apenas as quatro identidades de período já declaradas no modelo. */
function isBudgetPeriod(value: unknown): value is BudgetPeriod {
  return value === 'day' || value === 'week' || value === 'month' || value === 'year';
}

/**
 * Converte quantia assinada entre períodos de calendário orçamentário, sem arredondar.
 * Lucro pode ser negativo; o consumidor de custos deve validar custos não negativos.
 * Não aplica a pagamentos pontuais/provisões, datas reais ou dias/horas trabalhados.
 * Exige somente os dados dimensionais usados pela rota, preservando resultados independentes.
 */
export function convertBudgetCalendarAmount(
  amount: ExactRational,
  from: BudgetPeriod,
  to: BudgetPeriod,
  context: BudgetAmountContext,
  limits: ExactLimits,
): BudgetAmountResult {
  const policy = inspectExactLimits(limits);
  if (!policy.valid) return Object.freeze({ status: 'unavailable', code: 'invalid-budget', reason: policy.reason });
  if (context === null || typeof context !== 'object' || context.kind !== 'budget') {
    return Object.freeze({ status: 'unavailable', code: 'unsupported-calendar', reason: 'A conversão exige calendário orçamentário; competências reais precisam de regra própria.' });
  }
  if (!isBudgetPeriod(from) || !isBudgetPeriod(to)) {
    return Object.freeze({ status: 'unavailable', code: 'invalid-period', reason: 'Período não reconhecido: use dia de calendário, semana, mês ou ano.' });
  }
  const one: ExactRational = Object.freeze({ numerator: '1', denominator: '1' });
  const zero: ExactRational = Object.freeze({ numerator: '0', denominator: '1' });
  const seven: ExactRational = Object.freeze({ numerator: '7', denominator: '1' });
  const operands = new Map<Operand, ExactRational>([['seven', seven]]);
  const steps = plans[from][to];
  // Validar as dependências necessárias antes de materializar a conversão.
  for (const [,key] of steps) {
    if (key === 'seven' || operands.has(key)) continue;
    const operand = context[key];
    if (operand === null || operand === undefined) {
      return Object.freeze({ status: 'unavailable', code: 'missing-calendar-input', dependency: key, reason: 'Premissa necessária da convenção orçamentária não informada: ' + key + '.' });
    }
    const positive = compareExactRationals(operand, zero, policy.limits);
    if (positive.status !== 'ready') return positive;
    if (positive.order <= 0) {
      return Object.freeze({ status: 'unavailable', code: 'invalid-calendar', dependency: key, reason: 'A premissa necessária da convenção orçamentária deve ser positiva: ' + key + '.' });
    }
    operands.set(key, operand);
  }
  // Mesmo na identidade, normalizar e validar a representação sem copiar objeto mutável.
  const normalized = calculateExactProduct('multiply', amount, one, policy.limits);
  if (normalized.status !== 'ready') return normalized;
  let value = normalized.value;
  for (const [operation,key] of steps) {
    const operand = operands.get(key);
    if (!operand) {
      return Object.freeze({ status: 'unavailable', code: 'arithmetic-failure', reason: 'Dependência da conversão não materializada.' });
    }
    const product = calculateExactProduct(operation, value, operand, policy.limits);
    if (product.status !== 'ready') return product;
    value = product.value;
  }
  return Object.freeze({ status: 'ready', value, sourcePeriod: from, targetPeriod: to, basis: 'budget-calendar-period' });
}
