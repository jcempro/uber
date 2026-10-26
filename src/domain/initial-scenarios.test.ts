/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/7 e F01; FT-003.13d/003.13e/003.15.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { INITIAL_WORK_SCHEDULES, INITIAL_FINANCIAL_OBJECTIVES, INITIAL_PROFILE_REFERENCES, INITIAL_VEHICLES, INITIAL_FUEL_CONFIGURATIONS, INITIAL_CALENDARS } from './defaults';
import { createEvaluationContexts } from './contexts';
import { INITIAL_SCENARIOS, INITIAL_EVALUATION_CONTEXTS, INITIAL_MAINTENANCE_PARAMETERS, INITIAL_MAINTENANCE_COST_ITEMS, INITIAL_MAINTENANCE_REQUIREMENTS } from './initial-scenarios';

const rcf = readFileSync(new URL('../../RCF.md', import.meta.url), 'utf8');
const normative = rcf.match(/(\d+) perfis × (\d+) jornadas × (\d+) objetivos = (\d+) contextos/);
if (!normative) throw new Error('Matriz normativa ausente');
const [profiles, schedulesCount, goalsCount, total] = normative.slice(1).map(Number);
const schedules = INITIAL_WORK_SCHEDULES;
const goals = INITIAL_FINANCIAL_OBJECTIVES;
const scenarios = INITIAL_SCENARIOS;

// Integração da matriz e validação das sementes; não comprova apuração financeira.
describe('Matriz das sementes reais, sem resultados financeiros', () => {
  it('produz a cardinalidade e seis combinações únicas por perfil exigidas pelo RCF', () => {
    expect(scenarios).toHaveLength(profiles); expect(schedules).toHaveLength(schedulesCount); expect(goals).toHaveLength(goalsCount);
    const result = INITIAL_EVALUATION_CONTEXTS;
    expect(result).toHaveLength(total);
    expect(new Set(result.map(c => c.id)).size).toBe(total);
    for (const scenario of scenarios) {
      const own = result.filter(c => c.scenarioId === scenario.id);
      expect(own).toHaveLength(schedulesCount * goalsCount);
      for (const schedule of schedules) for (const goal of goals)
        expect(own.filter(c => c.scheduleId === schedule.id && c.objectiveId === goal.id)).toHaveLength(1);
    }
  });
  it('preserva ordem, determinismo e imutabilidade sem alterar entradas', () => {
    const before = JSON.stringify([scenarios, schedules, goals]);
    const result = createEvaluationContexts(scenarios, schedules, goals);
    expect(result).toEqual(createEvaluationContexts(scenarios, schedules, goals));
    expect(result).toEqual(INITIAL_EVALUATION_CONTEXTS);
    expect(result[0]).toEqual({ id: JSON.stringify([scenarios[0].id,schedules[0].id,goals[0].id]), scenarioId: scenarios[0].id, scheduleId: schedules[0].id, objectiveId: goals[0].id });
    expect(result[1].objectiveId).toBe(goals[1].id);
    expect(result[goals.length].scheduleId).toBe(schedules[1].id);
    expect(result[schedules.length * goals.length].scenarioId).toBe(scenarios[1].id);
    expect(Object.isFrozen(result)).toBe(true); expect(result.every(Object.isFrozen)).toBe(true);
    expect(JSON.stringify([scenarios, schedules, goals])).toBe(before);
  });
  it('expande cenários personalizados sem eliminar os contextos iniciais', () => {
    const extra = { ...scenarios[0], id: 'custom-profile', referenceProfileId: null };
    const initial = createEvaluationContexts(scenarios, schedules, goals);
    const expanded = createEvaluationContexts([...scenarios, extra], schedules, goals);
    expect(expanded).toHaveLength(total + schedulesCount * goalsCount);
    expect(expanded.slice(0, total)).toEqual(initial);
  });
  it('exclui apenas cenários desabilitados', () => {
    const result = createEvaluationContexts(scenarios.map((s,i) => ({...s, enabled: i !== 1})), schedules, goals);
    expect(result).toHaveLength((profiles - 1) * schedulesCount * goalsCount);
    expect(result.some(c => c.scenarioId === scenarios[1].id)).toBe(false);
  });
  it('preserva nomes, perfis e ativação dos cadastros normativos iniciais', () => {
    expect(scenarios.map(s => ({ profile:s.referenceProfileId, name:s.name, enabled:s.enabled })))
      .toEqual(INITIAL_PROFILE_REFERENCES.map(p => ({ profile:p.id, name:p.name, enabled:true })));
  });
  it('referencia veículo, combustível padrão e calendário existentes', () => {
    for (const s of scenarios) {
      const vehicle = INITIAL_VEHICLES.find(v => v.id === s.vehicleId);
      const fuel = INITIAL_FUEL_CONFIGURATIONS.find(f => f.id === s.fuelConfigurationId);
      expect(vehicle).toBeDefined();
      expect(vehicle?.id).toBe(INITIAL_VEHICLES[0].id);
      expect(fuel).toMatchObject({ vehicleId:s.vehicleId });
      expect(s.fuelConfigurationId).toBe(vehicle?.defaultFuelConfigurationId);
      expect(INITIAL_CALENDARS.some(c => c.id === s.calendarId)).toBe(true);
    }
  });
  it('congela os cadastros em profundidade e conserva catálogos compartilhados imutáveis', () => {
    for (const object of [scenarios, INITIAL_EVALUATION_CONTEXTS, INITIAL_PROFILE_REFERENCES, INITIAL_VEHICLES, INITIAL_FUEL_CONFIGURATIONS, INITIAL_CALENDARS, schedules, goals])
      expect(Object.isFrozen(object)).toBe(true);
    for (const s of scenarios) for (const object of [s, s.parameterIds, s.costItemIds, s.provenance, s.provenance.scope])
      expect(Object.isFrozen(object)).toBe(true);
    expect(INITIAL_EVALUATION_CONTEXTS.every(Object.isFrozen)).toBe(true);
  });
  it('identifica a decisão de cadastro sem apresentá-la como evidência da operação', () => {
    for (const s of scenarios) expect(s.provenance).toEqual({
      kind:'current-decision', source:'RCF§§4/7', date:null, competence:null,
      scope:{kind:'scenario',scenarioId:s.id}, reliability:'confirmed',
    });
  });
  it('armazena referências e identidades sem resultados financeiros inventados', () => {
    for (const s of scenarios) for (const list of [s.parameterIds,s.costItemIds]) {
      expect(list.every(id => typeof id === 'string' && id.trim() !== '')).toBe(true);
      expect(new Set(list).size).toBe(list.length);
    }
    // Listas ainda sem itens não significam custo zero; incidência e valores exigem apuração própria.
    for (const c of INITIAL_EVALUATION_CONTEXTS) {
      expect(Object.keys(c).sort()).toEqual(['id','objectiveId','scenarioId','scheduleId']);
      expect(Object.values(c).every(id => typeof id === 'string' && id.trim() !== '')).toBe(true);
    }
  });

  it('materializa as taxas de cada perfil uma vez, diretamente da tabela canônica', () => {
    const section = rcf.split('### 6.2 Provisões por quilômetro')[1]?.split('## 7. Calendário')[0];
    if (!section) throw new Error('Seção de manutenção ausente');
    const table = section.split(/\r?\n/).filter(line=>line.startsWith('|')).map(line=>line.split('|').slice(1,-1).map(cell=>cell.replaceAll('*','').trim()));
    const rates = table.slice(2).filter(row=>!row[0].includes('Total derivado'));
    expect(rates.length).toBeGreaterThan(0);
    const count = profiles * rates.length;
    expect(INITIAL_MAINTENANCE_PARAMETERS).toHaveLength(count);
    expect(INITIAL_MAINTENANCE_COST_ITEMS).toHaveLength(count);
    expect(INITIAL_MAINTENANCE_REQUIREMENTS).toHaveLength(count);
    for (const [index,s] of scenarios.entries()) {
      const own = s.parameterIds.map(id=>INITIAL_MAINTENANCE_PARAMETERS.find(p=>p.id===id));
      expect(own.map(p=>({name:p?.name,value:p?.input.status==='provided'?p.input.value:undefined})))
        .toEqual(rates.map(row=>({name:row[0],value:row[index+1].replace(',','.')})));
    }
  });
  it('resolve itens e requisitos dentro do cenário, sem órfãos ou duplicação por jornada/meta', () => {
    for (const s of scenarios) {
      const items = INITIAL_MAINTENANCE_COST_ITEMS.filter(i=>s.costItemIds.includes(i.id));
      const reqs = INITIAL_MAINTENANCE_REQUIREMENTS.filter(r=>r.provenance.scope.kind==='scenario' && r.provenance.scope.scenarioId===s.id);
      expect(items).toHaveLength(s.costItemIds.length);
      expect(reqs).toHaveLength(items.length);
      for (const item of items) {
        expect(item.provenance.scope).toEqual({kind:'scenario',scenarioId:s.id});
        expect(s.parameterIds).toContain(item.amountParameterId);
        expect(INITIAL_MAINTENANCE_PARAMETERS.some(p=>p.id===item.amountParameterId)).toBe(true);
        expect(reqs.filter(r=>r.status==='applicable' && r.costItemIds.length===1 && r.costItemIds[0]===item.id)).toHaveLength(1);
      }
      expect(INITIAL_EVALUATION_CONTEXTS.filter(c=>c.scenarioId===s.id)).toHaveLength(schedulesCount*goalsCount);
    }
  });
  it('conserva os registros canônicos únicos e congelados sem marcar cobertura financeira', () => {
    const collections = [INITIAL_MAINTENANCE_PARAMETERS,INITIAL_MAINTENANCE_COST_ITEMS,INITIAL_MAINTENANCE_REQUIREMENTS];
    for (const collection of collections) {
      expect(Object.isFrozen(collection)).toBe(true);
      expect(collection.every(Object.isFrozen)).toBe(true);
      expect(new Set(collection.map(x=>x.id)).size).toBe(collection.length);
    }
    const allIds = collections.flatMap(c=>c.map(x=>x.id));
    expect(new Set(allIds).size).toBe(allIds.length);
    // A coleção cobre somente manutenção: existência de referências não comprova custos totais ou lucro.
    for (const c of INITIAL_EVALUATION_CONTEXTS)
      expect(Object.keys(c).sort()).toEqual(['id','objectiveId','scenarioId','scheduleId']);
  });
});
