/**
 * @license MPL-2.0
 * Origem: repositório jcem.pro-uber.
 * @author JeanCarloEM <jeancarlo@jeancarloem.com>
 * @see {@link https://www.mozilla.org/MPL/2.0/}
 * @see RCF§2, RCF§10
 */

import type { JSX, ReactNode } from 'react';

/**
 * Shell global reutilizável com cabeçalho, toolbar e rodapé.
 * Mantém o conteúdo do módulo dentro do landmark principal.
 * @param children — conteúdo recebido por propriedade imutável.
 * @returns Estrutura comum para qualquer módulo, inclusive conteúdo único ou vazio.
 */
export function AppShell({ children }: Readonly<{ children: ReactNode }>): JSX.Element {
  return (
    <>
      <header>
        <h2>Planejador UberX</h2>
      </header>
      <nav role="toolbar" aria-label="Ferramentas globais">
        <a href="#conteudo">Planejamento</a>
      </nav>
      <main id="conteudo" tabIndex={-1}>
        {children}
      </main>
      <footer />
    </>
  );
}
