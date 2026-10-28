/** MPL-2.0; FT-003.40.4c. Prepara contexto e baseline; não executa código de domínio. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import ts from 'typescript';
const root=fs.realpathSync('.'),base='.ia.rules/state/contexts/FT-001/',prefix='budget-financial-rates';
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
const hash=v=>crypto.createHash('sha256').update(v).digest('hex'),read=p=>{guard(p);return fs.readFileSync(p,'utf8');};
for(const p of ['AGENTS.md','.ia.rules/core/authority.md',base+prefix+'-unit.md'])read(p);
for(const p of ['src/domain/'+prefix+'.ts','src/domain/'+prefix+'.test.ts'])if(fs.existsSync(p))throw Error('target collision');
const old=JSON.parse(read(base+'effective-monthly-working-days-baseline.json')),report=JSON.parse(read(base+'effective-monthly-working-days-check.json'));
const files={...old.files,...report.files};if(Object.keys(files).length!==91||report.tests.total!==373||report.commands.some(c=>c.status!==0))throw Error('accepted baseline');
for(const [p,h]of Object.entries(files))if(hash(fs.readFileSync(p))!==h)throw Error('drift:'+p);
const prior=JSON.parse(read('.cache/effective-monthly-working-days-tests.json'));
if(!prior.success||prior.numTotalTests!==373||prior.numPassedTests!==373||prior.testResults.length!==44)throw Error('accepted suites');
const baseline={schema:1,sourceCommit:'49d08de7307f1960caff2c4a1c4400ca25bafab6',priorTests:373,files,testCounts:Object.fromEntries(prior.testResults.map(s=>[s.name.replaceAll('\\','/'),s.assertionResults.length]))};
const apiFiles=['exact-budget','exact','model','exact-product','exact-compare','exact-sum','budget-amount','budget-days','monthly-availability'];
let packet='Worker subordinado, não supervisor. Execute exclusivamente a unidade abaixo. Contratos e normas fornecidos integralmente nos trechos pertinentes; não fazer leituras adicionais. Testes inválidos devem usar cast somente na fixture para exercitar fronteira runtime, nunca no código funcional. Importar tipos por import type. Nenhum comando pode ser repetido após falha.\n';
packet+='\nAGENTS.md\n'+read('AGENTS.md')+'\ncore/authority.md\n'+read('.ia.rules/core/authority.md')+'\nUNIDADE\n'+read(base+prefix+'-unit.md')+'\nSKELETON\n'+read(base+prefix+'.source.skeleton');
for(const name of apiFiles){const p='src/domain/'+name+'.ts',source=read(p),ast=ts.createSourceFile(p,source,ts.ScriptTarget.Latest,true);let declarations=[];for(const n of ast.statements){if(name==='model'&&(!ts.isTypeAliasDeclaration(n)||n.name.text!=='BudgetPeriod'))continue;if(name==='exact'&&(!ts.isTypeAliasDeclaration(n)||n.name.text!=='ExactRational'))continue;if(!n.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword))continue;if(ts.isTypeAliasDeclaration(n)||ts.isInterfaceDeclaration(n))declarations.push(n.getText(ast));else if(ts.isFunctionDeclaration(n)&&n.body)declarations.push(n.getText(ast).slice(0,n.body.getStart(ast)-n.getStart(ast)).trim()+';');}packet+='\nAPI '+p+' SHA256 '+hash(source)+'\n'+declarations.join('\n');}
packet+='\nNão importar aliases privados; os acima são exports reais extraídos por AST. Limites sintéticos usados nos testes existentes: {maxInputLength:256,maxDigits:64}. Racionais: {numerator:string,denominator:string}. Vitest: describe,it,expect; estreitar discriminantes antes de acessar .value/.code.\n';
if(packet.length>32000)throw Error('context too large');
for(const [p,v]of [[base+prefix+'-baseline.json',JSON.stringify(baseline,null,2)+'\n'],[base+prefix+'-context.txt',packet]]){guard(p);if(fs.existsSync(p))throw Error('preparation exists');fs.writeFileSync(p,v);}
console.log(JSON.stringify({packetChars:packet.length,protectedFiles:91,suites:44,priorTests:373,packetSha256:hash(packet)}));
