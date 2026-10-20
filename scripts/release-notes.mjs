// @ts-check
// Print one version's README changelog entry, or the Unreleased one. The release workflow uses a version's entry as
// the GitHub Release notes; the cut-release workflow uses the Unreleased entry as the release commit body.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { entry } from './changelog.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [version, ...extra] = process.argv.slice(2);

try {
  if (!version || extra.length) throw new Error('Usage: node scripts/release-notes.mjs <version|Unreleased>');
  console.log(entry(readFileSync(resolve(root, 'README.md'), 'utf8'), version));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
