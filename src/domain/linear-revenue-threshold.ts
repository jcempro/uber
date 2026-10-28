/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§8.2, FT-003.40.1a.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { inspectExactLimits, type ExactLimits } from './exact-budget';
import type { ExactRational } from './exact';
import { calculateFinancialProjection, type FinancialProjectionInput, type FinancialProjectionResult } from './financial-result';
import { calculateExactProduct, type ExactProductFailure } from './exact-product';
import { calculateExactSum, type ExactSumFailure } from './exact-sum';
import { compareExactRationals, type ExactComparisonFailure } from './exact-compare';
import type { BudgetPeriod } from './model';
export interface LinearRevenueThresholdInput extends Omit<FinancialProjectionInput, 'creditedRevenue'> {
    readonly targetProfit: ExactRational;
    readonly model: {
        readonly kind: 'fixed-usage-linear';
        readonly reason: string;
    };
}
type ConditionalResult = {
    readonly status: 'conditional';
    readonly kind: 'projection';
    readonly contextId: string;
    readonly period: BudgetPeriod;
    readonly model: {
        readonly kind: 'fixed-usage-linear';
        readonly reason: string;
    };
    readonly financialAssessment: 'not-evaluated';
    readonly taxAssessment: 'not-evaluated';
    readonly costCoverage: 'not-evaluated';
    readonly value: {
        readonly requiredCreditedRevenue: ExactRational;
        readonly operatingCost: ExactRational;
        readonly targetProfit: ExactRational;
        readonly remainingRevenueFactor: ExactRational;
    };
};
type UnavailableResult = {
    readonly status: 'unavailable';
    readonly code: 'invalid-budget' | 'unsupported-model' | 'invalid-target' | 'projection-unavailable' | 'calculation-unavailable' | 'non-positive-revenue-factor';
    readonly reason: string;
    readonly projection: FinancialProjectionResult | null;
    readonly calculation: ExactComparisonFailure | ExactProductFailure | ExactSumFailure | null;
};
export type LinearRevenueThresholdResult = ConditionalResult | UnavailableResult;
export function calculateConditionalLinearRevenueThreshold(input: LinearRevenueThresholdInput, limits: ExactLimits): LinearRevenueThresholdResult {
    const inspect = inspectExactLimits(limits);
    if (!inspect.valid) {
        return Object.freeze({ status: "unavailable", code: 'invalid-budget', reason: inspect.reason, projection: null, calculation: null });
    }
    if (input === null || typeof input !== 'object' || input.model === null || typeof input.model !== 'object' || input.model.kind !== 'fixed-usage-linear' || typeof input.model.reason !== 'string' || input.model.reason.trim() === '') {
        return Object.freeze({ status: "unavailable", code: 'unsupported-model', reason: "Declare um modelo de custos e uso est\u00E1veis, com encargos lineares e fundamento textual.", projection: null, calculation: null });
    }
    const financialInput: FinancialProjectionInput = Object.freeze({
        kind: input.kind,
        contextId: input.contextId,
        period: input.period,
        creditedRevenue: Object.freeze({ numerator: '0', denominator: '1' }),
        fixedCosts: input.fixedCosts,
        usageCosts: input.usageCosts,
        extraordinaryCosts: input.extraordinaryCosts,
        fixedTaxes: input.fixedTaxes,
        titheRate: input.titheRate,
        revenueTaxRate: input.revenueTaxRate,
    });
    const projectionResult = calculateFinancialProjection(financialInput, inspect.limits);
    if (projectionResult.status !== 'ready') {
        return Object.freeze({ status: "unavailable", code: 'projection-unavailable', reason: projectionResult.reason, projection: projectionResult, calculation: null });
    }
    const A = projectionResult.value.operatingCost;
    const one: ExactRational = Object.freeze({ numerator: '1', denominator: '1' });
    const G = projectionResult.value.remainingRevenueFactor;
    const targetProduct = calculateExactProduct('multiply', input.targetProfit, one, inspect.limits);
    if (targetProduct.status === 'unavailable') {
        return Object.freeze({ status: "unavailable", code: 'calculation-unavailable', reason: targetProduct.reason, projection: projectionResult, calculation: targetProduct });
    }
    const targetCompare = compareExactRationals(targetProduct.value, Object.freeze({ numerator: '0', denominator: '1' }), inspect.limits);
    if (targetCompare.status === 'unavailable') {
        return Object.freeze({ status: "unavailable", code: 'calculation-unavailable', reason: targetCompare.reason, projection: projectionResult, calculation: targetCompare });
    }
    if (targetCompare.order < 0) {
        return Object.freeze({ status: "unavailable", code: 'invalid-target', reason: 'O lucro alvo deve ser não negativo.', projection: projectionResult, calculation: null });
    }
    const GCompare = compareExactRationals(G, Object.freeze({ numerator: '0', denominator: '1' }), inspect.limits);
    if (GCompare.status === 'unavailable') {
        return Object.freeze({ status: "unavailable", code: 'calculation-unavailable', reason: GCompare.reason, projection: projectionResult, calculation: GCompare });
    }
    if (GCompare.order <= 0) {
        return Object.freeze({ status: "unavailable", code: 'non-positive-revenue-factor', reason: 'A inversão linear exige G positivo; esta fórmula não resolve o caso informado.', projection: projectionResult, calculation: null });
    }
    const sum = calculateExactSum('add', A, targetProduct.value, inspect.limits);
    if (sum.status === 'unavailable') {
        return Object.freeze({ status: "unavailable", code: 'calculation-unavailable', reason: sum.reason, projection: projectionResult, calculation: sum });
    }
    const B = calculateExactProduct('divide', sum.value, G, inspect.limits);
    if (B.status === 'unavailable') {
        return Object.freeze({ status: "unavailable", code: 'calculation-unavailable', reason: B.reason, projection: projectionResult, calculation: B });
    }
    return Object.freeze({
        status: "conditional",
        kind: 'projection',
        contextId: input.contextId,
        period: input.period,
        model: Object.freeze({ kind: 'fixed-usage-linear', reason: input.model.reason }),
        financialAssessment: 'not-evaluated',
        taxAssessment: 'not-evaluated',
        costCoverage: 'not-evaluated',
        value: Object.freeze({
            requiredCreditedRevenue: B.value,
            operatingCost: A,
            targetProfit: targetProduct.value,
            remainingRevenueFactor: projectionResult.value.remainingRevenueFactor
        })
    });
}
