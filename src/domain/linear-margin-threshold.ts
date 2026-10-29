/** MPL-2.0; RCF8.4; FT-003.42.1a. Contrato de tipos; cálculo ainda pendente. */
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
