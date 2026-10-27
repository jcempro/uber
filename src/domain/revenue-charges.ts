/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§8.2, FT-003.34d.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type {ExactLimits,ExactRational} from './exact';
import {inspectExactLimits} from './exact-budget';
import {compareExactRationals} from './exact-compare';
import {calculateExactProduct} from './exact-product';
import type {ExactProductFailure} from './exact-product';
import {calculateExactSum} from './exact-sum';
import type {ExactSumFailure} from './exact-sum';
export interface RevenueChargesInput {
  readonly creditedRevenue:ExactRational;
  readonly titheRate:ExactRational;
  readonly revenueTaxRate:ExactRational;
}
export type RevenueChargesResult=
  | {readonly status:'ready';readonly tithe:ExactRational;readonly receiptTax:ExactRational;readonly remainingRevenueFactor:ExactRational;readonly taxAssessment:'not-evaluated'}
  | {readonly status:'unavailable';readonly code:'invalid-budget'|'invalid-input'|'calculation-unavailable';readonly reason:string;readonly field:keyof RevenueChargesInput|null;readonly calculation:ExactProductFailure|ExactSumFailure|null};
const zero:ExactRational=Object.freeze({numerator:'0',denominator:'1'});
const one:ExactRational=Object.freeze({numerator:'1',denominator:'1'});
const fields=Object.freeze(['creditedRevenue','titheRate','revenueTaxRate'] as const);
function failure(code:Extract<RevenueChargesResult,{status:'unavailable'}>['code'],reason:string,field:keyof RevenueChargesInput|null=null,calculation:ExactProductFailure|ExactSumFailure|null=null):RevenueChargesResult {
  return Object.freeze({status:'unavailable',code,reason,field,calculation});
}
/**
 * qB, tauB e G=1-q-tau. B é repasse ao motorista após retenções da plataforma,
 * nunca preço do passageiro nem lucro após custos. Taxas explícitas, sem defaults.
 * Álgebra não comprova base tributária/realização. G<=0 não impede cálculo direto,
 * mas nenhuma inversa, cobertura ou viabilidade é inferida aqui.
 */
export function calculateRevenueCharges(input:RevenueChargesInput,limits:ExactLimits):RevenueChargesResult {
  const policy=inspectExactLimits(limits);
  if(!policy.valid)return failure('invalid-budget',policy.reason);
  if(input===null||typeof input!=='object')return failure('invalid-input','Receita e alíquotas explícitas são obrigatórias.');
  for(const field of fields){
    const sign=compareExactRationals(input[field],zero,policy.limits);
    if(sign.status!=='ready')return failure('calculation-unavailable',sign.reason,field,sign);
    if(sign.order<0)return failure('invalid-input','Receita e alíquotas devem ser não negativas.',field);
  }
  const tithe=calculateExactProduct('multiply',input.creditedRevenue,input.titheRate,policy.limits);
  if(tithe.status!=='ready')return failure('calculation-unavailable',tithe.reason,'titheRate',tithe);
  const tax=calculateExactProduct('multiply',input.creditedRevenue,input.revenueTaxRate,policy.limits);
  if(tax.status!=='ready')return failure('calculation-unavailable',tax.reason,'revenueTaxRate',tax);
  const afterTithe=calculateExactSum('subtract',one,input.titheRate,policy.limits);
  if(afterTithe.status!=='ready')return failure('calculation-unavailable',afterTithe.reason,'titheRate',afterTithe);
  const factor=calculateExactSum('subtract',afterTithe.value,input.revenueTaxRate,policy.limits);
  if(factor.status!=='ready')return failure('calculation-unavailable',factor.reason,'revenueTaxRate',factor);
  return Object.freeze({status:'ready',tithe:tithe.value,receiptTax:tax.value,remainingRevenueFactor:factor.value,taxAssessment:'not-evaluated'});
}
