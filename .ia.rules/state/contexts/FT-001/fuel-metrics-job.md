# Handoff FT-003.32

{
  "job_id": "ef0d27a7-404c-47fc-ae8f-ceb19a87f36a",
  "status": "RUNNING",
  "execution_kind": "command_sequence",
  "repo": "D:/trampo/jcem.pro-uber",
  "thread_id": "01a16678-96c5-7eb2-9ee1-fea2b7b37cf2",
  "base": "aac65fb",
  "unit": ".ia.rules/state/contexts/FT-001/fuel-metrics-unit.md",
  "goal": "Resolver custo/km e autonomia independentes de combustível puro usando mesmos registro/ciclo.",
  "hashes": {
    "src/domain/fuel-metrics.ts": "31ee470e75cde5a48cd2a0acae0869fa97dea32e13f548e686d5ec194f4f2aa6",
    "src/domain/fuel-metrics.test.ts": "2d8b15679a0a7555353262dd0479fe9f62abeb36580a4dc91e39da09af44fd74"
  },
  "gate": "235 testes (225+10), tipos/lint;49 fontes preservadas",
  "report": ".ia.rules/state/contexts/FT-001/fuel-metrics-check.json",
  "previous": {
    "job": "2f693ad5-c010-443b-894e-d6cb0cf7bab7",
    "received_once": true,
    "review": "Q8S10 revisão1 registrada",
    "tests": 225,
    "commit": "aac65fb",
    "git": "main ahead23 coincide integralmente com snapshot, incluindo handoff"
  },
  "semantics": "FuelConfiguration puro etanol/gasolina: lookup BRL/L,km/L,L; custo/km preço÷eficiência, autonomia volume utilizável×eficiência. Preço/eficiência>0 e volume>=0, domínio guardado mesmo com constraints afrouxadas. Saídas independentes, bindings/status/hipóteses/diagnósticos mantidos; resolved não significa pronto globalmente, verification not-evaluated em métricas ready. Mistura recusada neste caminho, requer composição/eficiência independente. Sem regra70%, tanque nominal, preço histórico atual nem mudança6,8. Sem integração/aceite ledger ou evidência empírica.",
  "next": "Próxima interação: local_result uma vez; revisar proporcionalmente, Git/Q8S/commit supervisor. Depois mistura/comparação ou custo por período via km total e/ou admissão/reconciliação/completude em unidades pequenas. Não repetir exploração nem resultados aceitos.",
  "pending": "Esta unidade sem aceite; mistura/comparação/custo total combustível/ledger/vigência/reconciliação/completude/financeiro/metas/limiares/UI/CRUD/JSON/real/budget/ícones/histórico/CI/RCF global pendentes.",
  "compaction": "N7C: nenhuma ferramenta nativa de compactação do contexto vivo disponível; handoff auxiliar preservado, compactação não executada/comprovada. Sem polling."
}
