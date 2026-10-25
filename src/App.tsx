/**
 * @license MPL-2.0
 * Origem: repositório jcem.pro-uber.
 * @author JeanCarloEM <jeancarlo@jeancarloem.com>
 * @see {@link https://www.mozilla.org/MPL/2.0/}
 * @see RCF§2, RCF§10
 */

import type { JSX } from 'react';
import { AppShell } from './components/AppShell';

/**
 * Mantém o estado inicial explícito até haver cálculo válido,
 * sem apresentar valores financeiros fictícios.
 */
function App(): JSX.Element {
  return (
    <AppShell>
      <h1>Planejamento financeiro</h1>
      <p role="status">Nenhum cenário calculado.</p>
    </AppShell>
  );
}

export default App;
