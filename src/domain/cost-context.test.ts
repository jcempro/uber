/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.1/model/contratos anteriores, FT-003.39.3b.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 * Fixtures sintéticas: não são dados operacionais ou prova de viabilidade.
 */
import { describe, expect, it } from 'vitest';
import type { CostItem, ParameterScope, Provenance } from './model';
import type { CostRequirement } from './cost-requirement';
import { resolveCostRequirementContext } from './cost-context';
const interval = Object.freeze({start:'2026-02-01',end:'2026-02-28'});
function provenance(scope:ParameterScope):Provenance {return {kind:'illustrative-hypothesis',source:'Fixture sintética de contexto',date:null,competence:null,scope,reliability:'conditional'};}
function req(scope:ParameterScope={kind:'global'},ids:readonly [string,...string[]]=['a']):CostRequirement {return {id:'r',name:'Fixture',category:'fixture',provenance:provenance(scope),status:'applicable',costItemIds:ids};}
function na(scope:ParameterScope={kind:'global'}):CostRequirement {return {id:'r',name:'Fixture',category:'fixture',provenance:provenance(scope),status:'not-applicable',reason:'Inaplicabilidade sintética fundamentada'};}
function cost(id='a',scope:ParameterScope={kind:'global'}):CostItem {return {id,name:'Fixture',category:'fixture',enabled:true,nature:'fixed',basis:{kind:'calendar',period:'month'},amountParameterId:'not-resolved',provenance:provenance(scope),validity:{start:'2026-01-01',end:'2026-12-31'},recognition:'planned-outflow',eventId:null,reconcilesReserveId:null,allocationRuleId:null};}
function frozen(value:unknown):void {if(value!==null&&typeof value==='object'){expect(Object.isFrozen(value)).toBe(true);for(const child of Object.values(value))frozen(child);}}

describe('Contexto de rubrica e custos sem admissão financeira',()=>{
  it('escopos globais dispensam contexto e registram rubrica antes do custo',()=>{
    const result=resolveCostRequirementContext(req(),[cost()],interval);
    expect(result).toMatchObject({status:'context-checked',period:{status:'period-covered',costItemIds:['a'],interval},costAdmission:'not-evaluated'});
    if(result.status!=='context-checked')throw Error('Esperado contexto verificado');
    expect(result.scopeChecks.map(c=>[c.subject,c.subjectId,c.match.status])).toEqual([['requirement','r','scope-matched'],['cost-item','a','scope-matched']]);
  });
  it('combina rubrica cenário e custo veículo; cada custo deve corresponder',()=>{
    const requirement=req({kind:'scenario',scenarioId:'c'}),a=cost('a',{kind:'vehicle',vehicleId:'v'}),context={scenarioId:'c',vehicleId:'v'};
    expect(resolveCostRequirementContext(requirement,[a],interval,context).status).toBe('context-checked');
    const result=resolveCostRequirementContext(req({kind:'scenario',scenarioId:'c'},['a',' b']),[a,cost(' b',{kind:'scenario',scenarioId:'outro'})],interval,context);
    expect(result).toMatchObject({status:'unavailable',stage:'scope',costItemId:' b',scopeMatch:{status:'outside-scope',targetId:'c'},costAdmission:'not-evaluated'});
    expect(result).not.toHaveProperty('value');frozen(result);
  });
  it('escopo alheio da rubrica bloqueia mesmo declaração de inaplicabilidade',()=>{
    for(const requirement of [req({kind:'scenario',scenarioId:'outro'}),na({kind:'scenario',scenarioId:'outro'})]){
      const result=resolveCostRequirementContext(requirement,[cost()],interval,{scenarioId:'atual'});
      expect(result).toMatchObject({status:'unavailable',stage:'scope',costItemId:null,scopeMatch:{status:'outside-scope'},costAdmission:'not-evaluated'});
      if(result.status!=='unavailable')throw Error('Esperado bloqueio');expect(result.reason.length).toBeGreaterThan(0);frozen(result);
    }
  });
  it('lacunas, campos inválidos e proveniência ausente são diagnósticos sem zero',()=>{
    for(const [context,code]of [[undefined,'missing-context-id'],[{vehicleId:' '},'invalid-context-id']] as const){
      const result=resolveCostRequirementContext(req(),[cost('a',{kind:'vehicle',vehicleId:'v'})],interval,context);
      expect(result).toMatchObject({status:'unavailable',stage:'scope',costItemId:'a',scopeMatch:{status:'unavailable',code,field:'vehicleId'},costAdmission:'not-evaluated'});frozen(result);
    }
    const invalid=cost('a',{kind:'vehicle',vehicleId:123} as unknown as ParameterScope);
    for(const item of [invalid,{...cost(),provenance:undefined} as unknown as CostItem])expect(resolveCostRequirementContext(req(),[item],interval)).toMatchObject({status:'unavailable',stage:'scope',scopeMatch:{code:'invalid-scope'},costAdmission:'not-evaluated'});
    const missing={...req(),provenance:undefined} as unknown as CostRequirement;
    expect(resolveCostRequirementContext(missing,[cost()],interval)).toMatchObject({status:'unavailable',stage:'scope',costItemId:null,scopeMatch:{code:'invalid-scope'}});
  });
  it('falhas anteriores propagam código original antes de exigir contexto',()=>{
    const requirement=req({kind:'vehicle',vehicleId:'v'});
    for(const [items,diagnostic]of [
      [[],{references:{code:'missing-cost-item'}}],
      [[{...cost(),enabled:false}],{references:{code:'inactive-cost-item'}}],
      [[{...cost(),validity:{start:'2026-02-01',end:'2026-02-15'}}],{validity:{relation:'partial-overlap'}}],
      [[{...cost(),validity:{start:null,end:null}}],{validity:{code:'unresolved-validity'}}],
    ] as const){
      const result=resolveCostRequirementContext(requirement,items,interval);
      expect(result).toMatchObject({status:'unavailable',stage:'period',scopeMatch:null,period:{status:'unavailable',...diagnostic},costAdmission:'not-evaluated'});frozen(result);
    }
  });
  it('NA fundamentado exige apenas seu próprio escopo e preserva motivo sem valor',()=>{
    const global=resolveCostRequirementContext(na(),[],interval);
    expect(global).toMatchObject({status:'declared-not-applicable',period:{reason:'Inaplicabilidade sintética fundamentada',financialCoverage:'not-evaluated'},costAdmission:'not-evaluated'});expect(global).not.toHaveProperty('value');frozen(global);
    const requirement=na({kind:'scenario',scenarioId:'c'});
    expect(resolveCostRequirementContext(requirement,[],interval)).toMatchObject({status:'unavailable',stage:'scope',scopeMatch:{code:'missing-context-id'}});
    const scoped=resolveCostRequirementContext(requirement,[],interval,{scenarioId:'c'});
    expect(scoped.status).toBe('declared-not-applicable');
    if(scoped.status!=='declared-not-applicable')throw Error('Esperado NA declarado');expect(scoped.scopeChecks).toHaveLength(1);frozen(scoped);
  });
  it('IDs brutos, ordem, snapshots e repetição preservam entradas mutáveis',()=>{
    const rawScope:{kind:'vehicle';vehicleId:string}={kind:'vehicle',vehicleId:' v '};
    const requirement=req({kind:'scenario',scenarioId:' c '},[' a','a']),items=[cost('a'),cost(' a',rawScope)],context={scenarioId:' c ',vehicleId:' v '};
    const before=JSON.stringify([requirement,items,context]),result=resolveCostRequirementContext(requirement,items,interval,context);
    expect(resolveCostRequirementContext(requirement,items,interval,context)).toEqual(result);expect(JSON.stringify([requirement,items,context])).toBe(before);
    expect(Object.isFrozen(requirement)).toBe(false);expect(Object.isFrozen(items)).toBe(false);expect(Object.isFrozen(rawScope)).toBe(false);
    if(result.status!=='context-checked')throw Error('Esperado contexto verificado');
    expect(result.scopeChecks.map(c=>c.subjectId)).toEqual(['r',' a','a']);frozen(result);
    rawScope.vehicleId='alterado';context.vehicleId='alterado';
    expect(result.scopeChecks[1]?.match).toMatchObject({status:'scope-matched',scope:{kind:'vehicle',vehicleId:' v '},targetId:' v '});
  });
  it('contexto verificado não admite quantias, eventos ou cobertura financeira',()=>{
    const items=[{...cost('a'),eventId:'evento-sem-conciliacao',reconcilesReserveId:'reserva-nao-resolvida'},{...cost('b'),eventId:'evento-sem-conciliacao'}];
    const result=resolveCostRequirementContext(req({kind:'global'},['a','b']),items,interval);
    expect(result).toMatchObject({status:'context-checked',costAdmission:'not-evaluated',period:{costAdmission:'not-evaluated'}});
    for(const key of ['value','financialCoverage','ledgerAdmission','creditedRevenue','netProfit'])expect(result).not.toHaveProperty(key);
  });
});
