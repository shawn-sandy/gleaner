# Repository Guidelines

## Project Structure & Module Organization

Gleaner is a Claude plugin marketplace whose runtime behavior is defined primarily in Markdown skills.

- `plugins/gleaner/skills/glean/SKILL.md` defines clipping, destinations, duplicate checks, and search.
- `plugins/gleaner/skills/preferences/SKILL.md` manages shared settings; `references/contract.md` under that skill defines storage, schema, and sync.
- `plugins/gleaner/skills/youtube/SKILL.md` adds video details (description, channel, chapters) and timestamped summaries; reuse `glean` for shared behavior.
- `plugins/gleaner/skills/follow-up/SKILL.md` reads a saved clip, suggests three follow-ups, and saves them to the clip; reuse `glean` to find, read, and save clips.
- Each skill's `agents/openai.yaml` supplies ChatGPT display metadata; glean's points to icons in `plugins/gleaner/skills/glean/assets/`.
- `.claude-plugin/marketplace.json` registers the plugin; `plugins/gleaner/.claude-plugin/plugin.json` holds its manifest and version.
- `README.md` contains installation, usage, and the changelog; `plugins/gleaner/skills/README.md` provides skill examples.
- `docs/chatgpt-marketplace.md` covers ChatGPT import and its manual checklist; `docs/preferences-testing.md` lists maintainer-run preference scenarios.
- `scripts/validate-skills.mjs` runs local validation; `scripts/release.mjs`, `scripts/changelog.mjs`, `scripts/release-notes.mjs`, and `scripts/auto-release.mjs` cut releases; the `*.test.mjs` files beside them are their tests.
- `.claude/skills/release/SKILL.md` is the `/release` workflow, and `.claude/settings.json` holds a hook that reruns strict Claude validation after edits under `.claude-plugin/` or `plugins/`.
- `docs/plans/` holds planning notes, `docs/artifacts/` holds HTML artifacts, and `gleaner-symbol.svg` is the branding asset.

## Build, Test, and Development Commands

There is no application build or development server. With Node.js 22 or newer and npm installed, run from the repository root:

```bash
npm ci
npm run validate
npm test
```

Local validation checks all four Skills, ChatGPT metadata, manifests, required files, local references, and Markdown. When Claude Code CLI is on `PATH`, it also runs `claude plugin validate . --strict` and `claude plugin validate ./plugins/gleaner --strict`; otherwise it reports a skip. `.github/workflows/validate.yml` runs `npm run validate` and `npm test` with the Claude CLI installed on every pull request and every push to `main`, and on a push warns "Release owed" while `main` has an `**Unreleased**` changelog entry and no unreleased plugin change; `.github/workflows/auto-release.yml` releases every plugin change merged to `main` (anything under `plugins/` or `.claude-plugin/` except READMEs, changelogs, and `docs/` folders) by running `npm run release`, pushing to `main`, and dispatching `release.yml`; `.github/workflows/release.yml` publishes releases and then calls the Gleaner site's Netlify build hook (the `NETLIFY_BUILD_HOOK` secret) so the site's changelog picks up the release, and `.github/workflows/cut-release.yml`, started by hand, only runs `npm run release` on `main` and pushes its `release/X.Y.Z` branch.

## Coding Style & Naming Conventions

Write direct, actionable skill instructions. Keep each paragraph or list item on one line without hard wrapping. Follow `.markdownlint-cli2.jsonc`; fix violations instead of disabling additional rules. Use two-space indentation for JSON and YAML, lowercase skill directories such as `glean`, and the exact filename `SKILL.md`. Avoid literal backticks inside code spans and check escaping carefully: skill text is read directly by the model.

## Testing Guidelines

Run `npm run validate` and `npm test` before pushing. The tests exercise validator failures and the release script; there is no automated Skill runtime test suite. Frontmatter is parsed with `yaml`; Claude plugin validation alone can miss malformed quotes. Live browser and connector testing is maintainer-run; distinguish static validation from live testing in reports.

## Commit & Pull Request Guidelines

History uses imperative subjects and release titles such as `Gleaner 1.11.0: cover other drive connectors and work mode`. Work on a branch and open a PR to `main`. Describe behavior changes, related issues, and validation results.

For behavior changes, add user-facing bullets under `**Unreleased**` at the top of the README changelog. Merging the PR releases it automatically as a patch; label it `release:minor` or `release:major` for a larger bump, or `release:skip` for wording-only plugin edits that should wait. Do not bump the version in a PR unless cutting a release by hand with `npm run release -- <patch|minor|major> --summary "<lowercase summary>" --body <file>`. Merging a version change to `main` tags it and publishes a GitHub Release. Never add a marketplace version. Keep destination and browser descriptions synchronized across manifests, skill frontmatter, and the README introduction. Update README step references whenever skill steps move.
