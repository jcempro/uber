/** MPL-2.0; FT-003.41.2a.3a. Correção determinística de assertivas contraditórias/omitidas. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.'),base='.ia.rules/state/contexts/FT-001/',target='src/domain/financial-margin-target.test.ts',hash=v=>crypto.createHash('sha256').update(v).digest('hex');
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
function read(p){guard(p);return fs.readFileSync(p,'utf8');}
for(const p of ['AGENTS.md','.ia.rules/core/authority.md',base+'financial-margin-target-zero-repair-unit.md'])read(p);
const baseline=JSON.parse(read(base+'financial-margin-target-baseline.json'));if(baseline.priorTests!==396||Object.keys(baseline.files).length!==100)throw Error('baseline');for(const[p,h]of Object.entries(baseline.files))if(hash(read(p))!==h)throw Error('accepted drift:'+p);
if(hash(read('src/domain/financial-margin-target.ts'))!=='94dea5cd0393dbd2fd7dceec0737b027480fd32866c123bed501e7e05a721fcd')throw Error('source drift');
const before=read(target),receipt=base+'financial-margin-target-zero-repair-check.json';guard(receipt);if(fs.existsSync(receipt)){const r=JSON.parse(read(receipt));if(hash(before)!==r.afterSha256)throw Error('applied drift');console.log(JSON.stringify({...r,alreadyApplied:true}));process.exit(0);}
if(hash(before)!=='fb5855958cd2d4905f586b3a5a89e00955ad63a6209506d59fa750d2554e0435')throw Error('preimage');
const marker="  it('receita zero mantém comparação de margem indisponível', () => {";if(before.split(marker).length!==2)throw Error('marker');const cut=before.indexOf(marker);let body=before.slice(cut);function replace(a,b){if(body.split(a).length!==2)throw Error('body match');body=body.replace(a,b);}
replace("    expect(result.projection.value.margin).toEqual({status:'ready',value:r('51','100')});", "    expect(result.value.requiredMarginPercent).toEqual(r('50'));\n    expect(result.value.requiredMarginRatio).toEqual(r('1','2'));");
replace("    expect(assessment.code).toBe('margin-unavailable');", "    expect(assessment.code).toBe('margin-unavailable');\n    expect(assessment.margin).toBe(result.projection.value.margin);");
const after=before.slice(0,cut)+body,accepted=read(base+'financial-margin-target.accepted-boundaries.test.ts.txt');if(hash(accepted)!=='bf35b14e2dbdb885d91df7ec2f14ad0aa10dde62cb13291c24e1f810bd1d096c'||!after.startsWith(accepted.slice(0,-4)))throw Error('accepted prefix');
const r={schema:1,unit:'FT-003.41.2a.3a',beforeSha256:hash(before),afterSha256:hash(after),changes:'remove contradictory ready51/100 in B0;add percent50,ratio1/2 and original margin identity;other assertions and accepted2it preserved',limits:'Só receita zero;G<=0/falhas/freeze/getters/app pendentes.'};
if(process.argv.includes('--preflight')){console.log(JSON.stringify({...r,readOnly:true}));process.exit(0);}
const backup=base+'financial-margin-target.failed-bb.test.ts.txt',report=base+'financial-margin-target-check.json',backupReport=base+'financial-margin-target.failed-bb.check.json';for(const p of [backup,report,backupReport])guard(p);if(fs.existsSync(backup)||fs.existsSync(backupReport))throw Error('backup exists');const reportBytes=fs.readFileSync(report);
fs.writeFileSync(backup,before);fs.writeFileSync(backupReport,reportBytes);fs.writeFileSync(target,after);fs.writeFileSync(receipt,JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));
