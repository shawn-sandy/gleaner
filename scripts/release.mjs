// @ts-check
// Cut a release commit: bump plugin.json, date the Unreleased changelog entry, validate, and commit.
// Usage: npm run release -- <patch|minor|major> --summary "<lowercase summary>" --body <file>
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { bump, isBump, stamp, unreleased } from './changelog.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = resolve(root, 'plugins/gleaner/.claude-plugin/plugin.json');
const readmePath = resolve(root, 'README.md');
const usage = 'Usage: npm run release -- <patch|minor|major> --summary "<lowercase summary>" --body <file>';

/**
 * Run a command in the repository root and return its stdout, or throw with its stderr.
 * @param {string} command
 * @param {string[]} args
 * @returns {string}
 */
function capture(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed: ${result.stderr.trim()}`);
  return result.stdout;
}

/**
 * Run a command in the repository root with its output shown; return whether it exited 0.
 * @param {string} command
 * @param {string[]} args
 * @param {string} [input]
 * @returns {boolean}
 */
function succeeds(command, args, input) {
  const result = spawnSync(command, args, { cwd: root, input, stdio: [input === undefined ? 'inherit' : 'pipe', 'inherit', 'inherit'] });
  return !result.error && result.status === 0;
}

/** @returns {string} the local date as YYYY-MM-DD */
function today() {
  const now = new Date();
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()].map(part => String(part).padStart(2, '0')).join('-');
}

function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { summary: { type: 'string' }, body: { type: 'string' } },
  });
  const [type, ...extra] = positionals;
  if (!isBump(type) || extra.length || values.summary === undefined || values.body === undefined) throw new Error(usage);
  const summary = values.summary.trim();
  if (!summary || summary.includes('\n') || summary !== summary.toLowerCase()) {
    throw new Error('--summary must be one lowercase line, such as "add a notion destination"');
  }
  // npm runs scripts from the package root; INIT_CWD is where the command was typed.
  const bodyPath = resolve(process.env.INIT_CWD ?? process.cwd(), values.body);
  const body = readFileSync(bodyPath, 'utf8').trim();
  if (!body) throw new Error(`${values.body} is empty: write the commit body bullets there`);

  const branch = capture('git', ['branch', '--show-current']).trim();
  if (!branch) throw new Error('check out a branch first: HEAD is detached');
  if (capture('git', ['diff', '--name-only', '--diff-filter=U']).trim()) throw new Error('resolve the merge conflicts first');
  if (capture('git', ['status', '--porcelain']).split('\n').some(line => line.startsWith('??'))) {
    throw new Error('untracked files would be left out of the release commit: git add or remove them first');
  }
  const claude = spawnSync('claude', ['--version'], { stdio: 'ignore' });
  if (claude.error || claude.status !== 0) {
    throw new Error('install the Claude Code CLI first: a release must run both strict Claude checks, which validation skips without it');
  }

  const manifestSource = readFileSync(manifestPath, 'utf8');
  const readmeSource = readFileSync(readmePath, 'utf8');
  const current = /** @type {{ version?: unknown }} */ (JSON.parse(manifestSource)).version;
  if (typeof current !== 'string') throw new Error('plugin.json has no version');
  const version = bump(current, type);
  const readme = stamp(readmeSource, version, today());
  const manifest = manifestSource.replace(`"version": "${current}"`, `"version": "${version}"`);
  if (/** @type {{ version?: unknown }} */ (JSON.parse(manifest)).version !== version) {
    throw new Error('could not find "version": "X.Y.Z" in plugin.json to update');
  }
  const target = branch === 'main' ? `release/${version}` : branch;

  try {
    writeFileSync(manifestPath, manifest);
    writeFileSync(readmePath, readme);
    if (!succeeds('npm', ['run', 'validate']) || !succeeds('npm', ['test'])) throw new Error('validation failed');
    if (target !== branch) capture('git', ['switch', '--create', target]);
    // --all stages tracked changes only if the commit succeeds, so a failed commit leaves the index as it was.
    if (!succeeds('git', ['commit', '--all', '--file', '-'], `Gleaner ${version}: ${summary}\n\n${body}\n`)) throw new Error('git commit failed');
  } catch (error) {
    writeFileSync(manifestPath, manifestSource);
    writeFileSync(readmePath, readmeSource);
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`${reason}; plugin.json and the ${unreleased} changelog entry are restored, so fix it and rerun`);
  }
  console.log(`Committed Gleaner ${version} on ${target}. Merging it to main tags v${version} and publishes its GitHub Release.`);
}

try {
  main();
} catch (error) {
  console.error(`release: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
