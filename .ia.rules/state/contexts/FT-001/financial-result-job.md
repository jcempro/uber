# Handoff FT-003.34

{
  "job_id": "f5b5ac26-41f0-4a7d-bc90-5dafe141c3b1",
  "status": "RUNNING",
  "execution_kind": "inference",
  "response_contract_version": 1,
  "repo": "D:/trampo/jcem.pro-uber",
  "thread_id": "01a16678-96c5-7eb2-9ee1-fea2b7b37cf2",
  "base": "1e1d701",
  "unit": ".ia.rules/state/contexts/FT-001/financial-result-unit.md",
  "goal": "Implementar um arquivo de núcleo direto de projeção financeira conforme fórmulas RCF8.2; fixture fixa independente.",
  "targets": [
    "src/domain/financial-result.ts",
    "src/domain/financial-result.test.ts"
  ],
  "knownHashes": {
    "src/domain/financial-result.test.ts": "928cba62feb142bdaea837f12ff876c14261f43e7d8a8be6c27f756051372956"
  },
  "sourceHash": "desconhecido: implementação pelo worker, conferir no retorno",
  "gate": "251 testes (243+8), tipos/lint,53fontes preservadas; preparar_fixture antes da escrita e validar_projecao obrigatórios",
  "report": ".ia.rules/state/contexts/FT-001/financial-result-check.json",
  "previous": {
    "job": "d1bc69c5-5e29-4475-b20c-1a30be0dc5fb",
    "received_once": true,
    "review": "Q8S10 revisão1 registrada",
    "tests": 243,
    "commit": "1e1d701",
    "git": "snapshot/live coincidem:main...origin/main sem ahead;HEAD eorigin39d36be antes do commit;sincronização externa não atribuída ao supervisor"
  },
  "semantics": "FinancialProjectionInput readonly kindprojection,contextId,period e7racionais obrigatórios>=0:creditedRevenue/fixedCosts/usageCosts/extraordinaryCosts/fixedTaxes/titheRate/revenueTaxRate. Coper=F+V+E+Tfix;dízimo=qB;tributo=tauB;netProfit=B-dízimo-tributo-Coper;total=Coper+dízimo+tributo;G=1-q-tau; margem LLF/B apenasB>0 (B0 indisponível local). SóAPIs exatas aceitas, sem aritmética Number/rounding, manter falhas originais. Resultado matemático projected financialAssessment not-evaluated obrigatório; não certifica completude, incidência, legalidade/base tributária, caixa/realização, viabilidade/inversa/meta. Volume epreço passageiro ignorados,não usadoscomoB. Taxas explícitas,semdefaults; forward G<=0 permitido,sem inversa.",
  "evidence": "Fixture protegida pelo supervisor com8controles:1000-100-50-340=510,margem51%;B100 F80 V40 q10% produz -30 com1/10/100viagens;B0preservaF80 e margemundefined;>2^53/frações exatas;Gnegativo sem inversa;gaps/negativos/racional/actual recusados;budget;imutabilidade. Corrigida antes de qualquer execução uma expressão de teste TS de excesso depropriedade usando variável single;hashatual928cba6. Nada executado ainda exceto sintaxe dos scripts.",
  "next": "Na próxima interação: local_result uma vez; revisar fonte realmente produzida/fixture/RCF8.2/testes/baseline/Git,registrarQ8S comrecibo. Seaceito commit supervisor. Se falha preservar parcial/classificarcausae corrigir unidade pequena sem paidfallback/reexploração. Depois priorizar qualificação/admissão/vigência/reconciliação/completude doledger e metas/inversa/indicadores porcontexto; não aceitar kernel como avaliaçãofinanceira completa.",
  "pending": "Microescopo emexecução ainda semaceite;qualificação deB/custos/tau/ledger/vigência/reconciliação/completude,mistura/comparação,inversa/metas/indicadores/UI/CRUD/JSON/real/budget/ícones/histórico/CI/RCFglobal pendentes.",
  "compaction": "N7C impedida: sem ferramenta nativa decompactação do contexto vivo exposta;handoff auxiliarpreservado,não comprova/substituicompactação.Sem polling."
}
