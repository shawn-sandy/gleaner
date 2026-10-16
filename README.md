# Gleaner

**Gather the best of what you read into tagged, searchable clips.**

Gleaner is a Claude skill for the Chrome side panel. Ask it in plain language to keep a page, or just the parts that matter, and it writes a short, structured summary, tags it, files it by category, and saves it to Google Drive or a Cowork project. Later, ask what you saved and it finds it.

```
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
- [Install](#install)
- [Quick start](#quick-start)
- [Usage guide](#usage-guide)
  - [Saving a whole page](#saving-a-whole-page)
  - [Saving parts of pages](#saving-parts-of-pages)
  - [Adding notes](#adding-notes)
  - [Choosing where clips go](#choosing-where-clips-go)
  - [Categories and tags](#categories-and-tags)
  - [Finding your clips](#finding-your-clips)
  - [Index spreadsheet](#index-spreadsheet)
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
- **Your reasons, kept.** Add a note to any request ("…for the motion post") and it's saved with the clip. Gleaner never invents notes.
- **Organized automatically.** Every clip gets a category (used as its folder), a type, and 3–6 specific tags, reusing your existing tag spellings.
- **No duplicates.** Saving a page you've already clipped offers an updated copy that links to the original. Nothing is ever overwritten or deleted.
- **Search by asking.** "What did I save about Cowork?" returns a sortable table. Ask for a spreadsheet snapshot whenever you want one.
- **Drive or local.** Saves to Google Drive by default (works without the desktop app), or to a Cowork project folder on your computer.

## Install

**Requirements**
- A paid Claude plan with the new Chrome side panel (the Cowork-style panel; its three-dot menu shows "Switch back to classic").
- The **Google Drive** connector, for the default destination.
- *Optional:* the Claude desktop app, open and connected, for saving to Cowork projects.

### Claude app and Cowork

1. Open **Customize → Plugins**, then choose **Add → Add marketplace**.
2. Enter `shawn-sandy/gleaner`.
3. Find **Gleaner** in the marketplace and install it. It's available in the Chrome side panel right away.

### Claude Code

```
/plugin marketplace add shawn-sandy/gleaner
/plugin install gleaner@shawn-sandy
```

Or from your shell:

```bash
claude plugin marketplace add shawn-sandy/gleaner
claude plugin install gleaner@shawn-sandy --scope user
```

In Claude Code the skill is also available as `/gleaner:clip`.

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

### Adding notes

A note is your reason for saving. Add it anywhere in the request:

| You say | Note saved |
|---|---|
| save this page, good intro to view transitions | good intro to view transitions |
| grab the part about animation lengths | animation lengths |
| grab the part about easing, for the motion post | easing — for the motion post |
| done, for the FrontendEngine timing article | for the FrontendEngine timing article *(whole clip)* |

Notes are searchable and show up in your clip index. If you don't give one, the clip simply has no note; Gleaner never asks for one or writes one for you.

### Choosing where clips go

| Destination | How to choose it | Needs |
|---|---|---|
| **Google Drive** → `Browser Research/<category>/` | Default | Google Drive connector |
| Another Drive folder | "save to my Research folder" | Google Drive connector |
| **Cowork project** → `clips/<category>/` | "save to my Serve513 project", or work inside a project | Claude desktop app open and connected |

Folders are created the first time they're needed. In Drive, clips are saved as Google Docs; say "keep it as markdown" for a `.md` file instead.

If a destination can't be reached, Gleaner gives you the clip as a file and says plainly that it wasn't saved. It never claims a save that didn't happen.

> Gleaner can't write to claude.ai Projects. Cowork can read them but not add files to them.

### Categories and tags

Each clip gets exactly one **category**, which is also its folder:

| Category | Covers |
|---|---|
| AI & Agents | models, prompting, Claude, agents, MCP, skills |
| Design Engineering | UI/UX, design systems, CSS, prototyping, accessibility |
| Frontend Dev | Astro, React, TypeScript, build tools, performance |
| Tools & Workflow | apps, productivity, dev tooling, automation |
| Content & Writing | blogging, newsletters, social media, writing craft |
| Business & Career | product, marketing, hiring, freelancing |
| Other | anything else (Gleaner will mention it) |

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

You get a table, newest first: date, title (linked), category, type, tags, note, and source. Multi-part clips are marked "(N parts)." Keyword searches match titles, tags, notes, and summary text.

You can also search directly in Google Drive: type a tag like `#motion` or a note phrase into Drive's search bar.

### Index spreadsheet

> make me an index sheet

Creates a new Google Sheet, `Clip Index <date>`, in Browser Research with every clip as a row. It's a **snapshot**: it won't update itself, so ask for a fresh one whenever you need it.

---

## Phrase cheat sheet

| Goal | Say something like |
|---|---|
| Save a whole page | "save this page" · "keep this article" · "bookmark this" |
| Save a highlight now | highlight, then "save this" |
| Collect a part | "add this" · "grab the part about X" · "this table too" |
| Save collected parts | "done" · "save them" · "wrap it up" |
| Review or fix parts | "what have I got?" · "drop part 2" · "start over" |
| Add a reason | add ", for …" or ", because …" to any request |
| Pick a folder | "…to my Research folder" · "…to my Serve513 project" |
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

Files are named `yyyy-mm-dd-short-title`. If a name is taken, Gleaner adds `-2`, `-3`, and so on.

## How Gleaner decides

- **"Page," "article," "doc"** → the whole page, even if text is highlighted.
- **"Part," "bit," "section," "table," "the part about X"** → a part.
- **A plain "save this"** → saves your highlight or collected parts if there are any, otherwise the whole page.
- **Highlights under ~40 characters** (a stray word) are ignored.
- **It acts instead of asking**, then tells you what it assumed: *"Saved the whole page — say 'just the highlighted part' if you meant only that."* It asks only when two readings are equally likely, or a named destination doesn't exist.
- **Duplicate check:** saving a page you've clipped before shows the earlier clip and offers an updated copy (marked "Supersedes" with a link) or skipping. Part clips skip this check.

## Limitations

- **One highlight at a time.** Chrome doesn't support multiple simultaneous selections; collect parts one by one instead.
- **Unreadable highlights.** Text inside embedded frames, Chrome's PDF viewer, and apps like Google Docs often can't be read. Describe the part or paste it instead.
- **Drive files can't be edited.** The Drive connector can create and read files but not change them, so updates are new copies and index sheets are snapshots.
- **No claude.ai Projects.** Cowork can read them but not write to them.
- **Paywalls and sign-ins.** Only visible content is summarized, and the clip says so.

## Troubleshooting

| Problem | Fix |
|---|---|
| Gleaner doesn't respond to "save this" | Check you're on the new side panel (not classic) and that Gleaner is enabled in your skills. |
| It saved the whole page instead of my highlight | Highlight again right before asking, or name the part: "grab the part about X." Some sites clear highlights when you click away. |
| "Couldn't reach the project folder" | Open the Claude desktop app and make sure it's connected, then ask again. |
| Clip saved as plain text, not a formatted Doc | Drive's conversion may not have applied formatting. Ask "keep it as markdown" to save a `.md` file instead. |
| Similar tags like `#ai-design` and `#ai-designs` | Name the tag you want in the request ("tag it ai-design"). Gleaner reuses existing spellings by default, so this gets rarer as your library grows. |

## Customizing

Gleaner's behavior lives in [`plugins/gleaner/skills/clip/SKILL.md`](plugins/gleaner/skills/clip/SKILL.md). Common edits:

- **Default folder:** change `Browser Research` in step 2.
- **Categories:** edit the list in step 4 (names double as folder names).
- **Summary length:** adjust the word limits in step 3.
- **Default destination:** make a Cowork project the default instead of Drive in step 2.

Fork this repo, make your edits in `plugins/gleaner/skills/clip/SKILL.md`, bump `version` in `plugins/gleaner/.claude-plugin/plugin.json`, and add your fork as a marketplace.

## Repository layout

```
gleaner/
├── .claude-plugin/
│   └── marketplace.json        # marketplace "shawn-sandy"
├── plugins/
│   └── gleaner/
│       ├── .claude-plugin/
│       │   └── plugin.json     # plugin manifest (version lives here)
│       └── skills/
│           └── clip/
│               └── SKILL.md    # the skill
├── LICENSE
└── README.md
```

Validate changes before pushing:

```bash
claude plugin validate .
claude plugin validate ./plugins/gleaner
```

## License

MIT © Shawn Sandy

## Changelog

**1.0.0** (2026-10-16)
- Renamed from *page-to-project* to **Gleaner** and published as a plugin marketplace.
- Natural-language requests replace fixed commands.
- Part clips: collect highlights or described sections across pages, each with its own note.
- Highlight-aware saving, tested in Chrome.
- Notes, categories, types, and tags on every clip.
- Duplicate check by URL, with "Supersedes" links.
- On-demand clip index and spreadsheet snapshots.
- Google Drive (default, `Browser Research`) and Cowork project destinations.
