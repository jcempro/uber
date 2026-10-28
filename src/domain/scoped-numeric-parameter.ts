/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§4, FT-003.39.4.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type { NumericParameter } from './model';
import type { ExactLimits } from './exact-budget';
import { resolveNumericParameter, type NumericParameterResolution } from './numeric-parameter';
import { matchParameterScope, type ScopeMatchContext, type ScopeMatchResult } from './scope-match';

/** Quantidade matemática e escopo declarado não comprovam precedência ou evidência financeira. */
export type ScopedNumericParameterResult =
  | {readonly status:'scope-checked';readonly numeric:Extract<NumericParameterResolution,{status:'ready'}>;readonly scopeMatch:ScopeMatchResult;readonly financialAdmission:'not-evaluated'}
  | {readonly status:'unavailable';readonly stage:'numeric'|'selection'|'scope';readonly numeric:NumericParameterResolution;readonly scopeMatch:ScopeMatchResult|null;readonly reason:string;readonly financialAdmission:'not-evaluated'};

/** Resolve somente ID/unidade selecionados e seu contexto declarado; não seleciona substituições. */
export function resolveScopedNumericParameter(parameterId:string,expectedUnit:string,parameters:readonly NumericParameter[],limits:ExactLimits,context?:ScopeMatchContext):ScopedNumericParameterResult {
  const numeric=resolveNumericParameter(parameterId,expectedUnit,parameters,limits);
  if(numeric.status!=='ready')return Object.freeze({status:'unavailable',stage:'numeric',numeric,scopeMatch:null,reason:'Parâmetro numérico não resolvido; consulte o diagnóstico original.',financialAdmission:'not-evaluated'});
  const parameter=parameters.find(item=>item!==null&&typeof item==='object'&&item.id===numeric.parameterId);
  if(!parameter)return Object.freeze({status:'unavailable',stage:'selection',numeric,scopeMatch:null,reason:'Seleção alterada após a resolução do parâmetro.',financialAdmission:'not-evaluated'});
  const scopeMatch=matchParameterScope(parameter.provenance?.scope,context);
  if(scopeMatch.status!=='scope-matched')return Object.freeze({status:'unavailable',stage:'scope',numeric,scopeMatch,reason:scopeMatch.status==='unavailable'?scopeMatch.reason:'O escopo do parâmetro não corresponde ao contexto declarado.',financialAdmission:'not-evaluated'});
  return Object.freeze({status:'scope-checked',numeric,scopeMatch,financialAdmission:'not-evaluated'});
}
