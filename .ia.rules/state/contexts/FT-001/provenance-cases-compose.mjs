/** MPL-2.0; FT-003.37b.2b. Transformações de fixtures aprovadas; não consulta schema executável. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=fs.realpathSync('.');
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
const base='.ia.rules/state/contexts/FT-001/';
const input=base+'provenance-canonical-cases.json',archive=base+'provenance-canonical-cases.failed-dbd16073.json',target=base+'provenance-cases.json',receipt=base+'provenance-cases-compose-check.json';
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
const oldHash='e9fa963c51e4f712f05a76930835e037abf01d9b49124421f2c1e840594c5428';
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked path');}}}
for(const p of [input,archive,target,receipt,'src/domain/model.ts',base+'provenance-tests-baseline.json'])guard(p);
for(const p of ['AGENTS.md','.ia.rules/core/authority.md',base+'provenance-canonical-unit.md'])fs.readFileSync(p,'utf8');
const baseline=JSON.parse(fs.readFileSync(base+'provenance-tests-baseline.json','utf8'));
if(baseline.sourceCommit!=='49a390d682476c4044eba804c5f68dac69c69ee8'||Object.keys(baseline.files).length!==68)throw Error('baseline');
for(const [p,h] of Object.entries(baseline.files)){guard(p);if(hash(fs.readFileSync(p))!==h)throw Error('protected source:'+p);}
if(fs.existsSync(receipt)){const r=JSON.parse(fs.readFileSync(receipt));if(hash(fs.readFileSync(archive))!==oldHash||hash(fs.readFileSync(input))!==r.canonicalSha256||hash(fs.readFileSync(target))!==r.catalogSha256)throw Error('applied state differs');console.log(JSON.stringify({...r,alreadyApplied:true}));process.exit(0);}
if(fs.existsSync(archive)||fs.existsSync(target))throw Error('output collision');
const raw=fs.readFileSync(input);if(hash(raw)!==oldHash)throw Error('original differs');
const fragment=JSON.parse(raw);if(fragment.schema!==1||fragment.groups.length!==1||fragment.groups[0].group!=='canonical')throw Error('fragment');
const canonical=fragment.groups[0].cases;
if(canonical.length!==9||canonical.some(c=>Object.hasOwn(c,'success')))throw Error('unexpected initial cases');
// Correções exatas de forma: nove expectativas positivas e três controles explicitamente pedidos.
for(const c of canonical)c.success=true;
canonical[0].input.source=' fonte A ';
canonical[1].input.scope.vehicleId=' v1 ';
canonical[6].id='canonical-007-data-invalida-somente-estrutura';
const model=fs.readFileSync('src/domain/model.ts','utf8');
const literalSet=text=>[...text.matchAll(/'([^']+)'/g)].map(m=>m[1]);
const kinds=literalSet(model.match(/export type EvidenceKind =([\s\S]*?);/)[1]);
const reliabilities=literalSet(model.match(/readonly reliability:([^;]+);/)[1]);
if(kinds.length!==9||reliabilities.length!==5||kinds.some(k=>!canonical.some(c=>c.input.kind===k))||reliabilities.some(k=>!canonical.some(c=>c.input.reliability===k)))throw Error('canonical model coverage');
const clone=x=>JSON.parse(JSON.stringify(x));
const seed=canonical[0].input;
const fields=['kind','source','date','competence','scope','reliability'];
if(canonical.some(c=>Object.keys(c.input).length!==6||fields.some(k=>!Object.hasOwn(c.input,k))))throw Error('six fields');
const shape=[];
const negative=(id,input,extra={})=>({id,input,success:false,...extra});
for(const [id,value] of [['null',null],['array',[]],['number',1]])shape.push(negative('root-'+id,value));
const changes=[['kind','unknown'],['kind','estimate '],['kind',null],['reliability','unknown'],['reliability','confirmed '],['source',''],['source',' \t '],['source',42],['date',42],['date',false],['competence',42],['competence',false],['scope',null],['scope',[]],['scope',{kind:'global '}],['scope',{kind:'vehicle',vehicleId:' '}],['scope',{kind:'scenario',scenarioId:''}],['scope',{kind:'vehicle',vehicleId:3}],['scope',{kind:'scenario',vehicleId:'v1'}]];
changes.forEach(([key,value],i)=>{const v=clone(seed);v[key]=value;shape.push(negative('shape-'+i+'-'+key,v));});
const required=fields.map(key=>{const v=clone(seed);delete v[key];return negative('missing-'+key,v);});
const unknown=[];
for(const key of ['extraordinary','constructor','__proto__']){const v=clone(seed);Object.defineProperty(v,key,{value:'extra',enumerable:true});unknown.push(negative('extra-root-'+key,v,key==='extraordinary'?{}:{ownKey:key}));}
const nested=clone(seed);nested.scope.extraordinary='extra';unknown.push(negative('extra-scope',nested));
const issue=[];
for(const [key,value] of [['source',' '],['date',false]]){const v=clone(seed);v[key]=value;issue.push(negative('issue-'+key,v,{path:key}));}
for(const [kind,idKey] of [['vehicle','vehicleId'],['scenario','scenarioId']]){const v=clone(seed);v.scope={kind,[idKey]:' '};issue.push(negative('issue-'+idKey,v,{path:'scope.'+idKey}));}
const frozenValid=clone(canonical[1].input),frozenInvalid=clone(frozenValid);frozenInvalid.scope.vehicleId=' ';
const groups=[{group:'canonical',cases:canonical},{group:'shape',cases:shape},{group:'required-fields',cases:required},{group:'unknown-keys',cases:unknown},{group:'issue-path',cases:issue},{group:'immutability',cases:[{id:'frozen-valid',input:frozenValid,success:true},negative('frozen-invalid',frozenInvalid)]}];
const ids=groups.flatMap(g=>g.cases.map(c=>c.id));if(new Set(ids).size!==ids.length)throw Error('duplicate id');
const encode=v=>JSON.stringify(v,null,2)+'\n';
const canonicalText=encode(fragment),catalogText=encode({schema:1,groups});
const record={schema:1,unit:'FT-003.37b.2b',originalJob:'dbd16073-e046-4c6d-8c96-a4a347f3e47e',originalSha256:oldHash,canonicalSha256:hash(canonicalText),catalogSha256:hash(catalogText),modelSha256:hash(model),groups:6,cases:ids.length,protectedFiles:68,limits:'Oráculos estruturais sintéticos; não validam calendário, fonte, finanças ou UI.'};
fs.writeFileSync(archive,raw);fs.writeFileSync(input,canonicalText);fs.writeFileSync(target,catalogText);fs.writeFileSync(receipt,encode(record));console.log(JSON.stringify(record));
