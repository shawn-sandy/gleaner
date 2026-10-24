// @ts-check
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parse } from 'yaml';
import { bump, entry, stamp } from './changelog.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = 'plugins/gleaner/.claude-plugin/plugin.json';
const changelog = '# Gleaner\n\n## Changelog\n\n**1.0.0** (2026-01-01)\n- First.\n';
const added = '**Unreleased**\n- Added a thing.\n\n';

/**
 * @param {string} directory
 * @param {string[]} args
 * @returns {string}
 */
function git(directory, ...args) {
  const result = spawnSync('git', args, { cwd: directory, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

/** @param {string} directory */
function version(directory) {
  return /** @type {{ version: string }} */ (JSON.parse(readFileSync(join(directory, manifest), 'utf8'))).version;
}

function today() {
  const now = new Date();
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()].map(part => String(part).padStart(2, '0')).join('-');
}

/**
 * A git repository on main with the release scripts, plugin.json, a README holding only a changelog,
 * stub npm and claude commands, and an uncommitted Unreleased entry unless unreleased is false.
 * @param {import('node:test').TestContext} t
 * @param {{ npmExit?: number, unreleased?: boolean }} [options]
 */
function fixture(t, { npmExit = 0, unreleased = true } = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'gleaner-release-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const repo = join(directory, 'repo');
  for (const file of ['scripts', manifest]) cpSync(join(root, file), join(repo, file), { recursive: true });
  writeFileSync(join(repo, 'README.md'), changelog);
  mkdirSync(join(directory, 'bin'));
  writeFileSync(join(directory, 'bin/npm'), `#!/bin/sh\nprintf '%s\\n' "$*" >> '${join(directory, 'npm-calls')}'\nexit ${npmExit}\n`, { mode: 0o755 });
  writeFileSync(join(directory, 'bin/claude'), '#!/bin/sh\nexit 0\n', { mode: 0o755 });
  writeFileSync(join(directory, 'body.txt'), '- Add a thing\n- README: Changelog\n');
  git(repo, 'init', '-q', '-b', 'main');
  git(repo, 'config', 'user.name', 'Test');
  git(repo, 'config', 'user.email', 'test@example.com');
  git(repo, 'config', 'commit.gpgsign', 'false');
  git(repo, 'add', '.');
  git(repo, 'commit', '-q', '-m', 'Initial');
  if (unreleased) writeFileSync(join(repo, 'README.md'), changelog.replace('## Changelog\n\n', `## Changelog\n\n${added}`));
  return { directory, repo };
}

/**
 * @param {string} directory
 * @param {string[]} args
 */
function release(directory, args) {
  return spawnSync(process.execPath, [join(directory, 'repo/scripts/release.mjs'), ...args], {
    cwd: join(directory, 'repo'), encoding: 'utf8',
    env: { ...process.env, INIT_CWD: directory, PATH: `${join(directory, 'bin')}${delimiter}${process.env.PATH}` },
  });
}

const args = ['minor', '--summary', 'add a thing', '--body', 'body.txt'];

test('bumps each part of the version and refuses prereleases', () => {
  assert.equal(bump('1.9.3', 'patch'), '1.9.4');
  assert.equal(bump('1.9.3', 'minor'), '1.10.0');
  assert.equal(bump('1.9.3', 'major'), '2.0.0');
  assert.throws(() => bump('2.0.0-beta.1', 'patch'), /expected X\.Y\.Z/);
});

test('reads and stamps changelog entries', () => {
  const readme = '# Title\n\n## Changelog\n\n**Unreleased**\n- New.\n\n**1.1.0** (2026-01-02)\n- Second.\n- Also.\n\n**1.0.0** (2026-01-01)\n- First.\n';
  assert.equal(entry(readme, '1.1.0'), '- Second.\n- Also.');
  assert.equal(entry(readme, '1.0.0'), '- First.');
  assert.throws(() => entry(readme, '0.9.0'), /no changelog entry for 0\.9\.0/);
  assert.equal(entry(stamp(readme, '1.2.0', '2026-01-03'), '1.2.0'), '- New.');
  assert.throws(() => stamp(readme, '1.1.0', '2026-01-03'), /already has an entry/);
  assert.throws(() => stamp(readme.replace('**Unreleased**\n- New.\n\n', ''), '1.2.0', '2026-01-03'), /Unreleased/);
  assert.throws(() => stamp(readme.replace('- New.\n', ''), '1.2.0', '2026-01-03'), /at least one bullet/);
  assert.throws(() => stamp(readme.replace('**1.0.0**', '**Unreleased**\n- Older.\n\n**1.0.0**'), '1.2.0', '2026-01-03'), /merge the \*\*Unreleased\*\* entries/);
});

test('reads the Unreleased entry from the changelog, not from examples elsewhere in the README', () => {
  const readme = '# Title\n\n## Releasing\n\n```markdown\n**Unreleased**\n- Example.\n```\n\n## Changelog\n\n**Unreleased**\n- New.\n- Also new.\n\n**1.0.0** (2026-01-01)\n- First.\n';
  assert.equal(entry(readme, 'Unreleased'), '- New.\n- Also new.');
  assert.throws(() => entry(readme.replace('**Unreleased**\n- New.\n- Also new.\n\n', ''), 'Unreleased'), /no changelog entry for Unreleased/);
});

test('the README has a changelog entry for the current plugin version', () => {
  const result = spawnSync(process.execPath, [join(root, 'scripts/release-notes.mjs'), version(root)], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^- /);
});

test('release-notes exits 0 for Unreleased only while an entry waits, which the validate workflow warns about on main', t => {
  for (const unreleased of [true, false]) {
    const { repo } = fixture(t, { unreleased });
    const result = spawnSync(process.execPath, [join(repo, 'scripts/release-notes.mjs'), 'Unreleased'], { encoding: 'utf8' });
    assert.equal(result.status, unreleased ? 0 : 1, result.stderr);
    assert.equal(result.stdout.trim(), unreleased ? '- Added a thing.' : '');
  }
});

test('the validate workflow still warns about an owed release when an earlier step fails', () => {
  const workflow = parse(readFileSync(join(root, '.github/workflows/validate.yml'), 'utf8'));
  const step = workflow.jobs.validate.steps.find((/** @type {{ run?: string }} */ step) => step.run?.includes('release-notes.mjs Unreleased'));
  assert.ok(step, 'no validate.yml step runs release-notes.mjs Unreleased');
  // A step-level if with no status function gets an implicit success(), which skips the step after a failure.
  assert.match(step.if, /\b(always|cancelled|failure)\(\)/);
});

test('bumps, dates the changelog, validates, and commits on a release branch from main', t => {
  const { directory, repo } = fixture(t);
  const [major, minor] = version(repo).split('.').map(Number);
  const next = `${major}.${Number(minor) + 1}.0`;
  const result = release(directory, args);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(version(repo), next);
  assert.equal(readFileSync(join(repo, 'README.md'), 'utf8'), changelog.replace('## Changelog\n\n', `## Changelog\n\n**${next}** (${today()})\n- Added a thing.\n\n`));
  assert.equal(readFileSync(join(directory, 'npm-calls'), 'utf8'), 'run validate\ntest\n');
  assert.equal(git(repo, 'branch', '--show-current'), `release/${next}`);
  assert.equal(git(repo, 'log', '-1', '--format=%B'), `Gleaner ${next}: add a thing\n\n- Add a thing\n- README: Changelog`);
  assert.equal(git(repo, 'status', '--porcelain'), '');
});

test('refuses without an Unreleased entry and changes nothing', t => {
  const { directory, repo } = fixture(t, { unreleased: false });
  const before = version(repo);
  const result = release(directory, args);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unreleased/);
  assert.equal(version(repo), before);
  assert.ok(!existsSync(join(directory, 'npm-calls')));
});

test('restores plugin.json and the changelog when validation fails', t => {
  const { directory, repo } = fixture(t, { npmExit: 1 });
  const before = version(repo);
  const result = release(directory, args);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /validation failed/);
  assert.equal(version(repo), before);
  assert.equal(readFileSync(join(repo, 'README.md'), 'utf8'), changelog.replace('## Changelog\n\n', `## Changelog\n\n${added}`));
  assert.equal(git(repo, 'branch', '--show-current'), 'main');
  assert.equal(git(repo, 'rev-list', '--count', 'HEAD'), '1');
});

test('refuses untracked files, which the commit would leave out', t => {
  const { directory, repo } = fixture(t);
  writeFileSync(join(repo, 'new.md'), '# New\n');
  const result = release(directory, args);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /untracked files/);
});

test('refuses a summary that is not lowercase', t => {
  const { directory } = fixture(t);
  const result = release(directory, ['minor', '--summary', 'Add a thing', '--body', 'body.txt']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /lowercase/);
});
