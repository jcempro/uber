/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.1, FT-003.36.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type {CostValidity} from './model';
export interface ClosedDateInterval {readonly start:string;readonly end:string;}
export type CostDateField='validity'|'interval'|'validity.start'|'validity.end'|'interval.start'|'interval.end';
type DateFailure={readonly status:'unavailable';readonly code:'invalid-range'|'invalid-date'|'unresolved-validity';readonly reason:string;readonly field:CostDateField};
export type ClosedCostValidityResult=
  | {readonly status:'classified';readonly relation:'covers-interval'|'outside-interval'|'partial-overlap';readonly validity:ClosedDateInterval;readonly interval:ClosedDateInterval;readonly costAdmission:'not-evaluated'}
  | DateFailure;
function failure(code:DateFailure['code'],reason:string,field:CostDateField):DateFailure{return Object.freeze({status:'unavailable',code,reason,field});}
/** Parse nativo UTC e igualdade de ida/volta impedem normalização silenciosa de dias impossíveis. */
function isCalendarDate(value:unknown):value is string {
  if(typeof value!=='string'||value.length!==10||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const date=new Date(value+'T00:00:00.000Z');
  return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;
}
function readClosed(value:CostValidity|ClosedDateInterval,prefix:'validity'|'interval',allowUnknown:boolean):{readonly status:'ready';readonly value:ClosedDateInterval}|DateFailure {
  if(value===null||typeof value!=='object')return failure('invalid-range','Intervalo deve declarar limites explícitos.',prefix);
  const start=value.start,end=value.end;
  if(allowUnknown&&(start===null||end===null))
    return failure('unresolved-validity','Limite não informado não equivale a vigência sem início ou fim.',start===null?'validity.start':'validity.end');
  if(!isCalendarDate(start))return failure('invalid-date','Data deve ser um dia válido no formato YYYY-MM-DD.',prefix==='validity'?'validity.start':'interval.start');
  if(!isCalendarDate(end))return failure('invalid-date','Data deve ser um dia válido no formato YYYY-MM-DD.',prefix==='validity'?'validity.end':'interval.end');
  if(start>end)return failure('invalid-range','Início não pode ser posterior ao fim.',prefix);
  return Object.freeze({status:'ready',value:Object.freeze({start,end})});
}
/**
 * Relação inclusiva entre dois intervalos fechados de dias de calendário.
 * Sem relógio atual, fuso local, duração, rateio ou interpretação de competência orçamentária.
 * Vigência compatível não prova incidência, fonte, quantia, reconciliação ou custo admitido.
 */
export function classifyClosedCostValidity(validity:CostValidity,interval:ClosedDateInterval):ClosedCostValidityResult {
  const target=readClosed(interval,'interval',false);if(target.status!=='ready')return target;
  const source=readClosed(validity,'validity',true);if(source.status!=='ready')return source;
  const v=source.value,t=target.value;
  const relation=v.end<t.start||v.start>t.end?'outside-interval':v.start<=t.start&&v.end>=t.end?'covers-interval':'partial-overlap';
  return Object.freeze({status:'classified',relation,validity:v,interval:t,costAdmission:'not-evaluated'});
}
