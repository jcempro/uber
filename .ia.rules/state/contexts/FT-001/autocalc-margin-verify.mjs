import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {createRequire} from 'node:module';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex'),base='.ia.rules/state/contexts/FT-001/';
const prior=JSON.parse(fs.readFileSync(base+'autocalc-margin-baseline.json','utf8')),receipt=JSON.parse(fs.readFileSync(base+'autocalc-margin-patch.json','utf8'));
for(const [p,h]of Object.entries(prior.protected))if(hash(fs.readFileSync(p))!==h)throw Error('protected:'+p);
const rcf=fs.readFileSync('RCF.md','utf8');if(hash(rcf)!==receipt.after||receipt.before!==prior.rcf)throw Error('receipt');
if(rcf.split(receipt.inserted).length!==2||hash(rcf.replace(receipt.inserted,''))!==prior.rcf)throw Error('preservation');
const require=createRequire(import.meta.url),trace=require(path.join(root,'.ia.rules/core/runtime/scripts/rcf-trace.js'));const official=trace.validate(root);
const map=JSON.parse(fs.readFileSync('.ia.rules/state/traceability/rcf-map.json','utf8'));
const data=trace.materialLines(rcf);for(const item of data.material){const entry=map.entries.find(x=>x.id===trace.sentenceId('RCF.md',item.text));if(!entry||entry.line!==item.index+1||entry.state!=='pending'||entry.commit)throw Error('current trace');}
const report={schema:1,unit:'FT-010.2',before:prior.rcf,after:receipt.after,protectedFiles:Object.keys(prior.protected).length,officialTrace:official,inserted:receipt.inserted,limits:receipt.limits};fs.writeFileSync(base+'autocalc-margin-check.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({report:base+'autocalc-margin-check.json',protected:report.protectedFiles,officialTrace:official,after:receipt.after}));
