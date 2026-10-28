/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§8.3, FT-003.40.2.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { inspectExactLimits, type ExactLimits } from './exact-budget';
import type { ExactRational } from './exact';
import type { BudgetPeriod } from './model';
import { calculateFinancialProjection, type FinancialProjectionInput, type FinancialProjectionResult } from './financial-result';
import { calculateExactProduct, type ExactProductFailure } from './exact-product';
import { calculateExactSum, type ExactSumFailure } from './exact-sum';
import { compareExactRationals, type ExactComparisonFailure } from './exact-compare';
export interface FinancialTargetGapInput extends FinancialProjectionInput {
    readonly targetProfit: ExactRational;
}
export type FinancialTargetGapResult = {
    readonly status: 'conditional';
    readonly kind: 'projection';
    readonly contextId: string;
    readonly period: BudgetPeriod;
    readonly costCoverage: 'not-evaluated';
    readonly taxAssessment: 'not-evaluated';
    readonly projection: Extract<FinancialProjectionResult, {
        status: 'ready';
    }>;
    readonly value: {
        readonly targetProfit: ExactRational;
        readonly signedTargetSlack: ExactRational;
        readonly profitShortfall: ExactRational;
        readonly modeledCoverageShortfall: ExactRational;
        readonly coversModeledCosts: boolean;
        readonly reachesModeledTarget: boolean;
    };
} | {
    readonly status: 'unavailable';
    readonly code: 'invalid-budget' | 'projection-unavailable' | 'invalid-target' | 'calculation-unavailable';
    readonly reason: string;
    readonly projection: FinancialProjectionResult | null;
    readonly calculation: ExactComparisonFailure | ExactProductFailure | ExactSumFailure | null;
};
/** Somente resultado econômico do modelo; completude/evidência legal/empírica não atestadas. */
export function calculateFinancialTargetGap(input: FinancialTargetGapInput, limits: ExactLimits): FinancialTargetGapResult {
    // Inspect limits
    const limitsValidation = inspectExactLimits(limits);
    if (!limitsValidation.valid) {
        return Object.freeze({
            status: 'unavailable',
            code: 'invalid-budget',
            reason: limitsValidation.reason,
            projection: null,
            calculation: null
        });
    }
    // Calculate financial projection
    const projection = calculateFinancialProjection(input, limitsValidation.limits);
    if (projection.status !== 'ready') {
        return Object.freeze({
            status: 'unavailable',
            code: 'projection-unavailable',
            reason: projection.reason,
            projection,
            calculation: null
        });
    }
    // Normalize target profit with ONE (1/1)
    const one: ExactRational = Object.freeze({ numerator: '1', denominator: '1' });
    const normalizedTarget = calculateExactProduct('multiply', input.targetProfit, one, limitsValidation.limits);
    if (normalizedTarget.status !== 'ready') {
        return Object.freeze({
            status: 'unavailable',
            code: "calculation-unavailable",
            reason: normalizedTarget.reason,
            projection,
            calculation: normalizedTarget
        });
    }
    // Compare normalized target with ZERO (0/1)
    const zero: ExactRational = Object.freeze({ numerator: '0', denominator: '1' });
    const comparison = compareExactRationals(normalizedTarget.value, zero, limitsValidation.limits);
    if (comparison.status !== 'ready') {
        return Object.freeze({
            status: 'unavailable',
            code: "calculation-unavailable",
            reason: comparison.reason,
            projection,
            calculation: comparison
        });
    }
    // Target must be non-negative
    if (comparison.order < 0) {
        return Object.freeze({
            status: 'unavailable',
            code: 'invalid-target',
            reason: 'O lucro alvo deve ser não negativo.',
            projection,
            calculation: null
        });
    }
    // Calculate signedTargetSlack = projection.value.netProfit - targetProfit
    const signedTargetSlack = calculateExactSum('subtract', projection.value.netProfit, normalizedTarget.value, limitsValidation.limits);
    if (signedTargetSlack.status !== 'ready') {
        return Object.freeze({
            status: 'unavailable',
            code: 'calculation-unavailable',
            reason: signedTargetSlack.reason,
            projection,
            calculation: signedTargetSlack
        });
    }
    // Lucro líquido final já calculado pelo módulo de projeção.
    const llf = projection.value.netProfit;
    // Calculate profitShortfall = max(0, -signedTargetSlack) = max(0, targetProfit - netProfit)
    let profitShortfall: ExactRational;
    const slackComparison = compareExactRationals(signedTargetSlack.value, zero, limitsValidation.limits);
    if (slackComparison.status !== 'ready') {
        return Object.freeze({
            status: 'unavailable',
            code: 'calculation-unavailable',
            reason: slackComparison.reason,
            projection,
            calculation: slackComparison
        });
    }
    if (slackComparison.order >= 0) {
        profitShortfall = zero;
    }
    else {
        const shortfallCalc = calculateExactSum('subtract', zero, signedTargetSlack.value, limitsValidation.limits);
        if (shortfallCalc.status !== 'ready') {
            return Object.freeze({
                status: 'unavailable',
                code: 'calculation-unavailable',
                reason: shortfallCalc.reason,
                projection,
                calculation: shortfallCalc
            });
        }
        profitShortfall = shortfallCalc.value;
    }
    // Calculate modeledCoverageShortfall = max(0, -LLF)
    let modeledCoverageShortfall: ExactRational;
    const llfComparison = compareExactRationals(llf, zero, limitsValidation.limits);
    if (llfComparison.status !== 'ready') {
        return Object.freeze({
            status: 'unavailable',
            code: 'calculation-unavailable',
            reason: llfComparison.reason,
            projection,
            calculation: llfComparison
        });
    }
    if (llfComparison.order >= 0) {
        modeledCoverageShortfall = zero;
    }
    else {
        const coverageShortfallCalc = calculateExactSum('subtract', zero, llf, limitsValidation.limits);
        if (coverageShortfallCalc.status !== 'ready') {
            return Object.freeze({
                status: 'unavailable',
                code: 'calculation-unavailable',
                reason: coverageShortfallCalc.reason,
                projection,
                calculation: coverageShortfallCalc
            });
        }
        modeledCoverageShortfall = coverageShortfallCalc.value;
    }
    // Booleans: coversModeledCosts = (LLF >= 0), reachesModeledTarget = (folga >= 0)
    const coversModeledCosts = llfComparison.order >= 0;
    const reachesModeledTarget = slackComparison.order >= 0;
    return Object.freeze({
        status: 'conditional',
        kind: 'projection',
        contextId: projection.contextId,
        period: projection.period,
        costCoverage: 'not-evaluated',
        taxAssessment: 'not-evaluated',
        projection,
        value: Object.freeze({
            targetProfit: normalizedTarget.value,
            signedTargetSlack: signedTargetSlack.value,
            profitShortfall,
            modeledCoverageShortfall,
            coversModeledCosts,
            reachesModeledTarget
        })
    });
}
