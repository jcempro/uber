/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§5/7, FT-003.9.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { readFileSync } from 'node:fs';
import Decimal from 'decimal.js';
import { describe, expect, it } from 'vitest';
import type { NumericParameter } from './model';
import { INITIAL_CALENDARS, INITIAL_WORK_SCHEDULES, INITIAL_TIME_PARAMETERS } from './defaults';
import { validateDecimalText } from './validation';

const canonical = readFileSync(new URL('../../RCF.md',import.meta.url),'utf8');
const programRow = canonical.split(/\r?\n/).find(l=>l.includes('| Trabalhos programados'));
const scheduleRow = canonical.split(/\r?\n/).find(l=>l.includes('| Jornadas comparáveis'));
if (!programRow || !scheduleRow) throw new Error('Fonte canônica de tempo ausente');
const expectedCalendar = [...programRow.matchAll(/\*\*(\d+) (?:dias|meses)/g)].map(m=>m[1]);
const expectedHours = [...scheduleRow.matchAll(/\*\*(\d+) h\/dia/g)].map(m=>m[1]);
const expectedClocks = [...scheduleRow.matchAll(/(\d{1,2})h(\d{2})/g)].map(m=>m[1].padStart(2,'0')+':'+m[2]);
const yearDays = canonical.match(/\*\*(\d+) dias orçamentários\*\*/)?.[1];
if (!yearDays) throw new Error('Convenção orçamentária anual ausente');

/** Obtém parâmetro existente; vínculo ausente não deve parecer zero. */
function parameter(id: string): NumericParameter {
  const p=INITIAL_TIME_PARAMETERS.find(p=>p.id===id);
  if (!p) throw new Error('Parâmetro ausente: '+id);
  return p;
}
/** Extrai somente dado efetivamente fornecido nesta referência, sem coerção/fallback. */
function provided(id: string): string {
  const input=parameter(id).input;
  if (input.status!=='provided') throw new Error('Entrada não fornecida: '+id);
  return input.value;
}
/** Mantém a referência tipada no ramo orçamentário, sem interpretar dados civis. */
function budget() {
  const c=INITIAL_CALENDARS[0];
  if (c.kind!=='budget') throw new Error('Calendário inicial não orçamentário');
  return c;
}
/** Referências congeladas não compartilham mutação acidental com o futuro estado editável. */
function assertFrozen(value: unknown): void {
  if (value===null || typeof value!=='object') return;
  expect(Object.isFrozen(value)).toBe(true);
  for (const v of Object.values(value)) assertFrozen(v);
}
describe('referências de calendário e jornadas ligadas ao RCF',()=>{
  it('cria só orçamento, sem datas ou dias da semana inventados',()=>{
    expect(INITIAL_CALENDARS).toHaveLength(1);
    expect(budget().id).toBe('calendar-budget');
    expect(budget()).not.toHaveProperty('startDate');
    expect(budget()).not.toHaveProperty('workingWeekdays');
  });
  it('preserva os3 valores de calendário da fonte, sem recadastrar números no teste',()=>{
    const c=budget();
    expect([provided(c.daysPerWeekParameterId),provided(c.daysPerMonthParameterId),provided(c.monthsPerYearParameterId)]).toEqual(expectedCalendar);
  });
  it('dias perdidos desconhecidos não viram zero conveniente',()=>{
    const p=parameter(budget().lostDaysParameterId);
    expect(p.input.status).toBe('not-provided'); expect(p.input).not.toHaveProperty('value');
    expect(p.provenance.kind).toBe('gap'); expect(p.provenance.reliability).toBe('unverified');
    expect(p.required).toBe(true);
  });
  it('preserva3/6/8h e somente os horários expressamente fornecidos',()=>{
    expect(INITIAL_WORK_SCHEDULES).toHaveLength(3);
    expect(INITIAL_WORK_SCHEDULES.map(s=>provided(s.durationHoursParameterId))).toEqual(expectedHours);
    expect([INITIAL_WORK_SCHEDULES[0].startTime,INITIAL_WORK_SCHEDULES[0].endTime]).toEqual(expectedClocks);
    for (const s of INITIAL_WORK_SCHEDULES.slice(1)) expect([s.startTime,s.endTime]).toEqual([null,null]);
  });
  it('mantém unicidade e vínculos das7 premissas independentes',()=>{
    expect(INITIAL_TIME_PARAMETERS).toHaveLength(7);
    expect(new Set(INITIAL_TIME_PARAMETERS.map(p=>p.id)).size).toBe(7);
    expect(new Set(INITIAL_WORK_SCHEDULES.map(s=>s.id)).size).toBe(3);
    const c=budget();
    for (const id of [c.daysPerWeekParameterId,c.daysPerMonthParameterId,c.monthsPerYearParameterId,c.lostDaysParameterId,...INITIAL_WORK_SCHEDULES.map(s=>s.durationHoursParameterId)]) expect(parameter(id)).toBeDefined();
  });
  it('aplica domínios declarativos sem confundir lacuna com zero',()=>{
    const week=parameter(budget().daysPerWeekParameterId);
    for (const v of ['0','7']) expect(validateDecimalText(v,week.constraints).valid).toBe(true);
    expect(validateDecimalText('8',week.constraints).valid).toBe(false);
    for (const s of INITIAL_WORK_SCHEDULES) {
      const constraints=parameter(s.durationHoursParameterId).constraints;
      expect(validateDecimalText('0',constraints).valid).toBe(false);
      expect(validateDecimalText('24',constraints).valid).toBe(true);
      expect(validateDecimalText('25',constraints).valid).toBe(false);
    }
  });
  it('congela entradas e registra decisões de simulação, sem datas inventadas',()=>{
    assertFrozen(INITIAL_CALENDARS); assertFrozen(INITIAL_WORK_SCHEDULES); assertFrozen(INITIAL_TIME_PARAMETERS);
    for (const p of INITIAL_TIME_PARAMETERS) {
      expect(p.provenance.scope).toEqual({kind:'global'}); expect(p.provenance.date).toBeNull(); expect(p.provenance.competence).toBeNull();
      if (p.input.status==='provided') { expect(p.provenance.kind).toBe('current-decision'); expect(p.provenance.reliability).toBe('confirmed'); }
    }
  });
  it('mantém a convenção anual orçamentária da fonte, sem usar ano civil',()=>{
    const c=budget();
    expect(new Decimal(provided(c.daysPerMonthParameterId)).times(provided(c.monthsPerYearParameterId)).eq(yearDays)).toBe(true);
  });
});
