/** MPL-2.0; FT-003.42.3a.p. Preserva recusas9cd; extrai somente prefixo útil com duas correções explícitas. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.'),base='.ia.rules/state/contexts/FT-001/';
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}return p;}
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const raw=fs.readFileSync('C:/Users/admin/.codex-local-worker/jobs/9cdae4f5-3e0e-40cb-9338-c9c6b2259d5f/response-contract-rejections.json','utf8');
const data=JSON.parse(raw);if(data.job_id!=='9cdae4f5-3e0e-40cb-9338-c9c6b2259d5f'||data.rejections.length!==2||data.rejections.some(x=>x.truncated||hash(x.candidate)!==x.candidate_sha256))throw Error('rejections');
const first=JSON.parse(data.rejections[0].candidate).body,cut=first.indexOf("describe('calculateConditionalLinearMarginThreshold");if(cut<1)throw Error('prefix');
let prefix=first.slice(0,cut);const oldImport='LinearMarginThresholdInput, LinearMarginThresholdResult',oldReturn='function root(input: LinearMarginThresholdInput): LinearMarginThresholdResult {';
if(prefix.split(oldImport).length!==2||prefix.split(oldReturn).length!==2)throw Error('transforms');
prefix=prefix.replace(oldImport,'LinearMarginThresholdInput').replace(oldReturn,'function root(input: LinearMarginThresholdInput) {');
function save(rel,content){const p=guard(base+rel);if(fs.existsSync(p)){if(fs.readFileSync(p,'utf8')!==content)throw Error('existing differs');return;}fs.writeFileSync(p,content);}
save('linear-margin-threshold.failed-9cd.rejections.json',raw);
save('linear-margin-threshold.core-prefix.ts.txt',prefix);
console.log(JSON.stringify({rejectionsSha256:hash(raw),firstBodyChars:first.length,prefixChars:prefix.length,prefixSha256:hash(prefix),changes:['remove unused result type import','remove union return annotation so guarded conditional return is inferred'],limits:'Only helpers extracted;no it/test applied or run;rejected bodies retained unmodified.'}));
