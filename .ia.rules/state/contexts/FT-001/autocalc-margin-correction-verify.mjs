import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {createRequire} from 'node:module';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
const base='.ia.rules/state/contexts/FT-001/',hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const old=JSON.parse(fs.readFileSync(base+'autocalc-margin-baseline.json','utf8')),receipt=JSON.parse(fs.readFileSync(base+'autocalc-margin-correction-patch.json','utf8'));
for(const [p,h]of Object.entries(old.protected))if(hash(fs.readFileSync(p))!==h)throw Error('protected:'+p);
const rcf=fs.readFileSync('RCF.md','utf8'),start=rcf.indexOf('### 8.4 '),end=rcf.indexOf('## 9. Rota Pro');if(hash(rcf)!==receipt.after||hash(rcf.slice(0,start)+rcf.slice(end))!==old.rcf)throw Error('RCF integrity');
const fragment=fs.readFileSync(base+'autocalc-margin-section.md','utf8').trim();if(rcf.slice(start,end).trim()!==fragment)throw Error('fragment mismatch');
const require=createRequire(import.meta.url),trace=require(path.join(root,'.ia.rules/core/runtime/scripts/rcf-trace.js'));const check=trace.validate(root),data=trace.materialLines(rcf),map=JSON.parse(fs.readFileSync('.ia.rules/state/traceability/rcf-map.json','utf8'));
const section=trace.materialLines(fragment).material;if(section.length!==5||receipt.readBeforeEffects.length!==6)throw Error('evidence count');
for(const item of data.material){const entry=map.entries.find(x=>x.id===trace.sentenceId('RCF.md',item.text));if(!entry||entry.state!=='pending'||entry.commit||entry.line!==item.index+1)throw Error('current trace');}
for(const name of receipt.backupNames){const dest=base+name.replace(/\.(md|json)$/u,'.failed-26fdc33f.$1');if(!fs.existsSync(dest))throw Error('backup missing');}
if(hash(fs.readFileSync(base+'autocalc-margin-check.failed-26fdc33f.json'))!==hash(fs.readFileSync(base+'autocalc-margin-check.json')))throw Error('original report changed');
const report={schema:1,unit:receipt.unit,after:receipt.after,protectedFiles:Object.keys(old.protected).length,sectionParagraphs:section.length,officialTrace:check,readBeforeEffects:receipt.readBeforeEffects,failedEvidencePreserved:true,limits:receipt.limits+' Verificação estrutural não certifica semântica; revisão do supervisor exigida.'};
fs.writeFileSync(base+'autocalc-margin-correction-check.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({after:receipt.after,protectedFiles:report.protectedFiles,sectionParagraphs:section.length,officialTrace:check}));
