/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/5/6.1, FT-003.7.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { NumericParameter } from './model';
import { INITIAL_VEHICLES, INITIAL_FUEL_CONFIGURATIONS, INITIAL_VEHICLE_PARAMETERS } from './defaults';
import { NUMERIC_RULES, validateDecimalText } from './validation';

const canonical = readFileSync(new URL('../../RCF.md', import.meta.url), 'utf8');
const vehicleRow = canonical.split(/\r?\n/).find(line => /^\|\s*Veículo\s*\|/.test(line));
const consumptionRow = canonical.split(/\r?\n/).find(line => line.includes('Consumo etanol deste Yaris'));
if (!vehicleRow || !consumptionRow) throw new Error('Referência canônica do Yaris ausente');
const vehicleName = vehicleRow.split('|')[2].replaceAll('*','').trim();
const years = vehicleName.match(/(\d{4})\/(\d{4})/);
const consumption = consumptionRow.match(/\*\*(\d+,\d+) km\/L\*\*/)?.[1].replace(',','.');
if (!years || !consumption) throw new Error('Dados obrigatórios do RCF ausentes');
const vehicle = INITIAL_VEHICLES[0], fuel = INITIAL_FUEL_CONFIGURATIONS[0];

/** Obtém parâmetro pela referência; referência quebrada deve falhar, nunca virar zero. */
function parameter(id: string): NumericParameter {
  const result = INITIAL_VEHICLE_PARAMETERS.find(p => p.id === id);
  if (!result) throw new Error('Referência sem parâmetro: '+id);
  return result;
}
/** Confere congelamento recursivo das referências sem executar cálculo financeiro. */
function assertFrozen(value: unknown): void {
  if (value === null || typeof value !== 'object') return;
  expect(Object.isFrozen(value)).toBe(true);
  for (const child of Object.values(value)) assertFrozen(child);
}
describe('Yaris e referência operacional canônica', () => {
  it('cadastra um único veículo com nome e anos da fonte', () => {
    expect(INITIAL_VEHICLES).toHaveLength(1);
    expect(vehicle.id).toBe('vehicle-yaris-2019');
    expect(vehicle.name).toBe(vehicleName);
    expect(vehicle.manufactureYear).toBe(Number(years[1]));
    expect(vehicle.modelYear).toBe(Number(years[2]));
  });
  it('mantém vínculos únicos e não atribui ciclo ensaiado ao operacional', () => {
    expect(INITIAL_FUEL_CONFIGURATIONS).toHaveLength(1);
    expect(fuel.vehicleId).toBe(vehicle.id);
    expect(fuel.kind).toBe('ethanol');
    expect(fuel.cycle).toBe('unspecified');
    expect(vehicle.defaultFuelConfigurationId).toBe(fuel.id);
    expect(vehicle.fuelConfigurationIds).toEqual([fuel.id]);
    expect(INITIAL_VEHICLE_PARAMETERS).toHaveLength(3);
    expect(new Set(INITIAL_VEHICLE_PARAMETERS.map(p=>p.id)).size).toBe(3);
    for (const id of [fuel.pricePerLitreParameterId,fuel.efficiencyKmPerLitreParameterId,fuel.usableLitresParameterId]) expect(parameter(id)).toBeDefined();
  });
  it('preserva consumo obrigatório6.8 como informado, não como ensaio', () => {
    const p = parameter(fuel.efficiencyKmPerLitreParameterId);
    expect(p.input).toEqual({status:'provided',value:consumption});
    expect(p.unit).toBe('km/L');
    expect(p.provenance.kind).toBe('reported-personal');
    expect(p.provenance.reliability).toBe('reported');
  });
  it('preço atual desconhecido não herda referência histórica nem zero', () => {
    const p = parameter(fuel.pricePerLitreParameterId);
    expect(p.unit).toBe('BRL/L');
    expect(p.input.status).toBe('not-provided');
    expect(p.input).not.toHaveProperty('value');
    expect(p.provenance.kind).toBe('gap');
    expect(p.provenance.reliability).toBe('unverified');
    expect(p.required).toBe(true);
  });
  it('volume utilizável desconhecido não vira capacidade nominal ou zero', () => {
    const p = parameter(fuel.usableLitresParameterId);
    expect(p.unit).toBe('L');
    expect(p.input.status).toBe('not-provided');
    expect(p.input).not.toHaveProperty('value');
    expect(p.required).toBe(false);
  });
  it('reutiliza domínios: preço/eficiência positivos, volume zero legítimo', () => {
    for (const id of [fuel.pricePerLitreParameterId,fuel.efficiencyKmPerLitreParameterId]) {
      expect(parameter(id).constraints).toBe(NUMERIC_RULES.positive);
      expect(validateDecimalText('0',parameter(id).constraints).valid).toBe(false);
    }
    expect(parameter(fuel.usableLitresParameterId).constraints).toBe(NUMERIC_RULES.nonNegative);
    expect(validateDecimalText('0',parameter(fuel.usableLitresParameterId).constraints).valid).toBe(true);
  });
  it('explicita escopo/status e não inventa data ou competência', () => {
    for (const p of INITIAL_VEHICLE_PARAMETERS) {
      expect(p.provenance.scope).toEqual({kind:'vehicle',vehicleId:vehicle.id});
      expect(p.provenance.date).toBeNull();
      expect(p.provenance.competence).toBeNull();
      expect(p.dependencies).toEqual([]);
      if (p.input.status === 'not-provided') expect(p.input.reason.trim().length).toBeGreaterThan(0);
    }
    expect(vehicle.provenance.reliability).toBe('reported');
  });
  it('congela entidades/entradas e deixa estado editável para sua futura cópia', () => {
    assertFrozen(INITIAL_VEHICLES); assertFrozen(INITIAL_FUEL_CONFIGURATIONS); assertFrozen(INITIAL_VEHICLE_PARAMETERS);
  });
});
