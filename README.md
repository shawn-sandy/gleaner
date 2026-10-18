# Gleaner

**Gather the best of what you read into tagged, searchable clips.**

Gleaner is a Claude plugin for the Chrome side panel and the Claude Code desktop browser, and its glean skill also works from ChatGPT's connected Chrome tabs and Work browser. Ask it in plain language to keep a page or a YouTube video, or just the parts that matter, and it writes a short, structured summary, tags it, files it by category, and saves it to Google Drive, Notion, a Cowork project, your Claude Code project, or a private claude.ai artifact. Later, ask what you saved and it finds it.

```text
You:     grab the part about animation lengths, for the motion post
Gleaner: Added part 1: animation lengths ("Keep most UI transitions…"). Add more, or say "done" to save.
You:     and this table too
Gleaner: Added part 2: this table ("Duration by element size…").
You:     done
Gleaner: Saved "Motion timing guidelines" to Browser Research / Design Engineering
         #motion #animation #css-transitions — two parts on picking durations by element size.
```

---

## Contents

- [Features](#features)
- [Skills](#skills)
- [ChatGPT marketplace](#chatgpt-marketplace)
- [Install](#install)
- [Local development and validation](#local-development-and-validation)
- [Quick start](#quick-start)
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
  - [Using Gleaner in Claude Code desktop](#using-gleaner-in-claude-code-desktop)
- [Phrase cheat sheet](#phrase-cheat-sheet)
- [What a clip looks like](#what-a-clip-looks-like)
- [How Gleaner decides](#how-gleaner-decides)
- [Limitations](#limitations)
- [Troubleshooting](#troubleshooting)
- [Customizing](#customizing)
- [Repository layout](#repository-layout)
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
- **No duplicates.** Saving a page you've already clipped offers an updated copy that links to the original. Nothing is ever overwritten or deleted.
- **Search by asking.** "What did I save about Cowork?" returns a sortable table. Ask for a spreadsheet snapshot whenever you want one.
- **Drive, Notion, artifacts, or local.** Saves to Google Drive by default, to a Notion database, to a private claude.ai artifact, to a Cowork project folder, or, in Claude Code, straight into the project you're working on.
- **Works where you browse.** The Chrome side panel, the built-in browser in Claude Code desktop, or ChatGPT's connected Chrome tabs and Work browser. Hand it a URL and it opens or fetches the page for you.

## Skills

Gleaner includes two skills that share the same clip format and saving workflow:

| Skill | Claude Code command | Use it for |
| --- | --- | --- |
| [glean](plugins/gleaner/skills/glean/SKILL.md) | `/gleaner:glean` | Save pages, collect passages, keep answers, and find saved clips |
| [youtube](plugins/gleaner/skills/youtube/SKILL.md) | `/gleaner:youtube` | Save videos and moments using transcripts and timestamped summaries |

Use plain-language requests or invoke a command directly in Claude Code. The `youtube` skill uses `glean` for destinations, tags, duplicate checks, and saving. See the [skills usage guide](plugins/gleaner/skills/README.md) for examples.

## ChatGPT marketplace

Gleaner uses the same GitHub marketplace manifest for Claude and ChatGPT. In ChatGPT workspaces that support GitHub marketplace imports, import `https://github.com/shawn-sandy/gleaner` from the workspace's Plugins settings. The root manifest registers both `glean` and `youtube` skills through the Gleaner plugin. Browser and Google Drive access must be connected separately; importing the plugin does not grant them.

See [ChatGPT marketplace setup and compatibility](docs/chatgpt-marketplace.md) for installation, supported browser surfaces, limitations, and a manual test checklist. ChatGPT marketplace import requires verification in an eligible workspace.

## Install

**Requirements**
- A paid Claude plan with the new Chrome side panel (the Cowork-style panel; its three-dot menu shows "Switch back to classic").
- The **Google Drive** connector, for the default destination.
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

In Claude Code the skills are also available as `/gleaner:glean` and `/gleaner:youtube`.

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
3. Gleaner replies with where it saved the clip, its tags, and a one-line summary.
4. Open Google Drive: your clip is in **Browser Research → *category***.

That's it. Everything below is optional.

---

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

> **Heads up:** Collected parts live in the side panel conversation until you save. Close the session first and they're gone.

### Saving answers

Ask Claude about the page you're reading, such as a clarification, a list of steps, or more detail on one topic, then save the answer:

> how do I rotate an API key in these docs?
> save that
> explain the auth flow and save it

"Save that" right after an answer saves the answer and says so; say "save the page" if you meant the whole page. While you're collecting parts, an answer is added as another part instead, and "done" saves them together:

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

If a video has no captions, Gleaner saves a clip from the title, description, and chapters, and says so. Paste the transcript (**…more → Show transcript** on YouTube) to get a full summary as an updated copy. Parts need the transcript, so without one Gleaner won't save a part; it asks you to paste the transcript and offers a clip of the whole video instead.

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
| **Google Drive** → `Browser Research/<category>/` | Default in the Chrome side panel, ChatGPT, and Cowork; "save to Drive" in Claude Code | Google Drive connector |
| Another Drive folder | "save to my Research folder" | Google Drive connector |
| **Cowork project** → `browser-research/<category>/` | "save to my Serve513 project", or work inside a project | Claude desktop app open and connected |
| **This project** → `browser-research/<category>/` | Default in Claude Code | A Claude Code session |
| **Notion** → `Browser Research` database | "save to Notion", or `--to notion` | Notion connector |
| **Artifact** → a private page on claude.ai | "save it as an artifact", or `--to artifact` | A session that can publish artifacts, such as Claude Code |

Folders are created the first time they're needed. In Drive, clips are saved as Google Docs; say "keep it as markdown" for a `.md` file instead. Where the session's Drive connector can't convert (some ChatGPT sessions), clips are saved as `.md` files.

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

Say "save it as an artifact" or add `--to artifact`. Each clip becomes its own artifact: a private web page on claude.ai with the clip's details (source, date, category, type, tags, note) at the top and the summary below, readable in light or dark mode and on a phone. It stays private until you share it. Every save, updated copies included, is a new artifact; Gleaner never republishes over an old one.

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
| `--to drive` | Drive → `Browser Research/<Category>/` |
| `--to drive:"Folder Name"` | Drive → `<Folder Name>/<Category>/` |
| `--to notion` | Notion → `Browser Research` database |
| `--to notion:"Database Name"` | Notion → that database |
| `--to artifact` | A new private artifact on claude.ai |
| `--to local` | Your working folder → `browser-research/<category>/` |
| `--to cowork:"Project Name"` | That Cowork project → `browser-research/<category>/` |
| `--to <path>` | Any local folder, like `./notes` or `~/Documents/research` → `<path>/<category>/` |

A flag beats a destination you describe in words, which beats the default. If the flagged destination can't be reached, Gleaner tells you rather than quietly saving somewhere else.

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

You get a table, newest first: date, title (linked), category, type, tags, note, and source. Multi-part clips are marked with their count, such as "(3 parts)" or "(2 parts, 1 answer)." Keyword searches match titles, tags, notes, and summary text.

You can also search directly in Google Drive: type a tag like `#motion` or a note phrase into Drive's search bar.

Clips saved as artifacts are searched only when you ask for them ("what did I save to artifacts about Cowork?"); see [Saving as an artifact](#saving-as-an-artifact).

### Index spreadsheet

> make me an index sheet

Creates a new Google Sheet, `Clip Index <date>`, in Browser Research with every clip as a row. It's a **snapshot**: it won't update itself, so ask for a fresh one whenever you need it.

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
- **Clips land in your project folder.** In Claude Code, clips are saved to `browser-research/<category>/` in the folder Claude Code is working in. Gleaner never commits them; commit the clips or add `browser-research/` to `.gitignore`, your call.
- **Want Drive instead?** Say "save to Drive." Your claude.ai connectors carry over when you're signed in to Claude Code with your Claude account.

## Phrase cheat sheet

| Goal | Say something like |
| --- | --- |
| Save a whole page | "save this page" · "keep this article" · "bookmark this" |
| Save a highlight now | highlight, then "save this" |
| Collect a part | "add this" · "grab the part about X" · "this table too" |
| Save collected parts | "done" · "save them" · "wrap it up" |
| Save an answer | "save that" · "save those steps" · "add that answer" |
| Review or fix parts | "what have I got?" · "drop part 2" · "start over" |
| Add a reason | add ", for …" or ", because …" to any request |
| Pick a folder | "…to my Research folder" · "…to my Serve513 project" · "…to this project" |
| Clip a link | "save https://…" |
| Save a YouTube video | "save this video" · "save https://youtu.be/…" |
| Save part of a video | "keep 3:10 to 5:40" · "grab the part about X" · "add this part" |
| Force a destination | add `--to drive`, `--to notion`, `--to artifact`, `--to local`, or `--to ./path` |
| Pick a category | "file this under design" |
| Add tags | "tag it motion and css" |
| Find clips | "what did I save about X?" · "clips from this week" |
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
```

**Part clip** adds a `**Scope:** 2 parts from 1 page` line, and its body is a **Parts** section with one heading per part (titled by your note or topic), a link to its source, its own note, and 2–4 bullets.

**Answer** parts sit in the same Parts section, headed by your question, with the answer kept as given. The Scope line counts them separately, such as `2 parts, 1 answer from 1 page`. A clip of a single answer skips the TL;DR.

**Video clip** adds a `**Video:**` line (channel, publish date, length, and transcript source) and swaps Key points for **Key moments**, each linking to its second in the video. A video part's heading links to where it starts, such as `3:10–5:40`.

Files are named `yyyy-mm-dd-short-title`. If a name is taken, Gleaner adds `-2`, `-3`, and so on.

## How Gleaner decides

- **"Page," "article," "doc"** → the whole page, even if text is highlighted.
- **"Part," "bit," "section," "table," "the part about X"** → a part.
- **A plain "save this"** → saves your highlight or collected parts if there are any, otherwise the whole page.
- **"Save that" right after an answer** → takes the answer, even with text highlighted, and says so: it saves the answer, or adds it as the next part while you're collecting. "Save this page" still saves the page.
- **Highlights under ~40 characters** (a stray word) are ignored.
- **It acts instead of asking**, then tells you what it assumed: *"Saved the whole page — say 'just the highlighted part' if you meant only that."* It asks only when two readings are equally likely, or a named destination doesn't exist.
- **Duplicate check:** saving a page you've clipped before shows the earlier clip and offers an updated copy (marked "Supersedes" with a link) or skipping. Part clips skip this check.

## Limitations

- **One highlight at a time.** Chrome doesn't support multiple simultaneous selections; collect parts one by one instead.
- **Unreadable highlights.** Text inside embedded frames, Chrome's PDF viewer, and apps like Google Docs often can't be read. Describe the part or paste it instead.
- **Drive files can't be edited.** The Drive connector can create and read files but not change them, so updates are new copies and index sheets are snapshots.
- **No claude.ai Projects.** Cowork can read them but not write to them.
- **Artifact search is one page at a time.** Gleaner opens each artifact to find its clips, about 50 per request.
- **YouTube needs captions.** Video clips are built from the transcript. Without captions (or during a live stream), the clip comes from the title, description, and chapters only, and parts can't be clipped until you paste the transcript. Private, members-only, and age-restricted videos need you signed in to YouTube in that browser.
- **Paywalls and sign-ins.** Only visible content is summarized, and the clip says so.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Claude Code says no page is open | Open the Browser pane (Cmd/Ctrl+Shift+B) and load the page, or include the URL in your request. |
| Clip is cut off at a login or paywall (Claude Code) | Sign in to the site inside the Browser pane once; it has its own logins, separate from Chrome. |
| Gleaner doesn't respond to "save this" | Check you're on the new side panel (not classic) and that Gleaner is enabled in your skills. |
| It saved the whole page instead of my highlight | Highlight again right before asking, or name the part: "grab the part about X." Some sites clear highlights when you click away. |
| "Couldn't reach the project folder" | Open the Claude desktop app and make sure it's connected, then ask again. |
| Clip saved as plain text, not a formatted Doc | Drive's conversion may not have applied formatting. Ask "keep it as markdown" to save a `.md` file instead. |
| Similar tags like `#ai-design` and `#ai-designs` | Name the tag you want in the request ("tag it ai-design"). Gleaner reuses existing spellings by default, so this gets rarer as your library grows. |

## Customizing

Gleaner's behavior lives in [`plugins/gleaner/skills/glean/SKILL.md`](plugins/gleaner/skills/glean/SKILL.md), with video-specific steps (transcript, Key moments format) in [`plugins/gleaner/skills/youtube/SKILL.md`](plugins/gleaner/skills/youtube/SKILL.md). Common edits:

- **Default folder:** change `Browser Research` in step 2.
- **Categories:** edit the list in step 4 (names double as folder names).
- **Summary length:** adjust the word limits in step 3.
- **Default destination:** make a Cowork project the default instead of Drive in step 2.

Fork this repo, make your edits in `plugins/gleaner/skills/glean/SKILL.md`, bump `version` in `plugins/gleaner/.claude-plugin/plugin.json`, and add your fork as a marketplace.

## Repository layout

```text
gleaner/
├── .claude-plugin/
│   └── marketplace.json        # marketplace "shawn-sandy"
├── package.json              # local validation commands and dev dependencies
├── package-lock.json         # reproducible dependency versions
├── scripts/
│   └── validate-skills.mjs    # Skill, metadata, manifest, and reference checks
├── plugins/
│   └── gleaner/
│       ├── .claude-plugin/
│       │   └── plugin.json     # plugin manifest (version lives here)
│       └── skills/
│           ├── README.md       # usage guide for both skills
│           ├── glean/
│           │   ├── agents/
│           │   │   └── openai.yaml  # skill name shown in ChatGPT
│           │   └── SKILL.md    # pages, parts, answers, and search
│           └── youtube/
│               ├── agents/
│               │   └── openai.yaml  # YouTube skill display metadata
│               └── SKILL.md    # YouTube videos (uses glean for saving)
├── LICENSE
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

Run `npm run validate` before pushing. It checks both Skills' YAML frontmatter and nonempty bodies, their `agents/openai.yaml` display metadata, marketplace and plugin JSON, required files, and local file references in the Skills and installation guides. References include Markdown inline links, reference definitions, relative file paths with extensions in inline code, and metadata icons; fenced examples, remote URLs, and heading anchors are excluded. Markdownlint then checks repository Markdown using `.markdownlint-cli2.jsonc`.

When `claude` is on `PATH`, validation also runs both existing strict checks:

```bash
claude plugin validate . --strict
claude plugin validate ./plugins/gleaner --strict
```

Without the Claude CLI, those two checks print an explicit skip; all other local checks still run. An installed CLI that fails validation makes the command fail. Install Claude Code and rerun before claiming Claude validation passed. Run `npm test` for the validator's fixture tests.

Validation runs locally without GitHub Actions or a build step. After dependencies are installed, the static checks need no network access. These checks do not establish live ChatGPT marketplace, browser, or connector compatibility; use the [manual checklist](docs/chatgpt-marketplace.md#validation-checklist) for that.

## License

MIT © Shawn Sandy

## Changelog

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
