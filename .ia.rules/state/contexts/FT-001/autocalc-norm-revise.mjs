import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {createRequire} from 'node:module';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
const base='.ia.rules/state/contexts/FT-001/',hash=x=>crypto.createHash('sha256').update(x).digest('hex'),action=process.argv[2];
if(!['check','apply','verify'].includes(action))throw Error('action');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
const configPath=base+'autocalc-modes-correction.json',config=JSON.parse(fs.readFileSync(configPath,'utf8')),prior=JSON.parse(fs.readFileSync(base+'autocalc-modes-baseline.json','utf8'));
const readPaths=['AGENTS.md','.ia.rules/core/authority.md','.ia.rules/normative-index.json','.ia.rules/state/continue.ia','.ia.rules/state/requests/FT-001/autocalc-evolution.md',configPath];
const reads=readPaths.map(p=>({path:p,sha256:hash(fs.readFileSync(p))}));for(const [p,h]of Object.entries(prior.protected)){guard(p);if(hash(fs.readFileSync(p))!==h)throw Error('protected:'+p);}
const receiptPath=base+'autocalc-modes-correction-patch.json',reportPath=base+'autocalc-modes-correction-check.json',fragmentPath=base+'autocalc-modes-section.md';
for(const p of ['RCF.md','.ia.rules/state/traceability/rcf-map.json',fragmentPath,receiptPath,reportPath])guard(p);
const require=createRequire(import.meta.url),trace=require(path.join(root,'.ia.rules/core/runtime/scripts/rcf-trace.js'));
const heading='### 8.5 Autocálculo, aceleradores e convergência',anchor='## 9. Rota Pro — configuração por contexto e semáforo';
function outside(text){const a=text.indexOf(heading),b=text.indexOf(anchor);if(a<0||b<=a)throw Error('section');return text.slice(0,a)+text.slice(b);}
function replace(text,edits){for(const [from,to]of edits){if(text.split(from).length!==2)throw Error('nonunique/missing anchor:'+from.slice(0,50));text=text.replace(from,to);}return text;}
if(action==='verify'){
const receipt=JSON.parse(fs.readFileSync(receiptPath,'utf8')),text=fs.readFileSync('RCF.md','utf8'),fragment=fs.readFileSync(fragmentPath,'utf8').trim();
if(hash(text)!==receipt.after||receipt.configSha256!==hash(fs.readFileSync(configPath))||hash(outside(text))!==receipt.outsideAfter||text.slice(text.indexOf(heading),text.indexOf(anchor)).trim()!==fragment||trace.materialLines(fragment).material.length!==5)throw Error('content integrity');
const official=trace.validate(root),map=JSON.parse(fs.readFileSync('.ia.rules/state/traceability/rcf-map.json','utf8'));
for(const item of trace.materialLines(text).material){const e=map.entries.find(x=>x.id===trace.sentenceId('RCF.md',item.text));if(!e||e.line!==item.index+1||e.state!=='pending'||e.commit)throw Error('trace');}
for(const item of receipt.backups)if(hash(fs.readFileSync(item.path))!==item.sha256)throw Error('backup');
const report={schema:1,unit:config.unit,after:receipt.after,protectedFiles:Object.keys(prior.protected).length,sectionParagraphs:5,officialTrace:official,readsBeforeEffects:receipt.reads,backupsPreserved:true,wholeEdits:config.wholeEdits.length,limits:'Somente norma; sem teste financeiro novo/aceite global. Semântica depende de revisão supervisor.'};fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));process.exit(0);
}
const before=fs.readFileSync('RCF.md','utf8');if(hash(before)!==config.before||hash(outside(before))!==prior.rcf)throw Error('stale RCF; no replay');
const fragment=replace(fs.readFileSync(fragmentPath,'utf8'),config.fragmentEdits),next=replace(replace(before,config.fragmentEdits),config.wholeEdits),expectedOutside=replace(outside(before),config.wholeEdits);
if(hash(outside(next))!==hash(expectedOutside)||trace.materialLines(fragment).material.length!==5)throw Error('outside/paragraph mismatch');
const map=JSON.parse(fs.readFileSync('.ia.rules/state/traceability/rcf-map.json','utf8')),plans=trace.materialLines(next).material.map(item=>{const old=map.entries.find(x=>x.id===trace.sentenceId('RCF.md',item.text));if(old){if(old.state!=='pending')throw Error('nonpending');return {line:item.index+1,ft:old.ft,artifacts:old.artifacts};}return {line:item.index+1,ft:'FT-009',artifacts:['src/domain/model.ts','src/domain/model-scenarios.ts','src/domain/economics.ts','src/domain/economics.test.ts','src/App.tsx']};});
const backupSources=[fragmentPath,base+'autocalc-modes-check.json',base+'autocalc-modes-patch.json'];const backups=backupSources.map(p=>({source:p,path:p.replace(/\.(md|json)$/u,'.pre-correction-4847dcc9.$1'),sha256:hash(fs.readFileSync(p))}));for(const b of backups){guard(b.path);if(fs.existsSync(b.path))throw Error('backup collision');}
if(action==='check'){console.log(JSON.stringify({preflight:true,fragmentEdits:config.fragmentEdits.length,wholeEdits:config.wholeEdits.length,protectedFiles:Object.keys(prior.protected).length,sectionParagraphs:5}));process.exit(0);}
for(const b of backups)fs.copyFileSync(b.source,b.path);fs.writeFileSync(fragmentPath,fragment,'utf8');fs.writeFileSync('RCF.md',next,'utf8');for(const p of plans)trace.prepare(root,'RCF.md',p.artifacts,{ft:p.ft,lines:[String(p.line)]});
const final=fs.readFileSync('RCF.md','utf8');if(hash(final)!==hash(next))throw Error('unexpected trace rewrite');const receipt={schema:1,unit:config.unit,predecessor:config.predecessor,before:config.before,after:hash(final),outsideAfter:hash(expectedOutside),reads,backups,configSha256:hash(fs.readFileSync(configPath))};fs.writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({unit:config.unit,after:receipt.after,planned:plans.length}));
