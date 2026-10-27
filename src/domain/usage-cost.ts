/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§7.2/8.1, FT-003.31.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type {CostItem, CostBasis, BudgetPeriod, NumericParameter} from './model';
import type {ExactRational, ExactLimits} from './exact';
import {inspectExactLimits} from './exact-budget';
import {resolveNumericParameter} from './numeric-parameter';
import type {NumericParameterResolution} from './numeric-parameter';
import {calculateExactProduct} from './exact-product';
import type {ExactProductFailure} from './exact-product';
import {compareExactRationals} from './exact-compare';

type UsageUnit = Extract<CostBasis, {kind:'usage'}>['unit'];
/** Quantidade já apurada/derivada no contexto e período indicados; não comprova sua origem. */
export interface CostUsageQuantity {
  readonly contextId:string;
  readonly period:BudgetPeriod;
  readonly unit:UsageUnit;
  readonly value:ExactRational;
}
export interface UsageCostContext {
  readonly contextId:string;
  readonly period:BudgetPeriod;
  readonly quantity:CostUsageQuantity|null;
}
export type UsageCostAmountResult =
  | {readonly status:'ready';readonly costId:string;readonly contextId:string;readonly period:BudgetPeriod;readonly value:ExactRational;readonly quantity:CostUsageQuantity;readonly parameter:Extract<NumericParameterResolution,{status:'ready'}>;readonly ledgerAdmission:'not-evaluated'}
  | {readonly status:'excluded';readonly costId:string;readonly reason:'disabled';readonly ledgerAdmission:'not-evaluated'}
  | {readonly status:'unavailable';readonly costId:string|null;readonly code:'invalid-budget'|'invalid-cost'|'unsupported-cost-basis'|'invalid-usage'|'amount-unavailable'|'calculation-unavailable';readonly reason:string;readonly parameter:NumericParameterResolution|null;readonly calculation:ExactProductFailure|null};

const one:ExactRational=Object.freeze({numerator:'1',denominator:'1'});
const zero:ExactRational=Object.freeze({numerator:'0',denominator:'1'});
const rateUnits:Readonly<Record<UsageUnit,string>>=Object.freeze({km:'BRL/km',hour:'BRL/h','working-day':'BRL/working-day',trip:'BRL/trip'});
function unavailable(code:Extract<UsageCostAmountResult,{status:'unavailable'}>['code'],reason:string,costId:string|null=null,parameter:NumericParameterResolution|null=null,calculation:ExactProductFailure|null=null):UsageCostAmountResult {
  return Object.freeze({status:'unavailable',costId,code,reason,parameter,calculation});
}
/**
 * Taxa monetária por unidade × quantidade do mesmo contexto/período.
 * Km inclui os deslocamentos atribuíveis; o chamador apura a quantidade total.
 * Não projeta receita/lucro a partir de volume nem reconhece vigência/reservas/pagamentos.
 * Não transforma custo de uso em fixo nem normaliza evento ou outra incidência.
 */
export function resolveUsageCostAmount(cost:CostItem,parameters:readonly NumericParameter[],context:UsageCostContext,limits:ExactLimits):UsageCostAmountResult {
  const policy=inspectExactLimits(limits);
  if(!policy.valid)return unavailable('invalid-budget',policy.reason);
  if(cost===null||typeof cost!=='object'||typeof cost.id!=='string'||cost.id.trim()===''||typeof cost.enabled!=='boolean')
    return unavailable('invalid-cost','Custo inválido: identidade e estado de ativação são obrigatórios.');
  if(!cost.enabled)return Object.freeze({status:'excluded',costId:cost.id,reason:'disabled',ledgerAdmission:'not-evaluated'});
  if(cost.basis===null||typeof cost.basis!=='object'||cost.basis.kind!=='usage'||!Object.hasOwn(rateUnits,cost.basis.unit))
    return unavailable('unsupported-cost-basis','Este quantificador exige custo por km, hora, dia trabalhado ou viagem.',cost.id);
  if(context===null||typeof context!=='object'||typeof context.contextId!=='string'||context.contextId.trim()===''||!['day','week','month','year'].includes(context.period))
    return unavailable('invalid-usage','Contexto e período explícitos são obrigatórios.',cost.id);
  const quantity=context.quantity;
  if(quantity===null||typeof quantity!=='object'||quantity.contextId!==context.contextId||quantity.period!==context.period||quantity.unit!==cost.basis.unit)
    return unavailable('invalid-usage','Quantidade ausente ou com contexto, período ou unidade divergente.',cost.id);
  const normalized=calculateExactProduct('multiply',quantity.value,one,policy.limits);
  if(normalized.status!=='ready')return unavailable('calculation-unavailable',normalized.reason,cost.id,null,normalized);
  const usageSign=compareExactRationals(normalized.value,zero,policy.limits);
  if(usageSign.status!=='ready')return unavailable('calculation-unavailable',usageSign.reason,cost.id,null,usageSign);
  if(usageSign.order<0)return unavailable('invalid-usage','Quantidade de uso deve ser não negativa.',cost.id);
  const parameter=resolveNumericParameter(cost.amountParameterId,rateUnits[cost.basis.unit],parameters,policy.limits);
  if(parameter.status!=='ready')return unavailable('amount-unavailable','Taxa do custo indisponível; consulte o parâmetro original.',cost.id,parameter);
  const rateSign=compareExactRationals(parameter.value,zero,policy.limits);
  if(rateSign.status!=='ready')return unavailable('calculation-unavailable',rateSign.reason,cost.id,parameter,rateSign);
  if(rateSign.order<0)return unavailable('invalid-cost','Taxa de custo deve ser não negativa.',cost.id,parameter);
  const amount=calculateExactProduct('multiply',parameter.value,normalized.value,policy.limits);
  if(amount.status!=='ready')return unavailable('calculation-unavailable',amount.reason,cost.id,parameter,amount);
  const snapshot:CostUsageQuantity=Object.freeze({contextId:context.contextId,period:context.period,unit:quantity.unit,value:normalized.value});
  return Object.freeze({status:'ready',costId:cost.id,contextId:context.contextId,period:context.period,value:amount.value,quantity:snapshot,parameter,ledgerAdmission:'not-evaluated'});
}
