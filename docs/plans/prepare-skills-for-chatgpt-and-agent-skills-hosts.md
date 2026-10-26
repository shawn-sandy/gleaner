---
status: todo
type: feature
created: 2026-10-26
modified: 2026-10-26
repo-name: gleaner
glance: Gleaner already installs in ChatGPT and Codex, but its skills read as if the model is Claude, fail the Agent Skills reference validator, and make every YouTube save read 127,158 characters before the video. Done means provider-neutral descriptions, a plugin icon both directories accept, spec-valid frontmatter the validator enforces, tool fallbacks outside Claude, and a glean skill under 500 lines whose host and destination details load only when they apply.
---

# Plan: Prepare Gleaner's skills for ChatGPT and other Agent Skills hosts

## Objective

Ship steps 1 to 6 of the suggested order in docs/plans/support-chatgpt-and-agent-skills-hosts.md: provider-neutral descriptions, a plugin-level icon, spec-valid frontmatter, spec checks in the validator, fallbacks for Claude-only tool calls, and a glean skill split into a shared core plus host and destination references. A public ChatGPT directory listing and renaming skills for standalone installs stay out of scope.

## Context

The exploration note found that Gleaner 2.12.2 already installs outside Claude: Codex CLI 0.155.1 read `.claude-plugin/marketplace.json`, installed the plugin, and registered all four skills. What holds it back is how the skills are written, not how they are packaged.

Four findings shape this plan. The glean description, which ChatGPT's model reads when deciding whether to use the skill, names Claude three times and offers claude.ai artifacts. All four skills carry `argument-hint`, a Claude Code extension that the spec's `skills-ref` validator treats as an error, and none carries `license` or `compatibility`. `scripts/validate-skills.mjs` checks the name matches its folder but not the spec's character rules, unknown fields, or the 500-line guideline, so nothing stops these gaps from coming back. And glean is 548 lines: a YouTube save reads glean, youtube, both shared contracts, and in ChatGPT the blocked-content fallback, 127,158 characters in all, much of it about Claude's browsers, Claude in Chrome tabs, the Artifact template, and Notion SQL.

The plugin directory check that `npm run validate` runs through the Claude CLI already warns `ICON_MISSING`. It wants a square PNG of 512 to 2,048 px under 2 MB, set as `icon` in `plugin.json` or placed at `assets/icon.png`, and says the file becomes the listing icon only the first time the plugin is saved or submitted in the developer portal. OpenAI's directory wants a square logo of 48 to 4,096 px under 5 MiB, so one 1,024 px PNG satisfies both.

Since the note was written, PR #47 added docs/requirements.md, which repeats the surface list and the ChatGPT import route. It joins the files to keep in step.

Known risk: ChatGPT web, desktop, and mobile were not live-tested, and this plan doesn't change that. Every step is verified with the repo's static validators and, where it changes runtime reading, by measuring what the model reads; the live checks stay with the maintainer, per this repo's rule that nothing is reported as live-tested.

## Decisions

- Keep `.claude-plugin/` as the only manifest folder. OpenAI accepts it as legacy-compatible and Claude Code reads only it; whether Claude's strict validator accepts a root `plugin.json` or OpenAI branding fields is untested, so this plan adds neither.
- Skills depend on the plugin rather than carrying copies of `bookmark.md` and `contract.md`. Copies would make a standalone upload work but drift apart. The `compatibility` line says so instead, and the seven `../` links stay.
- Remove `argument-hint` from all four skills. The only loss is the autocomplete hint in Claude Code; the `--to` values are already in each skill's text. This is the one user-visible regression in the plan, so step 3 lands in its own commit that is easy to revert if the maintainer wants the hint back.
- Keep the Artifact destination. OpenAI's guide says to remove instructions that create Claude artifacts, but Claude users rely on it. Step 6 moves it to a destination reference read only when the Artifact tool is present, and step 1 names it as a Claude feature, which is the guide's "keep product names only where they apply".
- Wording stays provider-neutral by naming the host only where a feature belongs to it: "the assistant's answers" for the general case, "a private claude.ai artifact (in Claude)" where it is Claude-only.
- glean's `## Steps` keep their numbers 1 to 7 through the split, so the README "Customizing" references to steps 2, 3, and 4 stay correct. Host and destination text moves out of a step; no step moves.
- The 500-line rule enters the validator as a warning in step 4 and becomes a failure in step 6, once glean is under it, so the validator never fails main between PRs.
- The plan ships as two PRs: steps 1 to 4 (wording, icon, frontmatter, validator), then steps 5 to 7 (fallbacks, the glean split, docs). The first is small and mechanical; the second is the large review. Both add bullets under the changelog's Unreleased line, and the version bump comes from /release once both are on main: a minor, since step 6 changes how the skill reads.
- The plugin icon is rendered from the repo's `gleaner-symbol.svg` at 1,024 px. Because Claude's portal takes the icon only once, the maintainer approves the rendered PNG before the first portal submission, not before this plan merges.

## Files

- docs/plans/support-chatgpt-and-agent-skills-hosts.md (new) — the exploration note this plan implements, committed with it
- .claude-plugin/marketplace.json (modified) — provider-neutral plugin description
- plugins/gleaner/.claude-plugin/plugin.json (modified) — provider-neutral description and the `icon` field
- plugins/gleaner/assets/icon.png (new) — 1,024 px square plugin icon
- plugins/gleaner/skills/glean/SKILL.md (modified) — description wording, frontmatter, Notion fallback, and the split into a core
- plugins/gleaner/skills/glean/references/hosts/claude.md (new) — Claude surfaces, browsers, and Claude in Chrome tabs
- plugins/gleaner/skills/glean/references/hosts/chatgpt.md (new) — ChatGPT connected tabs, the Work browser, and inline previews
- plugins/gleaner/skills/glean/references/destinations/notion.md (new) — Notion database setup, schema, tags, and page writes
- plugins/gleaner/skills/glean/references/destinations/artifact.md (new) — the Artifact destination and its HTML template
- plugins/gleaner/skills/youtube/SKILL.md (modified) — frontmatter and the WebFetch fallback
- plugins/gleaner/skills/preferences/SKILL.md (modified) — frontmatter
- plugins/gleaner/skills/follow-up/SKILL.md (modified) — frontmatter
- scripts/validate-skills.mjs (modified) — Agent Skills spec checks
- scripts/validate-skills.test.mjs (modified) — tests for each new check
- README.md (modified) — intro paragraph, repository layout, and Unreleased changelog bullets
- docs/requirements.md (modified) — the surface list and the ChatGPT install route
- docs/chatgpt-marketplace.md (modified) — the `codex plugin marketplace add` route that was actually run
- plugins/gleaner/skills/README.md (modified) — the glean summary, if it repeats the description

## Steps

1. Rewrite the destination-and-surface description in the four places CLAUDE.md names (the `marketplace.json` plugin description, the `plugin.json` description, glean's frontmatter `description`, and the README intro paragraph), plus docs/requirements.md where it repeats them: "Claude's answers" becomes "the assistant's answers", "an answer Claude gave" becomes "an answer the assistant gave", and each Claude-only destination or surface keeps its product name with "in Claude" or the surface it runs in. Why: the description is ChatGPT's model's first impression and decides whether the skill triggers, and Codex's prompt showed the Claude-centric text verbatim. Verify: `grep -n "Claude's answers\|Claude gave" .claude-plugin/marketplace.json plugins/gleaner/.claude-plugin/plugin.json plugins/gleaner/skills/glean/SKILL.md README.md` prints nothing, glean's description is still at most 1,024 characters, and `npm run validate` exits 0.
2. Render `gleaner-symbol.svg` to a 1,024 by 1,024 PNG at `plugins/gleaner/assets/icon.png` (a headless Chromium screenshot or any rasterizer; transparent or solid background, square, under 2 MB) and set `"icon": "./assets/icon.png"` in `plugin.json`. Why: both directories need a square plugin logo, glean's 256 px skill icons are too small for Claude's 512 px minimum and don't count as a plugin icon, and the strict validator already warns. Verify: `npm run validate` no longer prints `ICON_MISSING`, and `node -e` reading bytes 16 to 24 of the PNG reports 1024 by 1024.
3. In all four SKILL.md files, remove `argument-hint` and add `license: MIT` and a `compatibility` line under 500 characters naming what the skill needs: a browser tool or a URL (glean, youtube), optional Google Drive and Notion connectors, and installation as part of the gleaner plugin because it reads sibling skills' files. Why: these are the only frontmatter gaps between Gleaner and the Agent Skills spec, and `compatibility` is where the spec puts the plugin dependency the Decisions chose over copying files. Verify: `grep -n "argument-hint" plugins/gleaner/skills/*/SKILL.md` prints nothing, and `npm run validate` exits 0 with both strict Claude validators passing, which confirms Claude Code accepts the two new fields.
4. Add spec checks to the frontmatter check in `scripts/validate-skills.mjs`: `name` matches `^[a-z0-9]+(-[a-z0-9]+)*$` and is at most 64 characters; only `name`, `description`, `license`, `compatibility`, `metadata`, and `allowed-tools` are allowed; `compatibility` is at most 500 characters; `license` and `allowed-tools` are strings when present; `metadata` maps strings to strings; and a body over 500 lines prints a warning that doesn't change the exit code. Add a test in `scripts/validate-skills.test.mjs` for each, using the fixture pattern its existing tests use. Why: without these checks a later edit can reintroduce `argument-hint` or an invalid name and only `skills-ref`, which CI doesn't run, would notice. Verify: `npm test` exits 0 with the new tests, each new test fails when its check is removed, and `npm run validate` exits 0 with one warning naming glean's line count.
5. Replace Claude tool names that have no fallback: in youtube, "fetch the Source URL with WebFetch" becomes "fetch the Source URL with the session's web-fetch tool (such as WebFetch in Claude)", matching docs/requirements.md; in glean's Notion steps, keep the `create-database` SQL and `replace_content` instructions for Claude's Notion connector, and add one fallback sentence each for creating the database, adding tag options, and replacing page content with whatever Notion tools the session lists, ending with the same "say it was not saved and return the Markdown" rule the Drive steps use. Why: these are the two places a non-Claude host meets a tool it doesn't have, and Drive already shows the fallback pattern. Verify: `grep -n "with WebFetch" plugins/gleaner/skills/youtube/SKILL.md` prints nothing, each Notion sub-step names a fallback, and `npm run validate` exits 0.
6. Split glean: move "Where Gleaner runs" host detail (the browser table, Claude in Chrome, closing tabs, the `claude` terminal command) to `references/hosts/claude.md` and the ChatGPT connected-tab, Work browser, and inline-preview rules to `references/hosts/chatgpt.md`; move step 6's Notion block and the Notion parts of step 7 and the clip index to `references/destinations/notion.md`; move the Artifact destination and its HTML template to `references/destinations/artifact.md`. Leave in SKILL.md the intents, the clip format, categories, steps 1 to 7 with their numbers, and one line at each move saying which reference to read and when (for example "In ChatGPT, read references/hosts/chatgpt.md before step 1"). Then promote the 500-line warning from step 4 to a failure. Why: every save, on every host, currently pays for sections only one host or destination uses, and the spec's progressive-disclosure layout is what lets other hosts load the core cheaply. Verify: `wc -l plugins/gleaner/skills/glean/SKILL.md` is under 500; every file a YouTube save in ChatGPT must read after the split, the note's five plus `references/hosts/chatgpt.md` (and a destination reference when the save targets one), measured again with Node as the note did, totals less than 127,158 characters, with the per-file counts and the new total recorded in this plan's Decisions; `grep -n "step [234]" README.md` still points at the steps it describes; and `npm run validate` plus `npm test` exit 0 with the line rule now failing on any SKILL.md over 500 lines.
7. Update the docs in step with the change: the README repository layout gains `assets/icon.png` and glean's `references/hosts/` and `references/destinations/`; docs/chatgpt-marketplace.md and docs/requirements.md add the two-command install route that was run, `codex plugin marketplace add shawn-sandy/gleaner` to register the marketplace and then `codex plugin add gleaner@shawn-sandy` to install the plugin, keeping the admin "GitHub marketplace import" text but marking it unconfirmed; plugins/gleaner/skills/README.md matches the new glean description; and the changelog gets Unreleased bullets for the neutral wording, the icon, the frontmatter change (naming the lost Claude Code autocomplete hint), the validator checks, the fallbacks, and the split. Why: the README layout and the install docs describe files and routes that change here, and /release reads the next entry from Unreleased. Verify: every new file is named in the README layout, `grep -n "codex plugin marketplace add\|codex plugin add gleaner@shawn-sandy" docs/chatgpt-marketplace.md docs/requirements.md` finds both commands in both files, and `npm run validate` plus `npm test` exit 0.

## Tests

Tier 2 — This plan changes skill prose, manifests, and the validator, which the repo tests with its static validator suite
- Objective: the skills are spec-valid and the validator enforces it. File: scripts/validate-skills.test.mjs; Type: unit; Asserts: an invalid name, an unknown frontmatter field, a `compatibility` over 500 characters, and a non-string `metadata` value each fail, a valid repository still passes, and a body over 500 lines fails after step 6; Run: npm test
- Smoke: the shipped skills pass the new checks. File: scripts/validate-skills.mjs (existing run); Asserts: all four skills pass frontmatter, ChatGPT metadata, and local references, the strict Claude validators pass with no `ICON_MISSING`, and markdownlint reports 0 issues; Run: npm run validate

## Acceptance Criteria

- [ ] No description in the four synced places or docs/requirements.md says "Claude's answers" or "an answer Claude gave", and Claude-only destinations and surfaces are named as Claude's.
- [ ] `plugins/gleaner/assets/icon.png` is a 1,024 px square PNG under 2 MB, `plugin.json` points to it, and `npm run validate` prints no `ICON_MISSING`.
- [ ] No SKILL.md has `argument-hint`; all four have `license: MIT` and a `compatibility` line under 500 characters.
- [ ] `scripts/validate-skills.mjs` rejects invalid names, unknown frontmatter fields, an over-long `compatibility`, and a SKILL.md over 500 lines, each with a test.
- [ ] youtube no longer requires WebFetch by name, and each Notion write in glean has a fallback for a non-Claude Notion connector.
- [ ] glean's SKILL.md is under 500 lines, keeps steps 1 to 7 in order, and names when to read each host and destination reference.
- [ ] The YouTube save read in ChatGPT, counting every file it must read including `references/hosts/chatgpt.md`, is measured again and recorded below 127,158 characters.
- [ ] README layout, docs/chatgpt-marketplace.md, docs/requirements.md, and the Unreleased changelog describe what shipped.
- [ ] `npm run validate` and `npm test` both exit 0.

## Verification

Run `npm ci`, `npm run validate`, and `npm test` from the repo root; both must exit 0 with the strict Claude validators passing (the Validate workflow always runs them). Then read glean's SKILL.md top to bottom as a fresh session on each host would: in Claude, every Artifact, Notion, and Claude in Chrome rule is reachable through a "read this reference when" line; in ChatGPT, nothing in the core assumes the Artifact tool, Claude in Chrome, or the `claude` command.

The behavior checks are the maintainer's: reinstall the plugin in Claude Code desktop and save a page to Notion and to an artifact, confirming both still follow the moved instructions; then, in Codex with an isolated `CODEX_HOME`, run `codex plugin marketplace add` and `codex plugin add gleaner@shawn-sandy` on the branch and confirm `codex debug prompt-input` shows the neutral glean description.

## Next Steps

- Cut the release once both PRs merge
  The bullets land under Unreleased; the glean split changes how the skill reads, so it is a minor version.

  ```text
  In the gleaner repo on main, run /release to cut the next minor version: it dates the Unreleased changelog entry, bumps plugins/gleaner/.claude-plugin/plugin.json, validates, and commits. Verify npm run validate and npm test exit 0 and the commit subject matches "Gleaner X.Y.Z: <lowercase summary>".
  ```

- Run the ChatGPT live tests from the exploration note
  None of the open questions can be settled without ChatGPT itself.

  ```text
  In the gleaner repo, read docs/plans/support-chatgpt-and-agent-skills-hosts.md, section "Open questions and live tests". With Gleaner installed in a ChatGPT workspace, test each question on web, desktop, and mobile, and record a pass or fail line for each in the Decisions section of docs/plans/prepare-skills-for-chatgpt-and-agent-skills-hosts.md. Fix docs/chatgpt-marketplace.md if the admin "GitHub marketplace import" screen doesn't exist. Verify npm run validate exits 0.
  ```

- Prepare a public ChatGPT directory listing, when wanted
  Step 7 of the note's order: needs listing fields of 30 characters or fewer, a long description, and the developer name.

  ```text
  In the gleaner repo, draft OpenAI directory listing fields for Gleaner: a displayName and shortDescription of 30 characters or fewer, a longDescription drawn from plugins/gleaner/.claude-plugin/plugin.json, and developerName "Shawn Sandy", using plugins/gleaner/assets/icon.png as the logo and composer icon. Write them to docs/chatgpt-directory-listing.md for the maintainer to paste into the portal; do not add OpenAI fields to plugin.json unless claude plugin validate accepts them. Verify npm run validate exits 0.
  ```

- Revisit renaming youtube and preferences for standalone distribution
  Step 8 of the note's order, a major version: only worth it if flat installs such as `~/.agents/skills/` become a real distribution channel.

## Unresolved Questions

- Is losing the Claude Code autocomplete hint from `argument-hint` acceptable? If not, revert step 3's removal and keep `skills-ref` compatibility as a known gap; the validator's allowed-fields list then includes `argument-hint` as a named Claude Code extension.
- Does the rendered `gleaner-symbol.svg` read well at 48 px, the smallest size OpenAI shows? If not, the icon needs a simplified mark before the first portal submission, since Claude's portal takes it only once.
- Would the OpenAI directory's safety scan flag the Artifact instructions even after they move to a reference read only when the Artifact tool is present?

## Resources

- docs/plans/support-chatgpt-and-agent-skills-hosts.md — the findings, measurements, and suggested order this plan implements
- [Agent Skills specification](https://agentskills.io/specification) and the [skills-ref validator](https://github.com/agentskills/agentskills/tree/main/skills-ref)
- OpenAI: [Submit your Claude Code plugin](https://developers.openai.com/plugins/guides/submit-claude-plugin.md), [Package your plugin](https://developers.openai.com/plugins/build/plugins.md)
- The `ICON_MISSING` text from `claude plugin validate`, which gives Claude's icon size, format, and one-time listing rules
