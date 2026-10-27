# Handoff FT-003.34a

{
  "job_id": "a28ccdf7-d38d-4c54-8572-3d0407059ce7",
  "status": "RUNNING",
  "execution_kind": "inference",
  "response_contract_version": 1,
  "repo": "D:/trampo/jcem.pro-uber",
  "thread_id": "01a16678-96c5-7eb2-9ee1-fea2b7b37cf2",
  "base": "1e1d701",
  "unit": ".ia.rules/state/contexts/FT-001/financial-result-recovery-unit.md",
  "goal": "Implementar somente financial-result.ts pendente, com contrato/APIs consolidados e fixture já instalada.",
  "required_change_paths": [
    "src/domain/financial-result.ts"
  ],
  "fixtureSha": "928cba62feb142bdaea837f12ff876c14261f43e7d8a8be6c27f756051372956",
  "validator": {
    ".ia.rules/state/contexts/FT-001/financial-result-recovery-unit.md": "89d37acf4987d016a1ae9d0390f4d960e3e52bb878ff23b0a12a4a973ad28493",
    ".ia.rules/state/contexts/FT-001/financial-result-recovery-validator.mjs": "c607dfeab1a8acb9f3eba5377d40c45f1d6dd6fbf3166a355cbf7df6befcf4e7",
    ".ia.rules/state/contexts/FT-001/financial-result-failed-evidence.json": "4e93dfacb0237f09de879b34fc11abc4a194ad230f3587220e2f99ff7bacdb5d"
  },
  "gate": "251=243+8, tipo/lint, fixture e53fontes preservadas",
  "report": ".ia.rules/state/contexts/FT-001/financial-result-check.json",
  "previous": {
    "job": "f5b5ac26-41f0-4a7d-bc90-5dafe141c3b1",
    "received_once": true,
    "status": "FAILED",
    "error_kind": "WORKER_INCOMPLETE",
    "review": "Q8S4 revisão1 registrada",
    "facts": "Fixture instalada/intacta; fonte e relatório de validação ausentes. Após preparar_fixture, relidas fixture e3APIs já lidas; bloqueio deprogresso. state:10ferramentas concluídas,1falha,32K,2compactações (causalidade destas não comprovada). Git main ahead1 coincide integralmente comresultadolocal.",
    "evidence": ".ia.rules/state/contexts/FT-001/financial-result-failed-evidence.json"
  },
  "materialChange": "Removidos preparar_fixture e5leituras prévias; apenas1contrato consolidado e1arquivo funcional pendente. Payload grande do validador transferido para arquivo local de hash aprovado c607dfea; wrapper curto verifica integridade e executa mesma validação. Testes ecritérios preservados, expect_changes true, semrefazer trabalho pago ou reiniciarjob.",
  "semantics": "Projeção somente, B=repasse ao motorista,7racionais obrigatórios>=0: receita/fixos/uso/extraordinário/encargosfixos/q/tau. Coper=F+V+E+Tfix;dízimo=qB;taxa=tauB;LLF=B-dízimo-taxa-Coper;total=Coper+dízimo+taxa;G=1-q-tau;margemLLF/BsóB>0. Quantidade/Preço passageiro não determinam B/lucro. Usarálgebraaceita,semNumber financeiro/rounding. FinancialAssessment not-evaluated,sem certificarcompletude/admissão/base fiscal ourealização. Gnegativo forwardépermitido,nãoinversa. Artefatosdeprova efonte requeremrevisão, não aceitesautomáticos porstatus.",
  "next": "Somente na próxima interação: local_result uma vez; conferir fonte realmente produzida,fixture/RCF8.2/testes/baseline/Git;Q8S comrecibo e commit supervisor seaceito. Separcial/falha, preservar fonte/evidências, classificarcausa específica econtinuar unidade corrigida, semfallbackintegralpago nem releituras recuperáveis.",
  "pending": "Núcleo34a emexecução semaceite;243últimostestes aceitos,251éexigêncianãoresultado. Ledger/admissão/vigência/reconciliação/completude/custos,taulegal,mistura/comparação,inversa/metas/indicadores/UI/CRUD/JSON/real/budget/ícones/histórico/CI/RCFglobal pendentes.",
  "compaction": "N7C impedida: nenhuma ferramenta nativa decompactação do contexto vivo exposta;handoffauxiliarpreservado,nãocomprova/substituicompactação.Sem polling."
}
