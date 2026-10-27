/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§6.1/8.1, FT-003.33.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {describe,expect,it} from 'vitest';
import {resolvePureFuelPeriodAmount} from './fuel-period';
import type {FuelPeriodContext} from './fuel-period';
import type {FuelConfiguration,NumericParameter} from './model';
import {INITIAL_FUEL_CONFIGURATIONS,INITIAL_VEHICLE_PARAMETERS} from './defaults';
import {NUMERIC_RULES} from './validation';
const limits={maxInputLength:256,maxDigits:64};
const r=(numerator:string,denominator='1')=>({numerator,denominator});
const provenance={kind:'illustrative-hypothesis',source:'fixture matemática; não preço atual',date:null,competence:null,scope:{kind:'global'},reliability:'conditional'} as const;
const fuel:FuelConfiguration={id:'fuel',vehicleId:'vehicle',name:'Fixture',enabled:true,cycle:'urban',kind:'ethanol',pricePerLitreParameterId:'price',efficiencyKmPerLitreParameterId:'eff',usableLitresParameterId:'volume',provenance};
const parameters:NumericParameter[]=[
  {id:'price',name:'Preço fixture',unit:'BRL/L',input:{status:'provided',value:'4'},category:'fixture',provenance,required:true,constraints:NUMERIC_RULES.positive,dependencies:[]},
  {id:'eff',name:'Eficiência fixture',unit:'km/L',input:{status:'provided',value:'8'},category:'fixture',provenance,required:true,constraints:NUMERIC_RULES.positive,dependencies:[]},
];
function context(numerator='100',denominator='1'):FuelPeriodContext{
  return {contextId:'scenario-jornada-meta',period:'month',totalKilometres:{contextId:'scenario-jornada-meta',period:'month',unit:'km',value:r(numerator,denominator)}};
}
describe('Combustível por contexto e período, com toda a rodagem',()=>{
  it('inclui coleta,pago e retorno na quantidade total sem exigir volume disponível',()=>{
    // RCF8.1: 20 coleta+60 pagos+20 retorno=100km; RCF6.1:100/8=12,5L;12,5×4=50BRL.
    expect(resolvePureFuelPeriodAmount(fuel,parameters,context(),limits)).toMatchObject({status:'ready',contextId:'scenario-jornada-meta',period:'month',amount:r('50'),litres:r('25','2'),totalKilometres:{value:r('100')},metrics:{rangeKm:{status:'unavailable',dependency:'usableLitres'}},ledgerAdmission:'not-evaluated'});
  });
  it('recalcula por rodagem própria de cada contexto, sem transportar reserva mensal',()=>{
    expect(resolvePureFuelPeriodAmount(fuel,parameters,context('50'),limits)).toMatchObject({status:'ready',amount:r('25'),litres:r('25','4')});
    const original=context();if(!original.totalKilometres)throw Error('fixture');
    const other:FuelPeriodContext={contextId:'other',period:'week',totalKilometres:{...original.totalKilometres,contextId:'other',period:'week',value:r('10')}};
    expect(resolvePureFuelPeriodAmount(fuel,parameters,other,limits)).toMatchObject({status:'ready',contextId:'other',period:'week',amount:r('5'),litres:r('5','4')});
  });
  it('rejeita contexto/período/unidade divergentes, ausência e quantidade negativa',()=>{
    const current=context();if(!current.totalKilometres)throw Error('fixture');
    for(const totalKilometres of [null,{...current.totalKilometres,contextId:'other'},{...current.totalKilometres,period:'day' as const},{...current.totalKilometres,unit:'trip' as const},{...current.totalKilometres,value:r('-1')}])
      expect(resolvePureFuelPeriodAmount(fuel,parameters,{...current,totalKilometres},limits)).toMatchObject({status:'unavailable',code:'invalid-usage'});
  });
  it('distingue uso zero informado de taxa desconhecida, sem apagar dados faltantes',()=>{
    expect(resolvePureFuelPeriodAmount(fuel,parameters,context('0'),limits)).toMatchObject({status:'ready',amount:r('0'),litres:r('0'),ledgerAdmission:'not-evaluated'});
    expect(resolvePureFuelPeriodAmount(fuel,parameters.filter(p=>p.id!=='price'),context('0'),limits)).toMatchObject({status:'unavailable',code:'fuel-unavailable',metrics:{bindings:{price:{code:'missing-parameter'}}}});
  });
  it('mantém6,8 do cadastro e preço atual pendente, sem adotar preço histórico',()=>{
    const config=INITIAL_FUEL_CONFIGURATIONS[0];if(!config)throw Error('fixture');
    expect(resolvePureFuelPeriodAmount(config,INITIAL_VEHICLE_PARAMETERS,context('68'),limits)).toMatchObject({status:'unavailable',code:'fuel-unavailable',metrics:{bindings:{price:{inputStatus:'not-provided'},efficiency:{value:r('34','5')}}}});
    const hypothesis=INITIAL_VEHICLE_PARAMETERS.map(p=>p.id===config.pricePerLitreParameterId?{...p,input:{status:'provided' as const,value:'3.4'},provenance}:p);
    expect(resolvePureFuelPeriodAmount(config,hypothesis,context('68'),limits)).toMatchObject({status:'ready',amount:r('34'),litres:r('10'),ledgerAdmission:'not-evaluated'});
  });
  it('preserva diagnóstico numérico original e falha de recurso sem custo zero',()=>{
    expect(resolvePureFuelPeriodAmount(fuel,parameters,context('1','0'),limits)).toMatchObject({status:'unavailable',code:'calculation-unavailable',calculation:{code:'invalid-rational'}});
    expect(resolvePureFuelPeriodAmount(fuel,parameters,context('100'),{maxInputLength:256,maxDigits:1})).toMatchObject({status:'unavailable',code:'calculation-unavailable',calculation:{code:'resource-budget'}});
    expect(resolvePureFuelPeriodAmount(null as unknown as FuelConfiguration,[],context(),{maxInputLength:0,maxDigits:64})).toMatchObject({status:'unavailable',code:'invalid-budget'});
  });
  it('exclui configuração inativa e conserva mistura pendente no caminho próprio',()=>{
    const excluded=resolvePureFuelPeriodAmount({...fuel,enabled:false},[],context(),limits);
    expect(excluded).toEqual({status:'excluded',fuelId:'fuel',reason:'disabled',ledgerAdmission:'not-evaluated'});expect(excluded).not.toHaveProperty('amount');
    expect(resolvePureFuelPeriodAmount({...fuel,kind:'blend',ethanolFractionParameterId:'ratio'},parameters,context(),limits)).toMatchObject({status:'unavailable',code:'fuel-unavailable',metrics:{code:'unsupported-fuel'}});
  });
  it('mantém JSON,determinismo e fontes imutáveis,sem provar pagamento,custo completo ou lucro',()=>{
    const c=context(),before=JSON.stringify([fuel,parameters,c,limits]),first=resolvePureFuelPeriodAmount(fuel,parameters,c,limits);
    expect(first).toEqual(resolvePureFuelPeriodAmount(fuel,parameters,c,limits));expect(JSON.stringify([fuel,parameters,c,limits])).toBe(before);
    expect(Object.isFrozen(c)).toBe(false);expect(Object.isFrozen(parameters)).toBe(false);expect(JSON.parse(JSON.stringify(first))).toEqual(first);
    expect(Object.isFrozen(first)).toBe(true);if(first.status!=='ready')throw Error('Expected ready');
    for(const value of [first.amount,first.litres,first.totalKilometres,first.totalKilometres.value,first.metrics])expect(Object.isFrozen(value)).toBe(true);
    expect(first.ledgerAdmission).toBe('not-evaluated');expect(first).not.toHaveProperty('profit');expect(first).not.toHaveProperty('viable');expect(first).not.toHaveProperty('actualPayment');
  });
});
