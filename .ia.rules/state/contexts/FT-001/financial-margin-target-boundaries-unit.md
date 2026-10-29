# FT-003.41.2a.2 — percentuais zero e fronteira100

Worker subordinado. Acrescentar somente1it ao final do describe em src/domain/financial-margin-target.test.ts, antes do último });. Preservar byte a byte todo conteúdo aceito anterior, imports/helpers/primeiroit. Não editar fonte/gate/outros arquivos. Sem commit/rede/instalação. Arquivo integral e contrato fornecidos: primeiro write_file com arquivo anterior+novo it; depois run_authorized_command verify_financial_margin_boundaries uma vez; encerrar inclusive falha, sem retry. Não reler/explorar. Retorno<=80palavras.

it: 'aceita metas0/100/101 sem limitar artificialmente o percentual'. Uma tabela literal com3rows:
- percent:'0', ratio:r('0'), slack:r('1'), reaches:true.
- percent:'100', ratio:r('1'), slack:r('0'), reaches:true.
- percent:'101', ratio:r('101','100'), slack:r('-1','100'), reaches:false.
Loop: root({...baseInput(),creditedRevenue:r('100'),fixedCosts:r('0'),usageCosts:r('0'),extraordinaryCosts:r('0'),fixedTaxes:r('0'),titheRate:r('0'),revenueTaxRate:r('0'),requiredMarginPercent:r(row.percent)}). Usar o retorno de readyAssessment(result.value.assessment), não chamar helper isoladamente para estreitar campo antigo. Conferir requiredMarginPercent:r(row.percent), requiredMarginRatio:row.ratio, assessment.signedMarginSlack:row.slack, assessment.reachesModeledMargin:row.reaches. Conferir também projeção operatingCost0,plannedTotalCost0,netProfit100,remainingRevenueFactor1,margin{status:'ready',value:r('1')}. root já confere metadados e labels not-evaluated. Racionais têm numerator/denominator strings. Sem cast/any/non-null/optionalchain/importnovo.

Origem independente: RCF.md:164 exige L% finito>=0, admite0 e não impõe teto artificial<100. Contrato direto: B100,A0,q0,tau0 dá LLF100 e margem1; m=L%/100; slack=1−m. Expectativas literais derivadas destas equações, nunca saída da função sob teste. Caso101 continua conditional com reaches=false, não erro de entrada. Não é demonstração de apuração tributária legal/cobertura de custos reais, nem fórmula inversa.

Aceite: gate margin-boundaries tipos/lint398+/2it,100arquivos anteriores+fonte94pinada; comparação byte-prefixo preserva o core dc8ae35a aceito em fbb986e. Perfil integral margin400+/4 continua; B0/G<=0/falhas/freeze/getters e aplicativo permanecem pendentes. Unidade1arquivo/1it/3rows, contexto<16Kchars com margem para janela16K–32Ktokens.
