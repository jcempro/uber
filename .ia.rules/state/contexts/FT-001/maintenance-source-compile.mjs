/** MPL-2.0; compilação parcial FT-003.38a.1, sem aceite funcional. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
const base='.ia.rules/state/contexts/FT-001/',target='src/domain/maintenance.ts',reportPath=base+'maintenance-source-check.json',hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const snapshot=JSON.parse(fs.readFileSync(base+'maintenance-inactive-baseline.json','utf8'));
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
const protectedFiles={...snapshot.files,...snapshot.targets};delete protectedFiles[target];
function protect(){for(const [p,h]of Object.entries(protectedFiles)){guard(p);if(hash(fs.readFileSync(p))!==h)throw Error('protected:'+p);}}
protect();guard(target);guard(reportPath);const sourceHash=hash(fs.readFileSync(target));if(sourceHash===snapshot.targets[target])throw Error('Write maintenance.ts before compile');
for(const p of ['AGENTS.md','.ia.rules/core/authority.md',base+'maintenance-source-unit.md'])fs.readFileSync(p,'utf8');
const env={...process.env,PATH:path.dirname(process.execPath)+path.delimiter+process.env.PATH},npm='C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js',commands=[];
for(const [name,args]of [['types',['run','app:typecheck']],['lint',['run','app:lint']]]){const r=spawnSync(process.execPath,[npm,...args],{cwd:root,env,encoding:'utf8',timeout:150000,maxBuffer:2e6});commands.push({name,status:r.status,error:r.error?.message,stdout:r.stdout,stderr:r.stderr});if(r.status!==0){fs.writeFileSync(reportPath,JSON.stringify({schema:1,failed:name,commands},null,2)+'\n');throw Error('failed:'+name);}}
protect();if(hash(fs.readFileSync(target))!==sourceHash)throw Error('source changed during compile');
const report={schema:1,unit:'FT-003.38a.1',node:process.version,sourceHash,protectedFiles:Object.keys(protectedFiles).length,commands,tests:'Não executados; expectativas anteriores e comentários do seed exigem próxima unidade.287 era a última suíte aceita antes da alteração.',limits:'Compilação/lint não certificam testes, adoção explícita, ledger, cobertura, UI ou finanças.'};
fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,commands:commands.map(({name,status})=>({name,status}))}));
