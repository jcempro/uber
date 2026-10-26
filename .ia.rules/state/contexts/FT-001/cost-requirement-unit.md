# FT-003.11 — aplicabilidade explícita das rubricas

Worker subordinado. Base07cc417,75 testes/tipos/lint de referências aceitos. Criar SOMENTE src/domain/cost-requirement.ts, um alias CostRequirement e import type {Provenance} from './model'. Arquivo novo/~25linhas; uma leitura desta unidade, margem32K. Sem modelos/valores/entidades antigos a editar, dados/defaults/funções/cálculo/UI/JSON/Git/Worker/dependência. Supervisor assume commit.

CostRequirement: base readonly {id:string;name:string;category:string;provenance:Provenance} & união parentetizada com3 ramos readonly:

- {status:'unverified';reason:string;costItemIds?:never}: incidência/aplicabilidade ainda não esclarecida, não custo0.
- {status:'applicable';costItemIds:readonly [string,...string[]];reason?:string}: pelo menos uma referência obrigatória. Indica aplicabilidade declarada, NÃO preço válido, item ativo, vigência ou cobertura comprovada. Razão adicional pode documentar contexto.
- {status:'not-applicable';reason:string;costItemIds?:never}: inaplicabilidade expressa com fundamento, sem valores/referências ativos escondidos. Não é confirmação de custo0.

Todos campos, objetos e tuple readonly. category é código aberto, compatível com categorias de CostItem; scope só em provenance.scope (sem fonte paralela). IDs/motivos são dados brutos: não provar não-vazio, unicidade, legalidade, existência/atividade/competência de referência por tipo. Mudar estado não autoriza apagar lançamentos históricos/CostItems; controlador futuro preservará dados. Cobertura global exige validar TODAS rubricas materialmente pertinentes, valores/referências/incidências e não duplicação, não apenas este discriminante.

Fonte normativa: RCF§4 distingue ausência/NA/zero; RCF§8.119 só permite afirmar cobertura integral quando rubricas aplicáveis identificadas/parametrizadas/computadas ou NA com fundamento; desconhecidas tornam dependências incompletas/condicionais. Fonte literal já recuperada cost-model-rcf.json se necessária, não reler RCF inteiro/unidades anteriores nem copiar exemplos financeiros privados como preços atuais.

Cabeçalho MPL/link/origemRCF§§4/8, FT-003.11, autoria JeanCarloEM <jeancarlo@jeancarloem.com>; JSDoc útil no alias e imediatamente antes de cada ramo. Não criar helper/interface extra, enum, any, casts ou valores runtime. Formas distribuídas equivalentes são aceitas se mantiverem base em TODOS ramos, obrigatoriedade/readonly/nonempty.

Ler uma vez, escrever e executar run_authorized_command({"id":"validar_aplicabilidade_tipada"}); NÃO run_command/Node/npm/eval ou NEEDS_SUPERVISOR como ferramenta. Comando fornecido exige1 alias/readonly/fontes anteriores intactas, strict com controles negativos independentes e lint. Não modificar critérios para aprovação. Saída≤60palavras: execução real e validação runtime/financeira pendente. Não declarar custos completos/matriz18/viabilidade/RCF global por esse contrato.
