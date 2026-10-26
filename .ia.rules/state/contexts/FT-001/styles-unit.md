# FT-002.4 — Sass compartilhado

Worker subordinado. SOMENTE criar src/styles.scss e adicionar import './styles.scss' a src/main.tsx, preservando integralmente proteção #root/StrictMode/App e cabeçalho. Não alterar outros arquivos. Sem comandos, instalação, teste, build ou commit: após escrever os dois alvos, retornar imediatamente. Validação de tipos/Sass/build e visual será no checkpoint supervisor; criação é preliminar. Não reler evidência obtida nem explorar repo/RCF/snapshots. Ler required_read_paths uma vez; implementar em vez de planejar.

RCF§2/10: CSS nativo para layout/efeitos, estilos globais centralizados, shell tipado reutilizado, acessibilidade/responsividade/reduced-motion, sem recursos completos desnecessários. React/header/toolbar/main#conteudo/footer existentes, todos filhos diretos de #root por AppShell. Não duplicar shell, adicionar elementos, dados financeiros, texto gerado via CSS, botões, fontes remotas, ícones ou bibliotecas.

styles.scss: baseline profissional e sóbrio, sistema de fontes local/system-ui; box-sizing border-box; body margin0; cores legíveis de alto contraste; #root com min-height100vh e grid de quatro faixas (header/toolbar/main/footer). Conteúdo principal centralizado, largura máxima72rem, padding responsivo, sem largura mínima que quebre320px. Estilos do shell escopados por #root > header, #root > [role='toolbar'], #root > main e #root > footer; estilos de títulos/texto/links coerentes. Links com foco claramente visível, underline e estados hover/focus; não depender só de cor. Nenhum overflow horizontal intencional. Interações continuam nativas. Use variável Sass $content-max:72rem e interpolação/uso real no layout para exercitar pré-processador; tokens de cores únicos, sem repetição indevida.

Sem animação necessária. Qualquer transição breve deve existir apenas dentro de @media(prefers-reduced-motion:no-preference), preservando modo reduzido sem JS. Preferir CSS estável e simples; sem efeitos elaborados, cor por resultado financeiro ou breakpoint financeiro inventado. Os72rem são medida de layout, jamais custo/meta do motorista.

Cabeçalho SCSS importante /*! ... */ com MPL-2.0, https://www.mozilla.org/MPL/2.0/, origem jcem.pro-uber, RCF§2/10; autoria Git JeanCarloEM <jeancarlo@jeancarloem.com>. Sem ano inventado. Comentários pt-BR só para intenção/escopo não óbvios. main.tsx recebe apenas import de estilo, sem reescrever fluxo.

Revisão próxima: Sass real pelo Vite, CSS extraído/manifest/link local, ausência de variável Sass no CSS final, licença, produção e medidas. Não executar verify_entry antigo: era contrato sem CSS e seu adaptador não representa carregamento de estilos/browser. Reutilizar verificador de build corrigido para produção, ampliado ao CSS, sem fingir browser validado. Depois lint/runtime guard e visual/browser antes de aceite global.

Retorno≤100 palavras: paths alterados e validações ainda pendentes. Nenhuma conclusão financeira ou de produto completo.
