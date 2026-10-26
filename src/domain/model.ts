/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§1/4/8, FT-003.1/003.4.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
// Tipos baseados em model-input-rcf.json e model-input-unit.md; sem validação runtime, cálculos ou dependências.

/** Representação decimal JSON como string, sem coerção/arredondamento. Texto bruto exige validação numérica futura. */
export type DecimalText = string;

/** Escopo de parâmetro: global, por veículo ou por cenário. IDs são referências estáveis. */
export type ParameterScope =
  | { readonly kind: 'global' }
  | { readonly kind: 'vehicle'; readonly vehicleId: string }
  | { readonly kind: 'scenario'; readonly scenarioId: string };

/** Tipo de evidência para proveniência. Hipótese ≠ medição. */
export type EvidenceKind =
  | 'current-decision'
  | 'dated-official-fact'
  | 'reported-personal'
  | 'observation'
  | 'measurement'
  | 'estimate'
  | 'illustrative-hypothesis'
  | 'suggestion'
  | 'gap';

/** Proveniência: origem, data/competência, escopo e confiabilidade de uma entrada. */
export interface Provenance {
  readonly kind: EvidenceKind;
  readonly source: string;
  readonly date: string | null;
  readonly competence: string | null;
  readonly scope: ParameterScope;
  readonly reliability: 'confirmed' | 'reported' | 'estimated' | 'conditional' | 'unverified';
}

/** Estado de entrada numérica. Cada ramo exige campos distintos. */
export type NumericInput =
  /** Valor fornecido ainda sujeito à validação de formato, domínio e coerência. */
  | { readonly status: 'provided'; readonly value: DecimalText }
  /** Zero confirmado explicitamente, distinto de ausência e hipótese. */
  | { readonly status: 'confirmed-zero'; readonly value: '0' }
  /** Zero hipotético declarado; não comprova custo quitado ou cobertura. */
  | { readonly status: 'assumed-zero'; readonly value: '0' }
  /** Entrada ausente; não autoriza substituir por zero. */
  | { readonly status: 'absent'; readonly reason: string; readonly value?: never }
  /** Entrada pertinente ainda não informada; dependências permanecem incompletas. */
  | { readonly status: 'not-provided'; readonly reason: string; readonly value?: never }
  /** Inaplicabilidade explícita com fundamento, sem fingir valor numérico. */
  | { readonly status: 'not-applicable'; readonly reason: string; readonly value?: never }
  /** Entrada rejeitada com motivo, sem substituir a última entrada válida. */
  | { readonly status: 'invalid'; readonly reason: string; readonly value?: never };

/** Restrições de valor: intervalo e inclusividade. Não executam validação. */
export interface NumericConstraints {
  readonly minimum: DecimalText | null;
  readonly maximum: DecimalText | null;
  readonly minimumInclusive: boolean;
  readonly maximumInclusive: boolean;
}

/** Parâmetro numérico canônico: identificador, nome, unidade, categoria, entrada, proveniência, obrigatoriedade e restrições. */
export interface NumericParameter {
  readonly id: string;
  readonly name: string;
  readonly unit: string;
  readonly category: string;
  readonly input: NumericInput;
  readonly provenance: Provenance;
  readonly required: boolean;
  readonly constraints: NumericConstraints;
  readonly dependencies: readonly string[];
}

// Contratos adicionais baseados em cost-model-rcf.json/cost-model-unit.md; sem validação runtime ou apuração financeira.
/** Período de competência do custo: dia, semana, mês ou ano. Convenção civil/orçamentária é contextual. */
export type BudgetPeriod = 'day' | 'week' | 'month' | 'year';

/** Natureza do custo: fixo, variável por uso ou extraordinário. Fixo não se torna variável por rateio/km. */
export type CostNature = 'fixed' | 'usage-variable' | 'extraordinary';

/** Base de custo: discrimina como o custo é definido (calendário, uso, único ou customizado). */
export type CostBasis =
  /** Incidência por competência, distinta de quantidade de uso; convenção vem do contexto. */
  | { readonly kind: 'calendar'; readonly period: BudgetPeriod }
  /** Incidência física: dia trabalhado não é dia civil; viagem serve a custo, não a meta financeira. */
  | { readonly kind: 'usage'; readonly unit: 'km' | 'hour' | 'working-day' | 'trip' }
  /** Incidência pontual; não autoriza mensalização automática sem regra de rateio. */
  | { readonly kind: 'one-off' }
  /** Unidade justificada e referência a regra declarativa; não carrega código executável. */
  | { readonly kind: 'custom'; readonly unit: string; readonly ruleId: string; readonly justification: string };

/** Validade do custo: intervalo de vigência. null indica limite não informado, não comprova incidência/vigência. */
export interface CostValidity {
  readonly start: string | null;
  readonly end: string | null;
}

/** Reconhecimento contábil do custo: saída planejada, provisão, pagamento realizado ou reconhecimento econômico. */
export type CostRecognition = 'planned-outflow' | 'planned-reserve' | 'actual-payment' | 'economic-accrual';

/** Item imutável: valor/unidade têm SSOT no parâmetro referenciado; proveniência descreve classificação/incidência.
 * eventId/reconcilesReserveId vinculam fatos e reservas; allocationRuleId exige rateio expresso. IDs/datas ainda requerem validação runtime.
 */
export interface CostItem {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly enabled: boolean;
  readonly nature: CostNature;
  readonly basis: CostBasis;
  readonly amountParameterId: string;
  readonly provenance: Provenance;
  readonly validity: CostValidity;
  readonly recognition: CostRecognition;
  readonly eventId: string | null;
  readonly reconcilesReserveId: string | null;
  readonly allocationRuleId: string | null;
}
