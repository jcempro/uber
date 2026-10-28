/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.1, FT-003.39.1a.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type { CostItem } from './model';
import type { CostRequirement } from './cost-requirement';
import { resolveCostRequirementReferences, type CostRequirementReferencesResult } from './cost-references';
import { classifyClosedCostValidity, type ClosedDateInterval, type ClosedCostValidityResult } from './cost-validity';

/** Somente vínculos e vigência; nenhum ramo admite quantia ou cobertura financeira. */
export type CostRequirementPeriodResult =
  | {readonly status:'period-covered';readonly requirementId:string;readonly costItemIds:readonly string[];readonly interval:ClosedDateInterval;readonly costAdmission:'not-evaluated'}
  | (Extract<CostRequirementReferencesResult,{status:'declared-not-applicable'}> & {readonly costAdmission:'not-evaluated'})
  | {readonly status:'unavailable';readonly stage:'references'|'validity';readonly requirementId:string|null;readonly costItemId:string|null;readonly reason:string;readonly references:CostRequirementReferencesResult;readonly validity:ClosedCostValidityResult|null;readonly costAdmission:'not-evaluated'};

/** Preserva o diagnóstico original e o vínculo exato, sem convertê-los em custo zero. */
function unavailable(stage:'references'|'validity',references:CostRequirementReferencesResult,reason:string,costItemId:string|null,validity:ClosedCostValidityResult|null=null):CostRequirementPeriodResult {
  return Object.freeze({status:'unavailable',stage,requirementId:references.requirementId,costItemId,reason,references,validity,costAdmission:'not-evaluated'});
}

/** Compõe os validadores canônicos; não seleciona escopo nem calcula incidência, rateio ou quantias. */
export function resolveCostRequirementPeriod(requirement:CostRequirement,selectedCosts:readonly CostItem[],interval:ClosedDateInterval):CostRequirementPeriodResult {
  const references=resolveCostRequirementReferences(requirement,selectedCosts);
  if(references.status==='unavailable') return unavailable('references',references,references.reason,references.costItemId);
  if(references.status==='declared-not-applicable') return Object.freeze({...references,costAdmission:'not-evaluated' as const});
  let checkedInterval:ClosedDateInterval|undefined;
  for(const id of references.costItemIds) {
    const item=selectedCosts.find(candidate=>candidate!==null&&typeof candidate==='object'&&candidate.id===id);
    if(!item) return unavailable('references',references,'Seleção de custos alterada após a resolução do vínculo.',id);
    const validity=classifyClosedCostValidity(item.validity,interval);
    if(validity.status==='unavailable') return unavailable('validity',references,validity.reason,id,validity);
    if(validity.relation!=='covers-interval') return unavailable('validity',references,validity.relation==='outside-interval'?'Vigência fora do intervalo solicitado; custo não apurado.':'Vigência parcial; incidência e regra de rateio não apuradas.',id,validity);
    checkedInterval=validity.interval;
  }
  if(!checkedInterval) return unavailable('references',references,'Nenhuma referência temporal foi verificada.',null);
  return Object.freeze({status:'period-covered',requirementId:references.requirementId,costItemIds:references.costItemIds,interval:checkedInterval,costAdmission:'not-evaluated'});
}
