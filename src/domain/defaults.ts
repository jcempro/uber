/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/5/6.1/6.2, FT-003.5/003.7.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type { DecimalText, Provenance, CostNature, CostRecognition, Vehicle, FuelConfiguration, NumericParameter } from './model';
import { NUMERIC_RULES } from './validation';
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
