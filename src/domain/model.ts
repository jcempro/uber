/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§1/4, FT-003.1.
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
