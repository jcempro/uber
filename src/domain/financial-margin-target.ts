/** MPL-2.0; RCF§8.4; FT-003.41.1. Avaliação matemática condicional, não viabilidade global. */
import {inspectExactLimits,type ExactLimits} from './exact-budget';
import type {ExactRational} from './exact';
import type {BudgetPeriod} from './model';
import {calculateFinancialProjection,type FinancialProjectionInput,type FinancialProjectionResult,type FinancialMargin} from './financial-result';
import {calculateExactProduct,type ExactProductFailure} from './exact-product';
import {calculateExactSum,type ExactSumFailure} from './exact-sum';
import {compareExactRationals,type ExactComparisonFailure} from './exact-compare';
export interface FinancialMarginTargetInput extends FinancialProjectionInput {readonly requiredMarginPercent:ExactRational}
type MarginCalculationFailure=ExactProductFailure|ExactSumFailure|ExactComparisonFailure;
export type FinancialMarginComparison=
  | {readonly status:'ready';readonly signedMarginSlack:ExactRational;readonly reachesModeledMargin:boolean}
  | {readonly status:'unavailable';readonly code:'margin-unavailable';readonly reason:string;readonly margin:Extract<FinancialMargin,{status:'unavailable'}>};
export type FinancialMarginTargetResult=
  | {readonly status:'conditional';readonly kind:'projection';readonly contextId:string;readonly period:BudgetPeriod;readonly financialAssessment:'not-evaluated';readonly costCoverage:'not-evaluated';readonly taxAssessment:'not-evaluated';readonly projection:Extract<FinancialProjectionResult,{status:'ready'}>;readonly value:{readonly requiredMarginPercent:ExactRational;readonly requiredMarginRatio:ExactRational;readonly assessment:FinancialMarginComparison}}
  | {readonly status:'unavailable';readonly code:'invalid-budget'|'projection-unavailable'|'invalid-target'|'calculation-unavailable';readonly reason:string;readonly projection:FinancialProjectionResult|null;readonly calculation:MarginCalculationFailure|null};
function failure(code:Extract<FinancialMarginTargetResult,{status:'unavailable'}>['code'],reason:string,projection:FinancialProjectionResult|null=null,calculation:MarginCalculationFailure|null=null):FinancialMarginTargetResult{return Object.freeze({status:'unavailable',code,reason,projection,calculation});}
export function calculateFinancialMarginTarget(input:FinancialMarginTargetInput,limits:ExactLimits):FinancialMarginTargetResult {
  const limitsSnapshot=inspectExactLimits(limits);
  if(!limitsSnapshot.valid)return failure('invalid-budget',limitsSnapshot.reason,null,null);
  const projection=calculateFinancialProjection(input,limitsSnapshot.limits);
  if(projection.status==='unavailable')return failure('projection-unavailable',projection.reason,projection,null);
  const one:ExactRational=Object.freeze({numerator:'1',denominator:'1'});
  const zero:ExactRational=Object.freeze({numerator:'0',denominator:'1'});
  const hundred:ExactRational=Object.freeze({numerator:'100',denominator:'1'});
  const requiredMarginPercentNormalized=calculateExactProduct('multiply',input.requiredMarginPercent,one,limitsSnapshot.limits);
  if(requiredMarginPercentNormalized.status==='unavailable')return failure(requiredMarginPercentNormalized.code==='invalid-rational'?'invalid-target':'calculation-unavailable',requiredMarginPercentNormalized.reason,projection,requiredMarginPercentNormalized);
  const compareZero=compareExactRationals(requiredMarginPercentNormalized.value,zero,limitsSnapshot.limits);
  if(compareZero.status==='unavailable')return failure('calculation-unavailable',compareZero.reason,projection,compareZero);
  if(compareZero.order<0)return failure('invalid-target','requiredMarginPercent não pode ser negativo',projection,null);
  const mResult=calculateExactProduct('divide',requiredMarginPercentNormalized.value,hundred,limitsSnapshot.limits);
  if(mResult.status==='unavailable')return failure('calculation-unavailable',mResult.reason,projection,mResult);
  const m=mResult.value;
  if(projection.value.margin.status==='unavailable')return Object.freeze({status:'conditional',kind:'projection',contextId:projection.contextId,period:projection.period,financialAssessment:'not-evaluated',costCoverage:'not-evaluated',taxAssessment:'not-evaluated',projection:projection,value:Object.freeze({requiredMarginPercent:requiredMarginPercentNormalized.value,requiredMarginRatio:m,assessment:Object.freeze({status:'unavailable',code:'margin-unavailable',reason:projection.value.margin.reason,margin:projection.value.margin})})});
  const marginValue=projection.value.margin.value;
  const slackResult=calculateExactSum('subtract',marginValue,m,limitsSnapshot.limits);
  if(slackResult.status==='unavailable')return failure('calculation-unavailable',slackResult.reason,projection,slackResult);
  const slackValue=slackResult.value;
  const compareSlackZero=compareExactRationals(slackValue,zero,limitsSnapshot.limits);
  if(compareSlackZero.status==='unavailable')return failure('calculation-unavailable',compareSlackZero.reason,projection,compareSlackZero);
  const assessmentReady=Object.freeze({status:'ready',signedMarginSlack:slackValue,reachesModeledMargin:compareSlackZero.order>=0});
  return Object.freeze({status:'conditional',kind:'projection',contextId:projection.contextId,period:projection.period,financialAssessment:'not-evaluated',costCoverage:'not-evaluated',taxAssessment:'not-evaluated',projection:projection,value:Object.freeze({requiredMarginPercent:requiredMarginPercentNormalized.value,requiredMarginRatio:m,assessment:assessmentReady})});
}
