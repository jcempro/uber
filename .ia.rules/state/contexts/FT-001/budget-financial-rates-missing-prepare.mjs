/** MPL-2.0; preparo supervisor: scaffold derivado de teste aceito e extensão de gate. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.'),base='.ia.rules/state/contexts/FT-001/',prefix='budget-financial-rates-missing',target='src/domain/'+prefix+'.test.ts',hash=v=>crypto.createHash('sha256').update(v).digest('hex');
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
function read(p){guard(p);return fs.readFileSync(p,'utf8');}
const agents=read('AGENTS.md'),authority=read('.ia.rules/core/authority.md'),unit=read(base+prefix+'-unit.md'),source=read('src/domain/budget-financial-rates.ts'),core=read('src/domain/budget-financial-rates.test.ts'),signed=read('src/domain/budget-financial-rates-signed.test.ts');
if(hash(source)!=='b9bc2ccbe0a7245b5f79e3a3d6847f430e43601a0b70b94c30f44eb03a0b9da4'||hash(core)!=='7fb27476a464ef3837c2026a1a2c929c65a7865c3f16d9461e63a1626916e858'||hash(signed)!=='6d0a826ac187bd03a5251be625a4add439571f669caecd5bc5cf7d0d617fd838')throw Error('accepted drift');
const old=JSON.parse(read(base+'budget-financial-rates-signed-baseline.json')),report=JSON.parse(read(base+'budget-financial-rates-signed-check.json')),tests=JSON.parse(read('.cache/budget-financial-rates-signed-tests.json'));
if(report.tests.total!==377||report.tests.passed!==377||!tests.success||tests.numTotalTests!==377||tests.numPassedTests!==377||tests.testResults.length!==46)throw Error('accepted tests');
const files={...old.files,'src/domain/budget-financial-rates-signed.test.ts':hash(signed)};if(Object.keys(files).length!==93)throw Error('baseline size');for(const[p,h]of Object.entries(files))if(hash(read(p))!==h)throw Error('protected:'+p);
const testCounts=Object.fromEntries(tests.testResults.map(s=>[s.name.replaceAll('\\','/'),s.assertionResults.length]));for(const[name,count]of Object.entries(old.testCounts))if(!Number.isInteger(testCounts[name])||testCounts[name]<count)throw Error('lost suite');
const baseline={sourceCommit:'23e20b6b5ad1cc382a939e6b7066f46971b9e506',priorTests:377,files,testCounts};
const marker="describe('budget-financial-rates', () => {",preamble=core.slice(0,core.indexOf(marker)),fixture=core.match(/    const input: BudgetFinancialRatesInput = (\{[\s\S]*?\n    \});/);
if(!preamble||!fixture)throw Error('scaffold extraction');
const scaffold=preamble+'function baseInput(): BudgetFinancialRatesInput {\n  return '+fixture[1]+";\n}\n\ndescribe('budget-financial-rates-missing', () => {\n  it.todo('horas ausentes bloqueiam apenas taxa horária');\n  it.todo('meses por ano ausentes bloqueiam apenas montante anual');\n});\n";
const verifier=base+'maintenance-adoption-schema-verify.mjs';let gate=read(verifier);function replace(a,b){if(gate.split(a).length!==2)throw Error('gate match:'+a);gate=gate.replace(a,b);}
replace("signedRates=requestedProfile==='rates-signed',profile=coreRates||signedRates?", "signedRates=requestedProfile==='rates-signed',missingRates=requestedProfile==='rates-missing',profile=coreRates||signedRates||missingRates?");
replace("const prefix=signedRates?", "const prefix=missingRates?'budget-financial-rates-missing':signedRates?");
replace("unit=signedRates?", "unit=missingRates?'FT-003.40.4c.2d':signedRates?");
replace('requiredNew=coreRates||signedRates?2:', 'requiredNew=coreRates||signedRates||missingRates?2:');
replace('(signedRates?375:373)', '(missingRates?377:signedRates?375:373)');replace('(signedRates?92:91)', '(missingRates?93:signedRates?92:91)');replace('(signedRates?45:44)', '(missingRates?46:signedRates?45:44)');
replace("(signedRates?'ecd74cd39c8fb75eead03835c7d366eb7f5c01c4'", "(missingRates?'23e20b6b5ad1cc382a939e6b7066f46971b9e506':signedRates?'ecd74cd39c8fb75eead03835c7d366eb7f5c01c4'");
replace("testPath=signedRates?", "testPath=missingRates?'src/domain/budget-financial-rates-missing.test.ts':signedRates?");
replace("if(profile==='rates'&&generated.sourceSha256", "if(missingRates){const scaffold=fs.readFileSync(base+prefix+'.skeleton','utf8'),code=fs.readFileSync(generated.testPath,'utf8');if(!code.startsWith(scaffold.slice(0,scaffold.indexOf(\"describe('budget-financial-rates-missing'\"))))throw Error('scaffold prefix drift');}\nif(profile==='rates'&&generated.sourceSha256");
replace("limits:signedRates?", "limits:missingRates?'Somente2casos h/M ausentes; demais grupos e aceite integral pendentes. '+generated.limits:signedRates?");
const amount=read('src/domain/budget-amount.ts'),api=source.slice(source.indexOf('export interface BudgetFinancialRateContext'),source.indexOf('function unavailableWorking'))+'\n'+amount.slice(amount.indexOf('export type BudgetAmountContext'),amount.indexOf('/** Operando'));
const rcf=read('RCF.md');if(hash(rcf)!=='b66b4ba23d82abbbfb4a9350b629ee3dff3b1c473d7ece2f6a329563190dbd65')throw Error('RCF drift');const lines=rcf.split(/\r?\n/),canonical=[103,151].map(n=>'RCF.md:'+n+' '+lines[n-1]).join('\n');
const context=['# Norma do alvo',agents,authority,'# Unidade exclusiva',unit,'# Arquivo pronto: preservar prefixo e substituir somente it.todo',scaffold,'# API pública (sem implementação)',api,'# Fonte independente',canonical].join('\n\n');if(context.length>18000)throw Error('capacity');
const outputs=[[base+prefix+'-baseline.json',JSON.stringify(baseline,null,2)+'\n'],[base+prefix+'-context.txt',context],[base+prefix+'.skeleton',scaffold],[target,scaffold]];for(const[p]of outputs){guard(p);if(fs.existsSync(p))throw Error('exists:'+p);}
if(process.argv.includes('--preflight')){console.log(JSON.stringify({readOnly:true,chars:context.length,contextSha256:hash(context),protectedFiles:93,priorTests:377}));process.exit(0);}
for(const[p,v]of outputs)fs.writeFileSync(p,v);fs.writeFileSync(verifier,gate);console.log(JSON.stringify({chars:context.length,contextSha256:hash(context),scaffoldSha256:hash(scaffold),priorTests:377,protectedFiles:93}));
