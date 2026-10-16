---
name: clip
description: Save web pages or parts of them as summarized, tagged clips in Google Drive, Notion, a Cowork project, or the current Claude Code project, from plain-language requests in the Chrome side panel or the Claude Code desktop browser. Use when the user wants to keep, save, clip, bookmark, stash, or file what they are reading or a URL, such as "save this page", "keep this article for later", "grab the part about animation lengths", "add this bit too", "done, save them", "file this under design", or "save https://example.com to this project", with or without a reason. Also use to find, list, or index saved clips, such as "what did I save about Cowork" or "make me an index sheet".
argument-hint: "[--to drive | local | <path>]"
---

# Gleaner

Gather the best of what you read into tagged, searchable clips.

Save what the user is reading as a summarized, tagged clip in one of three places:

- **Google Drive** (default in the Chrome side panel and Cowork): uses the Google Drive connector.
- **Cowork project:** a local folder on the user's computer. Requires the Claude desktop app to be open and connected.
- **This project** (default in Claude Code): the folder the Claude Code session is working in.
- **Notion** (on request): a page per clip in a Notion database, using the Notion connector.

This skill does not write to claude.ai Projects; those can only be read from Cowork, not written to.

## Where Gleaner runs

Gleaner works wherever Claude can see a web page. Before reading anything, work out which browser you're in by checking which tools are available, and use that browser for every page read and highlight check in the request.

| Surface | Browser tools | "The page" means |
|---|---|---|
| **Chrome side panel** | the side panel's page tools | the tab the user is viewing |
| **Claude Code desktop, built-in browser** | `mcp__Claude_Browser__*` (or `mcp__remote-devices__Claude_Browser__*` when linked from the cloud) | the active tab in the Browser pane |
| **Claude in Chrome** (Claude Code with `--chrome`, or Cowork) | `mcp__claude-in-chrome__*` | a tab Gleaner opens; this extension works in its own tabs, so ask for a URL if none was given |

If more than one is available, prefer the one the user names, then the side panel, then the built-in browser, then Claude in Chrome.

**Reading pages in each browser:**
- **Page text:** use the browser's page-text tool (`get_page_text`). In the built-in browser, omit `tabId` to read the active tab.
- **Highlight:** run `window.getSelection()?.toString().trim() ?? ''` with the browser's JavaScript tool (`javascript_tool`, action `javascript_exec`).
- **Finding a described part:** use the page text, or the browser's `find` tool to locate a heading or phrase.

**Built-in browser specifics:**
- **Pane closed or no tabs:** if `tabs_context` shows no open tabs and the user didn't give a URL, ask them to open the page in the Browser pane (Cmd+Shift+B on Mac, Ctrl+Shift+B on Windows) or paste the URL. Don't guess which page they meant.
- **Pane hidden:** reading still works while the pane is hidden. Just mention which page you clipped, since the user may not be looking at it.
- **Site approvals:** if a tool says the site isn't allowed yet, call `request_access` for that site (scope `once`) when the tool exists, wait for the answer, then retry. If access is declined, say so and stop.
- **Sign-ins:** the pane has its own browser profile, separate from the user's Chrome. If a page is behind a login or paywall there, clip what's visible and mention that signing in within the pane would get the rest.

**A URL in the request** ("save https://…", "clip this: https://…"): open it in the current browser (`preview_start` in the built-in browser, a new tab in Claude in Chrome) and clip that page. If no browser is available, fetch the page with WebFetch and say it was read without a browser, so highlights don't apply.

**No browser at all:** if the user didn't give a URL or pasted text, explain in one line that Gleaner needs a page open in a browser it can reach, and name the options for this surface.

## Understanding requests

Users speak naturally; don't wait for exact phrasing. Read each request for an **intent** and any **details**, then act. When the meaning is clear enough to act on, act; mistakes are cheap because clips are never overwritten.

### Intents

| Intent | What it does | Sounds like |
|---|---|---|
| **Save page** | Saves a summary of the whole page now | "save this page", "keep this article", "bookmark this for later", "file this under design", "I want to remember this one", "stash this doc" |
| **Add part** | Adds a part to the clip being collected; nothing saved yet | "save this part about animation lengths", "add this", "grab this bit", "keep this section too", "and this paragraph on easing", "this table matters" |
| **Save clip** | Saves all collected parts (plus a current highlight not yet added) as one clip | "save this clip", "that's it, save them", "done", "wrap it up", "save what I've got" |
| **Manage parts** | Lists, removes, edits, or discards parts | "what have I got so far?", "drop the second one", "change part 1's note to …", "start over" |
| **Find clips** | Searches saved clips (see Clip index) | "what did I save about Cowork?", "show my clips from this week", "anything on view transitions?" |

**Deciding between them:**
- A request naming the whole thing ("this page", "this article", "the whole doc") is **Save page**, even with text highlighted.
- A request naming a piece ("this part", "this bit", "this section", "this paragraph", "this quote", "this table", "the part about X") is **Add part**.
- A bare "save this", "keep this", or "clip this" is **Save clip** when parts are collected or text is highlighted (~40+ characters), otherwise **Save page**.
- "Done", "that's all", or "save them" with parts collected is **Save clip**. With nothing collected, say there's nothing to save and offer to save the page.
- A follow-up like "and this one" or "this too" right after adding a part is another **Add part**.
- If parts are collected and the user asks to save the page, ask once: save the page on its own (keeping the parts), or include the parts?

### Details to pull out

| Detail | Cue words | Example → value |
|---|---|---|
| **Topic** of a part | "about", "on", "covering", "the bit where" | "the part about animation lengths" → `animation lengths` |
| **Note** (why they're saving it) | "for", "because", "so I can", "good example of", or any comment after the request | "keep this, great example of scroll-driven animation" → `great example of scroll-driven animation` |
| **Destination** | "to/in my … folder", "in Drive", "to my … project" | "save to my Serve513 project" → Cowork project `Serve513`; "save it to this project/repo" → This project |
| **Category** | "file under", "put in", "as" plus a category name | "file this under design" → `Design Engineering` |
| **Tags** | "tag it", hashtags, "label it" | "tag it motion and css" → `#motion #css` |

- Keep the user's words for notes and topics, lightly trimmed of the request itself. Never invent a note, and never ask for one. With no note given, leave the note line out.
- Match loose category words to the closest category ("design" → Design Engineering, "AI stuff" → AI & Agents). If nothing is close, use their words and mention it.
- A part's topic doubles as its heading. If the user gives a topic and a reason ("the part about easing, for the motion post"), record both: `easing — for the motion post`.
- Details belong to the request they appear in: a note given while adding a part belongs to that part; a note given when saving belongs to the whole clip.

### Destination flag

Any request can carry a `--to` flag (short form `-t`) that sets the destination for that save only. It works typed into the message ("save this page --to drive") or as an argument to the slash command (`/gleaner:clip --to ./notes`).

| Flag | Saves to |
|---|---|
| `--to drive` | Google Drive → `Browser Research/<Category>/` |
| `--to notion` | Notion → the `Browser Research` database |
| `--to notion:"Database Name"` | Notion → that database |
| `--to drive:"Folder Name"` | Google Drive → `<Folder Name>/<Category>/` (quotes needed only if the name has spaces) |
| `--to local` | The working folder → `browser-research/<category-folder>/` (Claude Code), or the current Cowork project |
| `--to cowork:"Project Name"` | That Cowork project's folder → `browser-research/<category-folder>/` |
| `--to <path>` | A local folder, such as `./notes`, `../research`, or `~/Documents/clips` → `<path>/<category-folder>/` |

Rules:
- **Precedence:** a `--to` flag beats a destination described in words, which beats the surface's default. If the flag and the words disagree in the same request, follow the flag and mention it.
- **Paths:** a value starting with `./`, `../`, `/`, or `~` is a local path. Relative paths resolve from the session's working directory. Create the folder if it's missing, but only inside the working directory or the user's home folder; for anything else, ask first.
- **Unavailable destinations:** local paths need local file access (Claude Code, or a desktop session with the folder connected), and `drive` needs the Google Drive connector. If the flagged destination can't be reached, don't silently switch: say so in one line and use the fallback in step 6.
- **Scope:** the flag applies to the clip being saved now. When collecting parts, a flag on any part request or on the final save applies to the whole clip; if different parts carry conflicting flags, use the one on the final save, or the most recent one.
- **Unknown values:** if the value isn't recognized (`--to dropbox`), say which values work and don't save.
- `notion` needs the Notion connector. If it isn't connected, say so in one line and suggest connecting it.
- Strip the flag from the request before reading the note, so `--to drive` never ends up in a clip's note.

### When to ask

Ask one short question only when acting would likely do the wrong thing, such as when two very different readings are equally plausible, or a named destination doesn't exist. Otherwise act, and say in the confirmation what you assumed so the user can correct it ("Saved the whole page — say 'just the highlighted part' if you meant only that").

### Collecting parts

A part is a piece of text plus its page title, URL, topic, and note. Parts live in this conversation until the clip is saved or cleared, and they can come from different pages and tabs.

To add a part:
1. **Read the highlight.** Run `window.getSelection()?.toString().trim() ?? ''` in the current browser (see Where Gleaner runs). Text of at least ~40 characters is the part.
2. **No highlight but a topic given:** find the passage on the page that best matches the topic (a section, paragraph, table, or code block) and use that. Quote its first few words when confirming so the user can check it.
3. **Pasted text** in the request is the part.
4. **Nothing usable** (no highlight, no topic, or the highlight couldn't be read, as in embedded frames, Chrome's PDF viewer, or Google Docs): say so in one line and suggest highlighting again, describing the part, or pasting it. Don't add anything.
5. **Confirm briefly:** `Added part 2: animation lengths ("Keep most UI transitions…"). Add more, or say "done" to save.`

## Steps

1. **Gather the content.**
   - **Page clip:** read the full text of the page in the current browser (title, URL, and main content). Ignore navigation, ads, cookie banners, footers, and comment sections. If the page is long or paginated, read all of it.
   - **Part clip:** use the collected parts. For each source page, also note its title in one line of context.

2. **Pick the destination.**
   - A `--to` flag decides the destination (see Destination flag).
   - "Save to Notion" or "put it in Notion" in words means the Notion destination, the same as `--to notion`.
   - If the user names Drive, a Drive folder, a Cowork project, or "this project" / "this repo" / "here", use that. "This project" only applies in Claude Code; in Cowork it means the current Cowork project.
   - If the session is already running inside a Cowork project and the user didn't mention Drive, use that project.
   - **In Claude Code, the default is This project** (the folder the session is working in). Use Drive there only when the user asks for it ("save to Drive", "put it in Browser Research").
   - Everywhere else, default to Google Drive in a folder named `Browser Research`.
   - **Check for an existing clip of this page** (page clips only; part clips skip this, since saving several parts of one page is expected):
     - Drive: search for `fullText contains '<page URL>'` (strip tracking parameters such as `utm_*` first, and escape single quotes). Keep only results inside the destination folder or its category subfolders.
     - Cowork project or This project: search `browser-research/` for the URL.
     - Notion: query the destination database for pages whose **Source** property equals the URL.
     - If a match exists, tell the user the existing clip's title, date, and link, then ask: save an updated copy, or skip. If they don't answer, save the updated copy.
     - An updated copy keeps the same category and tags unless the content clearly changed, and adds a `**Supersedes:** <link or path to the old clip>` line under **Tags**. Never edit or delete the old clip.

3. **Write the summary** in Markdown.

   **Page clip:**

   ```markdown
   # <Page title>

   **Source:** <URL>
   **Saved:** <today's date, YYYY-MM-DD>
   **Category:** <one category from step 4>
   **Type:** <article | docs | video | webinar | tutorial | release-notes | repo | tool | other>
   **Tags:** #<tag> #<tag> #<tag>
   **Note:** <the user's note — only if given>

   ## TL;DR
   <2–3 sentences: what this page is and why it matters>

   ## Key points
   - <5–8 bullets, each one specific fact, idea, or claim>

   ## Notable details
   - <code snippets, numbers, APIs, dates, or names worth keeping — omit section if none>

   ## Takeaways
   - <1–3 bullets on how this could be used or what to follow up on>
   ```

   **Part clip:**

   ```markdown
   # <Topic that ties the parts together>

   **Source:** <URL>   (one per line if parts come from several pages)
   **Saved:** <today's date, YYYY-MM-DD>
   **Category:** <one category from step 4>
   **Type:** <type of the main source page>
   **Tags:** #<tag> #<tag> #<tag>
   **Note:** <the clip-level note — only if given>
   **Scope:** <N> parts from <M> page(s)

   ## TL;DR
   <2–3 sentences: what these parts add up to>

   ## Parts

   ### 1. <part note, or a short topic if there's no note>
   *From [<page title>](<URL>)*
   **Note:** <part note — only if given>
   - <2–4 bullets summarizing this part, keeping specific numbers, names, and code>

   ### 2. …

   ## Takeaways
   - <1–3 bullets on how the parts fit together or what to follow up on>
   ```

   Rules:
   - Paraphrase in your own words. Quote only short phrases (under 15 words) when exact wording matters.
   - Keep page clips under ~400 words and part clips under ~150 words per part, unless the user asks for more depth.
   - For technical content (docs, release notes, tutorials), keep code examples short. Write any JavaScript as type-safe TypeScript.

4. **Categorize it** so clips are easy to find later.
   - **Category:** pick exactly one from this list. Use the name exactly as written, since it's also the subfolder name.
     - `AI & Agents`: models, prompting, Claude, agents, MCP, skills
     - `Design Engineering`: UI/UX, design systems, CSS, prototyping, accessibility
     - `Frontend Dev`: Astro, React, TypeScript, build tools, performance
     - `Tools & Workflow`: apps, productivity, dev tooling, automation
     - `Content & Writing`: blogging, newsletters, social media, writing craft
     - `Business & Career`: product, marketing, hiring, freelancing
     - `Other`: anything that doesn't fit; mention it so the user can add a category
   - **Folder names:** in Drive, the category name is used as-is (`AI & Agents`). In local folders (Cowork project or This project), use its kebab-case form: `ai-agents`, `design-engineering`, `frontend-dev`, `tools-workflow`, `content-writing`, `business-career`, `other`. The **Category:** line in the clip always uses the readable name.
   - **Type:** the kind of page (article, docs, video, webinar, tutorial, release-notes, repo, tool, other).
   - **Tags:** 3–6 lowercase, kebab-case tags with a `#` prefix (for example `#cowork #prompting #claude-opus`). Prefer specific names (products, libraries, techniques) over generic words. Reuse existing tags when they fit: if possible, look at a few recent clips in the destination and match their spelling instead of inventing near-duplicates.
   - If the user gives a category or tags, use theirs.

5. **Name the file** `<yyyy-mm-dd>-<short-kebab-title>` (kebab-case, max ~60 characters). For a part clip, base the name on the topic tying the parts together.

6. **Save it** into a subfolder named after the category (for example `Browser Research/AI & Agents/`).

   **Google Drive**
   - Find the destination folder: search Drive for a folder with that exact title (`mimeType = 'application/vnd.google-apps.folder'`, owned by the user, not trashed). If several match, ask which one. If none exist, create it in My Drive.
   - Inside it, find or create the category subfolder the same way (search with `parentId` set to the destination folder).
   - Check for a file with the same title in the category subfolder. If one exists, add `-2`, `-3`, and so on. Never overwrite.
   - Upload the summary into the category subfolder with `contentMimeType: text/markdown`, letting Drive convert it to a Google Doc so headings and lists render. If the user asked to keep raw Markdown, set `disableConversionToGoogleType: true` and add `.md` to the title.
   - If the Drive connector isn't available or the upload fails, say so and use the fallback below.

   **Cowork project**
   - Confirm you can reach the project's folder on the user's computer. If you can't (desktop app closed, asleep, or not connected), tell the user in one line to open the Claude desktop app and use the fallback below.
   - Save to `browser-research/<category-folder>/` in the project's first folder, creating folders as needed, as `<name>.md`. If the name is taken, add `-2`, `-3`, and so on. Never overwrite.

   **This project** (Claude Code)
   - Save to `browser-research/<category-folder>/` under the session's working directory, creating folders as needed, as `<name>.md`. If the name is taken, add `-2`, `-3`, and so on. Never overwrite.
   - If the working directory is a git repository, don't commit or stage anything; mention that the clip is a new untracked file so the user can decide whether to commit it or add `browser-research/` to `.gitignore`.

   **Notion**
   - **Find the database.** Search Notion for a database titled `Browser Research` (or the name the user gave). If several match, ask which one.
   - **No database yet:** ask once where to create it ("Which Notion page should hold your Browser Research database?"), then create it there with these properties:

     | Property | Type | Values |
     |---|---|---|
     | Name | title | the clip title |
     | Category | select | the seven categories from step 4, readable names |
     | Type | select | article, docs, video, webinar, tutorial, release-notes, repo, tool, other |
     | Tags | multi-select | tags without the `#` |
     | Note | text | the user's note, if any |
     | Source | URL | the page URL (first one for multi-page part clips) |
     | Saved | date | today |
     | Scope | text | `selection` or `N parts from M pages`, if any |
     | Supersedes | URL | link to the older clip, if any |

     If the database exists but is missing a property, add it rather than failing; never rename or delete the user's existing properties.
   - **Create the page** in that database. Fill the properties from the clip's header lines, and put the summary body (from `## TL;DR` down) in the page content as Markdown. Leave the header lines out of the body, since the properties carry them. Don't put clips in category subfolders; the Category property does that job.
   - **Duplicates:** never edit or delete an existing page. An updated copy is a new page with **Supersedes** set.
   - Confirm with the page link and the database name.

   **Fallback:** give the user the Markdown file and say plainly where it was *not* saved. Never claim a save that didn't happen.

7. **Confirm** in one or two sentences: where it was saved (folder, category, and file name with its link, or project and path), the tags, and a one-line TL;DR. Don't repeat the full summary. After a part clip saves, clear the collected parts. If you made an assumption about intent or details, say it in a few words.

## Clip index (on demand)

The clips themselves are the index: each one carries its source URL, date, category, type, tags, and notes. There is no separate index file to keep in sync.

When the user asks to find or list clips ("show my clip index", "what did I save about Cowork?", "list my #prompting clips", "clips from this week"):

1. **Gather.**
   - Drive: find the `Browser Research` folder and its category subfolders, then search inside them. Use `parentId` to list a category, `fullText contains '<tag or keyword>'` for tags, topics, and notes, and `createdTime` for date ranges. Page through all results.
   - Cowork project or This project: search `browser-research/` recursively.
   - Notion: query the `Browser Research` database, filtering on its properties (Category, Tags, Saved date) or searching page text. When the user asks for their index and uses Notion, also link the database itself, since it's a live, filterable index.
   - Search wherever this surface saves by default (in Claude Code, the project's `browser-research/` folder; elsewhere, Drive). Include the other location when the user asks for it or names it.
2. **Read metadata.** For each clip, take the title, date, category, type, tags, note (if any), scope (if any), and source URL from its header lines. Read only what's needed; skip the body unless the question is about content.
3. **Return a table** sorted newest first with these columns: Date, Title (linked to the clip), Category, Type, Tags, Note, Source. Mark part clips with "(N parts)" after the title. Leave Note blank for clips without one. Apply whatever filter the user asked for, and give a count at the top. For more than ~25 rows, show the newest 25 and say how many more there are.
4. If a clip has no metadata lines (saved before categories existed), list it as `Uncategorized` and offer to categorize it by saving an updated copy.

### Snapshot sheet

Notion users already have a live index in the database; offer its link first. If the user still wants a spreadsheet ("make me an index sheet"), build the table above for all clips and create a **new** Google Sheet in `Browser Research` titled `Clip Index <yyyy-mm-dd>`. Upload it as CSV (`contentMimeType: text/csv`) so Drive converts it to a Sheet, with the columns Date, Title, Category, Type, Tags, Note, Source URL, Clip link. Tell the user it's a point-in-time snapshot: it won't update itself, and they can ask for a fresh one anytime. Never try to edit an existing index sheet.

## Edge cases

- **Paywalled or sign-in pages:** summarize only what's visible and say so.
- **PDFs or videos in the tab:** summarize the text or transcript if readable; otherwise tell the user what couldn't be read.
- **Several tabs at once:** if the user groups tabs and says "save these pages", write one page clip per tab, or one combined clip if they ask for it.
- **Session ended mid-collection:** collected parts exist only in the conversation. If the user comes back in a new session asking about unsaved parts, say they weren't saved and offer to start again.
