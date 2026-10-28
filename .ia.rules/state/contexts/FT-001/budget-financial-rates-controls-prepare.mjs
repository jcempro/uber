/** MPL-2.0; preparo supervisor: conciliação de segmentos sem reduzir critérios. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.'),base='.ia.rules/state/contexts/FT-001/',prefix='budget-financial-rates-controls',target='src/domain/'+prefix+'.test.ts',hash=v=>crypto.createHash('sha256').update(v).digest('hex');
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
function read(p){guard(p);return fs.readFileSync(p,'utf8');}
const agents=read('AGENTS.md'),authority=read('.ia.rules/core/authority.md'),unit=read(base+prefix+'-unit.md'),source=read('src/domain/budget-financial-rates.ts'),accepted=read('src/domain/budget-financial-rates-immutability.test.ts'),input=read('src/domain/budget-financial-rates-input.test.ts');
if(hash(source)!=='b9bc2ccbe0a7245b5f79e3a3d6847f430e43601a0b70b94c30f44eb03a0b9da4'||hash(accepted)!=='3e370c6d460f70770946d5be41591601bd728eb57030fc521a819493cbc64eef')throw Error('accepted drift');
const old=JSON.parse(read(base+'budget-financial-rates-immutability-baseline.json')),report=JSON.parse(read(base+'budget-financial-rates-immutability-check.json')),tests=JSON.parse(read('.cache/budget-financial-rates-immutability-tests.json'));
if(report.tests.total!==395||report.tests.passed!==395||!tests.success||tests.numTotalTests!==395||tests.numPassedTests!==395||tests.testResults.length!==51)throw Error('accepted tests');
const files={...old.files,'src/domain/budget-financial-rates-immutability.test.ts':hash(accepted)};if(Object.keys(files).length!==98)throw Error('baseline size');for(const[p,h]of Object.entries(files))if(hash(read(p))!==h)throw Error('protected:'+p);
const testCounts=Object.fromEntries(tests.testResults.map(s=>[s.name.replaceAll('\\','/'),s.assertionResults.length]));for(const[name,count]of Object.entries(old.testCounts))if(!Number.isInteger(testCounts[name])||testCounts[name]<count)throw Error('lost suite');const baseline={sourceCommit:'cdb642d4868066c089081c6a2293fc55240e7eb5',priorTests:395,files,testCounts};
const rational=input.slice(input.indexOf('function r('),input.indexOf('function baseInput(')),fixture=input.slice(input.indexOf('function baseInput('),input.indexOf('const policy ='));if(!rational.startsWith('function r(')||!fixture.startsWith('function baseInput('))throw Error('fixture');
const scaffold=`import { describe, it, expect } from 'vitest';
import { calculateBudgetFinancialRates } from './budget-financial-rates';
import type { BudgetFinancialRatesInput, BudgetWorkingRateResult } from './budget-financial-rates';
import { convertBudgetCalendarAmount } from './budget-amount';
import type { BudgetAmountResult } from './budget-amount';
const policy = { maxInputLength: 256, maxDigits: 64 };
${rational}${fixture}function root(input: BudgetFinancialRatesInput) {
  const result = calculateBudgetFinancialRates(input, policy);
  if (result.status !== 'conditional') throw Error(result.reason);
  return result;
}
function readyAmount(result: BudgetAmountResult) {
  if (result.status !== 'ready') throw Error(result.reason);
  return result;
}
function readyWorking(result: BudgetWorkingRateResult) {
  if (result.status !== 'ready') throw Error(result.reason);
  return result;
}
describe('${prefix}', () => {
  it.todo('conversor canônico distingue dia de calendário e dia efetivo');
});
`;
const verifier=base+'maintenance-adoption-schema-verify.mjs';let gate=read(verifier);function replace(a,b){if(gate.split(a).length!==2)throw Error('gate match:'+a);gate=gate.replace(a,b);}
replace("immutabilityRates=requestedProfile==='rates-immutability',profile=coreRates||signedRates||missingRates||calendarRates||availabilityRates||inputRates||immutabilityRates?", "immutabilityRates=requestedProfile==='rates-immutability',controlsRates=requestedProfile==='rates-controls',profile=coreRates||signedRates||missingRates||calendarRates||availabilityRates||inputRates||immutabilityRates||controlsRates?");
replace('const prefix=immutabilityRates?',"const prefix=controlsRates?'budget-financial-rates-controls':immutabilityRates?");replace('unit=immutabilityRates?',"unit=controlsRates?'FT-003.40.4c.2i':immutabilityRates?");replace('requiredNew=calendarRates||', 'requiredNew=controlsRates?1:calendarRates||');
replace('(immutabilityRates?391:inputRates?', '(controlsRates?395:immutabilityRates?391:inputRates?');replace('(immutabilityRates?97:inputRates?', '(controlsRates?98:immutabilityRates?97:inputRates?');replace('(immutabilityRates?50:inputRates?', '(controlsRates?51:immutabilityRates?50:inputRates?');
replace("(immutabilityRates?'eadd1b5aaf8bde87a30b907db17274a44f1b0314'", "(controlsRates?'cdb642d4868066c089081c6a2293fc55240e7eb5':immutabilityRates?'eadd1b5aaf8bde87a30b907db17274a44f1b0314'");replace('testPath=immutabilityRates?',"testPath=controlsRates?'src/domain/budget-financial-rates-controls.test.ts':immutabilityRates?");replace('if(missingRates||calendarRates||availabilityRates||inputRates||immutabilityRates){const scaffold=', 'if(missingRates||calendarRates||availabilityRates||inputRates||immutabilityRates||controlsRates){const scaffold=');replace('limits:immutabilityRates?',"limits:controlsRates?'Controle canônico e agregado8arquivos/8grupos; aceite semântico e aplicativo pendentes. '+generated.limits:immutabilityRates?");
const minimums=Object.fromEntries([['',2],['-signed',2],['-missing',2],['-calendar',4],['-availability',4],['-input',4],['-immutability',4],['-controls',1]].map(([suffix,n])=>['src/domain/budget-financial-rates'+suffix+'.test.ts',n]));const pins=Object.fromEntries(Object.keys(minimums).filter(p=>p!==target).map(p=>[p,files[p]]));if(Object.values(pins).some(h=>!h))throw Error('reviewed pins');
const aggregateSetup=`const aggregateRates=profile==='rates'&&(controlsRates||requestedProfile==='rates'),rateTestMinimums=${JSON.stringify(minimums)},rateReviewedPins=${JSON.stringify(pins)},rateTestFiles=aggregateRates?{...rateReviewedPins,'${target}':hash(fs.readFileSync('${target}'))}:{};`;
replace("if(profile==='rates'&&generated.sourceSha256",aggregateSetup+"\nif(profile==='rates'&&generated.sourceSha256");
replace("function protect(){for(const [p,h]of Object.entries(snapshot.files))", "function protect(){for(const[p,h]of Object.entries(rateTestFiles)){guard(p);if(hash(fs.readFileSync(p))!==h)throw Error('reviewed rate test:'+p);}for(const [p,h]of Object.entries(snapshot.files))");
const oldSuite="const suite=tests.testResults.find(s=>s.name.replaceAll('\\\\','/').endsWith('/'+generated.testPath));";
const newSuite=`const rateSuites=aggregateRates?Object.entries(rateTestMinimums).map(([p,n])=>{const s=tests.testResults.find(s=>s.name.replaceAll('\\\\','/').endsWith('/'+p));if(!s||s.assertionResults.length<n||s.assertionResults.some(t=>t.status!=='passed'))throw Error('rate segment:'+p);return s;}):[];const suite=aggregateRates&&requestedProfile==='rates'?{assertionResults:rateSuites.flatMap(s=>s.assertionResults)}:tests.testResults.find(s=>s.name.replaceAll('\\\\','/').endsWith('/'+generated.testPath));`;
replace(oldSuite,newSuite);replace('files:{[generated.sourcePath]:generated.sourceSha256,[generated.testPath]:generated.testSha256}', 'files:{[generated.sourcePath]:generated.sourceSha256,[generated.testPath]:generated.testSha256,...rateTestFiles}');replace('protectedFiles:Object.keys(snapshot.files).length,limits:', 'protectedFiles:Object.keys(snapshot.files).length,rateAggregate:aggregateRates?{files:rateSuites.length,tests:rateSuites.reduce((n,s)=>n+s.assertionResults.length,0),reviewedPins:7,semanticReview:"supervisor"}:null,limits:');
const amount=read('src/domain/budget-amount.ts'),api=source.slice(source.indexOf('export interface BudgetFinancialRateContext'),source.indexOf('function unavailableWorking'))+'\n'+amount.slice(amount.indexOf('export type BudgetAmountContext'),amount.indexOf('/** Operando'));const rcf=read('RCF.md');if(hash(rcf)!=='b66b4ba23d82abbbfb4a9350b629ee3dff3b1c473d7ece2f6a329563190dbd65')throw Error('RCF drift');const lines=rcf.split(/\r?\n/),canonical=[103,151].map(n=>'RCF.md:'+n+' '+lines[n-1]).join('\n');
const context=['# Norma do alvo',agents,authority,'# Unidade exclusiva',unit,'# Arquivo pronto: prefixo protegido,substituir1it.todo',scaffold,'# API pública sem implementação',api,'# Fonte independente',canonical].join('\n\n');if(context.length>16000)throw Error('capacity');
const outputs=[[base+prefix+'-baseline.json',JSON.stringify(baseline,null,2)+'\n'],[base+prefix+'-context.txt',context],[base+prefix+'.skeleton',scaffold],[target,scaffold]];for(const[p]of outputs){guard(p);if(fs.existsSync(p))throw Error('exists:'+p);}
if(process.argv.includes('--preflight')){console.log(JSON.stringify({readOnly:true,chars:context.length,contextSha256:hash(context),protectedFiles:98,priorTests:395,aggregateMinimum:23,reviewedPins:7}));process.exit(0);}
for(const[p,v]of outputs)fs.writeFileSync(p,v);fs.writeFileSync(verifier,gate);console.log(JSON.stringify({chars:context.length,contextSha256:hash(context),scaffoldSha256:hash(scaffold),priorTests:395,protectedFiles:98,aggregateMinimum:23,reviewedPins:7}));
