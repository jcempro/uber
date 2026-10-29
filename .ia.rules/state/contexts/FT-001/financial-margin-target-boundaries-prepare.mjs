/** MPL-2.0; FT-003.41.2a.2. Preparo determinístico, sem implementar teste. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.'),base='.ia.rules/state/contexts/FT-001/',target='src/domain/financial-margin-target.test.ts',verifier=base+'maintenance-adoption-schema-verify.mjs',hash=v=>crypto.createHash('sha256').update(v).digest('hex');
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
function read(p){guard(p);return fs.readFileSync(p,'utf8');}
const agents=read('AGENTS.md'),authority=read('.ia.rules/core/authority.md'),unit=read(base+'financial-margin-target-boundaries-unit.md'),source=read('src/domain/financial-margin-target.ts'),before=read(target),baseline=JSON.parse(read(base+'financial-margin-target-baseline.json')),rcf=read('RCF.md');
if(hash(before)!=='dc8ae35adda2422e6f3496a315847f5855d1a1eeffb324d9375a40599b156bf7'||hash(source)!=='94dea5cd0393dbd2fd7dceec0737b027480fd32866c123bed501e7e05a721fcd'||hash(rcf)!=='b66b4ba23d82abbbfb4a9350b629ee3dff3b1c473d7ece2f6a329563190dbd65')throw Error('preimage');
for(const[p,h]of Object.entries(baseline.files))if(hash(read(p))!==h)throw Error('protected:'+p);
if(!before.endsWith('});\n'))throw Error('closing');const accepted=before.slice(0,-4);
let gate=read(verifier);function replace(a,b){if(gate.split(a).length!==2)throw Error('gate match:'+a);gate=gate.replace(a,b);}
replace("marginCore=requestedProfile==='margin-core',profile=marginCore?'margin':", "marginCore=requestedProfile==='margin-core',marginBoundaries=requestedProfile==='margin-boundaries',profile=marginCore||marginBoundaries?'margin':");
replace("(marginCore?'FT-003.41.2a.1':'FT-003.41.2a')", "(marginBoundaries?'FT-003.41.2a.2':marginCore?'FT-003.41.2a.1':'FT-003.41.2a')");
replace("(marginCore?1:4)","(marginBoundaries?2:marginCore?1:4)");
replace("(marginCore?'.core.test.skeleton':'.test.skeleton')", "(marginCore||marginBoundaries?'.core.test.skeleton':'.test.skeleton')");
replace("(marginCore?'-core-tests-unit.md':'-tests-unit.md')", "(marginBoundaries?'-boundaries-unit.md':marginCore?'-core-tests-unit.md':'-tests-unit.md')");
replace("if(profile==='rates'&&generated.sourceSha256", "if(marginBoundaries){const accepted=fs.readFileSync(base+'financial-margin-target.accepted-core.test.ts.txt','utf8');if(hash(accepted)!=='dc8ae35adda2422e6f3496a315847f5855d1a1eeffb324d9375a40599b156bf7'||!fs.readFileSync(generated.testPath,'utf8').startsWith(accepted.slice(0,-4)))throw Error('accepted core drift');}\nif(profile==='rates'&&generated.sourceSha256");
const api=source.slice(source.indexOf('export interface FinancialMarginTargetInput'),source.indexOf('function failure(')),context=['# Norma do alvo',agents,authority,'# Unidade exclusiva',unit,'# Arquivo aceito integral: acrescentar1it antesdo último });',before,'# API pública sem implementação',api,'RCF.md:164 '+rcf.split(/\r?\n/)[163]].join('\n\n');if(context.length>16000)throw Error('capacity');
const outputs=[[base+'financial-margin-target.accepted-core.test.ts.txt',before],[base+'financial-margin-target-boundaries-context.txt',context]];for(const[p]of outputs){guard(p);if(fs.existsSync(p))throw Error('exists:'+p);}
if(process.argv.includes('--preflight')){console.log(JSON.stringify({readOnly:true,chars:context.length,contextSha256:hash(context),acceptedSha256:hash(before),protectedFiles:Object.keys(baseline.files).length}));process.exit(0);}
for(const[p,v]of outputs)fs.writeFileSync(p,v);fs.writeFileSync(verifier,gate);console.log(JSON.stringify({chars:context.length,contextSha256:hash(context),acceptedSha256:hash(before),protectedFiles:Object.keys(baseline.files).length}));
