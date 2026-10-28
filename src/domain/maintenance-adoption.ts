/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/6.2, FT-003.38b.1c.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { safeParse } from 'valibot';
import type { NumericParameter, CostItem, Provenance } from './model';
import type { CostRequirement } from './cost-requirement';
import { MAINTENANCE_RATE_REFERENCES, type InitialProfileId } from './defaults';
import { createInitialMaintenanceCatalog, type InitialMaintenanceCatalog } from './maintenance';
import { HISTORICAL_MAINTENANCE_ADOPTION_SCHEMA, type HistoricalMaintenanceAdoption } from './maintenance-adoption-schema';

/**
 * Compõe substituições pelas mesmas IDs após declaração explícita; nunca concatena ou altera os seeds.
 * Taxas continuam hipóteses condicionais de provisão, sem vigência, custo real ou cobertura comprovados.
 * @throws Error em pt-BR para declaração, ID, perfil ou vínculo inválido; nenhuma alteração parcial de estado.
 */
export function createAdoptedMaintenanceCatalog(scenarioId: string, profileId: InitialProfileId, adoption: HistoricalMaintenanceAdoption): InitialMaintenanceCatalog {
  const parsed = safeParse(HISTORICAL_MAINTENANCE_ADOPTION_SCHEMA, adoption);
  if (!parsed.success) throw new Error('Adoção inválida: informe declaração explícita e fundamento não vazio.');
  const base = createInitialMaintenanceCatalog(scenarioId, profileId);
  const provenance: Provenance = Object.freeze({
    kind: 'estimate', reliability: 'conditional', date: null, competence: null,
    source: 'RCF.md §6.2 | perfil=' + profileId + ' | Hipótese histórica expressamente adotada: ' + parsed.output.reason,
    scope: Object.freeze({kind:'scenario' as const,scenarioId}),
  });
  const parameters = Object.freeze(base.parameters.map((parameter): NumericParameter => {
    const reference = MAINTENANCE_RATE_REFERENCES.find(row => row.id === parameter.category);
    if (!reference) throw new Error('Rubrica de manutenção sem referência histórica: ' + parameter.category);
    return Object.freeze({...parameter,input:Object.freeze({status:'provided' as const,value:reference.rates[profileId]}),provenance});
  }));
  const items = Object.freeze(base.items.map((item): CostItem => Object.freeze({...item,enabled:true,provenance})));
  const requirements = Object.freeze(base.requirements.map((requirement): CostRequirement => {
    const item = items.find(candidate => candidate.category === requirement.category);
    if (!item) throw new Error('Requisito de manutenção sem item correspondente: ' + requirement.category);
    return Object.freeze({...requirement,status:'applicable' as const,reason:parsed.output.reason,costItemIds:Object.freeze([item.id] as const),provenance});
  }));
  return Object.freeze({parameters,items,requirements});
}
