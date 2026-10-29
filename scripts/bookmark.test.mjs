import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parse } from 'yaml';
import { applyReceipt, present, renderBookmarksFile, renderHtml, renderMarkdown } from '../plugins/gleaner/skills/glean/scripts/bookmark.mjs';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/bookmark.json', import.meta.url), 'utf8'));
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const receipt = {
  status: 'saved', message: 'Browser Research/AI & Agents',
  saved_file: 'https://drive.google.com/file/d/fixture-file/view',
  html_file: '/tmp/fixture-bookmark.html',
  destination_url: 'https://drive.google.com/drive/folders/fixture-category',
};
const saved = (bookmark = fixture, result = receipt) => applyReceipt(bookmark, result);

test('ChatGPT native capability receives shared data and leaves a readable preview', async () => {
  const bookmark = saved();
  let calls = 0;
  const result = await present(bookmark, { nativePreview: (data, markdown) => {
    calls++;
    assert.deepEqual(data, bookmark);
    assert.equal(markdown, renderMarkdown(bookmark));
    data.tags.push('#adapter-mutation');
  } });
  assert.equal(calls, 1);
  assert.equal(result.native, true);
  assert.equal(result.fallback, false);
  assert.match(result.markdown, /### Overview/);
  assert.match(result.markdown, /### Key details/);
  assert.match(result.markdown, /### Why it matters/);
  assert.match(result.markdown, /### Actions/);
  assert.equal(bookmark.tags.includes('#adapter-mutation'), false);
});

test('Claude Code Markdown and no-component ChatGPT share the same content', async () => {
  const bookmark = saved({ ...fixture, destination: { provider: 'local', label: 'Notes', path: '/work/notes' } }, {
    status: 'saved', message: 'Notes', saved_file: '/work/notes/clip.md', html_file: '/work/notes/clip.html',
  });
  const claude = await present(bookmark, { mode: 'markdown', nativePreview: () => assert.fail('must not call native') });
  const chat = await present(bookmark, { mode: 'chat' });
  assert.equal(claude.markdown, chat.markdown);
  assert.match(claude.markdown, /https:\/\/example.com\/harness/);
  assert.match(claude.markdown, /Access saved bookmark: \/work\/notes\/clip\\.md/);
  assert.match(claude.markdown, /Access saved HTML: \/work\/notes\/clip\\.html/);
});

test('HTML and Markdown keep shared metadata and full clip content without executable markup', () => {
  const bookmark = saved({ ...fixture, title: '<script>alert("x")</script>', description: '<img src=x onerror=alert(1)>' });
  const html = renderHtml(bookmark);
  const markdown = renderMarkdown(bookmark);
  assert.match(html, /^<!doctype html>/);
  assert.match(html, /name="generator" content="Gleaner clip"/);
  assert.match(html, /name="gleaner:id" content="fixture-repo-1"/);
  assert.match(html, /name="gleaner:primary" content="https:\/\/drive.google.com\/file\/d\/fixture-file\/view"/);
  assert.match(html, /<dt>Source<\/dt><dd><a href="https:\/\/example.com\/harness"/);
  assert.match(html, /<dt>Saved<\/dt><dd>2026-10-23/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script|<img/);
  assert.doesNotMatch(markdown, /<script/);
  for (const value of [fixture.saved_at, fixture.source_type, '#agents', fixture.summary, fixture.why_it_matters]) {
    assert.ok(html.includes(value));
    assert.ok(markdown.replaceAll('\\', '').includes(value));
  }
  assert.match(html, /## Follow-ups/);
  assert.match(html, /To get follow-ups/);
});

test('unsafe receipt locators are text, never executable links', () => {
  const bookmark = saved(fixture, { ...receipt, saved_file: 'javascript:alert(1)', html_file: 'data:text/html,<script>x</script>' });
  assert.doesNotMatch(renderHtml(bookmark), /href="(?:javascript|data):/);
  assert.doesNotMatch(renderMarkdown(bookmark), /\]\((?:javascript|data):/);
  assert.throws(() => saved({ ...fixture, url: 'javascript:alert(1)' }), /HTTP/);
});

test('schema-1 preferences and configured Drive ID remain unchanged by presentation', async () => {
  const preferences = parse(read('plugins/gleaner/skills/preferences/references/examples/user.yaml'));
  const before = structuredClone(preferences);
  const destination = preferences.destinations[preferences.default_destination];
  const bookmark = saved({ ...fixture, destination });
  await present(bookmark);
  renderHtml(bookmark);
  assert.deepEqual(preferences, before);
  assert.deepEqual(bookmark.destination, destination);
  assert.equal(bookmark.destination.remote_id, 'example-drive-folder-id');
  assert.equal(preferences.default_format, 'auto');
  assert.match(renderMarkdown(bookmark), /drive.google.com\/file\/d\/fixture-file\/view/);
});

test('failed or skipped writes discard candidate links and never invoke native preview', async () => {
  for (const status of ['failed', 'skipped']) {
    const bookmark = saved(fixture, { ...receipt, status, message: status === 'failed' ? 'Drive unavailable' : 'Duplicate exists' });
    const result = await present(bookmark, { nativePreview: () => assert.fail('must not render success') });
    assert.equal(bookmark.saved_file, null);
    assert.equal(bookmark.html_file, null);
    assert.equal(bookmark.destination_url, null);
    assert.doesNotMatch(result.markdown, /Access saved|Open saved destination/);
    assert.match(result.markdown, status === 'failed' ? /Not saved/ : /Skipped/);
  }
});

test('same-session refresh preserves identity while a duplicate updated copy keeps Supersedes', () => {
  const original = saved();
  const refresh = saved({ ...original, key_points: ['Refreshed detail.'] }, { ...receipt, saved_file: 'https://example.com/new-upload' });
  assert.equal(refresh.id, original.id);
  assert.equal(refresh.saved_at, original.saved_at);
  assert.equal(original.saved_file, receipt.saved_file);
  const copy = saved({ ...fixture, id: 'fixture-repo-2', content_markdown: `${fixture.content_markdown}\n**Supersedes:** ${original.saved_file}` });
  assert.notEqual(copy.id, original.id);
  assert.match(renderHtml(copy), /Supersedes/);
});

test('preview errors and rejected components preserve the successful save and fall back', async () => {
  const bookmark = saved();
  const before = structuredClone(bookmark);
  for (const nativePreview of [() => { throw new Error('unavailable'); }, async () => false]) {
    const result = await present(bookmark, { nativePreview });
    assert.equal(result.fallback, true);
    assert.match(result.markdown, /Interactive preview unavailable/);
    assert.match(result.markdown, /Access saved bookmark/);
    assert.deepEqual(bookmark, before);
  }
});

test('chat fallback and unavailable HTML do not claim persistence or a nonexistent artifact', async () => {
  const bookmark = saved(fixture, { status: 'chat', message: 'Not saved to Drive; copy the clip above.', html_file: null, destination_url: receipt.destination_url });
  assert.equal(bookmark.destination_url, null);
  const result = await present(bookmark);
  assert.match(result.markdown, /Delivered in this conversation only; not stored/);
  assert.doesNotMatch(result.markdown, /Access saved HTML|Open saved destination/);
  const suppressed = await present(bookmark, { mode: 'none' });
  assert.match(suppressed.markdown, /Not saved to Drive/);
  assert.doesNotMatch(suppressed.markdown, /### Overview/);
});

test('verified attachment links need a host capability and stay non-executable in standalone HTML', async () => {
  const attachment = 'sandbox:/mnt/data/bookmark (1).html';
  const bookmark = saved(fixture, { status: 'chat', message: 'Attached HTML.', saved_file: attachment, html_file: attachment });
  const expected = '[Access saved HTML](sandbox:/mnt/data/bookmark%20%281%29.html)';
  for (const mode of ['auto', 'chat', 'markdown']) {
    const result = await present(bookmark, { mode, attachmentLinks: true });
    assert.ok(result.markdown.includes(expected), result.markdown);
    assert.doesNotMatch((await present(bookmark, { mode })).markdown, /\]\(sandbox:/);
  }
  const fallback = await present(bookmark, { attachmentLinks: true, nativePreview: () => { throw new Error('unavailable'); } });
  assert.equal(fallback.fallback, true);
  assert.ok(fallback.markdown.includes(expected));
  assert.match((await present(bookmark, { mode: 'none', attachmentLinks: true })).markdown, /\[Saved bookmark\]\(sandbox:/);
  assert.doesNotMatch(renderHtml(bookmark), /href="sandbox:/);
  for (const locator of ['javascript:alert(1)', 'data:text/html,hello', 'file:///etc/passwd', 'sandbox://evil/mnt/data/clip.html', 'sandbox:/mnt/data/../../etc/passwd']) {
    const unsafe = saved(fixture, { status: 'chat', message: 'Attachment unavailable.', html_file: locator });
    assert.doesNotMatch((await present(unsafe, { attachmentLinks: true })).markdown, /\[Access saved HTML\]/);
  }
});

test('CLI forwards the attachment-link capability to conversation rendering only', () => {
  const result = spawnSync(process.execPath, ['plugins/gleaner/skills/glean/scripts/bookmark.mjs'], {
    input: JSON.stringify({ bookmark: fixture, receipt: { status: 'chat', message: 'Attached.', html_file: 'sandbox:/mnt/data/clip.html' }, attachmentLinks: true }), encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.match(output.markdown, /\[Access saved HTML\]\(sandbox:\/mnt\/data\/clip.html\)/);
  assert.doesNotMatch(output.html, /href="sandbox:/);
});

test('no-preview preserves a verified saved path and single-answer clips need no invented summary', async () => {
  const bookmark = saved({ ...fixture, url: null, summary: '', description: '', source_type: 'other' }, {
    status: 'saved', message: 'Local notes', saved_file: '/work/answer.md',
  });
  const result = await present(bookmark, { mode: 'none' });
  assert.match(result.markdown, /\/work\/answer\\.md/);
  assert.doesNotMatch(result.markdown, /###/);
  assert.match(renderMarkdown(bookmark), /see the full clip for retained content/);
  assert.doesNotMatch(renderMarkdown(bookmark), /Open original source/);
});

test('YouTube description, chapter links, and title-only limitations survive HTML and preview', async () => {
  const video = saved({
    ...fixture, source_type: 'video', url: 'https://www.youtube.com/watch?v=fixture',
    limitations: ['Written from the description; no transcript was read.'],
    content_markdown: '**Channel:** Example\n**Video:** from: description\n## Key moments\n[3:10](https://www.youtube.com/watch?v=fixture&t=190s) Configuration\n## Links\nhttps://example.com/docs',
  });
  assert.match((await present(video)).markdown, /no transcript was read/);
  assert.match(renderHtml(video), /t=190s/);
  assert.match(renderHtml(video), /from: description/);
  assert.match(renderHtml(video), /https:\/\/example.com\/docs/);
  const limited = saved({ ...video, description: '', summary: '', key_points: [], why_it_matters: '', limitations: ['Title only; description unavailable.'] });
  assert.match(renderMarkdown(limited), /No additional details verified/);
  assert.match(renderMarkdown(limited), /Practical value not established/);
});

test('CLI renders fixture input offline without creating a file or changing the receipt', () => {
  const result = spawnSync(process.execPath, ['plugins/gleaner/skills/glean/scripts/bookmark.mjs'], {
    input: JSON.stringify({ bookmark: fixture, receipt }), encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.bookmark.saved_file, receipt.saved_file);
  assert.match(output.html, /<!doctype html>/);
  assert.match(output.markdown, /Overview/);
});

test('link-only YouTube previews disclose missing content without inventing a summary or stored copy', async () => {
  const linkOnly = JSON.parse(read('scripts/fixtures/youtube-link-only.json'));
  const bookmark = saved(linkOnly, {
    status: 'chat', message: 'Link-only bookmark provided in this conversation.',
    saved_file: 'sandbox:/mnt/data/youtube-fixture.md',
  });
  const normal = await present(bookmark, { attachmentLinks: true });
  const fallback = await present(bookmark, {
    attachmentLinks: true, nativePreview: () => { throw new Error('unavailable'); },
  });
  assert.equal(fallback.fallback, true);
  for (const output of [normal.markdown, fallback.markdown, renderHtml(bookmark)]) {
    assert.match(output, /Link only; video content was unavailable and has not been summarized/);
    assert.match(output, /No summary supplied/);
    assert.match(output, /No additional details verified/);
    assert.match(output, /Practical value not established/);
    assert.match(output, /https:\/\/www.youtube.com\/watch\?v=fixture/);
    assert.doesNotMatch(output, /Access saved HTML|Open saved destination/);
  }
  assert.match(normal.markdown, /Delivered in this conversation only; not stored/);
  assert.match(normal.markdown, /\[Access saved bookmark\]\(sandbox:\/mnt\/data\/youtube-fixture.md\)/);
  assert.equal(bookmark.content_markdown, linkOnly.content_markdown);
  assert.equal(bookmark.summary, '');
  assert.deepEqual(bookmark.key_points, []);
  assert.equal(bookmark.html_file, null);
  assert.equal(bookmark.destination_url, null);
});

const clips = [
  { title: '<script>alert("x")</script>', url: 'https://example.com/harness', saved_at: '2026-10-23', category: 'AI & Agents', tags: ['#agents', '#skills'], note: 'Read "setup"\nfirst', clip_link: 'https://drive.google.com/file/d/fixture-file/view' },
  { title: 'Answer about pricing', url: null, saved_at: '2026-10-22', category: 'Design', tags: [], clip_link: 'https://claude.ai/artifact/fixture' },
  { title: 'Rolled-over date', url: 'https://example.com/feb', saved_at: '2026-02-30', category: 'Design', tags: [] },
  { title: 'US-style date', url: 'https://example.com/us', saved_at: '9/22/2026', category: 'Design', tags: [] },
  { title: 'Local answer', url: null, saved_at: '2026-10-21', category: 'Design', tags: [], clip_link: '/work/notes/answer.md' },
  { title: 'Unsafe source', url: 'javascript:alert(1)', saved_at: '2026-10-20', category: 'Design', tags: [] },
  { title: 'Quoted query', url: 'https://example.com/?x=1&y="z', saved_at: '2026-10-19', category: 'Design', tags: ['"><b>'] },
  { title: 'Two\nlines', url: 'https://example.com/two', saved_at: '2026-10-18', category: 'Multi\r\nline', tags: [] },
];

test('bookmarks file puts clips in category folders with only escaped text and web links', () => {
  const { html, skipped } = renderBookmarksFile(clips);
  assert.match(html, /^<!DOCTYPE NETSCAPE-Bookmark-file-1>/);
  // Noon UTC, so the date reads the same in every time zone from UTC-12 to UTC+11.
  assert.match(html, /<DT><H3>AI &amp; Agents<\/H3>\n\s*<DL><p>\n\s*<DT><A HREF="https:\/\/example.com\/harness" ADD_DATE="1792756800" TAGS="agents,skills">&lt;script&gt;/);
  assert.doesNotMatch(html, /<script|alert\(1\)|"><b>/);
  assert.match(html, /<A HREF="https:\/\/example.com\/\?x=1&amp;y=&quot;z" ADD_DATE="[0-9]+" TAGS="&quot;&gt;&lt;b&gt;">Quoted query<\/A>/);
  assert.match(html, /<DD>Read &quot;setup&quot; first · Clip: https:\/\/drive.google.com\/file\/d\/fixture-file\/view\n/);
  assert.match(html, /<A HREF="https:\/\/claude.ai\/artifact\/fixture" ADD_DATE="[0-9]+">Answer about pricing<\/A>/);
  assert.match(html, /<A HREF="https:\/\/example.com\/feb">Rolled-over date/);
  assert.match(html, /<A HREF="https:\/\/example.com\/us">US-style date/);
  assert.equal(html.match(/<DT><H3>Design<\/H3>/g).length, 1);
  assert.deepEqual([...html.matchAll(/HREF="([^"]*)"/g)].map(match => new URL(match[1]).protocol), ['https:', 'https:', 'https:', 'https:', 'https:', 'https:']);
  assert.deepEqual(skipped, ['Local answer', 'Unsafe source']);
  // Chrome's importer parses one line at a time and drops an entry split across lines.
  const lines = html.split('\n');
  assert.equal(lines.filter(line => /<DT><A .*<\/A>/.test(line)).length, 6);
  assert.deepEqual(lines.filter(line => /<DT><H3>.*<\/H3>/.test(line)).map(line => line.trim()), ['<DT><H3>Gleaner</H3>', '<DT><H3>AI &amp; Agents</H3>', '<DT><H3>Design</H3>', '<DT><H3>Multi line</H3>']);
});

test('CLI renders a bookmarks file from clip index rows', () => {
  const result = spawnSync(process.execPath, ['plugins/gleaner/skills/glean/scripts/bookmark.mjs'], {
    input: JSON.stringify({ clips }), encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.html, renderBookmarksFile(clips).html);
  assert.deepEqual(output.skipped, ['Local answer', 'Unsafe source']);
});

test('page, YouTube, and follow-up instructions route through shared presentation', () => {
  const glean = read('plugins/gleaner/skills/glean/SKILL.md');
  const youtube = read('plugins/gleaner/skills/youtube/SKILL.md');
  const followUp = read('plugins/gleaner/skills/follow-up/SKILL.md');
  const contract = read('plugins/gleaner/skills/glean/references/bookmark.md');
  assert.match(glean, /7\. \*\*Confirm and preview/);
  assert.match(glean, /references\/bookmark.md/);
  assert.match(glean, /same-name|same-named/);
  assert.match(glean, /canonical/);
  assert.match(youtube, /shared bookmark model/);
  assert.match(youtube, /glean steps 6 and 7/);
  assert.match(followUp, /glean step 7/);
  assert.match(contract, /Do not add `preview_mode`/);
  assert.match(contract, /“Use a Markdown preview”/);
  assert.doesNotMatch(contract, /“Use Markdown” or “use a chat preview” changes presentation only/);
  assert.match(contract, /Preview failure must never trigger another save/);
});
