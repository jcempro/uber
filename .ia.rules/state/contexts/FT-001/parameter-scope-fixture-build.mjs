/** MPL-2.0 — https://www.mozilla.org/MPL/2.0/; jcem.pro-uber, FT-003.37a.2b. Gerador interno de testes, não runtime do aplicativo. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {array,boolean,literal,optional,picklist,safeParse,strictObject,string,unknown} from 'valibot';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
const profile=process.argv[2]||'scope';if(!['scope','provenance'].includes(profile))throw Error('profile');
const prefix=profile==='scope'?'parameter-scope':'provenance',stem=profile==='scope'?'parameter-scope-schema':'provenance-schema',exportName=profile==='scope'?'PARAMETER_SCOPE_STRUCTURE_SCHEMA':'PROVENANCE_STRUCTURE_SCHEMA',unit=profile==='scope'?'FT-003.37a.2b':'FT-003.37b.2';
const base='.ia.rules/state/contexts/FT-001/',catalogPath=base+prefix+'-cases.json',receiptPath=base+prefix+'-fixture-build-check.json',target='src/domain/'+stem+'.test.ts',hash=x=>crypto.createHash('sha256').update(x).digest('hex');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
for(const p of ['AGENTS.md','.ia.rules/core/authority.md','.ia.rules/state/continue.ia',base+prefix+'-cases-unit.md'])fs.readFileSync(p,'utf8');
const approved=JSON.parse(fs.readFileSync(base+prefix+'-tests-baseline.json','utf8'));for(const [p,h]of Object.entries(approved.files))if(hash(fs.readFileSync(p))!==h)throw Error('protected source:'+p);
for(const p of [catalogPath,receiptPath,target])guard(p);if(!fs.existsSync(catalogPath))throw Error('Create JSON case catalog first; no tests generated or executed');
const kinds=['canonical','shape',profile==='scope'?'identifier':'required-fields','unknown-keys','issue-path','immutability'];
const format=strictObject({schema:literal(1),groups:array(strictObject({group:picklist(kinds),cases:array(strictObject({id:string(),input:unknown(),success:boolean(),path:optional(string()),ownKey:optional(picklist(['constructor','__proto__']))}))}))});
const raw=fs.readFileSync(catalogPath),catalog=JSON.parse(raw);const parsed=safeParse(format,catalog);if(!parsed.success)throw Error('catalog shape:'+JSON.stringify(parsed.issues));
if(catalog.groups.length!==6||new Set(catalog.groups.map(g=>g.group)).size!==6)throw Error('six unique groups');
const ids=new Set();for(const g of catalog.groups){if(!g.cases.length)throw Error('empty group');for(const c of g.cases){if(!c.id.trim()||ids.has(c.id)||!Object.hasOwn(c,'input'))throw Error('case identity/input');ids.add(c.id);}}
const group=n=>catalog.groups.find(g=>g.group===n);
if(profile==='scope'&&['global','vehicle','scenario'].some(k=>!group('canonical').cases.some(c=>c.success&&c.input?.kind===k)))throw Error('canonical branch coverage');
if(profile==='provenance'){const valid=group('canonical').cases.filter(c=>c.success),fields=['kind','source','date','competence','scope','reliability'];if(new Set(valid.map(c=>c.input?.kind)).size<9||new Set(valid.map(c=>c.input?.reliability)).size<5)throw Error('canonical enum coverage');for(const field of fields)if(!group('required-fields').cases.some(c=>!c.success&&c.input&&typeof c.input==='object'&&!Object.hasOwn(c.input,field)&&fields.filter(other=>other!==field).every(other=>Object.hasOwn(c.input,other))))throw Error('isolated missing field coverage:'+field);}
for(const n of ['shape',kinds[2],'unknown-keys','issue-path'])if(!group(n).cases.some(c=>!c.success))throw Error('negative group missing');
for(const key of ['constructor','__proto__'])if(!group('unknown-keys').cases.some(c=>!c.success&&c.ownKey===key&&c.input&&Object.hasOwn(c.input,key)))throw Error('own-key coverage');
for(const key of (profile==='scope'?['vehicleId','scenarioId']:['source','scope.vehicleId']))if(!group('issue-path').cases.some(c=>!c.success&&c.path===key))throw Error('issue path coverage');
if(!group('immutability').cases.some(c=>c.success)||!group('immutability').cases.some(c=>!c.success)||group('immutability').cases.some(c=>!c.input||typeof c.input!=='object'||Array.isArray(c.input)))throw Error('immutable positive/negative objects');
const source=`/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§4/${unit}; catálogo ${prefix}-cases.json.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 * Gerado pelo harness interno; expectativas vêm do contrato canônico, não do schema executado.
 */
import { describe, expect, it } from 'vitest';
import { safeParse } from 'valibot';
import { ${exportName} } from './${stem}';

/** Caso sintético de teste; não representa cadastro nem dado financeiro. */
interface ScopeCase { readonly id: string; readonly input: unknown; readonly success: boolean; readonly path?: string; readonly ownKey?: string; }
/** Grupo de um requisito observável independente. */
interface ScopeGroup { readonly group: string; readonly cases: readonly ScopeCase[]; }
// JSON.parse preserva __proto__ como propriedade própria; object literal não comprovaria esse controle negativo.
const groups = JSON.parse(${JSON.stringify(JSON.stringify(catalog.groups))}) as readonly ScopeGroup[];

describe('${profile==='scope'?'Escopos estruturais':'Proveniência estrutural'} — oráculos canônicos independentes', () => {
  for (const group of groups) {
    it(group.group, () => {
      for (const fixture of group.cases) {
        const input = fixture.input;
        if (fixture.ownKey) {
          if (input === null || typeof input !== 'object') throw new Error('Fixture de chave própria exige objeto');
          expect(Object.hasOwn(input, fixture.ownKey), fixture.id).toBe(true);
        }
        const before = JSON.stringify(input);
        if (group.group === 'immutability') {
          Object.freeze(input);
          ${profile==='provenance'?"if (input !== null && typeof input === 'object') { const nested: unknown = Reflect.get(input, 'scope'); if (nested !== null && typeof nested === 'object') Object.freeze(nested); }":''}
        }
        const result = safeParse(${exportName}, input);
        expect(result.success, fixture.id).toBe(fixture.success);
        if (group.group === 'required-fields') {
          if (input === null || typeof input !== 'object' || Array.isArray(input)) throw new Error('Fixture de campo omitido exige objeto');
          const fields = ['kind', 'source', 'date', 'competence', 'scope', 'reliability'];
          const missing = fields.filter(key => !Object.hasOwn(input, key));
          const missingKey = missing[0];
          if (missing.length !== 1 || missingKey === undefined) throw new Error('Omitir exatamente um campo por controle');
          const reference = groups.find(item => item.group === 'canonical')?.cases.find(item => item.success)?.input;
          if (reference === null || typeof reference !== 'object' || Array.isArray(reference)) throw new Error('Base canônica ausente');
          // Restaurar só o campo omitido deve tornar os demais cinco campos um controle positivo independente.
          const restored = { ...input };
          Object.defineProperty(restored, missingKey, { value: Reflect.get(reference, missingKey), enumerable: true });
          expect(safeParse(${exportName}, restored).success, fixture.id + ': campo restaurado').toBe(true);
        }
        if (result.success) expect(result.output, fixture.id).toEqual(input);
        else if (fixture.path) expect(result.issues.some(issue => ${profile==='scope'?'issue.path?.some(item => item.key === fixture.path)':"issue.path?.map(item => String(item.key)).join('.') === fixture.path"}), fixture.id).toBe(true);
        expect(JSON.stringify(input), fixture.id).toBe(before);
        if (group.group === 'immutability') {
          expect(Object.isFrozen(input), fixture.id).toBe(true);
          expect(safeParse(${exportName}, input), fixture.id).toEqual(result);
        }
      }
    });
  }
});
`;
if(fs.existsSync(target)){if(!fs.existsSync(receiptPath))throw Error('unowned test target');const old=JSON.parse(fs.readFileSync(receiptPath));if(hash(fs.readFileSync(target))!==old.testSha256)throw Error('test changed outside generator');}
const record={schema:1,unit,catalogSha256:hash(raw),testSha256:hash(source),groups:6,cases:ids.size,target,sourceCommit:approved.sourceCommit,limits:'Formato/cobertura mecânicos não certificam verdade das expectativas; revisão supervisor obrigatória.'};
fs.writeFileSync(target,source,'utf8');fs.writeFileSync(receiptPath,JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify(record));
