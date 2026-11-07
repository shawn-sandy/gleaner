import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parse } from 'yaml';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const adapter = read('plugins/gleaner/skills/glean/references/chatgpt-pages.md');
const glean = read('plugins/gleaner/skills/glean/SKILL.md');

// These are instruction-contract checks, not an executable host/router simulation.
test('Page instructions require both ChatGPT host and a selected or retained Page destination', () => {
  assert.match(adapter, /active assistant host is ChatGPT and an explicit destination request/);
  assert.match(adapter, /selected Page, or visible Page tools alone do not select/);
  assert.match(adapter, /Never use this route in Claude Code, Claude web, Cowork/);
  assert.match(glean, /Do not load or use this route on Claude, even if Page tools are visible/);
  assert.match(adapter, /retained Page is a session override for that clip only/);
  assert.match(adapter, /destination flag beats destination wording/);
  assert.match(adapter, /`--to chat` with “as a Page” still selects chat/);
});

test('all skill entry points and shared presentation expose the scoped Page adapter', () => {
  for (const path of ['glean/SKILL.md', 'youtube/SKILL.md', 'follow-up/SKILL.md', 'preferences/SKILL.md', 'glean/references/bookmark.md']) {
    assert.match(read(`plugins/gleaner/skills/${path}`), /chatgpt-pages\.md/);
  }
  assert.match(glean, /host-gated storage, failure recovery, and verified-Page short-confirmation rules take precedence/);
  assert.match(read('plugins/gleaner/skills/glean/references/bookmark.md'), /After readback verifies a Page save\/update/);
  assert.match(adapter, /explicit full-clip|show the full clip here/);
  assert.match(adapter, /An uncertain or failed|failed.*Page|failed.*write/i);
});

test('Page updates preserve current content and reconcile uncertain writes before retrying', () => {
  assert.match(adapter, /authoritative clip, including manual changes/);
  assert.match(adapter, /block IDs and hashes from the read/);
  assert.match(adapter, /structural operations for new headings, sections, or list items/);
  assert.match(adapter, /reread and rebuild only unapplied changes/);
  assert.match(adapter, /unknown outcome, read and reconcile before another write/);
  assert.match(adapter, /Never replay an applied insertion/);
  assert.match(adapter, /already present, skip the write/);
  assert.match(adapter, /Do not use glean's generic automatic update-failure copy or fallback/);
  assert.match(adapter, /same key and arguments/);
  assert.match(adapter, /earlier-session updated-copy policy/);
  assert.match(adapter, /read candidates to verify Saved, Category, and canonical Source/);
});

test('Page capabilities, exports, and formats cannot silently change preferences or delivery', () => {
  assert.match(adapter, /new editable clip requires create, read, and edit/);
  assert.match(adapter, /Wait for that choice rather than silently changing destination/);
  assert.match(adapter, /raw-Markdown\/HTML-only request needs a choice/);
  assert.match(adapter, /Persistent Page defaults and Page clip lists are not supported/);
  assert.match(adapter, /Read the current Page, including manual edits/);
  assert.match(adapter, /older export is not automatically synchronized/);
  assert.match(adapter, /Do not automatically generate HTML companions/);
  assert.match(adapter, /ask whether a Page meets the request/);
  assert.match(adapter, /never source extraction|never.*extraction/i);
});

test('Page destination descriptions stay synchronized without new manifest permissions', () => {
  const marketplace = JSON.parse(read('.claude-plugin/marketplace.json'));
  const plugin = JSON.parse(read('plugins/gleaner/.claude-plugin/plugin.json'));
  const frontmatter = parse(glean.split('---')[1]);
  for (const description of [marketplace.plugins[0].description, plugin.description, frontmatter.description, read('README.md').split('\n\n')[2]]) {
    assert.match(description, /editable Pages?|editable Page/);
    assert.match(description, /explicit request/);
    assert.match(description, /Page tools are available/);
  }
  assert.equal(marketplace.version, undefined);
  assert.equal(plugin.mcpServers, undefined);
});

test('Claude renderer, preferences, dependencies, hooks, and release tooling match the pre-feature baseline', () => {
  const fixture = JSON.parse(read('scripts/fixtures/chatgpt-pages-protected.json'));
  for (const [path, expected] of Object.entries(fixture.sha256)) {
    const actual = createHash('sha256').update(readFileSync(new URL(`../${path}`, import.meta.url))).digest('hex');
    assert.equal(actual, expected, `Protected file changed: ${path}`);
  }
});

test('Claude HTML templates, chat delivery, video extraction, and follow-up rules remain unchanged', () => {
  const fixture = JSON.parse(read('scripts/fixtures/chatgpt-pages-protected.json'));
  for (const { path, start, end, sha256 } of fixture.sections) {
    const source = read(path);
    const section = source.slice(source.indexOf(start), source.indexOf(end));
    assert.equal(createHash('sha256').update(section).digest('hex'), sha256, `Protected section changed: ${path} ${start}`);
  }
});

test('explicit older-Page follow-ups and Page-scoped finds can enter the ChatGPT route', () => {
  const boundary = adapter.slice(adapter.indexOf('Use this reference only'), adapter.indexOf('This reference takes precedence'));
  const entry = glean.split('\n').find(line => line.startsWith('**ChatGPT Page route:**'));
  for (const text of [boundary, entry]) {
    assert.match(text, /follow-up explicitly identif/);
    assert.match(text, /earlier session|older clip/);
    assert.match(text, /find (?:is )?explicitly scoped to Pages/);
    assert.match(text, /read-only presentation or export request/);
    assert.match(text, /ChatGPT/);
    assert.match(text, /Claude/);
  }
  assert.match(boundary, /selected Page, or visible Page tools alone do not select/);
  assert.match(adapter, /do not overwrite or delete the older Page/);
});

test('failed readback after a write remains pending instead of claiming no save', () => {
  const capabilities = adapter.slice(adapter.indexOf('## Capabilities and format'), adapter.indexOf('## Identity and duplicate handling'));
  assert.match(capabilities, /Before any write is attempted/);
  assert.match(capabilities, /After an attempted creation or update/);
  assert.match(capabilities, /confirmed rejection as not committed only when the tool establishes/);
  assert.match(capabilities, /write may have committed or readback fails/);
  assert.match(capabilities, /uncertain or verification pending/);
  assert.match(capabilities, /retain any returned Page ID, canonical URL, creation key, and original arguments/);
  assert.match(capabilities, /do not prompt for a duplicate creation/);
  assert.doesNotMatch(capabilities, /When required tools or access are unavailable, report that no Page was saved/);
});

test('Android acceptance verifies desktop edits through mobile reading without requiring mobile edits', () => {
  for (const path of ['docs/plans/chatgpt-editable-pages.md', 'docs/chatgpt-pages-testing.md']) {
    const rows = read(path).split('\n').filter(line => /^\| (Mobile reading|Android reading) \|/.test(line));
    assert.equal(rows.length, 1);
    assert.match(rows[0], /Edit the Page on web or desktop/);
    assert.match(rows[0], /no Android editing required/);
    assert.doesNotMatch(rows[0], /reopen and request an edit/);
  }
});
