# Contexto mestre — FT-001 (inicialização)

**Objetivo global**: executar integralmente a solicitação canônica `../../requests/FT-001/prompt.md`, conforme RCF.md, como pré-requisito documental para implementação.

**Fontes e decisões prevalecentes**:
- Evolução humana de27/10/2026: `../../requests/FT-001/autocalc-evolution.md`, segmentada em `autocalc-evolution-plan.md`; prevalece sobre dízimo invariavelmente obrigatório e restrição de IR somente legal. Dízimo ativável,10% obrigatório quando ativo; IR opcional como simulação separada de apuração legal. Reconciliação RCF pendente antes de código afetado. Demais decisões financeiras preservadas.
- `supervisor.md`: RCF como contrato; sem dados operacionais reais; Microsoft Fluent UI System Icons confirmado (prevalece sobre pendência); invariantes: nota ≥ 4,80 e dízimo 10%; 4 dias/semana = 120/7 dias/mês; Yaris etanol 6,8 km/L; planilha histórica intacta.
- `decision-icons.md`: confirmação humana de Fluent UI System Icons; não autoriza coleção completa ou rede em runtime.
- `../../requests/FT-001/financial-supplement.md`: eliminar métricas sem valor decisório (ex. corridas/hora como indicador); priorizar receita creditada, R$/hora/dia/semana/mês, custos fixos/variáveis, lucro/margem; cada cenário deve responder viabilidade e metas com limiares mínimos.
- `../../requests/FT-001/financial-correction.md`: volume de viagens NÃO equivale a rentabilidade; custos fixos e variáveis devem ser segregados; metas não podem ser baseadas em quantidade de corridas.

**Fases definidas em `supervisor.md` (sequencial, dependências e estado pendente)**:
1. FT-001 inicializar fonte, FTs, contexto mestre e estado canônico; validar documentos.
2. Toolchain: fontes oficiais, Node24+, Vite/TS/TSX/Sass, runtime TSX, testes, decimal; scripts gerenciados.
3. Modelo: parâmetros tipados, validações, veículo único, perfis e custos editáveis.
4. Economia em unidades: calendário/demanda/capacidade/combustíveis; custos/reservas/realizado; quatro alvos.
5. Rota Pro: recomendações por contexto, simulador, percentuais distintos da margem mensal.
6. Dados: persistência browser-side, envelope JSON, validação atômica/limites/backup/idempotência.
7. UI: shell/toolbar, dashboard seis avaliações, editores, CRUD, detalhes, simulador; acessibilidade.
8. Histórico: planilha como referência conceitual; registrar aproveitamento/conflitos/hash.
9. Integração: rastreabilidade RCF→código→testes, auditoria, build/bundle/offline/browsers, workflow Pages.

**Invariants financeiros críticos**:
- Receita creditada ≠ valor passageiro ≠ lucro.
- Custos fixos + variáveis devem ser segregados.
- Meta financeira ≠ volume de viagens.
- Sem piso nominal por corrida; sem inferência de lucratividade por quantidade.

**Aceite global pendente**: F01–F18/U01/A01–A05 do RCF, com obrigação de mapeamento semântico futuro. IDs presentes não comprovam cobertura.

**Próximo checkpoint**: revisar este arquivo; corrigir canônico, metadados/FTs; commit inicial; reconciliação RCF antes de código.

## Registro das frentes e dependências

Fonte/hash: ../../requests/FT-001/metadata.json. FT-010 é conciliação de RCF distinta das frentes de código e precede FT-002. O registro abaixo não substitui segmentação antes da execução.

- [FT-001 — Inicialização documental](fts/FT-001.md): depende de nenhuma; registrada, pendente.
- [FT-010 — Conciliação normativa](fts/FT-010.md): depende de FT-001; registrada, pendente.
- [FT-002 — Toolchain](fts/FT-002.md): depende de FT-010; registrada, pendente.
- [FT-003 — Modelo e edição de parâmetros](fts/FT-003.md): depende de FT-002; registrada, pendente.
- [FT-004 — Economia, diagnósticos e sensibilidade](fts/FT-004.md): depende de FT-003; registrada, pendente.
- [FT-005 — Rota Pro e simulador](fts/FT-005.md): depende de FT-004; registrada, pendente.
- [FT-006 — Persistência, JSON e recálculo](fts/FT-006.md): depende de FT-003; registrada, pendente.
- [FT-007 — Interface e acessibilidade](fts/FT-007.md): depende de FT-004, FT-005, FT-006; registrada, pendente.
- [FT-008 — Referência histórica da planilha](fts/FT-008.md): depende de FT-001; registrada, pendente.
- [FT-009 — Integração e aceite global](fts/FT-009.md): depende de FT-002, FT-003, FT-004, FT-005, FT-006, FT-007, FT-008; registrada, pendente.
