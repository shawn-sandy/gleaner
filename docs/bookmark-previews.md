# Bookmark previews across hosts

Saving through Gleaner's existing commands shows the full clip in the active conversation after the save result, on every host and for every destination, including ChatGPT mobile, with download and destination links afterward. A short preview, on request, gives the compact title, source type, category, saved date, tags, Overview, Key details, Why it matters, and verified action links. The same model supplies the saved HTML and the conversation copy. YouTube, collected parts, saved answers, same-session updates, and follow-ups reuse this flow.

## Storage and presentation are separate

| Output | Purpose | Behavior |
| --- | --- | --- |
| Configured primary save | Keep the full clip where you chose | Existing preferences and formats apply: Drive Markdown/Google Docs, local/Cowork Markdown, Notion pages, artifacts, or chat downloads. |
| HTML bookmark | Reusable file opened in a browser | Automatic in Claude: chat HTML/artifact output, a local Markdown companion, or a chat download for other destinations where supported. In ChatGPT: only when requested or maintaining retained HTML on updates. |
| Conversation clip | Read the full clip without opening a file, including on mobile | Full clip rendered directly as Markdown on every host, with actual code fences retained and no surrounding file code block. Verified downloads and saved paths are separate; a native component may supplement the text. |
| Short preview | A quick look, on request, for one save | Compact portable Markdown, with source URL and confirmed saved path/link. No ChatGPT tool dependency. |

ChatGPT defaults to a private editable Page when no explicit, retained, session, project, or user destination and no raw-file request wins, with the full in-chat clip and a verified Page link. Claude keeps HTML conversation delivery by default. Unset format or `auto` preserves native delivery. A winning explicit or saved raw Markdown request keeps chat/file delivery when only the built-in Page default would apply; explicit Page plus raw-file-only format requires a choice. Missing required Page tools before any write allow explained Markdown fallback only for the built-in default; explicit or retained Pages require an alternative choice. Refusals and uncertain writes follow Page recovery, never silent redirection. A configured Google Drive `Browser Research` folder remains the primary destination, using its verified ID and category folder. HTML is not silently uploaded there or substituted for a Google Doc. A chat HTML companion is labeled as a download, separate from the Drive save.

No preferences migration or manual setup is required. Schema 1 is unchanged; `auto` uses native destination delivery (including the host-specific format when chat is selected), and `markdown` still requests a raw Markdown file. “Short preview” swaps the full clip for the compact layout, and “no preview” suppresses it, for that request; both still confirm the result. “Use a Markdown preview” affects conversation presentation only; “keep the saved file as Markdown” changes storage format through the existing contract. There is no persisted `preview_mode` key.

## Same bookmark in ChatGPT and Claude Code

These examples use the fictional repository in the offline fixture, not a claim about a live project. Both use the same title, category, tags, description, summary, date, and key points. The destination differs only because the example requests explicitly select it.

ChatGPT request:

```text
@gleaner save https://example.com/harness --to drive
```

Example response after a verified Drive save, rendering the fixture's complete `content_markdown` directly. The outer fence below is only for this documentation example; the actual reply has no surrounding code block:

```markdown
Saved "Example Harness — Agent Skills" to Browser Research/AI & Agents as Markdown.

# Example Harness — Agent Skills

**Source:** https://example.com/harness
**Saved:** 2026-10-23
**Category:** AI & Agents

## TL;DR
Example Harness provides reusable agent skills with local configuration.

## Follow-ups
Read the configuration guide.

---
To get follow-ups, paste this into a new chat.

### Saved links

- Access saved bookmark: <verified Drive link>
- Open saved destination: <verified category folder link>
```

Claude Code request:

```text
/gleaner:glean https://example.com/harness --to ./notes
```

Claude Code shows the fixture's full `content_markdown` the same way. This example leaves the clip out and shows only the outcome and actions, which reflect the filesystem result:

```text
Saved "Example Harness — Agent Skills" to notes/ai-agents/2026-10-23-example-harness.md.
HTML companion: notes/ai-agents/2026-10-23-example-harness.html.
Open original source: https://example.com/harness
```

The paths above illustrate the naming convention, not files created by this documentation. Real responses use tool-confirmed paths, including collision suffixes. `/glean` works only where the host already provides that alias; the Claude plugin command remains `/gleaner:glean`. Natural-language save requests follow the same flow.

## Implementation and validation limits

The runtime remains instructions in [glean](../plugins/gleaner/skills/glean/SKILL.md) and its [shared bookmark contract](../plugins/gleaner/skills/glean/references/bookmark.md). Extraction runs once; storage uses the existing destination adapters; presentation checks available capabilities. The plugin ships no executable renderer; every host follows the same contract directly.

Chat HTML and Artifact publishing use the full-clip HTML template, including clickable chapter links, and never execute source HTML or scripts. When attachments or local writes are unavailable, the readable preview still works, but an HTML download cannot be promised.

The offline tests are instruction-reference checks: they ensure the relevant skills route to the common contract and that its presentation, clip list, and permission rules stay in place. These are not automated browser, connector, duplicate-search, preference-sync, or live model-execution tests.

Run `npm ci`, `npm run validate`, and `npm test`. After loading the updated plugin, maintainers should verify:

- A ChatGPT save to configured Drive displays the preview and correct links; the stored file retains its configured format, and no HTML companion is generated unless requested.
- A Claude Code local save writes Markdown and an HTML companion, then displays the full clip with the actual source and paths.
- A chat-only save returns `.md` in ChatGPT and `.html` in Claude with unset or `auto` format, uses `.md` in either with `markdown`, and shows the full clip inline. Without attachments, every host delivers the full clip inline once.
- A same-session update refreshes only its known primary/companion pair; an older duplicate offers an updated copy or skip, and index results do not double-count the pair.
- A YouTube description-only or title-only clip carries its limitation in both outputs; transcript-based key moments and chapter links remain intact in the full clip.
- ChatGPT mobile shows the full clip without a download or desktop switch; attachment links are labeled as downloads, and no file-viewer behavior is promised. Explicit short/no-preview requests apply, and response limits are disclosed rather than silently dropping content.
- A native component failure shows the full clip as Markdown without uploading again. A failed save never reports success; HTML-only failures preserve and report the primary save.
- Existing Notion, Cowork, Artifact, collected-parts, answers, and follow-up saves still use their existing destinations and full-clip content.

## ChatGPT repeated-edit and preview-recovery checks

Run these as live instruction-following checks after loading the plugin; offline tests do not prove that a model follows the final-reply rule.

1. Save a description-based video clip, then request three separate additions, such as medium effort, model differences, and a recommendation. After each successful update, verify that the final reply contains the complete latest clip, including earlier additions, source limitations, and the follow-up prompt. An “Updated” sentence and download link alone fails.
2. Say “the md downloads every time; can you fix this?” Verify that the very next final reply displays the complete current clip. It may read the known saved file once but must not create or replace a file, retry source retrieval, merely explain the limitation, or promise a mobile file viewer.
3. Request “download only” for one edit, then make another edit without that qualifier. With a saved or attached copy available, verify that the first respects the exception and the second returns to full inline delivery. Repeat with “short preview” and “no preview” for both generic and YouTube edits. When attachments are unavailable and the conversation is the destination, verify that each request still delivers the full clip and explains that no file was attached.
4. Repeat a Claude Code local edit and verify that its existing Markdown/HTML companion and presentation behavior is unchanged.
