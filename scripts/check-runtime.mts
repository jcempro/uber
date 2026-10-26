/**
 * @license MPL-2.0 — https://www.mozilla.org/MPL/2.0/
 * Origem: jcem.pro-uber; RCF§2.
 * Autoria Git: JeanCarloEM <jeancarlo@jeancarloem.com>.
 *
 * Uso: node scripts/check-runtime.mts [--help].
 * Sem args, lê engines.node da raiz ancorada neste arquivo.
 * Códigos: 0 compatível/ajuda; 2 configuração ou uso inválido;
 * 3 runtime incompatível. Sem escrita, rede, cache ou alteração de ambiente.
 */
import { readFileSync } from 'node:fs';
import semver from 'semver';

/**
 * Encerra a pré-condição com diagnóstico antes de carregar ferramentas.
 * @param message Motivo operacional em pt-BR.
 * @param code 2 para configuração/uso; 3 para runtime incompatível.
 * @returns Nunca retorna; escreve em stderr e encerra o processo.
 */
function fail(message: string, code: 2 | 3): never {
  console.error(message);
  process.exit(code);
}

/**
 * Recupera a faixa canônica sem depender do diretório de chamada.
 * @returns engines.node válido, incapaz de autorizar Node anterior a 24.
 * @remarks Lê apenas package.json; configuração inválida encerra com código 2.
 */
function requiredRange(): string {
  let manifest: unknown;
  try {
    manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  } catch {
    fail('Configuração inválida: não foi possível ler o package.json da raiz.', 2);
  }
  if (!manifest || typeof manifest !== 'object' || !('engines' in manifest)) {
    fail('Configuração inválida: engines.node é obrigatório em package.json.', 2);
  }
  const engines = manifest.engines;
  if (!engines || typeof engines !== 'object' || !('node' in engines) || typeof engines.node !== 'string') {
    fail('Configuração inválida: engines.node deve ser uma faixa SemVer.', 2);
  }
  const normalized = semver.validRange(engines.node);
  if (normalized === null) {
    fail('Configuração inválida: engines.node não é uma faixa SemVer válida.', 2);
  }
  // O intervalo configurável não pode enfraquecer o piso normativo.
  if (!semver.subset(normalized, '>=24.0.0')) {
    fail('Configuração inválida: engines.node deve exigir Node 24 ou superior.', 2);
  }
  return engines.node;
}

const args = process.argv.slice(2);
if (args.length === 1 && args[0] === '--help') {
  console.log('Uso: node scripts/check-runtime.mts [--help]\nVerifica engines.node e o piso Node 24.\nCódigos: 0 compatível/ajuda; 2 configuração/uso inválido; 3 runtime incompatível.');
} else {
  if (args.length !== 0) {
    fail('Argumentos inválidos. Use --help para consultar o uso.', 2);
  }
  const range = requiredRange();
  if (!semver.satisfies(process.versions.node, range)) {
    fail('Runtime incompatível: Node ' + process.versions.node + '; faixa exigida: ' + range + '.', 3);
  }
}
