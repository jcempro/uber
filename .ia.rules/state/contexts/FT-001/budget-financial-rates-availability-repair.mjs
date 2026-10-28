/** MPL-2.0; FT-003.40.4c.2f.1. Guardas mecânicas de diagnósticos canônicos. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.'),base='.ia.rules/state/contexts/FT-001/',target='src/domain/budget-financial-rates-availability.test.ts',hash=v=>crypto.createHash('sha256').update(v).digest('hex');
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
function read(p){guard(p);return fs.readFileSync(p,'utf8');}
for(const p of ['AGENTS.md','.ia.rules/core/authority.md',base+'budget-financial-rates-availability-repair-unit.md'])read(p);
const baseline=JSON.parse(read(base+'budget-financial-rates-availability-baseline.json'));if(Object.keys(baseline.files).length!==95)throw Error('baseline');for(const[p,h]of Object.entries(baseline.files))if(hash(read(p))!==h)throw Error('accepted drift:'+p);
if(hash(read('src/domain/budget-financial-rates.ts'))!=='b9bc2ccbe0a7245b5f79e3a3d6847f430e43601a0b70b94c30f44eb03a0b9da4')throw Error('source drift');
const before=read(target),receipt=base+'budget-financial-rates-availability-repair-check.json';guard(receipt);
if(fs.existsSync(receipt)){const r=JSON.parse(read(receipt));if(hash(before)!==r.afterSha256)throw Error('applied drift');console.log(JSON.stringify({...r,alreadyApplied:true}));process.exit(0);}
if(hash(before)!=='df5057ed05156ef16cb882164ba2bd0b5c514ebbe8d2573e3844161a6cb3f6c9')throw Error('preimage');
const parts=before.split("  it('");if(parts.length!==5)throw Error('cases');
for(const[index,variable,callee,count]of [[2,'diagnostic','calculateMonthlyAvailability',2],[3,'diagnosticEffective','calculateEffectiveMonthlyWorkingDays',4],[4,'diagnosticScheduled','calculateScheduledBudgetDays',4]]){
  let body=parts[index];const lines=body.split('\n'),matching=lines.filter(s=>s.trim().startsWith(`const ${variable} = ${callee}(`));if(matching.length!==1)throw Error('call shape');const line=matching[0],indent=line.match(/^ */)[0];
  body=body.replace(line,line+`\n${indent}if (${variable}.status !== 'unavailable') throw Error('Diagnóstico canônico deveria estar indisponível.');`);
  let replaced=0;body=body.replace(/expect\((?:perWorkingDay|perConnectedHour)\.diagnostic\?\.(status|code)\)/g,(_m,field)=>{replaced++;return `expect(${variable}.${field})`;});if(replaced!==count)throw Error('expect count');parts[index]=body;
}
const after=parts.join("  it('"),marker="describe('budget-financial-rates-availability'",scaffold=read(base+'budget-financial-rates-availability.skeleton');if(!after.startsWith(scaffold.slice(0,scaffold.indexOf(marker)))||after.includes('?.'))throw Error('prefix/optional');
const r={schema:1,unit:'FT-003.40.4c.2f.1',beforeSha256:hash(before),afterSha256:hash(after),changes:'three unavailable guards for canonical diagnostics;10status/code assertions target guarded references; no optional chaining; no expectation changes',limits:'Somente4casos zero/inválido; demais grupos pendentes.'};
if(process.argv.includes('--preflight')){console.log(JSON.stringify({...r,readOnly:true}));process.exit(0);}
const backup=base+'budget-financial-rates-availability.failed-aea.test.ts.txt',report=base+'budget-financial-rates-availability-check.json',backupReport=base+'budget-financial-rates-availability.failed-aea.check.json';for(const p of [backup,report,backupReport])guard(p);if(fs.existsSync(backup)||fs.existsSync(backupReport))throw Error('backup exists');const reportBytes=fs.readFileSync(report);
fs.writeFileSync(backup,before);fs.writeFileSync(backupReport,reportBytes);fs.writeFileSync(target,after);fs.writeFileSync(receipt,JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));
