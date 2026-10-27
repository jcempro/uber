/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.1, FT-003.36.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {describe,expect,it} from 'vitest';
import {classifyClosedCostValidity} from './cost-validity';
import type {ClosedDateInterval} from './cost-validity';
import type {CostValidity} from './model';
const target:ClosedDateInterval={start:'2026-10-01',end:'2026-10-31'};
describe('Vigência fechada de custo sem admissão ou rateio automático',()=>{
  it('reconhece cobertura temporal completa com limites inclusivos e snapshots',()=>{
    expect(classifyClosedCostValidity({...target},target)).toMatchObject({status:'classified',relation:'covers-interval',costAdmission:'not-evaluated'});
    expect(classifyClosedCostValidity({start:'2026-01-01',end:'2026-12-31'},target)).toMatchObject({status:'classified',relation:'covers-interval'});
    const day={start:'2026-10-01',end:'2026-10-01'};
    expect(classifyClosedCostValidity(day,day)).toMatchObject({status:'classified',relation:'covers-interval'});
  });
  it('distingue ausência temporal de sobreposição parcial sem apagar ou mensalizar custos',()=>{
    for(const validity of [{start:'2026-09-01',end:'2026-09-30'},{start:'2026-11-01',end:'2026-12-31'}])
      expect(classifyClosedCostValidity(validity,target)).toMatchObject({status:'classified',relation:'outside-interval',costAdmission:'not-evaluated'});
    for(const validity of [{start:'2026-10-15',end:'2026-11-15'},{start:'2026-09-15',end:'2026-10-01'},{start:'2026-10-10',end:'2026-10-20'}]){
      const result=classifyClosedCostValidity(validity,target);
      expect(result).toMatchObject({status:'classified',relation:'partial-overlap',costAdmission:'not-evaluated'});expect(result).not.toHaveProperty('allocationFactor');
    }
  });
  it('mantém limites null como não informados,nunca infinito ou validade automática',()=>{
    for(const validity of [{start:null,end:null},{start:null,end:'2026-12-31'},{start:'2026-01-01',end:null}]){
      const result=classifyClosedCostValidity(validity,target);expect(result).toMatchObject({status:'unavailable',code:'unresolved-validity'});
      expect(result).not.toHaveProperty('relation');expect(result).not.toHaveProperty('value');
    }
  });
  it('recusa dias impossíveis e formatos não canônicos sem aceitar rollover nativo',()=>{
    for(const start of ['2026-02-29','1900-02-29','2026-04-31','2026-00-01','2026-13-01','2026-10-00','2026-10-32','2026-1-01','2026-10-01T00:00:00Z',' 2026-10-01']){
      expect(classifyClosedCostValidity({start,end:'2026-12-31'},target)).toMatchObject({status:'unavailable',code:'invalid-date',field:'validity.start'});
    }
    // Bissextos são exemplos de calendário independentes da implementação,sem cálculo financeiro.
    for(const day of ['2000-02-29','2024-02-29']){
      const interval={start:day,end:day};expect(classifyClosedCostValidity(interval,interval)).toMatchObject({status:'classified',relation:'covers-interval'});
    }
  });
  it('valida primeiro o intervalo consultado e recusa faixas invertidas ou estrutura ausente',()=>{
    expect(classifyClosedCostValidity({start:null,end:null},{start:'2026-04-31',end:'2026-10-31'})).toMatchObject({status:'unavailable',code:'invalid-date',field:'interval.start'});
    expect(classifyClosedCostValidity({...target},{start:'2026-11-01',end:'2026-10-01'})).toMatchObject({status:'unavailable',code:'invalid-range',field:'interval'});
    expect(classifyClosedCostValidity({start:'2026-11-01',end:'2026-10-01'},target)).toMatchObject({status:'unavailable',code:'invalid-range',field:'validity'});
    expect(classifyClosedCostValidity(null as unknown as CostValidity,target)).toMatchObject({status:'unavailable',code:'invalid-range',field:'validity'});
  });
  it('é determinístico,JSON e imutável,sem fuso/hoje ou decisão financeira implícitos',()=>{
    const validity={start:'2026-01-01',end:'2026-12-31'},before=JSON.stringify([validity,target]),first=classifyClosedCostValidity(validity,target);
    expect(first).toEqual(classifyClosedCostValidity(validity,target));expect(JSON.stringify([validity,target])).toBe(before);
    expect(Object.isFrozen(validity)).toBe(false);expect(Object.isFrozen(target)).toBe(false);expect(JSON.parse(JSON.stringify(first))).toEqual(first);expect(Object.isFrozen(first)).toBe(true);
    if(first.status!=='classified')throw Error('Expected classified');
    expect(Object.isFrozen(first.validity)).toBe(true);expect(Object.isFrozen(first.interval)).toBe(true);
    expect(first.validity).not.toBe(validity);expect(first.interval).not.toBe(target);expect(first.costAdmission).toBe('not-evaluated');
    expect(first).not.toHaveProperty('complete');expect(first).not.toHaveProperty('totalCost');expect(first).not.toHaveProperty('viable');
  });
});
