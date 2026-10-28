/** MPL-2.0; FT-003.40.4c.2i.1. Acrescenta duas assertivas declaradas. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.'),base='.ia.rules/state/contexts/FT-001/',target='src/domain/budget-financial-rates-controls.test.ts',hash=v=>crypto.createHash('sha256').update(v).digest('hex');
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
function read(p){guard(p);return fs.readFileSync(p,'utf8');}
for(const p of ['AGENTS.md','.ia.rules/core/authority.md',base+'budget-financial-rates-controls-repair-unit.md'])read(p);
const baseline=JSON.parse(read(base+'budget-financial-rates-controls-baseline.json'));if(Object.keys(baseline.files).length!==98)throw Error('baseline');for(const[p,h]of Object.entries(baseline.files))if(hash(read(p))!==h)throw Error('accepted drift:'+p);
if(hash(read('src/domain/budget-financial-rates.ts'))!=='b9bc2ccbe0a7245b5f79e3a3d6847f430e43601a0b70b94c30f44eb03a0b9da4')throw Error('source drift');
const before=read(target),receipt=base+'budget-financial-rates-controls-repair-check.json';guard(receipt);
if(fs.existsSync(receipt)){const r=JSON.parse(read(receipt));if(hash(before)!==r.afterSha256)throw Error('applied drift');console.log(JSON.stringify({...r,alreadyApplied:true}));process.exit(0);}
if(hash(before)!=='fb633a32095aa574fccaadd446a675a6268da316b5234f08381e67dcce07ba95')throw Error('preimage');
const marker='    const result = root(input);';if(before.split(marker).length!==2)throw Error('marker');
const after=before.replace(marker,marker+"\n    expect(result.source).toEqual({status:'ready',value:r('3200'),sourcePeriod:'month',targetPeriod:'month',basis:'budget-calendar-period'});\n    expect(result.financialAssessment).toBe('not-evaluated');"),scaffold=read(base+'budget-financial-rates-controls.skeleton'),boundary="describe('budget-financial-rates-controls'";if(!after.startsWith(scaffold.slice(0,scaffold.indexOf(boundary))))throw Error('prefix');
const r={schema:1,unit:'FT-003.40.4c.2i.1',beforeSha256:hash(before),afterSha256:hash(after),changes:'two missing required assertions: monthly source identity and financialAssessment not-evaluated; canonical control untouched',limits:'Aceite final8grupos e aplicativo ainda sujeitos à revisão.'};
if(process.argv.includes('--preflight')){console.log(JSON.stringify({...r,readOnly:true}));process.exit(0);}
const backup=base+'budget-financial-rates-controls.received-f348.test.ts.txt',report=base+'budget-financial-rates-controls-check.json',backupReport=base+'budget-financial-rates-controls.received-f348.check.json';for(const p of [backup,report,backupReport])guard(p);if(fs.existsSync(backup)||fs.existsSync(backupReport))throw Error('backup exists');const reportBytes=fs.readFileSync(report);
fs.writeFileSync(backup,before);fs.writeFileSync(backupReport,reportBytes);fs.writeFileSync(target,after);fs.writeFileSync(receipt,JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));
