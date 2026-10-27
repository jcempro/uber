# Handoff FT-003.34d

{
  "job_id": "f9814cbb-8990-4735-8555-300976dc1f12",
  "status": "RUNNING",
  "execution_kind": "command_sequence",
  "repo": "D:/trampo/jcem.pro-uber",
  "thread_id": "01a16678-96c5-7eb2-9ee1-fea2b7b37cf2",
  "base": "127503f",
  "unit": ".ia.rules/state/contexts/FT-001/revenue-charges-unit.md",
  "goal": "Somente encargos qB/tauB eG=1-q-tau sem avaliação fiscal.",
  "hashes": {
    "src/domain/revenue-charges.ts": "e2d0ec106294ef21632b47c11f54ef77b01c9f6bfa17425696136896157fa342",
    "src/domain/revenue-charges.test.ts": "fc4205df2948991b2b1a6886de5c3879a699785db463f67e4458b50ffe6482d9"
  },
  "gate": "4controlesdirecionados/compilaçãoestritaisolada/lint2arquivos;58arquivos protegidos(57aceitos+fixturefinalpendente),não appglobal.",
  "report": ".ia.rules/state/contexts/FT-001/revenue-charges-check.json",
  "previous": {
    "job": "f1a1caa4-f89d-43d7-a8f6-d8178ad234f8",
    "received_once": true,
    "status": "COMPLETED",
    "review": "Q8S10/revisão1 registrada",
    "result": "SomaCoper conferida comRCF8.2,independenteatividade/gaps/recursos;SHAs690b3cf/53c2eb9,4controles+compilaçãoisolada/lint;56anterioresintactos.",
    "git": "main ahead2confere;operating-cost-job.md posterior ao snapshot12:52:31Z,mtime12:52:40Z",
    "commit": "127503f"
  },
  "semantics": "calculateRevenueCharges input3racionaisnão negativos:creditedRevenue,titheRate,revenueTaxRate;semdefaults. Guardabudgetprimeiro,inputobject/3compare,2produtos qB/tauB,2subtrações1-q-tau. B=repasse ao motorista depoisretenções,nãopassageiro/nãolucro. Gzero/negativopermitidonaálgebra direta,sem inversa oustatusviabilidade. Taxas explícitas não são prova de admissibilidade/baselegal;taxAssessment not-evaluated emready. Nenhumaduplicação de apuraçãocustos.Campos/diagnósticos originais,imutabilidade/recursos preservados.",
  "next": "Próxima interação: local_result uma vez,revisão proporcional/Git/Q8S/commitseaceito. Depois integrar financial-result.ts: reexportFinancialProjectionInput de financial-input.ts;resolveFinancialProjectionInput +calculateOperatingCost +calculateRevenueCharges jásegregados;comporLLF=B-tithe-tax-Coper,total=Coper+tithe+tax e margemLLF/BsomenteB>0. Semreescreverhelpers/normalização. Fixturefinal8imutável928cba6 jápresente ependente. Integração torna gatepleno exigido263=243+4input+4cost+4charges+8final. Usarapp:typecheck/app:lint/app:test quando módulo realexistir,contagem263justificada pelos12testesnovosdehelpers,semrelaxarcritério. Nenhum263foiexecutado. Encargosnovohelperaguardarevisão. Não repetir tentativaslargasinferências35k comleiturassemprogresso;scopeintegrationagoraémenor,oucomposiçãomecânicapequenaverificávelconformeregras.",
  "pending": "34d emexecução/semaceite. financial-result.ts ausente;fixturefinal8pendente;últimogateglobal243. Input4 eoperating4direcionadosaceitos. Ledger/admissão/vigência/reconciliação/completude/basefiscal/mistura/comparação/metas/inversa/indicadores/UI/CRUD/JSON/real/budget/ícones/histórico/CI/RCFglobal pendentes.",
  "compaction": "N7C impedida: nenhuma ferramenta nativa decompactação do contexto vivo exposta;handoffauxiliarpreservado,nãocomprova/substituicompactação.Sem polling."
}
