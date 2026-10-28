/** MPL-2.0; FT-003.38b.1a. Composição declarativa mínima Valibot, sem fábrica financeira. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
const profile=process.argv[2]||'schema';if(!['schema','factory','period'].includes(profile))throw Error('profile');
const prefix=profile==='period'?'cost-period':profile==='schema'?'maintenance-adoption-schema':'maintenance-adoption-factory',stem=profile==='period'?'cost-period':profile==='schema'?'maintenance-adoption-schema':'maintenance-adoption',unit=profile==='period'?'FT-003.39.1a':profile==='schema'?'FT-003.38b.1a':'FT-003.38b.1c';
const base='.ia.rules/state/contexts/FT-001/',sourcePath='src/domain/'+stem+'.ts',testPath='src/domain/'+stem+'.test.ts',receiptPath=base+prefix+'-build-check.json',hash=v=>crypto.createHash('sha256').update(v).digest('hex');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
for(const p of ['AGENTS.md','.ia.rules/core/authority.md',base+prefix+'-unit.md']){guard(p);fs.readFileSync(p,'utf8');}
const baseline=JSON.parse(fs.readFileSync(base+prefix+'-baseline.json','utf8'));
const expected=profile==='period'?['86bdf01fd80352ac5545a8ae6c2a34128f16ead4',76,303]:profile==='schema'?['5e22e123b62d226e822ec1eb4f022a5806882a90',72,289]:['3cd7f60f5a50622f9f8f41a9468e43733b4114ba',74,295];
if(baseline.sourceCommit!==expected[0]||Object.keys(baseline.files).length!==expected[1]||baseline.priorTests!==expected[2])throw Error('baseline');
for(const [p,h]of Object.entries(baseline.files)){guard(p);if(hash(fs.readFileSync(p))!==h)throw Error('protected:'+p);}
for(const p of [sourcePath,testPath,receiptPath,base+prefix+'.test.template',...(profile!=='schema'?[base+prefix+'.source.template']:[])])guard(p);
if(fs.existsSync(receiptPath)){const r=JSON.parse(fs.readFileSync(receiptPath));if(hash(fs.readFileSync(sourcePath))!==r.sourceSha256||hash(fs.readFileSync(testPath))!==r.testSha256)throw Error('applied state differs');console.log(JSON.stringify({...r,alreadyApplied:true}));process.exit(0);}
if(fs.existsSync(sourcePath)||fs.existsSync(testPath))throw Error('target exists');
const source=profile!=='schema'?fs.readFileSync(base+prefix+'.source.template','utf8'):`/**
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
const tests=fs.readFileSync(base+prefix+'.test.template','utf8');
const record={schema:1,unit,sourceSha256:hash(source),testSha256:hash(tests),sourcePath,testPath,protectedFiles:expected[1],limits:profile==='period'?'Apenas referências e vigência; não comprova quantia, incidência, escopo, reconciliação, admissão financeira ou UI.':profile==='schema'?'Forma apenas; não implementa fábrica opcional, adoção humana, ledger ou resultado financeiro.':'Adoção explícita de hipótese; não confirma custo real/vigência, admissão financeira, ledger ou UI.'};
if(process.argv.includes('--preflight')){console.log(JSON.stringify({...record,preflight:true}));process.exit(0);}
fs.writeFileSync(sourcePath,source);fs.writeFileSync(testPath,tests);fs.writeFileSync(receiptPath,JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify(record));
