/** MPL-2.0; FT-003.38a.1b. Patch literal aprovado, sem inferência ou alteração de testes. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=fs.realpathSync('.');if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
const base='.ia.rules/state/contexts/FT-001/',target='src/domain/maintenance.ts',receipt=base+'maintenance-source-materialize-check.json',hash=x=>crypto.createHash('sha256').update(x).digest('hex');
function guard(rel){let p=root;for(const part of rel.split('/')){if(!part||part==='..')throw Error('path');p=path.join(p,part);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(p,'.git')))throw Error('linked path');}}}
for(const p of ['AGENTS.md','.ia.rules/core/authority.md',base+'maintenance-source-unit.md',base+'maintenance-inactive-rcf.json']){guard(p);fs.readFileSync(p,'utf8');}
const snapshot=JSON.parse(fs.readFileSync(base+'maintenance-inactive-baseline.json','utf8'));
if(snapshot.sourceCommit!=='58b6f9b4fea6c524fc6e5f636c40a032afe05ffb')throw Error('baseline commit');
const protectedFiles={...snapshot.files,...snapshot.targets};delete protectedFiles[target];
if(Object.keys(protectedFiles).length!==71)throw Error('protection count');
function protect(){for(const [p,h]of Object.entries(protectedFiles)){guard(p);if(hash(fs.readFileSync(p))!==h)throw Error('protected:'+p);}}
protect();guard(target);guard(receipt);
if(fs.existsSync(receipt)){const r=JSON.parse(fs.readFileSync(receipt));if(r.before!==snapshot.targets[target]||hash(fs.readFileSync(target))!==r.after)throw Error('applied state differs');console.log(JSON.stringify({...r,alreadyApplied:true}));process.exit(0);}
const before=fs.readFileSync(target,'utf8');if(hash(before)!==snapshot.targets[target])throw Error('source before differs');
const changes=[
 ['Materializa parâmetros das referências iniciais; não totaliza custos nem cria pagamentos.','Materializa pendências iniciais; taxas históricas não são adotadas automaticamente.'],
 ['Sete parâmetros congelados, com estimativa e escopo de cenário preservados.','Sete parâmetros pendentes congelados, sem valor presumido, no escopo do cenário.'],
 ['    ...MAINTENANCE_REFERENCE_METADATA.provenance,','    ...MAINTENANCE_REFERENCE_METADATA.provenance,\n    kind: \'gap\' as const, reliability: \'unverified\' as const,'],
 ['  // Reserva estimada por km não é pagamento realizado ou cobertura dos demais custos.','  // Referência histórica não substitui parametrização ou adoção explícita fundamentada.'],
 ["    input: Object.freeze({ status: 'provided' as const, value: row.rates[profileId] }),","    input: Object.freeze({ status: 'not-provided' as const, reason: 'Manutenção pendente: informar custo ou adotar hipótese histórica com fundamento explícito.' }),"],
 ['Catálogo inicial de manutenção: parâmetros canônicos e referências de provisão, sem apuração ou cobertura dos demais custos.','Catálogo inicial de manutenção pendente, sem taxas históricas ativas ou cobertura presumida.'],
 ['Liga as reservas iniciais aos parâmetros, preservando identidade e proveniência.','Liga itens desativados aos parâmetros pendentes, preservando identidade e proveniência.'],
 ['Catálogo profundamente congelado; aplicabilidade declarada não comprova vigência, valor computado ou cobertura integral.','Catálogo profundamente congelado; manutenção pendente não equivale a zero ou inaplicabilidade.'],
 ['    name: parameter.name, category: parameter.category, enabled: true,','    name: parameter.name, category: parameter.category, enabled: false,'],
 ['  // Aplicabilidade da provisão estimada não significa pagamento, vigência comprovada ou ausência de outros custos.','  // Desativar hipótese histórica não dispensa a revisão da incidência/custo de manutenção.'],
 ["    status: 'applicable' as const, costItemIds: Object.freeze([item.id] as const),","    status: 'unverified' as const, reason: 'Incidência e parametrização da manutenção pendentes; referência histórica não adotada.' ,"],
];
let after=before;for(const [from,to]of changes){if(after.split(from).length!==2)throw Error('literal precondition:'+from);after=after.replace(from,to);}
const record={schema:1,unit:'FT-003.38a.1b',predecessor:'c1d42c6f-30e6-455f-a534-64d6dae398b2',target,before:hash(before),after:hash(after),substitutions:changes.length,protectedFiles:71,limits:'Fonte parcial; testes/seed e adoção explícita permanecem pendentes. Não certifica finanças.'};
fs.writeFileSync(target,after);protect();fs.writeFileSync(receipt,JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify(record));
