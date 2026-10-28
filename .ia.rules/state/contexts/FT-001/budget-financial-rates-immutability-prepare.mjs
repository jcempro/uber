/** MPL-2.0; preparo supervisor: guardas e fixtures mutáveis sem casts. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.'),base='.ia.rules/state/contexts/FT-001/',prefix='budget-financial-rates-immutability',target='src/domain/'+prefix+'.test.ts',hash=v=>crypto.createHash('sha256').update(v).digest('hex');
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
function read(p){guard(p);return fs.readFileSync(p,'utf8');}
const agents=read('AGENTS.md'),authority=read('.ia.rules/core/authority.md'),unit=read(base+prefix+'-unit.md'),source=read('src/domain/budget-financial-rates.ts'),accepted=read('src/domain/budget-financial-rates-input.test.ts'),core=read('src/domain/budget-financial-rates.test.ts'),availability=read('src/domain/budget-financial-rates-availability.test.ts');
if(hash(source)!=='b9bc2ccbe0a7245b5f79e3a3d6847f430e43601a0b70b94c30f44eb03a0b9da4'||hash(accepted)!=='e416914b32ef869376b24a276b4e5f04d7ee42151d64870fb68fd3da14ddba99'||hash(core)!=='7fb27476a464ef3837c2026a1a2c929c65a7865c3f16d9461e63a1626916e858')throw Error('accepted drift');
const old=JSON.parse(read(base+'budget-financial-rates-input-baseline.json')),report=JSON.parse(read(base+'budget-financial-rates-input-check.json')),tests=JSON.parse(read('.cache/budget-financial-rates-input-tests.json'));
if(report.tests.total!==391||report.tests.passed!==391||!tests.success||tests.numTotalTests!==391||tests.numPassedTests!==391||tests.testResults.length!==50)throw Error('accepted tests');
const files={...old.files,'src/domain/budget-financial-rates-input.test.ts':hash(accepted)};if(Object.keys(files).length!==97)throw Error('baseline size');for(const[p,h]of Object.entries(files))if(hash(read(p))!==h)throw Error('protected:'+p);
const testCounts=Object.fromEntries(tests.testResults.map(s=>[s.name.replaceAll('\\','/'),s.assertionResults.length]));for(const[name,count]of Object.entries(old.testCounts))if(!Number.isInteger(testCounts[name])||testCounts[name]<count)throw Error('lost suite');
const baseline={sourceCommit:'eadd1b5aaf8bde87a30b907db17274a44f1b0314',priorTests:391,files,testCounts};
let preamble=core.slice(0,core.indexOf("describe('budget-financial-rates',"));if(!preamble)throw Error('core extraction');
preamble=preamble.replace("import type { BudgetPeriod } from './model';", "import type { BudgetPeriod } from './model';\nimport type { ExactLimits } from './exact-budget';\nimport { convertBudgetCalendarAmount } from './budget-amount';\nconst policy = { maxInputLength: 256, maxDigits: 64 };");
preamble=preamble.replace('function root(input: BudgetFinancialRatesInput)', 'function root(input: BudgetFinancialRatesInput, limits: ExactLimits = policy)').replace('calculateBudgetFinancialRates(input, { maxInputLength: 256, maxDigits: 64 })','calculateBudgetFinancialRates(input, limits)');
let fixture=accepted.slice(accepted.indexOf('function baseInput('),accepted.indexOf('const policy ='));if(!fixture.startsWith('function baseInput(')||fixture.split('    };').length!==2)throw Error('fixture extraction');fixture=fixture.replace('function baseInput(): BudgetFinancialRatesInput','function mutableInput()').replace('    };','    } satisfies BudgetFinancialRatesInput;');
const common=availability.slice(availability.indexOf('function verifyBaseResult('),availability.indexOf("describe('budget-financial-rates-availability',"));if(!common.startsWith('function verifyBaseResult('))throw Error('common extraction');
const helpers=`function assertDeepFrozen(value: unknown) {
  if (value !== null && typeof value === 'object') {
    expect(Object.isFrozen(value)).toBe(true);
    for (const nested of Object.values(value)) assertDeepFrozen(nested);
  }
}

function unavailable(input: BudgetFinancialRatesInput, limits: ExactLimits) {
  const result = calculateBudgetFinancialRates(input, limits);
  if (result.status !== 'unavailable') throw Error('Resultado deveria estar indisponível.');
  return result;
}

function sourceFailure(result: ReturnType<typeof unavailable>) {
  const source = result.source;
  if (source === null || source.status !== 'unavailable') throw Error('Origem deveria conter diagnóstico.');
  return source;
}

function canonicalSource(input: BudgetFinancialRatesInput, limits: ExactLimits) {
  const result = convertBudgetCalendarAmount(input.amount, input.sourcePeriod, input.sourcePeriod, input.calendar, limits);
  if (result.status !== 'unavailable') throw Error('Origem canônica deveria ser rejeitada.');
  return result;
}

`;
const names=['resultado pronto congela cópias sem congelar entrada','falhas e diagnósticos aninhados também são congelados','política é lida uma vez e reutilizada como snapshot','orçamento insuficiente preserva falha técnica da origem'];const scaffold=preamble+fixture+common+helpers+`describe('${prefix}', () => {\n`+names.map(n=>`  it.todo('${n}');`).join('\n')+'\n});\n';
const verifier=base+'maintenance-adoption-schema-verify.mjs';let gate=read(verifier);function replace(a,b){if(gate.split(a).length!==2)throw Error('gate match:'+a);gate=gate.replace(a,b);}
replace("inputRates=requestedProfile==='rates-input',profile=coreRates||signedRates||missingRates||calendarRates||availabilityRates||inputRates?", "inputRates=requestedProfile==='rates-input',immutabilityRates=requestedProfile==='rates-immutability',profile=coreRates||signedRates||missingRates||calendarRates||availabilityRates||inputRates||immutabilityRates?");
replace('const prefix=inputRates?',"const prefix=immutabilityRates?'budget-financial-rates-immutability':inputRates?");replace('unit=inputRates?',"unit=immutabilityRates?'FT-003.40.4c.2h':inputRates?");replace('requiredNew=calendarRates||availabilityRates||inputRates?4:', 'requiredNew=calendarRates||availabilityRates||inputRates||immutabilityRates?4:');
replace('(inputRates?387:availabilityRates?', '(immutabilityRates?391:inputRates?387:availabilityRates?');replace('(inputRates?96:availabilityRates?', '(immutabilityRates?97:inputRates?96:availabilityRates?');replace('(inputRates?49:availabilityRates?', '(immutabilityRates?50:inputRates?49:availabilityRates?');
replace("(inputRates?'493bb1aa87db340eabe017cf4d63945dee72a21b'", "(immutabilityRates?'eadd1b5aaf8bde87a30b907db17274a44f1b0314':inputRates?'493bb1aa87db340eabe017cf4d63945dee72a21b'");replace('testPath=inputRates?',"testPath=immutabilityRates?'src/domain/budget-financial-rates-immutability.test.ts':inputRates?");replace('if(missingRates||calendarRates||availabilityRates||inputRates){const scaffold=', 'if(missingRates||calendarRates||availabilityRates||inputRates||immutabilityRates){const scaffold=');replace('limits:inputRates?',"limits:immutabilityRates?'Somente4propriedades freeze/snapshot/política/recurso; aceite integral e aplicativo pendentes. '+generated.limits:inputRates?");
const amount=read('src/domain/budget-amount.ts'),api=source.slice(source.indexOf('export interface BudgetFinancialRateContext'),source.indexOf('function unavailableWorking'))+'\n'+amount.slice(amount.indexOf('export type BudgetAmountContext'),amount.indexOf('/** Operando'));
const rcf=read('RCF.md');if(hash(rcf)!=='b66b4ba23d82abbbfb4a9350b629ee3dff3b1c473d7ece2f6a329563190dbd65')throw Error('RCF drift');const lines=rcf.split(/\r?\n/),canonical=[103,151].map(n=>'RCF.md:'+n+' '+lines[n-1]).join('\n');
const context=['# Norma do alvo',agents,authority,'# Unidade exclusiva',unit,'# Arquivo pronto: prefixo protegido,substituir4it.todo',scaffold,'# API pública sem implementação',api,'# Fonte independente',canonical].join('\n\n');if(context.length>23000)throw Error('capacity');
const outputs=[[base+prefix+'-baseline.json',JSON.stringify(baseline,null,2)+'\n'],[base+prefix+'-context.txt',context],[base+prefix+'.skeleton',scaffold],[target,scaffold]];for(const[p]of outputs){guard(p);if(fs.existsSync(p))throw Error('exists:'+p);}
if(process.argv.includes('--preflight')){console.log(JSON.stringify({readOnly:true,chars:context.length,contextSha256:hash(context),protectedFiles:97,priorTests:391}));process.exit(0);}
for(const[p,v]of outputs)fs.writeFileSync(p,v);fs.writeFileSync(verifier,gate);console.log(JSON.stringify({chars:context.length,contextSha256:hash(context),scaffoldSha256:hash(scaffold),priorTests:391,protectedFiles:97}));
