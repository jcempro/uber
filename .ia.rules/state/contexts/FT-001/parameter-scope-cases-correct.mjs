import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
const base='.ia.rules/state/contexts/FT-001/',catalogPath=base+'parameter-scope-cases.json',receiptPath=base+'parameter-scope-cases-correction-check.json',hash=x=>crypto.createHash('sha256').update(x).digest('hex');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
for(const p of ['AGENTS.md','.ia.rules/core/authority.md','.ia.rules/state/continue.ia',base+'parameter-scope-cases-correction-job.md'])fs.readFileSync(p,'utf8');
const approved=JSON.parse(fs.readFileSync(base+'parameter-scope-tests-baseline.json','utf8'));for(const [p,h]of Object.entries(approved.files))if(hash(fs.readFileSync(p))!==h)throw Error('protected source:'+p);
const model=fs.readFileSync('src/domain/model.ts','utf8'),type=model.split('export type ParameterScope =')[1]?.split(';')[0];
if(!type?.includes("readonly kind: 'global'")||type.includes("kind: 'global '"))throw Error('canonical literal changed');
guard(catalogPath);const original=fs.readFileSync(catalogPath);if(hash(original)!=='9bc1b243501cfd5d42e2d79c64c9acd431d53a4fa3120c5cacdf31fcf33e3896')throw Error('stale catalog');
const catalog=JSON.parse(original),canonical=catalog.groups.find(g=>g.group==='canonical'),shape=catalog.groups.find(g=>g.group==='shape');
function find(group,id){const found=group.cases.filter(c=>c.id===id);if(found.length!==1)throw Error('fixture anchor:'+id);return found[0];}
const literal=find(canonical,'global-com-espaco-final');if(literal.input.kind!=='global '||literal.success!==true)throw Error('oracle changed');
literal.success=false;literal.id='discriminador-com-espaco-recusa';canonical.cases.splice(canonical.cases.indexOf(literal),1);shape.cases.push(literal);
const global=find(canonical,'global-com-espaco-inicial');if(JSON.stringify(global.input)!=='{"kind":"global"}'||!global.success)throw Error('global anchor');global.id='global-sem-id';
const uncatalogued=find(canonical,'global-id-nao-cadastrado');if(JSON.stringify(uncatalogued.input)!=='{"kind":"global"}'||!uncatalogued.success)throw Error('ID fixture anchor');uncatalogued.id='vehicle-id-sintetico-sem-resolucao';uncatalogued.input={kind:'vehicle',vehicleId:'fixture-sem-cadastro'};
const crossed=find(shape,'campo-outro-escopo');if(crossed.success||crossed.input.kind!=='global'||crossed.input.vehicleId!=='abc123')throw Error('crossed fixture anchor');crossed.input={kind:'vehicle',scenarioId:'cenario-trocado'};
const count=catalog.groups.reduce((n,g)=>n+g.cases.length,0);if(catalog.groups.length!==6||count!==37)throw Error('case preservation');
const failedPath='.cache/parameter-scope-schema-tests.json',wrapper=base+'parameter-scope-schema-check.json',build=base+'parameter-scope-fixture-build-check.json',test='src/domain/parameter-scope-schema.test.ts';
const sources=[catalogPath,failedPath,wrapper,build,test],backups=sources.map((source,i)=>({source,path:base+['parameter-scope-cases.failed-70a41.json','scope-cases-failed-70a41-report.json','scope-cases-failed-70a41-commands.json','scope-cases-failed-70a41-build.json','scope-cases-failed-70a41-test.txt'][i],sha256:hash(fs.readFileSync(source))}));
for(const b of backups){guard(b.source);guard(b.path);if(fs.existsSync(b.path))throw Error('backup collision');}guard(receiptPath);if(fs.existsSync(receiptPath))throw Error('receipt collision');
const failed=JSON.parse(fs.readFileSync(failedPath,'utf8'));if(failed.numTotalTests!==281||failed.numPassedTests!==280||failed.numFailedTests!==1||!failed.testResults.some(s=>s.assertionResults.some(c=>c.failureMessages?.some(m=>m.includes('global-com-espaco-final')))))throw Error('failure evidence');
const after=JSON.stringify(catalog,null,2)+'\n';
if(process.argv.includes('--check-only')){console.log(JSON.stringify({preflight:true,expectedSuccessCorrections:1,clarifiedOtherFixtures:3,groups:6,cases:count,protectedFiles:Object.keys(approved.files).length,after:hash(after)}));process.exit(0);}
for(const b of backups)fs.copyFileSync(b.source,b.path);fs.writeFileSync(catalogPath,after,'utf8');
const receipt={schema:1,unit:'FT-003.37a.2c',sourceCommit:approved.sourceCommit,before:hash(original),after:hash(after),canonicalType:'ParameterScope.kind is literal global|vehicle|scenario; ID whitespace is preserved separately',expectedSuccessCorrections:1,clarifiedOtherFixtures:3,groups:6,cases:count,backups,limits:'Correção de oráculo incompatível com fonte canônica, reforçando rejeição de discriminador com espaço; produção e demais expectativas preservadas. Build/validação seguem comandos separados.'};
fs.writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({unit:receipt.unit,after:receipt.after,groups:6,cases:count,expectedSuccessCorrections:1}));
