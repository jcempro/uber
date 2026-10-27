import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
const base='.ia.rules/state/contexts/FT-001/',target='src/domain/parameter-scope-schema.ts',receipt=base+'parameter-scope-materialize-check.json',hash=x=>crypto.createHash('sha256').update(x).digest('hex');
for(const p of ['AGENTS.md','.ia.rules/core/authority.md','.ia.rules/state/continue.ia',base+'parameter-scope-materialize-job.md','src/domain/model.ts'])fs.readFileSync(p,'utf8');
const old=JSON.parse(fs.readFileSync(base+'provenance-schema-baseline.json','utf8'));for(const [p,h]of Object.entries(old.files))if(hash(fs.readFileSync(p))!==h)throw Error('prior source:'+p);
for(const rel of [target,receipt]){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const st=fs.lstatSync(p);if(st.isSymbolicLink()||st.isFile()&&st.nlink!==1||st.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked/nested');}}}
const source=`/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§1/4, FT-003.37a.1.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { check, literal, pipe, strictObject, string, variant, type GenericSchema } from 'valibot';
import type { ParameterScope } from './model';

/** Exige identificador textual não branco sem transformar seu conteúdo literal. */
const scopeIdSchema = pipe(string(), check((value: string) => value.trim().length > 0, 'Informe um identificador não vazio.'));

/**
 * Valida exclusivamente a estrutura dos três escopos canônicos; recusa campos extras.
 * Preserva IDs literais e não comprova existência de referência, precedência ou aplicabilidade.
 * Usar safeParse para obter saída validada ou issues localizadas; não modifica a entrada.
 */
export const PARAMETER_SCOPE_STRUCTURE_SCHEMA: GenericSchema<ParameterScope> = variant('kind', [
  strictObject({ kind: literal('global') }),
  strictObject({ kind: literal('vehicle'), vehicleId: scopeIdSchema }),
  strictObject({ kind: literal('scenario'), scenarioId: scopeIdSchema }),
]);
`;
if(process.argv.includes('--check-only')){if(fs.existsSync(target))throw Error('target exists');console.log(JSON.stringify({preflight:true,target,bytes:Buffer.byteLength(source),sha256:hash(source),priorFiles:Object.keys(old.files).length}));process.exit(0);}
if(fs.existsSync(target)){if(hash(fs.readFileSync(target))!==hash(source))throw Error('target collision');console.log(JSON.stringify({alreadyApplied:true,target,sha256:hash(source)}));process.exit(0);}
if(fs.existsSync(receipt))throw Error('receipt collision');fs.writeFileSync(target,source,{encoding:'utf8',flag:'wx'});
const record={schema:1,unit:'FT-003.37a.1',target,sha256:hash(source),priorFiles:Object.keys(old.files).length,limits:'Mapeamento declarativo trivial dos3ramos do tipo canônico para Valibot; não execução de testes comportamentais, Provenance, JSON ou finanças.'};fs.writeFileSync(receipt,JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify(record));
