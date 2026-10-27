# Handoff FT-003.34b.1

{
  "job_id": "851fb791-7e44-4b1a-ba25-6007e94a097b",
  "status": "RUNNING",
  "execution_kind": "command_sequence",
  "repo": "D:/trampo/jcem.pro-uber",
  "thread_id": "01a16678-96c5-7eb2-9ee1-fea2b7b37cf2",
  "base": "1e1d701",
  "unit": ".ia.rules/state/contexts/FT-001/financial-input-validation-unit.md",
  "goal": "Validar normalização já materializada, corrigindo apenas a invocação do compilador isolado.",
  "expect_changes": false,
  "justification": "Fonte/teste materializados no604a05d9, SHAs conferidos; devem ficar intactos. Escrever apenas report/cache. Não há implementação pendente dentro desta unidade de validação.",
  "sourceHashes": {
    "src/domain/financial-input.ts": "18faa90f642131fe9ac6aeb0cc1d5675d963781055b3afb923e77778c8a7136d",
    "src/domain/financial-input.test.ts": "b066f58bb03dba4110a3f7f847ef2e2930d94f7c8895fcf70a9a33ebfce967ae"
  },
  "gate": "Typecheck estrito isolado com --ignoreConfig + mesmas opções do perfil;lint2arquivos/4testesdirecionados;54arquivos anteriores protegidos. Não é validação plena doapp.",
  "report": ".ia.rules/state/contexts/FT-001/financial-input-check.json",
  "previous": {
    "job": "604a05d9-22ca-4338-9640-8644a5eabee3",
    "received_once": true,
    "status": "FAILED",
    "error_kind": "WORKER_INCOMPLETE",
    "review": "Q8S9 revisão1 registrada",
    "facts": "Materializaçãoexit0;verificadorparouTS5112 anteslint/testes. Fonte18faa90/testeb066f58conferidos; código não reprovado funcionalmente. Help real do tsc --help --all confirma--ignoreConfig para lista de arquivos comtsconfigpresente.",
    "git": "snapshot/live main ahead1confere;financial-input-job.md extra após snapshot12:43:11Z,mtime12:43:36Z"
  },
  "failureArchive": ".ia.rules/state/contexts/FT-001/financial-input-failed-check.json",
  "failureEvidence": ".ia.rules/state/contexts/FT-001/financial-input-failed-evidence.json",
  "materialChange": "Acrescentar somente --ignoreConfig noargvdo typecheck direcionado,mantendo strict,isolatedModules,verbatimModuleSyntax,esModuleInterop,skipLibCheck=false,noUnused,lib/types explícitos ehash tsconfig6d6c686. Modoisolado semprefoiintencional poisfixturefinanceirafinal referencia módulo aindaausente. Nenhumaalteração decritério/teste/norma/aplicação global; corrigefalsoinsucessodeinvocação.",
  "semantics": "resolveFinancialProjectionInput valida7racionais>=0 econtexto/período/kindprojection;normaliza×1 ecompara0;gapsnão0;snapshotprofundofrozensemcongelarinputs;statusreadyéapenasmatemático,financialAssessment not-evaluated;semLLF/margem/baselegal/admissãocustos.",
  "next": "Próxima interação: local_result uma vez; conferirreport/4testes/tipos/lint eSHAs/Git;Q8S comrecibo. Seaceito versionarnormalização comWIP financeiro explícito; não repetir testes globais semnova integração. Depois comporálgebra RCF8.2 sobreinputnormalizado eexportarFinancialProjectionInput nofinancial-result.ts;usarfixture8imutável928cba6. Gatepleno futuro255=243aceitos+4entradas+8resultado, nãoaprovação atual. Seerro restante, tratarcausaconcretasemrepetirmaterialização,nempaidfallbackintegral.",
  "pending": "Verificação34b.1 emexecução semaceite. financial-result.ts ausente;fixturefinal8intacta/pendente;últimogateglobalaceito243. Núcleofinanceiro,ledger/admissão/vigência/reconciliação/completude/taulegal/mistura/comparação/metas/inversa/UI/JSON/real/budget/ícones/histórico/CI/RCFglobal pendentes.",
  "compaction": "N7C impedida: nenhuma ferramenta nativa decompactação docontexto vivo exposta;handoffauxiliarpreservado,nãocomprova/substituicompactação.Sem polling."
}
