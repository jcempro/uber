/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.1, FT-003.18.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { describe, expect, it } from 'vitest';
import Decimal from 'decimal.js';
import { parseExactDecimal } from './exact';
import type { ExactLimits } from './exact';
import { NUMERIC_RULES, validateDecimalText } from './validation';

const budget = Object.freeze({maxInputLength:256,maxDigits:128});

describe('Ponte exata sem alterar validade financeira por limite técnico', () => {
  it('preserva decimais exatos e valores acima da precisão binária de Number', () => {
    for (const [input,numerator,denominator] of [['0.1','1','10'],['9007199254740993.01','900719925474099301','100'],['0.33333','33333','100000']]) {
      expect(parseExactDecimal(input,NUMERIC_RULES.nonNegative,budget)).toEqual({status:'ready',value:{numerator,denominator}});
    }
  });
  it('mantém notação científica e formas decimais válidas pelo catálogo', () => {
    for (const [input,numerator,denominator] of [['1.25e-3','1','800'],['+1E3','1000','1'],['.5','1','2']])
      expect(parseExactDecimal(input,NUMERIC_RULES.nonNegative,budget)).toEqual({status:'ready',value:{numerator,denominator}});
  });
  it('preserva os diagnósticos comuns e não aceita sintaxe adicional da biblioteca', () => {
    for (const input of [null,'',' ','1/2','0.(3)','-1','0x10','1,23','Infinity']) {
      const expected = validateDecimalText(input,NUMERIC_RULES.nonNegative);
      expect(expected.valid).toBe(false);
      expect(parseExactDecimal(input,NUMERIC_RULES.nonNegative,budget)).toEqual({status:'invalid',validation:expected});
    }
    const expected = validateDecimalText('2',NUMERIC_RULES.fraction);
    expect(parseExactDecimal('2',NUMERIC_RULES.fraction,budget)).toEqual({status:'invalid',validation:expected});
  });
  it('distingue zero numérico de ausência ou estado não numérico sem extração silenciosa', () => {
    for (const input of ['0','-0']) expect(parseExactDecimal(input,NUMERIC_RULES.nonNegative,budget)).toEqual({status:'ready',value:{numerator:'0',denominator:'1'}});
    const gap = Object.freeze({status:'not-provided',reason:'Ainda não informado'});
    expect(parseExactDecimal(gap,NUMERIC_RULES.nonNegative,budget).status).toBe('invalid');
    expect(parseExactDecimal(undefined,NUMERIC_RULES.nonNegative,budget).status).toBe('invalid');
    expect(parseExactDecimal('0',NUMERIC_RULES.positive,budget).status).toBe('invalid');
    expect(gap).toEqual({status:'not-provided',reason:'Ainda não informado'});
  });
  it('congela resultados e representa números em JSON apenas por strings', () => {
    const ready = parseExactDecimal('0.1',NUMERIC_RULES.nonNegative,budget);
    expect(ready.status).toBe('ready'); expect(Object.isFrozen(ready)).toBe(true);
    if(ready.status!=='ready') throw Error('Conversão exata ausente');
    expect(Object.isFrozen(ready.value)).toBe(true);
    expect(JSON.parse(JSON.stringify(ready.value))).toEqual({numerator:'1',denominator:'10'});
    const invalid = parseExactDecimal('bad',NUMERIC_RULES.nonNegative,budget);
    if(invalid.status!=='invalid') throw Error('Rejeição ausente');
    expect(Object.isFrozen(invalid)).toBe(true); expect(Object.isFrozen(invalid.validation)).toBe(true);
  });
  it('suspende por orçamento técnico antes de expandir sem reclassificar número válido como inválido', () => {
    for (const input of ['1e1000','1e-1000','0'.repeat(300)+'1']) {
      expect(validateDecimalText(input,NUMERIC_RULES.nonNegative).valid).toBe(true);
      const result = parseExactDecimal(input,NUMERIC_RULES.nonNegative,budget);
      expect(result).toMatchObject({status:'unavailable',code:'resource-budget'});
      expect(Object.isFrozen(result)).toBe(true);
    }
    // O orçamento é de materialização pré-redução: 0.125 precisa formar denominador decimal de4dígitos.
    expect(parseExactDecimal('0.125',NUMERIC_RULES.nonNegative,{maxInputLength:256,maxDigits:3})).toMatchObject({status:'unavailable',code:'resource-budget'});
    expect(parseExactDecimal('0.125',NUMERIC_RULES.nonNegative,{maxInputLength:256,maxDigits:4})).toEqual({status:'ready',value:{numerator:'1',denominator:'8'}});
  });
  it('identifica orçamento inválido como configuração indisponível sem default oculto', () => {
    for (const limits of [null,{maxInputLength:0,maxDigits:128},{maxInputLength:256,maxDigits:0},{maxInputLength:Infinity,maxDigits:128},{maxInputLength:256,maxDigits:1.5}])
      expect(parseExactDecimal('1',NUMERIC_RULES.nonNegative,limits as unknown as ExactLimits)).toMatchObject({status:'unavailable',code:'invalid-budget'});
  });
  it('preserva configuração global e resultados anteriores após indisponibilidade', () => {
    const before = [Decimal.precision,Decimal.rounding,Decimal.minE,Decimal.maxE];
    const first = parseExactDecimal('1.25e-3',NUMERIC_RULES.nonNegative,budget);
    const snapshot = JSON.stringify(first);
    parseExactDecimal('1e1000',NUMERIC_RULES.nonNegative,budget);
    parseExactDecimal('bad',NUMERIC_RULES.nonNegative,budget);
    expect([Decimal.precision,Decimal.rounding,Decimal.minE,Decimal.maxE]).toEqual(before);
    expect(JSON.stringify(first)).toBe(snapshot);
  });
});
