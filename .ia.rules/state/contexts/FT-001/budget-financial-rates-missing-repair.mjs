/** MPL-2.0; FT-003.40.4c.2d.1. Guardas e identidade, sem mudança de expectativas. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.'),base='.ia.rules/state/contexts/FT-001/',target='src/domain/budget-financial-rates-missing.test.ts',hash=v=>crypto.createHash('sha256').update(v).digest('hex');
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
function read(p){guard(p);return fs.readFileSync(p,'utf8');}
for(const p of ['AGENTS.md','.ia.rules/core/authority.md',base+'budget-financial-rates-missing-repair-unit.md'])read(p);
for(const[p,h]of [['src/domain/budget-financial-rates.ts','b9bc2ccbe0a7245b5f79e3a3d6847f430e43601a0b70b94c30f44eb03a0b9da4'],['src/domain/budget-financial-rates.test.ts','7fb27476a464ef3837c2026a1a2c929c65a7865c3f16d9461e63a1626916e858'],['src/domain/budget-financial-rates-signed.test.ts','6d0a826ac187bd03a5251be625a4add439571f669caecd5bc5cf7d0d617fd838']])if(hash(read(p))!==h)throw Error('accepted drift');
const before=read(target),receipt=base+'budget-financial-rates-missing-repair-check.json';guard(receipt);
if(fs.existsSync(receipt)){const r=JSON.parse(read(receipt));if(hash(before)!==r.afterSha256)throw Error('applied drift');console.log(JSON.stringify({...r,alreadyApplied:true}));process.exit(0);}
if(hash(before)!=='59b7c6f245d8dee904ab06f4e81c9e69b92ed919615794dae3695efab3dde295')throw Error('preimage');let after=before;
function replace(a,b,count){if(after.split(a).length-1!==count)throw Error('match:'+a);after=after.replaceAll(a,b);}
replace("    expect(perConnectedHour.status).toBe('unavailable');", "    if (perConnectedHour.status !== 'unavailable') throw Error('Taxa horária deveria estar indisponível.');",1);
replace("    expect(perYear.status).toBe('unavailable');", "    if (perYear.status !== 'unavailable' || !('dependency' in perYear)) throw Error('Montante anual deveria estar indisponível por calendário.');",1);
replace("    expect(result.financialAssessment).toBe('not-evaluated');", "    expect(result.financialAssessment).toBe('not-evaluated');\n    expect(result.source).toEqual({status:'ready',value:r('3200'),sourcePeriod:'month',targetPeriod:'month',basis:'budget-calendar-period'});",2);
const marker="describe('budget-financial-rates-missing'",scaffold=read(base+'budget-financial-rates-missing.skeleton');if(!after.startsWith(scaffold.slice(0,scaffold.indexOf(marker))))throw Error('prefix drift');
const r={schema:1,unit:'FT-003.40.4c.2d.1',beforeSha256:hash(before),afterSha256:hash(after),changes:'two unavailable/dependency guards; two source identity assertions; expectations and prefix preserved',limits:'Somente2casos h/M ausentes; demais grupos pendentes.'};
if(process.argv.includes('--preflight')){console.log(JSON.stringify({...r,readOnly:true}));process.exit(0);}
const backup=base+'budget-financial-rates-missing.failed-84.test.ts.txt',report=base+'budget-financial-rates-missing-check.json',backupReport=base+'budget-financial-rates-missing.failed-84.check.json';for(const p of [backup,report,backupReport])guard(p);if(fs.existsSync(backup)||fs.existsSync(backupReport))throw Error('backup exists');const reportBytes=fs.readFileSync(report);
fs.writeFileSync(backup,before);fs.writeFileSync(backupReport,reportBytes);fs.writeFileSync(target,after);fs.writeFileSync(receipt,JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));
