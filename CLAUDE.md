# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A Claude Code plugin marketplace (`gleaner`) that ships one plugin, `gleaner`, with four skills, `glean`, `youtube`, `preferences`, and `follow-up`. There is no build. The product is the prose in the four `SKILL.md` files under `plugins/gleaner/skills/` (mostly `glean/SKILL.md`) and their `references/` files, which the model reads raw at runtime. Tests cover the validator, the release scripts, and assertions about the skill prose.

## Validate

Run local validation before pushing (Node.js 22 or newer and npm required):

```bash
npm ci
npm run validate
npm test
```

Markdownlint takes its globs and rule overrides from `.markdownlint-cli2.jsonc`, where the disabled rules record house style; fix findings rather than disabling more rules. A PostToolUse hook in `.claude/settings.json` reruns both strict `claude plugin validate` checks after a Write or Edit under `.claude-plugin/` or `plugins/`; shell edits (`sed`, heredocs) bypass it, and it runs neither `validate-skills.mjs` nor markdownlint.

Local validation parses all four Skills' frontmatter and ChatGPT metadata, checks manifests, required files and local references, and lints Markdown. It runs both strict Claude validators when `claude` is on `PATH` and reports a skip otherwise. The Validate workflow (`.github/workflows/validate.yml`) runs `npm run validate` and `npm test` with the Claude CLI installed on every pull request and every push to `main`, so both strict checks always run there. Live testing against Chrome, Drive, Notion, and Cowork is done by the maintainer; never report a change as live-tested.

## Versioning and changelog

- The version lives only in `plugins/gleaner/.claude-plugin/plugin.json`. `marketplace.json` has no version field; do not add one.
- The changelog is the last section of `README.md` (there is no CHANGELOG.md). New entries start under a `**Unreleased**` line; write them in the PR that changes the plugin.
- Releases are automatic: `.github/workflows/auto-release.yml` releases every merge to `main` that changes a file under `plugins/` or `.claude-plugin/`, except READMEs, changelogs, and `docs/` folders. It runs `npm run release`, pushes the release commit to `main`, and dispatches `release.yml`. The bump is patch unless the PR is labeled `release:minor` or `release:major`; `release:skip` holds a change for the next release. `scripts/auto-release.mjs` decides what is releasable; keep its `releasable()` and the workflow's `paths` filter in step; `scripts/auto-release.test.mjs` asserts the filter, so update it too. Do not bump the version in a feature PR.
- Write PR titles as changelog lines: when a PR doesn't edit README.md, auto-release adds its Unreleased bullet from the PR title, and the release commit subject comes from PR titles.
- `/release` and the Cut release workflow (`.github/workflows/cut-release.yml`) still cut a version by hand on a `release/X.Y.Z` branch; auto-release leaves a merged version bump to `release.yml`, and starts it on the next plugin merge if the version is still untagged. Never put `[skip ci]` on a version commit: GitHub then skips `release.yml`, so the version stays untagged and no release goes out until that next merge. Unreleased bullets merged with no plugin change get a "Release owed" warning from the Validate workflow until a release includes them.
- Merging a version change to `main` runs `.github/workflows/release.yml`, which tags `vX.Y.Z` and publishes a GitHub Release from that changelog entry. Do not create tags or GitHub Releases directly; to publish a version the workflow missed, run it from the Actions tab.
- Bump only for changes to what the skill does. Doc-only fixes never trigger a release; label a wording or typo fix under `plugins/` `release:skip` so it waits for the next release.

## Editing rules

- The list of destinations and surfaces appears in five places: the `marketplace.json` plugin description, the `plugin.json` description, the glean SKILL.md frontmatter `description`, the README intro paragraph, and `plugins/gleaner/README.md` (the directory listing: destinations in its intro, surfaces in its "Reads pages" bullet). When destinations or surfaces change, update all five in the same commit. The glean description must stay at most 500 characters and keep the "glean", "glean it", and "Gleaner" triggers.
- The README "Customizing" section refers to the glean SKILL.md by step number (steps 2, 3, 4 of `## Steps`). Renumbering or reordering steps means updating those references.
- Each skill's `agents/openai.yaml` holds its ChatGPT display metadata and points at that skill's own `assets/icon-small.png` and `icon-large.png` (identical copies; replace all four sets together). Validation fails if those paths stop resolving.
- Adding a skill means adding it to the `skills` array in `scripts/validate-skills.mjs`; otherwise it is silently not validated.
- Because SKILL.md is read as raw text, avoid literal backticks inside code spans and be deliberate with backslashes: describe awkward characters in words; a backtick inside a code span once produced a garbled escape list.

## Git

Work on a branch, run local validation, and open a PR to `main` so the Validate workflow runs before merge. Release commits use the subject `Gleaner X.Y.Z: <lowercase summary>`; other commits use a plain imperative subject.
