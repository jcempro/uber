/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/7.2, FT-003.27.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type { CalendarConfiguration } from './scenario';

/** Período mensal declarado ou motivo que impede sua aplicação ao kernel mensal. */
export type BudgetLossPeriodResult =
  | { readonly status: 'ready'; readonly calendarId: string; readonly period: 'month' }
  | { readonly status: 'unavailable'; readonly calendarId: string | null; readonly code: 'invalid-calendar' | 'unsupported-calendar' | 'unresolved-loss-period' | 'unsupported-loss-period'; readonly reason: string };

/**
 * Lê uma declaração explícita, sem inferir competência pelo ID ou pelo valor da perda.
 * Origem/evidência continuam em calendar.provenance; ready não certifica dados financeiros.
 * Os demais períodos exigem normalização específica, não divisão automática de ausências.
 */
export function resolveBudgetLossPeriod(calendar: CalendarConfiguration): BudgetLossPeriodResult {
  if (calendar === null || typeof calendar !== 'object' || typeof calendar.id !== 'string' || calendar.id.trim() === '') {
    return Object.freeze({ status: 'unavailable', calendarId: null, code: 'invalid-calendar', reason: 'Calendário inválido: identidade não informada.' });
  }
  if (calendar.kind !== 'budget') {
    return Object.freeze({ status: 'unavailable', calendarId: calendar.id, code: 'unsupported-calendar', reason: 'O calendário civil exige sua própria competência e apuração de ausências.' });
  }
  if (calendar.lostDaysPeriod === undefined) {
    return Object.freeze({ status: 'unavailable', calendarId: calendar.id, code: 'unresolved-loss-period', reason: 'O período dos dias perdidos não foi declarado para este calendário.' });
  }
  if (calendar.lostDaysPeriod !== 'month') {
    return Object.freeze({ status: 'unavailable', calendarId: calendar.id, code: 'unsupported-loss-period', reason: 'Este kernel exige perdas mensais explícitas; outro período precisa de normalização declarada.' });
  }
  return Object.freeze({ status: 'ready', calendarId: calendar.id, period: 'month' });
}
