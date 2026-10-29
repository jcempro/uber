/** MPL-2.0; RCF8.4; FT-003.42.2. Limiar de margem condicional; domínioB>0. */
import {inspectExactLimits,type ExactLimits} from './exact-budget';
import {calculateFinancialMarginTarget} from './financial-margin-target';
import {calculateExactSum} from './exact-sum';
import {calculateExactProduct} from './exact-product';
import {compareExactRationals} from './exact-compare';
import type {ExactRational} from './exact';
import type {BudgetPeriod} from './model';
import type {FinancialMarginTargetInput,FinancialMarginTargetResult} from './financial-margin-target';
import type {ExactProductFailure} from './exact-product';
import type {ExactSumFailure} from './exact-sum';
import type {ExactComparisonFailure} from './exact-compare';
export interface LinearMarginThresholdInput extends Omit<FinancialMarginTargetInput,'creditedRevenue'> {
    readonly model: { readonly kind: 'fixed-usage-linear'; readonly reason: string };
}
export type LinearMarginSolution =
  | { readonly case: 'minimum'; readonly minimumCreditedRevenue: ExactRational; readonly infimumCreditedRevenue: ExactRational; readonly minimumAttained: true }
  | { readonly case: 'all-positive'; readonly minimumCreditedRevenue: null; readonly infimumCreditedRevenue: ExactRational; readonly minimumAttained: false }
  | { readonly case: 'none'; readonly minimumCreditedRevenue: null; readonly infimumCreditedRevenue: null; readonly minimumAttained: false };
export type LinearMarginThresholdResult =
  | { readonly status: 'conditional'; readonly kind: 'projection'; readonly contextId: string; readonly period: BudgetPeriod; readonly model: { readonly kind: 'fixed-usage-linear'; readonly reason: string }; readonly financialAssessment: 'not-evaluated'; readonly costCoverage: 'not-evaluated'; readonly taxAssessment: 'not-evaluated'; readonly revenueDomain: 'strictly-positive'; readonly value: { readonly operatingCost: ExactRational; readonly requiredMarginPercent: ExactRational; readonly requiredMarginRatio: ExactRational; readonly remainingRevenueFactor: ExactRational; readonly marginRevenueFactor: ExactRational; readonly solution: LinearMarginSolution } }
  | { readonly status: 'unavailable'; readonly code: 'invalid-budget' | 'unsupported-model' | 'invalid-target' | 'projection-unavailable' | 'calculation-unavailable'; readonly reason: string; readonly marginTarget: FinancialMarginTargetResult | null; readonly calculation: ExactProductFailure | ExactSumFailure | ExactComparisonFailure | null };

type LinearMarginFailure = Extract<LinearMarginThresholdResult,{status:'unavailable'}>;
type LinearMarginContext = {
  readonly status:'ready';
  readonly limits:ExactLimits;
  readonly marginTarget:Extract<FinancialMarginTargetResult,{status:'conditional'}>;
  readonly model:LinearMarginThresholdInput['model'];
  readonly operatingCost:ExactRational;
  readonly remainingRevenueFactor:ExactRational;
  readonly requiredMarginPercent:ExactRational;
  readonly requiredMarginRatio:ExactRational;
  readonly marginRevenueFactor:ExactRational;
  readonly operatingCostOrder:-1|0|1;
  readonly marginRevenueOrder:-1|0|1;
};
type LinearMarginContextResult = LinearMarginContext|LinearMarginFailure;
function linearMarginFailure(code:LinearMarginFailure['code'],reason:string,marginTarget:FinancialMarginTargetResult|null=null,calculation:LinearMarginFailure['calculation']=null):LinearMarginFailure {
  return Object.freeze({status:'unavailable',code,reason,marginTarget,calculation});
}

function prepareLinearMarginContext(input: LinearMarginThresholdInput, limits: ExactLimits): LinearMarginContextResult {
  const snapshot = inspectExactLimits(limits);
  if (!snapshot.valid) {
    return linearMarginFailure('invalid-budget', snapshot.reason);
  }

  if (input === null || typeof input !== 'object') return linearMarginFailure('unsupported-model', 'Modelo linear declarado e justificativa não vazia são obrigatórios.');
  const rawModel = input.model;
  if (rawModel === null || typeof rawModel !== 'object') return linearMarginFailure('unsupported-model', 'Modelo linear declarado e justificativa não vazia são obrigatórios.');
  const { kind, reason } = rawModel;
  if (kind !== 'fixed-usage-linear' || typeof reason !== 'string' || reason.trim() === '') return linearMarginFailure('unsupported-model', 'Modelo linear declarado e justificativa não vazia são obrigatórios.');

  const zero: ExactRational = Object.freeze({ numerator: '0', denominator: '1' });
  const mt = calculateFinancialMarginTarget({ ...input, creditedRevenue: zero }, snapshot.limits);
  if (mt.status === 'unavailable') {
    return linearMarginFailure(mt.code, mt.reason, mt, mt.calculation);
  }

  const A = mt.projection.value.operatingCost;
  const G = mt.projection.value.remainingRevenueFactor;
  const L = mt.value.requiredMarginPercent;
  const m = mt.value.requiredMarginRatio;

  const hResult = calculateExactSum('subtract', G, m, snapshot.limits);
  if (hResult.status === 'unavailable') {
    return linearMarginFailure('calculation-unavailable', hResult.reason, mt, hResult);
  }
  const H = hResult.value;

  const cmpA = compareExactRationals(A, zero, snapshot.limits);
  if (cmpA.status === 'unavailable') {
    return linearMarginFailure('calculation-unavailable', cmpA.reason, mt, cmpA);
  }

  const cmpH = compareExactRationals(H, zero, snapshot.limits);
  if (cmpH.status === 'unavailable') {
    return linearMarginFailure('calculation-unavailable', cmpH.reason, mt, cmpH);
  }

  return Object.freeze({
    status: 'ready',
    limits: snapshot.limits,
    marginTarget: mt,
    model: Object.freeze({ kind, reason }),
    operatingCost: A,
    remainingRevenueFactor: G,
    requiredMarginPercent: L,
    requiredMarginRatio: m,
    marginRevenueFactor: H,
    operatingCostOrder: cmpA.order,
    marginRevenueOrder: cmpH.order
  });
}

type LinearMarginSolutionResult = {readonly status:'ready';readonly value:LinearMarginSolution}|LinearMarginFailure;

function solveLinearMarginContext(ctx: LinearMarginContext): LinearMarginSolutionResult {
  const zero: ExactRational = Object.freeze({ numerator: '0', denominator: '1' });

  if (ctx.operatingCostOrder > 0 && ctx.marginRevenueOrder > 0) {
    const r = calculateExactProduct('divide', ctx.operatingCost, ctx.marginRevenueFactor, ctx.limits);
    if (r.status === 'unavailable') {
      return linearMarginFailure('calculation-unavailable', r.reason, ctx.marginTarget, r);
    }
    const solution: LinearMarginSolution = Object.freeze({
      case: 'minimum',
      minimumCreditedRevenue: r.value,
      infimumCreditedRevenue: r.value,
      minimumAttained: true
    });
    return Object.freeze({ status: 'ready', value: solution });
  }

  if (ctx.operatingCostOrder === 0 && ctx.marginRevenueOrder >= 0) {
    const solution: LinearMarginSolution = Object.freeze({
      case: 'all-positive',
      minimumCreditedRevenue: null,
      infimumCreditedRevenue: zero,
      minimumAttained: false
    });
    return Object.freeze({ status: 'ready', value: solution });
  }

  const solution: LinearMarginSolution = Object.freeze({
    case: 'none',
    minimumCreditedRevenue: null,
    infimumCreditedRevenue: null,
    minimumAttained: false
  });
  return Object.freeze({ status: 'ready', value: solution });
}

export function calculateConditionalLinearMarginThreshold(input: LinearMarginThresholdInput, limits: ExactLimits): LinearMarginThresholdResult {
  const ctx = prepareLinearMarginContext(input, limits);
  if (ctx.status === 'unavailable') {
    return ctx;
  }

  const solved = solveLinearMarginContext(ctx);
  if (solved.status === 'unavailable') {
    return solved;
  }

  return Object.freeze({
    status: 'conditional',
    kind: 'projection',
    contextId: ctx.marginTarget.contextId,
    period: ctx.marginTarget.period,
    model: ctx.model,
    financialAssessment: 'not-evaluated',
    costCoverage: 'not-evaluated',
    taxAssessment: 'not-evaluated',
    revenueDomain: 'strictly-positive',
    value: Object.freeze({
      operatingCost: ctx.operatingCost,
      requiredMarginPercent: ctx.requiredMarginPercent,
      requiredMarginRatio: ctx.requiredMarginRatio,
      remainingRevenueFactor: ctx.remainingRevenueFactor,
      marginRevenueFactor: ctx.marginRevenueFactor,
      solution: solved.value
    })
  });
}
