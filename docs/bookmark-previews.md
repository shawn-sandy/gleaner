# Bookmark previews across hosts

Saving through Gleaner's existing commands now shows a structured bookmark in the active conversation after the save result: title, source type, category, saved date, tags, Overview, Key details, Why it matters, and verified action links. The same model supplies the saved HTML and the preview. YouTube, collected parts, saved answers, same-session updates, and follow-ups reuse this flow.

## Storage and presentation are separate

| Output | Purpose | Behavior |
| --- | --- | --- |
| Configured primary save | Keep the full clip where you chose | Existing preferences and formats apply: Drive Markdown/Google Docs, local/Cowork Markdown, Notion pages, artifacts, or chat downloads. |
| HTML bookmark | Reusable file opened in a browser | Automatic in Claude: chat HTML/artifact output, a local Markdown companion, or a chat download for other destinations where supported. In ChatGPT: only when requested or maintaining retained HTML on updates. |
| ChatGPT preview | Read the bookmark without opening a file | Ordinary conversation headings, lists, and links; an available native component can supplement them. Arbitrary HTML is not executed in chat. |
| Claude Code/other agent preview | Read the same bookmark in a conversation or terminal | Portable Markdown, with source URL and confirmed saved path/link. No ChatGPT tool dependency. |

The default destination remains the conversation when no preference exists: Markdown in ChatGPT, HTML in Claude. Both unset format and `auto` follow this host default; `markdown` gives Markdown in either host. A configured Google Drive `Browser Research` folder remains the primary destination, using its verified ID and category folder. HTML is not silently uploaded there or substituted for a Google Doc. A chat HTML companion is labeled as a download, separate from the Drive save.

No preferences migration or manual setup is required. Schema 1 is unchanged; `auto` uses the host-specific chat format, and `markdown` still requests a raw Markdown file. “No preview” suppresses the detailed preview for that request but still confirms the result. “Use a Markdown preview” affects conversation presentation only; “keep the saved file as Markdown” changes storage format through the existing contract. There is no persisted `preview_mode` key.

## Same bookmark in ChatGPT and Claude Code

These examples use the fictional repository in the offline fixture, not a claim about a live project. Both use the same title, category, tags, description, summary, date, and key points. The destination differs only because the example requests explicitly select it.

ChatGPT request:

```text
@gleaner save https://example.com/harness --to drive
```

Example response after a verified Drive save:

```markdown
## Example Harness — Agent Skills

Saved to Browser Research/AI & Agents as Markdown.

- **Source:** repo
- **Category:** AI & Agents
- **Saved date:** 2026-10-23
- **Tags:** #agents #skills #tools

### Overview

Example Harness provides reusable agent skills with local configuration.

### Key details

- Skills are stored in the project.
- Configuration can be reused across sessions.

### Why it matters

Reusable configuration can reduce repeated setup.

### Actions

- [Open original source](https://example.com/harness)
- Access saved bookmark: <verified Drive link>
- Open saved destination: <verified category folder link>
```

Claude Code request:

```text
/gleaner:glean https://example.com/harness --to ./notes
```

Claude Code displays the same Markdown preview. Its outcome and actions reflect the filesystem result instead:

```text
Saved to notes/ai-agents/2026-10-23-example-harness.md.
HTML companion: notes/ai-agents/2026-10-23-example-harness.html.
Open original source: https://example.com/harness
```

The paths above illustrate the naming convention, not files created by this documentation. Real responses use tool-confirmed paths, including collision suffixes. `/glean` works only where the host already provides that alias; the Claude plugin command remains `/gleaner:glean`. Natural-language save requests follow the same flow.

## Implementation and validation limits

The runtime remains instructions in [glean](../plugins/gleaner/skills/glean/SKILL.md) and its [shared bookmark contract](../plugins/gleaner/skills/glean/references/bookmark.md). Extraction runs once; storage uses the existing destination adapters; presentation checks available capabilities. An optional dependency-free [Node renderer](../plugins/gleaner/skills/glean/scripts/bookmark.mjs) generates deterministic HTML companions and Markdown from that model. It does not fetch, save, resolve preferences, or call connectors. Hosts that support returned sandbox attachment URLs set the renderer’s `attachmentLinks: true` capability so the Markdown preview keeps those downloads clickable; standalone HTML still links only HTTP(S) URLs. Hosts without Node follow the same contract directly.

The optional renderer's compact HTML includes an expandable full clip as escaped Markdown text. Existing chat HTML and Artifact publishing retain their richer full-clip HTML template, including clickable chapter links. Neither renderer executes source HTML or scripts. When attachments or local writes are unavailable, the readable preview still works, but an HTML download cannot be promised.

The offline tests exercise the renderer, native-component mock, save receipts, metadata consistency, unchanged schema-1 example data, Drive locators, duplicate skip/update receipts, missing source details, YouTube content, and error fallbacks. Instruction-reference checks ensure the relevant skills route to the common contract. These are not automated browser, connector, duplicate-search, preference-sync, or live model-execution tests.

Run `npm ci`, `npm run validate`, and `npm test`. After loading the updated plugin, maintainers should verify:

- A ChatGPT save to configured Drive displays the preview and correct links; the stored file retains its configured format, and no HTML companion is generated unless requested.
- A Claude Code local save writes Markdown and an HTML companion, then displays equivalent content with the actual source and paths.
- A chat-only save returns `.md` in ChatGPT and `.html` in Claude with unset or `auto` format, uses `.md` in either with `markdown`, and adds a readable preview. Without attachments, both use the full Markdown code-block fallback.
- A same-session update refreshes only its known primary/companion pair; an older duplicate offers an updated copy or skip, and index results do not double-count the pair.
- A YouTube description-only or title-only clip carries its limitation in both outputs; transcript-based key moments and chapter links remain intact in the full clip.
- A native component failure shows Markdown without uploading again. A failed save never reports success; HTML-only failures preserve and report the primary save.
- Existing Notion, Cowork, Artifact, collected-parts, answers, and follow-up saves still use their existing destinations and full-clip content.
