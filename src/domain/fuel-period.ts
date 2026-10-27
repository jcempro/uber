/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§6.1/8.1, FT-003.33.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type {FuelConfiguration,NumericParameter,BudgetPeriod} from './model';
import type {ExactLimits,ExactRational} from './exact';
import type {CostUsageQuantity} from './usage-cost';
import {resolvePureFuelMetrics} from './fuel-metrics';
import type {PureFuelMetricsResult} from './fuel-metrics';
import {inspectExactLimits} from './exact-budget';
import {calculateExactProduct} from './exact-product';
import type {ExactProductFailure} from './exact-product';
import {compareExactRationals} from './exact-compare';

/** Rodagem total atribuível (coleta+pago+retorno+demais), nunca só trecho pago. */
export interface FuelPeriodContext {
  readonly contextId:string;
  readonly period:BudgetPeriod;
  readonly totalKilometres:CostUsageQuantity|null;
}
export type FuelPeriodAmountResult=
  | {readonly status:'ready';readonly fuelId:string;readonly contextId:string;readonly period:BudgetPeriod;readonly amount:ExactRational;readonly litres:ExactRational;readonly totalKilometres:CostUsageQuantity;readonly metrics:Extract<PureFuelMetricsResult,{status:'resolved'}>;readonly ledgerAdmission:'not-evaluated'}
  | {readonly status:'excluded';readonly fuelId:string;readonly reason:'disabled';readonly ledgerAdmission:'not-evaluated'}
  | {readonly status:'unavailable';readonly code:'invalid-budget'|'fuel-unavailable'|'invalid-usage'|'calculation-unavailable';readonly reason:string;readonly metrics:PureFuelMetricsResult|null;readonly calculation:ExactProductFailure|null};

const one:ExactRational=Object.freeze({numerator:'1',denominator:'1'});
const zero:ExactRational=Object.freeze({numerator:'0',denominator:'1'});
function unavailable(code:Extract<FuelPeriodAmountResult,{status:'unavailable'}>['code'],reason:string,metrics:PureFuelMetricsResult|null=null,calculation:ExactProductFailure|null=null):FuelPeriodAmountResult {
  return Object.freeze({status:'unavailable',code,reason,metrics,calculation});
}
/**
 * Preço/eficiência e rodagem do contexto selecionado; sem transporte de outra rodagem.
 * Volume disponível não condiciona gasto. Origem, vigência, conciliação e custo completo
 * continuam pendentes; valor calculado não é comprovante de desembolso ou lucro.
 */
export function resolvePureFuelPeriodAmount(fuel:FuelConfiguration,parameters:readonly NumericParameter[],context:FuelPeriodContext,limits:ExactLimits):FuelPeriodAmountResult {
  const policy=inspectExactLimits(limits);
  if(!policy.valid)return unavailable('invalid-budget',policy.reason);
  const metrics=resolvePureFuelMetrics(fuel,parameters,policy.limits);
  if(metrics.status==='excluded')return Object.freeze({status:'excluded',fuelId:metrics.fuelId,reason:'disabled',ledgerAdmission:'not-evaluated'});
  if(metrics.status!=='resolved')return unavailable('fuel-unavailable',metrics.reason,metrics);
  if(context===null||typeof context!=='object'||typeof context.contextId!=='string'||context.contextId.trim()===''||!['day','week','month','year'].includes(context.period))
    return unavailable('invalid-usage','Contexto e período explícitos são obrigatórios.',metrics);
  const quantity=context.totalKilometres;
  if(quantity===null||typeof quantity!=='object'||quantity.contextId!==context.contextId||quantity.period!==context.period||quantity.unit!=='km')
    return unavailable('invalid-usage','Km totais ausentes ou com contexto, período ou unidade divergente.',metrics);
  const normalized=calculateExactProduct('multiply',quantity.value,one,policy.limits);
  if(normalized.status!=='ready')return unavailable('calculation-unavailable',normalized.reason,metrics,normalized);
  const sign=compareExactRationals(normalized.value,zero,policy.limits);
  if(sign.status!=='ready')return unavailable('calculation-unavailable',sign.reason,metrics,sign);
  if(sign.order<0)return unavailable('invalid-usage','Quilometragem total deve ser não negativa.',metrics);
  if(metrics.costPerKm.status!=='ready'||metrics.bindings.efficiency.status!=='ready')
    return unavailable('fuel-unavailable','Custo por km indisponível; consulte métricas e seus parâmetros originais.',metrics);
  const litres=calculateExactProduct('divide',normalized.value,metrics.bindings.efficiency.value,policy.limits);
  if(litres.status!=='ready')return unavailable('calculation-unavailable',litres.reason,metrics,litres);
  const amount=calculateExactProduct('multiply',normalized.value,metrics.costPerKm.value,policy.limits);
  if(amount.status!=='ready')return unavailable('calculation-unavailable',amount.reason,metrics,amount);
  const snapshot:CostUsageQuantity=Object.freeze({contextId:context.contextId,period:context.period,unit:'km',value:normalized.value});
  return Object.freeze({status:'ready',fuelId:metrics.fuelId,contextId:context.contextId,period:context.period,amount:amount.value,litres:litres.value,totalKilometres:snapshot,metrics,ledgerAdmission:'not-evaluated'});
}
