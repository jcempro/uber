# FT-003.37b.2a — grupo canônico de casos

Worker subordinado. Esta unidade substitui somente a execução pendente de f4e97c6a-b58d-462a-a4f9-91736db17662, que não produziu arquivos. As leituras anteriores e o preparo dos geradores estão preservados; não os repita. Escopo reduzido: criar um único arquivo JSON com nove casos positivos, sem executar testes ou gerar TypeScript. Os demais cinco grupos e a suíte continuam pendentes.

Leia AGENTS.md, authority.md, este documento e somente as linhas 11–37 de src/domain/model.ts. Depois escreva `.ia.rules/state/contexts/FT-001/provenance-canonical-cases.json`. Não consulte schema executável, gerador, baseline, diretórios ou histórico. Não releia arquivos já obtidos. Não altere outro arquivo. Sem rede, instalação, commit ou comandos.

Formato exato: {"schema":1,"groups":[{"group":"canonical","cases":[{"id":"identificador-unico","input":{},"success":true}]}]}. Cada input deve conter os seis campos obrigatórios de Provenance. Criar exatamente nove casos: cada literal de EvidenceKind uma vez. Distribuir os cinco valores de reliability e os três ramos de ParameterScope entre eles. Use apenas dados sintéticos. source e IDs devem ser strings não brancas; inclua espaços externos em pelo menos uma source e um ID para conferir preservação literal. date/competence devem alternar null e string; não omita campos. Inclua uma string de data `2026-99-99`, com id que explicite validade somente estrutural; não certifique data real ou fonte.

kind da raiz é EvidenceKind; scope.kind é global/vehicle/scenario. Global só possui kind; vehicle exige vehicleId; scenario exige scenarioId. Sem campos extras, coerção ou inferência financeira. Não criar negativos nesta unidade. O oráculo vem do modelo canônico e deste contrato de forma, jamais do schema executável. Aceite deste fragmento exige JSON válido, nove casos, cobertura 9/5/3, seis campos por entrada e valores literais preservados. Não equivale a testes aprovados nem à implementação global.

Saída final: caminho criado e quantidade de casos; até 50 palavras.
