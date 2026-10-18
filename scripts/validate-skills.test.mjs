import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const glean = 'plugins/gleaner/skills/glean/SKILL.md';
const metadata = 'plugins/gleaner/skills/youtube/agents/openai.yaml';
const marketplace = '.claude-plugin/marketplace.json';

function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), 'gleaner-validation-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  for (const file of ['.claude-plugin', '.github', 'plugins', 'docs', 'README.md', 'LICENSE', 'scripts']) {
    cpSync(join(root, file), join(directory, file), { recursive: true });
  }
  symlinkSync(join(root, 'node_modules'), join(directory, 'node_modules'), 'dir');
  mkdirSync(join(directory, 'bin'));
  return directory;
}

function run(directory) {
  return spawnSync(process.execPath, [join(directory, 'scripts/validate-skills.mjs')], {
    encoding: 'utf8', env: { ...process.env, PATH: join(directory, 'bin') },
  });
}

function replace(directory, file, from, to) {
  const path = join(directory, file);
  const source = readFileSync(path, 'utf8');
  assert.ok(source.includes(from), `fixture source contains ${from}`);
  writeFileSync(path, source.replace(from, to));
}

test('valid repository passes without Claude and reports the skip', t => {
  const result = run(fixture(t));
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /SKIP Claude/);
});

const cases = [
  ['malformed frontmatter', glean, 'name: glean', 'name: "glean', /quote/],
  ['duplicate YAML keys', glean, 'name: glean', 'name: glean\nname: glean', /unique/],
  ['wrong skill name', glean, 'name: glean', 'name: clip', /name must match/],
  ['non-string description', glean, 'description:', 'description: false\noriginal:', /description must/],
  ['broken sibling reference', glean, '../youtube/SKILL.md', '../missing/SKILL.md', /ENOENT/],
  ['invalid display metadata', metadata, 'display_name: Gleaner YouTube', 'display_name: false', /display_name must/],
  ['missing metadata field', metadata, 'short_description:', 'other:', /short_description must/],
  ['missing icon', metadata, 'interface:', 'interface:\n  icon_small: ./missing.svg', /ENOENT/],
  ['malformed JSON', marketplace, '"name":', 'name:', /JSON/],
  ['wrong plugin source', marketplace, './plugins/gleaner', './plugins/missing', /ENOENT/],
  ['marketplace version', marketplace, '"name": "shawn-sandy",', '"name": "shawn-sandy", "version": "1.0.0",', /version belongs/],
  ['broken guide link', 'README.md', '](docs/chatgpt-marketplace.md)', '](docs/missing.md)', /ENOENT/],
];
for (const [name, file, from, to, message] of cases) {
  test(`rejects ${name}`, t => {
    const directory = fixture(t);
    replace(directory, file, from, to);
    const result = run(directory);
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, message);
  });
}

for (const file of [glean, metadata, 'LICENSE']) {
  test(`rejects missing required file: ${file}`, t => {
    const directory = fixture(t);
    rmSync(join(directory, file));
    assert.equal(run(directory).status, 1);
  });
}

test('rejects reference definitions and symlinks outside the repository', t => {
  const directory = fixture(t);
  symlinkSync(join(root, 'LICENSE'), join(directory, 'outside'));
  writeFileSync(join(directory, 'README.md'), '[license][ref]\n\n[ref]: outside\n');
  const result = run(directory);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /path leaves the repository/);
});

for (const code of [0, 1]) {
  test(`runs both Claude commands and propagates exit ${code}`, t => {
    const directory = fixture(t);
    const log = join(directory, 'claude-calls');
    writeFileSync(join(directory, 'bin/claude'), `#!/bin/sh\nprintf '%s\\n' "$*" >> '${log}'\nexit ${code}\n`, { mode: 0o755 });
    const result = run(directory);
    assert.equal(result.status, code, result.stdout + result.stderr);
    assert.equal(readFileSync(log, 'utf8'), 'plugin validate . --strict\nplugin validate ./plugins/gleaner --strict\n');
    assert.doesNotMatch(result.stdout, /SKIP Claude/);
  });
}

test('rejects an empty Skill body', t => {
  const directory = fixture(t);
  writeFileSync(join(directory, glean), '---\nname: glean\ndescription: Save research\n---\n');
  const result = run(directory);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /body must not be empty/);
});

test('ignores examples and remote URLs but checks encoded local file links', t => {
  const directory = fixture(t);
  writeFileSync(join(directory, 'a file.md'), '# Example\n');
  writeFileSync(join(directory, 'README.md'), [
    '[local](a%20file.md#heading)', '[remote](https://example.com/missing)',
    '[anchor](#example)', '`./notes`', '`[template](<URL>)`',
    '```md', '[example](missing.md)', '```',
  ].join('\n'));
  const result = run(directory);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
