---
name: release
description: Cuts a new Gleaner release. Writes the changelog entry, checks the four destination lists match, and runs npm run release. Use when the user asks to release or bump the version.
argument-hint: "patch | minor | major"
disable-model-invocation: true
---

Cut a Gleaner release. Bump type: `$ARGUMENTS` (if empty, ask: patch, minor, or major).

1. **Confirm a bump is warranted.** Run `git log --oneline <last release commit>..HEAD` (the last commit whose subject starts with "Gleaner" and a version number) and `git status`. If every change since then is wording, typo, or doc-only, say so and stop: those ship without a bump.
2. **Write the changelog entry** under a `**Unreleased**` line at the top of the `## Changelog` section at the end of `README.md`, above the previous entry. If an earlier PR already started one, review and complete it instead of adding a second. Match the existing format; the script replaces the `**Unreleased**` line with the version and today's date:

   ```markdown
   **Unreleased**
   - User-facing sentence, with `code` for flags and paths.
   ```

   Describe what changed for the user, not the implementation.
3. **Check the four descriptions.** If this release changes destinations or surfaces, confirm the `marketplace.json` plugin description, the `plugin.json` description, the glean SKILL.md frontmatter `description`, and the README intro paragraph all name the same set. Fix any that drift.
4. **Write the commit body** to a file outside the repository, such as your scratchpad: dash bullets wrapped near 70 columns, one per change; end with a `README: ...` bullet naming the README sections touched, including the changelog. The script uses the file verbatim, so end it with any trailers you add to commits.
5. **Run the release.** Claude Code CLI must be on `PATH`; the script refuses to run without it so both strict Claude checks run rather than skip:

   ```bash
   npm ci
   npm run release -- <patch|minor|major> --summary "<lowercase summary>" --body <file>
   ```

   It bumps the version in `plugins/gleaner/.claude-plugin/plugin.json` (the only file with a version field; never add one to `marketplace.json`), dates the `**Unreleased**` entry, runs `npm run validate` and `npm test`, and commits every tracked change as `Gleaner X.Y.Z: <summary>` with your body. On `main` it first creates a `release/X.Y.Z` branch. It refuses untracked files, so `git add` any new files first. Read the validation output. If validation or the commit fails, it restores `plugin.json` and the `**Unreleased**` line; fix the problem and rerun.
6. Report the new version and the branch. Do not push or open a PR unless asked. Merging the version change to `main` runs `.github/workflows/release.yml`, which tags `vX.Y.Z` and publishes a GitHub Release with the changelog entry.
