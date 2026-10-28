# Toolchain — FT-002.1

Node24.22.1; npm10.9.4. Tipos estritos, build técnico ES2023/produção, Sass/CSS e lint foram verificados via APIs Node24. A suíte atual passou em281/281 testes, incluindo núcleos numéricos, calendário, custos, projeção financeira direta e escopos. Motor financeiro completo, metas/inversas, ledger, interface integrada e navegadores permanecem pendentes; resultados simulados não comprovam realização financeira.

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
| decimal.js | 10.6.0 | MIT |

Evidências: ../.ia.rules/state/contexts/FT-001/toolchain-registry.json e ../.ia.rules/state/contexts/FT-001/toolchain-compatible.json preservam origem oficial, datas e integridade. TypeScript6.0.3 atende ao peer<6.1; tipos Node24 correspondem ao runtime. Ícones adiados até uso efetivo. decimal.js10.6.0 está instalado para validação e aritmética decimal compartilhadas.

ESLint usa `eslint.config.mjs`, uma exceção técnica de configuração em ESM nativo. Isso preserva o escopo CommonJS dos runtimes gerenciados; não foi criado JavaScript de aplicação. Na versão instalada, configuração TypeScript exigiria `jiti` ou a flag nativa adicional, sem benefício necessário nesta configuração declarativa. Regras maduras recomendadas do typescript-eslint e imports type-only são reutilizadas. A fronteira `node:*` restringe somente código browser; testes continuam lintados e podem usar Node. Controles positivos/negativos passaram sem auto-fix: [evidência](../.ia.rules/state/contexts/FT-001/lint-check.json).

Scripts/metadados gerenciados, identidade e licença herdados preservados. Não definir type:module, que quebraria runtimes CommonJS da governança. Configs ESM futuras usarão .mts/.mjs com justificativa específica.

Instalar com Node24 e npmCLI verificados, --ignore-scripts e cache .cache/npm. Nenhum hook herdado executado; auditoria de segurança permanece pendente. Não alterar Node global/PATH silenciosamente. Selecionar Node24 conforme .node-version antes dos aliases npm.

Scripts `app:*` executam primeiro `node scripts/check-runtime.mts`, que lê `engines.node` da raiz do helper e rejeita runtime incompatível antes da ferramenta. O helper integra o typecheck/lint. Evidência histórica: `../.ia.rules/state/contexts/FT-001/runtime-integration-check.json`; não equivale à suíte financeira ou ao aceite global. As APIs de compilação/build/lint foram executadas com Node24 absoluto, sem usar verificações gerenciadas como teste do produto. Não usar `--passWithNoTests`. Testes posteriores cobrem projeção financeira direta, sem certificar dados, completude de custos, solver de metas ou interface: consultar `../.ia.rules/state/contexts/FT-001/parameter-scope-schema-check.json` para a execução atual completa.

O [relatório do build](../.ia.rules/state/contexts/FT-001/bootstrap-build.json) registra produção, ES2023, extração Sass/CSS, manifesto, caminhos relativos, licenças e medidas dos bytes finais. Linux, matriz de navegadores, funcionamento offline/subdiretório em navegador real, métricas financeiras, CRUD/JSON e Pages continuam pendentes. O bloqueio atual da ferramenta de navegador está registrado em `../.ia.rules/state/fix.md`; não prova defeito no aplicativo.

decimal.js reutiliza aritmética decimal consolidada e tipos oficiais; evita manter aritmética própria. A seleção oficial datada e a integridade estão em toolchain-registry.json; a instalação/API/tipos em decimal-check.json no mesmo diretório. Não arredondar intermediários. A política de precisão das operações e o custo real no bundle serão validados na integração dos cálculos; esta instalação não comprova resultados financeiros.


fraction.js5.3.4 (MIT),sem dependências de runtime,foi selecionado para razões intermediárias exatas comBigInt;decimal.js10.6.0 permanece na validação. A precisão configurável do Decimal arredonda operações; frações preservam razões como120/7 sem escolher precisão intermediária arbitrária. Evita manter álgebra racional própria ou incluir todoMath.js. Metadados/SRI/API/tipos e bundle-probe em fraction-registry.json/fraction-check.json no contextoFT-001. Nenhuma taxa/custo do motorista foi alterado. Manutenção exibida no GitHub:26/09/2025;atividade2026 não comprovada. Segurança/auditoria permanece pendente.

Registro histórico da seleção: probes de API/BigInt/Decimal→fração/CJS/ESM e bundling instrumentalES2023 passaram;bytes medidos no relatório,sem limite arbitrário e sem alegar custo final do app ou matriz de browsers. Parser da biblioteca não substitui contrato decimal vigente;conversão porNumber,tolerância/simplificação e instânciasBigInt emJSON são inadequadas para o motor. A instalação isolada não comprovava adaptadores,serialização,limites de recurso ou integração; esses núcleos foram implementados em unidades posteriores, com cobertura parcial na suíte atual, sem concluir integração financeira do produto. Fontes: https://github.com/rawify/Fraction.js e https://mikemcl.github.io/decimal.js/#precision .

## Esquemas estruturais — Valibot

Valibot1.5.0 está fixado no package/lock, licença MIT, sem dependências de runtime e com `sideEffects:false`. Release de09/09/2026, commit `5016198907beb383f5a6d8bbcb4c7f1586d7c6a3`; SRI `sha512-nil6AkP2TChWL43Z5uJ6GTxX01CUA+g8LWUM+N/rB9NBbkUMaUsi9PUNzlUPgoKASgmx9f7eGOYpJ04/fSa6FQ==`. Fontes da seleção: [registro fixado](https://registry.npmjs.org/valibot/1.5.0), [release](https://api.github.com/repos/open-circle/valibot/releases/tags/v1.5.0), [strictObject](https://valibot.dev/api/strictObject/) e [safeParse](https://valibot.dev/api/safeParse/).

A composição modular de esquemas estritos tipados evita um parser manual paralelo. [Zod Mini](https://zod.dev/packages/mini) também é funcional e permite tree-shaking; não foi medida vantagem comparativa de tamanho. Imports nomeados deValibot validam atualmente os3ramos deParameterScope, rejeitando extras e preservando IDs literais, com37casos em6testes. O peerTypeScript>=5 é opcional; npm mudou somente a classificação TypeScript de`dev` para`devOptional`, preservando versão/SRI e demais metadados, com guarda explícita no verificador.

O [relatório do schema](../.ia.rules/state/contexts/FT-001/parameter-scope-schema-check.json) mede6847bytes minificados e2162bytes gzip no bundle **isolado** ES2023 gerado por Vite com`write:false`; não é incremento do app nem prova de browsers. Tipos/lint e281/281testes passaram,66fontes preservadas. A evidência do oráculo incorreto foi arquivada antes da correção. Riscos/limites: esquema estrutural não comprova referências existentes, precedência, fontes verdadeiras, datas semânticas, importaçãoJSON segura ou cobertura financeira; Provenance ainda será composto em unidade própria. Auditoria de segurança, custo integrado no app e navegadores continuam pendentes.
