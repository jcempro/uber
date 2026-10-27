import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {createRequire} from 'node:module';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
const base='.ia.rules/state/contexts/FT-001/',hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const profiles={margin:{heading:'### 8.4 Margem mínima, teto de custo e identificabilidade',unit:'FT-010.2',ft:'FT-004',artifacts:['src/domain/economics.ts','src/domain/sensitivity.ts','src/domain/economics.test.ts','src/domain/model.ts']},modes:{heading:'### 8.5 Autocálculo, aceleradores e convergência',unit:'FT-010.3',ft:'FT-009',artifacts:['src/domain/economics.ts','src/domain/economics.test.ts','src/domain/model.ts','src/domain/model-scenarios.ts','src/App.tsx']}};
const key=process.argv[2]||'margin';if(!Object.hasOwn(profiles,key))throw Error('profile');const profile=profiles[key],prefix='autocalc-'+key+'-';
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
for(const p of ['AGENTS.md','.ia.rules/core/authority.md','.ia.rules/state/continue.ia','.ia.rules/state/requests/FT-001/autocalc-evolution.md',base+prefix+'unit.md'])fs.readFileSync(p,'utf8');
const baseline=JSON.parse(fs.readFileSync(base+prefix+'baseline.json','utf8'));
for(const [p,h]of Object.entries(baseline.protected)){guard(p);if(hash(fs.readFileSync(p))!==h)throw Error('protected:'+p);}
for(const p of ['RCF.md','.ia.rules/state/traceability/rcf-map.json',base+prefix+'section.md',base+prefix+'patch.json'])guard(p);
const before=fs.readFileSync('RCF.md','utf8');if(hash(before)!==baseline.rcf)throw Error('stale RCF');
const fragment=fs.readFileSync(base+prefix+'section.md','utf8').replaceAll('\r\n','\n').trim();
if(!fragment.startsWith(profile.heading+'\n')||fragment.split('\n').slice(1).some(x=>/^#/u.test(x)))throw Error('section shape');
const anchor='## 9. Rota Pro — configuração por contexto e semáforo';if(before.split(anchor).length!==2||before.includes(profile.heading))throw Error('anchor');
const insertion=fragment+'\n\n';const proposed=before.replace(anchor,insertion+anchor);
const require=createRequire(import.meta.url),trace=require(path.join(root,'.ia.rules/core/runtime/scripts/rcf-trace.js'));
const paragraphs=fragment.split(/\n\s*\n/u).slice(1);if(paragraphs.length!==5||paragraphs.some(p=>p.includes('\n')||!p.endsWith('[PENDENTE-CODIGO]')||trace.materialLines(p).material.length!==1))throw Error('five compulsory paragraphs, each fully mapped');
const map=JSON.parse(fs.readFileSync('.ia.rules/state/traceability/rcf-map.json','utf8'));
const data=trace.materialLines(proposed),plans=[];
for(const item of data.material){const entry=map.entries.find(x=>x.id===trace.sentenceId('RCF.md',item.text));if(entry){if(entry.state!=='pending')throw Error('not pending');plans.push({line:item.index+1,ft:entry.ft,artifacts:entry.artifacts});}else{if(!fragment.includes(item.text))throw Error('unexpected new material');plans.push({line:item.index+1,ft:profile.ft,artifacts:profile.artifacts});}}
fs.writeFileSync('RCF.md',proposed,'utf8');for(const p of plans)trace.prepare(root,'RCF.md',p.artifacts,{ft:p.ft,lines:[String(p.line)]});
const final=fs.readFileSync('RCF.md','utf8');const start=final.indexOf(profile.heading),end=final.indexOf(anchor);if(start<0||end<=start||hash(final.slice(0,start)+final.slice(end))!==baseline.rcf)throw Error('outside fragment changed');
const receipt={schema:1,unit:profile.unit,profile:key,before:baseline.rcf,after:hash(final),fragmentInput:hash(fragment),sectionParagraphs:paragraphs.length,inserted:final.slice(start,end),plans,limits:'Norma somente; sem validação financeira/UI ou garantia de demanda; revisão semântica supervisor pendente.'};
fs.writeFileSync(base+prefix+'patch.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({unit:receipt.unit,after:receipt.after,planned:plans.length,sectionParagraphs:paragraphs.length}));
