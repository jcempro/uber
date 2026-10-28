/** MPL-2.0; FT-003.38a.2. Atualização literal de oráculos após evolução canônica, sem consultar implementação para expectativas. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
const base='.ia.rules/state/contexts/FT-001/',receipt=base+'maintenance-tests-materialize-check.json',hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const paths=['src/domain/maintenance.test.ts','src/domain/initial-scenarios.test.ts','src/domain/initial-scenarios.ts'];
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked');}}}
for(const p of ['AGENTS.md','.ia.rules/core/authority.md',base+'maintenance-tests-unit.md',base+'maintenance-inactive-rcf.json']){guard(p);fs.readFileSync(p,'utf8');}
const baseline=JSON.parse(fs.readFileSync(base+'maintenance-inactive-baseline.json','utf8'));
if(baseline.sourceCommit!=='58b6f9b4fea6c524fc6e5f636c40a032afe05ffb')throw Error('baseline');
const protectedFiles={...baseline.files,'src/domain/maintenance.ts':'5e6f9353ed33cc9b78d416cf2ff2a0278119cb4ac193e2fc09b9b7be77207f89'};
function protect(){for(const [p,h]of Object.entries(protectedFiles)){guard(p);if(hash(fs.readFileSync(p))!==h)throw Error('protected:'+p);}}
protect();for(const p of [...paths,receipt])guard(p);
if(fs.existsSync(receipt)){const r=JSON.parse(fs.readFileSync(receipt));for(const p of paths)if(hash(fs.readFileSync(p))!==r.files[p].after)throw Error('applied state differs:'+p);console.log(JSON.stringify({...r,alreadyApplied:true}));process.exit(0);}
const before=Object.fromEntries(paths.map(p=>[p,fs.readFileSync(p,'utf8')]));for(const p of paths)if(hash(before[p])!==baseline.targets[p])throw Error('before:'+p);
const after={...before};let substitutions=0;
function replace(p,from,to){if(after[p].split(from).length!==2)throw Error('literal precondition:'+p+':'+from);after[p]=after[p].replace(from,to);substitutions++;}
const m=paths[0],s=paths[1],d=paths[2];
replace(m,"import { NUMERIC_RULES } from './validation';","import { NUMERIC_RULES } from './validation';\nimport { INITIAL_MAINTENANCE_PARAMETERS, INITIAL_MAINTENANCE_COST_ITEMS, INITIAL_MAINTENANCE_REQUIREMENTS } from './initial-scenarios';");
replace(m,`  it('preserva sete rubricas e21valores diretamente da tabela do RCF', () => {
    expect(rows).toHaveLength(7);
    for (const [index,id] of ids.entries()) {`,`  it('preserva sete rubricas do RCF sem adotar automaticamente suas taxas', () => {
    expect(rows).toHaveLength(7);
    for (const id of ids) {`);
replace(m,`      expect(result.map(p => ({name:p.name,value:p.input.status==='provided'?p.input.value:undefined})))
        .toEqual(rows.map(row => ({name:row[0],value:row[index+1].replace(',','.')})));`,`      expect(result.map(p => p.name)).toEqual(rows.map(row => row[0]));
      for (const p of result) {
        expect(p.input.status).toBe('not-provided');
        expect(p.input).not.toHaveProperty('value');
      }`);
replace(m,"confere somas dos parâmetros com os totais derivados canônicos, sem nova entrada de total","preserva totais apenas na tabela histórica, sem total operacional presumido");
replace(m,`      const values = result.map(p => { if(p.input.status!=='provided') throw new Error('Valor canônico ausente'); return p.input.value; });`,`      const values = MAINTENANCE_RATE_REFERENCES.map(row => row.rates[id]);
      expect(result.every(p => p.input.status === 'not-provided')).toBe(true);`);
replace(m,'mantém unidade, domínio e estimativa em escopo de cenário, sem pagamento ou cobertura presumidos','mantém unidade e domínio com lacuna explícita em escopo de cenário');
replace(m,"{kind:'estimate',source:'RCF.md §6.2',date:null,competence:null,scope:{kind:'scenario',scenarioId:'scenario-'+id},reliability:'estimated'}","{kind:'gap',source:'RCF.md §6.2',date:null,competence:null,scope:{kind:'scenario',scenarioId:'scenario-'+id},reliability:'unverified'}");
replace(m,"      expect(p.input.status).toBe('provided');","      expect(p.input.status).toBe('not-provided');");
replace(m,`  it('liga sete reservas e requisitos aos parâmetros canônicos sem duplicar quantias', () => {
    for (const [index,id] of ids.entries()) {`,`  it('liga sete itens pendentes aos parâmetros sem duplicar quantias', () => {
    for (const id of ids) {`);
replace(m,`      expect(catalog.parameters.map(p=>({name:p.name,value:p.input.status==='provided'?p.input.value:undefined})))
        .toEqual(rows.map(row=>({name:row[0],value:row[index+1].replace(',','.')})));`,`      expect(catalog.parameters.map(p=>p.name)).toEqual(rows.map(row=>row[0]));
      expect(catalog.parameters.every(p=>p.input.status==='not-provided')).toBe(true);`);
replace(m,"name:p?.name,category:p?.category,enabled:true,nature:'usage-variable'","name:p?.name,category:p?.category,enabled:false,nature:'usage-variable'");
replace(m,"          status:'applicable',costItemIds:[item.id],",String.raw`          status:'unverified',reason:expect.stringMatching(/\S/),`);
const controls=String.raw`
  it('RCF vigente impede taxa operacional implícita ou zero em todos os perfis', () => {
    expect(section).toContain('O sistema NÃO DEVE impô-los como custos operacionais ativos por padrão');
    for (const profile of ids) {
      const pending = createInitialMaintenanceParameters('no-adoption-'+profile,profile);
      expect(pending).toHaveLength(rows.length);
      for (const parameter of pending) {
        expect(parameter.input).toEqual({status:'not-provided',reason:expect.stringMatching(/\S/)});
        expect(parameter.input).not.toHaveProperty('value');
        expect(parameter.provenance.kind).toBe('gap');
        expect(parameter.provenance.reliability).toBe('unverified');
      }
    }
  });
  it('cenários iniciais mantêm manutenção pendente sem itens ativos ou adoção por perfil', () => {
    expect(section).toContain('hipótese opcional explicitamente adotada');
    const count = ids.length * rows.length;
    expect(INITIAL_MAINTENANCE_PARAMETERS).toHaveLength(count);
    expect(INITIAL_MAINTENANCE_COST_ITEMS).toHaveLength(count);
    expect(INITIAL_MAINTENANCE_REQUIREMENTS).toHaveLength(count);
    for (const parameter of INITIAL_MAINTENANCE_PARAMETERS) {
      expect(parameter.input).toEqual({status:'not-provided',reason:expect.stringMatching(/\S/)});
      expect(parameter.input).not.toHaveProperty('value');
    }
    for (const item of INITIAL_MAINTENANCE_COST_ITEMS) expect(item.enabled).toBe(false);
    for (const requirement of INITIAL_MAINTENANCE_REQUIREMENTS) {
      expect(requirement.status).toBe('unverified');
      expect(requirement).not.toHaveProperty('costItemIds');
      expect(requirement.status==='unverified' && /\S/.test(requirement.reason)).toBe(true);
    }
  });
`;
replace(m,'\n});\n',controls+'\n});\n');
replace(s,'materializa as taxas de cada perfil uma vez, diretamente da tabela canônica','preserva rubricas de cada perfil como pendências, sem taxas históricas operacionais');
replace(s,'    for (const [index,s] of scenarios.entries()) {','    for (const s of scenarios) {');
replace(s,`      expect(own.map(p=>({name:p?.name,value:p?.input.status==='provided'?p.input.value:undefined})))
        .toEqual(rates.map(row=>({name:row[0],value:row[index+1].replace(',','.')})));`,`      expect(own.map(p=>p?.name)).toEqual(rates.map(row=>row[0]));
      for (const parameter of own) {
        expect(parameter?.input.status).toBe('not-provided');
        expect(parameter?.input).not.toHaveProperty('value');
      }`);
replace(s,"        expect(reqs.filter(r=>r.status==='applicable' && r.costItemIds.length===1 && r.costItemIds[0]===item.id)).toHaveLength(1);",String.raw`        expect(item.enabled).toBe(false);
        const matches = reqs.filter(r=>r.category===item.category);
        expect(matches).toHaveLength(1);
        const requirement = matches[0];
        expect(requirement.status).toBe('unverified');
        expect(requirement).not.toHaveProperty('costItemIds');
        expect(requirement.status==='unverified' && /\S/.test(requirement.reason)).toBe(true);`);
replace(d,'Parâmetros individuais canônicos por cenário, sem total derivado como entrada adicional.','Parâmetros individuais pendentes por cenário, sem taxa histórica ou total presumido.');
replace(d,'Provisões estimadas por km; não representam pagamento ou cobertura dos demais custos.','Itens iniciais de manutenção desativados enquanto a parametrização estiver pendente.');
replace(d,'Aplicabilidade declarada das reservas de manutenção; vigência e cobertura global ainda exigem apuração.','Pendências de manutenção; desativar a referência histórica não comprova inaplicabilidade ou custo zero.');
const files=Object.fromEntries(paths.map(p=>[p,{before:hash(before[p]),after:hash(after[p])}]));
const record={schema:1,unit:'FT-003.38a.2',sourceCommit:'c9aa3d1',substitutions,files,protectedFiles:Object.keys(protectedFiles).length,limits:'Atualização normativa de oráculos; a aprovação exige execução integral posterior, sem atestar adoção/ledger/UI/finanças.'};
if(process.argv.includes('--preflight')){console.log(JSON.stringify({...record,preflight:true}));process.exit(0);}
for(const p of paths)fs.writeFileSync(p,after[p]);protect();fs.writeFileSync(receipt,JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify(record));
