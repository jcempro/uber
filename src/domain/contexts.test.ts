/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/7 e F01; FT-003.12.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { OperationalScenario } from './scenario';
import { INITIAL_PROFILE_REFERENCES, INITIAL_WORK_SCHEDULES, INITIAL_FINANCIAL_OBJECTIVES, INITIAL_VEHICLES, INITIAL_FUEL_CONFIGURATIONS, INITIAL_CALENDARS } from './defaults';
import { createEvaluationContexts } from './contexts';

const rcf = readFileSync(new URL('../../RCF.md', import.meta.url), 'utf8');
const normative = rcf.match(/(\d+) perfis × (\d+) jornadas × (\d+) objetivos = (\d+) contextos/);
if (!normative) throw new Error('Matriz normativa ausente');
const [profiles, schedulesCount, goalsCount, total] = normative.slice(1).map(Number);
const schedules = INITIAL_WORK_SCHEDULES;
const goals = INITIAL_FINANCIAL_OBJECTIVES;
// Fixtures estruturais: listas vazias de custos NÃO atestam custo zero ou cobertura.
const scenarios: readonly OperationalScenario[] = Object.freeze(INITIAL_PROFILE_REFERENCES.map(p => Object.freeze({
  id: p.id, name: p.name, enabled: true,
  vehicleId: INITIAL_VEHICLES[0].id, fuelConfigurationId: INITIAL_FUEL_CONFIGURATIONS[0].id,
  calendarId: INITIAL_CALENDARS[0].id, referenceProfileId: p.id,
  parameterIds: Object.freeze([]), costItemIds: Object.freeze([]),
  provenance: INITIAL_CALENDARS[0].provenance,
})));

describe('Geração estrutural de contextos, sem prova financeira', () => {
  it('produz a cardinalidade e seis combinações únicas por perfil exigidas pelo RCF', () => {
    expect(scenarios).toHaveLength(profiles); expect(schedules).toHaveLength(schedulesCount); expect(goals).toHaveLength(goalsCount);
    const result = createEvaluationContexts(scenarios, schedules, goals);
    expect(result).toHaveLength(total);
    expect(new Set(result.map(c => c.id)).size).toBe(total);
    for (const scenario of scenarios) {
      const own = result.filter(c => c.scenarioId === scenario.id);
      expect(own).toHaveLength(schedulesCount * goalsCount);
      for (const schedule of schedules) for (const goal of goals)
        expect(own.filter(c => c.scheduleId === schedule.id && c.objectiveId === goal.id)).toHaveLength(1);
    }
  });
  it('preserva ordem, determinismo e imutabilidade sem alterar entradas', () => {
    const before = JSON.stringify([scenarios, schedules, goals]);
    const result = createEvaluationContexts(scenarios, schedules, goals);
    expect(result).toEqual(createEvaluationContexts(scenarios, schedules, goals));
    expect(result[0]).toEqual({ id: JSON.stringify([scenarios[0].id,schedules[0].id,goals[0].id]), scenarioId: scenarios[0].id, scheduleId: schedules[0].id, objectiveId: goals[0].id });
    expect(result[1].objectiveId).toBe(goals[1].id);
    expect(result[goals.length].scheduleId).toBe(schedules[1].id);
    expect(result[schedules.length * goals.length].scenarioId).toBe(scenarios[1].id);
    expect(Object.isFrozen(result)).toBe(true); expect(result.every(Object.isFrozen)).toBe(true);
    expect(JSON.stringify([scenarios, schedules, goals])).toBe(before);
  });
  it('expande cenários personalizados sem eliminar os contextos iniciais', () => {
    const extra = { ...scenarios[0], id: 'custom-profile', referenceProfileId: null };
    const initial = createEvaluationContexts(scenarios, schedules, goals);
    const expanded = createEvaluationContexts([...scenarios, extra], schedules, goals);
    expect(expanded).toHaveLength(total + schedulesCount * goalsCount);
    expect(expanded.slice(0, total)).toEqual(initial);
  });
  it('exclui apenas cenários desabilitados', () => {
    const result = createEvaluationContexts(scenarios.map((s,i) => ({...s, enabled: i !== 1})), schedules, goals);
    expect(result).toHaveLength((profiles - 1) * schedulesCount * goalsCount);
    expect(result.some(c => c.scenarioId === scenarios[1].id)).toBe(false);
  });
  it('retorna coleção congelada vazia quando não há cruzamentos', () => {
    for (const result of [createEvaluationContexts([],schedules,goals), createEvaluationContexts(scenarios,[],goals), createEvaluationContexts(scenarios,schedules,[]), createEvaluationContexts(scenarios.map(s => ({...s,enabled:false})),schedules,goals)]) {
      expect(result).toEqual([]); expect(Object.isFrozen(result)).toBe(true);
    }
  });
  it('rejeita IDs duplicados por dimensão, inclusive cenário desabilitado', () => {
    expect(() => createEvaluationContexts([...scenarios, {...scenarios[0],enabled:false}],schedules,goals)).toThrow();
    expect(() => createEvaluationContexts(scenarios,[...schedules,schedules[0]],goals)).toThrow();
    expect(() => createEvaluationContexts(scenarios,schedules,[...goals,goals[0]])).toThrow();
  });
  it('rejeita IDs vazios por dimensão mesmo quando outro eixo está vazio', () => {
    expect(() => createEvaluationContexts([{...scenarios[0],id:' '}],[],goals)).toThrow();
    expect(() => createEvaluationContexts([], [{...schedules[0],id:''}],goals)).toThrow();
    expect(() => createEvaluationContexts(scenarios,[],[{...goals[0],id:'\t'}])).toThrow();
  });
  it('permite IDs iguais entre dimensões e caracteres especiais sem colisões', () => {
    const result = createEvaluationContexts([{...scenarios[0],id:'a|b'},{...scenarios[0],id:'a'}],[{...schedules[0],id:'c'},{...schedules[0],id:'b|c'}],[{...goals[0],id:'a'}]);
    expect(result).toHaveLength(4); expect(new Set(result.map(c => c.id)).size).toBe(4);
    for (const c of result) expect(c.id).toBe(JSON.stringify([c.scenarioId,c.scheduleId,c.objectiveId]));
  });
  it('retorna só referências de identidade, sem resultados financeiros inventados', () => {
    for (const c of createEvaluationContexts(scenarios,schedules,goals))
      expect(Object.keys(c).sort()).toEqual(['id','objectiveId','scenarioId','scheduleId']);
  });
  it('preserva identidades distintas com espaços, sem normalizar silenciosamente', () => {
    const result = createEvaluationContexts([{...scenarios[0],id:'a'},{...scenarios[0],id:' a'}],[schedules[0]],[goals[0]]);
    expect(result.map(c => c.scenarioId)).toEqual(['a',' a']);
    expect(new Set(result.map(c => c.id)).size).toBe(2);
  });
  it('rejeita IDs não textuais com erro previsto em pt-BR em cada dimensão', () => {
    // Controle de fronteira runtime: conversões restritas à fixture inválida, nunca ao produto.
    const badScenario = {...scenarios[0], id:1} as unknown as OperationalScenario;
    const badSchedule = {...schedules[0], id:null} as unknown as typeof schedules[number];
    const badGoal = {...goals[0], id:undefined} as unknown as typeof goals[number];
    expect(() => createEvaluationContexts([badScenario],schedules,goals)).toThrow(/ID inválido.*cenário/);
    expect(() => createEvaluationContexts(scenarios,[badSchedule],goals)).toThrow(/ID inválido.*jornada/);
    expect(() => createEvaluationContexts(scenarios,schedules,[badGoal])).toThrow(/ID inválido.*objetivo/);
  });
});
