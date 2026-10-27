import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {createRequire} from 'node:module';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
const base='.ia.rules/state/contexts/FT-001/',hash=x=>crypto.createHash('sha256').update(x).digest('hex');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
const reads=['AGENTS.md','.ia.rules/core/authority.md','.ia.rules/normative-index.json','.ia.rules/state/continue.ia','.ia.rules/state/requests/FT-001/autocalc-evolution.md',base+'autocalc-margin-unit.md'];
const readEvidence=reads.map(p=>({path:p,sha256:hash(fs.readFileSync(p))}));
const old=JSON.parse(fs.readFileSync(base+'autocalc-margin-baseline.json','utf8'));
for(const [p,h]of Object.entries(old.protected)){guard(p);if(hash(fs.readFileSync(p))!==h)throw Error('protected:'+p);}
const targets=['RCF.md',base+'autocalc-margin-section.md'];for(const p of targets)guard(p);
const before=fs.readFileSync('RCF.md','utf8');if(hash(before)!=='c9b6abd94fc5bfdf0b50791698dfb70c8ac08ba39f3e96afa887a6da6cd1a2ca')throw Error('stale RCF; no replay');
const edits=[
 ['**Margem mínima configurável:** L% obrigatório, admite 0, define m = L%/100, não impõe Lmin absoluto nem Lucro%RotaPro;', '**Margem mínima configurável:** o sistema DEVE exigir L% finito e não negativo, admitindo 0, e definir m = L%/100; essa margem não substitui Lmin absoluto nem Lucro%RotaPro;'],
 ['**Custo real por km:** definir C_real/km','**Custo real por km:** o sistema DEVE definir C_real/km'],
 ['**Modelo linear completo:** A(K) = Coper(K), p = q + τ','**Modelo linear completo:** o sistema DEVE usar A(K) = C_oper(K) ≥ 0 e p = q + τ ≥ 0'],
 ['A ≤ 0, p ≤ 0, m = 1','A = 0, p = 0, m = 1'],
 ['A ≤ 0 com denominador positivo','A = 0 com denominador positivo'],
 ['**Teto para K > 0:** A(K) + pB ≤ T × K.','**Teto para K > 0:** o sistema DEVE satisfazer A(K) + pB ≤ T × K.'],
 ['**Identificabilidade e limites:** não derivar','**Identificabilidade e limites:** o sistema NÃO DEVE derivar'],
 ['K/horas só timos não identificáveis','K e horas ótimos não são identificáveis']
];
const proposed=targets.map(p=>{let content=fs.readFileSync(p,'utf8');for(const [from,to]of edits){if(content.split(from).length!==2)throw Error('anchor:'+p+':'+from);content=content.replace(from,to);}return {path:p,content};});
const require=createRequire(import.meta.url),trace=require(path.join(root,'.ia.rules/core/runtime/scripts/rcf-trace.js'));
const map=JSON.parse(fs.readFileSync('.ia.rules/state/traceability/rcf-map.json','utf8'));
const content=proposed[0].content,start=content.indexOf('### 8.4 '),end=content.indexOf('## 9. Rota Pro');if(start<0||end<=start||hash(content.slice(0,start)+content.slice(end))!==old.rcf)throw Error('outside changed');
const material=trace.materialLines(content);const section=material.material.filter(x=>x.index>=content.slice(0,start).split('\n').length-1&&x.index<content.slice(0,end).split('\n').length-1);if(section.length!==5)throw Error('all five paragraphs must be mapped');
const plans=material.material.map(item=>{const entry=map.entries.find(x=>x.id===trace.sentenceId('RCF.md',item.text));if(entry){if(entry.state!=='pending')throw Error('state');return {line:item.index+1,ft:entry.ft,artifacts:entry.artifacts};}if(!section.includes(item))throw Error('unexpected new material');return {line:item.index+1,ft:'FT-004',artifacts:['src/domain/economics.ts','src/domain/sensitivity.ts','src/domain/economics.test.ts','src/domain/model.ts']};});
const backups=['autocalc-margin-section.md','autocalc-margin-check.json','autocalc-margin-patch.json'];
for(const name of backups){const dest=base+name.replace(/\.(md|json)$/u,'.failed-26fdc33f.$1');guard(dest);if(fs.existsSync(dest))throw Error('backup collision');}
guard('.ia.rules/state/traceability/rcf-map.json');guard(base+'autocalc-margin-correction-patch.json');
if(process.argv.includes('--check-only')){console.log(JSON.stringify({preflight:true,edits:edits.length,sectionParagraphs:section.length,protectedFiles:Object.keys(old.protected).length}));process.exit(0);}
for(const name of backups){const dest=base+name.replace(/\.(md|json)$/u,'.failed-26fdc33f.$1');fs.copyFileSync(base+name,dest);}
for(const file of proposed)fs.writeFileSync(file.path,file.content,'utf8');
for(const p of plans)trace.prepare(root,'RCF.md',p.artifacts,{ft:p.ft,lines:[String(p.line)]});
const final=fs.readFileSync('RCF.md','utf8');const receipt={schema:1,unit:'FT-010.2a',predecessor:'26fdc33f-2f53-4005-aa47-4526496dffe1',before:hash(before),after:hash(final),edits:edits.length,readBeforeEffects:readEvidence,sectionParagraphs:section.length,backupNames:backups,limits:'Nova revisão corretiva determinística; não convalida retroativamente leituras não cumpridas do predecessor. Somente norma, sem implementação financeira.'};
fs.writeFileSync(base+'autocalc-margin-correction-patch.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({unit:receipt.unit,after:receipt.after,edits:receipt.edits,sectionParagraphs:section.length}));
