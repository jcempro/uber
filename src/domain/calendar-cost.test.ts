/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§8.1, FT-003.30.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {describe,expect,it} from 'vitest';
import {resolveCalendarCostAmount} from './calendar-cost';
import {NUMERIC_RULES} from './validation';
import type {CostItem,NumericParameter,NumericInput,BudgetPeriod} from './model';
import type {BudgetAmountContext} from './budget-amount';
const budget=Object.freeze({maxInputLength:256,maxDigits:64});
const context:BudgetAmountContext={kind:'budget',daysPerMonth:{numerator:'30',denominator:'1'},monthsPerYear:{numerator:'12',denominator:'1'}};
/** Item hipotético explícito; null não comprova incidência ou vigência. */
function item(period:BudgetPeriod='month'):CostItem {
  return {id:'cost',name:'Fixture matemática',category:'fixture',enabled:true,nature:'fixed',basis:{kind:'calendar',period},amountParameterId:'amount',provenance:{kind:'illustrative-hypothesis',source:'fixture-matemática',date:null,competence:null,scope:{kind:'global'},reliability:'conditional'},validity:{start:null,end:null},recognition:'planned-outflow',eventId:null,reconcilesReserveId:null,allocationRuleId:null};
}
/** Quantia literal de teste; não constitui valor operacional padrão. */
function parameter(unit='BRL/month',input:NumericInput={status:'provided',value:'12'}):NumericParameter {
  return {id:'amount',name:'Quantia da fixture',unit,category:'fixture',input,provenance:{kind:'illustrative-hypothesis',source:'fixture-matemática',date:null,competence:null,scope:{kind:'global'},reliability:'conditional'},required:true,constraints:NUMERIC_RULES.nonNegative,dependencies:[]};
}
describe('Quantificação de custo por calendário separada de sua admissão',()=>{
  it('preserva fixo mensal independente de atividade e aceita bases monetárias explicitadas',()=>{
    for(const unit of ['BRL/month','BRL']){
      const result=resolveCalendarCostAmount(item(),[parameter(unit)],'month',{kind:'budget'},budget);
      expect(result).toMatchObject({status:'ready',costId:'cost',sourcePeriod:'month',targetPeriod:'month',value:{numerator:'12',denominator:'1'},ledgerAdmission:'not-evaluated',parameter:{status:'ready',unit}});
    }
  });
  it('normaliza ano e dia de calendário sem assumir dias trabalhados',()=>{
    expect(resolveCalendarCostAmount(item('year'),[parameter('BRL/year')],'month',context,budget)).toMatchObject({status:'ready',value:{numerator:'1',denominator:'1'},sourcePeriod:'year',targetPeriod:'month',ledgerAdmission:'not-evaluated'});
    expect(resolveCalendarCostAmount(item('day'),[parameter('BRL/day',{status:'provided',value:'1'})],'month',context,budget)).toMatchObject({status:'ready',value:{numerator:'30',denominator:'1'}});
  });
  it('não converte inativo em zero e não mensaliza uso,eventos ou regras customizadas',()=>{
    const disabled=resolveCalendarCostAmount({...item(),enabled:false},[],'month',{kind:'budget'},budget);
    expect(disabled).toEqual({status:'excluded',costId:'cost',reason:'disabled',ledgerAdmission:'not-evaluated'});
    expect(disabled).not.toHaveProperty('value');
    for(const basis of [{kind:'usage',unit:'km'},{kind:'one-off'},{kind:'custom',unit:'evento',ruleId:'declared',justification:'fixture'}] as const)
      expect(resolveCalendarCostAmount({...item(),basis},[parameter()],'month',context,budget)).toMatchObject({status:'unavailable',code:'unsupported-cost-basis'});
  });
  it('mantém ausência e inaplicabilidade sem valor e hipótesezero sem confirmação inventada',()=>{
    for(const status of ['not-provided','not-applicable'] as const){
      const result=resolveCalendarCostAmount(item(),[parameter('BRL/month',{status,reason:'motivo da fixture'})],'month',context,budget);
      expect(result).toMatchObject({status:'unavailable',code:'amount-unavailable',parameter:{status:'unavailable',code:'unresolved-input',inputStatus:status}});
      expect(result).not.toHaveProperty('value');
    }
    expect(resolveCalendarCostAmount(item(),[parameter('BRL/month',{status:'assumed-zero',value:'0'})],'month',context,budget)).toMatchObject({status:'ready',value:{numerator:'0',denominator:'1'},parameter:{inputStatus:'assumed-zero'},ledgerAdmission:'not-evaluated'});
  });
  it('recusa moeda/período divergente e referências ausentes ou ambíguas',()=>{
    for(const unit of ['USD/month','BRL/year'])
      expect(resolveCalendarCostAmount(item(),[parameter(unit)],'month',context,budget)).toMatchObject({status:'unavailable',code:'amount-unavailable',parameter:{code:'incompatible-unit',unit}});
    expect(resolveCalendarCostAmount(item(),[],'month',context,budget)).toMatchObject({status:'unavailable',parameter:{code:'missing-parameter'}});
    const p=parameter();expect(resolveCalendarCostAmount(item(),[p,p],'month',context,budget)).toMatchObject({status:'unavailable',parameter:{code:'ambiguous-parameter'}});
  });
  it('preserva rejeição numérica e explica a dependência necessária da normalização',()=>{
    expect(resolveCalendarCostAmount(item(),[parameter('BRL/month',{status:'provided',value:'-1'})],'month',context,budget)).toMatchObject({status:'unavailable',code:'amount-unavailable',parameter:{status:'invalid',validation:{valid:false,code:'negative'}}});
    expect(resolveCalendarCostAmount(item('year'),[parameter('BRL/year')],'month',{kind:'budget'},budget)).toMatchObject({status:'unavailable',code:'calculation-unavailable',calculation:{status:'unavailable',code:'missing-calendar-input',dependency:'monthsPerYear'}});
    expect(resolveCalendarCostAmount(item(),[parameter()],'month',{kind:'dated'} as unknown as BudgetAmountContext,budget)).toMatchObject({status:'unavailable',code:'calculation-unavailable',calculation:{code:'unsupported-calendar'}});
  });
  it('prioriza orçamento técnico e não converte falta de recursos em custo zero',()=>{
    expect(resolveCalendarCostAmount(null as unknown as CostItem,[],'month',context,{maxInputLength:0,maxDigits:64})).toMatchObject({status:'unavailable',code:'invalid-budget',reason:'Orçamento inválido: maxInputLength não é inteiro positivo seguro.'});
    expect(resolveCalendarCostAmount(item(),[parameter('BRL/month',{status:'provided',value:'123'})],'month',context,{maxInputLength:2,maxDigits:64})).toMatchObject({status:'unavailable',code:'amount-unavailable',parameter:{code:'resource-budget'}});
  });
  it('preserva fontes,metadados,JSON,determinismo e imutabilidade sem admitir o custo',()=>{
    const cost=item(),p=parameter(),params=[p],before=JSON.stringify([cost,params,context,budget]);
    const first=resolveCalendarCostAmount(cost,params,'month',context,budget);
    expect(first).toEqual(resolveCalendarCostAmount(cost,params,'month',context,budget));
    expect(JSON.stringify([cost,params,context,budget])).toBe(before);expect(Object.isFrozen(cost)).toBe(false);expect(Object.isFrozen(p)).toBe(false);
    expect(Object.isFrozen(first)).toBe(true);expect(JSON.parse(JSON.stringify(first))).toEqual(first);
    if(first.status!=='ready')throw Error('Expected ready');
    expect(Object.isFrozen(first.value)).toBe(true);expect(Object.isFrozen(first.parameter)).toBe(true);expect(first.ledgerAdmission).toBe('not-evaluated');
    expect(Object.isFrozen(resolveCalendarCostAmount(cost,[],'month',context,budget))).toBe(true);
  });
});
