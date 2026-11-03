// Build a skills-only submission ZIP without changing the Claude package or its version source.
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { adaptOpenAIContent } from './openai-content.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const plugin = resolve(root, 'plugins/gleaner');
const [destination, ...extra] = process.argv.slice(2);
let staging;

/** Reject symlinks and special files before copying a package subtree. */
function regularTree(path) {
  const stat = lstatSync(path);
  if (stat.isFile()) return;
  if (!stat.isDirectory()) throw new Error(`Only regular files and directories can be packaged: ${path}`);
  for (const entry of readdirSync(path)) regularTree(resolve(path, entry));
}

try {
  if (!destination || extra.length) throw new Error('Usage: npm run package:openai -- /path/to/gleaner.zip');
  const output = resolve(process.env.INIT_CWD ?? process.cwd(), destination);
  if (!output.endsWith('.zip')) throw new Error('Output must end in .zip');
  if (existsSync(output)) throw new Error('Output already exists; choose a new ZIP path');
  const validation = spawnSync(process.execPath, [resolve(root, 'scripts/validate-skills.mjs')], { cwd: root, stdio: 'inherit' });
  if (validation.error) throw validation.error;
  if (validation.status !== 0) throw new Error('Local validation failed; no ZIP created');
  const source = JSON.parse(readFileSync(resolve(plugin, '.claude-plugin/plugin.json'), 'utf8'));
  const listing = JSON.parse(readFileSync(resolve(plugin, 'openai-listing.json'), 'utf8'));
  staging = mkdtempSync(resolve(tmpdir(), 'gleaner-openai-'));
  for (const entry of ['skills', 'assets', 'README.md', 'PRIVACY.md']) {
    regularTree(resolve(plugin, entry));
    cpSync(resolve(plugin, entry), resolve(staging, entry), { recursive: true });
  }
  adaptOpenAIContent(staging, listing);
  cpSync(resolve(root, 'LICENSE'), resolve(staging, 'LICENSE'));
  mkdirSync(resolve(staging, '.codex-plugin'));
  writeFileSync(resolve(staging, '.codex-plugin/plugin.json'), `${JSON.stringify({
    name: source.name,
    version: source.version,
    description: listing.longDescription,
    author: source.author,
    homepage: source.homepage,
    repository: source.repository,
    license: source.license,
    skills: './skills/',
    interface: listing,
  }, null, 2)}\n`);
  mkdirSync(dirname(output), { recursive: true });
  const zipped = spawnSync('zip', ['-q', '-r', output, '.'], { cwd: staging, encoding: 'utf8' });
  if (zipped.error || zipped.status !== 0) {
    rmSync(output, { force: true });
    throw zipped.error ?? new Error(zipped.stderr || 'zip failed');
  }
  console.log(`Created ${output} from Gleaner ${source.version}. Portal scans and clean-host acceptance testing are still required.`);
} catch (error) {
  console.error(`package:openai: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (staging) rmSync(staging, { recursive: true, force: true });
}
