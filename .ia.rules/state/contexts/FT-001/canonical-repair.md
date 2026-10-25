# Reparo determinístico — checkpoint

2026-10-25: job 8dc45fd3-07d1-4ee6-8f36-3cb737a63092 examinado após uma consulta local_result. Master criado, porém fontes financeiras/prompt têm caminhos relativos quebrados, falta explicitude em sensibilidades/dependências. Falha posterior por read_file repetido, não ausência total de alteração. Git determinístico coincide com inspeção atual: .ia.rules/state/ não versionado, sem commits de aplicação. Q8S 6, revisão 1.

Próxima unidade materialmente diferente: command_sequence sem inferência executa patch exato de index/TODO/continue e links do master; verifica hashes prévios, parser oficial e pós-condições. Não usar run_command genérico nem pedir geração de script ao Worker. Pré-condições: quatro hashes inspecionados, RCF intacto, src ausente. Pós-condições: índice oficial, cabeçalho e raiz TODO válidos, retomada honesta, links existentes. Reexecução reconhece estado aplicado sem sobrescrever divergência. Validar separadamente após patch; falha interrompe sequência. Não cria aplicação, não equivale a aceite global.

Depois: completar fontes/hash/FTs e dependências antes do commit inicial; reconciliar RCF com complementos antes de código. Pontos semânticos não cobertos pelo reparo permanecem pendentes. Compactação nativa não exposta.
