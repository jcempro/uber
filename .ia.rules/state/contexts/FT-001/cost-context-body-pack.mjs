/** MPL-2.0; FT-003.39.3a. Extração determinística da evidência já disponível, sem executar domínio. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import ts from 'typescript';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
const base='.ia.rules/state/contexts/FT-001/',hash=x=>crypto.createHash('sha256').update(x).digest('hex'),sources=[];
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
function read(p){guard(p);const s=fs.readFileSync(p,'utf8');sources.push({path:p,sha256:hash(s)});return s;}
const norms=['AGENTS.md','.ia.rules/core/authority.md'].map(p=>p+'\n'+read(p)).join('\n');
const unit=read(base+'cost-context-unit.md');
const rules=unit.slice(unit.indexOf('Exportar resolveCostRequirementContext'),unit.indexOf('Oito testes independentes'));
const excerpts=[];
for(const [p,names]of [['src/domain/cost-period.ts',['CostRequirementPeriodResult','resolveCostRequirementPeriod']],['src/domain/scope-match.ts',['ScopeMatchResult','ScopeMatchContext','matchParameterScope']]]){
 const s=read(p),ast=ts.createSourceFile(p,s,ts.ScriptTarget.Latest,true);for(const n of ast.statements)if(n.name&&names.includes(n.name.text))excerpts.push(ts.isFunctionDeclaration(n)?s.slice(n.getStart(ast),n.body.getStart(ast)).trim()+';':n.getText(ast));
}
const req=read('src/domain/cost-requirement.ts'),reqAst=ts.createSourceFile('cost-requirement.ts',req,ts.ScriptTarget.Latest,true);
for(const n of reqAst.statements)if(n.name?.text==='CostRequirement')for(const t of n.type.types)if(ts.isTypeLiteralNode(t))for(const m of t.members)if(['id','provenance'].includes(m.name?.getText(reqAst)))excerpts.push('CostRequirement: '+m.getText(reqAst));
const model=read('src/domain/model.ts'),ast=ts.createSourceFile('model.ts',model,ts.ScriptTarget.Latest,true);
for(const n of ast.statements){if(n.name?.text==='ParameterScope')excerpts.push(n.getText(ast));if(n.name?.text==='CostItem')for(const m of n.members)if(['id','provenance'].includes(m.name?.getText(ast)))excerpts.push('CostItem: '+m.getText(ast));if(n.name?.text==='Provenance')for(const m of n.members)if(m.name?.getText(ast)==='scope')excerpts.push('Provenance: '+m.getText(ast));}
const content=norms+'\nContrato canônico parcial (somente campos usados, sem redefinir os demais):\n'+excerpts.join('\n')+'\nUnidade aprovada:\n'+rules;
if(content.length>12000)throw Error('provided evidence exceeds bound:'+content.length);
const out=base+'cost-context-body-evidence-v2.json';guard(out);if(fs.existsSync(out))throw Error('exists');
fs.writeFileSync(out,JSON.stringify({source:'D:/trampo/jcem.pro-uber @9506e3471914b7c49779da3315681839c3eeb3c9; contrato39.3 preparado; '+JSON.stringify(sources),content},null,2)+'\n');
console.log(JSON.stringify({path:out,characters:content.length,sha256:hash(content),sources:sources.length}));
