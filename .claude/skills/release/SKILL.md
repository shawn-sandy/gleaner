---
name: release
description: Cut a new Gleaner version. Bumps plugin.json, adds a README changelog entry, checks the four destination descriptions match, validates, and commits on a branch. Use when the user asks to release or bump the version.
argument-hint: "patch | minor | major"
disable-model-invocation: true
---

Cut a Gleaner release. Bump type: `$ARGUMENTS` (if empty, ask: patch, minor, or major).

1. **Confirm a bump is warranted.** Run `git log --oneline <last release commit>..HEAD` (the last commit whose subject starts with "Gleaner" and a version number). If every change since then is wording, typo, or doc-only, say so and stop: those ship without a bump.
2. **Bump the version** in `plugins/gleaner/.claude-plugin/plugin.json`. This is the only file with a version field; do not add one to `marketplace.json`.
3. **Add the changelog entry** at the top of the `## Changelog` section at the end of `README.md`, above the previous entry, matching the existing format:

   ```markdown
   **X.Y.Z** (YYYY-MM-DD)
   - User-facing sentence, with `code` for flags and paths.
   ```

   Use today's date. Describe what changed for the user, not the implementation.
4. **Check the four descriptions.** If this release changes destinations or surfaces, confirm the `marketplace.json` plugin description, the `plugin.json` description, the SKILL.md frontmatter `description`, and the README intro paragraph all name the same set. Fix any that drift.
5. **Validate.** Run both and read the output; both must print `Validation passed`:

   ```bash
   claude plugin validate . --strict
   claude plugin validate ./plugins/gleaner --strict
   ```

6. **Commit on a branch** (create one if on `main`), all modified files in one commit:
   - Subject: `Gleaner X.Y.Z: <lowercase summary>`
   - Body: dash bullets wrapped near 70 columns, one per change; end with a `README: ...` bullet naming the README sections touched, including the changelog.
7. Report the new version and the branch. Do not push or open a PR unless asked.
