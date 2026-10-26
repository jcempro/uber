# FT-002.3a — entrada: somente dois arquivos

Worker subordinado. Jobc89d9b32-9fb1-4a9b-ab60-568a94634f1b falhou antes de qualquer edição por leituras repetidas; Q8S2/revisão1. Nada de HTML/main/config foi criado. Reaproveitar shell531e9c2 e instalação6a1b967. Git coincidente com retorno: mudanças do supervisor em mapas/handoffs, nenhum novo fonte. Esta unidade substitui o escopo de quatro arquivos por SOMENTE src/index.html e src/main.tsx. Vite/tsconfig/CSS/pacote/RCF ficam para outra unidade; não tocar neles, instalar, explorar ou commitar.

Leia required_read_paths uma vez; escreva os dois arquivos via write_file/edit_file nativos e execute verify_entry pelo ID. Não reler documentos já obtidos nem produzir plano no lugar da implementação. Contexto suficiente está aqui; não ler RCF inteiro, snapshots ou histórico.

Contrato RCF§2/10: aplicação canônica em src, pt-BR, shell compartilhado tipado e bootstrap local sem integração inventada. src/index.html: doctype HTML; lang=pt-BR; charset UTF-8; viewport width=device-width, initial-scale=1; title Planejador UberX; div id=root; script type=module src='./main.tsx'. Não colocar HTML na raiz nem carregar CDN/recursos inexistentes.

src/main.tsx: importar StrictMode de react, createRoot de react-dom/client e App de ./App. Obter document.getElementById('root'); se null, throw new Error com #root na mensagem clara; nunca esconder null com ! ou as. Depois createRoot(elemento).render(<StrictMode><App/></StrictMode>). App/shell já existem; não alterá-los nem duplicar marca/landmarks. Sem CSS nesta unidade, sem valores financeiros, efeitos adicionais ou ações falsas.

Fontes comentáveis: cabeçalho MPL-2.0, link https://www.mozilla.org/MPL/2.0/, origem jcem.pro-uber, RCF§2/10; autoria Git comprovada JeanCarloEM <jeancarlo@jeancarloem.com>. Não inventar ano. Comentar propósito da inicialização e razão da proteção do root sem repetir sintaxe trivial.

verify_entry fará tipos estritos/ES2023, estrutura básica HTML e controle de inicialização com React real e adaptador de DOM/mount. Controle negativo para root ausente; isso NÃO é teste de navegador, Vite ou cálculo. Não mudar verificador para aprovar. Artefato de evidência autorizado em .ia.rules/state/contexts/FT-001/entry-check.json. Retorno≤180 palavras: paths, comando/exit, pendências. Próximo: duas configs e build real em unidade distinta.
