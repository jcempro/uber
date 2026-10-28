import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';import {gzipSync} from 'node:zlib';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1)throw Error('linked path');if(s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('nested git');}}}
const base='.ia.rules/state/contexts/FT-001/';const profile=process.argv[2]||'provenance';if(!['scope','provenance'].includes(profile))throw Error('profile');const stem=profile==='scope'?'parameter-scope-schema':'provenance-schema';const unit=profile==='scope'?'FT-003.37a':'FT-003.37';const sourcePath='src/domain/'+stem+'.ts';const suitePath='src/domain/'+stem+'.test.ts';const reportPath=base+stem+'-check.json';const testsPath='.cache/'+stem+'-tests.json';for(const p of [reportPath,testsPath])guard(p);
for(const p of ['AGENTS.md','.ia.rules/core/authority.md','.ia.rules/state/continue.ia',base+(profile==='scope'?stem+'-unit.md':'provenance-cases-unit.md')])fs.readFileSync(p,'utf8');
const prior=JSON.parse(fs.readFileSync(base+'provenance-schema-baseline.json','utf8'));const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const stable=x=>JSON.stringify(sort(x));function sort(x){if(Array.isArray(x))return x.map(sort);if(x&&typeof x==='object')return Object.fromEntries(Object.keys(x).sort().map(k=>[k,sort(x[k])]));return x;}
let protectedFiles=prior.files,expectedPriorTests=prior.priorTests;
if(profile==='scope'){
const approved=JSON.parse(fs.readFileSync(base+'parameter-scope-tests-baseline.json','utf8'));
if(approved.sourceCommit!=='b08a61832d17e4120f4a6bf77133c830617f7881'||approved.priorTests!==275||Object.keys(approved.files).length!==66)throw Error('unapproved source baseline');
for(const [p,h]of Object.entries(prior.files))if(p!=='src/domain/cost-requirements.ts'&&approved.files[p]!==h)throw Error('unrelated rebaseline:'+p);
if(approved.files['src/domain/cost-requirements.ts']!=='56db3ad05995583dd01f6ecfb276234265d82b0a525285b9599de8ea7b7454a6'||approved.files[sourcePath]!=='54f2a3764290403a0f661d185ae1026cf4c109efd4e39c217da16f8d7edc6c82')throw Error('unapproved source evolution');
protectedFiles=approved.files;
}
if(profile==='provenance'){
const approved=JSON.parse(fs.readFileSync(base+'provenance-tests-baseline.json','utf8')),previous=JSON.parse(fs.readFileSync(base+'provenance-structure-baseline.json','utf8'));
if(approved.sourceCommit!=='49a390d682476c4044eba804c5f68dac69c69ee8'||approved.priorTests!==281||Object.keys(approved.files).length!==68)throw Error('unapproved provenance baseline');
for(const [p,h]of Object.entries(previous.files))if(approved.files[p]!==h)throw Error('unrelated provenance rebaseline:'+p);
if(approved.files[sourcePath]!=='727f2fc79a8d3d30cb717202eb06038a063628a41cc84e90dfacd0e069f2e4d5')throw Error('unapproved provenance source');
protectedFiles=approved.files;expectedPriorTests=approved.priorTests;
}
for(const [p,h]of Object.entries(protectedFiles)){guard(p);if(hash(fs.readFileSync(p))!==h)throw Error('prior source changed: '+p);}
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
if(process.argv.includes('--preflight')){console.log(JSON.stringify({preflight:true,profile,priorFiles:Object.keys(protectedFiles).length,lockMetadata,version:installed.version}));process.exit(0);}
if(!fs.existsSync(suitePath))throw Error('Create behavioral test artifact before verification; no test suite executed');
const prefix=profile==='scope'?'parameter-scope':'provenance',generated=JSON.parse(fs.readFileSync(base+prefix+'-fixture-build-check.json','utf8'));
if(hash(fs.readFileSync(suitePath))!==generated.testSha256||hash(fs.readFileSync(base+prefix+'-cases.json'))!==generated.catalogSha256)throw Error('test/catalog generation binding changed');
const env={...process.env,PATH:path.dirname(process.execPath)+path.delimiter+process.env.PATH};const npm='C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js';const commands=[];
for(const [name,args]of [['types',['run','app:typecheck']],['lint',['run','app:lint']],['tests',['run','app:test','--','--reporter=json','--outputFile='+testsPath]]]){
const actualArgs=args.map(arg=>arg==='--outputFile='+testsPath?'--outputFile='+path.resolve(testsPath):arg);const r=spawnSync(process.execPath,[npm,...actualArgs],{cwd:root,env,encoding:'utf8',timeout:150000,maxBuffer:2e6});commands.push({name,status:r.status,error:r.error?.message,stdout:r.stdout,stderr:r.stderr});if(r.status!==0){fs.writeFileSync(reportPath,JSON.stringify({commands,failed:name},null,2)+'\n');throw Error(name+' failed: '+r.stderr);}
}
const tests=JSON.parse(fs.readFileSync(testsPath,'utf8'));const suite=tests.testResults.find(x=>x.name.replaceAll('\\','/').endsWith('/'+suitePath));
if(!suite||suite.assertionResults.length<6||suite.assertionResults.some(x=>x.status!=='passed')||tests.numTotalTests<expectedPriorTests+6||tests.numPassedTests!==tests.numTotalTests||tests.numFailedTests||tests.numPendingTests||!tests.success)throw Error('test gate');
const {build}=await import('vite');const result=await build({configFile:false,logLevel:'silent',build:{target:'es2023',write:false,minify:true,lib:{entry:path.resolve(sourcePath),formats:['es'],fileName:stem+'-probe'}}});
const outputs=(Array.isArray(result)?result:[result]).flatMap(x=>x.output).filter(x=>x.type==='chunk');if(!outputs.length)throw Error('missing bundle');
const bundle=outputs.map(x=>({file:x.fileName,bytes:Buffer.byteLength(x.code),gzipBytes:gzipSync(x.code).length}));const files={};for(const p of [sourcePath,suitePath]){guard(p);files[p]=hash(fs.readFileSync(p));}
for(const [p,h]of Object.entries(protectedFiles))if(hash(fs.readFileSync(p))!==h)throw Error('prior source changed after verification:'+p);
const report={schema:1,unit,node:process.version,selection:prior.selection,priorFilesPreserved:Object.keys(protectedFiles).length,lockMetadata,files,commands,tests:{total:tests.numTotalTests,passed:tests.numPassedTests,newSuite:suite.assertionResults.length},bundle:{profile:'Vite installed; isolated ES2023 ES module minified write:false; standalone, not app delta/browser measurement',chunks:bundle},limits:'Structure only; no semantic dates, source truth, financial admission, full JSON import or complete UI'};
fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({reportPath,tests:report.tests,bundle:report.bundle,files}));
