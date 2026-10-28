/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§8.3, FT-003.40.3.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {inspectExactLimits,type ExactLimits} from './exact-budget';
import type {ExactRational} from './exact';
import type {BudgetPeriod} from './model';
import {calculateFinancialTargetGap,type FinancialTargetGapInput,type FinancialTargetGapResult} from './financial-target-gap';
import {calculateConditionalLinearRevenueThreshold,type LinearRevenueThresholdInput,type LinearRevenueThresholdResult} from './linear-revenue-threshold';
import {calculateExactSum,type ExactSumFailure} from './exact-sum';
import {compareExactRationals,type ExactComparisonFailure} from './exact-compare';
export interface FinancialTargetAssessmentInput extends FinancialTargetGapInput {readonly model:LinearRevenueThresholdInput['model'];}
export type AdditionalCreditedRevenueResult=
  | {readonly status:'conditional';readonly method:'current-target-met'|'linear-threshold';readonly unit:'BRL';readonly period:BudgetPeriod;readonly value:ExactRational}
  | {readonly status:'unavailable';readonly code:'threshold-unavailable'|'calculation-unavailable';readonly reason:string;readonly calculation:ExactSumFailure|ExactComparisonFailure|null};
export type FinancialTargetAssessmentResult=
  | {readonly status:'conditional';readonly kind:'projection';readonly contextId:string;readonly period:BudgetPeriod;readonly costCoverage:'not-evaluated';readonly taxAssessment:'not-evaluated';readonly gap:Extract<FinancialTargetGapResult,{status:'conditional'}>;readonly threshold:LinearRevenueThresholdResult;readonly additionalCreditedRevenue:AdditionalCreditedRevenueResult}
  | {readonly status:'unavailable';readonly code:'invalid-budget'|'gap-unavailable';readonly reason:string;readonly gap:FinancialTargetGapResult|null};
const zero:ExactRational=Object.freeze({numerator:'0',denominator:'1'});
function unavailableAmount(code:'threshold-unavailable'|'calculation-unavailable',reason:string,calculation:ExactSumFailure|ExactComparisonFailure|null=null):AdditionalCreditedRevenueResult{return Object.freeze({status:'unavailable',code,reason,calculation});}
/** Resultados do modelo são condicionais; inversa indisponível não apaga desvios calculáveis. */
export function calculateConditionalFinancialTargetAssessment(input:FinancialTargetAssessmentInput,limits:ExactLimits):FinancialTargetAssessmentResult {
  const policy=inspectExactLimits(limits);
  if(!policy.valid)return Object.freeze({status:'unavailable',code:'invalid-budget',reason:policy.reason,gap:null});
  const gap=calculateFinancialTargetGap(input,policy.limits);
  if(gap.status!=='conditional')return Object.freeze({status:'unavailable',code:'gap-unavailable',reason:gap.reason,gap});
  const threshold=calculateConditionalLinearRevenueThreshold(input,policy.limits);
  let additionalCreditedRevenue:AdditionalCreditedRevenueResult;
  if(gap.value.reachesModeledTarget)additionalCreditedRevenue=Object.freeze({status:'conditional',method:'current-target-met',unit:'BRL',period:gap.period,value:zero});
  else if(threshold.status!=='conditional')additionalCreditedRevenue=unavailableAmount('threshold-unavailable',threshold.reason);
  else {
    const difference=calculateExactSum('subtract',threshold.value.requiredCreditedRevenue,input.creditedRevenue,policy.limits);
    if(difference.status!=='ready')additionalCreditedRevenue=unavailableAmount('calculation-unavailable',difference.reason,difference);
    else {
      const sign=compareExactRationals(difference.value,zero,policy.limits);
      additionalCreditedRevenue=sign.status!=='ready'?unavailableAmount('calculation-unavailable',sign.reason,sign):Object.freeze({status:'conditional',method:'linear-threshold',unit:'BRL',period:gap.period,value:sign.order>0?difference.value:zero});
    }
  }
  return Object.freeze({status:'conditional',kind:'projection',contextId:gap.contextId,period:gap.period,costCoverage:'not-evaluated',taxAssessment:'not-evaluated',gap,threshold,additionalCreditedRevenue});
}
