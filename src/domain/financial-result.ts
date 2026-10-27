/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§8.2, FT-003.34e.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type {ExactLimits,ExactRational} from './exact';
import type {BudgetPeriod} from './model';
import {inspectExactLimits} from './exact-budget';
import {resolveFinancialProjectionInput} from './financial-input';
import type {FinancialProjectionInput,FinancialInputField} from './financial-input';
import {calculateOperatingCost} from './operating-cost';
import {calculateRevenueCharges} from './revenue-charges';
import {calculateExactSum} from './exact-sum';
import type {ExactSumFailure} from './exact-sum';
import {calculateExactProduct} from './exact-product';
import type {ExactProductFailure} from './exact-product';
export type {FinancialProjectionInput} from './financial-input';

type CalculationFailure=ExactSumFailure|ExactProductFailure;
export type FinancialMargin=
  | {readonly status:'ready';readonly value:ExactRational}
  | {readonly status:'unavailable';readonly code:'zero-revenue'|'calculation-unavailable';readonly reason:string;readonly calculation:CalculationFailure|null};
export type FinancialProjectionResult=
  | {readonly status:'ready';readonly kind:'projection';readonly contextId:string;readonly period:BudgetPeriod;readonly financialAssessment:'not-evaluated';readonly value:{
      readonly operatingCost:ExactRational;readonly tithe:ExactRational;readonly receiptTax:ExactRational;
      readonly plannedTotalCost:ExactRational;readonly netProfit:ExactRational;
      readonly remainingRevenueFactor:ExactRational;readonly margin:FinancialMargin;
    }}
  | {readonly status:'unavailable';readonly code:'invalid-budget'|'unsupported-kind'|'invalid-input'|'calculation-unavailable';readonly reason:string;readonly field:FinancialInputField|null;readonly calculation:CalculationFailure|null};
function failure(code:Extract<FinancialProjectionResult,{status:'unavailable'}>['code'],reason:string,field:FinancialInputField|null=null,calculation:CalculationFailure|null=null):FinancialProjectionResult {
  return Object.freeze({status:'unavailable',code,reason,field,calculation});
}
/**
 * Composição dos módulos de entradas, custos e encargos já separados.
 * Projeção matemática: não comprova custos completos, base fiscal, créditos ou caixa.
 * Receita é repasse ao motorista. Quantidade de viagens não participa da fórmula.
 */
export function calculateFinancialProjection(input:FinancialProjectionInput,limits:ExactLimits):FinancialProjectionResult {
  const policy=inspectExactLimits(limits);
  if(!policy.valid)return failure('invalid-budget',policy.reason);
  const normalized=resolveFinancialProjectionInput(input,policy.limits);
  if(normalized.status!=='ready')return normalized;
  const source=normalized.value;
  const operating=calculateOperatingCost(source,policy.limits);
  if(operating.status!=='ready')return failure(operating.code==='invalid-cost'?'invalid-input':operating.code,operating.reason,operating.component,operating.calculation);
  const charges=calculateRevenueCharges(source,policy.limits);
  if(charges.status!=='ready')return failure(charges.code,charges.reason,charges.field,charges.calculation);
  const withTithe=calculateExactSum('add',operating.value,charges.tithe,policy.limits);
  if(withTithe.status!=='ready')return failure('calculation-unavailable',withTithe.reason,null,withTithe);
  const total=calculateExactSum('add',withTithe.value,charges.receiptTax,policy.limits);
  if(total.status!=='ready')return failure('calculation-unavailable',total.reason,null,total);
  // B-(Coper+qB+tauB) é exatamente a identidade LLF do RCF, sem arredondamento.
  const profit=calculateExactSum('subtract',source.creditedRevenue,total.value,policy.limits);
  if(profit.status!=='ready')return failure('calculation-unavailable',profit.reason,null,profit);
  let margin:FinancialMargin;
  // A normalização aceita garante zero canônico e receita não negativa.
  if(source.creditedRevenue.numerator==='0'){
    margin=Object.freeze({status:'unavailable',code:'zero-revenue',reason:'Margem indefinida para receita zero.',calculation:null});
  }else{
    const ratio=calculateExactProduct('divide',profit.value,source.creditedRevenue,policy.limits);
    margin=ratio.status==='ready'?ratio:Object.freeze({status:'unavailable',code:'calculation-unavailable',reason:ratio.reason,calculation:ratio});
  }
  return Object.freeze({status:'ready',kind:'projection',contextId:source.contextId,period:source.period,financialAssessment:'not-evaluated',value:Object.freeze({
    operatingCost:operating.value,tithe:charges.tithe,receiptTax:charges.receiptTax,
    plannedTotalCost:total.value,netProfit:profit.value,remainingRevenueFactor:charges.remainingRevenueFactor,margin,
  })});
}
