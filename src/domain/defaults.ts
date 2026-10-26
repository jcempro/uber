/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/5/6.1/6.2/7/8/11, FT-003.5/003.7/003.9/003.10.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type { DecimalText, Provenance, CostNature, CostRecognition, Vehicle, FuelConfiguration, NumericParameter } from './model';
import { NUMERIC_RULES } from './validation';
import type { CalendarConfiguration, WorkSchedule, FinancialObjective } from './scenario';
/** Perfis de referência iniciais; não limita cenários personalizados. Copiar para estado editável, preservando IDs. */
export const INITIAL_PROFILE_REFERENCES = Object.freeze([
  Object.freeze({"id":"optimistic","name":"Otimista"} as const),
  Object.freeze({"id":"balanced","name":"Equilibrado"} as const),
  Object.freeze({"id":"pessimistic","name":"Pessimista"} as const)
] as const);
/** Identidade restrita somente ao catálogo inicial, não ao cadastro geral de cenários. */
export type InitialProfileId = (typeof INITIAL_PROFILE_REFERENCES)[number]['id'];
/** Rubrica de reserva por km com textos decimais independentes por perfil; total é sempre derivado. */
export interface MaintenanceRateReference {
  readonly id: string;
  readonly name: string;
  readonly rates: Readonly<Record<InitialProfileId, DecimalText>>;
}
/** Metadados comuns das referências; não transformam estimativa em gasto realizado ou cobertura completa. */
export interface MaintenanceReferenceMetadata {
  readonly unit: 'BRL/km';
  readonly nature: CostNature;
  readonly recognition: CostRecognition;
  readonly provenance: Provenance;
}
/** Provisões estimadas do RCF; nenhuma data/competência de medição foi inventada. */
export const MAINTENANCE_REFERENCE_METADATA: MaintenanceReferenceMetadata = Object.freeze({
  unit: 'BRL/km', nature: 'usage-variable', recognition: 'planned-reserve',
  provenance: Object.freeze({ kind: 'estimate', source: 'RCF.md §6.2', date: null, competence: null, scope: Object.freeze({kind:'global'} as const), reliability: 'estimated' } as const)
});
/** Sete rubricas individuais/21 valores canônicos. Reserva não é pagamento; não exportar total como entrada adicional. */
export const MAINTENANCE_RATE_REFERENCES: readonly MaintenanceRateReference[] = Object.freeze([
  Object.freeze({ id: "oil-service", name: "Óleo, filtros, revisões, inspeções", rates: Object.freeze({"optimistic":"0.075","balanced":"0.095","pessimistic":"0.120"}) }),
  Object.freeze({ id: "tires-alignment", name: "Pneus, alinhamento e balanceamento", rates: Object.freeze({"optimistic":"0.035","balanced":"0.048","pessimistic":"0.065"}) }),
  Object.freeze({ id: "brakes-fluids", name: "Freios, discos/lonas e fluidos", rates: Object.freeze({"optimistic":"0.014","balanced":"0.025","pessimistic":"0.040"}) }),
  Object.freeze({ id: "suspension-steering", name: "Suspensão, direção e associados", rates: Object.freeze({"optimistic":"0.020","balanced":"0.040","pessimistic":"0.070"}) }),
  Object.freeze({ id: "cvt-preventive", name: "CVT preventivo", rates: Object.freeze({"optimistic":"0.012","balanced":"0.020","pessimistic":"0.030"}) }),
  Object.freeze({ id: "battery-consumables", name: "Bateria, velas, correias, consumíveis", rates: Object.freeze({"optimistic":"0.014","balanced":"0.022","pessimistic":"0.035"}) }),
  Object.freeze({ id: "routine-repairs", name: "Reparos corretivos usuais provisionados", rates: Object.freeze({"optimistic":"0.025","balanced":"0.045","pessimistic":"0.080"}) })
]);

/** Veículo informado único; cadastro ativo não confirma elegibilidade Uber. Referência para futuro estado editável. */
export const INITIAL_VEHICLES: readonly Vehicle[] = Object.freeze([
  Object.freeze({
    "id": "vehicle-yaris-2019",
    "name": "Toyota Yaris XL Sedan 1.5 Flex CVT 2019/2019",
    "enabled": true,
    "manufactureYear": 2019,
    "modelYear": 2019,
    "fuelConfigurationIds": Object.freeze([
      "fuel-yaris-operational-ethanol"
    ] as const),
    "defaultFuelConfigurationId": "fuel-yaris-operational-ethanol",
    "provenance": Object.freeze({
      "kind": "reported-personal",
      "source": "RCF.md §5",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "vehicle",
        "vehicleId": "vehicle-yaris-2019"
      } as const),
      "reliability": "reported"
    } as const)
  } as const)
] as const);
/** Etanol operacional sem ciclo de ensaio presumido; outros modos serão cadastrados sem duplicar o veículo. */
export const INITIAL_FUEL_CONFIGURATIONS: readonly FuelConfiguration[] = Object.freeze([
  Object.freeze({
    "id": "fuel-yaris-operational-ethanol",
    "vehicleId": "vehicle-yaris-2019",
    "name": "Etanol operacional informado",
    "enabled": true,
    "cycle": "unspecified",
    "pricePerLitreParameterId": "yaris-ethanol-price-litre",
    "efficiencyKmPerLitreParameterId": "yaris-ethanol-efficiency-km-litre",
    "usableLitresParameterId": "yaris-usable-litres",
    "provenance": Object.freeze({
      "kind": "reported-personal",
      "source": "RCF.md §5",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "vehicle",
        "vehicleId": "vehicle-yaris-2019"
      } as const),
      "reliability": "reported"
    } as const),
    "kind": "ethanol"
  } as const)
] as const);
/** Consumo informado6.8; preço/volume não informados não viram zero. Volume só condiciona os resultados que dele dependem. */
export const INITIAL_VEHICLE_PARAMETERS: readonly NumericParameter[] = Object.freeze([
  Object.freeze({
    "id": "yaris-ethanol-price-litre",
    "name": "Preço atual do etanol (Yaris)",
    "unit": "BRL/L",
    "category": "fuel-price",
    "input": Object.freeze({
      "status": "not-provided",
      "reason": "Preço atual do etanol ainda não informado."
    } as const),
    "provenance": Object.freeze({
      "kind": "gap",
      "source": "RCF.md §§5/6.1 — dado operacional pendente",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "vehicle",
        "vehicleId": "vehicle-yaris-2019"
      } as const),
      "reliability": "unverified"
    } as const),
    "required": true,
    "constraints": NUMERIC_RULES.positive,
    "dependencies": Object.freeze([] as const)
  } as const),
  Object.freeze({
    "id": "yaris-ethanol-efficiency-km-litre",
    "name": "Eficiência operacional do etanol (Yaris)",
    "unit": "km/L",
    "category": "fuel-efficiency",
    "input": Object.freeze({
      "status": "provided",
      "value": "6.8"
    } as const),
    "provenance": Object.freeze({
      "kind": "reported-personal",
      "source": "RCF.md §5",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "vehicle",
        "vehicleId": "vehicle-yaris-2019"
      } as const),
      "reliability": "reported"
    } as const),
    "required": true,
    "constraints": NUMERIC_RULES.positive,
    "dependencies": Object.freeze([] as const)
  } as const),
  Object.freeze({
    "id": "yaris-usable-litres",
    "name": "Volume utilizável atual (Yaris)",
    "unit": "L",
    "category": "vehicle-volume",
    "input": Object.freeze({
      "status": "not-provided",
      "reason": "Volume de combustível efetivamente utilizável ainda não informado."
    } as const),
    "provenance": Object.freeze({
      "kind": "gap",
      "source": "RCF.md §§5/6.1 — dado operacional pendente",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "vehicle",
        "vehicleId": "vehicle-yaris-2019"
      } as const),
      "reliability": "unverified"
    } as const),
    "required": false,
    "constraints": NUMERIC_RULES.nonNegative,
    "dependencies": Object.freeze([] as const)
  } as const)
] as const);

/** Orçamento por premissas do RCF; dias perdidos desconhecidos não são implicitamente zero. */
export const INITIAL_CALENDARS: readonly CalendarConfiguration[] = Object.freeze([
  Object.freeze({
    "id": "calendar-budget",
    "name": "Orçamento programado",
    "provenance": Object.freeze({
      "kind": "current-decision",
      "source": "RCF.md §§5/7 — regra de simulação adotada",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "global"
      } as const),
      "reliability": "confirmed"
    } as const),
    "kind": "budget",
    "daysPerWeekParameterId": "time-workdays-week",
    "daysPerMonthParameterId": "time-days-month",
    "monthsPerYearParameterId": "time-months-year",
    "lostDaysParameterId": "time-lost-days"
  } as const)
] as const);
/** Jornadas comparáveis; só3h possuem faixa horária fornecida. Copiar para o estado editável. */
export const INITIAL_WORK_SCHEDULES: readonly WorkSchedule[] = Object.freeze([
  Object.freeze({
    "id": "schedule-short",
    "name": "Jornada curta",
    "durationHoursParameterId": "time-hours-short",
    "startTime": "16:30",
    "endTime": "19:30",
    "provenance": Object.freeze({
      "kind": "current-decision",
      "source": "RCF.md §§5/7 — regra de simulação adotada",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "global"
      } as const),
      "reliability": "confirmed"
    } as const)
  } as const),
  Object.freeze({
    "id": "schedule-medium",
    "name": "Jornada intermediária",
    "durationHoursParameterId": "time-hours-medium",
    "startTime": null,
    "endTime": null,
    "provenance": Object.freeze({
      "kind": "current-decision",
      "source": "RCF.md §§5/7 — regra de simulação adotada",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "global"
      } as const),
      "reliability": "confirmed"
    } as const)
  } as const),
  Object.freeze({
    "id": "schedule-long",
    "name": "Jornada longa",
    "durationHoursParameterId": "time-hours-long",
    "startTime": null,
    "endTime": null,
    "provenance": Object.freeze({
      "kind": "current-decision",
      "source": "RCF.md §§5/7 — regra de simulação adotada",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "global"
      } as const),
      "reliability": "confirmed"
    } as const)
  } as const)
] as const);
/** Regras iniciais de simulação, não presença comprovada; horas no dia orçamentário limitadas dimensionalmente a24. */
export const INITIAL_TIME_PARAMETERS: readonly NumericParameter[] = Object.freeze([
  Object.freeze({
    "id": "time-workdays-week",
    "name": "Dias de trabalho programados por semana",
    "unit": "working-day/week",
    "category": "calendar",
    "input": Object.freeze({
      "status": "provided",
      "value": "4"
    } as const),
    "provenance": Object.freeze({
      "kind": "current-decision",
      "source": "RCF.md §§5/7 — regra de simulação adotada",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "global"
      } as const),
      "reliability": "confirmed"
    } as const),
    "required": true,
    "constraints": Object.freeze({...NUMERIC_RULES.nonNegative, maximum:"7"}),
    "dependencies": Object.freeze([] as const)
  } as const),
  Object.freeze({
    "id": "time-days-month",
    "name": "Dias do mês orçamentário",
    "unit": "day/month",
    "category": "calendar",
    "input": Object.freeze({
      "status": "provided",
      "value": "30"
    } as const),
    "provenance": Object.freeze({
      "kind": "current-decision",
      "source": "RCF.md §§5/7 — regra de simulação adotada",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "global"
      } as const),
      "reliability": "confirmed"
    } as const),
    "required": true,
    "constraints": NUMERIC_RULES.positive,
    "dependencies": Object.freeze([] as const)
  } as const),
  Object.freeze({
    "id": "time-months-year",
    "name": "Meses do ano orçamentário",
    "unit": "month/year",
    "category": "calendar",
    "input": Object.freeze({
      "status": "provided",
      "value": "12"
    } as const),
    "provenance": Object.freeze({
      "kind": "current-decision",
      "source": "RCF.md §§5/7 — regra de simulação adotada",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "global"
      } as const),
      "reliability": "confirmed"
    } as const),
    "required": true,
    "constraints": NUMERIC_RULES.positive,
    "dependencies": Object.freeze([] as const)
  } as const),
  Object.freeze({
    "id": "time-lost-days",
    "name": "Dias de trabalho perdidos no período",
    "unit": "working-day",
    "category": "calendar",
    "input": Object.freeze({
      "status": "not-provided",
      "reason": "Dias efetivamente perdidos ainda não informados."
    } as const),
    "provenance": Object.freeze({
      "kind": "gap",
      "source": "RCF.md §7 — dias perdidos ainda não informados",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "global"
      } as const),
      "reliability": "unverified"
    } as const),
    "required": true,
    "constraints": NUMERIC_RULES.nonNegative,
    "dependencies": Object.freeze([
      "time-workdays-week",
      "time-days-month"
    ] as const)
  } as const),
  Object.freeze({
    "id": "time-hours-short",
    "name": "Duração diária: jornada curta",
    "unit": "h",
    "category": "schedule",
    "input": Object.freeze({
      "status": "provided",
      "value": "3"
    } as const),
    "provenance": Object.freeze({
      "kind": "current-decision",
      "source": "RCF.md §§5/7 — regra de simulação adotada",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "global"
      } as const),
      "reliability": "confirmed"
    } as const),
    "required": true,
    "constraints": Object.freeze({...NUMERIC_RULES.positive, maximum:"24"}),
    "dependencies": Object.freeze([] as const)
  } as const),
  Object.freeze({
    "id": "time-hours-medium",
    "name": "Duração diária: jornada intermediária",
    "unit": "h",
    "category": "schedule",
    "input": Object.freeze({
      "status": "provided",
      "value": "6"
    } as const),
    "provenance": Object.freeze({
      "kind": "current-decision",
      "source": "RCF.md §§5/7 — regra de simulação adotada",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "global"
      } as const),
      "reliability": "confirmed"
    } as const),
    "required": true,
    "constraints": Object.freeze({...NUMERIC_RULES.positive, maximum:"24"}),
    "dependencies": Object.freeze([] as const)
  } as const),
  Object.freeze({
    "id": "time-hours-long",
    "name": "Duração diária: jornada longa",
    "unit": "h",
    "category": "schedule",
    "input": Object.freeze({
      "status": "provided",
      "value": "8"
    } as const),
    "provenance": Object.freeze({
      "kind": "current-decision",
      "source": "RCF.md §§5/7 — regra de simulação adotada",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "global"
      } as const),
      "reliability": "confirmed"
    } as const),
    "required": true,
    "constraints": Object.freeze({...NUMERIC_RULES.positive, maximum:"24"}),
    "dependencies": Object.freeze([] as const)
  } as const)
] as const);

/** Metas de lucro por fração salarial, sem armazenar alvo monetário derivado ou usar volume de viagens. */
export const INITIAL_FINANCIAL_OBJECTIVES: readonly FinancialObjective[] = Object.freeze([
  Object.freeze({
    "id": "objective-partial-salary",
    "name": "Meta complementar",
    "definition": Object.freeze({
      "kind": "salary-fraction",
      "salaryParameterId": "finance-salary-reference",
      "fractionParameterId": "finance-goal-partial"
    } as const),
    "provenance": Object.freeze({
      "kind": "current-decision",
      "source": "RCF.md §§5/8 — regra financeira definida",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "global"
      } as const),
      "reliability": "confirmed"
    } as const)
  } as const),
  Object.freeze({
    "id": "objective-full-salary",
    "name": "Meta salarial",
    "definition": Object.freeze({
      "kind": "salary-fraction",
      "salaryParameterId": "finance-salary-reference",
      "fractionParameterId": "finance-goal-full"
    } as const),
    "provenance": Object.freeze({
      "kind": "current-decision",
      "source": "RCF.md §§5/8 — regra financeira definida",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "global"
      } as const),
      "reliability": "confirmed"
    } as const)
  } as const)
] as const);
/** Referência salarial datada2026, decisões de meta/dízimo e lacuna Lmin. Revalidar salário por competência; não implica viabilidade. */
export const INITIAL_FINANCIAL_PARAMETERS: readonly NumericParameter[] = Object.freeze([
  Object.freeze({
    "id": "finance-salary-reference",
    "name": "Salário mínimo mensal de referência (2026)",
    "unit": "BRL/month",
    "category": "salary-reference",
    "input": Object.freeze({
      "status": "provided",
      "value": "1621.00"
    } as const),
    "provenance": Object.freeze({
      "kind": "dated-official-fact",
      "source": "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/decreto/d12797.htm",
      "date": "2025-12-23",
      "competence": "2026",
      "scope": Object.freeze({
        "kind": "global"
      } as const),
      "reliability": "confirmed"
    } as const),
    "required": true,
    "constraints": NUMERIC_RULES.positive,
    "dependencies": Object.freeze([] as const)
  } as const),
  Object.freeze({
    "id": "finance-goal-partial",
    "name": "Fração salarial da meta complementar",
    "unit": "ratio",
    "category": "profit-goal",
    "input": Object.freeze({
      "status": "provided",
      "value": "0.15"
    } as const),
    "provenance": Object.freeze({
      "kind": "current-decision",
      "source": "RCF.md §§5/8 — regra financeira definida",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "global"
      } as const),
      "reliability": "confirmed"
    } as const),
    "required": true,
    "constraints": NUMERIC_RULES.nonNegative,
    "dependencies": Object.freeze([] as const)
  } as const),
  Object.freeze({
    "id": "finance-goal-full",
    "name": "Fração salarial da meta salarial",
    "unit": "ratio",
    "category": "profit-goal",
    "input": Object.freeze({
      "status": "provided",
      "value": "1"
    } as const),
    "provenance": Object.freeze({
      "kind": "current-decision",
      "source": "RCF.md §§5/8 — regra financeira definida",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "global"
      } as const),
      "reliability": "confirmed"
    } as const),
    "required": true,
    "constraints": NUMERIC_RULES.nonNegative,
    "dependencies": Object.freeze([] as const)
  } as const),
  Object.freeze({
    "id": "finance-tithe-rate",
    "name": "Dízimo sobre receita creditada, antes dos custos",
    "unit": "ratio",
    "category": "tithe-credit-rate",
    "input": Object.freeze({
      "status": "provided",
      "value": "0.1"
    } as const),
    "provenance": Object.freeze({
      "kind": "current-decision",
      "source": "RCF.md §§5/8 — regra financeira definida",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "global"
      } as const),
      "reliability": "confirmed"
    } as const),
    "required": true,
    "constraints": NUMERIC_RULES.fraction,
    "dependencies": Object.freeze([] as const)
  } as const),
  Object.freeze({
    "id": "finance-minimum-operation-profit",
    "name": "Lucro mínimo absoluto da operação",
    "unit": "BRL/month",
    "category": "operation-profit-floor",
    "input": Object.freeze({
      "status": "not-provided",
      "reason": "Lucro mínimo absoluto da operação ainda não informado."
    } as const),
    "provenance": Object.freeze({
      "kind": "gap",
      "source": "RCF.md §8 — lucro mínimo absoluto da operação ainda não informado",
      "date": null,
      "competence": null,
      "scope": Object.freeze({
        "kind": "global"
      } as const),
      "reliability": "unverified"
    } as const),
    "required": true,
    "constraints": NUMERIC_RULES.nonNegative,
    "dependencies": Object.freeze([] as const)
  } as const)
] as const);
