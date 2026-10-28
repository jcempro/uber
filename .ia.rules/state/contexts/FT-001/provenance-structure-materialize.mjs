/** MPL-2.0 — https://www.mozilla.org/MPL/2.0/; jcem.pro-uber, FT-003.37b.1. Tradução declarativa interna do modelo canônico. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import ts from 'typescript';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
const base='.ia.rules/state/contexts/FT-001/',target='src/domain/provenance-schema.ts',receiptPath=base+'provenance-structure-materialize-check.json',hash=x=>crypto.createHash('sha256').update(x).digest('hex');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
for(const p of ['AGENTS.md','.ia.rules/core/authority.md','.ia.rules/state/continue.ia',base+'provenance-structure-materialize-job.md'])fs.readFileSync(p,'utf8');
const baseline=JSON.parse(fs.readFileSync(base+'provenance-structure-baseline.json','utf8'));for(const [p,h]of Object.entries({...baseline.files,...baseline.packages})){guard(p);if(hash(fs.readFileSync(p))!==h)throw Error('protected:'+p);}
const modelText=fs.readFileSync('src/domain/model.ts','utf8'),ast=ts.createSourceFile('model.ts',modelText,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
if(ast.parseDiagnostics.length)throw Error('canonical syntax');
const evidence=ast.statements.find(n=>ts.isTypeAliasDeclaration(n)&&n.name.text==='EvidenceKind'),provenance=ast.statements.find(n=>ts.isInterfaceDeclaration(n)&&n.name.text==='Provenance');
if(!evidence||!provenance||provenance.heritageClauses?.length||provenance.members.length!==6)throw Error('canonical declarations');
const fields=new Map();for(const p of provenance.members){if(!ts.isPropertySignature(p)||!ts.isIdentifier(p.name)||p.questionToken||!p.type)throw Error('required field shape');fields.set(p.name.text,p.type);}
/** Extrai valores de união literal; não executa nem adivinha o significado de código canônico. */
function literals(node){if(!ts.isUnionTypeNode(node))throw Error('literal union expected');const values=node.types.map(n=>{if(!ts.isLiteralTypeNode(n)||!ts.isStringLiteral(n.literal))throw Error('string literal expected');return n.literal.text;});if(new Set(values).size!==values.length)throw Error('duplicate literal');return values;}
/** Confere apenas a forma sintática string|null sem definir validação de datas. */
function nullableString(node){return node&&ts.isUnionTypeNode(node)&&node.types.length===2&&node.types.some(n=>n.kind===ts.SyntaxKind.StringKeyword)&&node.types.some(n=>ts.isLiteralTypeNode(n)&&n.literal.kind===ts.SyntaxKind.NullKeyword);}
if(!ts.isTypeReferenceNode(fields.get('kind'))||fields.get('kind').typeName.getText(ast)!=='EvidenceKind'||fields.get('source')?.kind!==ts.SyntaxKind.StringKeyword||!nullableString(fields.get('date'))||!nullableString(fields.get('competence'))||!ts.isTypeReferenceNode(fields.get('scope'))||fields.get('scope').typeName.getText(ast)!=='ParameterScope')throw Error('canonical field contract changed');
const kinds=literals(evidence.type),reliability=literals(fields.get('reliability'));
const source=`/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§1/4, FT-003.37b.1.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 * Listas literais extraídas do modelo canônico pela API AST TypeScript.
 */
import { check, nullable, picklist, pipe, strictObject, string, type GenericSchema } from 'valibot';
import type { Provenance } from './model';
import { PARAMETER_SCOPE_STRUCTURE_SCHEMA } from './parameter-scope-schema';

/** Exige fonte textual não branca, preservando o conteúdo literal informado. */
const provenanceSourceSchema = pipe(string(), check((value: string) => value.trim().length > 0, 'Informe uma fonte não vazia.'));

/**
 * Confere somente os seis campos estruturais canônicos, todos obrigatórios, sem coerção ou defaults.
 * Data e competência são string|null, sem validação semântica; null não equivale a campo omitido.
 * Sucesso estrutural não comprova fonte, datas, confiabilidade, referências, precedência ou cobertura financeira.
 * O escopo é composto do schema comum; issues localizadas não modificam a entrada.
 */
export const PROVENANCE_STRUCTURE_SCHEMA: GenericSchema<Provenance> = strictObject({
  kind: picklist(${JSON.stringify(kinds)}),
  source: provenanceSourceSchema,
  date: nullable(string()),
  competence: nullable(string()),
  scope: PARAMETER_SCOPE_STRUCTURE_SCHEMA,
  reliability: picklist(${JSON.stringify(reliability)}),
});
`;
for(const p of [target,receiptPath])guard(p);
if(process.argv.includes('--check-only')){if(fs.existsSync(target))throw Error('target exists');console.log(JSON.stringify({preflight:true,fields:6,kinds:kinds.length,reliability:reliability.length,priorFiles:Object.keys(baseline.files).length,sourceSha256:hash(source),bytes:Buffer.byteLength(source)}));process.exit(0);}
if(fs.existsSync(target)){if(hash(fs.readFileSync(target))!==hash(source))throw Error('source collision');console.log(JSON.stringify({alreadyApplied:true,sourceSha256:hash(source)}));process.exit(0);}
if(fs.existsSync(receiptPath))throw Error('receipt collision');fs.writeFileSync(target,source,{encoding:'utf8',flag:'wx'});
const record={schema:1,unit:'FT-003.37b.1',target,sha256:hash(source),modelSha256:hash(modelText),kinds,reliability,fields:[...fields.keys()],sourceCommit:baseline.sourceCommit,limits:'Somente estrutura: seis campos e listas literais do modelo, escopo reutilizado. Sem testes comportamentais, datas semânticas, verdade de fonte ou aceite financeiro.'};fs.writeFileSync(receiptPath,JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify(record));
