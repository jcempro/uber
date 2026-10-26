/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.1/8.2, FT-003.20.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { describe, expect, it, vi } from 'vitest';
import { calculateExactProduct } from './exact-product';
import type { ExactProductOperation } from './exact-product';
import type { ExactRational, ExactLimits } from './exact';
const budget=Object.freeze({maxInputLength:256,maxDigits:64});
/** Cria par literal independente para os oráculos matemáticos. */
const r=(numerator:string,denominator='1'):ExactRational=>Object.freeze({numerator,denominator});
/** Exige resposta matemática disponível; indisponibilidade não pode satisfazer oráculo de sucesso. */
function value(operation:ExactProductOperation,a:ExactRational,b:ExactRational,limits:ExactLimits=budget):ExactRational {
  const result=calculateExactProduct(operation,a,b,limits);
  if(result.status!=='ready') throw Error(JSON.stringify(result));
  expect(Object.isFrozen(result)).toBe(true);expect(Object.isFrozen(result.value)).toBe(true);
  return result.value;
}
describe('Produtos e razões exatos,sem arredondamento intermediário',()=>{
  it('multiplica com redução,sinal e valores acima de2^53 sem Number',()=>{
    expect(value('multiply',r('1','2'),r('3','4'))).toEqual(r('3','8'));
    expect(value('multiply',r('-1','2'),r('3','4'))).toEqual(r('-3','8'));
    expect(value('multiply',r('9007199254740993'),r('1','100'))).toEqual(r('9007199254740993','100'));
    expect(value('multiply',r('2','4'),r('1'))).toEqual(r('1','2'));
  });
  it('divide exatamente e normaliza sinais no numerador',()=>{
    expect(value('divide',r('1','7'),r('3','11'))).toEqual(r('11','21'));
    expect(value('divide',r('-6','5'),r('9','10'))).toEqual(r('-4','3'));
    expect(value('divide',r('-1','2'),r('-7','6'))).toEqual(r('3','7'));
  });
  it('distingue divisorzero,zero válido e representação inválida',()=>{
    expect(calculateExactProduct('divide',r('1'),r('0'),budget)).toMatchObject({status:'unavailable',code:'division-by-zero'});
    expect(value('multiply',r('0'),r('-2'))).toEqual(r('0'));
    expect(value('divide',r('0'),r('2'))).toEqual(r('0'));
    expect(calculateExactProduct('multiply',r('1','0'),r('1'),budget)).toMatchObject({status:'unavailable',code:'invalid-rational'});
  });
  it('rejeita pares malformados sem coerção ou extração de estado',()=>{
    for(const bad of [null,{numerator:1,denominator:'1'},r('1e3'),r('1/2'),r('01'),r('1','-2'),{status:'ready',value:r('1')}])
      expect(calculateExactProduct('multiply',bad as unknown as ExactRational,r('1'),budget)).toMatchObject({status:'unavailable',code:'invalid-rational'});
  });
  it('reutiliza orçamento compartilhado e rejeita operação desconhecida',()=>{
    expect(calculateExactProduct('multiply',r('1'),r('1'),{maxInputLength:0,maxDigits:64})).toEqual({status:'unavailable',code:'invalid-budget',reason:'Orçamento inválido: maxInputLength não é inteiro positivo seguro.'});
    expect(calculateExactProduct('pow' as unknown as ExactProductOperation,r('1'),r('1'),budget)).toMatchObject({status:'unavailable',code:'invalid-operation'});
  });
  it('guarda materialização sem reprovar produtos que cabem no limite exato',()=>{
    const tiny={maxInputLength:256,maxDigits:1};
    expect(value('multiply',r('1','2'),r('1','2'),tiny)).toEqual(r('1','4'));
    expect(value('multiply',r('9'),r('1'),tiny)).toEqual(r('9'));
    expect(calculateExactProduct('multiply',r('9'),r('9'),tiny)).toMatchObject({status:'unavailable',code:'resource-budget'});
    expect(calculateExactProduct('multiply',r('9','8'),r('8','9'),tiny)).toMatchObject({status:'unavailable',code:'resource-budget'});
    expect(value('multiply',r('9','8'),r('8','9'),{maxInputLength:256,maxDigits:2})).toEqual(r('1'));
    expect(calculateExactProduct('multiply',r('123'),r('1'),{maxInputLength:2,maxDigits:64})).toMatchObject({status:'unavailable',code:'resource-budget'});
  });
  it('preserva JSON,imutabilidade e determinismo das entradas e resultados',()=>{
    const a=r('-2','3'),b=r('3','7'),before=JSON.stringify([a,b,budget]);
    const first=calculateExactProduct('multiply',a,b,budget);
    expect(first).toEqual(calculateExactProduct('multiply',a,b,budget));
    expect(JSON.stringify([a,b,budget])).toBe(before);
    expect(JSON.parse(JSON.stringify(first))).toEqual({status:'ready',value:r('-2','7')});
    expect(Object.isFrozen(first)).toBe(true);
    const fail=calculateExactProduct('divide',a,r('0'),budget);expect(Object.isFrozen(fail)).toBe(true);
  });
  it('encadeia razões recorrentes e o calendário4×30/7 sem arredondar',()=>{
    const numerator=value('multiply',r('4'),r('30'));
    const month=value('divide',numerator,r('7'));
    expect(month).toEqual(r('120','7')); // RCF§7: quatro dias/semana, mês orçamentário de30dias.
    expect(value('multiply',month,r('7'))).toEqual(r('120'));
    expect(value('multiply',r('1','7'),r('7'))).toEqual(r('1'));
  });
});

describe('Precedência de recursos e classificação de exceções',()=>{
  it('limita strings malformadas antes de regex e BigInt',()=>{
    const spy=vi.spyOn(globalThis,'BigInt');
    try {
      for(const pair of [r('x'.repeat(257)),r('1','x'.repeat(257))])
        expect(calculateExactProduct('multiply',pair,r('1'),budget)).toMatchObject({status:'unavailable',code:'resource-budget'});
      expect(spy).not.toHaveBeenCalled();
    } finally { spy.mockRestore(); }
  });
  it('classifica falha de conversão material como indisponibilidade aritmética',()=>{
    const original=globalThis.BigInt;
    const spy=vi.spyOn(globalThis,'BigInt').mockImplementation((input)=>{
      if(input==='7') throw new RangeError('conversion probe');
      return original(input);
    });
    try {
      expect(calculateExactProduct('multiply',r('7'),r('1'),budget)).toMatchObject({status:'unavailable',code:'arithmetic-failure'});
    } finally { spy.mockRestore(); }
  });
  it('captura falha ao construir sentinela técnica sem propagar exceção',()=>{
    const original=globalThis.BigInt;
    const spy=vi.spyOn(globalThis,'BigInt').mockImplementation((input)=>{
      if(input===64) throw new RangeError('cap probe');
      return original(input);
    });
    try {
      expect(calculateExactProduct('multiply',r('1'),r('1'),budget)).toMatchObject({status:'unavailable',code:'arithmetic-failure'});
    } finally { spy.mockRestore(); }
  });
});
