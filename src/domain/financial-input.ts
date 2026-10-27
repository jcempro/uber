/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.2, FT-003.34b.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type {BudgetPeriod} from './model';
import type {ExactLimits,ExactRational} from './exact';
import {inspectExactLimits} from './exact-budget';
import {calculateExactProduct} from './exact-product';
import type {ExactProductFailure} from './exact-product';
import {compareExactRationals} from './exact-compare';

export interface FinancialProjectionInput {
  readonly kind:'projection';
  readonly contextId:string;
  readonly period:BudgetPeriod;
  readonly creditedRevenue:ExactRational;
  readonly fixedCosts:ExactRational;
  readonly usageCosts:ExactRational;
  readonly extraordinaryCosts:ExactRational;
  readonly fixedTaxes:ExactRational;
  readonly titheRate:ExactRational;
  readonly revenueTaxRate:ExactRational;
}
const fields=Object.freeze(['creditedRevenue','fixedCosts','usageCosts','extraordinaryCosts','fixedTaxes','titheRate','revenueTaxRate'] as const);
export type FinancialInputField=typeof fields[number];
export type FinancialInputFailure={
  readonly status:'unavailable';
  readonly code:'invalid-budget'|'unsupported-kind'|'invalid-input'|'calculation-unavailable';
  readonly reason:string;
  readonly field:FinancialInputField|null;
  readonly calculation:ExactProductFailure|null;
};
export type FinancialInputResolution=
  | {readonly status:'ready';readonly value:FinancialProjectionInput;readonly financialAssessment:'not-evaluated'}
  | FinancialInputFailure;
const zero:ExactRational=Object.freeze({numerator:'0',denominator:'1'});
const one:ExactRational=Object.freeze({numerator:'1',denominator:'1'});
function failure(code:FinancialInputFailure['code'],reason:string,field:FinancialInputField|null=null,calculation:ExactProductFailure|null=null):FinancialInputFailure {
  return Object.freeze({status:'unavailable',code,reason,field,calculation});
}
/** Validação e snapshot matemáticos. Não calcula lucro, admite custos ou confirma base fiscal/realização. */
export function resolveFinancialProjectionInput(input:FinancialProjectionInput,limits:ExactLimits):FinancialInputResolution {
  const policy=inspectExactLimits(limits);
  if(!policy.valid)return failure('invalid-budget',policy.reason);
  if(input===null||typeof input!=='object')return failure('invalid-input','Entrada deve ser um objeto de projeção.');
  if(input.kind!=='projection')return failure('unsupported-kind','Somente projeções são aceitas; resultado real exige apuração própria.');
  if(typeof input.contextId!=='string'||input.contextId.trim()===''||!['day','week','month','year'].includes(input.period))
    return failure('invalid-input','Contexto e período explícitos são obrigatórios.');
  const normalized={} as Record<FinancialInputField,ExactRational>;
  for(const field of fields){
    const value=calculateExactProduct('multiply',input[field],one,policy.limits);
    if(value.status!=='ready')return failure('calculation-unavailable',value.reason,field,value);
    const sign=compareExactRationals(value.value,zero,policy.limits);
    if(sign.status!=='ready')return failure('calculation-unavailable',sign.reason,field,sign);
    if(sign.order<0)return failure('invalid-input','Entradas financeiras devem ser não negativas.',field);
    normalized[field]=value.value;
  }
  const value:FinancialProjectionInput=Object.freeze({kind:'projection',contextId:input.contextId,period:input.period,...normalized});
  return Object.freeze({status:'ready',value,financialAssessment:'not-evaluated'});
}
