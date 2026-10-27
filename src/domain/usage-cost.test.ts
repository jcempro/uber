/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§7.2/8.1, FT-003.31.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {describe,expect,it} from 'vitest';
import {resolveUsageCostAmount} from './usage-cost';
import type {CostUsageQuantity,UsageCostContext} from './usage-cost';
import type {CostItem,NumericParameter,NumericInput} from './model';
import {NUMERIC_RULES} from './validation';
const limits={maxInputLength:256,maxDigits:64};
const r=(numerator:string,denominator='1')=>({numerator,denominator});
const provenance={kind:'illustrative-hypothesis',source:'fixture-matemática, não valor operacional',date:null,competence:null,scope:{kind:'global'},reliability:'conditional'} as const;
function item(unit:CostUsageQuantity['unit']='km'):CostItem {
  return {id:'cost',name:'Fixture de uso',category:'fixture',enabled:true,nature:'usage-variable',basis:{kind:'usage',unit},amountParameterId:'rate',provenance,validity:{start:null,end:null},recognition:'planned-reserve',eventId:null,reconcilesReserveId:null,allocationRuleId:null};
}
function parameter(unit='BRL/km',input:NumericInput={status:'provided',value:'0.2'}):NumericParameter {
  return {id:'rate',name:'Taxa de fixture',unit,category:'fixture',input,provenance,required:true,constraints:NUMERIC_RULES.nonNegative,dependencies:[]};
}
function context(unit:CostUsageQuantity['unit']='km',value=r('100')):UsageCostContext {
  return {contextId:'scenario-jornada-meta',period:'month',quantity:{contextId:'scenario-jornada-meta',period:'month',unit,value}};
}
describe('Custos de uso: taxa × quantidade no mesmo contexto',()=>{
  it('usa km totais, altera o custo com uso e mantém reservas sem admitir ao ledger',()=>{
    // RCF§8.1: todos os km atribuíveis; fixture 20 coleta + 60 pagos + 20 retorno = 100.
    expect(resolveUsageCostAmount(item(),[parameter()],context(),limits)).toMatchObject({status:'ready',contextId:'scenario-jornada-meta',period:'month',value:r('20'),ledgerAdmission:'not-evaluated'});
    expect(resolveUsageCostAmount(item(),[parameter()],context('km',r('50')),limits)).toMatchObject({status:'ready',value:r('10')});
  });
  it('distingue as quatro unidades e aceita quantidades fracionárias exatas',()=>{
    const cases=[['km','BRL/km','100','0.2','20'],['hour','BRL/h','3','2','6'],['working-day','BRL/working-day','2','3','6'],['trip','BRL/trip','10','0.5','5']] as const;
    for(const [unit,rateUnit,quantity,rate,amount] of cases)
      expect(resolveUsageCostAmount(item(unit),[parameter(rateUnit,{status:'provided',value:rate})],context(unit,r(quantity)),limits)).toMatchObject({status:'ready',value:r(amount)});
    expect(resolveUsageCostAmount(item('hour'),[parameter('BRL/h',{status:'provided',value:'3'})],context('hour',r('1','2')),limits)).toMatchObject({status:'ready',value:r('3','2')});
  });
  it('recusa transferência entre contextos/períodos/unidades e quantidade ausente',()=>{
    const current=context();if(!current.quantity)throw Error('fixture');
    for(const quantity of [null,{...current.quantity,contextId:'other'},{...current.quantity,period:'week' as const},{...current.quantity,unit:'trip' as const}])
      expect(resolveUsageCostAmount(item(),[parameter()],{...current,quantity},limits)).toMatchObject({status:'unavailable',code:'invalid-usage'});
    expect(resolveUsageCostAmount(item(),[parameter('BRL/h')],current,limits)).toMatchObject({status:'unavailable',code:'amount-unavailable',parameter:{code:'incompatible-unit'}});
    expect(resolveUsageCostAmount(item(),[parameter('BRL')],current,limits)).toMatchObject({status:'unavailable',code:'amount-unavailable',parameter:{code:'incompatible-unit'}});
  });
  it('não preenche taxa desconhecida com zero mesmo com uso zero, nem confirma hipótese',()=>{
    const zero=context('km',r('0'));
    expect(resolveUsageCostAmount(item(),[parameter()],zero,limits)).toMatchObject({status:'ready',value:r('0'),ledgerAdmission:'not-evaluated'});
    expect(resolveUsageCostAmount(item(),[],zero,limits)).toMatchObject({status:'unavailable',code:'amount-unavailable',parameter:{code:'missing-parameter'}});
    for(const status of ['not-provided','not-applicable'] as const)
      expect(resolveUsageCostAmount(item(),[parameter('BRL/km',{status,reason:'fixture'})],zero,limits)).toMatchObject({status:'unavailable',parameter:{code:'unresolved-input',inputStatus:status}});
    expect(resolveUsageCostAmount(item(),[parameter('BRL/km',{status:'assumed-zero',value:'0'})],context(),limits)).toMatchObject({status:'ready',parameter:{inputStatus:'assumed-zero'},ledgerAdmission:'not-evaluated'});
  });
  it('recusa quantidade negativa/racional inválido/taxa inválida sem ocultar diagnóstico',()=>{
    expect(resolveUsageCostAmount(item(),[parameter()],context('km',r('-1')),limits)).toMatchObject({status:'unavailable',code:'invalid-usage'});
    expect(resolveUsageCostAmount(item(),[parameter()],context('km',r('1','0')),limits)).toMatchObject({status:'unavailable',code:'calculation-unavailable',calculation:{code:'invalid-rational'}});
    expect(resolveUsageCostAmount(item(),[parameter('BRL/km',{status:'provided',value:'-1'})],context(),limits)).toMatchObject({status:'unavailable',parameter:{status:'invalid',validation:{code:'negative'}}});
    const p=parameter();expect(resolveUsageCostAmount(item(),[p,p],context(),limits)).toMatchObject({status:'unavailable',parameter:{code:'ambiguous-parameter'}});
  });
  it('mantém orçamento prioritário e falhas de recurso sem custo zero',()=>{
    expect(resolveUsageCostAmount(null as unknown as CostItem,[],context(),{maxInputLength:0,maxDigits:64})).toMatchObject({status:'unavailable',code:'invalid-budget'});
    expect(resolveUsageCostAmount(item(),[parameter()],context('km',r('100')),{maxInputLength:256,maxDigits:1})).toMatchObject({status:'unavailable',code:'calculation-unavailable',calculation:{code:'resource-budget'}});
  });
  it('exclui inativo sem valor e preserva as outras incidências para seus próprios caminhos',()=>{
    const disabled=resolveUsageCostAmount({...item(),enabled:false},[],context(),limits);
    expect(disabled).toEqual({status:'excluded',costId:'cost',reason:'disabled',ledgerAdmission:'not-evaluated'});expect(disabled).not.toHaveProperty('value');
    for(const basis of [{kind:'calendar',period:'month'},{kind:'one-off'},{kind:'custom',unit:'evento',ruleId:'regra',justification:'fixture'}] as const)
      expect(resolveUsageCostAmount({...item(),basis},[parameter()],context(),limits)).toMatchObject({status:'unavailable',code:'unsupported-cost-basis'});
  });
  it('mantém imutabilidade,JSON e determinismo sem status de receita/lucro derivado de viagens',()=>{
    const cost=item('trip'),p=parameter('BRL/trip'),c=context('trip',r('10')),args=[cost,p,c,limits],before=JSON.stringify(args);
    const first=resolveUsageCostAmount(cost,[p],c,limits);expect(first).toEqual(resolveUsageCostAmount(cost,[p],c,limits));
    expect(JSON.stringify(args)).toBe(before);expect(Object.isFrozen(cost)).toBe(false);expect(Object.isFrozen(c)).toBe(false);
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);expect(Object.isFrozen(first)).toBe(true);
    if(first.status!=='ready')throw Error('Expected ready');
    expect(Object.isFrozen(first.quantity)).toBe(true);expect(Object.isFrozen(first.quantity.value)).toBe(true);expect(Object.isFrozen(first.parameter)).toBe(true);
    expect(first).not.toHaveProperty('profit');expect(first).not.toHaveProperty('viable');expect(first).not.toHaveProperty('revenue');
  });
});
