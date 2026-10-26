/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§2/4, FT-003.3; oráculos numeric-validation-unit.md.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { describe, expect, it } from 'vitest';
import type { NumericConstraints } from './model';
import { NUMERIC_RULES, validateDecimalText } from './validation';
import type { NumericValidationCode } from './validation';

/** Exige falha específica sem substituir entrada inválida por valor conveniente. */
function fails(value: unknown, code: NumericValidationCode, constraints: NumericConstraints = NUMERIC_RULES.nonNegative): void {
  const result = validateDecimalText(value, constraints);
  expect(result.valid).toBe(false);
  expect(result).not.toHaveProperty('value');
  if (!result.valid) { expect(result.code).toBe(code); expect(result.message.trim().length).toBeGreaterThan(0); }
}
/** Exige sucesso preservando texto literal, sem derivar expectativa da implementação. */
function passes(value: string, constraints: NumericConstraints = NUMERIC_RULES.nonNegative): void {
  expect(validateDecimalText(value, constraints)).toEqual({ valid: true, value });
}
describe('validação decimal — oráculos independentes', () => {
  it.each(['0', '-0', '+.5', '1.', '0.295', '9007199254740993', '1e-400'])('preserva %s', value => passes(value));
  it.each([undefined, null, '', '  '])('ausência %s', value => fails(value, 'required'));
  it.each([0, true, {}, []])('tipo %s', value => fails(value, 'type'));
  it.each([' 1','1 ','1,2','0x10','0b1','NaN','Infinity','-Infinity','.','1e','1e9999999999999999','1e-9999999999999999','-1e-9999999999999999'])('inválido/irrepresentável %s', value => fails(value, 'invalid-decimal'));
  it('distingue negativo, positivo e fração', () => {
    fails('-0.01', 'negative'); passes('1e-400', NUMERIC_RULES.positive);
    for (const v of ['0', '-0']) fails(v, 'out-of-range', NUMERIC_RULES.positive);
    for (const v of ['0', '-0', '1', '0.9999999999999999999999999999']) passes(v, NUMERIC_RULES.fraction);
    fails('1.0000000000000000000000000001', 'out-of-range', NUMERIC_RULES.fraction);
  });
  it('compara limites acima da precisão de Number', () => {
    const bounds: NumericConstraints = { minimum:'9007199254740993', maximum:'9007199254740995', minimumInclusive:true, maximumInclusive:true };
    for (const v of ['9007199254740993','9007199254740994','9007199254740995']) passes(v, bounds);
    for (const v of ['9007199254740992','9007199254740996']) fails(v, 'out-of-range', bounds);
    const exclusive = { ...bounds, minimumInclusive:false, maximumInclusive:false };
    passes('9007199254740994', exclusive);
    for (const v of ['9007199254740993','9007199254740995']) fails(v, 'out-of-range', exclusive);
  });
  it('compara vizinhos decimais sem arredondar', () => {
    const bounds: NumericConstraints = { minimum:'0.295', maximum:'0.295', minimumInclusive:true, maximumInclusive:true };
    passes('0.295', bounds);
    for (const v of ['0.2949999999999999999999999999','0.2950000000000000000000000001']) fails(v, 'out-of-range', bounds);
  });
  it.each([
    null, {minimum:undefined}, {minimum:'2',maximum:'1'}, {minimum:'-1'}, {maximum:'-1'}, {minimum:'Infinity'},
    {maximum:'1e9999999999999999'}, {minimum:'1e-9999999999999999'}, {maximum:'x'},
    {minimumInclusive:'true'}, {maximumInclusive:1},
    {minimum:'1',maximum:'1.0',minimumInclusive:false},
    {minimum:'1.0',maximum:'1',maximumInclusive:false},
  ])('valida configuração primeiro %s', patch => {
    // Cast apenas simula dados externos inválidos; não certifica validação runtime.
    const constraints = patch === null ? null : { ...NUMERIC_RULES.nonNegative, ...patch };
    fails(null, 'invalid-constraints', constraints as unknown as NumericConstraints);
  });
  it('congela catálogo e preserva configurações', () => {
    expect(Object.isFrozen(NUMERIC_RULES)).toBe(true);
    for (const rule of Object.values(NUMERIC_RULES)) expect(Object.isFrozen(rule)).toBe(true);
    const before = JSON.stringify(NUMERIC_RULES);
    passes('0.5', NUMERIC_RULES.fraction); fails('2', 'out-of-range', NUMERIC_RULES.fraction);
    expect(JSON.stringify(NUMERIC_RULES)).toBe(before);
  });
});
