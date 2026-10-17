---
session-id: "3e3c4ed6-4ab3-4f90-9d37-78d5c3bfb810"
date: 2026-10-16
source: "3e3c4ed6-4ab3-4f90-9d37-78d5c3bfb810.jsonl"
type: session-export
title: "Saving answers as Gleaner clips"
team-artifact-url: https://claude.ai/artifact/FGUfFANH5kkZdR8nA3J8rR
---

## At a glance

6 changes · 2 files · 10 decisions · 6 open items

Gleaner can now keep the answers Claude gives about a page, not just the page itself. Ask a question while reading docs, get a clarification or a list of steps, then say "save that" and the answer becomes a clip. The work lives in the `clip` skill and the README on branch `claude/skill-page-questions-f17a91`. It passes every automated check, but it is not committed, not versioned, and not tested live.

## What changed

### Save an answer you just got

- **Affects:** users.
- **Now:** "save that", "save that answer", "save those steps", or "save what you just told me" saves Claude's most recent answer (or the one named) as its own clip. A bare "save that" right after an answer means the answer even if text is highlighted, and the confirmation says so: "Saved my answer — say 'save the page' if you meant the whole page." Asking "list the setup steps and save them" answers first, then saves.
- **Reach it:** plain language in the Chrome side panel or the Claude Code desktop browser; new **Save answer** row in the Intents table of `plugins/gleaner/skills/clip/SKILL.md`.

### Add an answer to a clip you're collecting

- **Affects:** users.
- **Now:** while parts are being collected, an answer is added as the next part instead of being saved alone, and "done" saves everything together. "Add that answer" or "add those steps too" starts or extends a collection. "Save our back-and-forth about X" adds one part per question and answer.
- **Reach it:** new first source in "Collecting parts" in `SKILL.md`.

### Answers are kept as given, with the question as the heading

- **Affects:** users, and anyone reading clips later.
- **Now:** an answer part is headed by the user's question and keeps the answer word for word, so numbered steps and code survive. Its source line reads "Answer about (page link)", or "Answer, not tied to a page" for a general question. Anything that didn't come from the page is marked "(not from the page)". A clip holding a single answer skips the TL;DR.
- **Reach it:** new "Answer parts" rule in step 3 of `SKILL.md`.

### Answers are counted in a clip's scope and in the index

- **Affects:** users.
- **Now:** the **Scope** line counts answers apart from other parts, such as `2 parts, 1 answer from 1 page`, and the clip index marks titles the same way, such as "(2 parts, 1 answer)". A clip with no page behind it has no Source line and the Type `other`.
- **Reach it:** step 3 rules and "Clip index" step 3 in `SKILL.md`.

### Answers from an earlier session are refused, not rebuilt

- **Affects:** users.
- **Now:** if the answer is no longer in the conversation, Gleaner says it can't see it and offers to answer again, rather than recreating it from memory and saving that as the original.
- **Reach it:** new item in "Edge cases" in `SKILL.md`.

### README documents the feature

- **Affects:** users and teammates.
- **Now:** a "Saving answers" section, a features bullet, a cheat-sheet row, a "How Gleaner decides" rule, a note under "What a clip looks like", and the updated index-count wording.
- **Reach it:** `README.md`, under Usage guide.

## How it works now

```mermaid
flowchart TD
    A[User request right after Claude answered] --> B{Points at the answer?<br/>'save that', 'that answer', 'those steps'}
    B -- no --> C[Existing rules: Save page, Add part, or Save clip]
    B -- yes --> D{Says 'add', or parts already collected?}
    D -- yes --> E[Add the answer as the next part<br/>'Added part 3 ... my answer']
    D -- no --> F[Save now as a one-answer clip]
    E --> G[User says 'done': all parts saved together]
    F --> H[Confirm, noting it saved the answer, not the page]
```

How a request after an answer is routed. The only new branch is "points at the answer"; everything on the "no" side behaves exactly as before.

## Before and after

| Before | After |
|---|---|
| Gleaner could save a page, a highlight, a described section, or pasted text. | It can also save an answer Claude gave about the page. |
| "Save that" after an answer fell through to the page rules and saved the page. | "Save that" right after an answer saves the answer, and the confirmation says so. |
| "Save this" after an answer saved the page silently. | It still saves the page, but the confirmation mentions that "save that answer" saves the answer instead. |
| Every part was squeezed into 2–4 bullets and about 150 words. | Answer parts are kept as given; those limits don't apply to them. |
| A part's heading was the user's note or topic. | An answer part's heading is the user's question. |
| Nothing marked content that didn't come from the source. | Anything in an answer not from the page is marked "(not from the page)". |
| Scope read `3 parts from 2 pages`. | Answers are counted separately: `2 parts, 1 answer from 1 page`. |
| A part clip always had a TL;DR. | A clip of a single answer skips it. |
| A clip always had a Source line. | An answer to a general question with no page has none, and its Type is `other`. |

## Decisions

### Extend the `clip` skill instead of adding a new skill

- **Why:** Claude already answers questions about a page without any skill; the only new behavior is saving the answer. The text is already in the conversation, so nothing new has to be extracted.
- **Rejected:** a separate "ask" or "Q&A" skill. It would compete with `clip` for "save that" and duplicate all of its destination and save logic. The `youtube` skill earned its own file only because it needs transcript extraction.

### Treat an answer as a kind of part, not a new clip format

- **Why:** one format means the destinations, duplicate check, categories, Notion fields, and index all work unchanged. A single saved answer is just a part clip with one part.
- **Rejected:** a separate "answer clip" template, which would need its own rules in every one of those places.

### A bare "save that" right after an answer saves the answer

- **Why:** the user's decision. It matches the skill's existing "act, then say what you assumed" rule, and the confirmation offers "save the page" as the correction.
- **Rejected:** asking every time, which adds a round trip to the most common case.

### Leave "save this" behavior alone

- **Why:** "save this" is the skill's core page-and-highlight intent, and changing it would affect far more requests. The confirmation now points at "save that answer" instead.
- **Rejected:** making "save this" also mean the answer.

### Mid-collection, "save that answer" adds a part rather than saving everything

- **Why:** saving early would clear the collection while the user may still be adding to it; one extra "done" is the cheaper mistake.
- **Rejected:** mirroring Save clip, which saves all parts at once.

### Keep answers as given instead of summarizing them

- **Why:** the 2–4 bullet, 150-word part limit would wreck a numbered step list, which is one of the main things users asked to keep.
- **Rejected:** summarizing answers like any other part.

### Mark anything not from the page

- **Why:** clips are used later as research notes. Mixing Claude's background knowledge in with what the source said, unlabeled, is the main way this feature could mislead.
- **Rejected:** saving answers unlabeled, as if they were page content.

### No new Type value and no auto-save

- **Why:** the Scope line already tells answers apart, so a new Type adds nothing to search. Clips are never overwritten, so saving every answer automatically would flood the folder.
- **Rejected:** a "Q&A" Type, which would need a change to the Notion database's select options; auto-capturing every answer.

### Leave the version bump and changelog to the `release` skill

- **Why:** the project's `CLAUDE.md` says to cut versions with `/release`, and that skill can only be run by the user. It also commits, so it finishes this work in one step.
- **Rejected:** bumping `plugin.json` and writing the changelog entry by hand in this change, which was the original proposal.

### Put the YouTube timestamp rule in the `clip` skill

- **Why:** the user scoped the change to the clip skill, and the youtube skill already reads the clip skill first.
- **Rejected:** editing `plugins/gleaner/skills/youtube/SKILL.md`.

## Learnings

- **The release skill is user-only.** `.claude/skills/release/SKILL.md` sets `disable-model-invocation: true`, so Claude cannot bump the version itself. The plan to bump in this change was dropped after reading it.
- **CI lints every Markdown file.** `.markdownlint-cli2.jsonc` globs `**/*.md`, so new Markdown anywhere in the repo, including this recap record, must pass markdownlint.
- **Plugin validation doesn't check frontmatter YAML.** The two `claude plugin validate` runs pass even with broken frontmatter, so a separate Ruby YAML parse was run. The new description measured 803 characters against the 1024 limit.
- **A frontmatter `title:` counts as the page heading.** Markdownlint's single-heading rule (MD025) flagged this record for having both a `title:` and a top-level `#` heading, so the record carries the title only in frontmatter.
- Nothing else was tried and abandoned.

## Open items

1. **Version and commit.** Run `/release minor` to set 1.7.0, add the README changelog entry, validate, and commit everything on `claude/skill-page-questions-f17a91`. Nothing is committed or pushed, and there is no PR yet.
2. **Live testing.** Not done; the maintainer tests against Chrome, Drive, Notion, and Cowork. Worth trying: "save that" after an answer with text highlighted; "save that answer" mid-collection; an answer mixing page content with background knowledge; a general question with no page saved to Notion (no Source); an answer about a YouTube video with timestamps.
3. **YouTube heading rule overlap.** `youtube/SKILL.md` says each part's heading links to where it starts, which doesn't fit an answer part. How the model resolves this is unverified; a one-line note in the youtube skill would settle it.
4. **Marketing descriptions don't mention answers.** The `plugin.json` description, the `marketplace.json` description, and the README intro still list pages, parts, and videos only. The four-place sync rule covers destinations and surfaces, so it doesn't require an update, but the feature is invisible there.
5. **Pre-existing Notion schema wording.** The Notion property table in `SKILL.md` lists Scope values as `selection` or `N parts from M pages`, which no current template produces. It was not touched.
6. **This recap record.** `docs/plans/sessions/add-answer-clips-session.md` is new and uncommitted; `/release` will include it in its commit unless it is removed first.

## Files touched

### Skill

- `plugins/gleaner/skills/clip/SKILL.md` — new Save answer intent and routing rules, answers as the first part source, the answer-part format, Scope and index counts, the earlier-session edge case, and new trigger phrases in the frontmatter description.

### Docs

- `README.md` — "Saving answers" section and contents link, features bullet, cheat-sheet row, "How Gleaner decides" rule, answer note under "What a clip looks like", and index-count wording.

### This recap

- `docs/plans/sessions/add-answer-clips-session.md` — this record, which holds the published link for later republishes.

## Glossary

- **Gleaner** — a Claude plugin that saves what you read as summarized, tagged clips.
- **Clip** — one saved note: a summary with source, date, category, type, and tags.
- **Skill** — a Markdown instruction file Claude reads at runtime; Gleaner's are `clip` and `youtube`.
- **`clip` skill** — `plugins/gleaner/skills/clip/SKILL.md`, which holds all of Gleaner's saving behavior.
- **`youtube` skill** — the video-specific skill, which reads the clip skill first and changes only what differs for video.
- **Intent** — what a request is asking for, such as Save page, Add part, or the new Save answer.
- **Part** — one piece of a clip being collected: a highlight, a described section, pasted text, or now an answer.
- **Part clip** — a clip built from collected parts, each under its own heading.
- **Answer part** — a part whose text is Claude's answer and whose heading is the user's question.
- **Scope** — the clip header line that counts its parts, answers, and pages.
- **Type** — the kind of source page, such as docs, article, or video.
- **Clip index** — the table Gleaner returns when asked what was saved.
- **Frontmatter** — the YAML block at the top of a skill file; its `description` decides when the skill triggers.
- **Four-place sync rule** — the repo rule that the destination and surface list must match in four descriptions.
- **`/release`** — the project command that bumps the version, writes the changelog, validates, and commits.
- **Markdownlint** — the Markdown style checker CI runs on every `.md` file.
- **Chrome side panel** — Claude's panel inside Chrome, where Gleaner reads the open tab.
- **Claude Code desktop browser** — the built-in browser pane in the Claude Code desktop app.
- **Notion** — a notes app; Gleaner can save each clip as a page in a Notion database.
- **TL;DR** — the 2–3 sentence summary at the top of a clip.
