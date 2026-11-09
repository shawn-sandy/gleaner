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
const preferencesMetadata = 'plugins/gleaner/skills/preferences/agents/openai.yaml';
const contract = 'plugins/gleaner/skills/preferences/references/contract.md';
const example = 'plugins/gleaner/skills/preferences/references/examples/user.yaml';
const projectExample = 'plugins/gleaner/skills/preferences/references/examples/project.yaml';
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
  ['broken bookmark contract reference', 'plugins/gleaner/skills/glean/references/bookmark.md', '](chatgpt-pages.md)', '](missing.md)', /ENOENT/],
  ['broken contract reference', glean, '../preferences/references/contract.md', '../preferences/references/missing.md', /ENOENT|shared contract/],
  ['broken contract example link', contract, 'examples/user.yaml', 'examples/missing.yaml', /ENOENT/],
  ['malformed preference example', example, 'label: Browser Research', 'label: "Browser Research', /quote/],
  ['unsupported preference schema', example, 'schema_version: 1', 'schema_version: 2', /unsupported preferences schema/],
  ['invalid user destination reference', example, 'default_destination: research', 'default_destination: missing', /invalid destination reference/],
  ['invalid project destination reference', projectExample, 'default_destination: notes', 'default_destination: missing', /invalid destination reference/],
  ['invalid destination provider', example, 'provider: drive', 'provider: unknown', /invalid destination provider/],
  ['invalid destination locator', example, 'remote_id: example-drive-folder-id', 'path: /example', /remote_id/],
  ['relative destination path', example, '/Users/example/notes', './notes', /path must be absolute/],
  ['null destination', example, 'default_destination: research', 'default_destination: null', /default destination must/],
  ['unsupported project schema', projectExample, 'schema_version: 1', 'schema_version: 2', /unsupported preferences schema/],
  ['malformed project example', projectExample, 'default_format: markdown', 'default_format: [markdown', /flow sequence|end with/],
  ['duplicate preference keys', example, 'schema_version: 1', 'schema_version: 1\nschema_version: 1', /unique/],
  ['invalid format', example, 'default_format: auto', 'default_format: html', /invalid default format/],
  ['null format', example, 'default_format: auto', 'default_format: null', /invalid default format/],
  ['unknown contract field', example, 'schema_version: 1', 'schema_version: 1\nsync_metadata: {}', /unknown preferences field/],
  ['invalid namespace', example, 'another_skill:', 'another_skill: false\n  different:', /skill namespace/],
  ['malformed frontmatter', glean, 'name: glean', 'name: "glean', /quote/],
  ['duplicate YAML keys', glean, 'name: glean', 'name: glean\nname: glean', /unique/],
  ['wrong skill name', glean, 'name: glean', 'name: clip', /name must match/],
  ['non-string description', glean, 'description:', 'description: false\noriginal:', /description must/],
  ['broken sibling reference', glean, '../youtube/SKILL.md', '../missing/SKILL.md', /ENOENT/],
  ['invalid display metadata', metadata, 'display_name: Gleaner YouTube', 'display_name: false', /display_name must/],
  ['missing metadata field', metadata, 'short_description:', 'other:', /short_description must/],
  ['missing icon', metadata, './assets/icon-small.png', './missing.svg', /ENOENT/],
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

for (const file of [glean, metadata, preferencesMetadata, contract, example, projectExample, 'LICENSE']) {
  test(`rejects missing required file: ${file}`, t => {
    const directory = fixture(t);
    rmSync(join(directory, file));
    assert.equal(run(directory).status, 1);
  });
}

const manifest = 'plugins/gleaner/.claude-plugin/plugin.json';
const tooLong = 'x'.repeat(501);
for (const [name, file, edit] of [
  ['plugin description', manifest, data => { data.description = tooLong; }],
  ['marketplace description', marketplace, data => { data.plugins[0].description = tooLong; }],
]) {
  test(`rejects a ${name} over 500 characters`, t => {
    const directory = fixture(t);
    const data = JSON.parse(readFileSync(join(directory, file), 'utf8'));
    edit(data);
    writeFileSync(join(directory, file), JSON.stringify(data, null, 2));
    const result = run(directory);
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, /description must be a nonempty string of at most 500 characters/);
  });
}

test('rejects a glean description over 500 characters', t => {
  const directory = fixture(t);
  const path = join(directory, glean);
  writeFileSync(path, readFileSync(path, 'utf8').replace(/^description: (.*)$/m, (line, text) => `description: ${text} ${'x'.repeat(500 - text.length)}`));
  const result = run(directory);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stderr, /description must be a nonempty string of at most 500 characters/);
});

// Each pattern removes only its own trigger, so "glean" goes while "glean it" stays.
for (const [trigger, pattern] of [['glean', /\bglean\b(?!\s+it\b)/gi], ['glean it', /\bglean\s+it\b/gi], ['Gleaner', /\bGleaner\b/gi]]) {
  test(`rejects a glean description without the "${trigger}" trigger`, t => {
    const directory = fixture(t);
    const path = join(directory, glean);
    const source = readFileSync(path, 'utf8');
    const line = source.match(/^description: .*$/m)[0];
    assert.match(line, pattern, `fixture description holds ${trigger}`);
    writeFileSync(path, source.replace(line, line.replace(pattern, 'clip')));
    const result = run(directory);
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, new RegExp(`description must name the "${trigger}" trigger`));
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

// Written directly, since the shipped example may not hold these lines.
const clipListUser = list => `schema_version: 1
destinations:
  research: { provider: drive, label: Browser Research, remote_id: folder-id }
  notes: { provider: local, label: Local notes, path: /Users/example/notes }
  web: { provider: artifact, label: Private artifacts, remote_id: workspace-id }
default_destination: research
skills:
  gleaner:${list === undefined ? ' {}' : `\n    clip_list: ${list}`}
`;
const clipListCases = [
  ['dangling clip list alias', clipListUser('missing'), 'schema_version: 1\n', /invalid clip list reference/],
  ['artifact clip list', clipListUser('web'), 'schema_version: 1\n', /invalid clip list provider/],
  ['non-string clip list', clipListUser('[research]'), 'schema_version: 1\n', /clip list must/],
  ['project override turning the user clip list into an artifact', clipListUser('research'),
    'schema_version: 1\ndestinations:\n  research: { provider: artifact, label: Web, remote_id: workspace-id }\n', /invalid clip list provider/],
  ['valid drive clip list', clipListUser('research'), 'schema_version: 1\n', null],
  ['project clip list naming a user alias', clipListUser(), 'schema_version: 1\nskills:\n  gleaner:\n    clip_list: notes\n', null],
];
for (const [name, user, project, message] of clipListCases) {
  test(`${message ? 'rejects' : 'accepts'} ${name}`, t => {
    const directory = fixture(t);
    writeFileSync(join(directory, example), user);
    writeFileSync(join(directory, projectExample), project);
    const result = run(directory);
    assert.equal(result.status, message ? 1 : 0, result.stdout + result.stderr);
    if (message) assert.match(result.stderr, message);
  });
}

test('accepts sparse reset and preserves opaque namespace data in validation', t => {
  const directory = fixture(t);
  writeFileSync(join(directory, example), 'schema_version: 1\nskills:\n  unknown_skill:\n    nested: [one, two]\n');
  writeFileSync(join(directory, projectExample), 'schema_version: 1\n');
  const result = run(directory);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
