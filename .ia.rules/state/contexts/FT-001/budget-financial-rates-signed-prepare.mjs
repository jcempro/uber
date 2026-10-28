/** MPL-2.0; preparo supervisor: extensão de perfil, contexto seletivo e baseline aceito. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.'),base='.ia.rules/state/contexts/FT-001/',prefix='budget-financial-rates-signed',hash=v=>crypto.createHash('sha256').update(v).digest('hex');
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
function read(p){guard(p);return fs.readFileSync(p,'utf8');}
const agents=read('AGENTS.md'),authority=read('.ia.rules/core/authority.md'),unit=read(base+prefix+'-unit.md');
const source=read('src/domain/budget-financial-rates.ts'),core=read('src/domain/budget-financial-rates.test.ts');
if(hash(source)!=='b9bc2ccbe0a7245b5f79e3a3d6847f430e43601a0b70b94c30f44eb03a0b9da4'||hash(core)!=='7fb27476a464ef3837c2026a1a2c929c65a7865c3f16d9461e63a1626916e858')throw Error('accepted drift');
const old=JSON.parse(read(base+'budget-financial-rates-baseline.json')),report=JSON.parse(read(base+'budget-financial-rates-check.json')),tests=JSON.parse(read('.cache/budget-financial-rates-tests.json'));
if(report.tests.total!==375||report.tests.passed!==375||!tests.success||tests.numTotalTests!==375||tests.numPassedTests!==375||tests.testResults.length!==45)throw Error('accepted tests');
const files={...old.files,'src/domain/budget-financial-rates.test.ts':hash(core)};if(Object.keys(files).length!==92)throw Error('baseline size');
for(const[p,h]of Object.entries(files))if(hash(read(p))!==h)throw Error('protected:'+p);
const testCounts=Object.fromEntries(tests.testResults.map(s=>[s.name.replaceAll('\\','/'),s.assertionResults.length]));
for(const[name,count]of Object.entries(old.testCounts))if(!Number.isInteger(testCounts[name])||testCounts[name]<count)throw Error('lost suite');
const baseline={sourceCommit:'ecd74cd39c8fb75eead03835c7d366eb7f5c01c4',priorTests:375,files,testCounts};
const verifier=base+'maintenance-adoption-schema-verify.mjs';let gate=read(verifier);
function replace(a,b){if(gate.split(a).length!==2)throw Error('gate match:'+a);gate=gate.replace(a,b);}
replace("coreRates=requestedProfile==='rates-core',profile=coreRates?'rates':requestedProfile", "coreRates=requestedProfile==='rates-core',signedRates=requestedProfile==='rates-signed',profile=coreRates||signedRates?'rates':requestedProfile");
replace("const prefix=profile==='rates'?", "const prefix=signedRates?'budget-financial-rates-signed':profile==='rates'?");
replace("unit=coreRates?'FT-003.40.4c.2a'", "unit=signedRates?'FT-003.40.4c.2c':coreRates?'FT-003.40.4c.2a'");
replace('requiredNew=coreRates?2:', 'requiredNew=coreRates||signedRates?2:');
replace("snapshot.priorTests!==373||Object.keys(snapshot.files).length!==91||Object.keys(snapshot.testCounts).length!==44||snapshot.sourceCommit!=='49d08de7307f1960caff2c4a1c4400ca25bafab6'", "snapshot.priorTests!==(signedRates?375:373)||Object.keys(snapshot.files).length!==(signedRates?92:91)||Object.keys(snapshot.testCounts).length!==(signedRates?45:44)||snapshot.sourceCommit!==(signedRates?'ecd74cd39c8fb75eead03835c7d366eb7f5c01c4':'49d08de7307f1960caff2c4a1c4400ca25bafab6')");
replace("testPath='src/domain/budget-financial-rates.test.ts'", "testPath=signedRates?'src/domain/budget-financial-rates-signed.test.ts':'src/domain/budget-financial-rates.test.ts'");
replace("limits:coreRates?'Somente2casos centrais", "limits:signedRates?'Somente2casos de sinal/origem diária; demais grupos e aceite integral pendentes. '+generated.limits:coreRates?'Somente2casos centrais");
const amountSource=read('src/domain/budget-amount.ts');
const api=source.slice(source.indexOf('export interface BudgetFinancialRateContext'),source.indexOf('function unavailableWorking'))+'\n'+source.split(/\r?\n/).find(s=>s.startsWith('export function calculateBudgetFinancialRates'))+'\n}\n'+amountSource.slice(amountSource.indexOf('export type BudgetAmountResult'),amountSource.indexOf('/** Operando'));
const rcf=read('RCF.md');if(hash(rcf)!=='b66b4ba23d82abbbfb4a9350b629ee3dff3b1c473d7ece2f6a329563190dbd65')throw Error('RCF drift');
const lines=rcf.split(/\r?\n/),canonical=[103,151].map(n=>'RCF.md:'+n+' '+lines[n-1]).join('\n');
const context=['# Norma do alvo',agents,authority,'# Unidade exclusiva',unit,'# API pública (sem implementação)',api,'# Fonte canônica independente',canonical].join('\n\n');
if(context.length>17000)throw Error('context capacity');
for(const p of [base+prefix+'-baseline.json',base+prefix+'-context.txt']){guard(p);if(fs.existsSync(p))throw Error('exists:'+p);}
guard('src/domain/budget-financial-rates-signed.test.ts');if(fs.existsSync('src/domain/budget-financial-rates-signed.test.ts'))throw Error('target exists');
if(process.argv.includes('--preflight')){console.log(JSON.stringify({readOnly:true,chars:context.length,contextSha256:hash(context),protectedFiles:92,priorTests:375}));process.exit(0);}
fs.writeFileSync(base+prefix+'-baseline.json',JSON.stringify(baseline,null,2)+'\n');fs.writeFileSync(base+prefix+'-context.txt',context);fs.writeFileSync(verifier,gate);
console.log(JSON.stringify({chars:context.length,contextSha256:hash(context),protectedFiles:92,priorTests:375,gateSha256:hash(gate)}));
