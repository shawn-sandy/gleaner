import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('no host is told to show less than the full clip by default', () => {
  const glean = read('plugins/gleaner/skills/glean/SKILL.md');
  const contract = read('plugins/gleaner/skills/glean/references/bookmark.md');
  const between = (text, start, end) => {
    const [from, to] = [text.indexOf(start), text.indexOf(end)];
    assert.ok(from >= 0 && to > from, `${start} to ${end}`);
    return text.slice(from, to);
  };
  const stepSeven = between(glean, '7. **Confirm and preview', '**Tagging the chat.**');
  const delivery = between(glean, '**This conversation** (only when resolved to chat; the default on Claude hosts)', '**Google Drive**\n');
  const presentation = contract.slice(contract.indexOf('## Present after the save result'));
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

test('clip list instructions keep the list out of saves, duplicates, and finds', () => {
  const glean = read('plugins/gleaner/skills/glean/SKILL.md');
  const contract = read('plugins/gleaner/skills/preferences/references/contract.md');
  const stepSix = glean.slice(glean.indexOf('6. **Save it**'), glean.indexOf('7. **Confirm and preview.**'));
  const list = stepSix.slice(stepSix.indexOf('**Clip list.**'));
  const duplicates = glean.slice(glean.indexOf('**Check for an existing clip'), glean.indexOf('3. **Write the summary**'));
  const index = glean.slice(glean.indexOf('## Clip index'), glean.indexOf('### Snapshot sheet'));

  assert.match(list, /clip_list/);
  assert.match(list, /append_values/);
  // Both stored searches would otherwise match the list's Source URLs as a clip.
  assert.ok(duplicates.match(/Clip List/g)?.length >= 2, duplicates);
  assert.match(index, /Clip List/);
  assert.doesNotMatch(glean, /no separate index/i);
  // The clip is already safe, so a lost row must not cost the user a second copy.
  assert.match(list, /never[^.]*Fallback/i);
  assert.match(list, /don't save it anywhere[^.]*don't list this[^.]*skip/i);
  // Otherwise adding five parts to one clip writes five rows.
  assert.match(list, /update adds one only when the clip's link changed/i);
  assert.match(list, /never rewrite/i);
  // No script builds the row any more, so the text must say what each store gets.
  assert.doesNotMatch(list, /row's `(?:cells|line)`/);
  assert.match(list.slice(list.indexOf('**Google Drive:**'), list.indexOf('**Cowork project or local folder:**')), /column order[^.]*append_values/);
  // A pipe in a title or link would add a column to the Markdown table.
  const localList = list.slice(list.indexOf('**Cowork project or local folder:**'), list.indexOf('**Notion:**'));
  assert.match(localList, /backslash[^.]*pipe/i);
  assert.match(localList, /HTTP\(S\)[^.]*Markdown link[^.]*%7C/);
  // An unmatched parenthesis in an address ends the Markdown link early.
  assert.match(localList, /HTTP\(S\)[^.]*Markdown link[^.]*%28[^.]*%29/);
  // The ChatGPT index is a Markdown table too, so its links follow the same rule.
  assert.match(read('plugins/gleaner/skills/glean/references/chatgpt-clip-index.md'), /Clip link cells[^.]*glean step 6[^.]*`Clip List\.md`/);
  // Notion's Clip is a URL property, so a local path needs its own text property.
  assert.match(list.slice(list.indexOf('**Notion:**')), /Clip is a URL property[^.]*web link; a local[^.]*Path text property/);
  // A user-picked list database may lack a column, and the row write would fail on it.
  assert.match(list.slice(list.indexOf('**Notion:**')), /lacks any of these properties, add it/);
  assert.match(glean.slice(glean.indexOf('7. **Confirm and preview.**'), glean.indexOf('**Tagging the chat.**')), /clip list row[^.]*couldn't be added/i);

  assert.match(contract, /`clip_list`/);
  assert.match(contract.match(/^- `skills\.gleaner\.clip_list`:.*$/m)?.[0] ?? '', /`artifact` alias is not a valid list location/);
  assert.match(contract, /`Clip List` database[^.]*yes|yes[^.]*`Clip List` database/i);
  assert.match(contract, /setup must not create/);
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
  // No renderer builds companions now, so the contract must name their template.
  const html = contract.slice(contract.indexOf('When HTML is needed'), contract.indexOf('When the host rule above calls for HTML'));
  assert.match(html, /full-clip HTML template[^.]*companions and attachments/);
  assert.match(html, /standalone file[^.]*page basics/);
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
  const stepSix = glean.slice(glean.indexOf('6. **Save it**'), glean.indexOf('**This conversation** (only when resolved to chat; the default on Claude hosts)'));
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

test('a failed browser read falls back to one fetch that cannot bypass access or skip safeguards', () => {
  const glean = read('plugins/gleaner/skills/glean/SKILL.md');
  const start = glean.indexOf('**A browser read that fails:**');
  assert.ok(start >= 0, 'section exists');
  const rule = glean.slice(start, glean.indexOf('\n\n', start));
  // Triggers: an error, no text, or a declined site approval, with a browser present.
  assert.match(rule, /errors[^.]*no text[^.]*declined/i);
  assert.match(rule, /once/);
  assert.match(rule, /without a browser/);
  // A fetch is a model's rewrite, so the prompt must ask for the page itself.
  assert.match(rule, /full text[^.]*headings[^.]*links/i);
  // A fetched page has no selection and no markup to run the Page facts script on.
  assert.match(rule, /highlight[^.]*Page facts/i);
  // It must not turn into a way around a sign-in wall, a paywall, or a bot check.
  assert.match(rule, /sign-in[^.]*paywall[^.]*bot check/i);
  assert.match(rule, /don't try again/i);
  // A barrier page is not content: never save it, and never let it or a cut-off page replace an earlier clip.
  assert.doesNotMatch(rule, /clip what came back/);
  assert.match(rule, /save nothing from it[^.]*keep any existing clip/i);
  assert.match(rule, /cut off[^.]*only the part[^.]*never[^.]*replace/i);
  // A declined fetch is still final.
  assert.match(rule, /declined fetch ends it/);
  // The built-in browser's decline branch must hand off to this rule, not stop before it runs.
  const approvals = glean.slice(glean.indexOf('- **Site approvals:**'), glean.indexOf('- **Sign-ins:**'));
  assert.ok(approvals.length > 0, 'site approvals bullet exists');
  assert.doesNotMatch(approvals, /declined, say so and stop/);
  assert.match(approvals, /declined[^.]*A browser read that fails/);
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

// ChatGPT-only instruction boundaries and protected Claude compatibility files.
await import('./chatgpt-pages.test.mjs');
