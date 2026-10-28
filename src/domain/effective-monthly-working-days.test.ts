/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§7.2/domínio de dias efetivos, FT-003.40.4b.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {describe,expect,it} from 'vitest';
import type {ExactRational} from './exact';
import {calculateEffectiveMonthlyWorkingDays,calculateMonthlyAvailability} from './monthly-availability';
const limits={maxInputLength:256,maxDigits:64};
function r(numerator:string,denominator='1'){return {numerator,denominator};}
describe('Dias efetivos independentes de jornada',()=>{
  it('10-3=7; API composta conserva jornada8→56horas',()=>{
    expect(calculateEffectiveMonthlyWorkingDays(r('10'),r('3'),limits)).toEqual({status:'ready',value:r('7')});
    expect(calculateMonthlyAvailability(r('10'),r('3'),r('8'),limits)).toEqual({status:'ready',value:{effectiveWorkingDaysPerMonth:r('7'),connectedHoursPerMonth:r('56')}});
  });
  it('120/7-2=106/7 sem arredondar dias estatísticos',()=>{
    expect(calculateEffectiveMonthlyWorkingDays(r('120','7'),r('2'),limits)).toEqual({status:'ready',value:r('106','7')});
  });
  it('zero, perdaszero e perdas totais não são rejeitados ou clampados',()=>{
    for(const [s,l,e]of [['0','0','0'],['10','0','10'],['10','10','0']] as const)expect(calculateEffectiveMonthlyWorkingDays(r(s),r(l),limits)).toEqual({status:'ready',value:r(e)});
  });
  it('dias ou perdas negativos são recusados',()=>{
    for(const [s,l]of [['-1','0'],['10','-1']] as const)expect(calculateEffectiveMonthlyWorkingDays(r(s),r(l),limits)).toMatchObject({status:'unavailable',code:'invalid-calendar'});
  });
  it('perdas acima do programado não se tornam disponibilidadezero',()=>{
    const result=calculateEffectiveMonthlyWorkingDays(r('10'),r('11'),limits);expect(result).toMatchObject({status:'unavailable',code:'invalid-calendar'});expect(result).not.toHaveProperty('value');
  });
  it('ausência, racionalinválido e orçamentoinválido preservamdiagnósticos',()=>{
    expect(calculateEffectiveMonthlyWorkingDays(r('10'),undefined as unknown as ExactRational,limits)).toMatchObject({status:'unavailable',code:'invalid-rational'});
    expect(calculateEffectiveMonthlyWorkingDays(r('10','0'),r('0'),limits)).toMatchObject({status:'unavailable',code:'invalid-rational'});
    expect(calculateEffectiveMonthlyWorkingDays(r('10'),r('0'),{maxInputLength:256,maxDigits:0})).toMatchObject({status:'unavailable',code:'invalid-budget'});
  });
  it('falta de horas não bloqueia dias; APIantiga mantém limites0<h<=24',()=>{
    expect(calculateEffectiveMonthlyWorkingDays(r('10'),r('3'),limits)).toEqual({status:'ready',value:r('7')});
    expect(calculateMonthlyAvailability(r('10'),r('3'),undefined as unknown as ExactRational,limits)).toMatchObject({status:'unavailable',code:'invalid-rational'});
    for(const h of ['0','25'])expect(calculateMonthlyAvailability(r('10'),r('3'),r(h),limits)).toMatchObject({status:'unavailable',code:'invalid-calendar'});
    expect(calculateMonthlyAvailability(r('10'),r('3'),r('24'),limits)).toMatchObject({status:'ready',value:{effectiveWorkingDaysPerMonth:r('7'),connectedHoursPerMonth:r('168')}});
  });
  it('snapshots congelados/repetíveis não congelam nem alteram entradas',()=>{
    const scheduled=r('20','2'),lost=r('6','2'),before=JSON.stringify([scheduled,lost]),result=calculateEffectiveMonthlyWorkingDays(scheduled,lost,limits);
    expect(calculateEffectiveMonthlyWorkingDays(scheduled,lost,limits)).toEqual(result);expect(result).toEqual({status:'ready',value:r('7')});expect(JSON.stringify([scheduled,lost])).toBe(before);
    expect(Object.isFrozen(result)).toBe(true);expect(Object.isFrozen(scheduled)).toBe(false);expect(Object.isFrozen(lost)).toBe(false);if(result.status!=='ready')throw Error('Esperado resultado exato');expect(Object.isFrozen(result.value)).toBe(true);
    scheduled.numerator='999';lost.numerator='0';expect(result.value).toEqual(r('7'));
  });
});
