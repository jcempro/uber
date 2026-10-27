# Handoff FT-003.36

{
  "job_id": "ec19d8c4-a622-4b0d-9f39-77a9c122e0ae",
  "status": "RUNNING",
  "execution_kind": "command_sequence",
  "repo": "D:/trampo/jcem.pro-uber",
  "thread_id": "01a16678-96c5-7eb2-9ee1-fea2b7b37cf2",
  "base": "9bb4ec7",
  "unit": ".ia.rules/state/contexts/FT-001/cost-validity-unit.md",
  "goal": "Classificar vigência fechada contra intervaloISO explícito sem admitircusto/ratear.",
  "hashes": {
    "src/domain/cost-validity.ts": "aec7ce0632df6abafa86df73a2d2c764c5e11bdcc28b4c47e058e630aa57bf5b",
    "src/domain/cost-validity.test.ts": "9c09a19cecd2137b3a311ff8ab313ccf104123490e3f054ea59edd98e03b2599"
  },
  "gate": "app:typecheck/lint/test275=269+6,63fontesanteriores intactas",
  "report": ".ia.rules/state/contexts/FT-001/cost-validity-check.json",
  "previous": {
    "job": "4d0e3f04-1c5c-4463-8bfa-6407065c92b7",
    "received_once": true,
    "status": "COMPLETED",
    "review": "Q8S10/revisão1 registrada",
    "result": "CostRequirementIDsraw/ordem,duplicado/missing/inactive/unknown/NAdeclarada conferidos;SHAsbf8635c/5f8599e;269/269/tipo/lint,61anteriores intactos. financialCoverage not-evaluated.",
    "git": "main ahead5confere;cost-references-job.md após snapshot13:12:27Z,mtime13:12:32Z",
    "commit": "9bb4ec7"
  },
  "semantics": "classifyClosedCostValidity(CostValidity,ClosedDateInterval) validadora intervaloalvo primeiro,entãovigência. DatascanônicasYYYY-MM-DD,DateISOString+T00Z eida/volta,finitezadotimestamp (nãofinanceiro),semhoje/fusolocal. Nullboundvalidity→unresolved-validity,nãoinfinito. Falhasinvalid-range/date comfield. Relaçãoinclusivafechadacovers-interval/outside-interval/partial-overlap,imutável,snapshots/costAdmission not-evaluated. Fora nãoécusto0/NAfinanceira,partial nãoautorizarateio/inclusãointegral,covernãoaprovapertinência/apuração. Nãointerpretabudgetsemdata. Nenhumadependêncianova/calendáriopróprio;probe nativoNode24documentadoconfirmourolloverimpossível2026/1900fev29,abril31evalidade2000fev29/anos0000/0099.",
  "additionalFacts": "Scenario/RCF4relevantes lidos seletivamente nestaetapa:OperationalScenario tem vehicleId/fuelConfigurationId/calendarId/parameterIds/costItemIds,semcostRequirementIds. Provenance.scope églobal/vehicle/scenario;nãoinventarseleçãoporprecedênciaouatribuiraplicabilidadefinanceira porela. INITIAL_SCENARIOS3instanciamapenasmaintenance.costItemIds eparams;INITIAL_COST_REQUIREMENTS=20globaisunknown+21maintenance(scopedscenario). Nãoinventarcloseduniverse. CostValiditystart/endnullsignificamlimitenãoinformado,contratocanônico;nenhummodoopen-endedexpressoadotado.",
  "next": "Próxima interação:local_result uma vez;revisãoproporcional/SHAs/Git/Q8S/commitseaceito. Depoiscontinuaradmissão/quantificação/seleção/reconciliação/completude de custos antescobertura/metas reais;reusarhelpers263/CostRefs35eVigência36sem reexplorar. Nãoampliarmodosdedatasouassumirnullinfinito. Formulasfinanceiras/mathready não certificamcenárioreal. Casoalterarmodelovigência paraopenendedexigecontrato explícito ecompatibilidade,não inferirsilenciosamente. Próximounit scopepequeno,proofsnormaI2O.",
  "pending": "36emexecução/semaceite. Lastglobal269. Ledger/apuração/escopo/vigênciaadmissão/reconciliação/completude/basefiscal/realreceipts/metas/inversa/indicadores/UI/CRUD/JSON/realcalendar/budget/ícones/histórico/mistura/comparação/CI/RCFglobalpendentes.",
  "compaction": "N7C impedida: nenhuma ferramenta nativa decompactação docontexto vivo exposta;handoffauxiliarpreservado,nãocomprova/substituicompactação.Sem polling."
}
