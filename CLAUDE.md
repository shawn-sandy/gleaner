# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A Claude Code plugin marketplace (`shawn-sandy`) that ships one plugin, `gleaner`, with four skills, `glean`, `youtube`, `preferences`, and `follow-up`. There is no application runtime or build; static validator and release-script tests are available: the product is the prose in the four `SKILL.md` files under `plugins/gleaner/skills/` (mostly `glean/SKILL.md`), which the model reads raw at runtime.

## Validate

Run local validation before pushing (Node.js 22 or newer and npm required):

```bash
npm ci
npm run validate
npm test
```

Markdownlint takes its globs and rule overrides from `.markdownlint-cli2.jsonc`, where the disabled rules record house style; fix findings rather than disabling more rules. A PostToolUse hook in `.claude/settings.json` reruns both validates after a Write or Edit under `.claude-plugin/` or `plugins/`; shell edits (`sed`, heredocs) bypass it, and it does not run markdownlint.

Local validation parses all four Skills' frontmatter and ChatGPT metadata, checks manifests, required files and local references, and lints Markdown. It runs both strict Claude validators when `claude` is on `PATH` and reports a skip otherwise. The Validate workflow (`.github/workflows/validate.yml`) runs `npm run validate` and `npm test` with the Claude CLI installed on every pull request and every push to `main`, so both strict checks always run there. Live testing against Chrome, Drive, Notion, and Cowork is done by the maintainer; never report a change as live-tested.

## Versioning and changelog

- The version lives only in `plugins/gleaner/.claude-plugin/plugin.json`. `marketplace.json` has no version field; do not add one.
- The changelog is the last section of `README.md` (there is no CHANGELOG.md). New entries start under a `**Unreleased**` line. Use `/release` to cut a version: it writes the entry, then runs `npm run release`, which bumps the version, dates the entry, validates, and commits. Once the entry is on `main`, the Cut release workflow (`.github/workflows/cut-release.yml`, run from the Actions tab) does the same on `main` and pushes the `release/X.Y.Z` branch for a PR.
- A merge with `**Unreleased**` bullets and no version change releases nothing. While that entry is on `main`, the Validate workflow's push run adds a "Release owed" warning and a job summary linking to Cut release; it never picks the bump, which stays with the maintainer.
- Merging a version change to `main` runs `.github/workflows/release.yml`, which tags `vX.Y.Z` and publishes a GitHub Release from that changelog entry. Do not create tags or GitHub Releases directly; to publish a version the workflow missed, run it from the Actions tab.
- Bump only for changes to what the skill does. Wording, typo, and doc-only fixes ship without a bump.

## Editing rules

- The list of destinations and surfaces appears in four places: the `marketplace.json` plugin description, the `plugin.json` description, the glean SKILL.md frontmatter `description`, and the README intro paragraph. When destinations or surfaces change, update all four in the same commit.
- The README "Customizing" section refers to the glean SKILL.md by step number (steps 2, 3, 4 of `## Steps`). Renumbering or reordering steps means updating those references.
- Each skill's `agents/openai.yaml` holds its ChatGPT display metadata. Glean's icons live in `plugins/gleaner/skills/glean/assets/`, and validation fails if the paths in its `openai.yaml` stop resolving.
- Because SKILL.md is read as raw text, avoid literal backticks inside code spans and be deliberate with backslashes: describe awkward characters in words (see commit 4d6800d, where a backtick-in-code-span attempt produced a garbled escape list).

## Git

Work on a branch, run local validation, and open a PR to `main` so the Validate workflow runs before merge. Release commits use the subject `Gleaner X.Y.Z: <lowercase summary>`; other commits use a plain imperative subject.
