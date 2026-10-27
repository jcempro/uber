# FT-003.37a — esquema estrutural de escopo

Worker subordinado. Base8ad3820, norma conciliada/autocalc-source-audit.md, última suíte275. Valibot1.5.0 instalado/MIT/sem dependências runtime/sideEffectsfalse; não reinstalar nem refazer seleção/exploração do77533307 (falhou por leituras repetidas sem schemas). Esta unidade é menor: só ParameterScope, não Provenance/JSON/ledger/finanças/UI. Código e6testes pequenos, contexto previsto com margem em32K incluindo normas/ferramentas/saída. Ler arquivos obrigatórios antes de escrever; não carregarRCF89KB,historycontinue.ia oubaseline volumosa.

Implementar src/domain/parameter-scope-schema.ts exportando PARAMETER_SCOPE_STRUCTURE_SCHEMA com Valibot instalado, imports nomeados: variant,strictObject,literal,pipe,string,check e tipo GenericSchema conforme necessário. Importar type ParameterScope do model.ts (fonte canônica). global sókind; vehicle exigevehicleId; scenario exigescenarioId. Objetos estritos: chaves extras rejeitadas, não removidas. IDsstrings não vazias apóstrim de inspeção, mas preservar texto literal (espaços externos válidos não são transformados). Semcoerção/default/castqueapagueincompatibilidadedetipos. Schema tipado compatível com modelo, reutilizável posteriormente porProvenance. Documentar cabeçalho/licença/autoria como model.ts e contrato/limites da exportação. Não duplicar parsermanual/catálogo financeiro.

Escrever parameter-scope-schema.test.ts, Vitest+safeParse, >=6 controles relevantes com expectativas derivadas do modelo/RCF4:
1. Os3ramos canônicos aceitos; todospreservam IDs literais, sem normalização.
2. Rejeitar tipo/discriminador inválido, IDdeoutroescopo, ID ausente/nulo/número e global comID.
3. Rejeitar IDsstring vazia/branca (espaço/tab/linhavazia) sem coerção para0/texto.
4. Rejeitar chaves extras, inclusive propriedades próprias constructor/__proto__ de JSON.parse; sem alegar defesa contra grafosJShostis/herança arbitrária.
5. Diagnóstico localiza campo vehicleId/scenarioId inválido; teste distingue falhas, não depende de texto inglês da biblioteca como UI.
6. Entrada congelada não émutada e chamadasrepetidasproduzem mesmasaídas/erros; modelo não prova existência real doID/referência, escopovigente ouprecedência.

Testes não extraem expectativa do próprio schema, não repetem só counts; cobrir negativos. Não tocar65arquivos domain anteriores/modelo/testesaceitos/package/lock. Sem PropriedadesProvenance nestaetapa. Schemas não atestam existência de referências, veracidade de fontes, aplicação de escopo ou completude financeira.

Comando obrigatório verify_scope executa runner existente com perfil scope: guardas65fontes/package/SRI/lock, tipos,lint,suíteintegral>=281semfalhas/pendentes e bundleisoladoVite/ES2023/write:false. Alteração legitimada TSdev→devOptional somenteflag porpeerTypeScriptopcional Valibot>=5; versão/SRI/restanteinteirosiguais, qualqueroutrodeltafalha. Preflightjáconferidopelosupervisor; não editar verifier/baseline paraaprovar. Falha alheia exige evidência, sem redução de critério.

Atualizar docs/toolchain.md só com adoção Valibot e limites atuais: seleçãojá feita comfontes/SRI/release embaseline; ZodMini tambémtree-shakable, semvantagemnuméricainventada; custo medidoisoladodesteprofile não é deltaapp/browsertest. Pode referenciar relatório do runner. Corrigir alegações objetivamente obsoletas de ausência de núcleo financeiro se presentes, preservando evidência histórica; não declarar solver/UI/financeiro completo. Não reescreverdocumentointeiro. Depois não repetirtestes poralteraçãoapenasdocumental.

Semrede/commit/novasdependências. required_change_paths2fontes+docs. Primeiro criar schema/testes, executar verify_scope, fixar somenteestaunidade se necessário. Retorno factual mínimo: arquivos/relatório/limites. Commit é do supervisor; alterações package/lock herdadas sóserão versionadas após validação do uso. Provenance permanece próxima unidade, não concluir003.37/global.
