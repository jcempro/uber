/**
 * MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§2.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// Ancorar os caminhos à configuração mantém a saída em dist independentemente de cwd.
export default defineConfig({
  root: fileURLToPath(new URL('./src', import.meta.url)),
  base: './',
  plugins: [react()],
  css: {
    preprocessorOptions: {
      // A página já declara UTF-8; manter a licença antes de qualquer regra CSS.
      scss: { charset: false }
    }
  },
  build: {
    target: 'es2023',
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
    manifest: true,
    sourcemap: false,
    rolldownOptions: {
      output: {
        comments: { legal: true },
        // Inserir depois da minificação preserva a identificação da licença.
        postBanner: '/*! MPL-2.0 — https://www.mozilla.org/MPL/2.0/ | jcem.pro-uber | RCF§2 */'
      }
    }
  }
})
