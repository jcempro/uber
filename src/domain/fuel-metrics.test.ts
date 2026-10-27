/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§6.1, FT-003.32.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {describe,expect,it} from 'vitest';
import {resolvePureFuelMetrics} from './fuel-metrics';
import type {FuelConfiguration,NumericParameter,NumericInput} from './model';
import {INITIAL_FUEL_CONFIGURATIONS,INITIAL_VEHICLE_PARAMETERS} from './defaults';
import {NUMERIC_RULES} from './validation';
const limits={maxInputLength:256,maxDigits:64};
const provenance={kind:'illustrative-hypothesis',source:'fixture matemática; sem preço atual presumido',date:null,competence:null,scope:{kind:'global'},reliability:'conditional'} as const;
const fuel:FuelConfiguration={id:'fuel',vehicleId:'vehicle',name:'Fixture',enabled:true,cycle:'urban',kind:'ethanol',pricePerLitreParameterId:'price',efficiencyKmPerLitreParameterId:'eff',usableLitresParameterId:'volume',provenance};
function param(id:string,unit:string,input:NumericInput):NumericParameter{
  return {id,name:'Fixture',unit,category:'fixture',input,provenance,required:true,constraints:id==='volume'?NUMERIC_RULES.nonNegative:NUMERIC_RULES.positive,dependencies:[]};
}
function parameters():NumericParameter[]{
  return [param('price','BRL/L',{status:'provided',value:'4'}),param('eff','km/L',{status:'provided',value:'8'}),param('volume','L',{status:'provided',value:'10'})];
}
function resolved(params=parameters(),config=fuel){
  const result=resolvePureFuelMetrics(config,params,limits);if(result.status!=='resolved')throw Error('Expected resolved');return result;
}
describe('Combustível puro: custo/km e autonomia com dependências independentes',()=>{
  it('segue fórmulas literais do RCF sem arredondar nem usar proporção universal',()=>{
    // RCF6.1: preço/L ÷ km/L; litros utilizáveis × km/L. Fixtures4/8=1/2 e10×8=80.
    expect(resolved()).toMatchObject({fuelId:'fuel',vehicleId:'vehicle',kind:'ethanol',cycle:'urban',costPerKm:{status:'ready',value:{numerator:'1',denominator:'2'},verification:'not-evaluated'},rangeKm:{status:'ready',value:{numerator:'80',denominator:'1'},verification:'not-evaluated'}});
    const params=parameters().map(p=>p.id==='eff'?{...p,input:{status:'provided' as const,value:'3'}}:p);
    expect(resolved(params).costPerKm).toMatchObject({status:'ready',value:{numerator:'4',denominator:'3'}});
  });
  it('não bloqueia custo/km por falta de volume nem autonomia por falta de preço',()=>{
    const noVolume=parameters().filter(p=>p.id!=='volume'),noPrice=parameters().filter(p=>p.id!=='price');
    expect(resolved(noVolume)).toMatchObject({costPerKm:{status:'ready'},rangeKm:{status:'unavailable',dependency:'usableLitres'},bindings:{usableLitres:{code:'missing-parameter'}}});
    expect(resolved(noPrice)).toMatchObject({rangeKm:{status:'ready'},costPerKm:{status:'unavailable',dependency:'price'},bindings:{price:{code:'missing-parameter'}}});
  });
  it('preserva cadastro real:6,8km/L não vira consumo de ensaio e preços/volume ausentes não viram zero',()=>{
    const config=INITIAL_FUEL_CONFIGURATIONS[0];if(!config)throw Error('fixture real');
    const result=resolved([...INITIAL_VEHICLE_PARAMETERS],config);
    expect(result).toMatchObject({cycle:'unspecified',bindings:{efficiency:{status:'ready',value:{numerator:'34',denominator:'5'}},price:{status:'unavailable',inputStatus:'not-provided'},usableLitres:{status:'unavailable',inputStatus:'not-provided'}},costPerKm:{status:'unavailable'},rangeKm:{status:'unavailable'}});
  });
  it('não aceita eficiência zero/negativa mesmo se restrição de cadastro for afrouxada',()=>{
    for(const value of ['0','-1']){
      const params=parameters().map(p=>p.id==='eff'?{...p,constraints:{minimum:null,maximum:null,minimumInclusive:true,maximumInclusive:true},input:{status:'provided' as const,value}}:p);
      // Negativo é rejeitado pelo parser comum; zero pelo domínio positivo do resolvedor.
      const result=resolved(params);expect(result.costPerKm.status).toBe('unavailable');expect(result.rangeKm.status).toBe('unavailable');
    }
    const priceZero=parameters().map(p=>p.id==='price'?{...p,constraints:NUMERIC_RULES.nonNegative,input:{status:'confirmed-zero' as const,value:'0' as const}}:p);
    expect(resolved(priceZero)).toMatchObject({costPerKm:{status:'unavailable',code:'invalid-value',dependency:'price'},rangeKm:{status:'ready'}});
  });
  it('aceita volume utilizável zero mantendo hipótese identificada, sem tanque nominal arbitrário',()=>{
    for(const status of ['confirmed-zero','assumed-zero'] as const){
      const params=parameters().map(p=>p.id==='volume'?{...p,input:{status,value:'0' as const}}:p);
      expect(resolved(params)).toMatchObject({bindings:{usableLitres:{inputStatus:status}},costPerKm:{status:'ready'},rangeKm:{status:'ready',value:{numerator:'0',denominator:'1'},verification:'not-evaluated'}});
    }
  });
  it('mantém unidade,ambiguidade e falta de eficiência como diagnósticos originais',()=>{
    const p=parameters();const bad=p.map(v=>v.id==='price'?{...v,unit:'USD/L'}:v);
    expect(resolved(bad)).toMatchObject({bindings:{price:{code:'incompatible-unit'}},costPerKm:{status:'unavailable'},rangeKm:{status:'ready'}});
    expect(resolved([...p,p[1]!])).toMatchObject({bindings:{efficiency:{code:'ambiguous-parameter'}},costPerKm:{status:'unavailable'},rangeKm:{status:'unavailable'}});
    expect(resolved(p.filter(v=>v.id!=='eff'))).toMatchObject({costPerKm:{status:'unavailable'},rangeKm:{status:'unavailable'}});
  });
  it('recusa mistura neste caminho e preserva gasolina/ciclo selecionados sem herdar etanol',()=>{
    expect(resolvePureFuelMetrics({...fuel,kind:'blend',ethanolFractionParameterId:'blend-ratio'},parameters(),limits)).toMatchObject({status:'unavailable',code:'unsupported-fuel'});
    const gasoline={...fuel,kind:'gasoline' as const,cycle:'highway' as const};
    expect(resolved(parameters(),gasoline)).toMatchObject({kind:'gasoline',cycle:'highway',costPerKm:{value:{numerator:'1',denominator:'2'}}});
    expect(resolvePureFuelMetrics({...fuel,enabled:false},[],limits)).toEqual({status:'excluded',fuelId:'fuel',reason:'disabled'});
  });
  it('prioriza orçamento técnico e limita recurso sem substituir por zero',()=>{
    expect(resolvePureFuelMetrics(null as unknown as FuelConfiguration,[],{maxInputLength:0,maxDigits:64})).toMatchObject({status:'unavailable',code:'invalid-budget'});
    const result=resolvePureFuelMetrics(fuel,parameters(),{maxInputLength:256,maxDigits:1});
    expect(result).toMatchObject({status:'resolved',costPerKm:{status:'ready'},rangeKm:{status:'unavailable',dependency:'usableLitres'},bindings:{usableLitres:{code:'resource-budget'}}});
  });
  it('recalcula consumo/preço sem contaminar fontes ou autonomia por alteração de preço',()=>{
    const original=parameters(),changed=original.map(p=>p.id==='price'?{...p,input:{status:'provided' as const,value:'6'}}:p);
    expect(resolved(changed)).toMatchObject({costPerKm:{value:{numerator:'3',denominator:'4'}},rangeKm:resolved(original).rangeKm});
    expect(original[0]?.input).toEqual({status:'provided',value:'4'});
  });
  it('é determinístico,serializável e imutável, sem alegar custo completo ou resultado comprovado',()=>{
    const params=parameters(),before=JSON.stringify([fuel,params,limits]),first=resolved(params);
    expect(first).toEqual(resolved(params));expect(JSON.stringify([fuel,params,limits])).toBe(before);
    expect(Object.isFrozen(params)).toBe(false);expect(Object.isFrozen(fuel)).toBe(false);
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.bindings)).toBe(true);expect(Object.isFrozen(first.costPerKm)).toBe(true);
    if(first.costPerKm.status!=='ready')throw Error('Expected ready');
    expect(Object.isFrozen(first.costPerKm.value)).toBe(true);expect(first.costPerKm.verification).toBe('not-evaluated');
    expect(first).not.toHaveProperty('viable');expect(first).not.toHaveProperty('totalCost');
  });
});
