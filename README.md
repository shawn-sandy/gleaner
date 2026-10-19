# Gleaner

**Gather the best of what you read into tagged, searchable clips.**

Gleaner is a Claude plugin for the Chrome side panel and the Claude Code desktop browser, and its skills also work from ChatGPT's connected Chrome tabs and Work browser. Ask it in plain language to keep a page or a YouTube video, or just the parts that matter, and it writes a short, structured summary, tags it, files it by category, and hands it to you as a Markdown file in the conversation, or saves it to Google Drive, Notion, a Cowork project, your Claude Code project, or a private claude.ai artifact. Later, ask what you saved there and it finds it. Shared local-first preferences manage save destinations and formats with optional Google Drive sync.

```text
You:     grab the part about animation lengths, for the motion post
Gleaner: Added part 1: animation lengths ("Keep most UI transitions…"). Add more, or say "done" to save.
You:     and this table too
Gleaner: Added part 2: this table ("Duration by element size…").
You:     done
Gleaner: Here's "Motion timing guidelines" as a Markdown file, filed under Design Engineering
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
- **YouTube videos too.** Save a video, or just the moments that matter, as a summary built from its transcript, with key moments that link to the exact second.
- **Your reasons, kept.** Add a note to any request ("…for the motion post") and it's saved with the clip. Gleaner never invents notes.
- **Organized automatically.** Every clip gets a category (used as its folder), a type, and 3–6 specific tags, reusing your existing tag spellings.
- **One clip per page.** In a session, saving or adding more from a page you've already clipped updates that clip instead of starting a new doc. A page clipped in an earlier session gets an updated copy that links to the original; clips from earlier sessions are never changed or deleted.
- **Search by asking.** "What did I save about Cowork?" returns a sortable table. Ask for a spreadsheet snapshot whenever you want one.
- **Next steps, suggested.** Ask "what should I follow up on?" and Gleaner suggests three next steps drawn from a clip's note, takeaways, and links, then saves them to the clip.
- **In the chat, or stored where you choose.** Gives you each clip as a Markdown file in the conversation by default, or saves it to Google Drive, a Notion database, a private claude.ai artifact, a Cowork project folder, or, in Claude Code, straight into the project you're working on.
- **Your defaults, remembered.** Pick a destination and format once with `/gleaner:preferences setup`, override them for a project or a single save, and optionally sync them across devices through Google Drive.
- **Works where you browse.** The Chrome side panel, the built-in browser in Claude Code desktop, or ChatGPT's connected Chrome tabs and Work browser. Hand it a URL and it opens or fetches the page for you.

## Skills

Gleaner includes four skills: two share the clip format and saving workflow, one suggests what to do next with a saved clip, and one manages reusable preferences:

| Skill | Claude Code command | Use it for |
| --- | --- | --- |
| [glean](plugins/gleaner/skills/glean/SKILL.md) | `/gleaner:glean` | Save pages, collect passages, keep answers, and find saved clips |
| [youtube](plugins/gleaner/skills/youtube/SKILL.md) | `/gleaner:youtube` | Save videos and moments using transcripts and timestamped summaries |
| [preferences](plugins/gleaner/skills/preferences/SKILL.md) | `/gleaner:preferences` | Shared destinations, formats, setup, and sync |
| [follow-up](plugins/gleaner/skills/follow-up/SKILL.md) | `/gleaner:follow-up` | Suggest three follow-ups for a saved clip and save them to it, or ask what you want to do next |

Use plain-language requests or invoke a command directly in Claude Code. The `youtube` skill uses `glean` for destinations, tags, duplicate checks, and saving. See the [skills usage guide](plugins/gleaner/skills/README.md) for examples.

## ChatGPT marketplace

Gleaner uses the same GitHub marketplace manifest for Claude and ChatGPT. In ChatGPT workspaces that support GitHub marketplace imports, import `https://github.com/shawn-sandy/gleaner` from the workspace's Plugins settings. The root manifest registers all four skills (`glean`, `youtube`, `preferences`, and `follow-up`) through the Gleaner plugin. Browser and Google Drive access must be connected separately; importing the plugin does not grant them.

See [ChatGPT marketplace setup and compatibility](docs/chatgpt-marketplace.md) for installation, supported browser surfaces, limitations, and a manual test checklist. ChatGPT marketplace import requires verification in an eligible workspace.

## Install

**Requirements**
- A paid Claude plan with the new Chrome side panel (the Cowork-style panel; its three-dot menu shows "Switch back to classic").
- *Optional:* the **Google Drive** connector, for saving to Drive and syncing preferences.
- *Optional:* the Claude desktop app, open and connected, for saving to Cowork projects.
- *Optional:* the **Notion** connector, for saving to Notion.
- *Optional:* a session that can publish artifacts, such as Claude Code, for saving clips as artifacts.

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
3. Gleaner replies with the clip as a Markdown file, its tags, and a one-line summary. Where the chat can't attach files, the clip comes as one Markdown code block instead.
4. Download the file, or copy the code block, to keep it. To store a copy, say "save to Drive". To store every clip somewhere, set a default with `/gleaner:preferences setup`.

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

Gleaner doesn't stop your first save to ask about setup, because its default, the chat, needs nothing stored; it mentions setup once instead. Run `/gleaner:preferences setup` to choose a default destination, format (left unset by default, so clips are Markdown wherever the destination supports it), and optional Drive sync. Choose “just this save” to continue with session settings and the existing environment defaults. Setup verifies an existing destination; it does not move clips or create research databases. “Always save here” persists at user scope; “save this here” and `--to` apply to that save only. Explicit project or session requests use that scope. Reset removes an override so the next default applies.

User preferences live at `$XDG_CONFIG_HOME/agent-preferences/preferences.yaml`, falling back to `~/.config/agent-preferences/preferences.yaml`. Project overrides live at `.agent-preferences/preferences.yaml` under the session project root. Resolution is explicit request (`--to` beats words), session, project, user, then existing skill defaults. Show reports each effective value and its scope, persistence location, and sync status. Page and YouTube saves use the same resolved preferences.

`auto` gives each destination's native output, such as Google Docs in Drive. `markdown` requests a raw `.md` file for local/Cowork or a Drive connector supporting raw uploads. Notion pages and HTML artifacts are incompatible; Gleaner explains and asks before saving. Saved local paths are device-specific: an unreachable path prompts for a temporary alternative and never changes the permanent default silently.

Optional sync uses one Google Drive document titled `Agent Preferences`, discovered before creation and selected by you if duplicates exist. Only user preferences synchronize; project overrides and local `sync-state.yaml` metadata never upload. Before saves and during preference invocations, Gleaner compares local/cloud values with the last verified snapshot, propagates one-sided changes, merges independent settings, and asks about conflicting settings. Different existing copies without a baseline require reconciliation before upload. Updates persist locally first, then synchronize when connected; failures remain pending for the next invocation. There is no background service.

Cloud writes require read/update capabilities, a fresh remote check, and readback verification. Connectors without conditional writes cannot fully prevent a simultaneous edit between check and write. Hosts without local files can use Drive as their persistent store; with neither store writable, preferences are clearly labeled session-only. Invalid YAML and unsupported schema versions remain untouched; session settings can continue the save.

See the [shared contract and examples](plugins/gleaner/skills/preferences/references/contract.md) and [maintainer acceptance scenarios](docs/preferences-testing.md). Static fixtures check packaging and examples, not live synchronization reliability.

## Usage guide

### Saving a whole page

Mention the page, article, or doc, or just say "save this" with nothing highlighted.

> save this page
> keep this article for later
> bookmark this doc

Gleaner reads the whole page, skips navigation, ads, and comments, and writes a summary of up to ~400 words with a TL;DR, key points, notable details (code, numbers, names), and takeaways.

### Saving parts of pages

Use parts when only some of a page matters, or when you're pulling related bits from several pages into one clip.

**1. Add parts.** Highlight text and say "add this," or describe the part and let Gleaner find it:

> add this
> grab the part about animation lengths
> keep this section too
> and this table

Each part is confirmed with its first few words so you can check it's the right one.

**2. Adjust if needed.**

> what have I got so far?
> drop the second one
> change part 1's note to "easing defaults"
> start over

**3. Save.**

> done
> save them
> that's it, wrap it up

All parts are saved as one clip, grouped under headings with a link to each source page.

> **Tip:** Parts can come from different tabs and sites. Collect from three articles, then save once.

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

Gleaner reads the video's transcript and writes a TL;DR, **key moments** that each link to the second they happen, notable details, and takeaways. A **Video** line records the channel, publish date, length, and whether the transcript came from captions or auto-captions.

Collect moments as parts by time or topic:

> keep 3:10 to 5:40
> grab the part about generics
> add this part *(the chapter you're watching, or the last minute or so)*

If a video has no captions, Gleaner asks whether to save it anyway; say no and nothing is saved. Say yes, and it asks for a short description, adds it to the video's own, and saves a clip from the title, description, and chapters; say "just save it" to skip the description. Paste the transcript (**…more → Show transcript** on YouTube) instead to get a full summary, or paste it after a description-only save to get one as an updated copy. Parts need the transcript, so without one Gleaner won't save a part; it asks you to paste the transcript and offers a clip of the whole video instead.

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
| **This conversation** → a Markdown file in the chat | Default everywhere; "just give me the file", or `--to chat` | Nothing |
| **Google Drive** → `Browser Research/<category>/` | "save to Drive", or `--to drive` | Google Drive connector |
| Another Drive folder | "save to my Research folder" | Google Drive connector |
| **Cowork project** → `browser-research/<category>/` | "save to my Serve513 project", or "this project" inside Cowork | Claude desktop app open and connected |
| **This project** → `browser-research/<category>/` | "save it to this project", or `--to local` in Claude Code | A Claude Code session |
| **Notion** → `Browser Research` database | "save to Notion", or `--to notion` | Notion connector |
| **Artifact** → a private page on claude.ai | "save it as an artifact", or `--to artifact` | A session that can publish artifacts, such as Claude Code |

Folders are created the first time they're needed. Clips are saved as Markdown (`.md`) files, in Drive too. Say "save it as a Google Doc" for a Doc instead, or set your default format to `auto` to get Docs whenever Drive can convert them (otherwise `auto` saves `.md` too). Notion and artifact clips keep their own formats, and a Drive connector that can't upload raw files saves Google Docs.

A clip in the conversation isn't stored anywhere, so a search or a follow-up in a later session can't find it. Download or copy it, or name a stored destination.

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
| `--to chat` | A Markdown file in the conversation, not stored |
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

You can also search directly in Google Drive: type a tag like `#motion` or a note phrase into Drive's search bar.

Clips saved as artifacts are searched only when you ask for them ("what did I save to artifacts about Cowork?"); see [Saving as an artifact](#saving-as-an-artifact).

### Index spreadsheet

> make me an index sheet

Creates a new Google Sheet, `Clip Index <date>`, in Browser Research with every clip as a row. It's a **snapshot**: it won't update itself, so ask for a fresh one whenever you need it.

### Following up on a clip

Ask right after a save, or point at any saved clip by link, path, or topic:

> what should I follow up on?
> suggest follow-ups for my view transitions clip

Gleaner reads the clip's TL;DR, note, content, and the links inside it, then suggests three follow-ups, each tied to something in the clip, such as reading a linked page, moving the post your note mentions forward, or comparing it with clips that share its tags. When the clip has too little to go on, it asks what you want instead of guessing.

The follow-ups are saved at the end of the clip under a dated **Follow-ups** heading. A clip from an earlier session isn't edited: you get an updated copy that links to the original. Pick a follow-up and Gleaner starts on it; nothing else is saved unless you ask.

Every clip also ends its Takeaways with a ready-made prompt, so you can come back to it later: paste the line into a new chat to get follow-ups. It names the clip and where it's stored, or gives its file path for clips saved to a local folder. A clip given in the conversation isn't stored anywhere, so its prompt asks you to attach or paste the file instead. Clips saved inside your Claude Code project add a terminal command that starts Claude Code and sends the prompt:

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
- **Clips come back in the chat.** In Claude Code, clips come back as a Markdown file in the conversation. Say "save it to this project" (or add `--to local`) to save them to `browser-research/<category>/` in the folder Claude Code is working in. Gleaner never commits them; commit the clips or add `browser-research/` to `.gitignore`, your call.
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
| Find clips | "what did I save about X?" · "clips from this week" |
| Plan next steps | "what should I follow up on?" · "suggest follow-ups for that clip" |
| Spreadsheet | "make me an index sheet" |

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
## Key points
…
## Notable details
…
## Takeaways
…
To get follow-ups, paste this into a new chat: …
```

**Part clip** adds a `**Scope:** 2 parts from 1 page` line, and its body is a **Parts** section with one heading per part (titled by your note or topic), a link to its source, its own note, and 2–4 bullets.

**Answer** parts sit in the same Parts section, headed by your question, with the answer kept as given. The Scope line counts them separately, such as `2 parts, 1 answer from 1 page`. A clip of a single answer skips the TL;DR.

**A page clip you add to** in the same session keeps its summary and gains a Parts section before its Takeaways, with a Scope line such as `whole page + 2 parts`. Its TL;DR and Takeaways are rewritten to cover the new parts.

**Video clip** adds a `**Video:**` line (channel, publish date, length, and transcript source) and swaps Key points for **Key moments**, each linking to its second in the video. A video part's heading links to where it starts, such as `3:10–5:40`.

**A clip you follow up on** ends with a `## Follow-ups` section: a dated, numbered list for each round of suggestions, with earlier rounds kept as they were.

Files are named `yyyy-mm-dd-short-title`. If a name is taken, Gleaner adds `-2`, `-3`, and so on.

## How Gleaner decides

- **"Page," "article," "doc"** → the whole page, even if text is highlighted.
- **"Part," "bit," "section," "table," "the part about X"** → a part.
- **A plain "save this"** → saves your highlight or collected parts if there are any, otherwise the whole page.
- **"Save that" right after an answer** → takes the answer, even with text highlighted, and says so: it saves the answer, or adds it as the next part while you're collecting. "Save this page" still saves the page.
- **Highlights under ~40 characters** (a stray word) are ignored.
- **It acts when intent is clear**, with prompts for sync conflicts and unsupported formats, then tells you what it assumed: *"Saved the whole page — say 'just the highlighted part' if you meant only that."* It asks only when two readings are equally likely, or a named destination doesn't exist.
- **Same page, same session** → saves and parts from a page you've already clipped this session go into that clip, wherever it was saved, unless you name another destination or say "as a new clip". The URL decides: other pages on the same site get their own clips.
- **Duplicate check:** saving a page you clipped in an earlier session shows the earlier clip and offers an updated copy (marked "Supersedes" with a link) or skipping. Part clips skip this check, and so do clips given in the chat, since nothing is stored to check.

## Limitations

- **One highlight at a time.** Chrome doesn't support multiple simultaneous selections; collect parts one by one instead.
- **Unreadable highlights.** Text inside embedded frames, Chrome's PDF viewer, and apps like Google Docs often can't be read. Describe the part or paste it instead.
- **Drive capabilities vary.** Adding to a Drive clip in the same session uploads the updated clip and moves the earlier version to Drive’s trash, so its link changes. Updates to older clips are new copies, and index sheets are snapshots. Preference sync needs a connector that can read and update the selected document; create-only connectors leave sync pending.
- **No claude.ai Projects.** Cowork can read them but not write to them.
- **ChatGPT without a JavaScript tool.** Connected Chrome tabs, and a Work browser without one, can't read highlights or the playback position. Name the part or paste it, and give a video part a time range or topic instead of "this part."
- **Artifact search is one page at a time.** Gleaner opens each artifact to find its clips, about 50 per request.
- **YouTube needs captions.** Video clips are built from the transcript. Without captions (or during a live stream), Gleaner asks before saving a clip from the title, description, and chapters, plus a short description if you add one. Parts can't be clipped until you paste the transcript. Private, members-only, and age-restricted videos need you signed in to YouTube in that browser.
- **In Claude, YouTube transcripts need a desktop browser, not a phone.** Gleaner gets a video's transcript by running a small script in the video's browser tab, through the Chrome side panel or the Claude Code desktop browser, and phones have neither. To get a full summary, save the video from Chrome or Claude Code desktop on your computer, or paste the transcript into the chat (**…more → Show transcript** on YouTube). In ChatGPT on a computer, the Work browser can capture transcripts when it has a JavaScript tool.
- **Paywalls and sign-ins.** Only visible content is summarized, and the clip says so.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Claude Code says no page is open | Open the Browser pane (Cmd/Ctrl+Shift+B) and load the page, or include the URL in your request. |
| Clip is cut off at a login or paywall (Claude Code) | Sign in to the site inside the Browser pane once; it has its own logins, separate from Chrome. |
| Gleaner doesn't respond to "save this" | Check you're on the new side panel (not classic) and that Gleaner is enabled in your skills. |
| ChatGPT can't see the page | Connect your browser in ChatGPT, or switch to Work mode for the Work browser. Or include the URL or paste the text. |
| It saved the whole page instead of my highlight | Highlight again right before asking, or name the part: "grab the part about X." Some sites clear highlights when you click away. |
| Clip wasn't saved to Drive or my project | The default is a Markdown file in the conversation. Say "save to Drive" (or "save it to this project" in Claude Code and Cowork) to store that clip, or set a default destination with `/gleaner:preferences setup`. |
| "Couldn't reach the project folder" | Open the Claude desktop app and make sure it's connected, then ask again. |
| Clip saved as a `.md` file, not a formatted Doc | Markdown is the default. Say "save it as a Google Doc" for one Doc, or set your default format to `auto` to get Docs whenever Drive can convert them. |
| Similar tags like `#ai-design` and `#ai-designs` | Name the tag you want in the request ("tag it ai-design"). Gleaner reuses existing spellings by default, so this gets rarer as your library grows. |

## Customizing

Gleaner's behavior lives in [`plugins/gleaner/skills/glean/SKILL.md`](plugins/gleaner/skills/glean/SKILL.md), with video-specific steps (transcript, Key moments format) in [`plugins/gleaner/skills/youtube/SKILL.md`](plugins/gleaner/skills/youtube/SKILL.md). Common edits:

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
│       └── release.yml             # tags and publishes a GitHub Release when the version changes on main
├── docs/
│   ├── artifacts/                  # HTML artifacts
│   ├── chatgpt-marketplace.md      # ChatGPT import, compatibility, and manual checklist
│   ├── plans/                      # planning notes
│   └── preferences-testing.md      # maintainer-run preference scenarios
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
│   ├── changelog.mjs               # changelog parsing shared by the release scripts
│   ├── release.mjs                 # npm run release: bump, date the changelog, validate, commit
│   ├── release.test.mjs            # release script tests
│   ├── release-notes.mjs           # prints one version's changelog entry for the GitHub Release
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

Validation runs locally without GitHub Actions or a build step. After dependencies are installed, the static checks need no network access. These checks do not establish live ChatGPT marketplace, browser, or connector compatibility; use the [manual checklist](docs/chatgpt-marketplace.md#validation-checklist) for that.

In Claude Code, a hook in `.claude/settings.json` reruns both strict checks after each Write or Edit under `.claude-plugin/` or `plugins/`. It doesn't see shell edits or run markdownlint, so still run `npm run validate` before pushing.

### Releasing

Only changes to what the skills do get a new version. In Claude Code, `/release minor` (or `patch` or `major`) walks through the steps below. By hand, add the user-facing changes as bullets under a `**Unreleased**` line at the top of the [changelog](#changelog), write the commit body bullets to a file outside the repository, and run:

```bash
npm run release -- minor --summary "add a notion destination" --body ../release-body.txt
```

The script bumps `version` in `plugins/gleaner/.claude-plugin/plugin.json`, replaces `**Unreleased**` with the new version and today's date, runs `npm run validate` and `npm test`, and commits every tracked change as `Gleaner X.Y.Z: <summary>`, on a new `release/X.Y.Z` branch when run on `main`. It needs the Claude CLI on `PATH` so both strict checks run, refuses untracked files, and restores both files if validation or the commit fails.

When a merge to `main` changes the version, the [release workflow](.github/workflows/release.yml) tags `vX.Y.Z` and publishes a GitHub Release whose notes are that version's changelog entry. To publish a version that is on `main` but not released yet, run the workflow from the repository's Actions tab.

## License

MIT © Shawn Sandy

## Changelog

**Unreleased**
- Clips now end their Takeaways with a copy-and-paste prompt for getting follow-ups later. It names the clip and where it's stored, gives the path for local folders, or asks you to attach the file for a clip given in the conversation. Clips saved inside the Claude Code project also get a `claude` terminal command that starts Claude Code and sends the prompt.

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
