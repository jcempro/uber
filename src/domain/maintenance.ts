/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/6.2/8, FT-003.14b/003.14d.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type { NumericParameter, CostItem } from './model';
import type { CostRequirement } from './cost-requirement';
import type { InitialProfileId } from './defaults';
import { INITIAL_PROFILE_REFERENCES, MAINTENANCE_RATE_REFERENCES, MAINTENANCE_REFERENCE_METADATA } from './defaults';
import { NUMERIC_RULES } from './validation';

/**
 * Materializa parâmetros das referências iniciais; não totaliza custos nem cria pagamentos.
 * @param scenarioId ID bruto não vazio do cenário; não é normalizado.
 * @param profileId Perfil da tabela inicial, sem restringir cadastros personalizados.
 * @returns Sete parâmetros congelados, com estimativa e escopo de cenário preservados.
 * @throws Error em pt-BR para ID vazio/não textual ou perfil desconhecido; sem mutar catálogos.
 */
export function createInitialMaintenanceParameters(scenarioId: string, profileId: InitialProfileId): readonly NumericParameter[] {
  if (typeof scenarioId !== 'string' || scenarioId.trim() === '') throw new Error('scenarioId inválido: esperado texto não vazio.');
  if (!INITIAL_PROFILE_REFERENCES.some(p => p.id === profileId)) throw new Error('profileId inválido: perfil inicial desconhecido.');
  const provenance = Object.freeze({
    ...MAINTENANCE_REFERENCE_METADATA.provenance,
    scope: Object.freeze({ kind: 'scenario' as const, scenarioId }),
  });
  // Reserva estimada por km não é pagamento realizado ou cobertura dos demais custos.
  return Object.freeze(MAINTENANCE_RATE_REFERENCES.map((row): NumericParameter => Object.freeze({
    id: JSON.stringify(['maintenance-rate', scenarioId, row.id]),
    name: row.name,
    unit: MAINTENANCE_REFERENCE_METADATA.unit,
    category: row.id,
    input: Object.freeze({ status: 'provided' as const, value: row.rates[profileId] }),
    provenance,
    required: true,
    constraints: NUMERIC_RULES.nonNegative,
    dependencies: Object.freeze([]),
  })));
}

/** Catálogo inicial de manutenção: parâmetros canônicos e referências de provisão, sem apuração ou cobertura dos demais custos. */
export type InitialMaintenanceCatalog = {
  readonly parameters: readonly NumericParameter[];
  readonly items: readonly CostItem[];
  readonly requirements: readonly CostRequirement[];
};

/**
 * Liga as reservas iniciais aos parâmetros, preservando identidade e proveniência.
 * @param scenarioId ID bruto do cenário, validado pelo gerador de parâmetros.
 * @param profileId Perfil inicial das estimativas, sem restringir cenários personalizados.
 * @returns Catálogo profundamente congelado; aplicabilidade declarada não comprova vigência, valor computado ou cobertura integral.
 * @throws Error em pt-BR para argumentos rejeitados pelo gerador; sem efeitos nos catálogos.
 */
export function createInitialMaintenanceCatalog(scenarioId: string, profileId: InitialProfileId): InitialMaintenanceCatalog {
  const parameters = createInitialMaintenanceParameters(scenarioId, profileId);
  const items = Object.freeze(parameters.map((parameter): CostItem => Object.freeze({
    id: JSON.stringify(['maintenance-reserve', scenarioId, parameter.category]),
    name: parameter.name, category: parameter.category, enabled: true,
    nature: MAINTENANCE_REFERENCE_METADATA.nature,
    basis: Object.freeze({ kind: 'usage' as const, unit: 'km' as const }),
    amountParameterId: parameter.id, provenance: parameter.provenance,
    validity: Object.freeze({ start: null, end: null }),
    recognition: MAINTENANCE_REFERENCE_METADATA.recognition,
    eventId: null, reconcilesReserveId: null, allocationRuleId: null,
  })));
  // Aplicabilidade da provisão estimada não significa pagamento, vigência comprovada ou ausência de outros custos.
  const requirements = Object.freeze(items.map((item): CostRequirement => Object.freeze({
    id: JSON.stringify(['maintenance-requirement', scenarioId, item.category]),
    name: item.name, category: item.category, provenance: item.provenance,
    status: 'applicable' as const, costItemIds: Object.freeze([item.id] as const),
  })));
  return Object.freeze({ parameters, items, requirements });
}
