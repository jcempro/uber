/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/7, FT-003.13a.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type { OperationalScenario, EvaluationContext } from './scenario';
import { INITIAL_PROFILE_REFERENCES, INITIAL_VEHICLES, INITIAL_CALENDARS, INITIAL_WORK_SCHEDULES, INITIAL_FINANCIAL_OBJECTIVES } from './defaults';
import { createEvaluationContexts } from './contexts';

/** Cadastros iniciais imutáveis; proveniência confirma a decisão de cadastro, sem comprovar operação ou lucro. */
export const INITIAL_SCENARIOS: readonly OperationalScenario[] = Object.freeze(
  INITIAL_PROFILE_REFERENCES.map((profile): OperationalScenario => {
    const id = 'scenario-' + profile.id;
    return Object.freeze({
      id,
      name: profile.name,
      enabled: true,
      referenceProfileId: profile.id,
      vehicleId: INITIAL_VEHICLES[0].id,
      fuelConfigurationId: INITIAL_VEHICLES[0].defaultFuelConfigurationId,
      calendarId: INITIAL_CALENDARS[0].id,
      // Ausência de itens/overrides instalados não significa custo zero ou cobertura completa.
      parameterIds: Object.freeze([]),
      costItemIds: Object.freeze([]),
      provenance: Object.freeze({
        kind: 'current-decision' as const,
        source: 'RCF§§4/7',
        date: null,
        competence: null,
        scope: Object.freeze({ kind: 'scenario' as const, scenarioId: id }),
        reliability: 'confirmed' as const,
      }),
    });
  }),
);

/** Identidades de contexto geradas dos cadastros iniciais; nenhum resultado financeiro é materializado aqui. */
export const INITIAL_EVALUATION_CONTEXTS: readonly EvaluationContext[] = createEvaluationContexts(
  INITIAL_SCENARIOS,
  INITIAL_WORK_SCHEDULES,
  INITIAL_FINANCIAL_OBJECTIVES,
);
