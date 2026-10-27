/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§1/4, FT-003.37a.1.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { check, literal, pipe, strictObject, string, variant, type GenericSchema } from 'valibot';
import type { ParameterScope } from './model';

/** Exige identificador textual não branco sem transformar seu conteúdo literal. */
const scopeIdSchema = pipe(string(), check((value: string) => value.trim().length > 0, 'Informe um identificador não vazio.'));

/**
 * Valida exclusivamente a estrutura dos três escopos canônicos; recusa campos extras.
 * Preserva IDs literais e não comprova existência de referência, precedência ou aplicabilidade.
 * Usar safeParse para obter saída validada ou issues localizadas; não modifica a entrada.
 */
export const PARAMETER_SCOPE_STRUCTURE_SCHEMA: GenericSchema<ParameterScope> = variant('kind', [
  strictObject({ kind: literal('global') }),
  strictObject({ kind: literal('vehicle'), vehicleId: scopeIdSchema }),
  strictObject({ kind: literal('scenario'), scenarioId: scopeIdSchema }),
]);
