# FT-003.14a — fábrica do catálogo inicial de manutenção
Worker subordinado. Base503228e;95testes/tipos/lint aceitos. Microescopo: criar SOMENTE src/domain/maintenance.ts (~90linhas),1tipo+1função. Não instanciar nem integrar no estado/cenários nesta etapa. Exploração pronta; ler esta unidade uma vez, escrever e executar comando. Não reler RCF/model/defaults inteiros nem unidades antigas. Normas aplicáveis permanecem obrigatórias.

Imports type NumericParameter,CostItem de './model'; CostRequirement de './cost-requirement'; InitialProfileId de './defaults'. Imports valores INITIAL_PROFILE_REFERENCES,MAINTENANCE_RATE_REFERENCES,MAINTENANCE_REFERENCE_METADATA de './defaults' e NUMERIC_RULES de './validation'.
Bindings canônicos já aceitos: profiles readonly [{id:'optimistic'|'balanced'|'pessimistic',name}], rates readonly7rows {id:string,name:string,rates:Readonly<Record<InitialProfileId,string>>}, metadata {unit:'BRL/km',nature:CostNature,recognition:CostRecognition,provenance:Provenance}. Provenance={kind,source,date,competence,scope,reliability}; valores da metadata são estimate/estimated,RCF.md§6.2,datesnull,usage-variable/planned-reserve. NÃO copiar números/literais de taxas: usar row.rates[profileId] sem aritmética/Number/total.

Export type InitialMaintenanceCatalog = {readonly parameters:readonly NumericParameter[];readonly items:readonly CostItem[];readonly requirements:readonly CostRequirement[]}.
Export function createInitialMaintenanceCatalog(scenarioId:string,profileId:InitialProfileId):InitialMaintenanceCatalog. Argumentos classificam APENAS sementes da tabela inicial, não restringem cadastro geral de cenários. Antes de gerar: typeof scenarioId==='string' e scenarioId.trim() não vazio; perfil deve existir em INITIAL_PROFILE_REFERENCES. Inválidos lançam Error pt-BR com campo/motivo; não normalizar ID (trim só teste de vazio). Sem efeitos nos argumentos/catálogos/importados.

Construir provenance congelada copiando metadata.provenance e substituindo SÓ scope por {kind:'scenario',scenarioId} congelado. Para cada row gerar:
- parameterId=JSON.stringify(['maintenance-rate',scenarioId,row.id]);
- itemId=JSON.stringify(['maintenance-reserve',scenarioId,row.id]);
- requirementId=JSON.stringify(['maintenance-requirement',scenarioId,row.id]).
IDs raw preservados, estáveis, sem colisões por delimitador/aleatoriedade/Date.
NumericParameter congelado: id=parameterId,name=row.name,unit=metadata.unit,category=row.id,input congelado {status:'provided',value:row.rates[profileId]},provenance,required:true,constraints:NUMERIC_RULES.nonNegative,dependencies:readonly[] congelado. Valor/unidade SSOT somente neste parâmetro.
CostItem congelado: id=itemId,name=row.name,category=row.id,enabled:true,nature=metadata.nature,basis congelada {kind:'usage',unit:'km'},amountParameterId=parameterId,provenance,validity congelada {start:null,end:null},recognition=metadata.recognition,eventId:null,reconcilesReserveId:null,allocationRuleId:null. null não comprova vigência nem pagamento.
CostRequirement congelado: id=requirementId,name=row.name,category=row.id,provenance,status:'applicable',costItemIds tuple readonly[itemId] congelado. Declara incidência planejada daquela reserva, NÃO valor validado/cobertura integral/todos custos/resultado real. Sem booleano complete/zero/fixedcost implícito.

Congelar3arrays e objeto retornado; manter cada objeto/input/basis/validity/provenance/scope/refs imutável. Compartilhar somente objetos já congelados. Não totalizar ou criar parâmetro de soma. Não tocar custo de combustível/financiamento/seguro/tributos/despesas reais, nem criar pagamento ou reconciliar lançamento fictício. Sem dependência nova/helper genérico/framework/any/supressão/cast de fuga. Tipagem contextual/as const legítimo para discriminantes/tuple. Helpers só se necessários e documentados.

Cabeçalho MPL2/link/origemRCF§§4/6.2/8 FT003.14a/autoria JeanCarloEM <jeancarlo@jeancarloem.com>. JSDoc útil no tipo e função: finalidade,param,retorno,erros/ausência de efeitos/limites; comentário seletivo sobre reserva estimada vs pagamento/custo completo.

Executar run_authorized_command({id:'validar_fabrica_manutencao'}). Gate14fontes anteriores intactas, AST2exports/tipos/lint/95regressões. TESTES FUNCIONAIS DA FÁBRICA NÃO INCLUÍDOS AQUI: obrigatórios na próxima unidade antes de integração/aceite. Saída≤60palavras com execução real/limites. Sem run_command/npm livre, Git/Worker/deps/cálculos/UI. Supervisor assume commit parcial após revisão; não declarar completo FT003/RCF/financeiro.
