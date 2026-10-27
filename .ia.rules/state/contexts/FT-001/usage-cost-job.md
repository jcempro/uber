# Handoff FT-003.31

{
  "job_id": "2f693ad5-c010-443b-894e-d6cb0cf7bab7",
  "status": "RUNNING",
  "execution_kind": "command_sequence",
  "repo": "D:/trampo/jcem.pro-uber",
  "thread_id": "01a16678-96c5-7eb2-9ee1-fea2b7b37cf2",
  "base": "7ec88e4",
  "unit": ".ia.rules/state/contexts/FT-001/usage-cost-unit.md",
  "goal": "Quantificar taxa × uso exato no mesmo contexto/período/unidade, sem admissão ao ledger.",
  "hashes": {
    "src/domain/usage-cost.ts": "7d7f752cbf3fa675d55a7d71b152a2ab8a0bbd73dfb30916fab86e4eb2948a55",
    "src/domain/usage-cost.test.ts": "1ae871b4828df1ef2d1132ac96a91dcd5e8adae42426baffe39ff9c6b8ba6353"
  },
  "gate": "225 testes (217+8), tipos/lint, 47 fontes preservadas",
  "report": ".ia.rules/state/contexts/FT-001/usage-cost-check.json",
  "previous": {
    "job": "ab850e3f-1932-427f-89aa-df5abf4d6ce7",
    "received_once": true,
    "review": "Q8S10 revisão1 registrada",
    "tests": 217,
    "commit": "7ec88e4",
    "git": "main ahead22 confirmado; calendar-cost-job.md criado depois do snapshot, mtime conferido"
  },
  "semantics": "Somente quantificação. Contexto/período da quantidade têm de coincidir exatamente com o contexto solicitado; unidade do uso igual à base. Taxas BRL/km, BRL/h, BRL/working-day, BRL/trip; BRL avulso recusado. Quantidades/taxas não negativas, diagnóstico original e hipótese zero preservados; uso zero não sana taxa desconhecida. Disabled excluído sem valor, outras incidências têm caminho próprio. Sem financeiro por volume. ledgerAdmission not-evaluated em ready/excluded. Não apura K total nem prova realização/proveniência; chamador fornece quantidade coerente.",
  "next": "Na próxima interação: local_result uma vez; revisão proporcional, Git, Q8S e commit supervisor se aceito. Depois combustível e/ou admissão/vigência/reconciliação/completude de custos em unidades restritas; não somar quantificadores ready como C_oper completo.",
  "pending": "Uso ainda sem aceite; combustível/admissão/vigência/reconciliação/completude/ledger/financeiro/metas/limiares/UI/CRUD/JSON/real/calendário/budget real/ícones/histórico/CI/RCF global pendentes.",
  "compaction": "N7C: nenhuma ferramenta nativa ligada ao contexto vivo disponível. Handoff auxiliar preservado; compactação não executada/comprovada. Sem polling."
}
