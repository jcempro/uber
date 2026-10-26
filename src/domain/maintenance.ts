/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/6.2/8, FT-003.14b.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type { NumericParameter } from './model';
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
