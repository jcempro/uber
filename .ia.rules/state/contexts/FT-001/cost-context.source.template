/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.1, FT-003.39.3b.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 * Composição limitada de referências, vigência e escopo declarado; não admite quantias.
 */
import type { CostItem } from './model';
import type { CostRequirement } from './cost-requirement';
import type { ClosedDateInterval } from './cost-validity';
import { resolveCostRequirementPeriod, type CostRequirementPeriodResult } from './cost-period';
import { matchParameterScope, type ScopeMatchContext, type ScopeMatchResult } from './scope-match';
/** Evidência do contexto declarado; não comprova vínculo cadastral ou precedência. */
export interface CostScopeCheck {
  readonly subject: 'requirement' | 'cost-item';
  readonly subjectId: string;
  readonly match: ScopeMatchResult;
}
/** Lacunas e escopo alheio nunca se tornam custo zero ou admissão financeira. */
export type CostRequirementContextResult =
  | {readonly status:'unavailable';readonly stage:'period'|'scope'|'selection';readonly period:CostRequirementPeriodResult;readonly costItemId:string|null;readonly reason:string;readonly scopeMatch:ScopeMatchResult|null;readonly costAdmission:'not-evaluated'}
  | {readonly status:'context-checked';readonly period:Extract<CostRequirementPeriodResult,{status:'period-covered'}>;readonly scopeChecks:readonly CostScopeCheck[];readonly costAdmission:'not-evaluated'}
  | {readonly status:'declared-not-applicable';readonly period:Extract<CostRequirementPeriodResult,{status:'declared-not-applicable'}>;readonly scopeChecks:readonly CostScopeCheck[];readonly costAdmission:'not-evaluated'};
/** Todos os escopos pertinentes devem corresponder; não seleciona substituições ou custos. */
export function resolveCostRequirementContext(requirement: CostRequirement, selectedCosts: readonly CostItem[], interval: ClosedDateInterval, context?: ScopeMatchContext): CostRequirementContextResult {
    const period = resolveCostRequirementPeriod(requirement, selectedCosts, interval);
    if (period.status === 'unavailable') {
        return Object.freeze({ status: 'unavailable', stage: 'period', period, scopeMatch: null, costAdmission: 'not-evaluated', costItemId: period.costItemId, reason: period.reason });
    }
    const scopeMatch = matchParameterScope(requirement.provenance?.scope, context);
    if (scopeMatch.status !== 'scope-matched') {
        return Object.freeze({ status: 'unavailable', stage: 'scope', period, scopeMatch, reason: scopeMatch.status === "unavailable" ? scopeMatch.reason : "Escopo declarado n\u00E3o corresponde ao contexto solicitado.", costItemId: null, costAdmission: "not-evaluated" });
    }
    const check = Object.freeze({ subject: 'requirement', subjectId: period.requirementId, match: scopeMatch });
    if (period.status === 'declared-not-applicable') {
        return Object.freeze({ status: 'declared-not-applicable', period, scopeChecks: Object.freeze([check]), costAdmission: 'not-evaluated' });
    }
    const scopeChecks: CostScopeCheck[] = [check];
    for (const id of period.costItemIds) {
        const item = selectedCosts.find(c => c !== null && typeof c === 'object' && c.id === id);
        if (!item) {
            return Object.freeze({ status: 'unavailable', stage: 'selection', period, scopeMatch: null, reason: `custo selecionado não encontrado: ${id}`, costItemId: id, costAdmission: "not-evaluated" });
        }
        const itemScope = matchParameterScope(item.provenance?.scope, context);
        if (itemScope.status !== 'scope-matched') {
            return Object.freeze({ status: 'unavailable', stage: 'scope', period, scopeMatch: itemScope, reason: itemScope.status === "unavailable" ? itemScope.reason : "Escopo declarado n\u00E3o corresponde ao contexto solicitado.", costItemId: id, costAdmission: "not-evaluated" });
        }
        scopeChecks.push(Object.freeze({ subject: 'cost-item', subjectId: id, match: itemScope }));
    }
    return Object.freeze({ status: 'context-checked', period, scopeChecks: Object.freeze(scopeChecks), costAdmission: 'not-evaluated' });
}
