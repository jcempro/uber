# FT-003.13c — testes específicos das sementes
Worker subordinado. Baseb48cd71. Unidade única: criar SOMENTE src/domain/initial-scenarios.test.ts (~90linhas); nenhum fonte anterior a editar. initial-scenarios.ts já criado/revisado, tipos/lint/86regressões passaram; faltam9controles específicos da FT003.13. Ler esta unidade e o arquivo43linhas de sementes; não repetir exploração/ler unidades antigas/defaults inteiro. Bindings necessários abaixo; normas aplicáveis preservadas.

Imports de vitest describe/it/expect; node:fs readFileSync; de ./initial-scenarios INITIAL_SCENARIOS,INITIAL_EVALUATION_CONTEXTS; de ./defaults INITIAL_PROFILE_REFERENCES,INITIAL_VEHICLES,INITIAL_FUEL_CONFIGURATIONS,INITIAL_CALENDARS,INITIAL_WORK_SCHEDULES,INITIAL_FINANCIAL_OBJECTIVES; createEvaluationContexts de ./contexts. Parâmetros/valores financeiros não precisam leitura/cópia.

Expectativas independentes: ler RCF.md canônico com new URL('../../RCF.md',import.meta.url); extrair números de "(3) perfis × (3) jornadas × (2) objetivos = (18) contextos" por regex. Fonte ausente/incompatível DEVE falhar explicitamente, sem fallback. Não obter cardinalidade esperada dos mesmos exports testados. Bindings são os cadastros aceitos do defaults; seed referencia vehicleId/fuelConfigurationId/calendarId/referenceProfileId e contexto scenarioId/scheduleId/objectiveId. Produto aceita arrays readonly e só cenários enabled. Dados hipotéticos/financeiros não são prova de lucro.

Criar≥9it úteis e independentes (agrupar somente asserções relacionadas):
1 cenários têm cardinalidade canônica, IDs únicos, nomes/perfis correspondem a INITIAL_PROFILE_REFERENCES, enabled true;
2 total de contextos igual à fonte e IDs únicos; por cenário cardinalidade jornadas×objetivos (=6 derivado da fonte);
3 veículo único existente, combustível existente pertence ao veículo e é seu default, calendário válido, sem referência órfã;
4 cada combinação cenário/jornada/objetivo aparece exatamente1vez e ambas metas explícitas;
5 congelamento profundo dos exports/cenários/listas/provenance/scope; escopos próprios e catálogos anteriores continuam congelados, sem referências mutáveis compartilhadas;
6 export de contextos igual ao gerador com mesmos cadastros/ordem; repetir geração não altera seeds/defaults (snapshot do estado antes/depois da chamada);
7 cenário customizado com novo ID/referenceProfileId:null adiciona jornadas×objetivos sem eliminar contextos iniciais; não fechar tipos a3perfis;
8 desabilitar um cenário numa cópia reduz só seus6contextos e preserva original ativo;
9 proveniência de cada cenário current-decision/confirmed/sourceRCF§§4/7/date+competence null/scope próprio; listas só referências e contextos só4campos de identidade (sem números financeiros inventados). Ausência inicial de CostItems NÃO é custo0. NÃO exigir listas vazias para sempre: custos legítimos serão incorporados depois.

Não repetir algoritmo de produção para obter cardinalidade; examinar pares distintos contra combinações da fonte. Não alterar testes antigos, relaxar verificações, usar skips/todo/any/supressões, inserir dependências/custos/cálculos/UI/Git/Worker. Cabeçalho MPL2/link/origemRCF§§4/7 F01 FT003.13c/autoria JeanCarloEM <jeancarlo@jeancarloem.com>. Helpers, se necessários, com JSDoc útil. Não criar framework nem abstração desnecessária.

Após escrever executar run_authorized_command({id:'validar_sementes_cenarios'}). Gate protege13fontes por SHA, tipos/lint/86anteriores+≥9novos (sem skips/falhas). Se falhar corrigir SOMENTE teste defeituoso desta unidade; defeito no produto requer apontar bloqueio real sem editar fonte. Saída≤60palavras:9+controles/validação executada e limites. Sem run_command/npm livre. Aceite apenas sementes/matriz estrutural; custos/cobertura/lucro/CRUD/UI/global continuam pendentes.
