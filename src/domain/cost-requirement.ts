/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8, FT-003.11.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */

import type { Provenance } from './model';

/**
 * Discriminante de aplicabilidade de rubrica de custo.
 * Não comprova custo zero, cobertura, vigência ou atividade de referência.
 */
export type CostRequirement = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly provenance: Provenance;
} & (
  /** Incidência/aplicabilidade ainda não esclarecida. Não custo zero. */
  | {
      readonly status: 'unverified';
      readonly reason: string;
      readonly costItemIds?: never;
    }
  /** Aplicabilidade declarada, com ao menos uma referência obrigatória. */
  | {
      readonly status: 'applicable';
      readonly costItemIds: readonly [string, ...string[]];
      readonly reason?: string;
    }
  /** Inaplicabilidade expressa com fundamento. Sem referências ativas. */
  | {
      readonly status: 'not-applicable';
      readonly reason: string;
      readonly costItemIds?: never;
    }
);
