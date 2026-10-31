# Gleaner, a web clipper for Claude and ChatGPT

**Gather the best of what you read into tagged, searchable clips.**

Gleaner is a Claude plugin for the Chrome side panel and the Claude Code desktop browser, and its skills also work from ChatGPT's connected Chrome tabs and Work browser. Ask it in plain language to keep a page or a YouTube video, or just the parts that matter, and it writes a short, structured summary, tags it, files it by category, and hands it to you as a Markdown file in ChatGPT or an HTML file in Claude, or saves it to Google Drive, Notion, a Cowork project, your Claude Code project, or a private claude.ai artifact. Later, ask what you saved there and it finds it. Shared local-first preferences manage save destinations and formats with optional Google Drive sync.

```text
You:     grab the part about animation lengths, for the motion post
Gleaner: Added part 1: animation lengths ("Keep most UI transitions…"). Add more, or say "done" to save.
You:     and this table too
Gleaner: Added part 2: this table ("Duration by element size…").
You:     done
Gleaner: Here's "Motion timing guidelines" as an HTML file, filed under Design Engineering
         #motion #animation #css-transitions — two parts on picking durations by element size.
```

---

## Contents

- [Features](#features)
- [Skills](#skills)
- [ChatGPT marketplace](#chatgpt-marketplace)
- [Install](#install)
- [Quick start](#quick-start)
- [Shared preferences](#shared-preferences)
- [Usage guide](#usage-guide)
  - [Saving a whole page](#saving-a-whole-page)
  - [Saving parts of pages](#saving-parts-of-pages)
  - [Saving answers](#saving-answers)
  - [Saving YouTube videos](#saving-youtube-videos)
  - [Adding notes](#adding-notes)
  - [Choosing where clips go](#choosing-where-clips-go)
    - [Saving to Notion](#saving-to-notion)
    - [Saving as an artifact](#saving-as-an-artifact)
    - [The `--to` flag](#the---to-flag)
  - [Categories and tags](#categories-and-tags)
  - [Finding your clips](#finding-your-clips)
  - [Index spreadsheet](#index-spreadsheet)
  - [Bookmarks file](#bookmarks-file)
  - [Following up on a clip](#following-up-on-a-clip)
  - [Using Gleaner in Claude Code desktop](#using-gleaner-in-claude-code-desktop)
- [Phrase cheat sheet](#phrase-cheat-sheet)
- [What a clip looks like](#what-a-clip-looks-like)
- [How Gleaner decides](#how-gleaner-decides)
- [Limitations](#limitations)
- [Troubleshooting](#troubleshooting)
- [Customizing](#customizing)
- [Repository layout](#repository-layout)
- [Local development and validation](#local-development-and-validation)
  - [Releasing](#releasing)
- [License](#license)
- [Changelog](#changelog)

---

## Features

- **Plain-language requests.** "Keep this article," "grab the bit about easing," "done": no commands to memorize.
- **Whole pages or just the good parts.** Highlight text, or describe a section and Gleaner finds it. Collect parts across tabs and sites, then save them as one clip.
- **Answers too.** Ask Claude about what you're reading, then say "save that" to keep the answer, with its steps and code intact, on its own or alongside parts.
- **YouTube videos too.** Save a video as a summary built from its transcript, read from YouTube's own transcript panel in your Chrome, or else from its description, with its channel, its useful links, and key moments that link to the exact second. Clip just the moments that matter, or paste the transcript where the panel can't be read.
- **Your reasons, kept.** Add a note to any request ("…for the motion post") and it's saved with the clip. Gleaner never invents notes.
- **Organized automatically.** Every clip gets a category (used as its folder), a type, and 3–6 specific tags, reusing your existing tag spellings.
- **One clip per page.** In a session, saving or adding more from a page you've already clipped updates that clip instead of starting a new doc. A page clipped in an earlier session gets an updated copy that links to the original; clips from earlier sessions are never changed or deleted.
- **Search by asking.** "What did I save about Cowork?" returns a sortable table. Ask for a spreadsheet snapshot whenever you want one. Every save tags its chat with a plain `Gleaner clip` line, so where your host can search past conversations, a search can also point you to the chat a clip was kept in.
- **Next steps, suggested.** Ask "what should I follow up on?" and Gleaner suggests three next steps drawn from a clip's note, takeaways, and links, then saves them to the clip.
- **In the chat, or stored where you choose.** Gives you each clip as a Markdown file in ChatGPT or an HTML file in Claude by default, or saves it to Google Drive, a Notion database, a private claude.ai artifact, a Cowork project folder, or, in Claude Code, straight into the project you're working on.
- **Your defaults, remembered.** Pick a destination and format once with `/gleaner:preferences setup`, override them for a project or a single save, and optionally sync them across devices through Google Drive.
- **Works where you browse.** The Chrome side panel, the built-in browser in Claude Code desktop, or ChatGPT's connected Chrome tabs and Work browser. Hand it a URL and it opens or fetches the page for you.

## Skills

Gleaner includes four skills: two share the clip format and saving workflow, one suggests what to do next with a saved clip, and one manages reusable preferences:

| Skill | Claude Code command | Use it for |
| --- | --- | --- |
| [glean](plugins/gleaner/skills/glean/SKILL.md) | `/gleaner:glean` | Save pages, collect passages, keep answers, and find saved clips |
| [youtube](plugins/gleaner/skills/youtube/SKILL.md) | `/gleaner:youtube` | Save videos from their transcript or description, with channel and timestamped key moments |
| [preferences](plugins/gleaner/skills/preferences/SKILL.md) | `/gleaner:preferences` | Shared destinations, formats, setup, and sync |
| [follow-up](plugins/gleaner/skills/follow-up/SKILL.md) | `/gleaner:follow-up` | Suggest three follow-ups for a saved clip and save them to it, or ask what you want to do next |

Use plain-language requests or invoke a command directly in Claude Code. The `youtube` skill uses `glean` for destinations, tags, duplicate checks, and saving. See the [skills usage guide](plugins/gleaner/skills/README.md) for examples.

## ChatGPT marketplace

Gleaner uses the same GitHub marketplace manifest for Claude and ChatGPT. In ChatGPT workspaces that support GitHub marketplace imports, import `https://github.com/shawn-sandy/gleaner` from the workspace's Plugins settings. The root manifest registers all four skills (`glean`, `youtube`, `preferences`, and `follow-up`) through the Gleaner plugin. Browser and Google Drive access must be connected separately; importing the plugin does not grant them.

See [ChatGPT marketplace setup and compatibility](docs/chatgpt-marketplace.md) for installation, supported browser surfaces, limitations, and a manual test checklist. ChatGPT marketplace import requires verification in an eligible workspace.

## Install

**Requirements**
- A paid Claude plan with the new Chrome side panel (the Cowork-style panel; its three-dot menu shows "Switch back to classic") or Claude Code.
- Using ChatGPT instead? See [ChatGPT marketplace](#chatgpt-marketplace).
- *Optional:* the **Google Drive** connector, for saving to Drive and syncing preferences.
- *Optional:* the Claude desktop app, open and connected, for saving to Cowork projects.
- *Optional:* the **Notion** connector, for saving to Notion.
- *Optional:* a session that can publish artifacts, such as Claude Code, for saving clips as artifacts.

See [Gleaner requirements](docs/requirements.md) for the full list by surface, destination, and skill.

### Claude app and Cowork

1. Open **Customize → Plugins**, then choose **Add → Add marketplace**.
2. Enter `shawn-sandy/gleaner`.
3. Find **Gleaner** in the marketplace and install it. It's available in the Chrome side panel right away.

### Claude Code

```text
/plugin marketplace add shawn-sandy/gleaner
/plugin install gleaner@shawn-sandy
```

Or from your shell:

```bash
claude plugin marketplace add shawn-sandy/gleaner
claude plugin install gleaner@shawn-sandy --scope user
```

In Claude Code the skills are also available as `/gleaner:glean`, `/gleaner:youtube`, `/gleaner:preferences`, and `/gleaner:follow-up`.

### Claude Code desktop

1. Click **+** next to the prompt box, then **Plugins → Add plugin**.
2. Add the marketplace `shawn-sandy/gleaner` and install **Gleaner**.

A plugin installed from the terminal at user scope also appears in the desktop app's local sessions, and the reverse. If Gleaner doesn't respond right away, run `/reload-plugins`.

### Upgrading from clip to glean

Version 2.0.0 renames the `clip` skill to `glean`. Replace `/gleaner:clip` with `/gleaner:glean` in saved prompts and shortcuts; the old command is no longer available. Customizations now live in `plugins/gleaner/skills/glean/SKILL.md`.

The plugin is still named **Gleaner**, and saved items are still called **clips**. Existing clips, natural-language requests such as "save this page," and `/gleaner:youtube` are unchanged. After updating the plugin in Claude Code, run `/reload-plugins` if the new command is not available.

### Upgrading from page-to-project

If you installed the earlier **page-to-project** skill, remove it so the two don't compete for the same requests.

## Quick start

1. Open any article in Chrome.
2. Open the Claude side panel and say **"save this page."**
3. In ChatGPT, Gleaner shows the full clip directly in the conversation and includes a separate Markdown (`.md`) download when attachments are supported. In Claude, it gives an HTML (`.html`) file, its tags, and a compact preview; without attachments, it gives the clip as one Markdown code block. ChatGPT without attachments still shows the full readable clip inline once and says no file was attached.
4. Download the file, or copy the clip from the conversation, to keep it. To store a copy, say "save to Drive". To store every clip somewhere, set a default with `/gleaner:preferences setup`.

That's it. Everything below is optional.

---

## Shared preferences

Use `/gleaner:preferences setup`, `show`, `update`, `reset`, or `sync`, or ask naturally:

```text
set up my save preferences
always save here
use markdown by default
show my preferences
reset my project format override
sync my preferences
save this page here
```

Gleaner doesn't stop your first save to ask about setup, because its default, the chat, needs nothing stored; it mentions setup once instead. Run `/gleaner:preferences setup` to choose a default destination, format (left unset by default, so chat clips are Markdown in ChatGPT and HTML in Claude, and stored clips are Markdown wherever the destination supports it), and optional Drive sync. Choose “just this save” to continue with session settings and the existing environment defaults. Setup verifies an existing destination; it does not move clips or create research databases. “Always save here” persists at user scope; “save this here” and `--to` apply to that save only. Explicit project or session requests use that scope. Reset removes an override so the next default applies.

User preferences live at `$XDG_CONFIG_HOME/agent-preferences/preferences.yaml`, falling back to `~/.config/agent-preferences/preferences.yaml`. Project overrides live at `.agent-preferences/preferences.yaml` under the session project root. Resolution is explicit request (`--to` beats words), session, project, user, then existing skill defaults. Show reports each effective value and its scope, persistence location, and sync status. Page and YouTube saves use the same resolved preferences.

`auto` gives each destination's native output: Markdown chat files in ChatGPT, HTML chat files in Claude, or Google Docs in Drive. `markdown` requests a raw `.md` file for the chat, local/Cowork, or a Drive connector supporting raw uploads. Notion pages and HTML artifacts are incompatible; Gleaner explains and asks before saving. Saved local paths are device-specific: an unreachable path prompts for a temporary alternative and never changes the permanent default silently.

Optional sync uses one Google Drive document titled `Agent Preferences`, discovered before creation and selected by you if duplicates exist. Only user preferences synchronize; project overrides and local `sync-state.yaml` metadata never upload. Before saves and during preference invocations, Gleaner compares local/cloud values with the last verified snapshot, propagates one-sided changes, merges independent settings, and asks about conflicting settings. Different existing copies without a baseline require reconciliation before upload. Updates persist locally first, then synchronize when connected; failures remain pending for the next invocation. There is no background service.

Cloud writes require read/update capabilities, a fresh remote check, and readback verification. Connectors without conditional writes cannot fully prevent a simultaneous edit between check and write. Hosts without local files can use Drive as their persistent store; with neither store writable, preferences are clearly labeled session-only. Invalid YAML and unsupported schema versions remain untouched; session settings can continue the save.

See the [shared contract and examples](plugins/gleaner/skills/preferences/references/contract.md) and [maintainer acceptance scenarios](docs/preferences-testing.md). Static fixtures check packaging and examples, not live synchronization reliability.

## Usage guide

### Saving a whole page

Mention the page, article, or doc, or just say "save this" with nothing highlighted.

> save this page
> keep this article for later
> bookmark this doc

Every successful save also shows a readable bookmark preview in the conversation. ChatGPT, including mobile, shows the full clip as rendered Markdown with its links, notes, and follow-up prompt; a Markdown attachment is a separate download, so reading the clip does not require opening a file. Claude Code and other agents keep the compact Overview, Key details, Why it matters, metadata, and verified links layout. Claude also supplies HTML companions where supported; ChatGPT supplies HTML only when requested or when updating a clip with retained HTML. An explicit HTML download request applies to that save only. See [bookmark previews](docs/bookmark-previews.md) for same-bookmark examples, optional preview suppression, and host limitations.

Gleaner reads the whole page, skips navigation, ads, and comments, and writes a plain-language summary of up to ~400 words: a TL;DR, key points, notable details (code, numbers, names), and takeaways. Technical terms are explained the first time they appear, and each key point is a full sentence that says why it matters. When the TL;DR alone can't explain the main idea, a short **How it works** paragraph follows it. A tutorial gets numbered **Steps** in place of key points.

An article split across numbered pages (page 2, page 3, …) is read to the end, up to five pages, and saved as one clip that says how many pages it covers. This needs a browser Gleaner can run a script in: the Chrome side panel, the Claude Code desktop browser, Claude in Chrome, or ChatGPT's Work browser when it has a JavaScript tool.

### Saving parts of pages

Use parts when only some of a page matters, or when you're pulling related bits from several pages into one clip.

**1. Add parts.** Highlight text and say "add this," or describe the part and let Gleaner find it:

> add this
> grab the part about animation lengths
> keep this section too
> and this table

A described part starts from the page heading that matches it, when there is one. You don't need to highlight anything for a described part, and where highlights can't be read, describing or pasting the part is the way to add it. A highlight counts when it's about 40 characters or more.

Each part is confirmed with its first few words so you can check it's the right one, and nothing is saved yet:

> **Gleaner:** Added part 1: animation lengths ("Keep most UI transitions…"). Add more, or say "done" to save.

**2. Adjust if needed.**

> what have I got so far?
> drop the second one
> change part 1's note to "easing defaults"
> start over

**3. Save.**

> done
> save them
> that's it, wrap it up

Any one of these works on its own. All parts are saved as one clip, grouped under headings with a link to each source page, and a **Scope** line counts them, such as `3 parts from 2 pages`.

#### Collecting across tabs and sites

Parts can come from different tabs and sites: collect from three articles, then save once. Collected parts live in the conversation, not in a tab, and each "add this" reads the tab you're on at that moment, so switch tabs, add, and switch again. How you point at the next page depends on where you run Gleaner:

| Where you run Gleaner | Across tabs | How to add from another page |
| --- | --- | --- |
| Chrome side panel | Yes | Switch to the tab, highlight or describe the part, and say "add this". |
| Claude Code desktop, built-in browser | Yes | Switch tabs in the Browser pane; Gleaner reads the active tab. |
| ChatGPT, connected Chrome tabs | Yes, without highlights | Switch tabs and describe the part ("grab the part about easing") or paste it; highlights can't be read there. |
| ChatGPT Work browser | Yes | Open the next page in the Work browser. Highlights work only when the session has its JavaScript tool; otherwise describe or paste the part. |
| Claude in Chrome (Claude Code with `--chrome`, or Cowork) | By URL | Gleaner works in tabs it opens itself, so it can't see what you highlighted in your own tabs. Give it the page's URL and describe the part. |

Keep the same conversation open while you collect: switching tabs is fine, but starting a new session drops the unsaved parts.

> **Already saved this page?** In the same session, "add this bit too" goes straight into that clip and saves it, so a page never ends up split across several docs. Say "as a new clip" to start a separate one.

> **Heads up:** Collected parts live in the side panel conversation until you save. Close the session first and they're gone.

### Saving answers

Ask Claude about the page you're reading, such as a clarification, a list of steps, or more detail on one topic, then save the answer:

> how do I rotate an API key in these docs?
> save that
> explain the auth flow and save it

"Save that" right after an answer saves the answer and says so; say "save the page" if you meant the whole page. While you're collecting parts, an answer is added as another part instead, and "done" saves them together. If you already saved the page this session, the answer is added to that clip:

> add that answer
> save our back-and-forth about webhooks

An answer is kept as given, not summarized, so numbered steps and code survive. It's headed by your question, links the page it was about, and marks anything that didn't come from the page "(not from the page)", so the clip never passes off Claude's background knowledge as the source's.

Answers live in the conversation like parts do. Gleaner can't save an answer from an earlier session; ask the question again instead.

### Saving YouTube videos

On a YouTube video, ask the same way you would for a page, or pass a link:

> save this video
> clip this talk, for the motion post
> save https://youtu.be/… to Notion

Gleaner reads the video's transcript from YouTube's own **Show transcript** panel when the browser allows it, and its description, and writes the same plain-language summary as a page clip, with **key moments** from the transcript, or the video's chapters without one, that each link to the second they start, in place of key points. A **Channel** line names and links the channel, and a **Video** line records the publish date, length, and what the summary was written from. A **Links** section keeps the description's useful links, such as docs and repos, and leaves out sponsor, social, subscribe, merch, and shortened links.

With a transcript, collect moments as parts by time or topic:

> keep 3:10 to 5:40
> grab the part about generics
> add this part *(the chapter you're watching, or the last minute or so)*

Gleaner opens and reads the transcript panel itself in your own Chrome: the Chrome side panel or Claude in Chrome. YouTube sends the panel empty to the Claude Code built-in browser, even when you're signed in there, so Claude Code reads the transcript through Claude in Chrome when it's connected, or else through the Playwright browser tools if the session has them, which keep their own logs in a `.playwright-mcp` folder where Claude Code runs. Otherwise the clip is written from the description and chapters, and you can paste the transcript (**…more → Show transcript** on YouTube), before or after saving, for a fuller summary with moments from the whole video. In ChatGPT, the Work browser opens the panel itself when it can click; with connected tabs, Gleaner asks you to open **Show transcript** in the video's tab and reads the lines from there. If a video has no description and no transcript, Gleaner asks for a short description, which is optional; say "skip" to save it from the title alone. Parts need the transcript, so without one Gleaner won't save a part; it asks you to paste the transcript and offers a clip of the whole video instead.

In ChatGPT, including mobile, if video content cannot be read, Gleaner asks before saving: paste a description or transcript for a summary, or say "save link only" for an explicitly unsummarized bookmark. An accessible description still produces a summary when the transcript is unavailable. Pasted text works without a desktop browser or another attempt to fetch the video. Content supplied later updates a clip from the same conversation at its existing destination; replacing a chat attachment gives a revised file with the same name, and a storage operation that requires another copy is explained before proceeding. Clips from earlier conversations are never overwritten.

Any link to a video (`youtu.be`, Shorts, a share link) is saved with the same **Source**, `youtube.com/watch?v=…`, so the duplicate check catches a video you've already clipped. A link with a timestamp opens the player at that time, so "add this part" uses that position.

### Adding notes

A note is your reason for saving. Add it anywhere in the request:

| You say | Note saved |
| --- | --- |
| save this page, good intro to view transitions | good intro to view transitions |
| grab the part about animation lengths | animation lengths |
| grab the part about easing, for the motion post | easing — for the motion post |
| done, for the FrontendEngine timing article | for the FrontendEngine timing article *(whole clip)* |

Notes are searchable and show up in your clip index. If you don't give one, the clip simply has no note; Gleaner never asks for one or writes one for you.

### Choosing where clips go

| Destination | How to choose it | Needs |
| --- | --- | --- |
| **This conversation** → `.md` in ChatGPT, `.html` in Claude (`.md` in either with the `markdown` format) | Default everywhere; "just give me the file", or `--to chat` | Nothing |
| **Google Drive** → `Browser Research/<category>/` | "save to Drive", or `--to drive` | Google Drive connector |
| Another Drive folder | "save to my Research folder" | Google Drive connector |
| **Cowork project** → `browser-research/<category>/` | "save to my Serve513 project", or "this project" inside Cowork | Claude desktop app open and connected |
| **This project** → `browser-research/<category>/` | "save it to this project", or `--to local` in Claude Code | A Claude Code session |
| **Notion** → `Browser Research` database | "save to Notion", or `--to notion` | Notion connector |
| **Artifact** → a private page on claude.ai | "save it as an artifact", or `--to artifact` | A session that can publish artifacts, such as Claude Code |

Folders are created the first time they're needed. Stored clips are saved as Markdown (`.md`) files, in Drive too. Say "save it as a Google Doc" for a Doc instead, or set your default format to `auto` to get Docs whenever Drive can convert them (otherwise `auto` saves `.md` too). Notion and artifact clips keep their own formats, and a Drive connector that can't upload raw files saves Google Docs.

`Browser Research` is the folder default when Drive is selected without a configured folder or an explicit folder name. Connecting Drive alone keeps the chat default; saved destination preferences and per-save requests still take precedence.

A clip in the conversation isn't stored anywhere, so a follow-up in a later session can't read it. Download or copy it, or name a stored destination. The chat itself is tagged, though, so where your host can search past conversations a later search can point you back to it (see [Finding your clips](#finding-your-clips)).

If a destination can't be reached, Gleaner gives you the clip as a file and says plainly that it wasn't saved. It never claims a save that didn't happen.

> Gleaner can't write to claude.ai Projects. Cowork can read them but not add files to them.

#### Saving to Notion

Connect the **Notion** connector, then say "save to Notion" or add `--to notion`. Each clip becomes a page in a **Browser Research** database, with its details as real database properties:

| Property | Holds |
| --- | --- |
| Name | clip title |
| Category, Type | select fields |
| Tags | multi-select (no `#`) |
| Note | your note |
| Source | page URL |
| Saved | date |
| Scope, Supersedes | for part clips and updated copies |

The first time, Gleaner asks which Notion page should hold the database and creates it there. After that, the database *is* your clip index: filter by tag, group by category, or sort by date right in Notion, and it's always up to date. Use `--to notion:"Other Database"` to save somewhere else.

#### Saving as an artifact

Say "save it as an artifact" or add `--to artifact`. Each clip becomes its own artifact: a private web page on claude.ai with the clip's details (source, date, category, type, tags, note) at the top and the summary below, readable in light or dark mode and on a phone. It stays private until you share it. Each new clip is a new artifact. Adding to a clip later in the same session republishes its artifact at the same link; Gleaner never republishes over a clip from an earlier session.

This needs a session that can publish artifacts, such as Claude Code. Where it can't, Gleaner says so and gives you the clip as a file.

Artifacts have no folders, so the category is listed on the page. To find artifact clips, name them in the request ("what did I save to artifacts about motion?"). Gleaner opens your artifacts one by one to pick out its clips, so it checks about 50 per request and tells you if there are more.

#### The `--to` flag

For a quick, explicit override, add `--to` (or `-t`) to any request or to the slash command. It applies to that save only.

```text
save this page --to drive
grab the part about easing -t local
/gleaner:glean --to ./notes
save https://example.com/article --to drive:"Design Inspiration"
keep this article --to artifact
done --to cowork:Serve513
```

| Flag | Saves to |
| --- | --- |
| `--to chat` | A `.md` file in ChatGPT or `.html` in Claude (`.md` in either with the `markdown` format), not stored |
| `--to drive` | Drive → `Browser Research/<Category>/` |
| `--to drive:"Folder Name"` | Drive → `<Folder Name>/<Category>/` |
| `--to notion` | Notion → `Browser Research` database |
| `--to notion:"Database Name"` | Notion → that database |
| `--to artifact` | A new private artifact on claude.ai |
| `--to local` | Your working folder → `browser-research/<category>/` |
| `--to cowork:"Project Name"` | That Cowork project → `browser-research/<category>/` |
| `--to <path>` | Any local folder, like `./notes` or `~/Documents/research` → `<path>/<category>/` |

A flag beats a destination you describe in words, followed by session, project, user preferences, and the environment default. If the flagged destination can't be reached, Gleaner tells you rather than quietly saving somewhere else.

### Categories and tags

Each clip gets exactly one **category**, which is also its folder:

| Category | Covers |
| --- | --- |
| AI & Agents | models, prompting, Claude, agents, MCP, skills |
| Design Engineering | UI/UX, design systems, CSS, prototyping, accessibility |
| Frontend Dev | Astro, React, TypeScript, build tools, performance |
| Tools & Workflow | apps, productivity, dev tooling, automation |
| Content & Writing | blogging, newsletters, social media, writing craft |
| Business & Career | product, marketing, hiring, freelancing |
| Other | anything else (Gleaner will mention it) |

In Drive, folders use the names above. In local folders, they use kebab-case: `browser-research/ai-agents/`, `browser-research/design-engineering/`, and so on.

It also gets a **type** (article, docs, video, webinar, tutorial, release-notes, repo, tool, other) and **3–6 tags** like `#view-transitions` or `#claude-opus`. Gleaner checks your recent clips and reuses existing tag spellings to avoid near-duplicates.

Override anything in the request:

> file this under design
> tag it motion and css

### Finding your clips

Ask in plain language:

> what did I save about Cowork?
> show my #prompting clips
> clips from this week
> anything on view transitions?
> show my clip index

You get a table, newest first: date, title (linked), category, type, tags, note, and source. Multi-part clips are marked with their count, such as "(3 parts)," "(2 parts, 1 answer)," or "(whole page + 2 parts)." Keyword searches match titles, tags, notes, and summary text.

Every reply that saves or updates a clip also carries one plain line that tags the chat, such as `Gleaner clip · 2026-10-19 · Motion timing guidelines · Design Engineering · #motion #animation #css-transitions · https://example.com/motion-timing`, and every search carries `Gleaner search · <what you asked for>`. Where your host lets Claude search past conversations (Claude Code desktop does; claude.ai does when its chat search is turned on), a search can also find the chats that hold a clip, including clips you kept in the conversation, and lists them marked "(chat)", linked to the conversation where your host gives a link. You can type `Gleaner clip` and a tag into your host's conversation search yourself, too. In Claude Code desktop, a conversation that began with a Gleaner request is named `Gleaner: <clip title>` after its first save, so it stands out in the sidebar.

You can also search directly in Google Drive: type a tag like `#motion` or a note phrase into Drive's search bar.

Clips saved as artifacts are searched only when you ask for them ("what did I save to artifacts about Cowork?"); see [Saving as an artifact](#saving-as-an-artifact).

### Index spreadsheet

> make me an index sheet

Creates a new Google Sheet, `Clip Index <date>`, in Browser Research with every clip as a row. It's a **snapshot**: it won't update itself, so ask for a fresh one whenever you need it. If your session's Drive connector, such as ChatGPT's, can't convert it to a Sheet, the index is saved as a `.csv` file instead. If you use Notion, you get the database link first, since it's already a live index; ask again if you still want the sheet.

### Bookmarks file

> export my gleans as bookmarks

Gives you `Gleaner Bookmarks <date>.html`, a file you can import into Chrome, Firefox, Safari, or Edge. Your clips land in a `Gleaner` folder, one subfolder per category, and each bookmark opens the page you clipped (or the clip itself, for an answer saved without a page). The file also holds each clip's tags, note, and a link back to the clip, but browsers may drop the note and link on import, and Chrome has no tags. Clips with no web link to open, such as an answer without a page saved only to a local folder, are left out, and Gleaner says how many.

Like the index sheet, it's a **snapshot**. Importing a newer file won't update the bookmarks you imported before. Clips kept only in a past conversation can't be found, so they can't be included.

### Following up on a clip

Ask right after a save, or point at any saved clip by link, path, or topic:

> what should I follow up on?
> suggest follow-ups for my view transitions clip

Gleaner reads the clip's TL;DR, note, content, and the links inside it, then suggests three follow-ups, each tied to something in the clip, such as reading a linked page, moving the post your note mentions forward, or comparing it with clips that share its tags. When the clip has too little to go on, it asks what you want instead of guessing. If your session lists a skill that turns a video or page into something, such as youtube-to-blog, one of the three may hand the clip to it, starting from the clip's source, summary, key moments, and links; with no such skill listed, Gleaner never suggests one.

The follow-ups are saved after the clip's Takeaways under a dated **Follow-ups** heading. A clip from an earlier session isn't edited: you get an updated copy that links to the original. Pick a follow-up and Gleaner starts on it; nothing else is saved unless you ask.

Every clip also ends with a ready-made prompt below a divider, so you can come back to it later: paste the line into a new chat to get follow-ups. It names the clip and where it's stored, or gives its file path for clips saved to a local folder. A clip given in the conversation isn't stored anywhere, so its prompt asks you to attach or paste the file instead. Clips saved inside your Claude Code project add a terminal command that starts Claude Code and sends the prompt:

```bash
claude 'Suggest follow-ups for my Gleaner clip at browser-research/frontend-dev/2026-10-19-view-transitions.md'
```

---

### Using Gleaner in Claude Code desktop

Claude Code desktop has a built-in browser pane, and Gleaner reads whatever tab is active there.

1. Open the Browser pane: **Cmd+Shift+B** (Mac) or **Ctrl+Shift+B** (Windows), or click **Browser** in the title bar.
2. Browse to a page, and highlight text if you want just a part.
3. In the prompt box, ask as usual: "save this page," "grab the part about easing," "done." Or type `/gleaner:glean`.

You can also skip the browsing and pass a link: **"save https://example.com/article"** opens it in the pane and clips it.

**Things to know:**
- **Separate sign-ins.** The pane has its own browser profile, apart from your Chrome. Sign in to paywalled or members-only sites in the pane once, and the login sticks.
- **Site approvals.** The first time Gleaner reads a new site, you'll be asked to allow it.
- **Clips come back in the chat.** In Claude Code, clips come back as an HTML file in the conversation. Say "save it to this project" (or add `--to local`) to save them to `browser-research/<category>/` in the folder Claude Code is working in. Gleaner never commits them; commit the clips or add `browser-research/` to `.gitignore`, your call.
- **Want Drive instead?** Say "save to Drive." Your claude.ai connectors carry over when you're signed in to Claude Code with your Claude account.

## Phrase cheat sheet

| Goal | Say something like |
| --- | --- |
| Save a whole page | "save this page" · "keep this article" · "bookmark this" |
| Save a highlight now | highlight, then "save this" |
| Collect a part | "add this" · "grab the part about X" · "this table too" |
| Save collected parts | "done" · "save them" · "wrap it up" |
| Save an answer | "save that" · "save those steps" · "add that answer" |
| Keep a separate clip | add "as a new clip" to any request |
| Review or fix parts | "what have I got?" · "drop part 2" · "start over" |
| Add a reason | add ", for …" or ", because …" to any request |
| Pick a folder | "…to my Research folder" · "…to my Serve513 project" · "…to this project" |
| Clip a link | "save https://…" |
| Save a YouTube video | "save this video" · "save https://youtu.be/…" |
| Save part of a video | "keep 3:10 to 5:40" · "grab the part about X" · "add this part" |
| Force a destination | add `--to chat`, `--to drive`, `--to notion`, `--to artifact`, `--to local`, or `--to ./path` |
| Pick a category | "file this under design" |
| Add tags | "tag it motion and css" |
| Find clips | "what did I save about X?" · "clips from this week" · "which chat did I save X in?" |
| Plan next steps | "what should I follow up on?" · "suggest follow-ups for that clip" |
| Spreadsheet | "make me an index sheet" |
| Browser bookmarks | "export my gleans as bookmarks" · "make me a bookmark list" |

## What a clip looks like

**Page clip**

```markdown
# Organize work with projects

**Source:** https://claude.com/docs/cowork/guide/projects
**Saved:** 2026-10-16
**Category:** AI & Agents
**Type:** docs
**Tags:** #cowork #claude-projects #local-files
**Note:** setting up page clipping

## TL;DR
…
## How it works
…
## Key points
…
## Notable details
…
## Takeaways
…

---

To get follow-ups, paste this into a new chat: …
```

Clips are written for a smart reader who is new to the topic: short sentences, technical terms explained the first time they appear, and key points as full sentences that start with a bold claim. **How it works** is optional: one short paragraph, added only when the TL;DR can't explain the main idea on its own. A tutorial gets a numbered **Steps** section in place of Key points, one action per step.

**Part clip** adds a `**Scope:** 2 parts from 1 page` line, and its body is a **Parts** section with one heading per part (titled by your note or topic), a link to its source, its own note, and 2–4 bullets.

**Answer** parts sit in the same Parts section, headed by your question, with the answer kept as given. The Scope line counts them separately, such as `2 parts, 1 answer from 1 page`. A clip of a single answer skips the TL;DR.

**A page clip you add to** in the same session keeps its summary and gains a Parts section before its Takeaways, with a Scope line such as `whole page + 2 parts`. Its TL;DR and Takeaways are rewritten to cover the new parts.

**Video clip** adds a `**Channel:**` line that links the channel and a `**Video:**` line (publish date, length, and what it was written from), and swaps Key points for **Key moments**, the video's chapters, each linking to its second in the video, and adds a **Links** section with the description's useful links. A video part's heading links to where it starts, such as `3:10–5:40`.

**A clip you follow up on** gets a `## Follow-ups` section after its Takeaways: a dated, numbered list for each round of suggestions, with earlier rounds kept as they were.

Files are named `yyyy-mm-dd-short-title`. If a name is taken, Gleaner adds `-2`, `-3`, and so on.

## How Gleaner decides

- **"Page," "article," "doc"** → the whole page, even if text is highlighted.
- **"Part," "bit," "section," "table," "the part about X"** → a part.
- **A plain "save this"** → saves your highlight or collected parts if there are any, otherwise the whole page.
- **"Save that" right after an answer** → takes the answer, even with text highlighted, and says so: it saves the answer, or adds it as the next part while you're collecting. "Save this page" still saves the page.
- **Highlights under ~40 characters** (a stray word) are ignored.
- **It acts when intent is clear**, with prompts for sync conflicts and unsupported formats, then tells you what it assumed: *"Saved the whole page — say 'just the highlighted part' if you meant only that."* It asks only when two readings are equally likely, or a named destination doesn't exist.
- **Same page, same session** → saves and parts from a page you've already clipped this session go into that clip, wherever it was saved, unless you name another destination or say "as a new clip". The URL decides, along with the main address the page names for itself: other pages on the same site get their own clips, except the later pages of an article the clip already read.
- **Duplicate check:** saving a page you clipped in an earlier session shows the earlier clip and offers an updated copy (marked "Supersedes" with a link) or skipping. It matches the page's address and the main address the page names for itself (its canonical URL, on the same site only), so a tracking or share link to an article you've clipped is caught too, and it tells you when the page says it changed after your clip. Part clips skip this check, and so do clips given in the chat, since nothing is stored to check.

## Limitations

- **One highlight at a time.** Chrome doesn't support multiple simultaneous selections; collect parts one by one instead.
- **Unreadable highlights.** Text inside embedded frames, Chrome's PDF viewer, and apps like Google Docs often can't be read. Describe the part or paste it instead.
- **Drive capabilities vary.** Adding to a Drive clip in the same session uploads the updated clip and moves the earlier version to Drive’s trash, so its link changes. Updates to older clips are new copies, and index sheets are snapshots. Preference sync needs a connector that can read and update the selected document; create-only connectors leave sync pending.
- **No claude.ai Projects.** Cowork can read them but not write to them.
- **ChatGPT without a JavaScript tool.** Connected Chrome tabs, and a Work browser without one, can't read highlights, the playback position, or the page facts Gleaner uses to follow an article's later pages and match its canonical URL. Name the part or paste it, and give a video part a time range or topic instead of "this part."
- **Artifact search is one page at a time.** Gleaner opens each artifact to find its clips, about 50 per request.
- **YouTube transcripts depend on the browser.** Gleaner reads the transcript from YouTube's **Show transcript** panel in your own Chrome (the side panel or Claude in Chrome), and in ChatGPT once the Work browser or you open the panel in the video's tab. YouTube sends the panel empty to the Claude Code built-in browser, so without Claude in Chrome or Playwright connected, video clips there are written from the description and chapters, or from a short description you give when there is none; paste the transcript (**…more → Show transcript** on YouTube) for a fuller summary or to clip parts. Private, members-only, and age-restricted videos need you signed in to YouTube in that browser.
- **Paywalls and sign-ins.** Only visible content is summarized, and the clip says so.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Claude Code says no page is open | Open the Browser pane (Cmd/Ctrl+Shift+B) and load the page, or include the URL in your request. |
| Clip is cut off at a login or paywall (Claude Code) | Sign in to the site inside the Browser pane once; it has its own logins, separate from Chrome. |
| Gleaner doesn't respond to "save this" | Check you're on the new side panel (not classic) and that Gleaner is enabled in your skills. |
| ChatGPT can't see the page | Connect your browser in ChatGPT, or switch to Work mode for the Work browser. Or include the URL or paste the text. |
| It saved the whole page instead of my highlight | Highlight again right before asking, or name the part: "grab the part about X." Some sites clear highlights when you click away. |
| Clip wasn't saved to Drive or my project | The default is a Markdown file in ChatGPT or an HTML file in Claude, delivered in the conversation. Say "save to Drive" (or "save it to this project" in Claude Code and Cowork) to store that clip, or set a default destination with `/gleaner:preferences setup`. |
| "Couldn't reach the project folder" | Open the Claude desktop app and make sure it's connected, then ask again. |
| Clip saved as a `.md` file, not a formatted Doc | Markdown is the default for stored clips. Say "save it as a Google Doc" for one Doc, or set your default format to `auto` to get Docs whenever Drive can convert them. |
| Similar tags like `#ai-design` and `#ai-designs` | Name the tag you want in the request ("tag it ai-design"). Gleaner reuses existing spellings by default, so this gets rarer as your library grows. |
| Can't find a clip you kept in the chat | Ask "which chat did I save X in?", or type `Gleaner clip` and a tag into your host's conversation search. Chat clips aren't stored, so only that conversation holds the file, and finding it needs a host that can search past conversations. |

## Customizing

Gleaner's behavior lives in [`plugins/gleaner/skills/glean/SKILL.md`](plugins/gleaner/skills/glean/SKILL.md), with video-specific steps (video details, Key moments and Links format) in [`plugins/gleaner/skills/youtube/SKILL.md`](plugins/gleaner/skills/youtube/SKILL.md). Common edits:

- **Default folder/destination/format:** use `/gleaner:preferences`; resolution and fallback defaults are in step 2 and the shared contract.
- **Categories:** edit the list in step 4 (names double as folder names).
- **Summary length:** adjust the word limits in step 3.

Fork this repo, make your edits in `plugins/gleaner/skills/glean/SKILL.md`, bump `version` in `plugins/gleaner/.claude-plugin/plugin.json`, run the [local checks](#local-development-and-validation), and add your fork as a marketplace.

## Repository layout

```text
gleaner/
├── .claude/
│   ├── settings.json               # hook: strict Claude validation after manifest or plugin edits
│   └── skills/
│       └── release/
│           └── SKILL.md            # /release: write the changelog entry, then npm run release
├── .claude-plugin/
│   └── marketplace.json            # marketplace "shawn-sandy"
├── .github/
│   └── workflows/
│       ├── auto-release.yml        # releases every plugin change merged to main: npm run release, push to main, run release.yml
│       ├── cut-release.yml         # run from the Actions tab: npm run release on main, then push release/X.Y.Z
│       ├── release.yml             # tags and publishes a GitHub Release when the version changes on main
│       └── validate.yml            # npm run validate and npm test on every pull request and push to main; warns on main when Unreleased bullets have no release coming
├── docs/
│   ├── artifacts/                  # HTML artifacts
│   ├── chatgpt-marketplace.md      # ChatGPT import, compatibility, and manual checklist
│   ├── plans/                      # planning notes
│   ├── preferences-testing.md      # maintainer-run preference scenarios
│   └── requirements.md             # what Gleaner needs, by surface, destination, and skill
├── plugins/
│   └── gleaner/
│       ├── .claude-plugin/
│       │   └── plugin.json         # plugin manifest (version lives here)
│       └── skills/
│           ├── README.md           # usage guide for all four skills
│           ├── follow-up/
│           │   ├── agents/
│           │   │   └── openai.yaml # follow-up skill display metadata
│           │   └── SKILL.md        # three follow-ups for a saved clip, saved into it
│           ├── glean/
│           │   ├── agents/
│           │   │   └── openai.yaml # skill name and icons shown in ChatGPT
│           │   ├── assets/         # icon-small.png and icon-large.png
│           │   └── SKILL.md        # pages, parts, answers, and search
│           ├── preferences/
│           │   ├── agents/
│           │   │   └── openai.yaml # preferences skill display metadata
│           │   ├── references/
│           │   │   ├── contract.md # shared schema, resolution, storage, and sync
│           │   │   └── examples/   # user.yaml and project.yaml
│           │   └── SKILL.md        # setup, show, update, reset, sync
│           └── youtube/
│               ├── agents/
│               │   └── openai.yaml # YouTube skill display metadata
│               └── SKILL.md        # YouTube videos (uses glean for saving)
├── scripts/
│   ├── auto-release.mjs            # finds unreleased plugin changes and picks the bump for auto-release.yml
│   ├── auto-release.test.mjs       # auto-release script tests
│   ├── changelog.mjs               # changelog parsing shared by the release scripts
│   ├── release.mjs                 # npm run release: bump, date the changelog, validate, commit
│   ├── release.test.mjs            # release script tests
│   ├── release-notes.mjs           # prints a version's changelog entry, or the Unreleased one, for the workflows
│   ├── validate-skills.mjs         # Skill, metadata, manifest, and reference checks
│   └── validate-skills.test.mjs    # validator fixture tests
├── .markdownlint-cli2.jsonc        # Markdown lint globs and house-style rule overrides
├── AGENTS.md                       # contributor guide for coding agents
├── CLAUDE.md                       # Claude Code guidance for this repository
├── gleaner-symbol.svg              # logo
├── LICENSE
├── package.json                    # local validation and release commands, dev dependencies
├── package-lock.json               # reproducible dependency versions
└── README.md
```

## Local development and validation

Install Node.js 22 or newer and npm, then clone the repository and install its two development dependencies (`yaml` and `markdownlint-cli2`):

```bash
git clone https://github.com/shawn-sandy/gleaner.git
cd gleaner
npm ci
npm run validate
```

Run `npm run validate` before pushing. It checks all four Skills' YAML frontmatter and nonempty bodies, their `agents/openai.yaml` display metadata, marketplace and plugin JSON, required files, preference example schemas and destination references, and local file references in the Skills and installation guides. References include Markdown inline links, reference definitions, relative file paths with extensions in inline code, and metadata icons; fenced examples, remote URLs, and heading anchors are excluded. Markdownlint then checks repository Markdown using `.markdownlint-cli2.jsonc`.

When `claude` is on `PATH`, validation also runs both existing strict checks:

```bash
claude plugin validate . --strict
claude plugin validate ./plugins/gleaner --strict
```

Without the Claude CLI, those two checks print an explicit skip; all other local checks still run. An installed CLI that fails validation makes the command fail. Install Claude Code and rerun before claiming Claude validation passed. Run `npm test` for the validator's fixture tests and the release script's tests.

Validation needs no build step. After dependencies are installed, the static checks need no network access. The [validate workflow](.github/workflows/validate.yml) runs `npm run validate` and `npm test`, with the Claude CLI installed, on every pull request and every push to `main`. These checks do not establish live ChatGPT marketplace, browser, or connector compatibility; use the [manual checklist](docs/chatgpt-marketplace.md#validation-checklist) for that.

In Claude Code, a hook in `.claude/settings.json` reruns both strict checks after each Write or Edit under `.claude-plugin/` or `plugins/`. It doesn't see shell edits or run markdownlint, so still run `npm run validate` before pushing.

### Releasing

Releases are automatic. When a merge to `main` changes the plugin, the [auto-release workflow](.github/workflows/auto-release.yml) bumps the version, dates the changelog, commits `Gleaner X.Y.Z: <summary>` to `main`, and runs the release workflow to tag and publish it. A plugin change is any file under `plugins/` or `.claude-plugin/` except docs: a `README.md`, a `CHANGELOG.md`, or anything in a `docs/` folder. Changes to the repository's `docs/`, its README, scripts, and workflows never trigger a release on their own.

Each release covers every plugin change since the last release tag, so merges that land close together go out as one release. Choose the bump with a label on the PR before merging:

| Label | Effect |
| --- | --- |
| none, or `release:patch` | patch release |
| `release:minor` | minor release |
| `release:major` | major release |
| `release:skip` | not released now; it goes out with the next plugin change, such as for a wording-only edit |

When several unreleased PRs are labeled, the largest bump wins. Write the user-facing changes as bullets under a `**Unreleased**` line at the top of the [changelog](#changelog) in the same PR, as before. Each PR that doesn't edit the README gets a bullet from its title instead, and the commit summary is the latest PR's title in lowercase.

The workflow runs `npm run release` with the Claude CLI installed, so both strict checks and `npm test` must pass before anything is pushed. If `main` moves while it runs, it pushes nothing and fails; run it again from the Actions tab. A plugin PR merged while the previous release is still waiting for its tag is picked up when the release workflow finishes, because that workflow tags the version commit and then runs auto-release again.

#### Releasing by hand

In Claude Code, `/release minor` (or `patch` or `major`) walks through the steps below. By hand, add the user-facing changes as bullets under a `**Unreleased**` line at the top of the [changelog](#changelog), write the commit body bullets to a file outside the repository, and run:

```bash
npm run release -- minor --summary "add a notion destination" --body ../release-body.txt
```

The script bumps `version` in `plugins/gleaner/.claude-plugin/plugin.json`, replaces `**Unreleased**` with the new version and today's date, runs `npm run validate` and `npm test`, and commits every tracked change as `Gleaner X.Y.Z: <summary>`, on a new `release/X.Y.Z` branch when run on `main`. It needs the Claude CLI on `PATH` so both strict checks run, refuses untracked files, and restores both files if validation or the commit fails. A PR that already changes the version is left alone by the auto-release workflow.

To cut a release without a local checkout, run the [cut-release workflow](.github/workflows/cut-release.yml) from the Actions tab once the `**Unreleased**` entry is on `main`. Pick the bump, enter the summary, and it runs the same script on `main`, with the Unreleased bullets as the commit body and the date in New York time, then pushes the `release/X.Y.Z` branch and links to open its PR.

Unreleased bullets merged with no plugin change, such as with a docs-only PR, wait for the next plugin change. Until then, every push to `main` gets a "Release owed" warning from the [validate workflow](.github/workflows/validate.yml), with the bullets and a link to the cut-release workflow in the run's summary.

When a merge to `main` changes the version, the [release workflow](.github/workflows/release.yml) tags `vX.Y.Z` and publishes a GitHub Release whose notes are that version's changelog entry. To publish a version that is on `main` but not released yet, run the workflow from the repository's Actions tab.

## License

MIT © Shawn Sandy

## Changelog

**2.13.2** (2026-10-31)
- In Claude Code without Claude in Chrome, a YouTube clip can now be written from the video's transcript if the session has the Playwright browser tools. Gleaner opens the video in a new Playwright tab, reads YouTube's **Show transcript** panel, and closes the tab, using Playwright as it's configured. Chrome stays the first choice.
- Gleaner waits for a YouTube ad to finish before opening the transcript panel, since a panel opened during an ad stays empty and the clip would lose its transcript.
- Gleaner also reads YouTube's newer transcript panel, which some videos open instead of the classic one. Before, those videos were saved as if they had no transcript.

**2.13.1** (2026-10-29)
- Every save, update, and search now tags its chat with one plain line, `Gleaner clip · <date> · <title> · <category> · <tags> · <source URL>` or `Gleaner search · <what you asked for>`, so "what did I save about X?" can also find the conversations that hold clips, including clips kept in the chat, where the host can search past conversations (Claude Code desktop; claude.ai with chat search on). Found chats are listed marked "(chat)", linked where the host gives a link. In Claude Code desktop, a conversation that began with a Gleaner request is named `Gleaner: <clip title>` after its first save.

**2.13.0** (2026-10-29)
- "Export my gleans as bookmarks" gives you a bookmarks file to import into Chrome, Firefox, Safari, or Edge, with a `Gleaner` folder holding one subfolder per category. Each bookmark opens the clipped page, or the clip for an answer saved without a page, and the file carries the clip's date, tags, note, and link. Like the index sheet, it's a snapshot. See [Bookmarks file](#bookmarks-file).

**2.12.5** (2026-10-28)
- Outside ChatGPT, a YouTube clip saved without a transcript because no Chrome was available to read it (only the built-in browser, or no browser at all) now ends its confirmation by suggesting saving it again from the video's page in Chrome, with the Chrome side panel or Claude in Chrome, which may get better results if the video has a transcript. Before, only the built-in browser got a Chrome hint, and a clip read without a browser got none.

**2.12.4** (2026-10-27)
- The Gleaner icon is now the square logo from the website, replacing the round one, including in ChatGPT.

**2.12.3** (2026-10-27)
- Wording change: a new clip's confirmation now starts with its title, so the reply names the clip. A stored clip starts with `Saved "<title>"`, the way updates start with `Updated "<title>"`, and a clip given in the chat, which isn't stored, starts with `Here's "<title>"`. A save that falls back to the chat starts with where the clip wasn't saved.
- Shorten Gleaner skill descriptions (#51).

**2.12.2** (2026-10-25)
- Browser selection now covers sessions with both ChatGPT Work and connected tabs: honor a named browser or tab, use the surface that identifies the requested page, and keep subsequent reads on that page.
- Clarify that selected Drive saves use `Browser Research/<Category>` unless a configured or explicit folder overrides it. The conversation remains the unconfigured default, with existing automatic and explicit format choices preserved.
- Align first-save instructions and preference acceptance scenarios with ChatGPT's full inline delivery when attachments are unavailable; Claude keeps its existing file and preview behavior.

**2.12.1** (2026-10-25)
- ChatGPT now shows the full clip directly in the conversation, including on mobile, with Markdown downloads linked separately. Notes, source and timestamp links, limitations, and follow-ups remain readable without opening a file; Claude presentation is unchanged.

**2.12.0** (2026-10-25)
- Gleaner closes the Claude in Chrome tabs it opens, such as the YouTube tab it opens to read a transcript, once the clip is saved or the request ends without a save. A tab stays open while you're still adding parts or when you ask to keep it, tabs you opened are never closed, and adding to a saved clip later opens the page again.

**2.11.1** (2026-10-25)
- ChatGPT now asks before saving when YouTube content cannot be read, including on mobile. Paste a description or transcript for a summary, or explicitly choose a link-only bookmark; readable descriptions still save without interruption.
- Supplied video text refreshes an existing clip from the same conversation without retrying the blocked URL. Chat attachments are clearly labeled as replacements, and storage updates that require another copy ask first. Claude's video workflow is unchanged.

**2.11.0** (2026-10-24)
- YouTube clips are written from the video's transcript again. In the Chrome side panel and Claude in Chrome, Gleaner opens YouTube's own **Show transcript** panel and reads it, long transcripts included, and the **Video** line says `transcript panel`. Parts and "add this part" work from that transcript without pasting. When the transcript isn't in the video's language, the clip says which language it was written from. YouTube sends the panel empty to the Claude Code built-in browser, so Claude Code reads it through Claude in Chrome when that's connected, and otherwise writes from the description.
- ChatGPT: where Gleaner would ask you to paste a transcript, it first asks you to open **Show transcript** in the video's tab and reads the lines from there, recorded as `transcript panel`. The Work browser opens the panel itself when it has a click or JavaScript tool.
- Video tags and categories take hints from the uploader's keywords and YouTube's category, which also help catch misheard names in a transcript. Key moments and parts are written to make sense without the video open, and saving several videos confirms first whether you want one clip each or one for the set.
- Gleaner never downloads captions or videos with command-line tools.
- Follow-ups can hand a clip to another installed skill that turns a video or page into something, such as youtube-to-blog, but only when your session lists one.

**2.10.2** (2026-10-23)
- ChatGPT now delivers Markdown (`.md`) clips by default, including when the format is `auto`; Claude keeps HTML chat downloads. Explicit Markdown preferences still apply in both.
- ChatGPT no longer adds automatic HTML companions to new saves. Ask for an HTML download when needed; existing HTML clips and companions keep their format during updates.

**2.10.1** (2026-10-23)
- Supported chat attachment downloads remain clickable in bookmark previews, including after an interactive preview fails.
- Unqualified requests to use Markdown continue to select the saved file format; request a "Markdown preview" to change only conversation presentation.

**2.10.0** (2026-10-23)
- Every saved or updated clip now shows a structured preview in the active conversation, with the same content in ChatGPT and Claude Code and verified source/save links.
- HTML bookmarks remain available without changing your storage preferences: local Markdown gets a companion file, while Drive and Notion can provide a separate chat download where attachments are supported.
- Preview failures fall back to readable Markdown without saving again; say "no preview" to suppress the detailed preview for one request.
- YouTube clips are now written from the video's description and chapters, since Gleaner can no longer capture transcripts in the browser. The youtube skill no longer asks whether to save a video without a transcript.
- When a video has no description, Gleaner asks for a short one, which is optional; say "skip" to save it from the title alone.
- Video clips have a new **Channel** line that names and links the channel. The **Video** line now records what the summary was written from (the description, your description, the title, or a pasted transcript) instead of the caption type.
- Video clips have a new **Links** section with the description's links to docs, repos, slides, and other things the video uses. Sponsor, affiliate, social, subscribe, merch, and shortened links are left out.
- Paste a transcript (**…more → Show transcript** on YouTube) for a fuller summary, or to clip moments by time range or topic.

**2.9.0** (2026-10-21)
- Articles split across numbered pages (page 2, page 3, …) are now read to the end, up to five pages, and saved as one clip that says how many pages it covers.
- The duplicate check also matches the main address a page names for itself (its canonical URL, on the same site only), so a tracking or share link to an article you've already clipped is caught. When the page says it changed after your clip, Gleaner tells you before asking whether to save an updated copy.
- "Grab the part about X" starts from the page heading that matches X, when there is one.
- A page's own schema.org type helps pick the clip's Type, such as tutorial for a how-to page.
- These use a small read-only script, so they work in the Chrome side panel, the Claude Code desktop browser, Claude in Chrome, and ChatGPT's Work browser when it has a JavaScript tool. ChatGPT's connected tabs work as before.

**2.8.0** (2026-10-20)
- Clips given in the conversation are now HTML files you can open in any browser, in the same clean, single-column style as artifact clips, with light and dark themes. Say "keep it as markdown", or set your default format to `markdown`, to get a `.md` file instead. Where the chat can't attach files, the clip still comes as one Markdown code block. Code blocks in HTML clips, artifacts included, can now be scrolled with the keyboard.

**2.7.0** (2026-10-19)
- Clips are now written in plain language for a reader new to the topic: short sentences, technical terms explained the first time they appear, a TL;DR that says what the page says, and key points and takeaways as full sentences that start with a bold claim. Page clips have 3–5 key points, down from 5–8.
- Page and video clips can have a new **How it works** section after the TL;DR: one short paragraph, added only when the TL;DR can't explain the page's main idea on its own.
- Tutorial pages get a numbered **Steps** section in place of Key points, with one action per step in the source's order. Tutorial videos keep Key moments.
- Clips now end with a copy-and-paste prompt for getting follow-ups later, set apart below a divider. It names the clip and where it's stored, gives the path for local folders, or asks you to attach the file for a clip given in the conversation. Clips saved inside the Claude Code project also get a `claude` terminal command that starts Claude Code and sends the prompt.

**2.6.0** (2026-10-19)
- With no saved preference, clips now come back as a Markdown file in the conversation on every surface: the Chrome side panel, ChatGPT, Claude Code, and Cowork. Nothing is stored unless you name a destination ("save to Drive", "save it to this project", `--to notion`) or set one with `/gleaner:preferences`.
- Added `--to chat` (or "just give me the file") to pick the conversation explicitly, such as when your saved default is somewhere else.
- Cowork no longer saves into the open project on its own; say "this project" to save there. "Save it as a Google Doc" now saves to Drive on every surface.
- Right after a clip comes back in the chat, "save it to Drive" (or "save it to this project" in Claude Code and Cowork) stores that same clip, parts included.
- Gleaner no longer asks about setup on your first save, since the chat default needs nothing stored; it mentions `/gleaner:preferences setup` once per session instead.
- A clip in the conversation can't be found by a search or a follow-up in a later session, so download or copy it to keep it.

**2.5.0** (2026-10-18)
- Added `/gleaner:follow-up`, which reads a saved clip (its link, TL;DR, note, content, and links) and suggests three specific follow-ups, or asks what you want to do next when the clip gives too little to go on. The follow-ups are saved in a dated Follow-ups section at the end of the clip; a clip from an earlier session gets an updated copy instead of being edited.

**2.4.0** (2026-10-18)
- When a YouTube video has no transcript, the youtube skill asks whether to save it anyway, and saying no saves nothing. If you say yes, it asks for a short description and adds it to the video's own description. Say "just save it" to skip the description, or paste the transcript for a full summary.

**2.3.0** (2026-10-18)
- Clips are saved as Markdown (`.md`) files by default, in Google Drive too, instead of being converted to Google Docs. Notion and artifact clips keep their own formats without asking.
- Say "save it as a Google Doc" for one Doc (in Claude Code, this saves to Drive), or set your default format to `auto` to get Docs whenever Drive can convert them. First-save setup leaves the format unset unless you pick one.

**2.2.0** (2026-10-18)
- Added `/gleaner:preferences` for shared, versioned save destinations and formats, local-first storage, project/session overrides, and optional invocation-time Google Drive sync.
- Page and YouTube saves share first-save setup, explicit-request precedence, verified destinations, and format checks. Temporary saves never change permanent defaults.
- Added three-way sync instructions with conflict reconciliation, readback verification, pending retries, and cloud-only/session fallbacks. Project overrides and sync metadata never upload.
- Extended static validation for preferences metadata, contract references, and YAML examples; added maintainer-run acceptance scenarios. Live connector sync remains separately tested.
- Check final Markdown filenames before Drive uploads and serialize local preference writers with a shared lock to prevent overlapping invocations from discarding updates.

**2.1.0** (2026-10-18)
- One clip per page per session: saving, adding a part, or saving an answer from a page you already clipped this session updates that clip instead of creating a new doc, file, Notion page, or artifact. Say "as a new clip" to keep one separate.
- Updates stay where the clip was saved: local files and Notion pages are updated in place, and artifacts are republished at the same link. Drive can't change a file's content, so the updated clip is uploaded and the version saved earlier in the session goes to Drive's trash, where it can be restored for 30 days.
- With nothing being collected, "drop the last part" and similar requests edit the parts of the clip saved from the page this session.
- Clips from earlier sessions are still never changed; saving one of their pages again offers an updated copy, as before.

**2.0.0** (2026-10-17)
- Renamed the `clip` skill to `glean`. Use `/gleaner:glean` instead of `/gleaner:clip`; the old command is no longer available. Natural-language clipping requests and the `youtube` skill are unchanged.

**1.11.0** (2026-10-17)
- Drive saves, duplicate checks, and the clip index use the session's own Drive connector, such as ChatGPT's, with its search and upload options. If that connector can't convert a clip or index sheet, Gleaner saves it to Drive as a `.md` or `.csv` file instead, and says so when it has to skip a check the connector can't run.
- ChatGPT: when no browser tools are available, Gleaner suggests switching to Work mode for the Work browser, as well as connecting a browser or giving a URL or pasted text.

**1.10.0** (2026-10-17)
- ChatGPT: the youtube skill reads the video's tab when the browser can't run its transcript script. It uses a transcript only when the tab shows one, otherwise saves a description-only clip, and asks for a time range or topic for "this part", since it can't read the playback position. A part needs transcript lines; chapters alone aren't enough.
- ChatGPT: unlabeled transcript lines are treated as auto-captions, so product names and jargon are still checked before they go in the clip.
- ChatGPT Work browser: uses its JavaScript tool for highlights and transcripts when the session has one, and opens a URL itself instead of fetching it.
- In ChatGPT's connected tabs, Gleaner no longer suggests highlighting again when it can't find a part.
- Confirmations link only what the save returned, and say so when there's no link, instead of making one up.

**1.9.0** (2026-10-17)
- ChatGPT: the glean skill now runs in ChatGPT's connected Chrome tabs and Work browser, saving to Drive by default. Connected tabs can't read highlights, so name the part you want or paste it. A new `agents/openai.yaml` gives the skill its name in ChatGPT.
- Page text is treated as content to summarize, never as instructions to follow.
- When it isn't clear which tab you mean, Gleaner asks instead of guessing, and it never makes up a URL, tab, or clip link.

**1.8.0** (2026-10-17)
- Artifact destination: "save it as an artifact" or `--to artifact` publishes each clip as its own private claude.ai artifact, a web page with the clip's details at the top. Needs a session that can publish artifacts, such as Claude Code.

**1.7.0** (2026-10-16)
- Save Claude's answers about a page: ask about what you're reading, then say "save that" or "save those steps" to keep the answer as a clip. Answers keep their steps and code, are headed by your question, and mark anything that didn't come from the page "(not from the page)".
- While you're collecting parts, an answer is added as the next part. The Scope line and the clip index count answers separately, such as `2 parts, 1 answer from 1 page`.
- Answers about YouTube videos link their timestamps to the second, and saving an answer works without a browser open.

**1.6.0** (2026-10-16)
- New **youtube** skill (`/gleaner:youtube`): save a YouTube video, or moments from it, as a clip built from its transcript, with key moments that link to the exact second. Collect parts by time range, topic, or playback position. Falls back to a description-only clip when there are no captions.

**1.5.1** (2026-10-16)
- Notion: tested end to end. New tags are now added to the database's Tags options before a clip is saved (Notion rejects unknown tags), keeping every existing option.
- Notion: duplicate checks use filtered row queries, and page bodies use Notion-flavored Markdown escaping.

**1.5.0** (2026-10-16)
- Notion destination: "save to Notion" or `--to notion` saves each clip as a page in a Browser Research database, with category, type, tags, note, source, and date as properties. The database doubles as a live, filterable clip index.

**1.4.0** (2026-10-16)
- New `--to` flag (`-t`) to set the destination for one save: `drive`, `drive:"Folder"`, `local`, `cowork:"Project"`, or a local path.

**1.3.0** (2026-10-16)
- Local clips (Claude Code and Cowork projects) now save to `browser-research/<category>/`, with kebab-case category folders such as `design-engineering`. Drive is unchanged.

**1.2.0** (2026-10-16)
- In Claude Code, clips now save to the project folder by default. Say "save to Drive" to use Drive instead.

**1.1.0** (2026-10-16)
- Works in Claude Code desktop with its built-in browser: clips the active tab in the Browser pane, highlights included (tested).
- Picks the right browser automatically: Chrome side panel, Claude Code's built-in browser, or Claude in Chrome.
- Clip any URL: "save https://…" opens the page and clips it.
- New destination for Claude Code: `browser-research/<category>/` in the working folder.
- Handles site approvals and separate browser sign-ins.

**1.0.0** (2026-10-16)
- Renamed from *page-to-project* to **Gleaner** and published as a plugin marketplace.
- Natural-language requests replace fixed commands.
- Part clips: collect highlights or described sections across pages, each with its own note.
- Highlight-aware saving, tested in Chrome.
- Notes, categories, types, and tags on every clip.
- Duplicate check by URL, with "Supersedes" links.
- On-demand clip index and spreadsheet snapshots.
- Google Drive (default, `Browser Research`) and Cowork project destinations.
