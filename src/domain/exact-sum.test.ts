/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.1/8.2, FT-003.22.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { describe, expect, it, vi } from 'vitest';
import { calculateExactSum } from './exact-sum';
import type { ExactSumOperation } from './exact-sum';
import type { ExactRational, ExactLimits } from './exact';
const budget=Object.freeze({maxInputLength:256,maxDigits:64});
/** Define par literal independente para identidades matemáticas, sem preços/defaults financeiros. */
const r=(numerator:string,denominator='1'):ExactRational=>Object.freeze({numerator,denominator});
/** Exige resultado disponível e imutável; falha não satisfaz oráculo de sucesso. */
function value(op:ExactSumOperation,a:ExactRational,b:ExactRational,limits:ExactLimits=budget):ExactRational {
  const result=calculateExactSum(op,a,b,limits);
  if(result.status!=='ready')throw Error(JSON.stringify(result));
  expect(Object.isFrozen(result)).toBe(true);expect(Object.isFrozen(result.value)).toBe(true);
  return result.value;
}
describe('Soma e subtração racionais exatas',()=>{
  it('soma denominadores distintos,decimais exatos e inteiros acima de2^53',()=>{
    expect(value('add',r('1','2'),r('1','3'))).toEqual(r('5','6'));
    expect(value('add',r('1','10'),r('1','5'))).toEqual(r('3','10'));
    expect(value('add',r('9007199254740993'),r('1'))).toEqual(r('9007199254740994'));
    expect(value('add',r('-3','4'),r('1','2'))).toEqual(r('-1','4'));
  });
  it('subtrai preservando perdas e sinais',()=>{
    expect(value('subtract',r('3','8'),r('1','2'))).toEqual(r('-1','8'));
    expect(value('subtract',r('-1','2'),r('-1','3'))).toEqual(r('-1','6'));
    expect(value('subtract',r('9007199254740993'),r('2'))).toEqual(r('9007199254740991'));
  });
  it('trata zero e pares não reduzidos como valores legítimos',()=>{
    expect(value('add',r('2','4'),r('0'))).toEqual(r('1','2'));
    expect(value('subtract',r('0'),r('0'))).toEqual(r('0'));
    expect(value('add',r('-1','7'),r('1','7'))).toEqual(r('0'));
  });
  it('rejeita representações malformadas em ambos operandos e operação desconhecida',()=>{
    for(const bad of [null,r('01'),r('1','0'),r('1e2'),{status:'ready',value:r('1')}]){
      expect(calculateExactSum('add',bad as unknown as ExactRational,r('1'),budget)).toMatchObject({status:'unavailable',code:'invalid-rational'});
      expect(calculateExactSum('subtract',r('1'),bad as unknown as ExactRational,budget)).toMatchObject({status:'unavailable',code:'invalid-rational'});
    }
    expect(calculateExactSum('multiply' as unknown as ExactSumOperation,r('1'),r('1'),budget)).toMatchObject({status:'unavailable',code:'invalid-operation'});
  });
  it('valida orçamento primeiro e limita comprimento e dígitos sem coerção',()=>{
    expect(calculateExactSum('pow' as unknown as ExactSumOperation,null as unknown as ExactRational,r('1'),{maxInputLength:0,maxDigits:64})).toEqual({status:'unavailable',code:'invalid-budget',reason:'Orçamento inválido: maxInputLength não é inteiro positivo seguro.'});
    expect(calculateExactSum('add',r('x'.repeat(257)),r('1'),budget)).toMatchObject({status:'unavailable',code:'resource-budget'});
    expect(calculateExactSum('add',r('12'),r('1'),{maxInputLength:256,maxDigits:1})).toMatchObject({status:'unavailable',code:'resource-budget'});
  });
  it('guarda carry sem falso insucesso por cancelamento ou denominadores',()=>{
    const tiny={maxInputLength:256,maxDigits:1},two={maxInputLength:256,maxDigits:2};
    expect(value('add',r('8'),r('1'),tiny)).toEqual(r('9'));
    expect(value('subtract',r('9'),r('9'),tiny)).toEqual(r('0'));
    expect(value('add',r('-9'),r('9'),tiny)).toEqual(r('0'));
    expect(value('add',r('1','2'),r('1','2'),tiny)).toEqual(r('1'));
    expect(calculateExactSum('add',r('9'),r('1'),tiny)).toMatchObject({status:'unavailable',code:'resource-budget'});
    expect(calculateExactSum('subtract',r('-9'),r('1'),tiny)).toMatchObject({status:'unavailable',code:'resource-budget'});
    expect(calculateExactSum('subtract',r('9','8'),r('9','8'),tiny)).toMatchObject({status:'unavailable',code:'resource-budget'});
    expect(value('subtract',r('9','8'),r('9','8'),two)).toEqual(r('0'));
    expect(value('add',r('9'),r('1'),two)).toEqual(r('10'));
  });
  it('preserva entradas,JSON e determinismo sem expor Fraction/BigInt',()=>{
    const a=r('-2','3'),b=r('1','7'),before=JSON.stringify([a,b,budget]);
    const result=calculateExactSum('add',a,b,budget);
    expect(result).toEqual(calculateExactSum('add',a,b,budget));
    expect(JSON.stringify([a,b,budget])).toBe(before);
    expect(JSON.parse(JSON.stringify(result))).toEqual({status:'ready',value:r('-11','21')});
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(calculateExactSum('add',r('1','0'),b,budget))).toBe(true);
  });
  it('classifica falhas materiais de conversão e sentinela sem lançar',()=>{
    const original=globalThis.BigInt;
    for(const selected of ['7',64]){
      const spy=vi.spyOn(globalThis,'BigInt').mockImplementation((input)=>{
        if(input===selected)throw new RangeError('resource probe');
        return original(input);
      });
      try {
        expect(calculateExactSum('add',r('7'),r('1'),budget)).toMatchObject({status:'unavailable',code:'arithmetic-failure'});
      } finally {spy.mockRestore();}
    }
  });
  it('encadeia razões recorrentes sem arredondamento intermediário',()=>{
    // RCF§7 mantém calendário orçamentário4×30/7 exato; identidade não prova avaliação financeira.
    const month=r('120','7');
    const sum=value('add',month,month);
    expect(sum).toEqual(r('240','7'));
    expect(value('subtract',sum,month)).toEqual(month);
    expect(value('subtract',month,month)).toEqual(r('0'));
  });
});
