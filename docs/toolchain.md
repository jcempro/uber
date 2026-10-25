# Toolchain — FT-002.1

Node24.22.1; npm10.9.4. Piso ES2023 exigido pelo RCF; compilação, browsers e bundle ainda pendentes.

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

Scripts/metadados gerenciados, identidade e licença herdados preservados. Não definir type:module, que quebraria runtimes CommonJS da governança. Configs ESM futuras usarão .mts/.mjs com justificativa específica.

Instalar com Node24 e npmCLI verificados, --ignore-scripts e cache .cache/npm. Nenhum hook herdado executado; auditoria de segurança permanece pendente. Não alterar Node global/PATH silenciosamente. Selecionar Node24 conforme .node-version antes dos aliases npm.

Scripts app:* foram configurados para bootstrap posterior; não são evidência de build ou teste do produto. Não usar --passWithNoTests nem testes gerenciados como aceite do aplicativo. Scripts/runtime guard e inspeção dist serão ligados no bootstrap antes de aceitar build.

Linux, browsers/mínimos verificáveis, compilação ES2023, bundle/offline/subdiretório, dist, cálculos, UI e Pages ainda exigem implementação e evidência. A verificação desta unidade limita-se à instalação, peers, lock e CLIs.
