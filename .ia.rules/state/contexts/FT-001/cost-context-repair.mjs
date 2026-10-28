/** MPL-2.0; FT-003.39.3b. Correções delimitadas de proposta recusada; nunca executa o código recebido. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import ts from 'typescript';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
const base='.ia.rules/state/contexts/FT-001/',hash=x=>crypto.createHash('sha256').update(x).digest('hex');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
for(const p of ['AGENTS.md','.ia.rules/core/authority.md',base+'cost-context-unit.md']){guard(p);fs.readFileSync(p,'utf8');}
const input=base+'cost-context-proposal.rejected-ccbd9f31.json',out=base+'cost-context.source.template';guard(input);guard(out);if(fs.existsSync(out))throw Error('already prepared');
let source=JSON.parse(fs.readFileSync(input,'utf8')).body;
if(hash(source)!=='96b0a5edcd38231b41b3b64051bc9e8eefcc19fa775228067fb6d04d8620f997')throw Error('proposal changed');
function once(from,to){if(source.split(from).length!==2)throw Error('nonunique repair:'+from);source=source.replace(from,to);}
once('requirement.provenance.scope','requirement.provenance?.scope');once('item.provenance.scope','item.provenance?.scope');
once('selectedCosts.find(c=>c.id===id)',"selectedCosts.find(c=>c!==null&&typeof c==='object'&&c.id===id)");
const check="const check=Object.freeze({subject:'requirement',subjectId:period.requirementId,match:scopeMatch});";
once("if(period.status==='declared-not-applicable'){\n"+check,check+"\nif(period.status==='declared-not-applicable'){");
once('const scopeChecks:CostScopeCheck[]=[];','const scopeChecks:CostScopeCheck[]=[check];');
once("period:period as Extract<CostRequirementPeriodResult,{status:'period-covered'}>",'period');
const ast=ts.createSourceFile('proposal.ts',source,ts.ScriptTarget.Latest,true);
if(ast.parseDiagnostics.length||ast.statements.length!==1||!ts.isFunctionDeclaration(ast.statements[0])||ast.statements[0].name.text!=='resolveCostRequirementContext')throw Error('function shape');
let returns=0,admissions=0,reasons=0;
const result=ts.transform(ast,[ctx=>node=>ts.visitNode(node,function visit(n){
 if(!ts.isReturnStatement(n))return ts.visitEachChild(n,visit,ctx);
 if(!n.expression||!ts.isObjectLiteralExpression(n.expression))throw Error('return shape');returns++;
 const props=[...n.expression.properties],prop=name=>props.find(p=>p.name?.getText(ast)===name),f=ts.factory;
 if(!prop('costAdmission')){props.push(f.createPropertyAssignment('costAdmission',f.createStringLiteral('not-evaluated')));admissions++;}
 if(prop('stage')?.initializer?.text==='scope'){
  const match=prop('scopeMatch'),name=ts.isShorthandPropertyAssignment(match)?match.name.text:match.initializer.getText(ast);
  if(!['scopeMatch','itemScope'].includes(name))throw Error('scope variable');
  const reason=f.createConditionalExpression(f.createBinaryExpression(f.createPropertyAccessExpression(f.createIdentifier(name),'status'),ts.SyntaxKind.EqualsEqualsEqualsToken,f.createStringLiteral('unavailable')),f.createToken(ts.SyntaxKind.QuestionToken),f.createPropertyAccessExpression(f.createIdentifier(name),'reason'),f.createToken(ts.SyntaxKind.ColonToken),f.createStringLiteral('Escopo declarado não corresponde ao contexto solicitado.'));
  const i=props.indexOf(prop('reason'));if(i<0)throw Error('reason absent');props[i]=f.createPropertyAssignment('reason',reason);reasons++;
 }
 const object=f.updateObjectLiteralExpression(n.expression,props);
 return f.updateReturnStatement(n,f.createCallExpression(f.createPropertyAccessExpression(f.createIdentifier('Object'),'freeze'),undefined,[object]));
})]);
if(returns!==6||admissions!==3||reasons!==2)throw Error('repair counts');
const header=`/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.1, FT-003.39.3b.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 * Composição limitada de referências, vigência e escopo declarado; não admite quantias.
 */
import type { CostItem } from './model';
import type { CostRequirement } from './cost-requirement';
import type { ClosedDateInterval } from './cost-validity';
import { resolveCostRequirementPeriod, type CostRequirementPeriodResult } from './cost-period';
import { matchParameterScope, type ScopeMatchContext, type ScopeMatchResult } from './scope-match';
/** Evidência do contexto declarado; não comprova vínculo cadastral ou precedência. */
export interface CostScopeCheck {
  readonly subject: 'requirement' | 'cost-item';
  readonly subjectId: string;
  readonly match: ScopeMatchResult;
}
/** Lacunas e escopo alheio nunca se tornam custo zero ou admissão financeira. */
export type CostRequirementContextResult =
  | {readonly status:'unavailable';readonly stage:'period'|'scope'|'selection';readonly period:CostRequirementPeriodResult;readonly costItemId:string|null;readonly reason:string;readonly scopeMatch:ScopeMatchResult|null;readonly costAdmission:'not-evaluated'}
  | {readonly status:'context-checked';readonly period:Extract<CostRequirementPeriodResult,{status:'period-covered'}>;readonly scopeChecks:readonly CostScopeCheck[];readonly costAdmission:'not-evaluated'}
  | {readonly status:'declared-not-applicable';readonly period:Extract<CostRequirementPeriodResult,{status:'declared-not-applicable'}>;readonly scopeChecks:readonly CostScopeCheck[];readonly costAdmission:'not-evaluated'};
/** Todos os escopos pertinentes devem corresponder; não seleciona substituições ou custos. */
`;
const output=header+ts.createPrinter({newLine:ts.NewLineKind.LineFeed}).printFile(result.transformed[0]);result.dispose();
fs.writeFileSync(out,output);console.log(JSON.stringify({output:out,sha256:hash(output),returns,admissions,reasons}));
