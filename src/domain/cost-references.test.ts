/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§8.1, FT-003.35.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {describe,expect,it} from 'vitest';
import {resolveCostRequirementReferences} from './cost-references';
import type {CostRequirement} from './cost-requirement';
import type {CostItem} from './model';
import {INITIAL_UNVERIFIED_COST_REQUIREMENTS} from './cost-requirements';
const provenance={kind:'illustrative-hypothesis',source:'fixture de vínculos, não despesa comprovada',date:null,competence:null,scope:{kind:'global'},reliability:'conditional'} as const;
function requirement():Extract<CostRequirement,{status:'applicable'}>{return {id:'requirement',name:'Fixture',category:'fixture',provenance,status:'applicable',costItemIds:['a','b']};}
function cost(id:string,enabled=true):CostItem{return {id,name:'Fixture',category:'fixture',enabled,nature:'fixed',basis:{kind:'calendar',period:'month'},amountParameterId:'not-resolved',provenance,validity:{start:null,end:null},recognition:'planned-outflow',eventId:null,reconcilesReserveId:null,allocationRuleId:null};}
describe('Vínculos de rubricas sem cobertura financeira presumida',()=>{
  it('resolve referências por identidade exata e mantém ordem da rubrica',()=>{
    expect(resolveCostRequirementReferences(requirement(),[cost('b'),cost('a')])).toEqual({status:'references-resolved',requirementId:'requirement',costItemIds:['a','b'],financialCoverage:'not-evaluated'});
    const spaced={...requirement(),costItemIds:[' a '] as const};
    expect(resolveCostRequirementReferences(spaced,[cost('a')])).toMatchObject({status:'unavailable',code:'missing-cost-item',costItemId:' a '});
    expect(resolveCostRequirementReferences(spaced,[cost(' a ')])).toMatchObject({status:'references-resolved',costItemIds:[' a ']});
  });
  it('mantém todas as rubricas iniciais não verificadas como pendências,sem valor0',()=>{
    expect(INITIAL_UNVERIFIED_COST_REQUIREMENTS.length).toBeGreaterThan(0);
    for(const r of INITIAL_UNVERIFIED_COST_REQUIREMENTS){
      const result=resolveCostRequirementReferences(r,[]);
      expect(result).toMatchObject({status:'unavailable',code:'unverified-applicability',requirementId:r.id,reason:r.status==='unverified'?r.reason:undefined});
      expect(result).not.toHaveProperty('value');expect(result).not.toHaveProperty('costItemIds');
    }
  });
  it('distingue inaplicabilidade declarada e exige fundamento sem referências contraditórias',()=>{
    const base={id:'r',name:'Fixture',category:'fixture',provenance};
    expect(resolveCostRequirementReferences({...base,status:'not-applicable',reason:'Não há contrato para esta rubrica na hipótese.'},[])).toMatchObject({status:'declared-not-applicable',reason:'Não há contrato para esta rubrica na hipótese.',financialCoverage:'not-evaluated'});
    for(const status of ['not-applicable','unverified'] as const){
      expect(resolveCostRequirementReferences({...base,status,reason:' '},[])).toMatchObject({status:'unavailable',code:'invalid-requirement'});
      const contradictory={...base,status,reason:'Fixture',costItemIds:[]} as unknown as CostRequirement;
      expect(resolveCostRequirementReferences(contradictory,[])).toMatchObject({status:'unavailable',code:'invalid-requirement'});
    }
  });
  it('recusa custo ausente,duplicado,inativo ou com ativação inválida',()=>{
    const r={...requirement(),costItemIds:['a'] as const};
    expect(resolveCostRequirementReferences(r,[])).toMatchObject({status:'unavailable',code:'missing-cost-item',costItemId:'a'});
    expect(resolveCostRequirementReferences(r,[cost('a'),cost('a',false)])).toMatchObject({status:'unavailable',code:'ambiguous-cost-item'});
    expect(resolveCostRequirementReferences(r,[cost('a',false)])).toMatchObject({status:'unavailable',code:'inactive-cost-item'});
    expect(resolveCostRequirementReferences(r,[{...cost('a'),enabled:undefined} as unknown as CostItem])).toMatchObject({status:'unavailable',code:'invalid-cost-item'});
  });
  it('recusa identidades/listas inválidas ou repetidas,sem deduplicação silenciosa',()=>{
    expect(resolveCostRequirementReferences(null as unknown as CostRequirement,[])).toMatchObject({status:'unavailable',code:'invalid-requirement'});
    for(const costItemIds of [[],[' '],['a','a'],[1]]){
      expect(resolveCostRequirementReferences({...requirement(),costItemIds} as unknown as CostRequirement,[])).toMatchObject({status:'unavailable',code:'invalid-requirement'});
    }
    expect(resolveCostRequirementReferences(requirement(),null as unknown as readonly CostItem[])).toMatchObject({status:'unavailable',code:'invalid-cost-collection'});
  });
  it('preserva fontes,JSON e imutabilidade sem computar quantia ou declarar completude',()=>{
    const r=requirement(),costs=[cost('a'),cost('b')],before=JSON.stringify([r,costs]),first=resolveCostRequirementReferences(r,costs);
    expect(first).toEqual(resolveCostRequirementReferences(r,costs));expect(JSON.stringify([r,costs])).toBe(before);expect(Object.isFrozen(r)).toBe(false);expect(Object.isFrozen(costs)).toBe(false);
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);expect(Object.isFrozen(first)).toBe(true);
    if(first.status!=='references-resolved'||r.status!=='applicable')throw Error('Expected resolved');
    expect(Object.isFrozen(first.costItemIds)).toBe(true);expect(first.costItemIds).not.toBe(r.costItemIds);expect(first.financialCoverage).toBe('not-evaluated');
    expect(first).not.toHaveProperty('complete');expect(first).not.toHaveProperty('value');expect(first).not.toHaveProperty('totalCost');
  });
});
