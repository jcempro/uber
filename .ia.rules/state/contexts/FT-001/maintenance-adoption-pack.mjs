/** MPL-2.0; extração de contratos TS existentes como dados, sem execução de código do produto. */
import fs from 'node:fs';import crypto from 'node:crypto';import ts from 'typescript';
const base='.ia.rules/state/contexts/FT-001/',full=JSON.parse(fs.readFileSync(base+'maintenance-adoption-proposal-evidence.json','utf8'));
const printer=ts.createPrinter({removeComments:true,newLine:ts.NewLineKind.LineFeed});
const repair=process.argv.includes('--repair');
function select(rel,names){const sf=ts.createSourceFile(rel,full.sources[rel]??fs.readFileSync(rel,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);const nodes=[];for(const n of sf.statements){if(ts.isFunctionDeclaration(n)&&names.includes(n.name?.text)){nodes.push(ts.factory.updateFunctionDeclaration(n,n.modifiers,n.asteriskToken,n.name,n.typeParameters,n.parameters,n.type,undefined));}else if(names.includes(n.name?.text)||ts.isVariableStatement(n)&&n.declarationList.declarations.some(d=>names.includes(d.name.getText(sf)))){let selected=n;if(repair&&ts.isVariableStatement(n)&&n.declarationList.declarations.some(d=>d.name.getText(sf)==='MAINTENANCE_RATE_REFERENCES'))selected=ts.factory.updateVariableStatement(n,n.modifiers,ts.factory.updateVariableDeclarationList(n.declarationList,n.declarationList.declarations.map(d=>ts.factory.updateVariableDeclaration(d,d.name,d.exclamationToken,d.type,undefined))));nodes.push(selected);}}if(nodes.length!==names.length)throw Error('selection:'+rel);return nodes.map(n=>printer.printNode(ts.EmitHint.Unspecified,n,sf)).join('\n');}
const sources={
 'AGENTS.md':full.sources['AGENTS.md'],
 '.ia.rules/core/authority.md':full.sources['.ia.rules/core/authority.md'],
 'src/domain/maintenance.ts#public':select('src/domain/maintenance.ts',['createInitialMaintenanceCatalog','InitialMaintenanceCatalog']),
 'src/domain/maintenance-adoption-schema.ts#contract':select('src/domain/maintenance-adoption-schema.ts',['HistoricalMaintenanceAdoption','HISTORICAL_MAINTENANCE_ADOPTION_SCHEMA']),
 'src/domain/defaults.ts#references':select('src/domain/defaults.ts',repair?['InitialProfileId','INITIAL_PROFILE_REFERENCES','MaintenanceRateReference','MAINTENANCE_RATE_REFERENCES']:['InitialProfileId','INITIAL_PROFILE_REFERENCES','MAINTENANCE_RATE_REFERENCES']),
 'src/domain/model.ts#records':select('src/domain/model.ts',repair?['NumericParameter','CostItem','Provenance','ParameterScope','EvidenceKind','CostNature','CostRecognition']:['NumericParameter','CostItem']),
 'src/domain/cost-requirement.ts#contract':select('src/domain/cost-requirement.ts',['CostRequirement']),
 'RCF.md#6.2':full.sources['RCF.md §6.2'].split('\n\n').find(s=>s.includes('Referências históricas')),
};
if(repair){sources['node_modules/valibot/dist/index.d.mts#SafeParseResult']=select('node_modules/valibot/dist/index.d.mts',['SafeParseResult']);const clause=sources['RCF.md#6.2'].indexOf('O sistema NÃO DEVE');if(clause<0)throw Error('RCF clause');sources['RCF.md#6.2']=sources['RCF.md#6.2'].slice(clause);}
const record={schema:1,sourceCommit:full.sourceCommit,sourceEvidenceSha256:crypto.createHash('sha256').update(fs.readFileSync(base+'maintenance-adoption-proposal-evidence.json')).digest('hex'),extraction:repair?'AGENTS/authority integrais; demais recortes AST6.0.3 sem comentários, funções só assinatura, tabela só declaração.':'TypeScript AST6.0.3: comentários removidos, funções só assinatura, fontes originais/hashes no artefato vinculado; normas literais integrais.',sources};
const raw=JSON.stringify(record);if(raw.length>12000)throw Error('evidence chars:'+raw.length);fs.writeFileSync(base+(repair?'maintenance-adoption-proposal-evidence-repair.json':'maintenance-adoption-proposal-evidence-compact.json'),raw+'\n');console.log(raw);
