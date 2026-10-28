/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/6.2, FT-003.38b.1a.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { safeParse } from 'valibot';
import { HISTORICAL_MAINTENANCE_ADOPTION_SCHEMA as schema } from './maintenance-adoption-schema';
const canonical = readFileSync(new URL('../../RCF.md', import.meta.url), 'utf8');
const section = canonical.split('### 6.2 Provisões por quilômetro')[1]?.split('## 7. Calendário')[0];
if (!section?.includes('hipótese opcional explicitamente adotada') || !section.includes('fundamento identificados')) throw new Error('Contrato canônico de adoção ausente');
const valid = {kind:'adopt-historical-hypothesis',reason:'  hipótese sintética para teste  '} as const;
describe('Contrato estrutural da adoção explícita histórica', () => {
  it('aceita declaração expressa e preserva fundamento bruto', () => {
    const result = safeParse(schema,valid);
    if (!result.success) throw new Error('Declaração sintética válida recusada');
    expect(result.output).toEqual(valid);
    expect(result.output.reason).toBe('  hipótese sintética para teste  ');
  });
  it('rejeita ausência, primitiva e array sem decisão padrão', () => {
    for (const input of [undefined,null,false,0,'',[],{}]) expect(safeParse(schema,input).success).toBe(false);
  });
  it('exige discriminador literal sem escolha implícita ou trim', () => {
    for (const kind of [undefined,null,false,0,'','estimate','adopt-historical-hypothesis ']) expect(safeParse(schema,{kind,reason:valid.reason}).success).toBe(false);
    expect(safeParse(schema,{reason:valid.reason}).success).toBe(false);
  });
  it('rejeita fundamento ausente, vazio, branco ou não textual', () => {
    for (const reason of [undefined,null,false,0,'',' ',String.fromCharCode(9,10),[],{}]) expect(safeParse(schema,{kind:valid.kind,reason}).success).toBe(false);
    expect(safeParse(schema,{kind:valid.kind}).success).toBe(false);
  });
  it('rejeita extras próprios inclusive constructor e __proto__', () => {
    for (const key of ['extra','constructor','__proto__']) {
      const input: object = JSON.parse(JSON.stringify(valid)) as object;
      Object.defineProperty(input,key,{value:'extra',enumerable:true});
      expect(Object.hasOwn(input,key)).toBe(true);
      expect(safeParse(schema,input).success).toBe(false);
    }
  });
  it('preserva entradas congeladas positivas e negativas em execuções repetidas', () => {
    for (const input of [Object.freeze({...valid}),Object.freeze({...valid,reason:' '})]) {
      const before = JSON.stringify(input), first = safeParse(schema,input);
      expect(first.success).toBe(input.reason !== ' ');
      expect(safeParse(schema,input)).toEqual(first);
      expect(Object.isFrozen(input)).toBe(true);
      expect(JSON.stringify(input)).toBe(before);
    }
  });
});
