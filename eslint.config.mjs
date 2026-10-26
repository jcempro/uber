// eslint.config.mjs — FT-002.5
// MPL-2.0, https://www.mozilla.org/MPL/2.0/, origem jcem.pro-uber/RCF§2
// Autoria Git JeanCarloEM <jeancarlo@jeancarloem.com>

import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['.ia.rules/**', 'node_modules/**', 'dist/**', '.cache/**']
  },
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'vite.config.mts', 'scripts/check-runtime.mts'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        ecmaVersion: 2023,
        sourceType: 'module'
      }
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }]
    }
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.test.*', 'src/**/*.spec.*', 'src/**/__tests__/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['node:*'],
              message: 'Código do navegador deve usar APIs Web; Node pertence à configuração e aos testes.'
            }
          ]
        }
      ]
    }
  }
]);
