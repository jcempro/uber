/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/5/7, FT-003.8a, autoria JeanCarloEM <jeancarlo@jeancarloem.com>.
 */

import type { Provenance } from './model';

/** Dia da semana conforme ISO 8601: segunda=1, domingo=7. */
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Configuração de calendário: base comum e ramo específico (orçamentário ou data fixa).
 * - `budget`: parâmetros para cálculo de dias por semana/mês/ano e dias perdidos.
 * - `dated`: intervalo fixo com dias úteis e datas excluídas.
 */
export type CalendarConfiguration =
  /** Orçamento por parâmetros; não escolhe datas/dias da semana nem presume dias perdidos zero. */
  | {
      readonly id: string;
      readonly name: string;
      readonly provenance: Provenance;
      readonly kind: 'budget';
      readonly daysPerWeekParameterId: string;
      readonly daysPerMonthParameterId: string;
      readonly monthsPerYearParameterId: string;
      readonly lostDaysParameterId: string;
    }
  /** Calendário civil explicitamente configurado; datas e exclusões exigem validação posterior. */
  | {
      readonly id: string;
      readonly name: string;
      readonly provenance: Provenance;
      readonly kind: 'dated';
      readonly startDate: string;
      readonly endDate: string;
      readonly workingWeekdays: readonly IsoWeekday[];
      readonly excludedDates: readonly string[];
    };
