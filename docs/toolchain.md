# Toolchain — FT-002.1

Node24.22.1; npm10.9.4. Tipos estritos, build técnico ES2023/produção, Sass/CSS e lint foram verificados via APIs Node24. Navegadores e funcionalidades financeiras permanecem pendentes.

React favorece maturidade e compatibilidade nativa com Fluent; Preact/compat exigiria validação adicional; renderizador próprio acrescentaria manutenção e o fator comparativo1,25 do RCF, nunca aplicado aos custos do motorista. Sem framework de componentes, router ou backend.

| Pacote | Versão exata | Licença declarada |
| --- | --- | --- |
| react | 19.3.1 | MIT |
| react-dom | 19.3.1 | MIT |
| vite | 8.3.5 | MIT |
| typescript | 6.0.3 | Apache-2.0 |
| sass | 1.106.1 | MIT |
| @vitejs/plugin-react | 6.1.2 | MIT |
| @types/react | 19.3.0 | MIT |
| @types/react-dom | 19.3.0 | MIT |
| @types/node | 24.19.2 | MIT |
| eslint | 10.13.0 | MIT |
| typescript-eslint | 8.72.0 | MIT |
| vitest | 5.0.5 | MIT |

Evidências: ../.ia.rules/state/contexts/FT-001/toolchain-registry.json e ../.ia.rules/state/contexts/FT-001/toolchain-compatible.json preservam origem oficial, datas e integridade. TypeScript6.0.3 atende ao peer<6.1; tipos Node24 correspondem ao runtime. Ícones e decimal.js adiados até uso efetivo.

ESLint usa `eslint.config.mjs`, uma exceção técnica de configuração em ESM nativo. Isso preserva o escopo CommonJS dos runtimes gerenciados; não foi criado JavaScript de aplicação. Na versão instalada, configuração TypeScript exigiria `jiti` ou a flag nativa adicional, sem benefício necessário nesta configuração declarativa. Regras maduras recomendadas do typescript-eslint e imports type-only são reutilizadas. A fronteira `node:*` restringe somente código browser; testes continuam lintados e podem usar Node. Controles positivos/negativos passaram sem auto-fix: [evidência](../.ia.rules/state/contexts/FT-001/lint-check.json).

Scripts/metadados gerenciados, identidade e licença herdados preservados. Não definir type:module, que quebraria runtimes CommonJS da governança. Configs ESM futuras usarão .mts/.mjs com justificativa específica.

Instalar com Node24 e npmCLI verificados, --ignore-scripts e cache .cache/npm. Nenhum hook herdado executado; auditoria de segurança permanece pendente. Não alterar Node global/PATH silenciosamente. Selecionar Node24 conforme .node-version antes dos aliases npm.

Scripts `app:*` executam primeiro `node scripts/check-runtime.mts`, que lê `engines.node` da raiz do helper e rejeita runtime incompatível antes da ferramenta. O helper integra o typecheck/lint. Evidência: `../.ia.rules/state/contexts/FT-001/runtime-integration-check.json`; não equivale à suíte financeira ou ao aceite global. As APIs de compilação/build/lint foram executadas com Node24 absoluto, sem usar verificações gerenciadas como teste do produto. Não usar `--passWithNoTests`. Não há suíte financeira implementada ainda.

O [relatório do build](../.ia.rules/state/contexts/FT-001/bootstrap-build.json) registra produção, ES2023, extração Sass/CSS, manifesto, caminhos relativos, licenças e medidas dos bytes finais. Linux, matriz de navegadores, funcionamento offline/subdiretório em navegador real, métricas financeiras, CRUD/JSON e Pages continuam pendentes. O bloqueio atual da ferramenta de navegador está registrado em `../.ia.rules/state/fix.md`; não prova defeito no aplicativo.
