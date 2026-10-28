/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.1, FT-003.39.1a.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { describe, expect, it } from 'vitest';
import { resolveCostRequirementPeriod } from './cost-period';
import type { CostItem, CostValidity } from './model';
import type { CostRequirement } from './cost-requirement';
const provenance={kind:'illustrative-hypothesis',source:'Fixture temporal sintética, não despesa real',date:null,competence:null,scope:{kind:'global'},reliability:'conditional'} as const;
const interval=Object.freeze({start:'2026-02-01',end:'2026-02-28'});
function requirement(ids:readonly [string,...string[]]=['a']):CostRequirement { return {id:'r',name:'Fixture',category:'fixture',provenance,status:'applicable',costItemIds:ids}; }
function cost(id='a',validity:CostValidity={start:'2026-01-01',end:'2026-12-31'},enabled=true):CostItem {return {id,name:'Fixture',category:'fixture',enabled,nature:'fixed',basis:{kind:'calendar',period:'month'},amountParameterId:'not-resolved',provenance,validity,recognition:'planned-outflow',eventId:null,reconcilesReserveId:null,allocationRuleId:null};}
/** Confere imutabilidade dos resultados sem congelar dados recebidos pelo produto. */
function frozen(value:unknown):void {if(value!==null&&typeof value==='object'){expect(Object.isFrozen(value)).toBe(true);for(const child of Object.values(value))frozen(child);}}
describe('Referências e vigência sem admissão financeira presumida',()=>{
  it('exige cobertura inclusiva de todos os custos e conserva a ordem declarada',()=>{
    for(const ids of [['a'],['b','a']] as const) expect(resolveCostRequirementPeriod(requirement(ids),[cost('a',interval),cost('b')],interval)).toEqual({status:'period-covered',requirementId:'r',costItemIds:ids,interval,costAdmission:'not-evaluated'});
  });
  it('propaga missing, ambiguous e inactive sem substituir o diagnóstico',()=>{
    const cases=[{costs:[],code:'missing-cost-item'},{costs:[cost(),cost()],code:'ambiguous-cost-item'},{costs:[cost('a',interval,false)],code:'inactive-cost-item'}];
    for(const fixture of cases){const r=resolveCostRequirementPeriod(requirement(),fixture.costs,interval);expect(r).toMatchObject({status:'unavailable',stage:'references',requirementId:'r',costItemId:'a',references:{status:'unavailable',code:fixture.code,costItemId:'a'},validity:null,costAdmission:'not-evaluated'});expect(r).not.toHaveProperty('value');}
  });
  it('distingue rubrica não verificada de inaplicabilidade expressa sem atribuir zero',()=>{
    const base={id:'r',name:'Fixture',category:'fixture',provenance,reason:'Fundamento sintético'};
    expect(resolveCostRequirementPeriod({...base,status:'unverified'},[],interval)).toMatchObject({status:'unavailable',stage:'references',references:{code:'unverified-applicability'},costAdmission:'not-evaluated'});
    const result=resolveCostRequirementPeriod({...base,status:'not-applicable'},[],interval);
    expect(result).toEqual({status:'declared-not-applicable',requirementId:'r',reason:base.reason,financialCoverage:'not-evaluated',costAdmission:'not-evaluated'});expect(result).not.toHaveProperty('value');
  });
  it('mantém vigência desconhecida e datas impossíveis como indisponíveis',()=>{
    for(const fixture of [{validity:{start:null,end:null},code:'unresolved-validity'},{validity:{start:'2026-02-30',end:'2026-03-01'},code:'invalid-date'}]) expect(resolveCostRequirementPeriod(requirement(),[cost('a',fixture.validity)],interval)).toMatchObject({status:'unavailable',stage:'validity',costItemId:'a',validity:{status:'unavailable',code:fixture.code,field:'validity.start'},costAdmission:'not-evaluated'});
  });
  it('bloqueia vigência fora do intervalo sem produzir exclusão monetária ou zero',()=>{
    const result=resolveCostRequirementPeriod(requirement(),[cost('a',{start:'2026-01-01',end:'2026-01-31'})],interval);
    expect(result).toMatchObject({status:'unavailable',stage:'validity',costItemId:'a',validity:{status:'classified',relation:'outside-interval'},costAdmission:'not-evaluated'});expect(result).not.toHaveProperty('value');
  });
  it('bloqueia sobreposição parcial sem ratear até mesmo na fronteira inclusiva',()=>{
    for(const validity of [{start:'2026-02-01',end:'2026-02-15'},{start:'2026-02-28',end:'2026-03-31'}]) expect(resolveCostRequirementPeriod(requirement(),[cost('a',validity)],interval)).toMatchObject({status:'unavailable',stage:'validity',validity:{status:'classified',relation:'partial-overlap'},costAdmission:'not-evaluated'});
  });
  it('conserva prioridade do diagnóstico do intervalo alvo no classificador',()=>{
    expect(resolveCostRequirementPeriod(requirement(),[cost('a',{start:null,end:null})],{start:'2026-02-30',end:'2026-03-01'})).toMatchObject({status:'unavailable',stage:'validity',validity:{status:'unavailable',code:'invalid-date',field:'interval.start'}});
  });
  it('preserva IDs brutos, congela snapshots e repete resultados sem mutar entradas',()=>{
    const input=requirement([' a','a']),costs=[cost('a'),cost(' a')],before=JSON.stringify([input,costs,interval]);
    const first=resolveCostRequirementPeriod(input,costs,interval);expect(first).toMatchObject({status:'period-covered',costItemIds:[' a','a']});frozen(first);
    expect(resolveCostRequirementPeriod(input,costs,interval)).toEqual(first);expect(JSON.stringify([input,costs,interval])).toBe(before);
    const bad=resolveCostRequirementPeriod(input,[],interval);frozen(bad);expect(bad).toMatchObject({status:'unavailable',costItemId:' a'});
  });
});
