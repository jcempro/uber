import fs from 'node:fs';import crypto from 'node:crypto';import path from 'node:path';import {createRequire} from 'node:module';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');const base='.ia.rules/state/contexts/FT-001/';
const prior=JSON.parse(fs.readFileSync(base+'autocalc-tax-baseline.json','utf8')),receipt=JSON.parse(fs.readFileSync(base+'autocalc-tax-patch.json','utf8'));
for(const [p,h]of Object.entries(prior.protected))if(hash(fs.readFileSync(p))!==h)throw Error('protected:'+p);
const rcf=fs.readFileSync('RCF.md','utf8');if(hash(rcf)!==receipt.after||receipt.before!==prior.rcf||receipt.edits!==11)throw Error('receipt');
const require=createRequire(import.meta.url);const trace=require(path.join(root,'.ia.rules/core/runtime/scripts/rcf-trace.js'));const result=trace.validate(root);
const m=JSON.parse(fs.readFileSync('.ia.rules/state/traceability/rcf-map.json','utf8'));const lines=rcf.split('\n');
for(const plan of receipt.prepared){const entry=m.entries.find(x=>x.id===trace.sentenceId('RCF.md',lines[plan.line-1]));if(!entry||entry.state!=='pending'||entry.commit||JSON.stringify(entry.artifacts)!==JSON.stringify([...plan.artifacts].sort()))throw Error('trace changed');}
const report={schema:1,unit:'FT-010.1',patch:receipt,protectedFiles:Object.keys(prior.protected).length,officialTrace:result,semanticReview:'Pendente supervisor: automação comprova aplicação/preservação/vínculos, não verdade semântica nem implementação.'};
fs.writeFileSync(base+'autocalc-tax-check.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({protectedFiles:report.protectedFiles,officialTrace:result,after:receipt.after}));
