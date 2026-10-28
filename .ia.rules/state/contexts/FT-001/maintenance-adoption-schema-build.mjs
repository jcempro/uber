/** MPL-2.0; FT-003.38b.1a. Composição declarativa mínima Valibot, sem fábrica financeira. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
const base='.ia.rules/state/contexts/FT-001/',sourcePath='src/domain/maintenance-adoption-schema.ts',testPath='src/domain/maintenance-adoption-schema.test.ts',receiptPath=base+'maintenance-adoption-schema-build-check.json',hash=v=>crypto.createHash('sha256').update(v).digest('hex');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
for(const p of ['AGENTS.md','.ia.rules/core/authority.md',base+'maintenance-adoption-schema-unit.md']){guard(p);fs.readFileSync(p,'utf8');}
const baseline=JSON.parse(fs.readFileSync(base+'maintenance-adoption-schema-baseline.json','utf8'));
if(baseline.sourceCommit!=='5e22e123b62d226e822ec1eb4f022a5806882a90'||Object.keys(baseline.files).length!==72||baseline.priorTests!==289)throw Error('baseline');
for(const [p,h]of Object.entries(baseline.files)){guard(p);if(hash(fs.readFileSync(p))!==h)throw Error('protected:'+p);}
for(const p of [sourcePath,testPath,receiptPath,base+'maintenance-adoption-schema.test.template'])guard(p);
if(fs.existsSync(receiptPath)){const r=JSON.parse(fs.readFileSync(receiptPath));if(hash(fs.readFileSync(sourcePath))!==r.sourceSha256||hash(fs.readFileSync(testPath))!==r.testSha256)throw Error('applied state differs');console.log(JSON.stringify({...r,alreadyApplied:true}));process.exit(0);}
if(fs.existsSync(sourcePath)||fs.existsSync(testPath))throw Error('target exists');
const source=`/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/6.2, FT-003.38b.1a.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { check, literal, pipe, strictObject, string, type GenericSchema } from 'valibot';
/** Decisão explícita de simular referência histórica; fundamento textual não comprova sua verdade. */
export interface HistoricalMaintenanceAdoption {
  readonly kind: 'adopt-historical-hypothesis';
  readonly reason: string;
}
/** Confere forma e fundamento não vazio, preservando texto; não ativa custo nem prova adoção humana. */
export const HISTORICAL_MAINTENANCE_ADOPTION_SCHEMA: GenericSchema<HistoricalMaintenanceAdoption> = strictObject({
  kind: literal('adopt-historical-hypothesis'),
  reason: pipe(string(), check((value: string) => value.trim().length > 0, 'Informe o fundamento da hipótese histórica.')),
});
`;
const tests=fs.readFileSync(base+'maintenance-adoption-schema.test.template','utf8');
const record={schema:1,unit:'FT-003.38b.1a',sourceSha256:hash(source),testSha256:hash(tests),sourcePath,testPath,protectedFiles:72,limits:'Forma apenas; não implementa fábrica opcional, adoção humana, ledger ou resultado financeiro.'};
if(process.argv.includes('--preflight')){console.log(JSON.stringify({...record,preflight:true}));process.exit(0);}
fs.writeFileSync(sourcePath,source);fs.writeFileSync(testPath,tests);fs.writeFileSync(receiptPath,JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify(record));
