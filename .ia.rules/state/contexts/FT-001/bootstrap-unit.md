# FT-002.3 — entrada e primeiro build técnico

Worker subordinado. Criar SOMENTE src/index.html, src/main.tsx, vite.config.mts e tsconfig.json (ausentes). Sem instalar dependências, editar outros fontes/pacote/RCF/núcleo, CSS/lint/JSON/cálculos ou commit. Shell corrigido e validado, commit531e9c2. Toolchain6a1b967. Norma6f0829f. Não reler RCF inteiro ou snapshots: ler required_read_paths uma vez, escrever os quatro arquivos, executar verify_bootstrap pelo ID autorizado.

RCF§2: fontes da aplicação somente src; configuração na raiz; dist saída única. Portanto Vite root=src, entrada src/index.html (não raiz); outDir aponta para dist na raiz. base='./' para artefatos relativos relocáveis; navegação atual só #conteudo, sem router. Vite8.3.5, plugin-react6.1.2, React19.3.1, TS6.0.3 instalados. .mts preserva ESM da config sem type:module global, que quebraria governança CommonJS. Contratos e APIs foram inspecionados nos pacotes reais.

index.html: doctype HTML, lang pt-BR, charset UTF-8, viewport width=device-width/initial-scale=1, title 'Planejador UberX', div id=root e script type=module src='./main.tsx'. Sem CDN, favicon inexistente ou recursos não usados. Comentário de origem/licença no fonte.

main.tsx: importar StrictMode de react, createRoot de react-dom/client e App de ./App. Obter #root com verificação explícita de null, erro claro se configuração inválida; renderizar StrictMode/App. Não usar type assertions para esconder ausência do elemento, não duplicar shell nem renderizar dados inventados. Nenhum CSS importado nesta unidade; Sass será exercitado na unidade seguinte.

vite.config.mts: defineConfig de vite, react de @vitejs/plugin-react e fileURLToPath de node:url. root=fileURLToPath(new URL('./src',import.meta.url)), base='./', plugins=[react()]. build.target='es2023', outDir=fileURLToPath(new URL('./dist',import.meta.url)), emptyOutDir=true, manifest=true, sourcemap=false. Em build.rolldownOptions.output.banner incluir comentário de licença MPL-2.0/origem jcem.pro-uber/RCF§2; usar rolldownOptions real do Vite8, não alias depreciado rollupOptions. Sem bibliotecas extras, ReactCompiler, env ou otimizações incrementais.

tsconfig.json: compilerOptions target ES2023, module ESNext, moduleResolution Bundler, jsx react-jsx, strict=true, noEmit=true, isolatedModules=true, verbatimModuleSyntax=true, esModuleInterop=true, skipLibCheck=false, noUnusedLocals=true, noUnusedParameters=true, lib=[ES2023,DOM,DOM.Iterable], types=[vite/client,react,react-dom,node]. include=[src,vite.config.mts]. Não compilar núcleo ou cache.

Cabeçalhos comentáveis: MPL-2.0 + https://www.mozilla.org/MPL/2.0/, origem jcem.pro-uber, RCF§2/10; Git comprovado JeanCarloEM <jeancarlo@jeancarloem.com>. NÃO inventar ano. Documentar a finalidade do bootstrap e a proteção da raiz. JSON não recebe comentário inválido.

verify_bootstrap: Node24 absoluto; tipos reais via tsconfig; resolveConfig valida root/outDir/base/target e protege dist antes da limpeza pelo Vite; build real e inspeção de HTML/manifest/arquivos/paths/banner, com tamanho/gzip medidos sem limite arbitrário. Artefatos gerados autorizados: dist/, cache do Vite e .ia.rules/state/contexts/FT-001/bootstrap-build.json. Não mudar o verificador para aprovar. Nenhuma saída deve alegar cálculo/JSON/browsers aprovados: é build técnico inicial sem CSS. CLI/runtime guard/lint/matriz de browsers e visual continuam pendentes; somente o comando desta unidade executa Node24 garantido.

Saída≤220 palavras: quatro paths, comando/exit, evidências, limitações e próximo CSS/lint/runtime guard. Sem planejamento no lugar de execução ou releitura repetida sem progresso.
