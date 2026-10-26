/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/7, FT-003.12, autoria JeanCarloEM <jeancarlo@jeancarloem.com>.
 */

import type { EvaluationContext, FinancialObjective, OperationalScenario, WorkSchedule } from './scenario';

/**
 * Valida identidade de entrada: string não vazia após trim e unicidade dos IDs brutos dentro do array.
 * Lança Error em pt-BR com dimensão e ID problemático.
 */
function validateIdUniqueness(items: readonly { readonly id: string }[], dimension: string): void {
  const seen = new Set<string>();
  for (const item of items) {
    if (typeof item.id !== 'string' || item.id.trim() === '') {
      throw new Error(`ID inválido na dimensão ${dimension}: esperado texto não vazio.`);
    }
    if (seen.has(item.id)) {
      throw new Error(`ID duplicado na dimensão ${dimension}: "${item.id}".`);
    }
    seen.add(item.id);
  }
}

/**
 * Gera todos os contextos de avaliação a partir do produto cartesiano de cenários habilitados,
 * jornadas e objetivos, na ordem cenário → jornada → objetivo.
 *
 * @param scenarios Cenários operacionais; apenas os com `enabled === true` entram no produto.
 * @param schedules Jornadas de trabalho.
 * @param objectives Metas financeiras.
 * @returns Array de contextos de avaliação congelados; arrays vazios ou nenhum cenário habilitado produzem [].
 * @throws Error se algum ID estiver vazio ou duplicado em qualquer dimensão.
 */
export function createEvaluationContexts(
  scenarios: readonly OperationalScenario[],
  schedules: readonly WorkSchedule[],
  objectives: readonly FinancialObjective[]
): readonly EvaluationContext[] {
  validateIdUniqueness(scenarios, 'cenário');
  validateIdUniqueness(schedules, 'jornada');
  validateIdUniqueness(objectives, 'objetivo');

  const enabledScenarios = scenarios.filter((s) => s.enabled);

  if (enabledScenarios.length === 0 || schedules.length === 0 || objectives.length === 0) {
    const empty: readonly EvaluationContext[] = [];
    Object.freeze(empty);
    return empty;
  }

  const contexts: EvaluationContext[] = [];

  for (const scenario of enabledScenarios) {
    for (const schedule of schedules) {
      for (const objective of objectives) {
        const id = JSON.stringify([scenario.id, schedule.id, objective.id]);
        const context: EvaluationContext = {
          id,
          scenarioId: scenario.id,
          scheduleId: schedule.id,
          objectiveId: objective.id,
        };
        Object.freeze(context);
        contexts.push(context);
      }
    }
  }

  Object.freeze(contexts);
  return contexts;
}
