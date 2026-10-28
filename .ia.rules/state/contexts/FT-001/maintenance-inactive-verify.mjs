/** MPL-2.0; verificação interna FT-003.38a. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
const base='.ia.rules/state/contexts/FT-001/',hash=x=>crypto.createHash('sha256').update(x).digest('hex');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked path');}}}
const snapshot=JSON.parse(fs.readFileSync(base+'maintenance-inactive-baseline.json','utf8'));
function protect(){for(const [p,h]of Object.entries(snapshot.files)){guard(p);if(hash(fs.readFileSync(p))!==h)throw Error('protected:'+p);}}
protect();
for(const p of ['AGENTS.md','.ia.rules/core/authority.md',base+'maintenance-inactive-unit.md'])fs.readFileSync(p,'utf8');
for(const [p,h]of Object.entries(snapshot.targets)){guard(p);if(hash(fs.readFileSync(p))===h)throw Error('required change:'+p);}
const reportPath=base+'maintenance-inactive-check.json',testsPath=path.resolve('.cache/maintenance-inactive-tests.json');for(const p of [reportPath,'.cache/maintenance-inactive-tests.json'])guard(p);
const env={...process.env,PATH:path.dirname(process.execPath)+path.delimiter+process.env.PATH},npm='C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js',commands=[];
for(const [name,args]of [['types',['run','app:typecheck']],['lint',['run','app:lint']],['tests',['run','app:test','--','--reporter=json','--outputFile='+testsPath]]]){const r=spawnSync(process.execPath,[npm,...args],{cwd:root,env,encoding:'utf8',timeout:150000,maxBuffer:2e6});commands.push({name,status:r.status,error:r.error?.message,stdout:r.stdout,stderr:r.stderr});if(r.status!==0){fs.writeFileSync(reportPath,JSON.stringify({schema:1,failed:name,commands},null,2)+'\n');throw Error('failed:'+name);}}
const tests=JSON.parse(fs.readFileSync(testsPath));
if(!tests.success||tests.numTotalTests<289||tests.numPassedTests!==tests.numTotalTests||tests.numFailedTests||tests.numPendingTests)throw Error('full suite gate');
const suite=tests.testResults.find(s=>s.name.replaceAll('\\','/').endsWith('/src/domain/maintenance.test.ts'));
if(!suite||suite.assertionResults.length<12||suite.assertionResults.some(t=>t.status!=='passed'))throw Error('maintenance suite gate');
for(const [name,count]of Object.entries(snapshot.testCounts)){const actual=tests.testResults.find(s=>s.name.replaceAll('\\','/')===name);if(!actual||actual.assertionResults.length<count||actual.assertionResults.some(t=>t.status!=='passed'))throw Error('suite lost:'+name);}
protect();const files=Object.fromEntries(Object.keys(snapshot.targets).map(p=>[p,hash(fs.readFileSync(p))]));
const report={schema:1,unit:'FT-003.38a',node:process.version,sourceCommit:snapshot.sourceCommit,commands,tests:{total:tests.numTotalTests,passed:tests.numPassedTests,maintenance:suite.assertionResults.length},files,protectedFiles:Object.keys(snapshot.files).length,limits:'Não certifica adoção explícita, custo real de manutenção, cobertura/ledger, UI ou viabilidade financeira.'};
fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,commands:commands.map(({name,status})=>({name,status}))}));
