# FT-003.37a.2b — casos independentes, geração mecânica

Worker subordinado. Base b08a618; referência tributária corrigida e275/275testes existentes aprovados. Schema deescopos54f2a376 compilado,imutável. Estaunidade nãoexige escreverTypeScript: criar1catálogoJSON deoráculos derivados doParameterScopecanônico econtratosabaixo; doiscomandosgeram otestefuncional evalidam. Estratégia diferente após4841fad6:antesexecutouverifier semcriararquivo e releumodel/schema. Agora ocatálogo éprecondição dobuild,comandosnãoexecutamsuíte se artefatoausente. Não reexplorar/reinstalar/relerhistórico/RCFintegral/baseline.

Ler4arquivos obrigatórios antesdeefeitos. Criar .ia.rules/state/contexts/FT-001/parameter-scope-cases.json, JSONsemMarkdown, formatoexato: {"schema":1,"groups":[{"group":"canonical","cases":[{"id":"identidade-sintetica-unica","input":{"kind":"global"},"success":true}]}]}. Oexemplo mostraformato, não écatálogocompleto. Exatamente6grupos,nomesabaixo, cadaumcomcasosnãovazios. Cada caso: idstringúnico/inputJSONobrigatório/successboolean; opcionais path=vehicleId|scenarioId eownKey=constructor|__proto__. Não adicionarcampos. Entradas são fixtures sintéticas, nunca dados operacionais. Não consultar/derivarresultado do schema executável; expectativa vem do modelo/contrato. Ogerador valida formato/cobertura, não verdadedeoráculos.

Contrato:global tem sókind;vehicle exigevehicleId;scenario exigescenarioId. Discriminador/IDs são strings; IDnão podeficarvazioapósinspeçãotrim,mas valor literalválidoépreservado integralmente. Não coerção/default; objetos estritosrejeitamextras. EstruturanãoconfirmaexistênciadeID,precedênciaoufinanceiro.

Grupos e cobertura necessária:
- canonical:3ramosválidos,comIDs literaiscomespaçosexternos nos2ramosespecíficos; umIDnãocadastrado também estruturalmenteválido.
- shape:rootnull/array/número,discriminadorausente/desconhecido,camposdeoutroescopo eglobalcomID devemserrecusados.
- identifier:IDausente/nulo/número/booleano,vazio,espaços/tab/newline devemserrecusados; cobrirvehicleescenario. Não substituir ausência por0. JSONnãoexpressaundefined:usecampoomitido.
- unknown-keys:campoextra normalrecusado e2casosexplícitoscomconstructor/__proto__ próprios naentrada JSON; marcarownKeyrespectivo parachecagem. Nãoalegarherança/grafoJShostil. Ogerador usaJSON.parsepara não converter __proto__emsettermágicodeobjectliteral.
- issue-path:2negativos deID,umcomvehicleId eoutrocomscenarioId; informarexpectativapath docampocorreto. Nãoafirmarpath deIDparaerroemkind.
- immutability:objetoplano válidoeinválido. Harnesscongelaráentrada,compararácomJSONanterior/resultado derepetição eafirmaráexpectedSuccess. Sem alegaroutfrozen/dadosreais.

Após criar catálogo: build_scope_cases → verify_scope_cases. NÃO executar antesdearquivo. GeradorreutilizaValibotparaformatarfixture (inputunknown,semclassificá-lo),embuteJSONnorestemunhoTSselfcontained,eproduzexatamente6it(um/grupo); expectedSuccessnãovemdaimplementação. Pode corrigirmontagemdeJSON/regenerarse falhar; nãoalteraroráculosparaimitarbug. Secomportamento divergir docontrato,preservarevidênciaemvezdemudarprodução/critério.

Não editar src/domain/parameter-scope-schema.test.ts manualmente; comandoéresponsávelporele. Schema/66fontesanteriores/package/lock/normas/scripts/baselineimutáveis. Novo baseline registraapenasalteraçõesjáaceitas (64antigasiguais+referêncialegal56db3ad0+scope54f2a376),commitb08a618,275testes; nãoérelaxamentodecritério. Runnerprotege66fontesantes/depois,tipo/lint/suíteplena>=281semfalhas/pendentes e bundleisoladoViteES2023write:false,outputreportabsolutoforasrc. GuardabuildligaJSONgeradoaoTS porhash. Medidaisoladanãoédeltaapp/browserQA.

Semrede/commit/doc/códigoprodução. required_changescatalog+testefuncional; doiscomandosobrigatórios. Retornofactualcurto comcatálogo/geração/relatório/limites; nãoatribuircogniçãoàgeraçãodeterminística. Docs/comparaçãodependências eProvenance/ledger/metas/UI/globalcontinuampendentes.281éexigênciadaunidade,nãoresultadoainda.
