/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§4/model.ParameterScope, FT-003.39.2.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 * Fixtures sintéticas: identidade literal e dependências do contrato canônico.
 */
import { describe, expect, it } from 'vitest';
import type { ParameterScope } from './model';
import { matchParameterScope, type ScopeMatchContext } from './scope-match';

describe('Correspondência de escopo declarado, sem precedência financeira', () => {
  it('global não exige contexto nem prova cobertura financeira', () => {
    expect(matchParameterScope({ kind: 'global' })).toEqual({ status: 'scope-matched',
      scope: { kind: 'global' }, targetId: null, precedence: 'not-evaluated' });
  });
  it('veículo corresponde somente ao ID literal informado', () => {
    expect(matchParameterScope({ kind: 'vehicle', vehicleId: ' v-1 ' }, { vehicleId: ' v-1 ' }))
      .toEqual({ status: 'scope-matched', scope: { kind: 'vehicle', vehicleId: ' v-1 ' },
        targetId: ' v-1 ', precedence: 'not-evaluated' });
  });
  it('cenário corresponde somente ao ID literal informado', () => {
    expect(matchParameterScope({ kind: 'scenario', scenarioId: 'C-1' }, { scenarioId: 'C-1' }))
      .toEqual({ status: 'scope-matched', scope: { kind: 'scenario', scenarioId: 'C-1' },
        targetId: 'C-1', precedence: 'not-evaluated' });
  });
  it('diferenças de espaços e caixa não se tornam correspondência ou custo zero', () => {
    const fixtures: readonly [ParameterScope, ScopeMatchContext][] = [
      [{ kind: 'vehicle', vehicleId: 'v-1' }, { vehicleId: 'V-1' }],
      [{ kind: 'vehicle', vehicleId: ' v-1' }, { vehicleId: 'v-1' }],
      [{ kind: 'scenario', scenarioId: 'C-1' }, { scenarioId: 'c-1' }],
      [{ kind: 'scenario', scenarioId: 'C-1 ' }, { scenarioId: 'C-1' }],
    ];
    for (const [scope, context] of fixtures) {
      const result = matchParameterScope(scope, context);
      expect(result.status).toBe('outside-scope');
      expect(result.precedence).toBe('not-evaluated');
      expect(result).not.toHaveProperty('value');
      expect(result).not.toHaveProperty('financialCoverage');
    }
  });
  it('escopo desconhecido, incompleto ou com extras bloqueia antes do contexto', () => {
    for (const scope of [null, {}, { kind: 'fleet' }, { kind: 'vehicle' },
      { kind: 'scenario', scenarioId: ' ' }, { kind: 'global', vehicleId: 'v-1' }]) {
      const result = matchParameterScope(scope as unknown as ParameterScope);
      expect(result).toMatchObject({ status: 'unavailable', code: 'invalid-scope', field: 'scope',
        precedence: 'not-evaluated' });
      expect(Object.isFrozen(result)).toBe(true);
    }
  });
  it('contexto faltante ou inválido tem diagnóstico explícito para ambos os escopos', () => {
    const fixtures: readonly [ParameterScope, 'vehicleId' | 'scenarioId'][] = [
      [{ kind: 'vehicle', vehicleId: 'v-1' }, 'vehicleId'],
      [{ kind: 'scenario', scenarioId: 'c-1' }, 'scenarioId'],
    ];
    for (const [scope, field] of fixtures) {
      for (const id of [undefined, null, '', ' \t', 12, false]) {
        const result = matchParameterScope(scope, { [field]: id } as ScopeMatchContext);
        expect(result).toMatchObject({ status: 'unavailable',
          code: id === undefined || id === null ? 'missing-context-id' : 'invalid-context-id',
          field, precedence: 'not-evaluated' });
        if (result.status !== 'unavailable') throw Error('Esperado diagnóstico');
        expect(result.reason.length).toBeGreaterThan(0);
        expect(Object.isFrozen(result)).toBe(true);
      }
    }
  });
  it('IDs não pertinentes não criam dependência nem mascaram o campo pertinente', () => {
    expect(matchParameterScope({ kind: 'global' }, { vehicleId: '', scenarioId: null }).status).toBe('scope-matched');
    expect(matchParameterScope({ kind: 'vehicle', vehicleId: 'v' }, { vehicleId: 'v', scenarioId: '' }).status)
      .toBe('scope-matched');
    expect(matchParameterScope({ kind: 'scenario', scenarioId: 'c' }, { scenarioId: 'c', vehicleId: '' }).status)
      .toBe('scope-matched');
    expect(matchParameterScope({ kind: 'vehicle', vehicleId: 'v' }, { scenarioId: 'v' }))
      .toMatchObject({ status: 'unavailable', code: 'missing-context-id', field: 'vehicleId' });
    expect(matchParameterScope({ kind: 'scenario', scenarioId: 'c' }, { vehicleId: 'c' }))
      .toMatchObject({ status: 'unavailable', code: 'missing-context-id', field: 'scenarioId' });
  });
  it('snapshots congelados e repetíveis não congelam ou modificam as entradas', () => {
    const scope: { kind: 'vehicle'; vehicleId: string } = { kind: 'vehicle', vehicleId: 'v' };
    const context = { vehicleId: 'v' };
    const before = JSON.stringify({ scope, context });
    const result = matchParameterScope(scope, context);
    expect(matchParameterScope(scope, context)).toEqual(result);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(scope)).toBe(false);
    expect(Object.isFrozen(context)).toBe(false);
    expect(JSON.stringify({ scope, context })).toBe(before);
    if (result.status === 'unavailable') throw Error('Esperado snapshot');
    expect(result.scope).not.toBe(scope);
    expect(Object.isFrozen(result.scope)).toBe(true);
    scope.vehicleId = 'outro';
    context.vehicleId = 'outro';
    expect(result.scope).toEqual({ kind: 'vehicle', vehicleId: 'v' });
    expect(result.targetId).toBe('v');
  });
});
