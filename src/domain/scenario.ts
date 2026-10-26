/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/5/7/8, FT-003.8a/003.8b/003.8c, autoria JeanCarloEM <jeancarlo@jeancarloem.com>.
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
/**
 * Jornada de trabalho: horários em texto bruto, duração referenciada ao parâmetro.
 * - `startTime`/`endTime`: texto bruto; null representa horário ainda não informado/definido, sem inventar faixa horária.
 * - `durationHoursParameterId`: referência única ao parâmetro de duração.
 */
export type WorkSchedule = {
  readonly id: string;
  readonly name: string;
  readonly durationHoursParameterId: string;
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly provenance: Provenance;
};

/**
 * Objetivo financeiro: definição direta por fração salarial ou lucro líquido absoluto.
 * - Salário/fração e valor absoluto têm SSOT nos parâmetros referenciados; não armazenar alvo derivado duplicado.
 * - Não há definição por receita bruta ou quantidade de viagens.
 */
export type FinancialObjective = {
  readonly id: string;
  readonly name: string;
  readonly definition:
    /** Alvo de lucro derivado de salário e fração independentes, sujeitos à validação das premissas. */
    | { readonly kind: 'salary-fraction'; readonly salaryParameterId: string; readonly fractionParameterId: string }
    /** Lucro líquido absoluto referenciado; não representa faturamento ou volume operacional. */
    | { readonly kind: 'absolute-net-profit'; readonly amountParameterId: string };
  readonly provenance: Provenance;
};

/**
 * Cenário operacional: configuração de veículos, combustível, calendário, perfis e parâmetros para simulação.
 * - Referências a IDs de veículos, parâmetros e itens de custo exigem validação em runtime; tipagem não certifica integridade.
 * - `referenceProfileId` aceita null sem impor um perfil; listas de parâmetros/custos guardam referências, não cópias de valores.
 */
export type OperationalScenario = {
  readonly id: string;
  readonly name: string;
  readonly enabled: boolean;
  readonly vehicleId: string;
  readonly fuelConfigurationId: string;
  readonly calendarId: string;
  readonly referenceProfileId: string | null;
  readonly parameterIds: readonly string[];
  readonly costItemIds: readonly string[];
  readonly provenance: Provenance;
};

/**
 * Contexto de avaliação: identificação de entrada para execução de cenário × jornada × objetivo.
 * - Não inclui resultado, versionamento ou proveniência das premissas; esses serão contratos distintos.
 * - `scheduleId` e `objectiveId` referenciam jornada e objetivo associados ao cenário.
 */
export type EvaluationContext = {
  readonly id: string;
  readonly scenarioId: string;
  readonly scheduleId: string;
  readonly objectiveId: string;
};
