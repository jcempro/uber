// src/main.tsx — Inicialização React com proteção de elemento #root
// MPL-2.0 — https://www.mozilla.org/MPL/2.0/
// jcem.pro-uber — RCF§2/10
// Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.scss'
import App from './App'

const element = document.getElementById('root')
if (element === null) {
  throw new Error('Elemento #root não encontrado no DOM')
}

createRoot(element).render(
  <StrictMode>
    <App />
  </StrictMode>
)
