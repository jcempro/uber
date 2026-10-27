/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§6.1, FT-003.32.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type {FuelConfiguration,NumericParameter} from './model';
import type {ExactLimits,ExactRational} from './exact';
import {inspectExactLimits} from './exact-budget';
import {resolveNumericParameter} from './numeric-parameter';
import type {NumericParameterResolution} from './numeric-parameter';
import {calculateExactProduct} from './exact-product';
import type {ExactProductFailure} from './exact-product';
import {compareExactRationals} from './exact-compare';

type FuelDependency='price'|'efficiency'|'usableLitres';
export type FuelMetricResult=
  | {readonly status:'ready';readonly value:ExactRational;readonly verification:'not-evaluated'}
  | {readonly status:'unavailable';readonly code:'dependency-unavailable'|'invalid-value'|'calculation-unavailable';readonly reason:string;readonly dependency:FuelDependency|null;readonly calculation:ExactProductFailure|null};
export interface PureFuelBindings {
  readonly price:NumericParameterResolution;
  readonly efficiency:NumericParameterResolution;
  readonly usableLitres:NumericParameterResolution;
}
export type PureFuelMetricsResult=
  | {readonly status:'resolved';readonly fuelId:string;readonly vehicleId:string;readonly kind:'ethanol'|'gasoline';readonly cycle:FuelConfiguration['cycle'];readonly bindings:PureFuelBindings;readonly costPerKm:FuelMetricResult;readonly rangeKm:FuelMetricResult}
  | {readonly status:'excluded';readonly fuelId:string;readonly reason:'disabled'}
  | {readonly status:'unavailable';readonly code:'invalid-budget'|'invalid-configuration'|'unsupported-fuel';readonly reason:string};

const zero:ExactRational=Object.freeze({numerator:'0',denominator:'1'});
function metricFailure(code:Extract<FuelMetricResult,{status:'unavailable'}>['code'],reason:string,dependency:FuelDependency|null,calculation:ExactProductFailure|null=null):Extract<FuelMetricResult,{status:'unavailable'}>{
  return Object.freeze({status:'unavailable',code,reason,dependency,calculation});
}
function check(binding:NumericParameterResolution,dependency:FuelDependency,positive:boolean,limits:ExactLimits):Extract<FuelMetricResult,{status:'unavailable'}>|null {
  if(binding.status!=='ready')return metricFailure('dependency-unavailable','Parâmetro indisponível; consulte o diagnóstico original em bindings.',dependency);
  const sign=compareExactRationals(binding.value,zero,limits);
  if(sign.status!=='ready')return metricFailure('calculation-unavailable',sign.reason,dependency,sign);
  if(sign.order<0||(positive&&sign.order===0))return metricFailure('invalid-value',positive?'Valor deve ser estritamente positivo.':'Valor deve ser não negativo.',dependency);
  return null;
}
function calculate(operation:'multiply'|'divide',left:NumericParameterResolution,right:NumericParameterResolution,limits:ExactLimits):FuelMetricResult {
  if(left.status!=='ready'||right.status!=='ready')return metricFailure('dependency-unavailable','Dependência indisponível.',null);
  const result=calculateExactProduct(operation,left.value,right.value,limits);
  return result.status==='ready'?Object.freeze({status:'ready',value:result.value,verification:'not-evaluated'}):metricFailure('calculation-unavailable',result.reason,null,result);
}
/**
 * Duas saídas independentes, relativas à configuração/ciclo selecionados.
 * Preço e eficiência positivos; volume utilizável não negativo, nunca tanque nominal presumido.
 * Não confirma fonte/competência, pagamento, elegibilidade nem admissão de custo ao ledger.
 * Mistura exige composição própria e eficiência independente; não aplica média nem regra70%.
 */
export function resolvePureFuelMetrics(fuel:FuelConfiguration,parameters:readonly NumericParameter[],limits:ExactLimits):PureFuelMetricsResult {
  const policy=inspectExactLimits(limits);
  if(!policy.valid)return Object.freeze({status:'unavailable',code:'invalid-budget',reason:policy.reason});
  if(fuel===null||typeof fuel!=='object'||typeof fuel.id!=='string'||fuel.id.trim()===''||typeof fuel.vehicleId!=='string'||fuel.vehicleId.trim()===''||typeof fuel.enabled!=='boolean'||!['urban','highway','mixed','unspecified'].includes(fuel.cycle))
    return Object.freeze({status:'unavailable',code:'invalid-configuration',reason:'Identidade, veículo, ativação e ciclo da configuração são obrigatórios.'});
  if(!fuel.enabled)return Object.freeze({status:'excluded',fuelId:fuel.id,reason:'disabled'});
  if(fuel.kind!=='ethanol'&&fuel.kind!=='gasoline')
    return Object.freeze({status:'unavailable',code:'unsupported-fuel',reason:'Mistura requer composição volumétrica e eficiência própria; este resolvedor trata combustíveis puros.'});
  const bindings:PureFuelBindings=Object.freeze({
    price:resolveNumericParameter(fuel.pricePerLitreParameterId,'BRL/L',parameters,policy.limits),
    efficiency:resolveNumericParameter(fuel.efficiencyKmPerLitreParameterId,'km/L',parameters,policy.limits),
    usableLitres:resolveNumericParameter(fuel.usableLitresParameterId,'L',parameters,policy.limits),
  });
  const priceError=check(bindings.price,'price',true,policy.limits);
  const efficiencyError=check(bindings.efficiency,'efficiency',true,policy.limits);
  const volumeError=check(bindings.usableLitres,'usableLitres',false,policy.limits);
  const costPerKm=priceError??efficiencyError??calculate('divide',bindings.price,bindings.efficiency,policy.limits);
  const rangeKm=volumeError??efficiencyError??calculate('multiply',bindings.usableLitres,bindings.efficiency,policy.limits);
  return Object.freeze({status:'resolved',fuelId:fuel.id,vehicleId:fuel.vehicleId,kind:fuel.kind,cycle:fuel.cycle,bindings,costPerKm,rangeKm});
}
