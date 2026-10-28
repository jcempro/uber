/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§1/4, FT-003.37b.1.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 * Listas literais extraídas do modelo canônico pela API AST TypeScript.
 */
import { check, nullable, picklist, pipe, strictObject, string, type GenericSchema } from 'valibot';
import type { Provenance } from './model';
import { PARAMETER_SCOPE_STRUCTURE_SCHEMA } from './parameter-scope-schema';

/** Exige fonte textual não branca, preservando o conteúdo literal informado. */
const provenanceSourceSchema = pipe(string(), check((value: string) => value.trim().length > 0, 'Informe uma fonte não vazia.'));

/**
 * Confere somente os seis campos estruturais canônicos, todos obrigatórios, sem coerção ou defaults.
 * Data e competência são string|null, sem validação semântica; null não equivale a campo omitido.
 * Sucesso estrutural não comprova fonte, datas, confiabilidade, referências, precedência ou cobertura financeira.
 * O escopo é composto do schema comum; issues localizadas não modificam a entrada.
 */
export const PROVENANCE_STRUCTURE_SCHEMA: GenericSchema<Provenance> = strictObject({
  kind: picklist(["current-decision","dated-official-fact","reported-personal","observation","measurement","estimate","illustrative-hypothesis","suggestion","gap"]),
  source: provenanceSourceSchema,
  date: nullable(string()),
  competence: nullable(string()),
  scope: PARAMETER_SCOPE_STRUCTURE_SCHEMA,
  reliability: picklist(["confirmed","reported","estimated","conditional","unverified"]),
});
