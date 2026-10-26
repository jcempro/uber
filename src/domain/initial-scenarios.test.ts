/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/7 e F01; FT-003.13d.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { INITIAL_WORK_SCHEDULES, INITIAL_FINANCIAL_OBJECTIVES } from './defaults';
import { createEvaluationContexts } from './contexts';
import { INITIAL_SCENARIOS, INITIAL_EVALUATION_CONTEXTS } from './initial-scenarios';

const rcf = readFileSync(new URL('../../RCF.md', import.meta.url), 'utf8');
const normative = rcf.match(/(\d+) perfis × (\d+) jornadas × (\d+) objetivos = (\d+) contextos/);
if (!normative) throw new Error('Matriz normativa ausente');
const [profiles, schedulesCount, goalsCount, total] = normative.slice(1).map(Number);
const schedules = INITIAL_WORK_SCHEDULES;
const goals = INITIAL_FINANCIAL_OBJECTIVES;
const scenarios = INITIAL_SCENARIOS;

// Quatro controles de integração da matriz; vínculos/metadados/congelamento das sementes ainda exigem controles adicionais.
describe('Matriz das sementes reais, sem resultados financeiros', () => {
  it('produz a cardinalidade e seis combinações únicas por perfil exigidas pelo RCF', () => {
    expect(scenarios).toHaveLength(profiles); expect(schedules).toHaveLength(schedulesCount); expect(goals).toHaveLength(goalsCount);
    const result = INITIAL_EVALUATION_CONTEXTS;
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
    expect(result).toEqual(INITIAL_EVALUATION_CONTEXTS);
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
});
