### 8.5 Autocálculo, aceleradores e convergência

O modo autônomo DEVE usar exclusivamente custos aplicáveis, parâmetros de consumo/desgaste, dias e limites de jornada, L%, T e opções financeiras configuradas; NÃO DEVE inferir quilometragem ou horas ótimas sem vínculo matematicamente identificável entre receita, distância e tempo; PODE derivar requisitos, faixas, condições e sensibilidade, mas não gerar K/horas fictícios por simulação; [PENDENTE-CODIGO]

Aceleradores opcionais como Kv e Vd PODEM ser usados para estimar K=Kv×Vd somente se Kv representar a rodagem total pertinente (incluindo deslocamentos sem passageiro); NÃO DEVE inferir um indicador a partir do outro quando apenas um estiver presente; outros parâmetros opcionais podem ancorar busca ou checar consistência, mas NÃO DEVE mudar a meta nem provar receita/demanda; [PENDENTE-CODIGO]

Custos completos DEVE incluir fixos (financiamento, seguro, IPVA/licenciamento, personalizados), rateados por dias trabalhados válidos sem alterar o total fixo; por km DEVE incluir combustível, óleo/filtros/câmbio automático (quando aplicável), pneus e reserva personalizada, todos com valores, durabilidade e intervalos identificáveis; NÃO DEVE impor valores, durabilidade ou provisão arbitrários; [PENDENTE-CODIGO]

Solução/eficiência DEVE priorizar simplificação, analítica, otimização determinística e algoritmos/bibliotecas consolidados; busca numérica DEVE ter domínio, limites, tolerâncias, paradas justificadas e explícitas, com rastreabilidade de convergência; NÃO DEVE usar estocástico para preencher gaps sem distribuições fundamentadas e controle de aleatoriedade; [PENDENTE-CODIGO]

UX DEVE apresentar por cenário: custos cobertos? meta atingida? quanto falta/sobra? quais ajustes quantificados possíveis?; PODE distinguir completo/condicional/indeterminado/inviável demonstrado; NÃO DEVE aceitar parcial nem considerar norma documental quando código exigível; exigir testes de temporalidade, rateio, K=0, B=0, m=0, denominadores, teto incompatível, custos inclusos, opções dízimo e IR, gaps, inválidos, modos com/sem aceleradores, não convergência e reatividade; [PENDENTE-CODIGO]
