import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';import {gzipSync} from 'node:zlib';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1)throw Error('linked path');if(s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('nested git');}}}
const base='.ia.rules/state/contexts/FT-001/';const profile=process.argv[2]||'provenance';if(!['scope','provenance'].includes(profile))throw Error('profile');const stem=profile==='scope'?'parameter-scope-schema':'provenance-schema';const unit=profile==='scope'?'FT-003.37a':'FT-003.37';const sourcePath='src/domain/'+stem+'.ts';const suitePath='src/domain/'+stem+'.test.ts';const reportPath=base+stem+'-check.json';const testsPath='.cache/'+stem+'-tests.json';for(const p of [reportPath,testsPath])guard(p);
for(const p of ['AGENTS.md','.ia.rules/core/authority.md','.ia.rules/state/continue.ia',base+stem+'-unit.md'])fs.readFileSync(p,'utf8');
const prior=JSON.parse(fs.readFileSync(base+'provenance-schema-baseline.json','utf8'));const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const stable=x=>JSON.stringify(sort(x));function sort(x){if(Array.isArray(x))return x.map(sort);if(x&&typeof x==='object')return Object.fromEntries(Object.keys(x).sort().map(k=>[k,sort(x[k])]));return x;}
for(const [p,h]of Object.entries(prior.files)){guard(p);if(hash(fs.readFileSync(p))!==h)throw Error('prior source changed: '+p);}
if(profile==='scope'){guard(sourcePath);if(!fs.existsSync(sourcePath)||hash(fs.readFileSync(sourcePath))!=='54f2a3764290403a0f661d185ae1026cf4c109efd4e39c217da16f8d7edc6c82')throw Error('approved scope schema changed; tests cannot redefine production');}
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));if(pkg.dependencies?.valibot!=='1.5.0')throw Error('unpinned dependency');
const pkgOld=structuredClone(pkg);delete pkgOld.dependencies.valibot;if(stable(pkgOld)!==stable(prior.package))throw Error('unrelated package change');
const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));const lockOld=structuredClone(lock);const addition=lockOld.packages['node_modules/valibot'];if(addition?.version!=='1.5.0'||addition.integrity!==prior.selection.integrity)throw Error('lock identity');
if(addition.dependencies&&Object.keys(addition.dependencies).length)throw Error('unexpected runtime dependencies');
delete lockOld.packages['node_modules/valibot'];delete lockOld.packages[''].dependencies.valibot;
const lockMetadata=[];const tsBefore=prior.lock.packages['node_modules/typescript'],tsAfter=lockOld.packages['node_modules/typescript'];
if(tsBefore?.dev===true&&tsAfter?.devOptional===true&&tsAfter.dev===undefined){
if(addition.peerDependencies?.typescript!=='>=5'||addition.peerDependenciesMeta?.typescript?.optional!==true)throw Error('unjustified optional peer');
const expected=structuredClone(tsBefore);delete expected.dev;expected.devOptional=true;if(stable(expected)!==stable(tsAfter))throw Error('unrelated TypeScript metadata change');
tsAfter.dev=true;delete tsAfter.devOptional;lockMetadata.push('TypeScript dev→devOptional: only flag transition caused by Valibot optional TypeScript peer; version/SRI/rest unchanged');
}
if(stable(lockOld)!==stable(prior.lock))throw Error('unrelated lock change; inspect semantic difference without relaxing gate');
const installed=JSON.parse(fs.readFileSync('node_modules/valibot/package.json','utf8'));if(installed.version!=='1.5.0'||installed.license!=='MIT')throw Error('installed identity');
if(process.argv.includes('--preflight')){console.log(JSON.stringify({preflight:true,profile,priorFiles:Object.keys(prior.files).length,lockMetadata,version:installed.version}));process.exit(0);}
const env={...process.env,PATH:path.dirname(process.execPath)+path.delimiter+process.env.PATH};const npm='C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js';const commands=[];
for(const [name,args]of [['types',['run','app:typecheck']],['lint',['run','app:lint']],['tests',['run','app:test','--','--reporter=json','--outputFile='+testsPath]]]){
const actualArgs=args.map(arg=>arg==='--outputFile='+testsPath?'--outputFile='+path.resolve(testsPath):arg);const r=spawnSync(process.execPath,[npm,...actualArgs],{cwd:root,env,encoding:'utf8',timeout:150000,maxBuffer:2e6});commands.push({name,status:r.status,error:r.error?.message,stdout:r.stdout,stderr:r.stderr});if(r.status!==0){fs.writeFileSync(reportPath,JSON.stringify({commands,failed:name},null,2)+'\n');throw Error(name+' failed: '+r.stderr);}
}
const tests=JSON.parse(fs.readFileSync(testsPath,'utf8'));const suite=tests.testResults.find(x=>x.name.replaceAll('\\','/').endsWith('/'+suitePath));
if(!suite||suite.assertionResults.length<6||suite.assertionResults.some(x=>x.status!=='passed')||tests.numTotalTests<prior.priorTests+6||tests.numPassedTests!==tests.numTotalTests||tests.numFailedTests||tests.numPendingTests)throw Error('test gate');
const {build}=await import('vite');const result=await build({configFile:false,logLevel:'silent',build:{target:'es2023',write:false,minify:true,lib:{entry:path.resolve(sourcePath),formats:['es'],fileName:stem+'-probe'}}});
const outputs=(Array.isArray(result)?result:[result]).flatMap(x=>x.output).filter(x=>x.type==='chunk');if(!outputs.length)throw Error('missing bundle');
const bundle=outputs.map(x=>({file:x.fileName,bytes:Buffer.byteLength(x.code),gzipBytes:gzipSync(x.code).length}));const files={};for(const p of [sourcePath,suitePath]){guard(p);files[p]=hash(fs.readFileSync(p));}
const report={schema:1,unit,node:process.version,selection:prior.selection,priorFilesPreserved:Object.keys(prior.files).length,lockMetadata,files,commands,tests:{total:tests.numTotalTests,passed:tests.numPassedTests,newSuite:suite.assertionResults.length},bundle:{profile:'Vite installed; isolated ES2023 ES module minified write:false; standalone, not app delta/browser measurement',chunks:bundle},limits:'Structure only; no semantic dates, source truth, financial admission, full JSON import or complete UI'};
fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({reportPath,tests:report.tests,bundle:report.bundle,files}));
