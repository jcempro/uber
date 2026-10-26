/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.1/8.2, FT-003.23.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {describe,expect,it,vi} from 'vitest';
import {compareExactRationals} from './exact-compare';
import type {ExactRational,ExactLimits} from './exact';
const budget=Object.freeze({maxInputLength:256,maxDigits:64});
/** Par literal independente para relações matemáticas, sem preços/defaults financeiros. */
const r=(numerator:string,denominator='1'):ExactRational=>Object.freeze({numerator,denominator});
/** Exige comparação disponível e seu enum exato, sem aceitar falha como igualdade. */
function order(a:ExactRational,b:ExactRational,limits:ExactLimits=budget):-1|0|1 {
  const result=compareExactRationals(a,b,limits);
  if(result.status!=='ready')throw Error(JSON.stringify(result));
  expect(Object.isFrozen(result)).toBe(true);return result.order;
}
describe('Comparação racional exata sem Number monetário',()=>{
  it('reconhece igualdade matemática em pares normalizados ou não',()=>{
    expect(order(r('2','4'),r('1','2'))).toBe(0);
    expect(order(r('0'),r('0','7'))).toBe(0);
    expect(order(r('-3','9'),r('-1','3'))).toBe(0);
  });
  it('ordena sinais,frações e zero nas duas direções',()=>{
    expect(order(r('-1','2'),r('0'))).toBe(-1);
    expect(order(r('0'),r('-1','2'))).toBe(1);
    expect(order(r('1','3'),r('1','2'))).toBe(-1);
    expect(order(r('1','2'),r('1','3'))).toBe(1);
    expect(order(r('-1','2'),r('-1','3'))).toBe(-1);
    expect(order(r('1'),r('-1'))).toBe(1);
  });
  it('distingue inteiros acima de2^53 e razões recorrentes sem arredondar',()=>{
    expect(order(r('9007199254740993'),r('9007199254740992'))).toBe(1);
    expect(order(r('9007199254740992'),r('9007199254740993'))).toBe(-1);
    expect(order(r('120','7'),r('17'))).toBe(1); // RCF§7 mantém4×30/7 exato.
    expect(order(r('1','100000000000000000001'),r('1','100000000000000000000'))).toBe(-1);
  });
  it('recusa representações inválidas de ambos lados sem extrair wrappers',()=>{
    for(const bad of [null,r('01'),r('1','0'),r('1e3'),{status:'ready',value:r('1')}]){
      expect(compareExactRationals(bad as unknown as ExactRational,r('1'),budget)).toMatchObject({status:'unavailable',code:'invalid-rational'});
      expect(compareExactRationals(r('1'),bad as unknown as ExactRational,budget)).toMatchObject({status:'unavailable',code:'invalid-rational'});
    }
  });
  it('valida orçamento primeiro e limita comprimento e dígitos',()=>{
    expect(compareExactRationals(null as unknown as ExactRational,r('1'),{maxInputLength:0,maxDigits:64})).toEqual({status:'unavailable',code:'invalid-budget',reason:'Orçamento inválido: maxInputLength não é inteiro positivo seguro.'});
    expect(compareExactRationals(r('x'.repeat(257)),r('1'),budget)).toMatchObject({status:'unavailable',code:'resource-budget'});
    expect(compareExactRationals(r('12'),r('1'),{maxInputLength:256,maxDigits:1})).toMatchObject({status:'unavailable',code:'resource-budget'});
  });
  it('guarda produtos/diferença sem exigir denominador que a comparação não usa',()=>{
    const tiny={maxInputLength:256,maxDigits:1},two={maxInputLength:256,maxDigits:2};
    expect(order(r('1','8'),r('1','8'),tiny)).toBe(0);
    expect(order(r('9'),r('9'),tiny)).toBe(0);
    expect(order(r('1','2'),r('1','3'),tiny)).toBe(1);
    expect(compareExactRationals(r('9'),r('-9'),tiny)).toMatchObject({status:'unavailable',code:'resource-budget'});
    expect(order(r('9'),r('-9'),two)).toBe(1);
    expect(compareExactRationals(r('9','8'),r('8','9'),tiny)).toMatchObject({status:'unavailable',code:'resource-budget'});
    expect(order(r('9','8'),r('8','9'),two)).toBe(1);
  });
  it('preserva entradas,JSON e determinismo e congela falhas',()=>{
    const a=r('-2','3'),b=r('1','7'),before=JSON.stringify([a,b,budget]);
    const result=compareExactRationals(a,b,budget);
    expect(result).toEqual(compareExactRationals(a,b,budget));
    expect(JSON.stringify([a,b,budget])).toBe(before);
    expect(JSON.parse(JSON.stringify(result))).toEqual({status:'ready',order:-1});
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(compareExactRationals(r('1','0'),b,budget))).toBe(true);
  });
  it('captura falhas materiais de conversão e sentinela como indisponibilidade',()=>{
    const original=globalThis.BigInt;
    for(const selected of ['7',64]){
      const spy=vi.spyOn(globalThis,'BigInt').mockImplementation((input)=>{
        if(input===selected)throw new RangeError('comparison resource probe');
        return original(input);
      });
      try {
        expect(compareExactRationals(r('7'),r('1'),budget)).toMatchObject({status:'unavailable',code:'arithmetic-failure'});
      } finally {spy.mockRestore();}
    }
  });
});
