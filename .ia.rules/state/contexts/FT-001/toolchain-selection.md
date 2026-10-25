# Seleção compatível — checkpoint

Snapshot do job a9328cac-6cb4-49b1-af1b-ad3b491af25c recebido uma vez e examinado: 18 candidatos com versão/licença/engines/peers e origem oficial. Q8S9, revisão1. Execução determinística comprovada, não aceite de compatibilidade. Git observado coincide com retorno; não há aplicativo instalado.

Decisão do supervisor: React/ReactDOM19.3.1 com Vite8.3.5/plugin-react6.1.2, Sass1.106.1, Vitest5.0.5, decimal.js10.6.0, ESLint10.13.0/typescript-eslint8.72.0 são candidatos coerentes com Node24.22.1, ainda sujeitos a instalação/compilação/bundle. React favorece compatibilidade nativa com Fluent, comparado ao esforço e validação adicionais de Preact/compat ou renderizador próprio; não se assume benefício de bundle sem medição. Pacotes de ícones serão avaliados na sua unidade, não instalar coleções por conveniência.

Conflito comprovado: TypeScript7.0.2 está fora do peer typescript>=4.8.4<6.1.0 do typescript-eslint8.72.0. Selecionar patch estável6.0, não suprimir warning/forçar peers. @types/node26.6.5 não representa o runtime24; selecionar patch24. Resolver os dois via npm view com Node24 e rede do worker já comprovada, depois obter metadados exatos e preservar origem/hash.

Tentativa determinística direta do supervisor de npm view encerrou com ENOTFOUND registry.npmjs.org em ambas as consultas no sandbox, sem snapshot. Processo terminou exit1; não confundir com falha de pacotes ou com resultado do worker. O worker consultou o mesmo registro com sucesso fora dessa restrição. Nova unidade usará rede explicitamente autorizada, --fetch-retries=0, timeout finito e cache somente .cache/npm. npm10.9.4 e CLI C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js verificados; executável Node24 absoluto conforme handoff anterior. Não alterar instalação externa.

Foram criados .gitignore para node_modules/dist/.cache e .gitattributes cirúrgico para LF em RCF/estado, evitando falso insucesso por EOL sem mudança normativa. Ambos aguardam commit técnico. Nenhuma instalação foi feita.

Próximo: examinar suplemento de versões, decidir artefatos concretos e preparar mapa/marcadores oficiais antes da primeira unidade funcional FT-002. Não reler ou reconstruir registros iniciais já concluídos. Produto continua pendente.

Job confirmado RUNNING: e598d8b0-0d94-481a-ace6-3ade98c9f7a8; thread01a16678-96c5-7eb2-9ee1-fea2b7b37cf2 e repoPath D:/trampo/jcem.pro-uber, command_sequence select_compatible_metadata→verify_compatible_metadata, expect_changes=true, commit_policy=supervisor. Alvo único toolchain-compatible.json. Coletor passou Node24 --check antes do envio. Em retomada autorizada, local_result uma vez e Q8S após revisão proporcional; não consultar por demora. Compactação nativa impedida por falta de ferramenta exposta.
