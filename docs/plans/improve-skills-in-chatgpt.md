---
status: todo
type: feature
created: 2026-10-26
modified: 2026-10-26
repo-name: gleaner
glance: Gleaner already installs and runs in ChatGPT, so this plan doesn't add support. It fixes the two things that make it weaker there. The glean description, which ChatGPT's model reads to decide whether to use the skill, is written as if the model is Claude, and two steps name Claude-only tools with no fallback. Done means neutral wording in every place the description is kept, and youtube and Notion saves that say what to do when those tools are missing.
---

# Plan: Improve Gleaner's skills in ChatGPT

## Objective

Make the small fixes from docs/plans/support-chatgpt-and-agent-skills-hosts.md that improve Gleaner in ChatGPT today. That means provider-neutral descriptions, plus fallbacks for the WebFetch and Notion connector calls. The note's other changes become Next Steps: the plugin icon, spec-valid frontmatter, validator checks, and splitting glean.

## Context

Gleaner 2.12.2 already works in ChatGPT, and Codex CLI 0.155.1 installed it and registered all four skills. The exploration note asked what else would help. Its suggested order mixes changes with different payoffs:

- Some help ChatGPT users now: the descriptions and the fallbacks.
- One is needed only for a public directory listing: the icon.
- Some matter only for strict Agent Skills validity or other hosts: dropping `argument-hint`, adding `license` and `compatibility`, and the validator checks.
- One is an optional efficiency refactor: the glean split.

The maintainer chose on 2026-10-26 to ship only the first group now.

The description fix matters most. glean's frontmatter `description` is what ChatGPT's model sees when it decides whether to use the skill. It says "Claude's answers" and "an answer Claude gave", and Codex's prompt showed that text word for word. The description and its destination-and-surface list appear in four places that CLAUDE.md requires to stay in sync. docs/requirements.md, added in PR #47 after the note was written, repeats them.

The two fallbacks cover the places a ChatGPT save meets a tool it doesn't have:

- youtube's "No browser" section says to "fetch the Source URL with WebFetch".
- glean's Notion steps assume Claude's Notion connector: `create-database` with SQL DDL, `ALTER COLUMN` for new tags, and `replace_content` for updates.

Drive already has an "Other Drive connectors" fallback in step 6, which these follow.

Known risk: ChatGPT web, desktop, and mobile were not live-tested, and this plan doesn't change that. Each step is verified with the repo's static validators. The live check is the maintainer's, per this repo's rule that nothing is reported as live-tested.

## Decisions

- Ship only the fixes that help in ChatGPT now; the rest are Next Steps with their prompts. Gleaner already runs in ChatGPT, so nothing here is required for it to work.
- Wording stays provider-neutral by naming a host only where a feature belongs to it. "The assistant's answers" covers the general case, and "a private claude.ai artifact (in Claude)" marks a Claude-only feature. That follows OpenAI's guidance to keep product names only where they apply.
- Keep the Claude connector's exact Notion calls and add one fallback sentence beside each. Rewriting them generically would lose the detail that makes Claude saves reliable.
- No glean step moves or renumbers, so the README "Customizing" references to steps 2, 3, and 4 stay correct.
- One PR. The fallbacks change what the skill does when a tool is missing, so the Unreleased bullets ship as a patch through /release. The wording alone would need no bump.

## Files

- docs/plans/support-chatgpt-and-agent-skills-hosts.md (new): the exploration note this plan draws on, committed with it
- .claude-plugin/marketplace.json (modified): provider-neutral plugin description
- plugins/gleaner/.claude-plugin/plugin.json (modified): provider-neutral description
- plugins/gleaner/skills/glean/SKILL.md (modified): description wording and the Notion fallbacks in step 6, step 7's update, and the clip index
- plugins/gleaner/skills/youtube/SKILL.md (modified): the WebFetch fallback
- README.md (modified): intro paragraph and Unreleased changelog bullets
- docs/requirements.md (modified): the repeated surface list, and both Codex install commands
- docs/chatgpt-marketplace.md (modified): both Codex install commands
- plugins/gleaner/skills/README.md (modified): the glean summary, if it repeats the description

## Steps

1. **Neutral descriptions.** Rewrite the destination-and-surface description in the four places CLAUDE.md names: the `marketplace.json` plugin description, the `plugin.json` description, glean's frontmatter `description`, and the README intro paragraph. Also update docs/requirements.md and plugins/gleaner/skills/README.md where they repeat it. "Claude's answers" becomes "the assistant's answers", and "an answer Claude gave" becomes "an answer the assistant gave". Each Claude-only destination or surface keeps its product name, with "in Claude" or the surface it runs in.
   - **Why:** the description is ChatGPT's model's first impression and decides whether the skill triggers.
   - **Verify:** this command prints nothing: `grep -n "Claude's answers\|Claude gave" .claude-plugin/marketplace.json plugins/gleaner/.claude-plugin/plugin.json plugins/gleaner/skills/glean/SKILL.md plugins/gleaner/skills/README.md README.md docs/requirements.md`. glean's description is still at most 1,024 characters, and `npm run validate` exits 0.
2. **Fallbacks for Claude-only tools.**
   - In youtube's "No browser" section, "fetch the Source URL with WebFetch" becomes "fetch the Source URL with the session's web-fetch tool (such as WebFetch in Claude)". That matches docs/requirements.md and the "session's web tool" wording youtube's ChatGPT section already uses.
   - In glean, add one fallback sentence each for creating the database, adding tag options, and updating a page's content, where the steps use `create-database` with SQL DDL, `ALTER COLUMN`, and `replace_content`. The sentence says to use the equivalent Notion tools this session shows, by their names. If there is no equivalent, say the clip was not saved to Notion and return the Markdown, as the Drive fallback in step 6 does.
   - **Why:** these are the places a non-Claude host meets a tool it doesn't have, and Drive already shows the pattern.
   - **Verify:** `grep -n "with WebFetch" plugins/gleaner/skills/youtube/SKILL.md` prints nothing, each of the three Notion calls has a fallback next to it, and `npm run validate` exits 0.
3. **Docs and changelog.**
   - docs/chatgpt-marketplace.md and docs/requirements.md add the two-command install route that was run: `codex plugin marketplace add shawn-sandy/gleaner` registers the marketplace, then `codex plugin add gleaner@shawn-sandy` installs the plugin. Keep the admin "GitHub marketplace import" text, but mark it unconfirmed.
   - The changelog gets Unreleased bullets for the neutral wording and the two fallbacks.
   - **Why:** the install docs describe only a route no OpenAI doc confirms, and /release reads the next entry from Unreleased.
   - **Verify:** `grep -n "codex plugin marketplace add\|codex plugin add gleaner@shawn-sandy" docs/chatgpt-marketplace.md docs/requirements.md` finds both commands in both files, and `npm run validate` plus `npm test` exit 0.

## Tests

Tier 2: this plan changes skill prose, manifests, and docs, which the repo tests with its static validator suite.

- Smoke: the edited skills and manifests still pass. File: scripts/validate-skills.mjs (existing run). Asserts: all four skills pass frontmatter, ChatGPT metadata, and local references, the strict Claude validators pass, and markdownlint reports 0 issues. Run: `grep -q "web-fetch tool" plugins/gleaner/skills/youtube/SKILL.md && npm run validate && npm test`

## Acceptance Criteria

- [ ] No description in the four synced places, docs/requirements.md, or plugins/gleaner/skills/README.md says "Claude's answers" or "an answer Claude gave", and Claude-only destinations and surfaces are named as Claude's.
- [ ] youtube no longer requires WebFetch by name.
- [ ] Each of glean's three Claude-specific Notion calls has a fallback that ends in "not saved, here is the Markdown" when no equivalent exists.
- [ ] docs/chatgpt-marketplace.md and docs/requirements.md give both Codex install commands.
- [ ] The changelog has Unreleased bullets for every shipped change.
- [ ] `npm run validate` and `npm test` both exit 0.

## Verification

Run `npm ci`, `npm run validate`, and `npm test` from the repo root. Both must exit 0, with the strict Claude validators passing; the Validate workflow always runs them. Then read glean's frontmatter and its Notion block as ChatGPT's model would: nothing should assume Claude, except where a feature is named as Claude's.

The behavior check is the maintainer's. In ChatGPT, save a page to Notion and save a YouTube URL with no browser, and confirm each either works or says plainly that it wasn't saved. In Codex, with an isolated `CODEX_HOME`, install from the branch and confirm `codex debug prompt-input` shows the neutral glean description.

## Next Steps

- Cut the patch release once this merges

  ```text
  In the gleaner repo on main, run /release to cut the next patch version: it dates the Unreleased changelog entry, bumps plugins/gleaner/.claude-plugin/plugin.json, validates, and commits. Verify npm run validate and npm test exit 0 and the commit subject matches "Gleaner X.Y.Z: <lowercase summary>".
  ```

- Add a plugin icon, only before a public directory listing
  Claude's portal takes the icon only once, at the first save or submission, so pick it deliberately. The strict validator's `ICON_MISSING` warning asks for a square PNG of 512 to 2,048 px under 2 MB. OpenAI wants 48 to 4,096 px under 5 MiB, set as `interface.logo` and `interface.composerIcon`. Whether OpenAI's legacy conversion maps a Claude `icon` field to those two is undocumented, so check the converted manifest after a test upload.

  ```text
  In the gleaner repo, render gleaner-symbol.svg to a 1,024 by 1,024 PNG at plugins/gleaner/assets/icon.png and set "icon": "./assets/icon.png" in plugins/gleaner/.claude-plugin/plugin.json. Check it reads well at 48 px. Verify npm run validate no longer prints ICON_MISSING. Do not submit to either portal; the maintainer approves the icon first.
  ```

- Make the skills spec-valid, only if Gleaner targets other Agent Skills hosts
  This removes `argument-hint`, which costs Claude Code its autocomplete hint. It adds `license: MIT` and a `compatibility` line, and teaches the validator the spec's rules.

  ```text
  In the gleaner repo, read docs/plans/support-chatgpt-and-agent-skills-hosts.md, "What to change" items 1, 2, and 6. Remove argument-hint from all four SKILL.md files and add license: MIT and a compatibility line under 500 characters. In scripts/validate-skills.mjs, check that names follow the Agent Skills specification's rules (lowercase alphanumerics, Unicode allowed, hyphens never leading, trailing, or doubled, at most 64 characters, matching the folder). Allow only name, description, license, compatibility, metadata, and allowed-tools. Cap compatibility at 500 characters, require license and allowed-tools to be strings and metadata to map strings to strings, and warn without failing when a whole SKILL.md file, frontmatter included, exceeds 500 lines. Add a test for each rule in scripts/validate-skills.test.mjs, including non-string license and allowed-tools values and a 500 versus 501 line boundary. Verify npm run validate and npm test exit 0.
  ```

- Split glean into a core plus host and destination references, if save cost becomes a problem
  A YouTube save reads 127,158 characters across five files before the video. Moving Claude-only and destination-only sections out of glean's 548 lines would cut that on every host.

  ```text
  In the gleaner repo, read docs/plans/support-chatgpt-and-agent-skills-hosts.md, "What to change" item 4, and write an implementation plan under docs/plans/ for splitting plugins/gleaner/skills/glean/SKILL.md into a core under 500 lines plus references/hosts/ and references/destinations/, keeping steps 1 to 7 numbered as they are. The plan must measure every file a ChatGPT YouTube save reads after the split, including the new host reference, against the 127,158-character baseline.
  ```

- Run the ChatGPT live tests from the exploration note

  ```text
  In the gleaner repo, read docs/plans/support-chatgpt-and-agent-skills-hosts.md, section "Open questions and live tests". With Gleaner installed in a ChatGPT workspace, test each question on web, desktop, and mobile, and record a pass or fail line for each in the Decisions section of docs/plans/improve-skills-in-chatgpt.md. Fix docs/chatgpt-marketplace.md if the admin "GitHub marketplace import" screen doesn't exist. Verify npm run validate exits 0.
  ```

## Unresolved Questions

- Does ChatGPT's Notion app offer equivalents for database creation and tag-option updates at all? If it doesn't, the step 2 fallback means Notion saves in ChatGPT fail cleanly rather than work, which is still better than failing silently.

## Resources

- docs/plans/support-chatgpt-and-agent-skills-hosts.md: the findings, measurements, and suggested order this plan draws on
- OpenAI: [Submit your Claude Code plugin](https://developers.openai.com/plugins/guides/submit-claude-plugin.md), [Package your plugin](https://developers.openai.com/plugins/build/plugins.md)
- [Agent Skills specification](https://agentskills.io/specification), for the deferred spec work
