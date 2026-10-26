/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/7, FT-003.13a/003.15.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type { OperationalScenario, EvaluationContext } from './scenario';
import type { NumericParameter, CostItem } from './model';
import type { CostRequirement } from './cost-requirement';
import { createInitialMaintenanceCatalog } from './maintenance';
import { INITIAL_PROFILE_REFERENCES, INITIAL_VEHICLES, INITIAL_CALENDARS, INITIAL_WORK_SCHEDULES, INITIAL_FINANCIAL_OBJECTIVES } from './defaults';
import { createEvaluationContexts } from './contexts';

/** Instancia um único catálogo por perfil/cenário; jornadas e metas compartilham suas referências imutáveis. */
const initialScenarioData = Object.freeze(
  INITIAL_PROFILE_REFERENCES.map(profile => {
    const id = 'scenario-' + profile.id;
    const catalog = createInitialMaintenanceCatalog(id, profile.id);
    const scenario: OperationalScenario = Object.freeze({
      id,
      name: profile.name,
      enabled: true,
      referenceProfileId: profile.id,
      vehicleId: INITIAL_VEHICLES[0].id,
      fuelConfigurationId: INITIAL_VEHICLES[0].defaultFuelConfigurationId,
      calendarId: INITIAL_CALENDARS[0].id,
      // Só manutenção está cadastrada aqui; não implica cobertura das demais despesas.
      parameterIds: Object.freeze(catalog.parameters.map(p => p.id)),
      costItemIds: Object.freeze(catalog.items.map(item => item.id)),
      provenance: Object.freeze({
        kind: 'current-decision' as const,
        source: 'RCF§§4/7',
        date: null,
        competence: null,
        scope: Object.freeze({ kind: 'scenario' as const, scenarioId: id }),
        reliability: 'confirmed' as const,
      }),
    });
    return Object.freeze({ scenario, catalog });
  }),
);

/** Cadastros imutáveis; proveniência confirma a decisão de cadastro, sem comprovar operação ou lucro. */
export const INITIAL_SCENARIOS: readonly OperationalScenario[] = Object.freeze(initialScenarioData.map(entry => entry.scenario));
/** Parâmetros individuais canônicos por cenário, sem total derivado como entrada adicional. */
export const INITIAL_MAINTENANCE_PARAMETERS: readonly NumericParameter[] = Object.freeze(initialScenarioData.flatMap(entry => entry.catalog.parameters));
/** Provisões estimadas por km; não representam pagamento ou cobertura dos demais custos. */
export const INITIAL_MAINTENANCE_COST_ITEMS: readonly CostItem[] = Object.freeze(initialScenarioData.flatMap(entry => entry.catalog.items));
/** Aplicabilidade declarada das reservas de manutenção; vigência e cobertura global ainda exigem apuração. */
export const INITIAL_MAINTENANCE_REQUIREMENTS: readonly CostRequirement[] = Object.freeze(initialScenarioData.flatMap(entry => entry.catalog.requirements));

/** Identidades de contexto geradas dos cadastros iniciais; nenhum resultado financeiro é materializado aqui. */
export const INITIAL_EVALUATION_CONTEXTS: readonly EvaluationContext[] = createEvaluationContexts(
  INITIAL_SCENARIOS,
  INITIAL_WORK_SCHEDULES,
  INITIAL_FINANCIAL_OBJECTIVES,
);
