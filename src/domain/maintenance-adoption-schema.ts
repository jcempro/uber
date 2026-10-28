/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/6.2, FT-003.38b.1a.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { check, literal, pipe, strictObject, string, type GenericSchema } from 'valibot';
/** Decisão explícita de simular referência histórica; fundamento textual não comprova sua verdade. */
export interface HistoricalMaintenanceAdoption {
  readonly kind: 'adopt-historical-hypothesis';
  readonly reason: string;
}
/** Confere forma e fundamento não vazio, preservando texto; não ativa custo nem prova adoção humana. */
export const HISTORICAL_MAINTENANCE_ADOPTION_SCHEMA: GenericSchema<HistoricalMaintenanceAdoption> = strictObject({
  kind: literal('adopt-historical-hypothesis'),
  reason: pipe(string(), check((value: string) => value.trim().length > 0, 'Informe o fundamento da hipótese histórica.')),
});
