# FT-003.24 — calendário orçamentário mensal exato
Worker subordinado.Base5c2160b;152testes/tipos/lint aceitos. Criar SÓ src/domain/budget-calendar.ts (~180linhas),ler estaunidade uma vez,escrever eexecutar validar_calendario_orcamentario. Semexplorar/relerlibs/modelos.
Origemcanônica RCF§7.2:programados/mês=4×30/7=120/7,não16;efetivos=programados−perdidos;semana7dias,mês30,ano12dessesmeses=360diasorçamentários;premissaseditáveis ecalendáriorealseparado. Perdas atuais emdefaults estão not-provided;NÃO presumir0 ouconsumirdefaults aqui.EstaAPI exige PERDAS MENSAIS explícitas;adaptador futuro sópode fornecer apósdefinir competência.Unidade pura,semUI/cadastros/demanda/receita/custos.
Imports TIPOS nasorigens corretas:ExactRational de'./exact',ExactLimits de'./exact-budget',ExactProductFailure de'./exact-product',ExactSumFailure de'./exact-sum',ExactComparisonFailure de'./exact-compare'. Funções:inspectExactLimits,calculateExactProduct,calculateExactSum,compareExactRationals nasorigenscorrespondentes.NãoFraction/Number/novoparser/BigIntdireto.
APItypesdocumentados,todos camposreadonly:
BudgetCalendarInput={kind:'budget';daysPerWeek:ExactRational;daysPerMonth:ExactRational;monthsPerYear:ExactRational;lostWorkingDaysPerMonth:ExactRational;hoursPerWorkingDay:ExactRational}.
BudgetCalendarValues={kind:'budget';calendarDaysPerYear:ExactRational;scheduledWorkingDaysPerMonth:ExactRational;effectiveWorkingDaysPerMonth:ExactRational;effectiveWorkingDaysPerWeek:ExactRational;effectiveWorkingDaysPerYear:ExactRational;connectedHoursPerMonth:ExactRational;connectedHoursPerWeek:ExactRational;connectedHoursPerYear:ExactRational}.
BudgetCalendarFailure=ExactProductFailure|ExactSumFailure|ExactComparisonFailure|{status:'unavailable';code:'invalid-calendar'|'unsupported-calendar';reason:string}.
BudgetCalendarResult={status:'ready';value:BudgetCalendarValues}|BudgetCalendarFailure.
calculateBudgetCalendar(input:BudgetCalendarInput,limits:ExactLimits):BudgetCalendarResult.
Fluxo/invariantes:
1 inspectExactLimits(limits) ANTESinput;inválido→frozeninvalid-budget com MESMOreason;usar snapshotpolicy.limits naschamadas seguintes.
2 inputnull/nãoobjeto→frozeninvalid-calendar;input.kind!='budget'→frozenunsupported-calendar,nãoprocessardated.
3 Domínios porcompareExactRationals,reutilizando validação:daysPerWeek∈[0,7];daysPerMonth>0;monthsPerYear>0;lostWorkingDaysPerMonth≥0;hoursPerWorkingDay∈(0,24].7édefinição semana,24limitefísicododia,nãoconfigdefault. Sequalquer comparação indisponível devolverfalhaoriginal,não converterpara0/invalid-calendar. Só violaçãomatemáticadodomínio→invalid-calendar ptBR.
Campoausente/undefined/wrappermalformado chegaaocomparador→invalid-rational;nenhumdefault/0. Inputéobjetodevalores járesolvidos,não parâmetroNumericInput;estado/proveniência/cadastrosnãoedita.
4 scheduledWorkingDaysPerMonth=daysPerWeek×daysPerMonth÷7. UsarcalculateExactProduct('multiply'/'divide',...),a cadaresultado if(status!=='ready')returnresult;NÃOextrairvalueantesnarrowing.Nãoalgébramanual.
5 CompararlostWorkingDaysPerMonth≤scheduled;senãoretorna invalid-calendar.Não clamp/absperdas.
6 effectiveWorkingDaysPerMonth=scheduled−lost viacalculateExactSum('subtract').
7 calendarDaysPerYear=daysPerMonth×monthsPerYear;
effectiveWorkingDaysPerWeek=effectiveMonthly×7÷daysPerMonth;
effectiveWorkingDaysPerYear=effectiveMonthly×monthsPerYear;
connectedHoursPerMonth=effectiveMonthly×hoursPerWorkingDay;
connectedHoursPerWeek=connectedHoursMonthly×7÷daysPerMonth;
connectedHoursPerYear=connectedHoursMonthly×monthsPerYear.
Sóoperaçõesaceitas,cadafalhaoriginalpropagada;comparação retornaenum−1/0/1(nãomoneyNumber).Nãoarredondar/Number/valueOf/toNumber/tolerância.
8 Perdastotal=scheduled e0diassemana com0perdas são válidos,resultam0horas/dias efetivos,masdiascalendárioano continuam.Essa saída NÃO afirma custos0/viabilidade;denominadoreszero noscálculosfinanceiros futuros serão nãocalculáveis,nãoinventarhoras/jornada/demanda.
9 Object.freeze value ewrapper,todosracionaisretornados jácongeladospelasoperações;preservar input/limits/29fontes/testes.Semdiasexatos/datas/clocks/remainingdaysfictícios:competênciareal/diasrestantes emoutraunidade.Políticabudgettécnicorealapp continua pendente;falharecurso não é inviabilidadefinanceira.
CabeçalhoMPL2/linkhttps://www.mozilla.org/MPL/2.0/,origemRCF§§7/8.1FT003.24,JeanCarloEM <jeancarlo@jeancarloem.com>;JSDoc aliases/ramos/função/helpersnovos,comentarconvençãoestadiasperdidos. Semnovasdeps/Git/alteraçõesopsexatas/defaults/UI.
Comando run_authorized_command({id:'validar_calendario_orcamentario'}) APÓSfonte;instalafixture9it independente eexige161testes/tipos/lint,29fontes intactas.Sócorrigirfonte,testes/critérios fixos.Saída≤60palavras execução/evidências/impedimentosreais;semaceitefinanceiroglobal.
