---
session-id: "403e6ae3-770d-412b-9acf-26525bf38fe2"
date: 2026-10-19
source: "403e6ae3-770d-412b-9acf-26525bf38fe2.jsonl"
type: session-export
title: "Chat-file default for Gleaner clips"
team-artifact-url: https://claude.ai/artifact/K5Uy3FSH9v4jJ3pZczFiMG
---

# Chat-file default for Gleaner clips

## At a glance

- **Changes:** 7
- **Files:** 9 (plus this record)
- **Decisions:** 7
- **Open items:** 5

Gleaner now hands every clip back as a Markdown file in the chat when no destination is set, on every surface: the Chrome side panel, ChatGPT, Claude Code, and Cowork. Before, the default was Google Drive, or the project folder in Claude Code. The work is committed as `adf6d45` on branch `claude/clip-storage-no-external-acb654`. It is not pushed, not version-bumped, and not live-tested.

The session started with a question: where do clips go when there is no external storage? The answer led to a request to make the chat file the default everywhere.

## What changed

### Clips come back in the chat by default

- **Who it affects:** every user who has not set a default destination.
- **What is different:** with no saved preference, Gleaner gives the clip as a Markdown file in the conversation. It stores nothing unless the user names a destination.
- **How to reach it:** say "save this page" with no preferences set. Glean step 2 and the new "This conversation" section of step 6 in `plugins/gleaner/skills/glean/SKILL.md`.

### A flag and phrases to pick the chat on purpose

- **Who it affects:** users whose saved default is somewhere else.
- **What is different:** `--to chat`, "just give me the file", "in the chat", or "don't save it anywhere" pick the conversation for one save.
- **How to reach it:** `save this page --to chat`, or `/gleaner:glean --to chat`.

### Cowork stops saving into the open project on its own

- **Who it affects:** Cowork users.
- **What is different:** working inside a Cowork project no longer makes it the destination. Saying "this project" still saves there.
- **How to reach it:** "save it to this project" inside Cowork.

### "Save it as a Google Doc" means Drive everywhere

- **Who it affects:** users on any surface who ask for a Google Doc.
- **What is different:** that phrase, and "put it in Browser Research", now pick Drive on every surface. Before, only Claude Code needed this rule, because Drive was already the default everywhere else.
- **How to reach it:** "save it as a Google Doc".

### Search and the duplicate check skip chat clips

- **Who it affects:** users who search their clips or re-save a page.
- **What is different:** a chat clip is not stored, so there is nothing to search. With no stored destination set, "what did I save about X" says so and asks where to look.
- **How to reach it:** the Clip index section and the duplicate check in glean step 2.

### First-save setup suggests leaving the destination unset

- **Who it affects:** first-time users, and any skill that adopts the shared preferences.
- **What is different:** when the default is not a stored destination type, setup suggests leaving the destination unset, which keeps the chat default.
- **How to reach it:** `plugins/gleaner/skills/preferences/references/contract.md`, the setup paragraph.

### Follow-ups can read a clip from the chat

- **Who it affects:** users of `/gleaner:follow-up`.
- **What is different:** a clip given in this conversation is read from the conversation itself, then updated in place by giving the file again.
- **How to reach it:** "what should I follow up on?" right after a chat save.

## How it works now

How Gleaner picks a destination for a save. The only change is the last box: with nothing set, the clip now goes to the chat instead of Drive or the project folder.

```mermaid
flowchart TD
  A[Save request] --> B{--to flag?}
  B -- yes --> Z[Use the flagged destination]
  B -- no --> C{Destination named in words?}
  C -- yes --> Y[Use the named destination]
  C -- no --> D{Session, project, or user preference?}
  D -- yes --> X[Use the preferred destination]
  D -- no --> E[This conversation: Markdown file in the chat]
  E --> F{Can this session send files?}
  F -- yes --> G[Send name.md, written outside the project]
  F -- no --> H[Whole clip in one code block, file name above it]
```

How a chat clip reaches the user. A real file when the session has a file tool, otherwise one code block. Both stay in the chat only.

## Before and after

| Rule | Before | After |
| --- | --- | --- |
| Default with no preference, Chrome side panel and ChatGPT | Google Drive, `Browser Research/<Category>/` | Markdown file in the chat |
| Default with no preference, Claude Code | `browser-research/<category>/` in the project | Markdown file in the chat |
| Default with no preference, inside a Cowork project | That Cowork project's folder | Markdown file in the chat |
| Choosing the chat on purpose | Not possible; it was only the backup | `--to chat` or "just give me the file" |
| "Save it as a Google Doc" | Drive (a rule only Claude Code needed) | Drive on every surface |
| A destination can't be reached | Hand over the Markdown file, say where it was not saved | Same, now named as the "This conversation" destination |
| Duplicate-page check | Searches the default destination | Skipped for chat clips |
| "What did I save about X?" with no preferences | Searches the surface default | Says chat clips can't be searched, asks where to look |
| First-save setup suggestion | The surface's destination (Drive or the project) | Leave the destination unset |
| Updating a clip saved this session | Replace it where it was saved | For a chat clip, give the whole file again under the same name |

## Decisions

### Make the chat file the default on every surface

- **Chosen:** the chat file is the default in the Chrome side panel, ChatGPT, Claude Code, and Cowork.
- **Why:** the user asked for one default everywhere, including Claude Code and Cowork.
- **Rejected:** chat default only for the side panel and ChatGPT, keeping Claude Code on the project folder. Claude recommended this, because Claude Code had saved to the project folder since 1.2.0. The user chose every surface instead.

### Turn the old fallback into a named destination

- **Chosen:** "This conversation" is a destination like Drive or Notion, and the fallback now points at it.
- **Why:** the behavior already existed as the fallback ("give the user the Markdown file"). Naming it gives one place to describe how a chat clip is delivered and updated.
- **Rejected:** a separate new save path next to the fallback. That would describe the same thing twice.

### Do not add a "conversation" preference type yet

- **Chosen:** the chat default applies only when nothing is set. It cannot be saved as a preference.
- **Why:** the preferences file accepts only `drive`, `notion`, `cowork`, `local`, or `artifact`, and `scripts/validate-skills.mjs` enforces that list. Each saved destination also needs a folder path or a remote ID, and a chat has neither. Adding a type means changing the contract, the validator, and the tests.
- **Rejected:** adding a `conversation` provider now. It costs a schema change for a need nobody has hit yet.
- **Cost:** a user who skips setup to keep the chat default gets the setup offer again in each new session. Skipping setup already worked this way.

### Name the flag `--to chat`

- **Chosen:** `--to chat`.
- **Why:** short, and it matches how people say it ("in the chat").
- **Rejected:** `--to conversation`, which is longer to type.

### Send a real file when possible, else one code block

- **Chosen:** if the session can send files, write `<name>.md` outside the project and send it. Otherwise put the whole clip in one code block, with the file name above it and a fence longer than any code block inside the clip.
- **Why:** a real file is easiest to keep, but not every surface can send one. A code block works everywhere.
- **Rejected:** always a code block, which loses the download where one is possible. Also rejected: writing the file into `browser-research/`, which puts files in the repo, the thing this change stops.

### Ask where to search when no stored destination is set

- **Chosen:** with no preference, a search says chat clips can't be searched and asks which location to search.
- **Why:** there is no single place to look any more, and guessing could miss clips.
- **Rejected:** automatically searching the old defaults (Drive and `browser-research/`). That adds rules and still guesses.

### Leave the version bump to /release

- **Chosen:** an **Unreleased** changelog entry only. The version stays 2.5.0.
- **Why:** the project's CLAUDE.md says to cut versions with `/release`, which bumps, dates the entry, validates, and commits.
- **Rejected:** editing `plugin.json`'s version by hand.

## Learnings

- **The chat file was never the default.** Git history shows Gleaner 1.0.0 (`a72b8b4`) already defaulted to Google Drive. Handing over the Markdown file was always the fallback for when Drive could not be reached. Users who mostly saw chat files probably had no Drive connector at the time.
- **zsh is not bash.** `${PIPESTATUS[0]}` prints nothing in zsh, where the array is lowercase and starts at 1 (`${pipestatus[1]}`). Rerunning the command without a pipe was the reliable way to read its exit code. A bare `echo ===SK` also fails in zsh, because a word starting with `=` is treated as a command lookup.
- **One edit covered two skills.** The youtube skill runs glean step 2 to pick its destination, so changing glean's default changed video saves too. Only the youtube `argument-hint` needed its own edit.
- **The glean description is almost full.** It is now 1,003 of the validator's 1,024-character limit. The next destination added there needs shorter wording.

## Open items

- **Not live-tested.** Nothing has been tried in the Chrome side panel, ChatGPT, Claude Code, or Cowork. It is unknown whether each surface sends a real `.md` file or falls back to a code block. The project's CLAUDE.md says the maintainer does live testing. `docs/chatgpt-marketplace.md` now has a checklist line for it.
- **Version not bumped.** Run `/release minor` to move to 2.6.0 and date the Unreleased entry.
- **Not pushed, no pull request.** The commit `adf6d45` lives only on the local branch `claude/clip-storage-no-external-acb654`.
- **No stored "conversation" preference.** To let users save the chat as their default, add a `conversation` provider to `contract.md`, accept it in `scripts/validate-skills.mjs` with no path or remote ID, and add tests.
- **This record is uncommitted.** `docs/plans/sessions/switch-clip-default-to-chat-session.md` was written after the commit.

## Files touched

**Skills (the behavior)**
- `plugins/gleaner/skills/glean/SKILL.md`: adds the "This conversation" destination, `--to chat`, the new default in step 2, how chat clips are given and updated, the fallback pointer, and the search rule.
- `plugins/gleaner/skills/youtube/SKILL.md`: adds `chat` to the `argument-hint`.
- `plugins/gleaner/skills/follow-up/SKILL.md`: reads a clip given in the conversation from the conversation.
- `plugins/gleaner/skills/preferences/references/contract.md`: setup suggests leaving the destination unset when the default is not a stored type.

**Manifests (the descriptions)**
- `.claude-plugin/marketplace.json`: plugin description names the chat default.
- `plugins/gleaner/.claude-plugin/plugin.json`: plugin description names the chat default.

**Docs**
- `README.md`: intro, example, features, requirements, quick start, destinations table, flag table, troubleshooting row, and the Unreleased changelog entry.
- `plugins/gleaner/skills/README.md`: the "Before you start" destination line.
- `docs/chatgpt-marketplace.md`: a manual test line for the chat default.

## Glossary

- **Gleaner:** this Claude plugin. It saves web pages, parts of them, and YouTube videos as summarized, tagged notes.
- **Clip (or glean):** one saved note: a Markdown summary with Source, Saved, Category, Type, and Tags lines at the top.
- **Destination:** where a clip goes: the conversation, Google Drive, Notion, a Cowork project, the Claude Code project, a local path, or a claude.ai artifact.
- **Surface:** the place Gleaner runs: the Chrome side panel, Claude Code desktop's built-in browser, Cowork, or ChatGPT.
- **Chrome side panel:** the Claude panel inside Google Chrome.
- **Cowork:** the Claude desktop app's project workspace, with a folder on the user's computer.
- **Claude Code:** Anthropic's coding tool. Here, "This project" means the folder its session works in.
- **`--to` flag:** a word added to a request (`--to drive`, `--to chat`) that sets the destination for that one save.
- **Preferences / shared contract:** saved defaults for destination and format, with the rules in `contract.md`. Other skills can use them too.
- **Provider:** a destination type the preferences file can store: drive, notion, cowork, local, or artifact.
- **Fallback:** what Gleaner does when a destination can't be reached. It now gives the clip in the conversation.
- **Duplicate check:** before saving a page, Gleaner looks for an earlier clip of the same URL and asks before saving another.
- **Clip index:** Gleaner's search over saved clips ("what did I save about X?").
- **Artifact:** a private web page on claude.ai. One of Gleaner's destinations.
- **SKILL.md:** the instruction file a skill's model reads as plain text when it runs. Here it is the product itself.
- **Unreleased:** the changelog heading for changes not yet in a version. `/release` turns it into a numbered entry.
- **`/release`:** the project's command that bumps the version, dates the changelog, runs the checks, and commits.
- **Scratchpad:** a temporary folder for the session, outside the project.
- **Code fence:** the run of backticks that opens and closes a Markdown code block. A longer outer fence keeps inner code blocks from closing it early.
- **Strict validators:** `claude plugin validate --strict`, run on the marketplace and the plugin by `npm run validate`.
