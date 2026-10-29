/** MPL-2.0; FT-003.41.2a.1b. Cinco assertivas canônicas omitidas. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.'),base='.ia.rules/state/contexts/FT-001/',target='src/domain/financial-margin-target.test.ts',hash=v=>crypto.createHash('sha256').update(v).digest('hex');
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
function read(p){guard(p);return fs.readFileSync(p,'utf8');}
for(const p of ['AGENTS.md','.ia.rules/core/authority.md',base+'financial-margin-target-core-repair-unit.md'])read(p);
const baseline=JSON.parse(read(base+'financial-margin-target-baseline.json'));if(baseline.priorTests!==396||Object.keys(baseline.files).length!==100)throw Error('baseline');for(const[p,h]of Object.entries(baseline.files))if(hash(read(p))!==h)throw Error('accepted drift:'+p);
if(hash(read('src/domain/financial-margin-target.ts'))!=='94dea5cd0393dbd2fd7dceec0737b027480fd32866c123bed501e7e05a721fcd')throw Error('source drift');
const before=read(target),receipt=base+'financial-margin-target-core-repair-check.json';guard(receipt);
if(fs.existsSync(receipt)){const r=JSON.parse(read(receipt));if(hash(before)!==r.afterSha256)throw Error('applied drift');console.log(JSON.stringify({...r,alreadyApplied:true}));process.exit(0);}
if(hash(before)!=='26e8d4ec84f7b85387c2eb4e95b10a8bd6a7b1d7de5b2588ac57fb0f490ec617')throw Error('preimage');
const marker='      const result = root({ ...baseInput(), requiredMarginPercent: r(row.percent) });';if(before.split(marker).length!==2)throw Error('marker');
const after=before.replace(marker,marker+"\n      expect(result.projection.value.operatingCost).toEqual(r('340'));\n      expect(result.projection.value.plannedTotalCost).toEqual(r('490'));\n      expect(result.projection.value.netProfit).toEqual(r('510'));\n      expect(result.projection.value.remainingRevenueFactor).toEqual(r('17','20'));\n      expect(result.projection.value.margin).toEqual({status:'ready',value:r('51','100')});"),scaffold=read(base+'financial-margin-target.core.test.skeleton'),boundary="describe('financial-margin-target'";if(!after.startsWith(scaffold.slice(0,scaffold.indexOf(boundary))))throw Error('prefix');
const r={schema:1,unit:'FT-003.41.2a.1b',beforeSha256:hash(before),afterSha256:hash(after),changes:'five required independent projection assertions: A340,total490,LLF510,G17/20,margin51/100; original loop/targets/slacks preserved',limits:'Somente comparação50/52;demaisgrupos eaceiteintegralpendentes.'};
if(process.argv.includes('--preflight')){console.log(JSON.stringify({...r,readOnly:true}));process.exit(0);}
const backup=base+'financial-margin-target.received-2f1.test.ts.txt',report=base+'financial-margin-target-check.json',backupReport=base+'financial-margin-target.received-2f1.check.json';for(const p of [backup,report,backupReport])guard(p);if(fs.existsSync(backup)||fs.existsSync(backupReport))throw Error('backup exists');const reportBytes=fs.readFileSync(report);
fs.writeFileSync(backup,before);fs.writeFileSync(backupReport,reportBytes);fs.writeFileSync(target,after);fs.writeFileSync(receipt,JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));
