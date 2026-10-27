/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§8.1/8.2, FT-003.34c.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type {ExactLimits,ExactRational} from './exact';
import {inspectExactLimits} from './exact-budget';
import {compareExactRationals} from './exact-compare';
import {calculateExactSum} from './exact-sum';
import type {ExactSumFailure} from './exact-sum';
export interface OperatingCostInput {
  readonly fixedCosts:ExactRational;
  readonly usageCosts:ExactRational;
  readonly extraordinaryCosts:ExactRational;
  readonly fixedTaxes:ExactRational;
}
export type OperatingCostComponent=keyof OperatingCostInput;
export type OperatingCostResult=
  | {readonly status:'ready';readonly value:ExactRational;readonly costAdmission:'not-evaluated'}
  | {readonly status:'unavailable';readonly code:'invalid-budget'|'invalid-cost'|'calculation-unavailable';readonly reason:string;readonly component:OperatingCostComponent|null;readonly calculation:ExactSumFailure|null};
const zero:ExactRational=Object.freeze({numerator:'0',denominator:'1'});
const components=Object.freeze(['fixedCosts','usageCosts','extraordinaryCosts','fixedTaxes'] as const);
function failure(code:Extract<OperatingCostResult,{status:'unavailable'}>['code'],reason:string,component:OperatingCostComponent|null=null,calculation:ExactSumFailure|null=null):OperatingCostResult {
  return Object.freeze({status:'unavailable',code,reason,component,calculation});
}
/**
 * Soma algébrica F+V+E+Tfix. Cada operando deve ser do mesmo contexto/intervalo.
 * Não prova incidência, completude, reconciliação ou admissibilidade fiscal dos valores.
 * Independente de receita, jornada, contagem e quilometragem; fixo não desaparece com uso0.
 */
export function calculateOperatingCost(input:OperatingCostInput,limits:ExactLimits):OperatingCostResult {
  const policy=inspectExactLimits(limits);
  if(!policy.valid)return failure('invalid-budget',policy.reason);
  if(input===null||typeof input!=='object')return failure('invalid-cost','Componentes de custo são obrigatórios.');
  for(const component of components){
    const sign=compareExactRationals(input[component],zero,policy.limits);
    if(sign.status!=='ready')return failure('calculation-unavailable',sign.reason,component,sign);
    if(sign.order<0)return failure('invalid-cost','Componente de custo deve ser não negativo.',component);
  }
  let total:ExactRational=zero;
  for(const component of components){
    const sum=calculateExactSum('add',total,input[component],policy.limits);
    if(sum.status!=='ready')return failure('calculation-unavailable',sum.reason,component,sum);
    total=sum.value;
  }
  return Object.freeze({status:'ready',value:total,costAdmission:'not-evaluated'});
}
