/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§§4/8.1/8.2, FT-003.16.
 * Autoria: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import type { CostRequirement } from './cost-requirement';

/** Rubricas citadas no RCF para revisão de incidência; não constituem preços ou lista fechada de custos. */
const references = Object.freeze([["financing","Financiamento","parcelas de financiamento","8.1"],["insurance","Seguro adequado ao uso por aplicativo","seguro adequado ao uso por aplicativo","8.1"],["ipva","IPVA","IPVA","8.1"],["licensing","Licenciamento","licenciamento","8.1"],["rotapro-subscription","Assinatura efetiva do Rota Pro","assinatura efetiva do Rota Pro","8.1"],["incremental-phone","Telefonia incremental","telefonia incremental","8.1"],["recurring-cleaning","Higiene recorrente","higiene recorrente","8.1"],["fuel","Combustível","combustível","8.1"],["tolls","Pedágios","pedágios","8.1"],["parking","Estacionamento","estacionamento","8.1"],["trip-cleaning","Lavagens por corrida","lavagens por corrida","8.1"],["event-tax","Tributação por evento","tributação por evento","8.1"],["time-day-costs","Custos por hora ou dia","custos por hora/dia","8.1"],["additional-usage","Adicionais de uso configurados","adicionais configurados","8.1"],["initial-preparation","Preparação ou regularização inicial","preparação/regularização inicial","8.1"],["specific-repairs","Reparos específicos","reparos específicos","8.1"],["occurrences","Ocorrências e custos não recorrentes","ocorrências e custos não recorrentes","8.1"],["fixed-levies","Tributos e encargos fixos não incluídos nos demais fixos","tributos/encargos de valor fixo não incluídos em","8.2"],["revenue-levies","Tributos sobre receita: incidência legal a verificar","apuração tributária legal","8.2"],["other-applicable-costs","Outros custos materialmente aplicáveis: revisão necessária","outros itens","8.1"]].map(row => Object.freeze(row)));

/**
 * Pendências iniciais de identificação/parametrização, sem custo zero ou inaplicabilidade presumidos.
 * O scope global é da revisão do planejamento; não define natureza, base, rateio ou incidência monetária.
 * Novas rubricas podem ser adicionadas; manutenção e dízimo conhecidos têm fontes próprias.
 */
export const INITIAL_UNVERIFIED_COST_REQUIREMENTS: readonly CostRequirement[] = Object.freeze(
  references.map(([category, name, term, section]): CostRequirement => Object.freeze({
    id: JSON.stringify(['initial-cost-requirement', category]),
    name, category,
    status: 'unverified' as const,
    reason: 'Revisão de incidência e parametrização pendente; não presumir valor zero.',
    provenance: Object.freeze({
      kind: 'gap' as const, source: 'RCF.md §'+section+' | '+term,
      date: null, competence: null,
      scope: Object.freeze({ kind: 'global' as const }), reliability: 'unverified' as const,
    }),
  })),
);
