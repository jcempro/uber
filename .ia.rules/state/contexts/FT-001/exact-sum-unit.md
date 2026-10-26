# FT-003.22 — soma/subtração exatas
Worker subordinado. Basefb123fc;135testes/tipos/lint aceitos. Criar SOMENTE src/domain/exact-sum.ts (~100linhas);ler esta unidade uma vez,escrever,executar validar_somas_exatas. Não explorar/reler bibliotecas/modelos. Comando instala fixture independente9it,não editável.
Imports:inspectExactLimits e typeExactLimits de './exact-budget';typeExactRational de './exact';inspectExactRational/loadExactRational/fitsProduct/serializeExactRational de './exact-rational'. Helpers já aceitos:inspect verifica objeto/camposstring;load limita comprimento antesregex e dígitos antesBigInt,retorna Fraction normalizada congelada OU ExactRationalFailure(statusunavailable,codeinvalid-rational|resource-budget|arithmetic-failure,reason). fitsProduct(x,y,cap)=x===0n||y<=cap/x para magnitudes≥0. serialize retorna parreadonlystrings congelado. Fraction.s/n/d são bigint;s é±1n,n≥0,d>0. Para narrowing:if('status' in loaded)return loaded;Fraction NÃO tem.status.Não casts de fuga/any.
APIexports documentados:
ExactSumOperation='add'|'subtract';
ExactSumFailure=ExactRationalFailure|{readonly status:'unavailable';readonly code:'invalid-budget'|'invalid-operation';readonly reason:string};
ExactSumResult={readonly status:'ready';readonly value:ExactRational}|ExactSumFailure.
calculateExactSum(operation:ExactSumOperation,left:ExactRational,right:ExactRational,limits:ExactLimits):ExactSumResult.
Fluxo:
1 inspectExactLimits(limits),invalid→frozenunavailableinvalid-budget MESMOreason.Não duplicarbudget.
2 op foraadd/subtract→frozenunavailableinvalid-operation antesoperandos.
3 inspect cadaoperando,sefalse→frozeninvalid-rational ptBR.Loadcadaum sóapósinspect;devolverfalhaoriginal;semduplicargramática/BigInt/normalização.
4 Toda fasearitmética/cap/guardas/serialização emtry/catch→frozenarithmetic-failure ptBR.
cap=10n**BigInt(policy.limits.maxDigits)-1n.
ANTESdosprodutos,exigir fitsProduct(a.n,b.d,cap),fitsProduct(b.n,a.d,cap),fitsProduct(a.d,b.d,cap). Sequalquerfalse→frozenresource-budget. Fraction.js5.3.4 comprovado:add/sub formam produtoscruzados eproduto denominador ANTESredução,não usar eventualcancelamento para dispensar orçamento.
5 Sóapósguardas,formar x=a.s*a.n*b.d; y=(op==='add'?b.s:-b.s)*b.n*a.d. Para guarda da soma,ax=x<0n?-x:x;ay=y<0n?-y:y. Se(x>=0n)===(y>=0n) e ax>cap-ay→resource-budget ANTES de somar. Sinaisopostos não crescem além dosprodutosjálimitados. NÃO rejeitar9−9por soma de magnitudes18;N1 aceita0.N1 aceita8+1=9 mas9+1recusa. Guardas são extensão técnica derecurso,não resultado financeiro.
6 Resultado EXCLUSIVAMENTE da biblioteca:a.add(b) ou a.sub(b),depoisserializeExactRational(f),wrapperreadycongelado. Não calcular/parnormalizar resultado à mão/GCD;semNumber/valueOf/toNumber/tolerância/arredondamento ouconfigglobal. ±matemáticos válidos;não alterarvalidadoresdeinput.
Errosdenominador0→invalid-rational,semdivision-by-zero emop quenãodivide. N1 recusa9/8−9/8por denominadorintermediário64,mesmoresultado0;N2permite. configbudget éinterna/confiável,estrutura válida≠memóriafísica;nenhumdefault/tetofinanceiro.Cap sentinelaN+1técnica,não valorfinanceiro.
Preservar operandos/budget/catálogos,APIprodutos/helpers e135testes;reutilizarhelpers semcopiarcorpos. CabeçalhoMPL2https://www.mozilla.org/MPL/2.0/,origemRCF§§4/8.1/8.2FT003.22,JeanCarloEM <jeancarlo@jeancarloem.com>;JSDoc aliases,ramos,função/helpersnovos,comentar guadasintermediárias.Sem novosdefaults/deps/Git/UI/motorfinanceiro/comparação.
Executar run_authorized_command({id:'validar_somas_exatas'}) apósfonte. Requer25fontes anterioresintactas,144/144testes (135+9),tipos/lint. Corrigir só fonte;sebloqueado relatarsemreexploração. commit supervisor. Saída≤60palavras comexecução/evidências/impedimentosreais;não declararaceitefinanceiroglobal.
