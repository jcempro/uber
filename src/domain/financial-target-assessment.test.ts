/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§8.3/identidade financeira, FT-003.40.3.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import {describe,expect,it} from 'vitest';
import {calculateConditionalFinancialTargetAssessment,type FinancialTargetAssessmentInput} from './financial-target-assessment';
const limits={maxInputLength:256,maxDigits:64};
function r(numerator:string,denominator='1'){return {numerator,denominator};}
function fixture():FinancialTargetAssessmentInput{return {kind:'projection',contextId:'fixture',period:'month',creditedRevenue:r('800'),fixedCosts:r('100'),usageCosts:r('200'),extraordinaryCosts:r('30'),fixedTaxes:r('10'),titheRate:r('1','10'),revenueTaxRate:r('1','20'),targetProfit:r('510'),model:{kind:'fixed-usage-linear',reason:'Fixture sintética de custos e uso constantes; não dados operacionais'}};}
function frozen(value:unknown):void {if(value!==null&&typeof value==='object'){expect(Object.isFrozen(value)).toBe(true);for(const child of Object.values(value))frozen(child);}}
describe('Repasse adicional condicional com dependências independentes',()=>{
  it('déficit de lucro170 não é repasse adicional200',()=>{
    expect(calculateConditionalFinancialTargetAssessment(fixture(),limits)).toMatchObject({status:'conditional',costCoverage:'not-evaluated',taxAssessment:'not-evaluated',gap:{value:{profitShortfall:r('170'),modeledCoverageShortfall:r('0')}},threshold:{status:'conditional',value:{requiredCreditedRevenue:r('1000')}},additionalCreditedRevenue:{status:'conditional',method:'linear-threshold',unit:'BRL',period:'month',value:r('200')}});
  });
  it('igualdade e excedente não criam pedido adicional negativo',()=>{
    for(const [creditedRevenue,slack]of [['1000','0'],['1200','170']] as const)expect(calculateConditionalFinancialTargetAssessment({...fixture(),creditedRevenue:r(creditedRevenue)},limits)).toMatchObject({status:'conditional',gap:{value:{signedTargetSlack:r(slack),reachesModeledTarget:true}},threshold:{value:{requiredCreditedRevenue:r('1000')}},additionalCreditedRevenue:{status:'conditional',method:'current-target-met',value:r('0')}});
  });
  it('equilíbrio exige repasse100 para cobrir déficit85',()=>{
    expect(calculateConditionalFinancialTargetAssessment({...fixture(),creditedRevenue:r('300'),targetProfit:r('0')},limits)).toMatchObject({status:'conditional',gap:{value:{profitShortfall:r('85'),modeledCoverageShortfall:r('85')}},threshold:{value:{requiredCreditedRevenue:r('400')}},additionalCreditedRevenue:{status:'conditional',value:r('100')}});
  });
  it('Gzero ou negativo conserva desvios e torna só a inversa indisponível',()=>{
    for(const [tax,profit]of [[r('9','10'),'-20'],[r('1'),'-30']] as const){
      const input={...fixture(),creditedRevenue:r('100'),fixedCosts:r('20'),usageCosts:r('0'),extraordinaryCosts:r('0'),fixedTaxes:r('0'),targetProfit:r('0'),revenueTaxRate:tax};
      const result=calculateConditionalFinancialTargetAssessment(input,limits);
      expect(result).toMatchObject({status:'conditional',gap:{status:'conditional',projection:{value:{netProfit:r(profit)}}},threshold:{status:'unavailable',code:'non-positive-revenue-factor'},additionalCreditedRevenue:{status:'unavailable',code:'threshold-unavailable'}});frozen(result);
      if(result.status!=='conditional')throw Error('Esperado resultado direto disponível');expect(result.additionalCreditedRevenue).not.toHaveProperty('value');
    }
  });
  it('modelo ausente não apaga lucro; zero só é conhecido quando alvo já foi atingido',()=>{
    const missing={...fixture(),model:undefined} as unknown as FinancialTargetAssessmentInput;
    expect(calculateConditionalFinancialTargetAssessment(missing,limits)).toMatchObject({status:'conditional',gap:{value:{profitShortfall:r('170')}},threshold:{status:'unavailable',code:'unsupported-model'},additionalCreditedRevenue:{status:'unavailable',code:'threshold-unavailable'}});
    expect(calculateConditionalFinancialTargetAssessment({...missing,creditedRevenue:r('1200')},limits)).toMatchObject({status:'conditional',costCoverage:'not-evaluated',threshold:{status:'unavailable'},additionalCreditedRevenue:{status:'conditional',method:'current-target-met',value:r('0')}});
  });
  it('sem receita, mantém fixos80 e margem indefinida, repasse requerido800/9',()=>{
    const input={...fixture(),creditedRevenue:r('0'),fixedCosts:r('80'),usageCosts:r('0'),extraordinaryCosts:r('0'),fixedTaxes:r('0'),targetProfit:r('0'),revenueTaxRate:r('0')};
    expect(calculateConditionalFinancialTargetAssessment(input,limits)).toMatchObject({status:'conditional',gap:{projection:{value:{netProfit:r('-80'),margin:{status:'unavailable',code:'zero-revenue'}}}},additionalCreditedRevenue:{status:'conditional',value:r('800','9')}});
  });
  it('política ou alvo inválidos preservam motivo e diagnóstico anteriores',()=>{
    expect(calculateConditionalFinancialTargetAssessment(fixture(),{maxInputLength:256,maxDigits:0})).toMatchObject({status:'unavailable',code:'invalid-budget',gap:null});
    expect(calculateConditionalFinancialTargetAssessment({...fixture(),targetProfit:r('-1')},limits)).toMatchObject({status:'unavailable',code:'gap-unavailable',gap:{status:'unavailable',code:'invalid-target'}});
  });
  it('snapshots repetíveis preservam IDs, fundamento e entradas mutáveis',()=>{
    const model={kind:'fixed-usage-linear' as const,reason:' hipótese literal '},creditedRevenue=r('800'),input={...fixture(),contextId:' contexto ',model,creditedRevenue},before=JSON.stringify(input),result=calculateConditionalFinancialTargetAssessment(input,limits);
    expect(calculateConditionalFinancialTargetAssessment(input,limits)).toEqual(result);frozen(result);expect(JSON.stringify(input)).toBe(before);expect(Object.isFrozen(input)).toBe(false);expect(Object.isFrozen(model)).toBe(false);expect(Object.isFrozen(creditedRevenue)).toBe(false);
    model.reason='alterada';creditedRevenue.numerator='0';expect(result).toMatchObject({status:'conditional',contextId:' contexto ',threshold:{model:{reason:' hipótese literal '}},additionalCreditedRevenue:{value:r('200')}});
  });
});
