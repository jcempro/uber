# Revisão das dependências do guard

Jobc8b91aad-a8bd-4b6e-b6f4-25d95ebd9140 recebido uma vez. Três comandos exit0, package/lock alterados como previsto e Git coincide. Semver7.8.5 ISC e @types/semver7.8.0 MIT foram fixados; tipos exigem TypeScript5.6, projeto6.0.3. Integridades, árvore e preservação de demais campos comprovadas; apenas duas devDeps novas, sem reescrever scripts. Q8S9, revisão1. Não repetir instalação validada.

API instalada conferida por probe: subset do engines atual em >=24.0.0 é true; >=22 é false; satisfies aceita Node24.22.1 e rejeita22.21.0 na faixa atual. Isso prepara uso do componente maduro; não prova helper ainda inexistente. Não criar parser SemVer próprio, depender de pacote transitivo oculto ou npm global.

Próximo: commit das dependências e criar helper TypeScript/prefixos app:* em unidade de dois arquivos; executar controles reais com binários Node24 e Node22, testes isolados de config e tipos/CLI depois. Browser/financeiro permanecem pendentes.
