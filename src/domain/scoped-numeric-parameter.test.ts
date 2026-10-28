/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§4/model.NumericInput/ParameterScope, FT-003.39.4.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {describe,expect,it} from 'vitest';
import type {NumericParameter,NumericInput,ParameterScope} from './model';
import {NUMERIC_RULES} from './validation';
import {resolveScopedNumericParameter} from './scoped-numeric-parameter';
const limits=Object.freeze({maxInputLength:256,maxDigits:64});
function parameter(id='p',input:NumericInput={status:'provided',value:'1.25'},scope:ParameterScope={kind:'global'},unit='BRL/km'):NumericParameter {return {id,name:'Fixture sintética',unit,category:'fixture',input,provenance:{kind:'illustrative-hypothesis',source:'Fixture, não custo operacional',date:null,competence:null,scope,reliability:'conditional'},required:true,constraints:NUMERIC_RULES.nonNegative,dependencies:[]};}
function frozen(value:unknown):void {if(value!==null&&typeof value==='object'){expect(Object.isFrozen(value)).toBe(true);for(const child of Object.values(value))frozen(child);}}
describe('Quantidade selecionada e escopo declarado',()=>{
  it('global resolve1.25como5/4 sem contexto e sem admissão financeira',()=>{
    expect(resolveScopedNumericParameter('p','BRL/km',[parameter()],limits)).toEqual({status:'scope-checked',numeric:{status:'ready',parameterId:'p',unit:'BRL/km',inputStatus:'provided',value:{numerator:'5',denominator:'4'}},scopeMatch:{status:'scope-matched',scope:{kind:'global'},targetId:null,precedence:'not-evaluated'},financialAdmission:'not-evaluated'});
  });
  it('veículo e cenário devem corresponder literalmente ao contexto',()=>{
    for(const [scope,good,bad]of [[{kind:'vehicle',vehicleId:'v'},{vehicleId:'v'},{vehicleId:'V'}],[{kind:'scenario',scenarioId:'c'},{scenarioId:'c'},{scenarioId:'outro'}]] as const){
      const p=parameter('p',{status:'provided',value:'1'},scope);
      expect(resolveScopedNumericParameter('p','BRL/km',[p],limits,good).status).toBe('scope-checked');
      expect(resolveScopedNumericParameter('p','BRL/km',[p],limits,bad)).toMatchObject({status:'unavailable',stage:'scope',scopeMatch:{status:'outside-scope'},financialAdmission:'not-evaluated'});
    }
  });
  it('contexto e proveniência inválidos ou ausentes não recebem aprovação',()=>{
    const p=parameter('p',{status:'provided',value:'1'},{kind:'vehicle',vehicleId:'v'});
    expect(resolveScopedNumericParameter('p','BRL/km',[p],limits)).toMatchObject({status:'unavailable',stage:'scope',scopeMatch:{code:'missing-context-id',field:'vehicleId'}});
    expect(resolveScopedNumericParameter('p','BRL/km',[p],limits,{vehicleId:' '})).toMatchObject({status:'unavailable',stage:'scope',scopeMatch:{code:'invalid-context-id'}});
    for(const item of [{...p,provenance:undefined} as unknown as NumericParameter,parameter('p',{status:'provided',value:'1'},{kind:'vehicle',vehicleId:12} as unknown as ParameterScope)]){
      const result=resolveScopedNumericParameter('p','BRL/km',[item],limits);expect(result).toMatchObject({status:'unavailable',stage:'scope',scopeMatch:{code:'invalid-scope'},financialAdmission:'not-evaluated'});frozen(result);
    }
  });
  it('diagnósticos de ID, ambiguidade, unidade, orçamento e formato permanecem originais',()=>{
    const p=parameter();
    for(const [id,unit,items,budget,code]of [['missing','BRL/km',[p],limits,'missing-parameter'],['p','BRL/km',[p,p],limits,'ambiguous-parameter'],['p','h',[p],limits,'incompatible-unit'],['p','BRL/km',[p],{maxInputLength:0,maxDigits:64},'invalid-budget']] as const)
      expect(resolveScopedNumericParameter(id,unit,items,budget)).toMatchObject({status:'unavailable',stage:'numeric',scopeMatch:null,numeric:{status:'unavailable',code},financialAdmission:'not-evaluated'});
    expect(resolveScopedNumericParameter('p','BRL/km',[parameter('p',{status:'provided',value:'abc'})],limits)).toMatchObject({status:'unavailable',stage:'numeric',numeric:{status:'invalid',validation:{valid:false}},scopeMatch:null});
  });
  it('quatro estados não quantificados não viram zero nem exigem contexto desnecessário',()=>{
    for(const status of ['absent','not-provided','not-applicable','invalid'] as const){
      const result=resolveScopedNumericParameter('p','BRL/km',[parameter('p',{status,reason:'Dependência sintética pendente'},{kind:'vehicle',vehicleId:'v'})],limits);
      expect(result).toMatchObject({status:'unavailable',stage:'numeric',scopeMatch:null,numeric:{status:'unavailable',code:'unresolved-input',inputStatus:status,reason:'Dependência sintética pendente'},financialAdmission:'not-evaluated'});expect(result.numeric).not.toHaveProperty('value');frozen(result);
    }
  });
  it('zero confirmado e zero hipotético conservam natureza e limite do aceite',()=>{
    for(const status of ['confirmed-zero','assumed-zero'] as const){
      const result=resolveScopedNumericParameter('p','BRL/km',[parameter('p',{status,value:'0'})],limits);
      expect(result).toMatchObject({status:'scope-checked',numeric:{inputStatus:status,value:{numerator:'0',denominator:'1'}},financialAdmission:'not-evaluated'});expect(result).not.toHaveProperty('financialCoverage');
    }
  });
  it('IDs brutos e especiais não sofrem normalização ou busca por protótipo',()=>{
    const items=[parameter(' p',{status:'provided',value:'1'},{kind:'vehicle',vehicleId:' v '}),parameter('p',{status:'provided',value:'2'}),parameter('__proto__',{status:'provided',value:'3'})];
    const raw=resolveScopedNumericParameter(' p','BRL/km',items,limits,{vehicleId:' v '});expect(raw).toMatchObject({status:'scope-checked',numeric:{parameterId:' p',value:{numerator:'1',denominator:'1'}},scopeMatch:{targetId:' v '}});
    expect(resolveScopedNumericParameter('__proto__','BRL/km',items,limits)).toMatchObject({status:'scope-checked',numeric:{parameterId:'__proto__',value:{numerator:'3',denominator:'1'}}});
    expect(resolveScopedNumericParameter(' p ','BRL/km',items,limits)).toMatchObject({status:'unavailable',numeric:{code:'missing-parameter'}});
  });
  it('snapshots congelados e repetíveis não modificam nem congelam entradas',()=>{
    const scope:{kind:'scenario';scenarioId:string}={kind:'scenario',scenarioId:'c'},items=[parameter('p',{status:'provided',value:'1.25'},scope)],context={scenarioId:'c'},before=JSON.stringify([items,context]);
    const result=resolveScopedNumericParameter('p','BRL/km',items,limits,context);expect(resolveScopedNumericParameter('p','BRL/km',items,limits,context)).toEqual(result);frozen(result);
    expect(JSON.stringify([items,context])).toBe(before);expect(Object.isFrozen(items)).toBe(false);expect(Object.isFrozen(items[0])).toBe(false);expect(Object.isFrozen(scope)).toBe(false);
    scope.scenarioId='alterado';context.scenarioId='alterado';expect(result.scopeMatch).toMatchObject({scope:{kind:'scenario',scenarioId:'c'},targetId:'c'});
  });
});
