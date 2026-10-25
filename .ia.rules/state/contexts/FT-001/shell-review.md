# Revisão proporcional do shell

Jobabb53764-6565-4f49-8c44-76ca8c826198 recebido uma vez. Dois componentes criados, verify_shell exit0 comprovado. Git determinístico coincide com inspeção: somente dois TSX e handoffs não versionados. Q8S7, revisão1.

Falso sucesso identificado: children:readonly ReactNode[] aceita a tela com dois filhos, porém restringe o shell reutilizável e deixa a propriedade mutável. SSR em JavaScript não detectou o contrato TypeScript incorreto. Fixture virtual independente comprovou TS2745 para texto, elemento único e null. Supervisor corrigiu cirurgicamente para Readonly<{children:ReactNode}>; imports passaram a type-only e cabeçalhos perderam2024 sem fonte. Sem reimplementação dos componentes.

Validação ampliada posterior: compilação estrita ES2023, renderização e composição de children exit0. Fixture virtual aceita texto/elemento/null/lista e usa controle negativo de escrita props.children=props.children com @ts-expect-error. Atribuir null não serviria ao controle de imutabilidade, pois o tipo antigo já rejeitava null por outro motivo; essa verificação foi corrigida na origem, sem relaxar o contrato. Não há arquivos de teste artificiais no src; saídas somente .cache/build/shell.

Aceite: componentes básicos corrigidos. Não comprova HTML/Vite/CSS/navegadores, cálculos ou JSON. RCF continua pendente nas sentenças compostas; não atribuir assinatura material por cumprimento parcial. Próximo: commit dos TSX; entrada HTML em src conforme fonte única, main TSX e configuração Vite com saída exclusiva dist.
