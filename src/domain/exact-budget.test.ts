/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§2/4/8.1, FT-003.19.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { describe, expect, it } from 'vitest';
import { inspectExactLimits } from './exact-budget';

describe('Política técnica compartilhada sem default financeiro', () => {
  it('cria snapshot congelado sem congelar ou modificar o objeto original', () => {
    const input = {maxInputLength:256,maxDigits:128,tag:'preservar'};
    const result = inspectExactLimits(input);
    expect(result).toEqual({valid:true,limits:{maxInputLength:256,maxDigits:128}});
    expect(Object.isFrozen(result)).toBe(true);expect(Object.isFrozen(input)).toBe(false);
    if(!result.valid) throw Error('Política válida rejeitada');
    expect(Object.isFrozen(result.limits)).toBe(true);expect(result.limits).not.toBe(input);
    expect(input).toEqual({maxInputLength:256,maxDigits:128,tag:'preservar'});
  });
  it('rejeita ausência e configuração incompleta sem defaults', () => {
    for(const input of [null,undefined,'limits',{},[]]) {
      const result = inspectExactLimits(input);
      expect(result.valid).toBe(false);expect(Object.isFrozen(result)).toBe(true);
      if(result.valid) throw Error('Configuração incompleta aceita');
      expect(result.reason.length).toBeGreaterThan(0);
    }
  });
  it('preserva diagnóstico de comprimento inválido para valores não positivos ou inseguros', () => {
    for(const value of [0,-1,1.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1,undefined,'256'])
      expect(inspectExactLimits({maxInputLength:value,maxDigits:128})).toEqual({valid:false,reason:'Orçamento inválido: maxInputLength não é inteiro positivo seguro.'});
  });
  it('preserva diagnóstico de materialização inválida e aceita configuração explícita sem inferir capacidade física', () => {
    for(const value of [0,-1,1.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1,undefined,'128'])
      expect(inspectExactLimits({maxInputLength:256,maxDigits:value})).toEqual({valid:false,reason:'Orçamento inválido: maxDigits não é inteiro positivo seguro.'});
    expect(inspectExactLimits({maxInputLength:1,maxDigits:1})).toEqual({valid:true,limits:{maxInputLength:1,maxDigits:1}});
  });
});
