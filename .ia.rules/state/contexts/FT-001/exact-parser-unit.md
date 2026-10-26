# FT-003.18 — ponte decimal→racional com orçamento explícito
Worker subordinado. Base84c9e65;Fraction5.3.4/Decimal10.6.0/probes13/tipos/bundle aceitos. Criar SOMENTE src/domain/exact.ts (~80linhas);teste independente fornecido pelo comando. Ler esta unidade uma vez,escrever e executar. Não reler modelos,libs,RCF inteiro ou exploração. Normas aplicáveis preservadas.

Imports: Decimal de 'decimal.js';Fraction de 'fraction.js';validateDecimalText de './validation';type NumericValidationResult de './validation';type NumericConstraints de './model'. API já comprovada: Decimal.clone(),newD(string),d.sd():number,d.e:number,d.toFraction():[Decimal,Decimal],n.toFixed(0);newFraction(BigIntnumerator,BigIntdenominator),f.s/f.n/f.d bigint. Strings científicas NÃO vão ao parserFraction direto. Não criar parser/aritmética racional próprios nem mudarconfig global.

3aliases readonly+1função:
ExactRational={readonly numerator:string;readonly denominator:string} (normalizado,sinal no numerador,denominador>0,JSONsemBigInt).
ExactLimits={readonly maxInputLength:number;readonly maxDigits:number}:ORÇAMENTO TÉCNICO explícito do chamador,sem default/valor financeiro. Inteiros positivos seguros;maxInputLength contaUTF16,maxDigits limita a materialização decimal ANTES de redução,pode exceder dígitos do resultado reduzido. Política real de orçamento do app será medida/definida depois,não aqui.
ExactDecimalResult= readonlyunião ready{status:'ready';value:ExactRational},invalid{status:'invalid';validation:Extract<NumericValidationResult,{valid:false}>},unavailable{status:'unavailable';code:'invalid-budget'|'resource-budget'|'arithmetic-failure';reason:string}. Documentar cada ramo;unavailable NÃO é inputfinanceiro inválido,nem zero/inviabilidade. Returnwrapper/value/validation congelados,sem mutar constraints/argumentos/estado externo.

parseExactDecimal(input:unknown,constraints:NumericConstraints,limits:ExactLimits):ExactDecimalResult.
Ordem EXATA:
1 limitsnull/nãoobjeto ou campos!Number.isSafeInteger/≤0 →unavailable invalid-budget(reasonptBR),sem processar input.
2 Se inputstring.length>maxInputLength →unavailable resource-budget,sem dizer que gramática foi validada.
3 validation=validateDecimalText(input,constraints). Se !valid →invalid com MESMO code/message (Object.freeze do resultado local). Não duplicar catálogo/domínios/regex/0default,aceitar objetoNumericInputcomo número ou ampliar gramática para1/2/repetidos.
4 Só sucesso:usar construtorDecimal.clone PRIVADO (não tocar global),materializar d= newD(validation.value),sig=BigInt(d.sd()),e=BigInt(d.e),max=BigInt(limits.maxDigits). Boundnum=max(sig,e+1n);scale=max(0n,sig-e-1n);boundden=scale+1n. Se num>max OU den>max →unavailable resource-budget ANTES de toFraction/BigIntexpansão. São contadores de trabalho, não arredondamento/limite de validade financeira;comparações exatasBigInt,não converter valor paraNumber.
5 [n,den]=d.toFraction();f=newFraction(BigInt(n.toFixed(0)),BigInt(den.toFixed(0)));value congelado {numerator:(f.s*f.n).toString(),denominator:f.d.toString()};readycongelado. Sem valueOf/toNumber/toFixed monetário/simplify/tolerância.
Catch só fase aritmética4/5 →unavailable arithmetic-failure com reasonptBR,não inventar erro de campo/recurso comprovado nem lançar saída parcial. Não catch que esconda catálogo inválido como sucesso.

FonteRcf§4preservar inválido/desconhecido/zero e§8.1precisão sem arredondamento intermediário. NumericInputeproveniência são tratados pelo futuro chamador;esteadapterprocessa texto bruto e NÃO promove evidência ou substitui último estado válido. Recursos enormes legítimos permanecem inputválido mas resultado indisponível;não alterar contratos/catálogo/limites numéricos existentes. Resultado negativo da operação futura é permitido no Rational,embora parserdeentradas siga catálogo não negativo vigente.

CabeçalhoMPL2/link/origemRCF§§4/8.1FT003.18/autoriaJeanCarloEM <jeancarlo@jeancarloem.com>. JSDoc útil emaliases/função(param/retorno/ordem/erros/ausência efeitos);comentário sobre budgetantes da expansão. Sem any/supressões/cast de fuga/deps/Git/Worker/UI/cálculosfinanceiros ou defaults técnicos arbitrários.

Executar run_authorized_command({id:'validar_ponte_exata'}). Comando instala fixture8it permanente independente emexact.test.ts,verifica18fontes antigas intactas,tipos/lint/112anteriores+8novos=120. Não editarfixture/critérios;produto pode corrigir sóexact.ts enquantoexecução. Sem run_command/npm livre. expect_changes=true ecommit supervisor. Saída≤60palavras:execução/validações reais/pêndencias. Operações racionais/custos/metas/apresentação/estado/UI/JSON/histórico/CI/global NÃO concluídos.
