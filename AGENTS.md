# Repository Guidelines

## Project Structure & Module Organization

Gleaner is a Claude plugin marketplace whose runtime behavior is defined primarily in Markdown skills.

- `plugins/gleaner/skills/glean/SKILL.md` defines clipping, destinations, duplicate checks, and search.
- `plugins/gleaner/skills/youtube/SKILL.md` adds transcript handling and timestamped summaries; reuse `glean` for shared behavior.
- `plugins/gleaner/skills/glean/agents/openai.yaml` supplies ChatGPT display metadata.
- `.claude-plugin/marketplace.json` registers the plugin; `plugins/gleaner/.claude-plugin/plugin.json` holds its manifest and version.
- `README.md` contains installation, usage, and the changelog; `plugins/gleaner/skills/README.md` provides skill examples.
- `docs/plans/` holds planning notes, `docs/artifacts/` holds HTML artifacts, and `gleaner-symbol.svg` is the branding asset.

## Build, Test, and Development Commands

There is no application build or development server. With Claude Code CLI and Node.js installed (CI uses Node 22), run from the repository root:

```bash
claude plugin validate . --strict                  # Validate marketplace
claude plugin validate ./plugins/gleaner --strict  # Validate plugin
npx --yes markdownlint-cli2@0.18.1                 # Lint Markdown
```

These checks match `.github/workflows/validate.yml`.

## Coding Style & Naming Conventions

Write direct, actionable skill instructions. Keep each paragraph or list item on one line without hard wrapping. Follow `.markdownlint-cli2.jsonc`; fix violations instead of disabling additional rules. Use two-space indentation for JSON and YAML, lowercase skill directories such as `glean`, and the exact filename `SKILL.md`. Avoid literal backticks inside code spans and check escaping carefully: skill text is read directly by the model.

## Testing Guidelines

There is no automated behavioral test suite, test naming convention, or coverage threshold. Run all three validation commands before pushing. Parse changed skill frontmatter with a YAML parser; plugin validation can miss malformed quotes. Live browser and connector testing is maintainer-run; distinguish static validation from live testing in reports.

## Commit & Pull Request Guidelines

History uses imperative subjects and release titles such as `Gleaner 1.11.0: cover other drive connectors and work mode`. Work on a branch and open a PR to `main`. Describe behavior changes, related issues, and validation results.

For behavior changes, update the plugin version and README changelog; documentation-only edits need no bump. Never add a marketplace version. Keep destination and browser descriptions synchronized across manifests, skill frontmatter, and the README introduction. Update README step references whenever skill steps move.
