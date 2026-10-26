# Handoff FT-003.24

```json
{
  "job_id": "bb6bd04a-d43d-4618-a90e-f62f07cea6fb",
  "status": "RUNNING",
  "repo": "D:/trampo/jcem.pro-uber",
  "thread_id": "01a16678-96c5-7eb2-9ee1-fea2b7b37cf2",
  "base": "5c2160b",
  "unit": ".ia.rules/state/contexts/FT-001/budget-calendar-unit.md",
  "goal": "Calendário orçamentário mensal exato,perdasmensais explícitas,dias/horas equivalentes semana/mês/ano;reutiliza operações aceitas,sem demanda/viabilidade presumida.",
  "targets": [
    "src/domain/budget-calendar.ts",
    "src/domain/budget-calendar.test.ts"
  ],
  "fixtureSha": "84bc3e3e0375254d694e6057643ae34fd6126b54bdf23328a6c9bc54ca561488",
  "gate": "161testes=152anteriores+9novos,tipo/lint,29fontes preservadas",
  "report": ".ia.rules/state/contexts/FT-001/budget-calendar-check.json",
  "previous": {
    "job": "781a1001-b328-4d42-946c-f65b092b8e98",
    "received_once": true,
    "review": "Q8S10 revisão1 registrada",
    "tests": 152,
    "git": "main ahead13 antes decommit conferido,sem divergência",
    "commit": "5c2160b"
  },
  "normative": "RCF§7.2 lido:4*30/7=120/7,360diasorçamentários,perdasrespeitamperíodo.Real/diasrestantes separados;defaults time-lost-days ainda not-provided.Globaldeparâmetro NÃO definecompetência mensal;adaptadorfuturo sópodefornecerperdas apósresolverisso.",
  "trace": "Preparação detectouausência deentradaindividual para§7.2;nenhumfonte/job criado nafalha.Vínculooficial causaldeprecisão preservado,testescitamRCFdiretamente,mapavalidado44/44.Sem inventarentrada/alterarcritérios.",
  "next": "Próxima interação:local_result uma vez,revisão proporcional de fonte/evidências/Git,Q8S ecommit supervisor seaceito.Depoisadaptarcalendários/entradas ecustos emunidades pequenas;reusarbaseexata.Sem repetirprovasconfiáveis/exploraçãoregistrada.",
  "pending": "Calendárioainda semaceite;calendárioreal/diasrestantes/adaptadordecadastros/custos/metas/limiares/ajustes/motorfinanceiro/budgetrealapp/CRUD/UI/JSON/histórico/CI/global pendentes.",
  "compaction": "N7C impedida:catálogoatual confirmousem ferramenta nativa decompactação exposta;handoffauxiliar não substitui compactação,sem alegação e sem polling."
}
```
