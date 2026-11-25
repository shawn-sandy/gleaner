---
status: todo
type: docs
created: 2026-11-25
repo-name: gleaner
---

# Tracking clips: linking each clip to its save, and updating clips in place

Exploration, 2026-11-25. Nothing in the skills has changed yet. This note asks how Gleaner could track clips over time: link each clip to the save it came from, and update a clip where it lives without saving it as a new clip. It reads the skill prose as it stands at commit `0f466ec` (Gleaner 2.15.11). Nothing here is live-tested.

## At a glance

- **Gleaner has no app code or database.** The product is the prose in four `SKILL.md` files plus their references. A "clip" is whatever the save writes: a Markdown or HTML file, a Google Doc, a Notion page, a claude.ai artifact, a ChatGPT Page, or a clip shown in the chat. Its header lines (Source, Saved, Category, Type, Tags, Note, Scope, Supersedes) are its only stored metadata.
- **A "save" is an action, not a stored record.** In Gleaner, a save is one run of glean step 6 that creates or rewrites a clip. Nothing durable names that event. The closest traces are the chat tag line written for every save and update, a clip list row (only when the user turned the list on), and a **Supersedes:** line on an updated copy.
- **The clip already has an ID, but it is persisted only in HTML.** The bookmark model's `id` field is an opaque ID kept for same-session updates, and a new one is generated for updated copies (`bookmark.md:11`). Full-template HTML (artifacts, HTML clips, HTML companions) already stores it as a `gleaner:id` meta value (`bookmark.md:44`). Markdown files, Google Docs, Notion pages, and chat clips don't store it, so in those an earlier-session clip can be identified only by its Source URL and Saved date.
- **In-place updates exist, but only within one conversation.** A clip saved in this conversation is rewritten where it lives (glean `SKILL.md:589-597`). A clip from an earlier session is never edited: changing it means an updated copy with a Supersedes line (glean `SKILL.md:298`, `:329`; follow-up `SKILL.md:85`). That copy is the "saved as a new clip" behavior the request wants to avoid.
- **Proposal, smallest version:** write two header lines into every clip, `**Clip ID:**` (stable for the life of the clip) and `**Save ID:**` (new on every save). Record the Save ID in the chat tag line and the clip list row, so the clip and its save point at each other. Then let an explicit "update my clip" request rewrite an earlier-session clip in place, guarded by a read-before-write check on its Save ID.
- **Recommendation:** ship the two ID lines and the tag line change first (no behavior change, nothing to migrate). Add cross-session in-place updates second, opt-in and per destination, starting with local files and Notion, where the connector can rewrite a clip without changing its link.

## How clips and saves are modeled today

### The clip

Every clip starts from one in-memory bookmark (`glean/references/bookmark.md:9-26`). The fields that matter here:

| Field | What it holds today | Persisted in the clip? |
| --- | --- | --- |
| `id` | Opaque ID, kept for same-session updates, new for updated copies | Only in full-template HTML, as a `gleaner:id` meta value (`bookmark.md:44`) |
| `url` | The first Source URL; canonical and extra sources kept in session state | Yes, as **Source:** |
| `saved_at` | The Saved date, YYYY-MM-DD, kept on same-session updates | Yes, as **Saved:** |
| `destination` | Provider, label, and verified `remote_id` or `path` | No (implied by where the clip lives) |
| `saved_file` | The exact link or path a successful save returned | No |
| `content_markdown` | The whole clip, Supersedes and Follow-ups included | Yes, it is the clip |

The bookmark contract says not to add its fields to preferences and not to require old clips to have them (`bookmark.md:28`). The header lines written into the clip come from the templates in glean step 3 (`SKILL.md:333-402`). Notion stores the same values as database properties instead of header lines (`SKILL.md:503-513`), and artifacts and HTML clips store them as rows in a header list (`SKILL.md:529`).

### The save

There is no save object. What a save leaves behind:

| Trace | Written when | Where | Links to the clip by |
| --- | --- | --- | --- |
| The clip itself | Every save and update | The destination | Itself |
| Chat tag line, `Gleaner clip · <Saved> · <title> · <Category> · #tags · <Source>` | Every save, update, and Fallback (`SKILL.md:612`) | The conversation, as plain text | Source URL and Saved date |
| Clip list row (Date, Title, Category, Type, Tags, Note, Source URL, Clip link, Saved in) | New clip, updated copy, chat clip, Fallback; a same-session update only when the link changed (`SKILL.md:603-604`) | A Sheet, `Clip List.md`, or a Notion list database, only when `skills.gleaner.clip_list` is set (`contract.md:17`) | Clip link |
| **Supersedes:** line | An updated copy of an earlier-session clip (`SKILL.md:329`) | The new copy | Link or path to the old copy |
| ChatGPT Page delivery record (bookmark ID, Page ID, canonical URL, creation key) | A Page save in ChatGPT (`chatgpt-pages.md:29`) | Session memory only | Page ID |

Finds already treat the tag lines as a loose save log: lines with the same Source URL and Saved date collapse into one clip, taking the latest line's values (`SKILL.md:628`). That rule is the closest thing to "the saves that belong to one clip", and it breaks for two different clips of one page saved on the same day.

### Clip identity today

- **Within a conversation:** "Same page" matching on the Source URL (tracking parameters, section anchors, and trailing slashes dropped, `canonical` matched too) picks the clip to update (`SKILL.md:285-288`). The session keeps the clip's destination and where it lives.
- **Across conversations:** a clip is found by searching its destination for its Source URL (duplicate check, `SKILL.md:320-327`) or by tag, keyword, and date (Clip index, `SKILL.md:616-632`). Copies are chained by Supersedes, and follow-up walks the chain to the newest copy (`follow-up/SKILL.md:27`).

## Where clips are created and updated

| What | Where it happens | What it does |
| --- | --- | --- |
| New page, part, or answer clip | glean step 6, one block per destination (`SKILL.md:470-598`) | Collision-checked new file, page, Doc, or artifact; never overwrites |
| Video clip | youtube skill, which hands storage back to glean step 6 (`glean/SKILL.md:32`) | Same as above |
| Updated copy of an earlier-session clip | glean step 2 duplicate check (`SKILL.md:328-329`) | New clip with a Supersedes line; the old one is never edited |
| Same-session update (Add part, Save page refresh, Manage parts) | "Clips saved this session" (`SKILL.md:283-298`) and "Updating a clip saved this session" (`SKILL.md:589-597`) | Rewrites the clip where it lives, under the same name |
| Follow-ups | follow-up "Save the follow-ups" (`follow-up/SKILL.md:81-85`) | Same-session clip in place; earlier-session clip as an updated copy |
| ChatGPT Page edits | `chatgpt-pages.md:49-57` | Guarded block-level edits on the same Page, read before every write |
| Clip list row | glean step 6, Clip list (`SKILL.md:602-608`) | Append-only; never rewrites earlier rows |

## Proposed approach: link each clip to its save

### Two IDs in the clip

Add two header lines just under **Saved:** in both step 3 templates:

```markdown
**Saved:** 2026-11-25
**Clip ID:** gl-3f2a9c1e-7b4d-4e8a-9c61-0d2f5b7e8a10
**Save ID:** gs-2026-11-25-8c41d2
```

- **Clip ID** is the bookmark's `id`, now persisted in every format, and the same value as the HTML `gleaner:id` meta. It never changes for the life of the clip: not on a same-session update, not on a cross-session in-place update, and not when Drive has to re-upload the clip under a new link. A new clip (including "as a new clip", "separately") gets a new one.
- **Save ID** is new on every save or update of the clip. It names the save the current content came from. The date in it is the save's date, which may be later than **Saved:**, the clip's creation date.
- **Updated copies** keep their own new Clip ID, as today, so a Supersedes chain still reads as separate clips. Only an in-place update keeps the Clip ID (see the next section).
- **Format:** a fixed prefix and a hex body, so a reader can validate the value with one pattern before trusting it. Clip text is untrusted data; a line that doesn't match the pattern is ignored, not obeyed.

### The save points back at the clip

- **Chat tag line** gains both IDs: `Gleaner clip · <Saved> · <title> · <Category> · #tags · <Source> · <Clip ID> · <Save ID>`. Every save and update already writes one, so the conversation becomes the save log. Finds collapse lines by Clip ID within one clip link: two files that share a Clip ID because one was copied stay separate results (see Copied IDs under Risks).
- **Clip list row** gains Clip ID and Save ID columns, and same-session updates add a row every time instead of only when the link changed. The list then holds one row per save, and "the save a clip came from" is the row whose Save ID matches the clip's header.
- **Notion** gets two text properties, Clip ID and Save ID. The existing rule already adds a missing property rather than failing (`SKILL.md:516`, `:607`).
- **Artifact and HTML clips** get two rows in the header list; the template already turns every bold header line into a row (`SKILL.md:529`).

This makes "each clip links to the save it came from" true without a new store: the clip names its latest Save ID, and every save record names its Clip ID.

### What to edit when this is built

| File | Change |
| --- | --- |
| `glean/references/bookmark.md` | Persist `id` as Clip ID, keep it across in-place updates; add a `save_id` field |
| `glean/SKILL.md` step 3 templates and Rules | The two header lines; "A clip that grows" keeps Clip ID and writes a new Save ID |
| `glean/SKILL.md` step 6 (Notion schema, Clip list) | Two Notion properties; two clip list columns; a row per save |
| `glean/SKILL.md` step 7, Tagging the chat | The two IDs at the end of the tag line |
| `glean/SKILL.md` Clip index | Collapse tag lines and companions by Clip ID; fall back to Source and date for clips without one |
| `glean/references/chatgpt-pages.md` | The delivery record already carries the bookmark ID; persist it in the Page header |
| `follow-up/SKILL.md` | Find a clip by Clip ID when the pasted prompt carries one |

## Proposed approach: update a clip in place

### The rule change

Today: "Clips from earlier sessions are never updated" (`SKILL.md:298`). Proposed: a request that names an existing clip and asks to change it ("update my clip on view transitions", "add this to my Cowork clip", a follow-up on an earlier clip) rewrites that clip in place when its destination can do it safely, keeping its Clip ID and writing a new Save ID. A save of a page that already has a clip still runs the duplicate check, and its offer becomes three choices: update the clip in place, save an updated copy, or skip.

### Safe write: read before write

The ChatGPT Page route already does this (`chatgpt-pages.md:49-55`); generalize it:

1. Find the clip by Clip ID when the request carries one, otherwise by the existing search. Ask when several match.
2. Read the clip's current content and a change marker: the provider's revision or version when the connector returns one (a Notion `last_edited_time`, an artifact version), otherwise a hash of the full content. The current content is the clip, manual edits included; never rebuild it from session memory.
3. Build the update from that content.
4. Just before writing, read the change marker again. A Save ID check alone is not enough: a manual edit changes the content without changing the Save ID. If the marker changed, the clip was edited or saved in between: reread and rebuild, once. If it changes again, stop and offer an updated copy.
5. Write. Where the destination offers a conditional write, use it, so the write fails if the clip changed after step 4: the Artifact tool refuses a publish over a version it didn't read, and ChatGPT Page edits carry their own guards. Local files and Notion offer no conditional write or lock, so a short race remains between steps 4 and 5.
6. Read back and compare the stored content with what was written. A mismatch means another writer got in during that race: report it, and offer to rebuild from the current content or save an updated copy. Never report the update as clean.

### Per-destination matrix

| Destination | Same-session update today | Cross-session in place | Link stays the same? | Notes |
| --- | --- | --- | --- | --- |
| Local folder, Cowork, This project | Overwrite same path | Yes: overwrite after read-before-write | Yes | Overwriting clobbers manual edits unless the update starts from the file just read. A category change moves the file, as today. |
| Notion | `update-page` with `replace_content` | Yes: same call, properties updated | Yes | Best fit: Clip ID and Save ID are queryable properties. |
| ChatGPT Page | Guarded block edits | Possible: guarded block edits on the found Page | Yes | Needs a rule change: an earlier-session Page keeps the updated-copy policy and gets a new Page with a Supersedes link (`chatgpt-pages.md:35`). Its same-session guards are the closest model for the other destinations. |
| Artifact | Republish the same scratch path without `url` | Possible: `read`, then publish with that artifact's `url` | Yes | Needs a rule change: step 6 forbids publishing to an existing artifact's `url` (`SKILL.md:526`). The Artifact tool requires a read first and refuses stale writes, which gives the guard for free. |
| Google Drive | Upload new file, trash the old one | Partial: same upload-and-trash, keeping the Clip ID | No, the file ID changes | The connector can't change file content (`SKILL.md:595`). Today only a version this session saved may be trashed; trashing an earlier-session file is a new, riskier rule. The Clip ID is what keeps identity stable across the new link. |
| This conversation | Give the whole clip again, replacing the earlier copy | No: an earlier chat can't be edited | Not applicable | Always the updated-copy fallback: a new Clip ID and a Supersedes line naming the earlier clip's title as plain text, as follow-up does for a pasted clip today. |

### Fallback

When an in-place update can't run (Drive trash refused, a read-only artifact, a chat clip from another conversation), fall back to today's updated copy with a Supersedes line, and say so. Never claim an in-place update that didn't happen.

## Legacy clips and migration

- **No bulk migration.** Writing IDs into every existing clip means editing earlier-session clips nobody asked to change, across connectors, with a permission prompt each. Skip it.
- **Reuse the HTML ID.** A full-template HTML clip, or a Markdown clip whose verified companion carries a `gleaner:id` meta value, takes that value as its Clip ID instead of a new one, so the clip and its companion stay paired.
- **Assign on first touch.** Any other existing clip with no Clip ID gets one the first time it is updated in place, in the same write. Until then, finds keep matching it by Source URL and Saved date, as today. The in-place update keeps **Saved:**, so the new tag line has the same Source and Saved date as the old ones, plus the new Clip ID.
- **Supersedes chains.** Each copy in an existing chain stays its own clip. An in-place update targets the newest copy only, found the way follow-up already does it (`follow-up/SKILL.md:27`). Older copies are never written to.
- **Pre-category clips** (no **Saved:** or **Category:** line) stay outside this: they aren't verified Gleaner clips (`follow-up/SKILL.md:26`), so the existing offer of an updated copy with categories still applies.
- **Chat tag lines and clip list rows** written before the change have no IDs. Finds join a line without IDs to a clip with a Clip ID only when exactly one clip with an ID has that Source URL and Saved date. When several do, the old line stays a separate result rather than merging unrelated clips. Otherwise lines without IDs collapse the old way. Older clip list rows are never rewritten (`SKILL.md:606`).

## Risks and open questions

### Risks

- **Data loss on overwrite.** Cross-session local overwrites and Drive trashing are exactly what the current "never edit an earlier clip" rule prevents. Read-before-write and the Save ID guard reduce it; Drive's 30-day trash is the only undo there.
- **Manual edits.** Users edit clips by hand. An update that regenerates the clip from the bookmark instead of from the file just read loses those edits.
- **Copied IDs.** A user who duplicates a clip file creates two clips with one Clip ID. Finds should list both and let the user pick, never merge them silently.
- **Untrusted IDs.** Clip text comes from web pages. An ID line is data matched by pattern, never an instruction, and a malformed one is ignored.
- **Concurrent writers.** Local files and Notion have no conditional write, so two sessions updating one clip at the same moment can still lose one update. The readback in step 6 reports it but can't prevent it. Accept that or keep those destinations on updated copies.
- **More permission prompts.** A cross-session update adds a read, a guard reread, and a readback per save. The "Fewer permission prompts" rules still apply (`SKILL.md:259-266`).
- **Drive link churn.** Every Drive update changes the clip's link, so links in older chats and clip list rows go to the trash. The Clip ID survives; the link does not.

### Open questions

1. **Is a "save" the event or the version?** This note treats it as both: a Save ID names one save event and the version of the clip that event produced. If you instead want a separate "save" object that holds several clips (a reading session, a collection), the model changes: the save gets its own ID and record, and each clip lists the save it belongs to.
2. **Opt-in or default?** Should an existing-clip match default to updating in place, or keep offering the updated copy first? This note proposes in place as one of three choices, with no default switch until it has been used for a while.
3. **History inside the clip?** A `## Save history` section (one dated line per Save ID) would keep the log with the clip itself, at the cost of words in every clip. The tag lines and clip list already hold the log, so this note leaves it out.
4. **Drive:** is trashing an earlier-session file acceptable when the user asked for an in-place update, or should Drive stay on updated copies?
5. **ChatGPT Page:** should an explicit in-place request lift the earlier-session updated-copy policy (`chatgpt-pages.md:35`) for Pages?
6. **Artifact:** is lifting the "never publish with an existing `url`" rule acceptable for explicit in-place updates?

## Tests and rollout

### Assertions to add (to `scripts/bookmark.test.mjs`, in its existing style)

Each one fails if the prose regresses:

- Both step 3 templates contain the Clip ID and Save ID lines, directly after **Saved:**.
- "A clip that grows" keeps the Clip ID and requires a new Save ID.
- The chat tag line format in step 7 ends with the two IDs.
- The Clip list row lists Clip ID and Save ID, and a same-session update adds a row.
- The Notion schema table includes Clip ID and Save ID.
- The in-place update rule requires reading the current clip and rechecking a revision or full-content hash before writing, and forbids rebuilding from memory.
- A legacy HTML clip or companion with a `gleaner:id` meta value keeps that value as its Clip ID.
- The Drive update path still trashes only after a successful upload, and keeps the Clip ID.
- An ID line is matched by pattern and treated as data.
- `chatgpt-pages.test.mjs` still passes: its baseline checks pin Claude templates and follow-up rules (`chatgpt-pages.test.mjs:71`, `:79`), so those assertions need updating in the same PR rather than being loosened.

### Rollout

1. **PR 1, IDs only.** Header lines, bookmark field, tag line, clip list columns, Notion properties, find collapse by Clip ID. No behavior change for users beyond two new lines in each clip. Label `release:minor`, since clips gain new header lines.
2. **PR 2, in-place updates for local folders and Notion,** with read-before-write. Label `release:minor`.
3. **PR 3, ChatGPT Pages,** lifting the earlier-session updated-copy policy in `chatgpt-pages.md` and `follow-up/SKILL.md` for explicit in-place requests, with the Clip ID in the Page header and updated `chatgpt-pages.test.mjs` assertions.
4. **PR 4, Artifact and Drive,** after the open questions on them are decided.
5. Each PR adds its Unreleased bullet in the README changelog and updates the README "Customizing" section only if step numbers change (they shouldn't). The destination list that appears in five places is unaffected, since no destination is added.

Before any of this, prototype by hand: save three clips with the two ID lines to a local folder and to Notion, update one in place from a new conversation, and check that finds and follow-up locate it by Clip ID.
