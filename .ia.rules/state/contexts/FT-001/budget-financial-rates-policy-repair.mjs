/** MPL-2.0; FT-003.40.4c.1a. Correção textual delimitada após revisão982; sem inferência. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.'),base='.ia.rules/state/contexts/FT-001/',target='src/domain/budget-financial-rates.ts',hash=v=>crypto.createHash('sha256').update(v).digest('hex');
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
for(const p of ['AGENTS.md','.ia.rules/core/authority.md',base+'budget-financial-rates-source-repair-unit.md',target]){guard(p);fs.readFileSync(p,'utf8');}
const before=fs.readFileSync(target,'utf8'),receipt=base+'budget-financial-rates-policy-repair-check.json';guard(receipt);
if(fs.existsSync(receipt)){const r=JSON.parse(fs.readFileSync(receipt));if(hash(before)!==r.afterSha256)throw Error('applied drift');console.log(JSON.stringify({...r,alreadyApplied:true}));process.exit(0);}
if(hash(before)!=='963069a37b44a8f239664e9b14fde58f7622561adbc518b46599140c3d15c6bb')throw Error('preimage');
const marker='export function calculateBudgetFinancialRates(',start=before.indexOf(marker),prefix=before.slice(0,start);let body=before.slice(start);
if((body.match(/,limits\)/g)||[]).length!==9)throw Error('call count');body=body.replaceAll(',limits)',',limitValidation.limits)');
const declaration='function finish(perWorkingDay:BudgetWorkingRateResult,perConnectedHour:BudgetWorkingRateResult):BudgetFinancialRatesResult {';
if(!body.includes(declaration)||!body.includes("source:identity as Extract<BudgetAmountResult,{status:'ready'}>"))throw Error('finish shape');
body=body.replace(declaration,'const finish=(perWorkingDay:BudgetWorkingRateResult,perConnectedHour:BudgetWorkingRateResult):BudgetFinancialRatesResult => {').replace("source:identity as Extract<BudgetAmountResult,{status:'ready'}>",'source:identity');
const close='    });\n  }\n\n  // 6.';if(!body.includes(close))throw Error('finish close');body=body.replace(close,'    });\n  };\n\n  // 6.');
// Remove somente comentários que ecoam instruções; mantém comportamento e contrato fora da função.
body=body.split('\n').filter(line=>!/^  \/\/ \d+\./.test(line)).join('\n');const after=prefix+body;
if(process.argv.includes('--preflight')){console.log(JSON.stringify({beforeSha256:hash(before),afterSha256:hash(after),calls:9,readOnly:true}));process.exit(0);}
const backup=base+'budget-financial-rates.received-982.ts.txt',oldReport=base+'budget-financial-rates-source-check.json',reportBackup=base+'budget-financial-rates.received-982.check.json';for(const p of [backup,oldReport,reportBackup])guard(p);if(fs.existsSync(backup)||fs.existsSync(reportBackup))throw Error('backup exists');const reportData=fs.readFileSync(oldReport);fs.writeFileSync(backup,before);fs.writeFileSync(reportBackup,reportData);fs.writeFileSync(target,after);const r={schema:1,unit:'FT-003.40.4c.1a',beforeSha256:hash(before),afterSha256:hash(after),changes:'9calls use validated limit snapshot; finish arrow preserves narrowing without cast; remove copied instructions',limits:'Sem alteração de álgebra; comportamento ainda pendente.'};fs.writeFileSync(receipt,JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));
