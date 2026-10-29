/** MPL-2.0; FT-003.41.2a. Fixture explícita e extensão do gate integral existente. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.'),base='.ia.rules/state/contexts/FT-001/',prefix='financial-margin-target',target='src/domain/'+prefix+'.test.ts',hash=v=>crypto.createHash('sha256').update(v).digest('hex');
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
function read(p){guard(p);return fs.readFileSync(p,'utf8');}
const agents=read('AGENTS.md'),authority=read('.ia.rules/core/authority.md'),unit=read(base+prefix+'-tests-unit.md'),source=read('src/domain/'+prefix+'.ts'),baseline=JSON.parse(read(base+prefix+'-baseline.json'));
if(hash(source)!=='94dea5cd0393dbd2fd7dceec0737b027480fd32866c123bed501e7e05a721fcd'||baseline.priorTests!==396||Object.keys(baseline.files).length!==100||Object.keys(baseline.testCounts).length!==52)throw Error('accepted source/baseline');for(const[p,h]of Object.entries(baseline.files))if(hash(read(p))!==h)throw Error('protected:'+p);
const scaffold=`import { describe, it, expect } from 'vitest';
import { calculateFinancialMarginTarget } from './financial-margin-target';
import type { FinancialMarginTargetInput, FinancialMarginComparison } from './financial-margin-target';
const policy = { maxInputLength: 256, maxDigits: 64 };
function r(numerator: string, denominator = '1') { return {numerator,denominator}; }
function baseInput(): FinancialMarginTargetInput {
  return {kind:'projection',contextId:'synthetic-margin',period:'month',creditedRevenue:r('1000'),fixedCosts:r('300'),usageCosts:r('40'),extraordinaryCosts:r('0'),fixedTaxes:r('0'),titheRate:r('1','10'),revenueTaxRate:r('1','20'),requiredMarginPercent:r('50')};
}
function root(input: FinancialMarginTargetInput) {
  const result = calculateFinancialMarginTarget(input,policy);
  if (result.status !== 'conditional') throw Error(result.reason);
  expect(result.kind).toBe('projection');
  expect(result.contextId).toBe(input.contextId);
  expect(result.period).toBe(input.period);
  expect(result.financialAssessment).toBe('not-evaluated');
  expect(result.costCoverage).toBe('not-evaluated');
  expect(result.taxAssessment).toBe('not-evaluated');
  expect(result.projection.status).toBe('ready');
  expect(result.projection.financialAssessment).toBe('not-evaluated');
  return result;
}
function readyAssessment(result: FinancialMarginComparison) {
  if (result.status !== 'ready') throw Error(result.reason);
  return result;
}
function missingAssessment(result: FinancialMarginComparison) {
  if (result.status !== 'unavailable') throw Error('Margem deveria estar indisponível.');
  return result;
}
describe('financial-margin-target', () => {
  it.todo('margem modelada compara percentuais normalizados');
  it.todo('metas zero cem e acima de cem permanecem válidas');
  it.todo('receita zero mantém comparação de margem indisponível');
  it.todo('fator de receita não positivo não bloqueia avaliação direta');
});
`;
const verifier=base+'maintenance-adoption-schema-verify.mjs';let gate=read(verifier);function replace(a,b){if(gate.split(a).length!==2)throw Error('gate match:'+a);gate=gate.replace(a,b);}
replace("'effective-days','rates'].includes(profile)","'effective-days','rates','margin'].includes(profile)");replace('const prefix=controlsRates?',"const prefix=profile==='margin'?'financial-margin-target':controlsRates?");replace('unit=controlsRates?',"unit=profile==='margin'?'FT-003.41.2a':controlsRates?");replace('requiredNew=controlsRates?1:',"requiredNew=profile==='margin'?4:controlsRates?1:");
replace("if(profile==='period'&&", "if(profile==='margin'&&(snapshot.priorTests!==396||Object.keys(snapshot.files).length!==100||Object.keys(snapshot.testCounts).length!==52||snapshot.sourceCommit!=='fddd5bde12d2873c98490dd511a5617d4c2fcebc'))throw Error('margin baseline');\nif(profile==='period'&&");
replace("const generated=profile==='rates'?", "const generated=profile==='margin'?(()=>{const sourcePath='src/domain/financial-margin-target.ts',testPath='src/domain/financial-margin-target.test.ts';guard(sourcePath);guard(testPath);return {sourcePath,testPath,sourceSha256:hash(fs.readFileSync(sourcePath)),testSha256:hash(fs.readFileSync(testPath)),limits:'Comparação direta de margem projetada;falhas/imutabilidade adicionais eaceiteglobal pendentes.'};})():profile==='rates'?");
replace("if(profile==='rates'&&generated.sourceSha256", "if(profile==='margin'){if(generated.sourceSha256!=='94dea5cd0393dbd2fd7dceec0737b027480fd32866c123bed501e7e05a721fcd')throw Error('margin source drift');const scaffold=fs.readFileSync(base+prefix+'.test.skeleton','utf8'),code=fs.readFileSync(generated.testPath,'utf8');if(!code.startsWith(scaffold.slice(0,scaffold.indexOf(\"describe('financial-margin-target'\"))))throw Error('margin scaffold prefix drift');}\nif(profile==='rates'&&generated.sourceSha256");
replace('base+prefix+(coreRates?',"base+prefix+(profile==='margin'?'-tests-unit.md':coreRates?");
const api=source.slice(source.indexOf('export interface FinancialMarginTargetInput'),source.indexOf('function failure(')),rcf=read('RCF.md');if(hash(rcf)!=='b66b4ba23d82abbbfb4a9350b629ee3dff3b1c473d7ece2f6a329563190dbd65')throw Error('RCF drift');const canonical='RCF.md:164 '+rcf.split(/\r?\n/)[163];
const context=['# Norma do alvo',agents,authority,'# Unidade exclusiva',unit,'# Arquivo pronto: preservar prefixo/substituir4it.todo',scaffold,'# API pública sem implementação',api,'# Fonte independente',canonical].join('\n\n');if(context.length>21000)throw Error('capacity');const outputs=[[base+prefix+'-tests-context.txt',context],[base+prefix+'.test.skeleton',scaffold],[target,scaffold]];for(const[p]of outputs){guard(p);if(fs.existsSync(p))throw Error('exists:'+p);}
if(process.argv.includes('--preflight')){console.log(JSON.stringify({readOnly:true,chars:context.length,contextSha256:hash(context),protectedFiles:100,priorTests:396}));process.exit(0);}for(const[p,v]of outputs)fs.writeFileSync(p,v);fs.writeFileSync(verifier,gate);console.log(JSON.stringify({chars:context.length,contextSha256:hash(context),scaffoldSha256:hash(scaffold),protectedFiles:100,priorTests:396}));
