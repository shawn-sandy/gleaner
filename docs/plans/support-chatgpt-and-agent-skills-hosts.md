# What it takes to run Gleaner in ChatGPT and other Agent Skills hosts

Exploration, 2026-10-26. Nothing in the skills has changed yet. This note looks at what Gleaner 2.12.2 needs to work in ChatGPT, what degrades it there, and what the Agent Skills open standard asks of it so other hosts can load it. The install was tested with Codex CLI 0.155.1 in an isolated Codex home; ChatGPT web, desktop, and mobile were not live-tested.

## At a glance

- **It already installs in Codex.** Codex CLI 0.155.1 read `.claude-plugin/marketplace.json` and `.claude-plugin/plugin.json` as legacy-compatible manifests; other OpenAI hosts are unverified. Codex added the marketplace, installed the plugin, and registered all four skills as `gleaner:glean`, `gleaner:youtube`, `gleaner:preferences`, and `gleaner:follow-up`.
- **Only a public directory listing has hard blockers.** It needs a square plugin logo and composer icon, and listing names and short descriptions of 30 characters or fewer. Workspace and manual installs need neither.
- **The biggest runtime cost is size.** A YouTube save reads five files, 127,158 characters in all, before it reads the video. Much of glean covers only Claude's surfaces.
- **The skills are written as if the model is Claude.** glean's description, the model's first impression in ChatGPT, names Claude three times and offers claude.ai artifacts.
- **Spec gaps are small.** `argument-hint` isn't in the Agent Skills spec, optional fields are missing, and the validator skips the spec's name rules.
- **Recommendation:** ship the wording, icon, frontmatter, and validator fixes first. Splitting glean into a shared core plus host and destination references is the large change that helps every host.

## What was checked, and how

| Check | Result | Evidence |
| --- | --- | --- |
| `codex plugin marketplace add` on the repo | Added marketplace `shawn-sandy` from `.claude-plugin/marketplace.json` | Run |
| `codex plugin add gleaner@shawn-sandy` | Installed 2.12.2 into the plugin cache with the four skills side by side under one `skills/` folder | Run |
| `codex debug prompt-input` | All four skills listed with their full descriptions, each at `r2/<skill>/SKILL.md`, where `r2` is the cached plugin's skills folder | Run |
| `npm run validate` and `npm test` | Both pass, 71 of 71 tests. Both strict Claude validators pass, with one warning: the plugin has no icon (`ICON_MISSING`) | Run |
| `skills-ref validate`, the spec's reference validator | Treats unknown frontmatter fields as errors, so all four skills fail on `argument-hint` | Source read |
| OpenAI directory submission rules | Icons, listing field limits, and the guidance on Claude features below | Docs |
| ChatGPT web, desktop, and mobile; its Drive and Notion connectors; the workspace import screen | Not tried | Not tested |

`skills-ref` wasn't run because local Python is 3.9 and `uv` isn't installed. The Codex test used a throwaway Codex home in the session scratchpad, so it changed nothing in `~/.codex`.

## What breaks or degrades in ChatGPT

| Issue | Where | Impact |
| --- | --- | --- |
| **No plugin-level icon.** A directory listing needs a square `logo` and `composerIcon` (48 to 4,096 px, at most 5 MiB). Final submission also caps `displayName` and `shortDescription` at 30 characters, and needs a `longDescription` and `developerName`. The portal fills defaults from `plugin.json`, but the 600-character description has to be cut down by hand. | Plugin root, which has no `assets/`. glean's skill icons don't count. | Blocks listing |
| **Claude-only features and wording.** OpenAI's guide for Claude plugins says to remove instructions that create or update Claude artifacts, and to reword Claude references neutrally, keeping product names only where they apply. | glean body: 28 mentions of Claude; youtube: 6. The Artifact destination, `--to artifact`, and `provider: artifact` in the preferences schema. | Review risk |
| **Claude-centric descriptions.** ChatGPT's model sees "Claude's answers", "claude.ai artifact", and "Claude Code desktop browser" when it decides whether to use the skill. Codex's prompt showed exactly this text. | `glean/SKILL.md:3`, plus the same list in `marketplace.json`, `plugin.json`, and the README intro | Weaker triggering |
| **Too much to read.** glean is 548 lines and 67,382 characters. The spec suggests a main file under 500 lines with detail moved to references. Every ChatGPT save pays for sections only Claude uses: the browser table, closing Claude in Chrome tabs, the Artifact HTML template, Notion SQL, and the `claude` terminal command. | glean lines 32 to 68 and 418 to 506 | Context cost |
| **Seven links reach into sibling skills with `../`.** They resolve in a plugin install, where the skills sit side by side. They break when a single skill is uploaded on its own, which ChatGPT supports for standalone skills. | `follow-up:11`; `glean:196` (twice), `508`, `544`; `youtube:11`, `15` | Breaks standalone |
| **Claude tool names with no fallback.** youtube says to "fetch the Source URL with WebFetch". The Notion steps assume Claude's Notion connector (`create-database` with SQL DDL, `ALTER COLUMN`, `replace_content`). Drive has an "other connectors" fallback; Notion doesn't. | `youtube/SKILL.md:110`; glean lines 418 to 441 | Unverified |
| **Preferences don't persist.** The local store is `~/.config/agent-preferences/preferences.yaml`, which is vendor-neutral, but a ChatGPT chat has no lasting filesystem. Without Drive sync, "always save here" is forgotten next chat. The contract already handles this as a cloud-only host. | `preferences/references/contract.md` | Tell users |
| **An install step no doc confirms.** `docs/chatgpt-marketplace.md` describes an admin "GitHub marketplace import" option. OpenAI's docs describe `codex plugin marketplace add` (which takes GitHub shorthand), admins publishing local plugins to roles, and the desktop app reading `.claude-plugin/marketplace.json`. | `docs/chatgpt-marketplace.md` | Unverified |

### What a YouTube save reads before the video

The youtube skill tells the model to read glean, glean's bookmark contract, the preferences contract, and in ChatGPT the blocked-content fallback. Whole-file character counts, measured with Node:

| File | Characters | Share |
| --- | ---: | ---: |
| `glean/SKILL.md` | 67,382 | 53.0% |
| `youtube/SKILL.md` | 20,970 | 16.5% |
| `preferences/references/contract.md` | 17,287 | 13.6% |
| `glean/references/bookmark.md` | 14,588 | 11.5% |
| `youtube/references/chatgpt-blocked-content.md` | 6,931 | 5.5% |
| **Total** | **127,158** | |

## What cross-vendor Agent Skills needs

The Agent Skills specification allows six frontmatter fields and recommends keeping file references relative to the skill's own folder, one level deep. How Gleaner measures up:

| Spec rule | Gleaner today | Status |
| --- | --- | --- |
| `name`: 1 to 64 lowercase letters, digits, and hyphens, no leading, trailing, or double hyphens, matching the folder | All four comply. The validator checks the folder match but not the character rules. | OK |
| `description`: 1 to 1,024 characters | glean 721, youtube 522, follow-up 473, preferences 421 | OK |
| Only `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools` | All four add `argument-hint`, a Claude Code extension | Fails skills-ref |
| `license` | Missing; the repo is MIT | Add |
| `compatibility`: up to 500 characters on environment needs | Missing. The skills need a browser tool or a URL, optional connectors, and a plugin install for the sibling links | Add |
| `metadata`: string keys to string values | Not used | Optional |
| Main file under 500 lines | glean 548, youtube 194, follow-up 91, preferences 25 | glean over |
| References relative to the skill folder, one level deep | Seven `../` links into sibling skills | Plugin-only |

### What to change

1. **Remove `argument-hint` from all four skills.** Codex loaded the skills with it, so the one host tested accepts it (others are unverified), but strict spec validity requires removing it. The `--to` values are already in the skill text, and the only loss is the autocomplete hint in Claude Code.
2. **Add `license: MIT` and a `compatibility` line,** such as "Needs a browser tool or a URL; Google Drive and Notion connectors are optional; install as part of the gleaner plugin."
3. **Say the skills depend on the plugin, rather than copying shared files.** Copying `bookmark.md` and `contract.md` into each skill would make standalone installs work, but the copies would drift apart.
4. **Split glean.** Keep the shared core in SKILL.md: intents, the clip format, categories, and the steps. Move host details to `references/hosts/claude.md` and `references/hosts/chatgpt.md`, and destination details to `references/destinations/`, each read only when it applies. This touches the README's step references and the four-place description rule.
5. **Rename `youtube` and `preferences` only for standalone distribution.** Inside the plugin they're namespaced. Flat installs such as `~/.agents/skills/` can collide with other skills of the same name, which Codex doesn't merge. Renaming breaks `/gleaner:youtube`.
6. **Close gaps in the validator.** `scripts/validate-skills.mjs` doesn't check the spec's name characters, unknown fields, the 500-character `compatibility` cap, or the 500-line guideline.
7. **Keep `.claude-plugin/`.** OpenAI prefers a root `plugin.json` in the Agent Plugins format but accepts `.claude-plugin/` as legacy, and that's the folder Claude Code reads. Whether Claude's strict validator accepts OpenAI's branding fields is untested.

### Not needed

No MCP server, hook removal, command conversion, or `userConfig` replacement: the plugin has none of these. `scripts/bookmark.mjs` is already optional.

## Suggested order

| Step | Change | Helps | Files | Release |
| ---: | --- | --- | --- | --- |
| 1 | Provider-neutral descriptions | ChatGPT triggering, directory review | `marketplace.json`, `plugin.json`, glean frontmatter, README intro | Wording, no bump |
| 2 | Plugin-level icon | Claude and OpenAI directories | New `plugins/gleaner/assets/`, `plugin.json` | No bump |
| 3 | Drop `argument-hint`; add `license` and `compatibility` | Spec validity | Four SKILL.md files | Patch |
| 4 | Spec checks in the validator, with tests | CI | `scripts/validate-skills.mjs`, its test file | No bump |
| 5 | Fallbacks for WebFetch and the Notion connector calls | ChatGPT and other hosts | `youtube/SKILL.md`, glean step 6 | Patch |
| 6 | Split glean into a core plus host and destination references | Every host | glean SKILL.md, new references, README "Customizing" | Minor |
| 7 | Listing fields and directory submission, when wanted | Public ChatGPT directory | Portal, or an OpenAI manifest overlay | None |
| 8 | Rename `youtube` and `preferences`, only for standalone distribution | Flat skill installs | Skill folders, README, commands | Major |

## Open questions and live tests

- Does ChatGPT on web, desktop, and mobile load all four skills from the plugin, and can its model read `references/` files and the `../` links?
- Does a single skill uploaded on its own in ChatGPT keep any sibling skills? If not, which saves fail first?
- Does ChatGPT's Notion app accept the same `create-database` and `replace_content` calls as Claude's connector?
- Does the admin "GitHub marketplace import" screen described in `docs/chatgpt-marketplace.md` exist?
- Would the directory's safety scan flag the Artifact instructions even though they only run when the Artifact tool is present?
- Does Claude Code's strict validator accept an `extensions` block or a root `plugin.json`?

## Sources

- Gleaner: `plugins/gleaner/skills/*/SKILL.md`, their `references/` and `agents/openai.yaml` files, `scripts/validate-skills.mjs`, `docs/chatgpt-marketplace.md`
- [Agent Skills specification](https://agentskills.io/specification) and the [skills-ref validator](https://github.com/agentskills/agentskills/tree/main/skills-ref)
- OpenAI: [Submit your Claude Code plugin](https://developers.openai.com/plugins/guides/submit-claude-plugin.md), [Package your plugin](https://developers.openai.com/plugins/build/plugins.md), [Plugin submission errors](https://developers.openai.com/plugins/deploy/submission-errors.md), [Skills](https://developers.openai.com/plugins/concepts/skills)
- [ChatGPT: Build skills](https://learn.chatgpt.com/docs/build-skills)
- [Agent Plugins](https://agent-plugins.org/)
