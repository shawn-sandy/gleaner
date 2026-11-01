// Optional, dependency-free presentation helper. Extraction and storage remain
// the skill's responsibilities; no host APIs, network calls, or writes occur here.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const escapeMarkdown = value => String(value).replace(/&/g, '&amp;').replace(/[\\`*_{}\[\]()#+.!|>~-]/g, '\\$&').replace(/[\r\n]+/g, ' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function webUrl(value) {
  if (typeof value !== 'string' || !/^https?:\/\//i.test(value)) return false;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}

function attachmentUrl(value) {
  if (typeof value !== 'string' || !value.startsWith('sandbox:/mnt/data/') || /[\r\n\\]/.test(value)) return false;
  try { return new URL(value).pathname.startsWith('/mnt/data/'); } catch { return false; }
}

function markdownLink(label, locator, attachmentLinks) {
  const supported = webUrl(locator) || (attachmentLinks === true && attachmentUrl(locator));
  return supported
    ? `[${label}](${locator.replace(/[\s()<>\\]/g, char => encodeURIComponent(char).replace(/\(/g, '%28').replace(/\)/g, '%29'))})`
    : `${label}: ${escapeMarkdown(locator)}`;
}

function validate(bookmark) {
  for (const key of ['id', 'title', 'description', 'summary', 'category', 'source_type', 'saved_at', 'content_markdown']) {
    if (typeof bookmark[key] !== 'string') throw new Error(`${key} must be a string`);
  }
  if (!bookmark.id || !bookmark.title || !/^\d{4}-\d{2}-\d{2}$/.test(bookmark.saved_at)) throw new Error('id, title, and saved date are required');
  if (bookmark.url !== null && !webUrl(bookmark.url)) throw new Error('url must be HTTP(S) or null');
  for (const key of ['tags', 'key_points', 'limitations']) {
    if (!Array.isArray(bookmark[key]) || bookmark[key].some(value => typeof value !== 'string')) throw new Error(`${key} must be a string array`);
  }
  if (typeof bookmark.why_it_matters !== 'string') throw new Error('why_it_matters must be a string');
  if (!bookmark.destination || !['chat', 'drive', 'local', 'cowork', 'notion', 'artifact'].includes(bookmark.destination.provider)
    || typeof bookmark.destination.label !== 'string') throw new Error('resolved destination is required');
}

// Only a successful tool result supplies these locators. Never infer a URL
// from a title, remote ID, intended path, or the existence of a preview.
export function applyReceipt(bookmark, receipt) {
  validate(bookmark);
  if (!['saved', 'chat', 'failed', 'skipped'].includes(receipt.status)) throw new Error('invalid save status');
  if (typeof receipt.message !== 'string' || !receipt.message.trim()) throw new Error('receipt message is required');
  for (const key of ['saved_file', 'html_file', 'destination_url']) {
    if (receipt[key] != null && (typeof receipt[key] !== 'string' || !receipt[key].trim())) throw new Error(`${key} must be a locator or null`);
  }
  if (receipt.destination_url != null && !webUrl(receipt.destination_url)) throw new Error('destination_url must be HTTP(S)');
  const delivered = ['saved', 'chat'].includes(receipt.status);
  return {
    ...structuredClone(bookmark),
    saved_file: delivered ? receipt.saved_file ?? null : null,
    html_file: delivered ? receipt.html_file ?? null : null,
    destination_url: receipt.status === 'saved' ? receipt.destination_url ?? null : null,
    status: receipt.status,
    save_message: receipt.message,
  };
}

function actions(bookmark) {
  return [
    ['Open original source', bookmark.url],
    ['Access saved bookmark', bookmark.saved_file],
    ['Access saved HTML', bookmark.html_file],
    ['Open saved destination', bookmark.destination_url],
  ].filter(([, locator]) => locator);
}

function statusText(bookmark) {
  const labels = { saved: 'Saved', chat: 'Delivered in this conversation only; not stored', failed: 'Not saved', skipped: 'Skipped; no new bookmark saved' };
  if (!labels[bookmark.status]) throw new Error('apply a save receipt before rendering a preview');
  return `${labels[bookmark.status]}: ${bookmark.save_message}`;
}

function facts(bookmark) {
  return [['Source', bookmark.source_type], ['Category', bookmark.category], ['Saved date', bookmark.saved_at], ['Tags', bookmark.tags.join(' ')]];
}

function sections(bookmark) {
  return [
    ['Overview', [bookmark.summary || bookmark.description || (bookmark.content_markdown ? 'No summary supplied; see the full clip for retained content.' : 'Source content unavailable.')]],
    ['Key details', bookmark.key_points.length ? bookmark.key_points : ['No additional details verified.']],
    ['Why it matters', [bookmark.why_it_matters || 'Practical value not established from the available content.']],
    ...(bookmark.limitations.length ? [['Source limitations', bookmark.limitations]] : []),
  ];
}

function actionList(bookmark, attachmentLinks) {
  return `### Actions\n\n${actions(bookmark).map(([label, locator]) => `- ${markdownLink(label, locator, attachmentLinks)}`).join('\n') || 'No verified links or saved paths available.'}`;
}

// The compact layout, for an explicit short preview or when there's no clip to show.
export function renderMarkdown(bookmark, { attachmentLinks = false } = {}) {
  validate(bookmark);
  return [
    `## ${escapeMarkdown(bookmark.title)}`, escapeMarkdown(statusText(bookmark)),
    facts(bookmark).map(([key, value]) => `- **${key}:** ${escapeMarkdown(value)}`).join('\n'),
    ...sections(bookmark).map(([heading, values]) => `### ${heading}\n\n${values.map(value => heading === 'Key details' ? `- ${escapeMarkdown(value)}` : escapeMarkdown(value)).join('\n\n')}`),
    actionList(bookmark, attachmentLinks),
  ].join('\n\n');
}

// Clip text paraphrases web pages, so nothing in it may load or run when shown:
// images become links, links need an HTTP(S) target, and raw HTML shows as text.
const inert = text => text.replace(/!+(?=\[)/g, '')
  .replace(/\](\(|:)(?=\s*<?(\S*))/g, (match, mark, target) => webUrl(target) ? match : `]\\${mark}`)
  .replace(/</g, '&lt;');

// What looks like code here may be prose to a renderer: after an escaped
// backtick, across lines, in a table cell, or in a fence a list ends early. So
// it stays as written only if it would be harmless as prose, such as Array<string>.
const inertCode = text => /!\[|\]\(|\]:|(?<!\w)<|<[^>]*[=/]/.test(text) ? inert(text) : text;

// Only an unindented fence is sure to hold code, since no list or quote can end
// it. One left open is closed so it can't swallow the verified links after the clip.
// ponytail: line by line, not a CommonMark parser, so a multi-line construct such
// as a link title holding a fence can still hide text. Use a parser if this ever
// renders without a model.
function safeClip(markdown) {
  let fence = '';
  let indented = false;
  const lines = markdown.split(/\r\n?|\n/).map(line => {
    const [, indent, mark] = line.match(/^( {0,3})(`{3,}(?=[^`]*$)|~{3,})/) ?? [];
    if (fence) {
      if (mark?.[0] === fence[0] && mark.length >= fence.length && line.trim() === mark) fence = '';
      return indented ? inertCode(line) : line;
    }
    if (mark) {
      fence = mark;
      indented = indent !== '';
      return line;
    }
    return line.replace(/(`+)(?!`).*?(?<!`)\1(?!`)|[^`]+|`+/g, (part, ticks) => ticks ? inertCode(part) : inert(part));
  });
  return [...lines, ...(fence ? [fence] : [])].join('\n');
}

// What every host shows by default: the whole clip, wherever it was stored.
export function renderClip(bookmark, { attachmentLinks = false } = {}) {
  validate(bookmark);
  if (!['saved', 'chat'].includes(bookmark.status) || !bookmark.content_markdown.trim()) return renderMarkdown(bookmark, { attachmentLinks });
  const limitations = bookmark.limitations.filter(value => !bookmark.content_markdown.includes(value));
  return [
    escapeMarkdown(statusText(bookmark)), safeClip(bookmark.content_markdown),
    ...(limitations.length ? [`### Source limitations\n\n${limitations.map(value => escapeMarkdown(value)).join('\n\n')}`] : []),
    actionList(bookmark, attachmentLinks),
  ].join('\n\n');
}

// A reusable companion, not a Markdown parser: the full clip is preserved as
// escaped text alongside the structured overview. The skill's existing HTML
// template remains available for richly formatted full-clip downloads.
export function renderHtml(bookmark) {
  validate(bookmark);
  // Keep the established HTML metadata labels used by clip indexing/readers.
  const metadata = [
    ...(bookmark.url ? [['Source', bookmark.url]] : []),
    ['Saved', bookmark.saved_at], ['Category', bookmark.category],
    ['Type', bookmark.source_type], ['Tags', bookmark.tags.join(' ')],
  ];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="Gleaner clip">
<meta name="gleaner:id" content="${escapeHtml(bookmark.id)}">
${bookmark.saved_file ? `<meta name="gleaner:primary" content="${escapeHtml(bookmark.saved_file)}">` : ''}
<meta name="description" content="${escapeHtml(bookmark.description)}">
<title>${escapeHtml(bookmark.title)}</title>
<style>
  :root { color-scheme: light dark; font: 1rem/1.6 system-ui, sans-serif; }
  main { max-width: 42rem; margin: auto; padding: 1rem; overflow-wrap: anywhere; }
  dt { font-weight: bold; } dd { margin: 0 0 .5rem; }
  pre { white-space: pre-wrap; overflow-wrap: anywhere; }
  a:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
</style>
</head>
<body><main>
<h1>${escapeHtml(bookmark.title)}</h1>
<dl>${metadata.map(([key, value]) => `<dt>${key}</dt><dd>${key === 'Source' ? `<a href="${escapeHtml(value)}">${escapeHtml(value)}</a>` : escapeHtml(value)}</dd>`).join('')}</dl>
${sections(bookmark).map(([heading, values]) => `<section><h2>${heading}</h2>${heading === 'Key details' ? `<ul>${values.map(value => `<li>${escapeHtml(value)}</li>`).join('')}</ul>` : values.map(value => `<p>${escapeHtml(value)}</p>`).join('')}</section>`).join('\n')}
<h2>Actions</h2>
<ul>${actions(bookmark).map(([label, locator]) => `<li>${webUrl(locator) ? `<a href="${escapeHtml(locator)}">${label}</a>` : `${label}: ${escapeHtml(locator)}`}</li>`).join('')}</ul>
<details><summary>Full clip (Markdown)</summary><pre tabindex="0">${escapeHtml(bookmark.content_markdown)}</pre></details>
</main></body></html>\n`;
}

// Unix seconds for a YYYY-MM-DD Saved date at noon UTC, so browsers from UTC-12
// to UTC+11 show the same day; null for anything else, including dates
// Date.parse rolls over (2026-02-30 becomes March 2).
function savedSeconds(date) {
  const ms = Date.parse(`${date}T12:00:00Z`);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(ms) && new Date(ms).toISOString().startsWith(date) ? ms / 1000 : null;
}

// Chrome's importer parses the file one line at a time and drops an entry or
// folder name split by a line break, so each one is kept on a single line.
const oneLine = value => String(value).replace(/\s*[\r\n]+\s*/g, ' ');

// A Netscape bookmark file, the HTML import format browsers share, built from
// Clip index rows. Each bookmark opens the clip's source page, or the clip itself
// when it has no page; rows with neither as an HTTP(S) link come back in skipped.
export function renderBookmarksFile(clips) {
  const folders = new Map();
  const skipped = [];
  for (const clip of clips) {
    const href = [clip.url, clip.clip_link].find(webUrl);
    if (!href) { skipped.push(String(clip.title ?? '')); continue; }
    const added = savedSeconds(clip.saved_at);
    const tags = oneLine((Array.isArray(clip.tags) ? clip.tags : []).map(tag => String(tag).replace(/^#/, '')).join(','));
    const note = oneLine([clip.note, clip.clip_link && clip.clip_link !== href ? `Clip: ${clip.clip_link}` : ''].filter(Boolean).join(' · '));
    const category = oneLine(clip.category || 'Uncategorized');
    if (!folders.has(category)) folders.set(category, []);
    folders.get(category).push(`      <DT><A HREF="${escapeHtml(href)}"${added === null ? '' : ` ADD_DATE="${added}"`}${tags ? ` TAGS="${escapeHtml(tags)}"` : ''}>${escapeHtml(oneLine(clip.title || href))}</A>${note ? `\n      <DD>${escapeHtml(note)}` : ''}`);
  }
  const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
  <DT><H3>Gleaner</H3>
  <DL><p>
${[...folders].map(([category, entries]) => `    <DT><H3>${escapeHtml(category)}</H3>\n    <DL><p>\n${entries.join('\n')}\n    </DL><p>`).join('\n')}
  </DL><p>
</DL><p>\n`;
  return { html, skipped };
}

// A host adapter may supply an available native component; ordinary Markdown
// is always returned for the conversation, even when that component succeeds.
export async function present(bookmark, { mode = 'auto', nativePreview, attachmentLinks = false } = {}) {
  if (!['auto', 'chat', 'markdown', 'short', 'none'].includes(mode)) throw new Error('invalid presentation mode');
  // With nothing saved or attached, the clip shown here is the only copy.
  const onlyCopy = bookmark.status === 'chat' && !bookmark.saved_file && !bookmark.html_file;
  const markdown = (mode === 'short' && !onlyCopy ? renderMarkdown : renderClip)(bookmark, { attachmentLinks });
  if (mode === 'none' && !onlyCopy) return { markdown: [escapeMarkdown(statusText(bookmark)), bookmark.saved_file ? markdownLink('Saved bookmark', bookmark.saved_file, attachmentLinks) : ''].filter(Boolean).join('\n\n'), native: false, fallback: false };
  if (['auto', 'chat'].includes(mode) && typeof nativePreview === 'function' && ['saved', 'chat'].includes(bookmark.status)) {
    try {
      if (await nativePreview(structuredClone(bookmark), markdown) === false) throw new Error('preview declined');
      return { markdown, native: true, fallback: false };
    } catch {
      return { markdown: `${markdown}\n\nInteractive preview unavailable; showing Markdown.`, native: false, fallback: true };
    }
  }
  return { markdown, native: false, fallback: mode === 'chat' };
}

// Optional CLI: node bookmark.mjs < input.json > output.json
// Input: { bookmark, receipt, mode?, attachmentLinks? }, or { clips } for a
// bookmarks file; output is data, never a saved-file receipt.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const input = JSON.parse(readFileSync(0, 'utf8'));
  if (Array.isArray(input.clips)) {
    process.stdout.write(JSON.stringify(renderBookmarksFile(input.clips), null, 2));
  } else {
    const bookmark = applyReceipt(input.bookmark, input.receipt);
    process.stdout.write(JSON.stringify({ bookmark, html: renderHtml(bookmark), ...await present(bookmark, { mode: input.mode, attachmentLinks: input.attachmentLinks }) }, null, 2));
  }
}
