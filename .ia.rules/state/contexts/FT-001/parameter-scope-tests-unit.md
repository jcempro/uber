# FT-003.37a.2 — comportamento dos escopos

Worker subordinado. Fonte já existe e compila/linta: commit3daa7b3, SHA54f2a3764290403a0f661d185ae1026cf4c109efd4e39c217da16f8d7edc6c82. Não recriar/editar schema ou reexplorar Valibot. Unidade somente1teste novo, semdoc/instalação/proveniência/financeiro/UI. Ler os5arquivos obrigatórios antes de efeito; não carregarRCF inteiro/histórico/baseline. Contexto menor que unidade anterior e com margem na janela32K.

Criar src/domain/parameter-scope-schema.test.ts usando Vitest, safeParse devalibot e PARAMETER_SCOPE_STRUCTURE_SCHEMA. Expectativas vêm do contrato canônico ParameterScope emmodel.ts eRCF4:global sókind;vehicle exigevehicleId;scenario exigescenarioId;IDsstringsnão-brancas, literais preservados;chaves extras rejeitadas. Não extrair expectativas do próprio schema. Incluir cabeçalho/licença/origem como model.ts. >=6 testes relevantes:

1. Aceitar os3ramos, preservar exatamente IDs com espaços externos, inclusive referência não cadastrada; aceitação estrutural não prova existência deID.
2. Rejeitar rootprimitivo/null/array, discriminador ausente oudesconhecido, campos trocados entrevehicle/scenario/global. Não usar coerção.
3. Rejeitar IDausente/nulo/numérico/booleano e strings vazia ou whitespace(espaço/tab/newline). A expectativa érejeição, semzero/default.
4. Rejeitar campos extras, inclusive propriedades próprias constructor e __proto__ de JSON.parse. Não usar objectliteral __proto__ como prova de propriedade própria, nem alegar defesa contra grafosJShostis/herança.
5. Falhas de vehicleId/scenarioId possuem issue com path para o campo correspondente; não depender do texto da mensagem da biblioteca, nem esconder erroatribuindoaooutrocampo.
6. Entrada congelada permanece intacta; duas execuções produzem mesmoresultado/diagnóstico. Testar positivo e negativo, não sócontagens.

Pode combinar fixtures de mesma classe emloops dentro deit; não escrever teste tautológico. Testes devemfalharcaso schemaaceiteextra,coajaIDoupercaespaços. Fonte aprovada54f2a376,65fontesanteriores,package/lock,normas/verifier/baseline não podemseralterados paraaprovar. Se umcaso indicarproblema deprodução, preservar resultado/causa e pedirdecisão dosupervisor,sem tornar teste permissivo.

Executar verify_scope_tests. Runner reutilizado profile scope protegefonteporSHA/65anteriores/package/SRI/lock, executatipos/lint/suíteintegral>=281semfalhas/pendentes e bundleisoladoViteES2023write:false. Métrica é standalone, nãodeltaapp/browserQA. Runnernão fazasseveraçãofinanceira. Gate>=6 éapenasmínimo formal, não validaqualidade:supervisorrevisaráoscontroles. Não modificar critérios ou ampliartestes semnecessidade.

Semcommit/rede/instalação/doc. Returnfactualmínimo: arquivo,relatório,saídas e limitações. Documentação da adoçãoValibot seguiráunidadecurta própriaapósevidência(bundle); não concluirtarefa003.37/global. Últimasuíte275,281éexigênciafutura. Não atribuir sourcecompilado anterior aoseuturno nem inferir lucro deestrutura.
