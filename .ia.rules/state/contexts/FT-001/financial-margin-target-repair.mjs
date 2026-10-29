/** MPL-2.0; FT-003.41.1a. Correções textuais exatas, sem substituir algoritmo. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.'),base='.ia.rules/state/contexts/FT-001/',target='src/domain/financial-margin-target.ts',hash=v=>crypto.createHash('sha256').update(v).digest('hex');
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
function read(p){guard(p);return fs.readFileSync(p,'utf8');}
for(const p of ['AGENTS.md','.ia.rules/core/authority.md',base+'financial-margin-target-repair-unit.md'])read(p);
const baseline=JSON.parse(read(base+'financial-margin-target-baseline.json'));if(baseline.priorTests!==396||Object.keys(baseline.files).length!==100)throw Error('baseline');for(const[p,h]of Object.entries(baseline.files))if(hash(read(p))!==h)throw Error('accepted drift:'+p);
const before=read(target),receipt=base+'financial-margin-target-repair-check.json';guard(receipt);
if(fs.existsSync(receipt)){const r=JSON.parse(read(receipt));if(hash(before)!==r.afterSha256)throw Error('applied drift');console.log(JSON.stringify({...r,alreadyApplied:true}));process.exit(0);}
if(hash(before)!=='58fdf3cebcc97b0ce8287b3a48d8bd70d5bab79335b51da191c98a9cd2cf07bf')throw Error('preimage');let after=before;
function replace(a,b,count=1){if(after.split(a).length-1!==count)throw Error('match:'+a);after=after.replaceAll(a,b);}
for(const[name,n]of [['one','1'],['zero','0'],['hundred','100']])replace(`const ${name}:ExactRational={numerator:${n},denominator:1};`,`const ${name}:ExactRational=Object.freeze({numerator:'${n}',denominator:'1'});`);
replace("calculateExactProduct('divide',input.requiredMarginPercent,one,limitsSnapshot.limits)","calculateExactProduct('multiply',input.requiredMarginPercent,one,limitsSnapshot.limits)");
replace("return failure('invalid-target',requiredMarginPercentNormalized.reason,projection,null);","return failure(requiredMarginPercentNormalized.code==='invalid-rational'?'invalid-target':'calculation-unavailable',requiredMarginPercentNormalized.reason,projection,requiredMarginPercentNormalized);");
replace('compareExactRationals(requiredMarginPercentNormalized,zero,','compareExactRationals(requiredMarginPercentNormalized.value,zero,');replace("calculateExactProduct('divide',requiredMarginPercentNormalized,hundred,","calculateExactProduct('divide',requiredMarginPercentNormalized.value,hundred,");
for(const variable of ['compareZero','mResult','slackResult','compareSlackZero'])replace(`return failure('calculation-unavailable',${variable}.reason,projection,null);`,`return failure('calculation-unavailable',${variable}.reason,projection,${variable});`);
replace('value:{requiredMarginPercent:input.requiredMarginPercent,requiredMarginRatio:m,assessment:Object.freeze({', 'value:Object.freeze({requiredMarginPercent:requiredMarginPercentNormalized.value,requiredMarginRatio:m,assessment:Object.freeze({');
replace('margin:projection.value.margin})}});','margin:projection.value.margin})})});');
replace('value:{requiredMarginPercent:input.requiredMarginPercent,requiredMarginRatio:m,assessment:assessmentReady}});','value:Object.freeze({requiredMarginPercent:requiredMarginPercentNormalized.value,requiredMarginRatio:m,assessment:assessmentReady})});');
replace(' as const','',4);
const marker='export function calculateFinancialMarginTarget(',skeleton=read(base+'financial-margin-target.source.skeleton');if(after.slice(0,after.indexOf(marker))!==skeleton.slice(0,skeleton.indexOf(marker)))throw Error('prefix');
const r={schema:1,unit:'FT-003.41.1a',beforeSha256:hash(before),afterSha256:hash(after),changes:'string frozen constants; normalized value operands; original failures and technical classification; frozen value with normalized snapshot; remove4const casts',limits:'Somente fonte; comportamento/testes41.2 e aceite global pendentes.'};
if(process.argv.includes('--preflight')){console.log(JSON.stringify({...r,readOnly:true}));process.exit(0);}
const backup=base+'financial-margin-target.failed-90.source.ts.txt',report=base+'financial-margin-target-source-check.json',backupReport=base+'financial-margin-target.failed-90.source-check.json';for(const p of [backup,report,backupReport])guard(p);if(fs.existsSync(backup)||fs.existsSync(backupReport))throw Error('backup exists');const reportBytes=fs.readFileSync(report);
fs.writeFileSync(backup,before);fs.writeFileSync(backupReport,reportBytes);fs.writeFileSync(target,after);fs.writeFileSync(receipt,JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));
