# FT-003.41.2a.4 — avaliação direta comG<=0

Worker subordinado. Acrescentar somente1it ao final do describe de src/domain/financial-margin-target.test.ts, antes do último });. Preservar byte a byte os3it/imports/helpers aceitos do arquivo fornecido. Primeiro write_file arquivo integral+novo it,depois run_authorized_command verify_financial_margin_degenerate UMAvez,encerrar inclusivefalha/semretry. Não reler/explorar/editar outroarquivo;semcommit/rede/instalação. Retorno<=80palavras.

it 'fator de receita não positivo não bloqueia avaliação direta'. Loop sobre2rows literais com campos racionais COMPLETOS:
- tax:r('0'),factor:r('0'),total:r('100'),profit:r('0'),margin:r('0'),reaches:true.
- tax:r('1','10'),factor:r('-1','10'),total:r('110'),profit:r('-10'),margin:r('-1','10'),reaches:false.
Cadaresult=root({...baseInput(),creditedRevenue:r('100'),fixedCosts:r('0'),usageCosts:r('0'),extraordinaryCosts:r('0'),fixedTaxes:r('0'),titheRate:r('1'),revenueTaxRate:row.tax,requiredMarginPercent:r('0')}). Sobrescrever TODOS4custos/ambasrates/target. Usar const assessment=readyAssessment(result.value.assessment) e retorno estreitado para ler campos.

Assertprojeção operatingCost:r('0'),plannedTotalCost:row.total,netProfit:row.profit,remainingRevenueFactor:row.factor,margin:{status:'ready',value:row.margin}. Assertvalue.requiredMarginPercent:r('0'),requiredMarginRatio:r('0');assessment.signedMarginSlack:row.margin e reachesModeledMargin:row.reaches. root jáconfere metadados/3labelsnot-evaluated/projectionready. Semcasts/any/novoshelpers/imports/optionalchain/non-nullassertion. Não copiar margem51/100 ou guardsunavailable de outros casos.

Origem independente RCF8.4/contrato41:com A0,B100,q1,m0,G=1−q−tau,LLF=G*100,margin=LLF/100,slack=margin−0. Portanto0/−1/10 são resultados exatos,com booltrue/false. G<=0 impede divisão inversa,mas NÃO a avaliação direta;B>0 mantém margem definida. CenáriosSINTÉTICOSextremos, q1 NÃO é default do produto; não alterar qcanônico10%. Não inferir viabilidade/cobertura real/apuração legal.

Aceite:gate margin-degenerate tipos/lint400+/4it/52suítes anteriores/100proteções+fonte94+prefixointegral3it15b77d94(aceitoem0f5f5ce). Perfil originalmargin mantém400+/4;prefixo técnico reconciliado com helpers efetivamente aceitos(core),sem exigir helperunused do preparo antigo nuncaaceito. Os4grupos principais terão evidência acumulada,mas falhas/imutabilidade/getters eapppermanecem pendentes. Unidade1arquivo/1it/2rows,contexto<=18Kchars,margemjanela16K–32Ktokens.
