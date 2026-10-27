// @ts-check
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parse } from 'yaml';
import { entry } from './changelog.mjs';
import { pickBump, releasable, summarize, withUnreleased } from './auto-release.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = 'plugins/gleaner/.claude-plugin/plugin.json';
const changelog = '# Gleaner\n\n## Changelog\n\n**1.0.0** (2026-01-01)\n- First.\n';

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

/**
 * Write a file in the repository and commit it with the subject.
 * @param {string} repo
 * @param {string} path
 * @param {string} subject
 */
function commit(repo, path, subject) {
  mkdirSync(dirname(join(repo, path)), { recursive: true });
  writeFileSync(join(repo, path), `${subject}\n`);
  git(repo, 'add', '.');
  git(repo, 'commit', '-q', '-m', subject);
}

/**
 * A git repository on main with the scripts, plugin.json, and a README holding only a changelog, tagged as released.
 * @param {import('node:test').TestContext} t
 */
function fixture(t) {
  const repo = mkdtempSync(join(tmpdir(), 'gleaner-auto-release-'));
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  for (const file of ['scripts', manifest]) cpSync(join(root, file), join(repo, file), { recursive: true });
  writeFileSync(join(repo, 'README.md'), changelog);
  git(repo, 'init', '-q', '-b', 'main');
  git(repo, 'config', 'user.name', 'Test');
  git(repo, 'config', 'user.email', 'test@example.com');
  git(repo, 'config', 'commit.gpgsign', 'false');
  git(repo, 'add', '.');
  git(repo, 'commit', '-q', '-m', 'Initial');
  const version = /** @type {{ version: string }} */ (JSON.parse(readFileSync(join(repo, manifest), 'utf8'))).version;
  git(repo, 'tag', `v${version}`);
  return repo;
}

/**
 * @param {string} repo
 * @param {string} mode
 */
function run(repo, mode) {
  const { GITHUB_REPOSITORY, GITHUB_OUTPUT, ...env } = process.env;
  return spawnSync(process.execPath, [join(repo, 'scripts/auto-release.mjs'), mode], { cwd: repo, encoding: 'utf8', env: { ...env, RUNNER_TEMP: repo } });
}

test('only shipped plugin files are releasable', () => {
  for (const path of ['plugins/gleaner/skills/glean/SKILL.md', 'plugins/gleaner/skills/youtube/references/chatgpt-blocked-content.md', 'plugins/gleaner/skills/glean/agents/openai.yaml', 'plugins/gleaner/.claude-plugin/plugin.json', '.claude-plugin/marketplace.json']) {
    assert.ok(releasable(path), path);
  }
  for (const path of ['README.md', 'docs/requirements.md', 'plugins/gleaner/skills/README.md', 'plugins/gleaner/docs/notes.md', 'plugins/gleaner/CHANGELOG.md', 'scripts/release.mjs', '.github/workflows/release.yml']) {
    assert.ok(!releasable(path), path);
  }
});

test('the workflow paths filter covers the same files as releasable', () => {
  const workflow = parse(readFileSync(join(root, '.github/workflows/auto-release.yml'), 'utf8'));
  assert.deepEqual(workflow.on.push.paths, ['plugins/**', '.claude-plugin/**', '!**/README.md', '!**/CHANGELOG.md', '!**/docs/**']);
});

test('picks the largest labeled bump, patch by default, and skips only when every change says so', () => {
  assert.equal(pickBump([[]]), 'patch');
  assert.equal(pickBump([['bug'], ['release:minor']]), 'minor');
  assert.equal(pickBump([['release:major'], ['release:minor']]), 'major');
  assert.equal(pickBump([['release:skip']]), 'skip');
  assert.equal(pickBump([['release:skip', 'release:major'], []]), 'patch');
});

test('summarizes changes as one lowercase line', () => {
  assert.equal(summarize(['Close the Chrome tabs Gleaner opens (#42)']), 'close the chrome tabs gleaner opens');
  assert.equal(summarize(['Fix A', 'Add B']), 'add b and 1 more change');
  assert.equal(summarize(['Fix A', 'Fix B', 'Add C']), 'add c and 2 more changes');
});

test('adds an Unreleased entry from PR titles when the changelog has none', () => {
  const changes = [{ sha: 'a', title: 'Close the Chrome tabs (#42)', number: 42, labels: [], notes: false }, { sha: 'b', title: 'Fix a typo.', number: null, labels: [], notes: true }];
  const added = withUnreleased(changelog, changes);
  assert.equal(entry(added, 'Unreleased'), '- Close the Chrome tabs (#42).\n- Fix a typo.');
  assert.equal(entry(added, '1.0.0'), '- First.');
});

test('appends title bullets to an existing Unreleased entry only for changes that wrote none', () => {
  const written = changelog.replace('## Changelog\n\n', '## Changelog\n\n**Unreleased**\n- Written by hand.\n\n');
  const wrote = { sha: 'a', title: 'Add a thing', number: 1, labels: [], notes: true };
  assert.equal(withUnreleased(written, [wrote]), written);
  const added = withUnreleased(written, [wrote, { sha: 'b', title: 'Add another', number: 2, labels: [], notes: false }]);
  assert.equal(entry(added, 'Unreleased'), '- Written by hand.\n- Add another (#2).');
  assert.equal(entry(added, '1.0.0'), '- First.');
});

test('pending and plan find nothing when only docs changed since the release tag', t => {
  const repo = fixture(t);
  commit(repo, 'docs/notes.md', 'Document something');
  commit(repo, 'plugins/gleaner/skills/README.md', 'Reword the skills README');
  assert.equal(run(repo, 'pending').status, 1);
  const plan = run(repo, 'plan');
  assert.equal(plan.status, 0, plan.stderr);
  assert.match(plan.stdout, /^release=false$/m);
});

test('plan releases plugin changes since the tag as a patch and writes the changelog entry and commit body', t => {
  const repo = fixture(t);
  commit(repo, 'plugins/gleaner/skills/glean/SKILL.md', 'Save answers as gleans');
  commit(repo, 'docs/notes.md', 'Document something');
  assert.equal(run(repo, 'pending').status, 0);
  const plan = run(repo, 'plan');
  assert.equal(plan.status, 0, plan.stderr);
  assert.match(plan.stdout, /^release=true$/m);
  assert.match(plan.stdout, /^bump=patch$/m);
  assert.match(plan.stdout, /^summary=save answers as gleans$/m);
  assert.equal(entry(readFileSync(join(repo, 'README.md'), 'utf8'), 'Unreleased'), '- Save answers as gleans.');
  assert.equal(readFileSync(join(repo, 'release-body.md'), 'utf8'), '- Save answers as gleans.\n- README: add and date the changelog entry\n');
});

test('plan adds bullets for later changes when an earlier one wrote the Unreleased entry', t => {
  const repo = fixture(t);
  writeFileSync(join(repo, 'README.md'), changelog.replace('## Changelog\n\n', '## Changelog\n\n**Unreleased**\n- Written by hand.\n\n'));
  commit(repo, 'plugins/gleaner/skills/glean/SKILL.md', 'Add a thing');
  commit(repo, 'plugins/gleaner/skills/youtube/SKILL.md', 'Add another');
  const plan = run(repo, 'plan');
  assert.equal(plan.status, 0, plan.stderr);
  assert.equal(entry(readFileSync(join(repo, 'README.md'), 'utf8'), 'Unreleased'), '- Written by hand.\n- Add another.');
  assert.match(plan.stdout, /^summary=add another and 1 more change$/m);
});

test('plan leaves a merged version bump to release.yml until it is tagged', t => {
  const repo = fixture(t);
  const path = join(repo, manifest);
  writeFileSync(path, readFileSync(path, 'utf8').replace(/"version": "[^"]+"/, '"version": "99.0.0"'));
  git(repo, 'commit', '-q', '-am', 'Gleaner 99.0.0: bump');
  const plan = run(repo, 'plan');
  assert.equal(plan.status, 0, plan.stderr);
  assert.match(plan.stdout, /v99\.0\.0 is not tagged yet, so release\.yml publishes it and then runs this workflow again/);
  assert.match(plan.stdout, /^release=false$/m);
});
