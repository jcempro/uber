/** MPL-2.0; preparo supervisor: fronteiras tipadas de fixtures inválidas. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.'),base='.ia.rules/state/contexts/FT-001/',prefix='budget-financial-rates-input',target='src/domain/'+prefix+'.test.ts',hash=v=>crypto.createHash('sha256').update(v).digest('hex');
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
function read(p){guard(p);return fs.readFileSync(p,'utf8');}
const agents=read('AGENTS.md'),authority=read('.ia.rules/core/authority.md'),unit=read(base+prefix+'-unit.md'),source=read('src/domain/budget-financial-rates.ts'),accepted=read('src/domain/budget-financial-rates-availability.test.ts'),calendar=read('src/domain/budget-financial-rates-calendar.test.ts');
if(hash(source)!=='b9bc2ccbe0a7245b5f79e3a3d6847f430e43601a0b70b94c30f44eb03a0b9da4'||hash(accepted)!=='a02db9815fbeb29f8f6ec25ec18e4deba8afcb1d439040d2ed0637c4a375b212')throw Error('accepted drift');
const old=JSON.parse(read(base+'budget-financial-rates-availability-baseline.json')),report=JSON.parse(read(base+'budget-financial-rates-availability-check.json')),tests=JSON.parse(read('.cache/budget-financial-rates-availability-tests.json'));
if(report.tests.total!==387||report.tests.passed!==387||!tests.success||tests.numTotalTests!==387||tests.numPassedTests!==387||tests.testResults.length!==49)throw Error('accepted tests');
const files={...old.files,'src/domain/budget-financial-rates-availability.test.ts':hash(accepted)};if(Object.keys(files).length!==96)throw Error('baseline size');for(const[p,h]of Object.entries(files))if(hash(read(p))!==h)throw Error('protected:'+p);
const testCounts=Object.fromEntries(tests.testResults.map(s=>[s.name.replaceAll('\\','/'),s.assertionResults.length]));for(const[name,count]of Object.entries(old.testCounts))if(!Number.isInteger(testCounts[name])||testCounts[name]<count)throw Error('lost suite');
const baseline={sourceCommit:'493bb1aa87db340eabe017cf4d63945dee72a21b',priorTests:387,files,testCounts};
const rational=calendar.slice(calendar.indexOf('function r('),calendar.indexOf('function root(')),fixture=calendar.slice(calendar.indexOf('function baseInput('),calendar.indexOf('function verifyUnavailableWorking('));if(!rational.startsWith('function r(')||!fixture.startsWith('function baseInput('))throw Error('fixture extraction');
const preamble=`import { describe, it, expect } from 'vitest';
import { calculateBudgetFinancialRates } from './budget-financial-rates';
import type { BudgetFinancialRatesInput } from './budget-financial-rates';
import { inspectExactLimits } from './exact-budget';
import type { ExactLimits } from './exact-budget';
import { convertBudgetCalendarAmount } from './budget-amount';

${rational}${fixture}const policy = { maxInputLength: 256, maxDigits: 64 };

// Únicos casts: fronteira de fixtures inválidas; nenhum cast de resultado.
function invoke(input: unknown, limits: unknown = policy) {
  const result = calculateBudgetFinancialRates(input as BudgetFinancialRatesInput, limits as ExactLimits);
  if (result.status !== 'unavailable') throw Error('Entrada deveria ser rejeitada.');
  return result;
}

function canonicalSource(input: unknown) {
  const candidate = input as BudgetFinancialRatesInput;
  const result = convertBudgetCalendarAmount(candidate.amount, candidate.sourcePeriod, candidate.sourcePeriod, candidate.calendar, policy);
  if (result.status !== 'unavailable') throw Error('Origem canônica deveria ser rejeitada.');
  return result;
}

function invalidPolicyReason(limits: unknown) {
  const result = inspectExactLimits(limits);
  if (result.valid) throw Error('Política deveria ser rejeitada.');
  return result.reason;
}

`;
const names=['política inválida preserva motivo e não calcula origem','entrada não suportada não gera origem financeira','quantia ou período inválido preserva diagnóstico da origem','calendário não suportado preserva diagnóstico da origem'];const scaffold=preamble+`describe('${prefix}', () => {\n`+names.map(n=>`  it.todo('${n}');`).join('\n')+'\n});\n';
const verifier=base+'maintenance-adoption-schema-verify.mjs';let gate=read(verifier);function replace(a,b){if(gate.split(a).length!==2)throw Error('gate match:'+a);gate=gate.replace(a,b);}
replace("availabilityRates=requestedProfile==='rates-availability',profile=coreRates||signedRates||missingRates||calendarRates||availabilityRates?", "availabilityRates=requestedProfile==='rates-availability',inputRates=requestedProfile==='rates-input',profile=coreRates||signedRates||missingRates||calendarRates||availabilityRates||inputRates?");
replace('const prefix=availabilityRates?',"const prefix=inputRates?'budget-financial-rates-input':availabilityRates?");replace('unit=availabilityRates?',"unit=inputRates?'FT-003.40.4c.2g':availabilityRates?");replace('requiredNew=calendarRates||availabilityRates?4:', 'requiredNew=calendarRates||availabilityRates||inputRates?4:');
replace('(availabilityRates?383:calendarRates?', '(inputRates?387:availabilityRates?383:calendarRates?');replace('(availabilityRates?95:calendarRates?', '(inputRates?96:availabilityRates?95:calendarRates?');replace('(availabilityRates?48:calendarRates?', '(inputRates?49:availabilityRates?48:calendarRates?');
replace("(availabilityRates?'aba9a0c6fb8be5a3a7b4f175c5bf705d396805d2'", "(inputRates?'493bb1aa87db340eabe017cf4d63945dee72a21b':availabilityRates?'aba9a0c6fb8be5a3a7b4f175c5bf705d396805d2'");replace('testPath=availabilityRates?',"testPath=inputRates?'src/domain/budget-financial-rates-input.test.ts':availabilityRates?");replace('if(missingRates||calendarRates||availabilityRates){const scaffold=', 'if(missingRates||calendarRates||availabilityRates||inputRates){const scaffold=');replace('limits:availabilityRates?',"limits:inputRates?'Somente4grupos de rejeição de entrada/política; demais grupos e aceite integral pendentes. '+generated.limits:availabilityRates?");
const amount=read('src/domain/budget-amount.ts'),api=source.slice(source.indexOf('export interface BudgetFinancialRateContext'),source.indexOf('function unavailableWorking'))+'\n'+amount.slice(amount.indexOf('export type BudgetAmountContext'),amount.indexOf('/** Operando'));
const rcf=read('RCF.md');if(hash(rcf)!=='b66b4ba23d82abbbfb4a9350b629ee3dff3b1c473d7ece2f6a329563190dbd65')throw Error('RCF drift');const lines=rcf.split(/\r?\n/),canonical=[103,151].map(n=>'RCF.md:'+n+' '+lines[n-1]).join('\n');
const context=['# Norma do alvo',agents,authority,'# Unidade exclusiva',unit,'# Arquivo pronto: prefixo protegido,substituir4it.todo',scaffold,'# API pública sem implementação',api,'# Fonte independente',canonical].join('\n\n');if(context.length>20000)throw Error('capacity');
const outputs=[[base+prefix+'-baseline.json',JSON.stringify(baseline,null,2)+'\n'],[base+prefix+'-context.txt',context],[base+prefix+'.skeleton',scaffold],[target,scaffold]];for(const[p]of outputs){guard(p);if(fs.existsSync(p))throw Error('exists:'+p);}
if(process.argv.includes('--preflight')){console.log(JSON.stringify({readOnly:true,chars:context.length,contextSha256:hash(context),protectedFiles:96,priorTests:387}));process.exit(0);}
for(const[p,v]of outputs)fs.writeFileSync(p,v);fs.writeFileSync(verifier,gate);console.log(JSON.stringify({chars:context.length,contextSha256:hash(context),scaffoldSha256:hash(scaffold),priorTests:387,protectedFiles:96}));
