/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§4, FT-003.25.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {describe,expect,it} from 'vitest';
import {resolveNumericInput} from './numeric-input';
import {parseExactDecimal} from './exact';
import {NUMERIC_RULES} from './validation';
import {INITIAL_TIME_PARAMETERS} from './defaults';
import type {NumericInput} from './model';
const budget=Object.freeze({maxInputLength:256,maxDigits:64});
describe('Estados canônicos de entrada para álgebra exata',()=>{
  it('resolve fornecido sem coerção e mantém sua origem de estado',()=>{
    expect(resolveNumericInput({status:'provided',value:'1e-3'},NUMERIC_RULES.nonNegative,budget)).toEqual({status:'ready',inputStatus:'provided',value:{numerator:'1',denominator:'1000'}});
    expect(resolveNumericInput({status:'provided',value:'9007199254740993'},NUMERIC_RULES.nonNegative,budget)).toEqual({status:'ready',inputStatus:'provided',value:{numerator:'9007199254740993',denominator:'1'}});
  });
  it('distingue os três estados quantificados mesmo com valor matemático zero',()=>{
    for(const status of ['provided','confirmed-zero','assumed-zero'] as const)
      expect(resolveNumericInput({status,value:'0'},NUMERIC_RULES.nonNegative,budget)).toEqual({status:'ready',inputStatus:status,value:{numerator:'0',denominator:'1'}});
    expect(resolveNumericInput({status:'confirmed-zero',value:'0'},NUMERIC_RULES.nonNegative,budget)).not.toEqual(resolveNumericInput({status:'assumed-zero',value:'0'},NUMERIC_RULES.nonNegative,budget));
  });
  it('preserva cada estado não quantificado e seu motivo literal,sem zero inventado',()=>{
    for(const status of ['absent','not-provided','not-applicable','invalid'] as const){
      const result=resolveNumericInput({status,reason:' motivo preservado '},NUMERIC_RULES.nonNegative,budget);
      expect(result).toEqual({status:'unavailable',code:'unresolved-input',inputStatus:status,reason:' motivo preservado '});
      expect(result).not.toHaveProperty('value');expect(Object.isFrozen(result)).toBe(true);
    }
  });
  it('rejeita zeros contraditórios,estado desconhecido e valor em ramo sem valor',()=>{
    for(const bad of [null,1,{status:'other'},{status:'confirmed-zero',value:'2'},{status:'assumed-zero',value:'0.0'},{status:'not-applicable',reason:'fundamento',value:'0'},{status:'absent',reason:'   '}])
      expect(resolveNumericInput(bad as unknown as NumericInput,NUMERIC_RULES.nonNegative,budget)).toMatchObject({status:'unavailable',code:'invalid-input-state'});
    expect(resolveNumericInput({status:'provided',value:{status:'ready',value:'2'}} as unknown as NumericInput,NUMERIC_RULES.nonNegative,budget)).toMatchObject({status:'invalid',validation:{valid:false,code:'type'}});
  });
  it('conserva diagnósticos do catálogo e valida zero contra o domínio positivo',()=>{
    const expected=parseExactDecimal('-1',NUMERIC_RULES.nonNegative,budget);
    expect(expected).toMatchObject({status:'invalid',validation:{valid:false,code:'negative'}});
    expect(resolveNumericInput({status:'provided',value:'-1'},NUMERIC_RULES.nonNegative,budget)).toEqual(expected);
    expect(resolveNumericInput({status:'confirmed-zero',value:'0'},NUMERIC_RULES.positive,budget)).toMatchObject({status:'invalid',validation:{valid:false,code:'out-of-range'}});
  });
  it('prioriza orçamento inválido e separa recurso insuficiente de entrada inválida',()=>{
    expect(resolveNumericInput(null as unknown as NumericInput,NUMERIC_RULES.nonNegative,{maxInputLength:0,maxDigits:64})).toEqual({status:'unavailable',code:'invalid-budget',reason:'Orçamento inválido: maxInputLength não é inteiro positivo seguro.'});
    expect(resolveNumericInput({status:'provided',value:'123'},NUMERIC_RULES.nonNegative,{maxInputLength:2,maxDigits:64})).toMatchObject({status:'unavailable',code:'resource-budget'});
  });
  it('preserva argumentos,JSON,determinismo e imutabilidade sem congelar o chamador',()=>{
    const input:NumericInput={status:'provided',value:'2.5'},before=JSON.stringify([input,NUMERIC_RULES.nonNegative,budget]);
    const result=resolveNumericInput(input,NUMERIC_RULES.nonNegative,budget);
    expect(result).toEqual(resolveNumericInput(input,NUMERIC_RULES.nonNegative,budget));
    expect(JSON.stringify([input,NUMERIC_RULES.nonNegative,budget])).toBe(before);
    expect(Object.isFrozen(input)).toBe(false);expect(Object.isFrozen(result)).toBe(true);
    expect(JSON.parse(JSON.stringify(result))).toEqual({status:'ready',inputStatus:'provided',value:{numerator:'5',denominator:'2'}});
    if(result.status!=='ready')throw Error('Expected ready');expect(Object.isFrozen(result.value)).toBe(true);
  });
  it('mantém a perda mensal real não informada e resolve a jornada cadastrada',()=>{
    const lost=INITIAL_TIME_PARAMETERS.find(p=>p.id==='time-lost-days');
    const hours=INITIAL_TIME_PARAMETERS.find(p=>p.id==='time-hours-short');
    if(!lost||!hours)throw Error('Cadastros canônicos ausentes');
    const before=JSON.stringify(INITIAL_TIME_PARAMETERS);
    expect(resolveNumericInput(lost.input,lost.constraints,budget)).toMatchObject({status:'unavailable',code:'unresolved-input',inputStatus:'not-provided'});
    expect(resolveNumericInput(hours.input,hours.constraints,budget)).toEqual({status:'ready',inputStatus:'provided',value:{numerator:'3',denominator:'1'}});
    expect(JSON.stringify(INITIAL_TIME_PARAMETERS)).toBe(before);
  });
});
