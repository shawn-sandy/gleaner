import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { adaptOpenAIContent } from './openai-content.mjs';

const source = fileURLToPath(new URL('../plugins/gleaner/', import.meta.url));
const listing = JSON.parse(readFileSync(resolve(source, 'openai-listing.json'), 'utf8'));
function fixture(t) {
  const stage = mkdtempSync(resolve(tmpdir(), 'gleaner-openai-test-'));
  cpSync(source, stage, { recursive: true });
  t.after(() => rmSync(stage, { recursive: true, force: true }));
  return stage;
}
function files(root, prefix = '') {
  return readdirSync(resolve(root, prefix), { withFileTypes: true }).flatMap(entry => {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    return entry.isDirectory() ? files(root, path) : [path];
  });
}

test('OpenAI conversion preserves shared helpers, source files, destinations and downloadable HTML', t => {
  const original = new Map(files(source).map(path => [path, readFileSync(resolve(source, path))]));
  const stage = fixture(t);
  adaptOpenAIContent(stage, listing);
  for (const [path, contents] of original) {
    assert.deepEqual(readFileSync(resolve(source, path)), contents, `source unchanged: ${path}`);
    if (/\.(mjs|png|svg)$/.test(path) || /google-drive-sync/.test(path)) {
      assert.deepEqual(readFileSync(resolve(stage, path)), contents, `shared implementation unchanged: ${path}`);
    }
  }
  assert.equal(existsSync(resolve(stage, 'skills/README.md')), false);
  for (const name of ['glean', 'youtube', 'preferences', 'follow-up']) {
    const text = readFileSync(resolve(stage, `skills/${name}/SKILL.md`), 'utf8');
    const frontmatter = parse(text.match(/^---\n([\s\S]*?)\n---/)[1]);
    assert.equal(frontmatter.name, name);
    assert.doesNotMatch(text, /artifact/i);
  }
  const glean = readFileSync(resolve(stage, 'skills/glean/SKILL.md'), 'utf8');
  for (const feature of ['HTML download template', 'Google Drive', 'Notion', 'Clips saved this session', 'Clip list', 'Updating a clip saved this session', 'generator" content="Gleaner clip']) {
    assert.ok(glean.includes(feature), `retains ${feature}`);
  }
  const contract = readFileSync(resolve(stage, 'skills/preferences/references/contract.md'), 'utf8');
  assert.match(contract, /Preserve the stored alias and permanent default unchanged/);
  assert.match(contract, /explicit request, session override, project preferences, user preferences/);
  const prefs = parse(readFileSync(resolve(stage, 'skills/preferences/references/examples/user.yaml'), 'utf8'));
  assert.ok(prefs.destinations[prefs.default_destination]);
  assert.ok(Object.values(prefs.destinations).every(value => value.provider !== 'artifact'));
  // Relative Markdown references must survive the standalone layout.
  for (const path of files(stage).filter(path => path.endsWith('.md'))) {
    const text = readFileSync(resolve(stage, path), 'utf8').replace(/```[\s\S]*?```/g, '');
    for (const match of text.matchAll(/\]\(([^\s)]+)\)/g)) {
      const link = match[1].split('#')[0];
      if (!link || /^(?:[a-z]+:|<)/i.test(link)) continue;
      assert.ok(existsSync(resolve(stage, path, '..', decodeURIComponent(link))), `${path} -> ${link}`);
    }
  }
});

test('OpenAI conversion stops on source drift instead of leaving unsupported workflows', t => {
  const stage = fixture(t);
  const path = resolve(stage, 'skills/glean/SKILL.md');
  writeFileSync(path, readFileSync(path, 'utf8').replace('   **Artifact**', '   **New artifact workflow**'));
  assert.throws(() => adaptOpenAIContent(stage, listing), /Review OpenAI conversion/);
});

test('OpenAI conversion rejects newly added live artifact instructions', t => {
  const stage = fixture(t);
  const path = resolve(stage, 'skills/youtube/SKILL.md');
  writeFileSync(path, `${readFileSync(path, 'utf8')}\nPublish a live artifact.\n`);
  assert.throws(() => adaptOpenAIContent(stage, listing), /unhandled artifact guidance/);
});
