/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8, FT-003.26.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {describe,expect,it} from 'vitest';
import {resolveNumericParameter} from './numeric-parameter';
import {INITIAL_TIME_PARAMETERS} from './defaults';
import {NUMERIC_RULES} from './validation';
import type {NumericParameter,NumericInput} from './model';
const budget=Object.freeze({maxInputLength:256,maxDigits:64});
/** Registro independente para identidade/unidade; valores não são preços ou defaults operacionais. */
function parameter(id:string,input:NumericInput={status:'provided',value:'2.5'},unit='h'):NumericParameter {
  return {id,name:'Fixture',unit,category:'schedule',input,provenance:{kind:'estimate',source:'fixture-matemática',date:null,competence:null,scope:{kind:'global'},reliability:'estimated'},required:true,constraints:NUMERIC_RULES.nonNegative,dependencies:[]};
}
describe('Resolução pontual de parâmetro por ID e unidade declarada',()=>{
  it('resolve jornada canônica por ID e unidade h,sem copiar defaults',()=>{
    expect(resolveNumericParameter('time-hours-short','h',INITIAL_TIME_PARAMETERS,budget)).toEqual({status:'ready',inputStatus:'provided',parameterId:'time-hours-short',unit:'h',value:{numerator:'3',denominator:'1'}});
  });
  it('preserva identidades literais e IDs especiais sem normalização ou protótipo',()=>{
    const items=[parameter(' x'),parameter('x',{status:'provided',value:'4'}),parameter('__proto__',{status:'provided',value:'5'})];
    expect(resolveNumericParameter(' x','h',items,budget)).toMatchObject({status:'ready',parameterId:' x',value:{numerator:'5',denominator:'2'}});
    expect(resolveNumericParameter('x','h',items,budget)).toMatchObject({status:'ready',parameterId:'x',value:{numerator:'4',denominator:'1'}});
    expect(resolveNumericParameter('__proto__','h',items,budget)).toMatchObject({status:'ready',parameterId:'__proto__',value:{numerator:'5',denominator:'1'}});
    expect(resolveNumericParameter(' x ','h',items,budget)).toMatchObject({status:'unavailable',code:'missing-parameter'});
  });
  it('recusa referência ausente e todos os candidatos ambíguos,inclusive mesma instância',()=>{
    const first=parameter('p'),second=parameter('p',{status:'provided',value:'4'});
    expect(resolveNumericParameter('missing','h',[first],budget)).toMatchObject({status:'unavailable',code:'missing-parameter',parameterId:'missing'});
    for(const list of [[first,second],[first,first]])
      expect(resolveNumericParameter('p','h',list,budget)).toMatchObject({status:'unavailable',code:'ambiguous-parameter',parameterId:'p'});
  });
  it('exige unidade contratada sem conversão implícita',()=>{
    const p=parameter('p',{status:'provided',value:'60'},'min');
    expect(resolveNumericParameter('p','h',[p],budget)).toMatchObject({status:'unavailable',code:'incompatible-unit',parameterId:'p',unit:'min'});
    expect(resolveNumericParameter('p','min',[p],budget)).toMatchObject({status:'ready',unit:'min',value:{numerator:'60',denominator:'1'}});
  });
  it('mantém estados não resolvidos,hipóteses e diagnósticos originais com identidade',()=>{
    const lost=resolveNumericParameter('time-lost-days','working-day',INITIAL_TIME_PARAMETERS,budget);
    expect(lost).toMatchObject({status:'unavailable',code:'unresolved-input',inputStatus:'not-provided',parameterId:'time-lost-days',unit:'working-day'});
    expect(lost).not.toHaveProperty('value');
    expect(resolveNumericParameter('p','h',[parameter('p',{status:'assumed-zero',value:'0'})],budget)).toMatchObject({status:'ready',inputStatus:'assumed-zero',value:{numerator:'0',denominator:'1'}});
    expect(resolveNumericParameter('p','h',[parameter('p',{status:'provided',value:'-1'})],budget)).toMatchObject({status:'invalid',validation:{valid:false,code:'negative'},parameterId:'p',unit:'h'});
  });
  it('valida referência e coleção e dá prioridade ao orçamento técnico',()=>{
    for(const[id,unit]of [['','h'],['   ','h'],['p','']])
      expect(resolveNumericParameter(id,unit,[parameter('p')],budget)).toMatchObject({status:'unavailable',code:'invalid-reference'});
    expect(resolveNumericParameter('p','h',null as unknown as readonly NumericParameter[],budget)).toMatchObject({status:'unavailable',code:'invalid-reference'});
    expect(resolveNumericParameter('','',null as unknown as readonly NumericParameter[],{maxInputLength:0,maxDigits:64})).toEqual({status:'unavailable',code:'invalid-budget',parameterId:null,unit:null,reason:'Orçamento inválido: maxInputLength não é inteiro positivo seguro.'});
  });
  it('propaga recurso insuficiente sem produzir resultado ou unidade convertida',()=>{
    expect(resolveNumericParameter('p','h',[parameter('p',{status:'provided',value:'123'})],{maxInputLength:2,maxDigits:64})).toMatchObject({status:'unavailable',code:'resource-budget',parameterId:'p',unit:'h'});
  });
  it('preserva registros,JSON,determinismo e imutabilidade sem congelar o chamador',()=>{
    const p=parameter('p'),items=[p],before=JSON.stringify([items,budget]);
    const first=resolveNumericParameter('p','h',items,budget);
    expect(first).toEqual(resolveNumericParameter('p','h',items,budget));
    expect(JSON.stringify([items,budget])).toBe(before);expect(Object.isFrozen(p)).toBe(false);expect(Object.isFrozen(items)).toBe(false);
    expect(Object.isFrozen(first)).toBe(true);expect(JSON.parse(JSON.stringify(first))).toEqual(first);
    if(first.status!=='ready')throw Error('Expected ready');expect(Object.isFrozen(first.value)).toBe(true);
    expect(Object.isFrozen(resolveNumericParameter('missing','h',items,budget))).toBe(true);
  });
});
