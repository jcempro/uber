# Handoff FT-003.34c

{
  "job_id": "f1a1caa4-f89d-43d7-a8f6-d8178ad234f8",
  "status": "RUNNING",
  "execution_kind": "command_sequence",
  "repo": "D:/trampo/jcem.pro-uber",
  "thread_id": "01a16678-96c5-7eb2-9ee1-fea2b7b37cf2",
  "base": "4d1d587",
  "unit": ".ia.rules/state/contexts/FT-001/operating-cost-unit.md",
  "goal": "Somente soma Coper=F+V+E+Tfix independente de receita/atividade.",
  "hashes": {
    "src/domain/operating-cost.ts": "690b3cf3c0429e0b1951189c6b750ac2df6478bbb282da8ae45d5eabbeb4523c",
    "src/domain/operating-cost.test.ts": "53c2eb92a667260d79b07b76ccd6d4a09104b06088a8ef7ec56c827063698f9b"
  },
  "gate": "4controlesdirecionados+typecheckstrictisolado(--ignoreConfig)/lint2arquivos;56arquivos protegidos:55aceitos+fixturefinanceirafinalpendente. Nãoappcompleto.",
  "report": ".ia.rules/state/contexts/FT-001/operating-cost-check.json",
  "previous": {
    "job": "851fb791-7e44-4b1a-ba25-6007e94a097b",
    "received_once": true,
    "status": "COMPLETED",
    "review": "Q8S10/revisão1 registrada",
    "result": "Entradasnormalizadas4/4testes+compilaçãoisoladaestrita+lint;SHAs18faa90/b066f58conferidos;falhaTS5112 corrigida sem alterarfontes/testes.",
    "git": "main ahead1 snapshot/live confere;validation-job.md posterioraosnapshot12:46:50Z,mtime12:46:58Z",
    "commit": "4d1d587 (18arquivos de normalização/diagnóstico/norma deestado;financial-result.test.ts pendente NÃOincluída)"
  },
  "semantics": "OperatingCostInput apenasfixedCosts/usageCosts/extraordinaryCosts/fixedTaxes:ExactRational,obrigatórios>=0. calculateOperatingCost budgetprimeiro,valida4componentes comcompare, soma comcalculateExactSum;retornareadyvalue e costAdmission not-evaluated. Falhaoriginal/causadorpreservados,gapsnão0. Independente deB/q/tau/km/horas/viagens;fixospermanecemsemrodagem. Mesmocontexto/intervalo eapuração/incidência/completude/reconciliação são pré-condições não comprovadas pelohelper. Sem lucro/margem/inversa/metas/custoadmitido.",
  "next": "Próxima interação: local_result uma vez, revisão proporcional/Git/Q8S/commitseaceito. Não refazerinputnormalizer oubibliotecas. Próximaunidade pequena: dízimo/taxa/G e/ou comporLLF/margem a partir deinputnormalizado eCoper;delegaçãoenxuta,evitarreleiturasdoinferencemode. Fontefinancial-result.ts aindaausente,fixture8imutável928cba6. Futurogate259=243antigos+4input+4operating+8final,se34cpassar;atualnenhum259executado. Seisolatedchecksoknão declararappglobal.",
  "pending": "34c emexecução semaceite. financial-result.ts ausente/fixture8pendente;lastglobal243;input4direcionadosaceitos. Ledger/admissão/vigência/reconciliação/completude/taulegal/mistura/comparação/metas/inversa/indicadores/UI/CRUD/JSON/real/budget/ícones/histórico/CI/RCFglobal pendentes.",
  "compaction": "N7C impedida: nenhuma ferramenta nativa docontexto vivo exposta;handoffauxiliarpreservado,não comprova/substituicompactação.Sem polling."
}
