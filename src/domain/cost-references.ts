/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§8.1, FT-003.35.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type {CostRequirement} from './cost-requirement';
import type {CostItem} from './model';
export type CostRequirementReferencesResult=
  | {readonly status:'references-resolved';readonly requirementId:string;readonly costItemIds:readonly string[];readonly financialCoverage:'not-evaluated'}
  | {readonly status:'declared-not-applicable';readonly requirementId:string;readonly reason:string;readonly financialCoverage:'not-evaluated'}
  | {readonly status:'unavailable';readonly requirementId:string|null;readonly code:'invalid-requirement'|'unverified-applicability'|'invalid-cost-collection'|'missing-cost-item'|'ambiguous-cost-item'|'inactive-cost-item'|'invalid-cost-item';readonly reason:string;readonly costItemId:string|null};
function failure(code:Extract<CostRequirementReferencesResult,{status:'unavailable'}>['code'],reason:string,requirementId:string|null=null,costItemId:string|null=null):CostRequirementReferencesResult {
  return Object.freeze({status:'unavailable',requirementId,code,reason,costItemId});
}
/**
 * Resolve apenas vínculos literais no catálogo já selecionado pelo chamador.
 * Não seleciona escopo/precedência, calcula quantias ou valida vigência, pertinência,
 * proveniência, reconhecimento, reconciliação ou cobertura financeira do catálogo.
 */
export function resolveCostRequirementReferences(requirement:CostRequirement,selectedCosts:readonly CostItem[]):CostRequirementReferencesResult {
  if(requirement===null||typeof requirement!=='object'||typeof requirement.id!=='string'||requirement.id.trim()==='')
    return failure('invalid-requirement','Identidade da rubrica é obrigatória.');
  const id=requirement.id;
  if(requirement.status==='unverified'||requirement.status==='not-applicable'){
    if(Object.hasOwn(requirement,'costItemIds')||typeof requirement.reason!=='string'||requirement.reason.trim()==='')
      return failure('invalid-requirement','Rubrica não aplicável ou não verificada exige motivo e não admite referências ativas.',id);
    if(requirement.status==='unverified')return failure('unverified-applicability',requirement.reason,id);
    return Object.freeze({status:'declared-not-applicable',requirementId:id,reason:requirement.reason,financialCoverage:'not-evaluated'});
  }
  if(requirement.status!=='applicable'||!Array.isArray(requirement.costItemIds)||requirement.costItemIds.length===0)
    return failure('invalid-requirement','Rubrica aplicável exige referências de custo não vazias.',id);
  const refs=requirement.costItemIds,seen=new Set<string>();
  for(const ref of refs){
    if(typeof ref!=='string'||ref.trim()===''||seen.has(ref))
      return failure('invalid-requirement','Referência de custo vazia, inválida ou repetida.',id,typeof ref==='string'?ref:null);
    seen.add(ref);
  }
  if(!Array.isArray(selectedCosts))return failure('invalid-cost-collection','Catálogo de custos selecionados deve ser uma lista.',id);
  for(const ref of refs){
    const matches=selectedCosts.filter(cost=>cost!==null&&typeof cost==='object'&&cost.id===ref);
    if(matches.length>1)return failure('ambiguous-cost-item','Referência de custo ambígua no catálogo selecionado.',id,ref);
    const cost=matches[0];
    if(!cost)return failure('missing-cost-item','Referência de custo ausente no catálogo selecionado.',id,ref);
    if(typeof cost.enabled!=='boolean')return failure('invalid-cost-item','Estado de ativação do custo é inválido.',id,ref);
    if(!cost.enabled)return failure('inactive-cost-item','Custo desativado não comprova inaplicabilidade ou valor zero da rubrica.',id,ref);
  }
  return Object.freeze({status:'references-resolved',requirementId:id,costItemIds:Object.freeze([...refs]),financialCoverage:'not-evaluated'});
}
