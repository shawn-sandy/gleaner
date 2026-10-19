# Repository Guidelines

## Project Structure & Module Organization

Gleaner is a Claude plugin marketplace whose runtime behavior is defined primarily in Markdown skills.

- `plugins/gleaner/skills/glean/SKILL.md` defines clipping, destinations, duplicate checks, and search.
- `plugins/gleaner/skills/preferences/SKILL.md` manages shared settings; `references/contract.md` under that skill defines storage, schema, and sync.
- `plugins/gleaner/skills/youtube/SKILL.md` adds transcript handling and timestamped summaries; reuse `glean` for shared behavior.
- `plugins/gleaner/skills/follow-up/SKILL.md` reads a saved clip and suggests three follow-ups; reuse `glean` to find, read, and save clips.
- `plugins/gleaner/skills/glean/agents/openai.yaml` supplies ChatGPT display metadata.
- `.claude-plugin/marketplace.json` registers the plugin; `plugins/gleaner/.claude-plugin/plugin.json` holds its manifest and version.
- `README.md` contains installation, usage, and the changelog; `plugins/gleaner/skills/README.md` provides skill examples.
- `docs/plans/` holds planning notes, `docs/artifacts/` holds HTML artifacts, and `gleaner-symbol.svg` is the branding asset.

## Build, Test, and Development Commands

There is no application build or development server. With Node.js 22 or newer and npm installed, run from the repository root:

```bash
npm ci
npm run validate
npm test
```

Local validation checks all four Skills, ChatGPT metadata, manifests, required files, local references, and Markdown. When Claude Code CLI is on `PATH`, it also runs `claude plugin validate . --strict` and `claude plugin validate ./plugins/gleaner --strict`; otherwise it reports a skip. There is no GitHub Actions validation workflow; `.github/workflows/release.yml` only publishes releases.

## Coding Style & Naming Conventions

Write direct, actionable skill instructions. Keep each paragraph or list item on one line without hard wrapping. Follow `.markdownlint-cli2.jsonc`; fix violations instead of disabling additional rules. Use two-space indentation for JSON and YAML, lowercase skill directories such as `glean`, and the exact filename `SKILL.md`. Avoid literal backticks inside code spans and check escaping carefully: skill text is read directly by the model.

## Testing Guidelines

Run `npm run validate` and `npm test` before pushing. The fixture tests exercise validator failures; there is no automated Skill runtime test suite. Frontmatter is parsed with `yaml`; Claude plugin validation alone can miss malformed quotes. Live browser and connector testing is maintainer-run; distinguish static validation from live testing in reports.

## Commit & Pull Request Guidelines

History uses imperative subjects and release titles such as `Gleaner 1.11.0: cover other drive connectors and work mode`. Work on a branch and open a PR to `main`. Describe behavior changes, related issues, and validation results.

For behavior changes, add user-facing bullets under `**Unreleased**` at the top of the README changelog, then run `npm run release -- <patch|minor|major> --summary "<lowercase summary>" --body <file>` to bump the version, date the entry, validate, and commit; documentation-only edits need no bump. Merging a version change to `main` tags it and publishes a GitHub Release. Never add a marketplace version. Keep destination and browser descriptions synchronized across manifests, skill frontmatter, and the README introduction. Update README step references whenever skill steps move.
