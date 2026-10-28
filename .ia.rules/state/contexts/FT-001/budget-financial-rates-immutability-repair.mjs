/** MPL-2.0; FT-003.40.4c.2h.1. Patch textual de retornos e níveis de diagnóstico. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.'),base='.ia.rules/state/contexts/FT-001/',target='src/domain/budget-financial-rates-immutability.test.ts',hash=v=>crypto.createHash('sha256').update(v).digest('hex');
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
function read(p){guard(p);return fs.readFileSync(p,'utf8');}
for(const p of ['AGENTS.md','.ia.rules/core/authority.md',base+'budget-financial-rates-immutability-repair-unit.md'])read(p);
const baseline=JSON.parse(read(base+'budget-financial-rates-immutability-baseline.json'));if(Object.keys(baseline.files).length!==97)throw Error('baseline');for(const[p,h]of Object.entries(baseline.files))if(hash(read(p))!==h)throw Error('accepted drift:'+p);
if(hash(read('src/domain/budget-financial-rates.ts'))!=='b9bc2ccbe0a7245b5f79e3a3d6847f430e43601a0b70b94c30f44eb03a0b9da4')throw Error('source drift');
const before=read(target),receipt=base+'budget-financial-rates-immutability-repair-check.json';guard(receipt);
if(fs.existsSync(receipt)){const r=JSON.parse(read(receipt));if(hash(before)!==r.afterSha256)throw Error('applied drift');console.log(JSON.stringify({...r,alreadyApplied:true}));process.exit(0);}
if(hash(before)!=='c9ed16b88817061fbd868ce73e0577ef3ef0c41c69779a6daf3ffe8fb59652bf')throw Error('preimage');let after=before;
function replace(a,b,count){if(after.split(a).length-1!==count)throw Error('match:'+a);after=after.replaceAll(a,b);}
replace('    verifyWorkingRate(result.perWorkingDay);','    const day = verifyWorkingRate(result.perWorkingDay);',2);replace('    verifyWorkingRate(result.perConnectedHour);','    const hour = verifyWorkingRate(result.perConnectedHour);',2);
replace('expect(result.perWorkingDay.value)','expect(day.value)',2);replace('expect(result.perConnectedHour.value)','expect(hour.value)',2);replace('expect(result.perWorkingDay.denominator)','expect(day.denominator)',1);replace('expect(result.perConnectedHour.denominator)','expect(hour.denominator)',1);
replace("expect(perdasexcessivas.perWorkingDay).toMatchObject({ status: 'unavailable', code: 'calendar-unavailable' });", "expect(perdasexcessivas.perWorkingDay).toMatchObject({ status: 'unavailable', code: 'calendar-unavailable', diagnostic: {status:'unavailable',code:'invalid-calendar'} });",1);
replace("expect(perdasexcessivas.perConnectedHour).toMatchObject({ status: 'unavailable', code: 'invalid-calendar' });", "expect(perdasexcessivas.perConnectedHour).toMatchObject({ status: 'unavailable', code: 'calendar-unavailable', diagnostic: {status:'unavailable',code:'invalid-calendar'} });",1);
const marker="describe('budget-financial-rates-immutability'",scaffold=read(base+'budget-financial-rates-immutability.skeleton');if(!after.startsWith(scaffold.slice(0,scaffold.indexOf(marker))))throw Error('prefix');
const r={schema:1,unit:'FT-003.40.4c.2h.1',beforeSha256:hash(before),afterSha256:hash(after),changes:'use narrowed ready returns in2cases; restore outer calendar-unavailable and nested invalid-calendar for both rates; no numerical/freeze/getter changes',limits:'Somente4propriedades; reconciliação integral e aplicativo pendentes.'};
if(process.argv.includes('--preflight')){console.log(JSON.stringify({...r,readOnly:true}));process.exit(0);}
const backup=base+'budget-financial-rates-immutability.failed-ef54.test.ts.txt',report=base+'budget-financial-rates-immutability-check.json',backupReport=base+'budget-financial-rates-immutability.failed-ef54.check.json';for(const p of [backup,report,backupReport])guard(p);if(fs.existsSync(backup)||fs.existsSync(backupReport))throw Error('backup exists');const reportBytes=fs.readFileSync(report);
fs.writeFileSync(backup,before);fs.writeFileSync(backupReport,reportBytes);fs.writeFileSync(target,after);fs.writeFileSync(receipt,JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));
