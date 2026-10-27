import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const root=fs.realpathSync('.');
if(root.replaceAll('\\','/').toLowerCase()!=='d:/trampo/jcem.pro-uber')throw Error('root');
const base='.ia.rules/state/contexts/FT-001/';
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const guard=p=>{let q=root;for(const part of p.split('/')){if(!part||part==='..')throw Error('path');q=path.join(q,part);if(fs.existsSync(q)){const s=fs.lstatSync(q);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||s.isDirectory()&&fs.existsSync(path.join(q,'.git')))throw Error('linked/nested');}}};
const baseline=JSON.parse(fs.readFileSync(base+'autocalc-tax-baseline.json','utf8'));
for(const p of ['AGENTS.md','.ia.rules/core/authority.md','.ia.rules/state/continue.ia',base+'autocalc-evolution-plan.md'])fs.readFileSync(p,'utf8');
if(hash(fs.readFileSync('.ia.rules/state/requests/FT-001/autocalc-evolution.md'))!==baseline.request)throw Error('request changed');
for(const [p,h]of Object.entries(baseline.protected)){guard(p);if(hash(fs.readFileSync(p))!==h)throw Error('protected changed:'+p);}
guard('RCF.md');guard('.ia.rules/state/traceability/rcf-map.json');guard(base+'autocalc-tax-patch.json');
const before=fs.readFileSync('RCF.md','utf8');if(hash(before)!==baseline.rcf)throw Error('stale RCF; do not replay');
const edits=[
 ['Anexos adicionais futuros são consulta não vinculante, jamais fonte executável ou arquitetura.','Anexos históricos são consulta não vinculante, jamais fonte executável ou arquitetura. Especificação humana futura expressamente autorizada pode evoluir este RCF mediante conciliação rastreável; dados e exemplos continuam sujeitos à sua origem e evidência.'],
 ['`τ` = soma **documentada e aplicável** de alíquotas lineares sobre B (somente se a legislação/regras de competência realmente admitirem essa base); `q=0,10` = dízimo obrigatório de referência;','`τ` = alíquota proporcional explicitamente selecionada para o contexto, com natureza segregada entre **IR opcional de simulação sobre B**, configurado pelo usuário, e **apuração tributária legal**, que exige base/regime/competência comprovados; desativar IR simulado significa contribuição zero nessa simulação, nunca isenção legal comprovada. `q` = dízimo opcional: **0,10 obrigatoriamente quando ativado**, zero quando explicitamente desativado; padrão inicial ativado a10%, preservado como referência editável pelo controle de ativação;'],
 ['Dízimo(B) = 0,10 × B','Dízimo(B) = q × B                                [q = 0,10 ativo; q = 0 desativado]'],
 ['TributoSobreReceita(B) = τ × B                   [somente com base comprovada]','TributoSobreReceita(B) = τ × B                   [simulação identificada OU apuração legal comprovada]'],
 ['G = 1 − 0,10 − τ                                  [somente se modelo linear comprovado]','G = 1 − q − τ                                    [somente se modelo linear declarado e admissível]'],
 ['além de `G>0` e base tributária admissível.','além de `G>0` e base tributária admissível **à natureza declarada**: a regra de IR simulado sobre B é autorizada como hipótese matemática, sem exigir nem afirmar equivalência à legislação.'],
 ['- Se o usuário personalizar a alíquota de dízimo, a interface DEVE registrar **simulação alternativa**, mas **a avaliação operacional obrigatória de referência permanece 10%**; não converter inadvertidamente outro percentual em atendimento do contrato. Similarmente, a nota mínima nunca pode ser configurada abaixo de 4,80 dentro de um contexto conforme. Parâmetros configuráveis continuam sujeitos a **invariantes normativos**. [PENDENTE-CODIGO]',
 '- **Dízimo e IR:** controles de ativação independentes, origem, valor e base visíveis/editáveis; dízimo ativado tem taxa canônica10%, inclusive no prejuízo, e desativado tem contribuição explicitamente zero, sem exigir avaliação paralela obrigatória com dízimo ligado. Percentual alternativo previamente personalizável permanece apenas como **simulação alternativa identificada**, nunca substitui a taxa canônica10% quando ativa. IR opcional utiliza a alíquota configurada sobre **receita creditada B**, nunca preço ao passageiro ou lucro; sua ativação é parâmetro financeiro, não acelerador. A UI distingue regra de simulação de apuração tributária legal e não permite que desativação/ausência de IR simulado apague encargos legais efetivamente aplicáveis. A nota mínima permanece4,80 nos contextos conformes. [PENDENTE-CODIGO]'],
 ['representar o modelo tributário validado e resolver','representar o modelo tributário compatível com a natureza declarada (simulação ou apuração legal validada) e resolver'],
 ['Se falta `τ`, permitir hipótese explícita acompanhada de status **condicional**, nunca `τ=0` como isenção comprovada.','IR simulado explicitamente desativado é contribuição zero apenas nessa simulação; se ativado e falta `τ`, suspender somente resultados dependentes. Outros encargos legais ausentes permanecem incompletos/condicionais, nunca `τ=0` como isenção comprovada.'],
 ['dízimo=10% de **B**, mesmo no prejuízo.','dízimo ativado=10% de **B**, mesmo no prejuízo; desativado=zero explícito no cenário. IR opcional usa alíquota configurada sobre **B** como simulação identificada, sem atestar apuração legal.'],
 ['`τ=0` não prova inexistência de encargo; ausência bloqueia o que for materialmente dependente ou torna resultado explicitamente condicional.','IR opcional de simulação sobre B não exige prova de regime legal para ser calculado como hipótese; apuração legal continua dependente das fontes pertinentes. Desativar IR simulado ou usar `τ=0` não prova inexistência de encargo legal; ausência bloqueia somente resultados materialmente dependentes ou os torna explicitamente condicionais.']
];
let after=before;for(const [old,value]of edits){if(after.split(old).length!==2)throw Error('nonunique or missing anchor:'+old.slice(0,60));after=after.replace(old,value);}
const require=createRequire(import.meta.url);const trace=require(path.join(root,'.ia.rules/core/runtime/scripts/rcf-trace.js'));
const map=JSON.parse(fs.readFileSync('.ia.rules/state/traceability/rcf-map.json','utf8'));
const oldLines=before.split('\n'),newLines=after.split('\n');if(oldLines.length!==newLines.length)throw Error('unexpected line displacement');
const changed=oldLines.map((v,i)=>v===newLines[i]?null:i).filter(v=>v!==null);
const plans=changed.filter(i=>trace.isMaterialLine(newLines[i])).map(i=>{const id=trace.sentenceId('RCF.md',oldLines[i]);const entry=map.entries.find(x=>x.id===id);if(!entry){if(trace.isMaterialLine(oldLines[i]))throw Error('missing prior material trace:'+i);return {line:i+1,oldId:null,artifacts:['src/domain/model.ts','src/domain/model-scenarios.ts'],ft:'FT-003'};}if(entry.state!=='pending'||!entry.artifacts.length)throw Error('nonpending trace:'+i);return {line:i+1,oldId:id,artifacts:entry.artifacts,ft:entry.ft};});
if(process.argv.includes('--check-only')){console.log(JSON.stringify({preflight:true,edits:edits.length,changedLines:changed.map(i=>i+1),prepared:plans.length}));process.exit(0);}
fs.writeFileSync('RCF.md',after,'utf8');
for(const p of plans)trace.prepare(root,'RCF.md',p.artifacts,{ft:p.ft,lines:[String(p.line)]});
const final=fs.readFileSync('RCF.md','utf8');
const receipt={schema:1,unit:'FT-010.1',before:hash(before),after:hash(final),request:baseline.request,edits:edits.length,changedLines:changed.map(i=>i+1),prepared:plans,limits:'Norma parcial: sem implementação financeira, margem/teto/modo autônomo ainda pendentes; registros anteriores de sentenças alteradas preservados pelo prepare oficial, não comprovam cobertura atual.'};
fs.writeFileSync(base+'autocalc-tax-patch.json',JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({unit:receipt.unit,edits:receipt.edits,lines:receipt.changedLines,prepared:plans.length,after:receipt.after}));
