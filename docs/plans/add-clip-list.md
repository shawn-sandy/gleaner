---
status: in-progress
modified: 2026-11-02
type: feature
created: 2026-11-01
repo-name: gleaner
workflow: never
artifact-url: https://claude.ai/artifact/WRJC5xkzCVmC7EQLByXh9a
issue: https://github.com/shawn-sandy/gleaner/issues/65
glance: Gleaner has no single place that lists everything a user saved, and clips saved to a chat are stored nowhere at all. Once a user picks a list location in preferences, each saved clip gets a row there with its links, and a failed row never costs them the clip. We'll know it worked when npm test proves the row rules and the maintainer's live scenarios show rows landing in Drive, Notion, and a local file.
---

# Plan: Give every saved clip a row in one list the user controls

## Objective

Add an opt-in clip list: users choose where it lives through Gleaner preferences, and every clip they save, including clips saved to a chat, adds a row with its links to that list.

## Context

Gleaner saves each clip to one destination, and the default destination, This conversation, stores nothing. Finding clips later means searching every destination, and a chat clip can only be found through its chat tag line on hosts that can search past conversations.

The Clip index section of `plugins/gleaner/skills/glean/SKILL.md` says "There is no separate index file to keep in sync." This plan deliberately reverses that for users who opt in. Clips stay the source of truth; the list is a convenience that can go stale.

The product is Markdown instructions the model reads at runtime, so saving is not code. Only the row builder and the preferences check are executable. Everything else is prose, covered by wording-tolerant checks in `scripts/bookmark.test.mjs` and maintainer-run live scenarios. Never report those live scenarios as run unless the maintainer ran them.

Risks and mitigations:

- False duplicates: the list holds Source URLs, so the duplicate check and finds would match it as a clip. Both must skip it (step 8).
- Formula injection: a web page title starting with `=` could run as a formula in a Sheet. Row cells neutralize it (step 4).
- Assumes the Sheets connector's `append_values` parses input the way the Sheets UI does, so a leading apostrophe marks text. The connector exposes no input-option setting. If it writes raw values, the apostrophe shows literally, which is cosmetic and safe. Confirm in the live scenarios.
- Extra permission prompts: the Sheets connector adds one more approval on a conversation's first save. The row uses kept lookups, and a decline ends list writes for that conversation.
- Lost rows: two sessions appending to `Clip List.md` at once can lose a row on hosts without a true append. Accepted; the clip itself is unaffected.

## Decisions

- Preference is `skills.gleaner.clip_list`, an alias into `destinations` — the contract rejects unknown top-level fields, so a new one would make an older install treat a synced document as invalid.
- It resolves by the same scope order as `default_destination`, and counts as an alias reference for reset and for dangling-reference checks — one rule, no second resolution path.
- Off until configured — "store the clip somewhere only when the user names a destination" must keep holding for users who never opted in.
- Drive list is a Sheet named `Clip List` in the alias's folder, appended with `append_values` — the Drive connector cannot change file content, and Sheets is the one true append where URLs are clickable.
- Never rewrite the list on Drive to add a row — re-upload and trash would lose rows to any concurrent save. No append tool means no row, reported in one line.
- Local and Cowork list is `Clip List.md` in the alias's base path — an explicit exception to "never overwrite", appending only and never rewriting earlier rows.
- Notion list is a database separate from the clip database — rows in `Browser Research` would trip the duplicate check and show up as empty clips.
- With no list database, Gleaner creates `Clip List` only after an explicit yes, under a page the user names — a narrow exception to "setup creates nothing", chosen by the maintainer because making users build a database first is too much friction. Folder and clip-database creation rules stay as they are.
- Artifact and This conversation are not list locations — an artifact `remote_id` is a publishing scope with no document to append to, and a chat is not persistent.
- One row per clip: a same-session update adds a row only when the clip's link changed — otherwise adding five parts writes five rows. Newest row wins, and an older Drive row can point to a trashed file.
- "Don't save it anywhere" and "don't list this" skip the row for that save — chat saves are listed by default, but an explicit request wins.
- A failed or declined row never changes the clip's result and never triggers the Fallback — the clip is already safe, and the chat tag line still records it.
- Finds keep searching destinations — the list is for reading, and feeding it into search adds dedupe rules nobody asked for.
- Row logic lives in `renderListRow` in `bookmark.mjs`, with the rule also stated in prose — the same arrangement as the bookmarks file, since many hosts have no Node.js.
- Red-green-verify order: steps 1 to 3 write failing tests, steps 4 to 11 make them pass, steps 12 and 13 run the full checks — the steps change source and `npm test` exists. There are no `### Phase:` headings because flat numbering across headings fails MD029, which `npm run validate` enforces on `docs/plans`.
- New tests go in the existing test files and reach the helper through a namespace import — a missing named import would stop the whole file from loading, so the failure wouldn't be the one the test is meant to show.
- Single chain with no lanes — glean's prose cites the contract's rule, so it reads best written after it, and worktree dispatch is not worth it at this size.

## Files

- plugins/gleaner/skills/glean/scripts/bookmark.mjs (modified) — add renderListRow and return list_row from the CLI
- scripts/bookmark.test.mjs (modified) — row rules, CLI output, and prose rules
- scripts/validate-skills.mjs (modified) — check clip_list alias and provider
- scripts/validate-skills.test.mjs (modified) — rejection and acceptance cases
- plugins/gleaner/skills/preferences/references/contract.md (modified) — define clip_list
- plugins/gleaner/skills/preferences/references/examples/user.yaml (modified) — show clip_list
- plugins/gleaner/skills/preferences/SKILL.md (modified) — setup, show, update, and reset cover the list
- plugins/gleaner/skills/glean/SKILL.md (modified) — add the row step, exclusions, and revised statements
- plugins/gleaner/skills/glean/references/bookmark.md (modified) — note field, helper output, and index statement
- docs/preferences-testing.md (modified) — maintainer scenarios
- README.md (modified) — user docs and Unreleased changelog entry

## Steps

1. [x] Add failing cases to scripts/validate-skills.test.mjs that write their own YAML, as the sparse-reset test does: `clip_list: missing` must fail with `invalid clip list reference`, an alias with `provider: artifact` must fail with `invalid clip list provider`, a non-string value must fail, and a valid drive alias must pass. Why: writing YAML directly avoids the `replace` helper's guard, which would error on text the example doesn't contain yet instead of testing the validator. Verify: `node --test scripts/validate-skills.test.mjs` exits non-zero because the three rejection cases expected a failure and the validator returned status 0; paste that output.
2. [x] Add failing `renderListRow` tests to scripts/bookmark.test.mjs, reached through `import * as helper` so the file still loads: a saved Drive clip gives the Clip link and destination label; a chat receipt with a `sandbox:/mnt/data/` file gives an empty Clip link, keeps the Source, and shows This conversation as Saved in; a chat row uses `conversationUrl` when given; a Fallback from Drive is labeled This conversation; failed and skipped receipts return null; a title with a line break stays on one line; a title starting with `=`, `+`, `-`, or `@` is neutralized in cells; a non-HTTP Source is dropped; and CLI output carries `list_row`. Why: these are the rules most likely to break silently: never writing a dead scratch link, never marking a failed save as listed, never letting page text run as a formula. Verify: `node --test scripts/bookmark.test.mjs` exits non-zero with `helper.renderListRow is not a function` from the new tests only, and every existing test still passes; paste that output.
3. [x] Add failing prose tests to scripts/bookmark.test.mjs, in the style of the permission-prompt tests, using `read()` and tolerant matches: glean names the clip list in step 6, excludes it from the duplicate check and finds, keeps a failed row out of the Fallback, and lets an explicit request skip the row; the contract defines `clip_list`, rejects artifact lists, and ties Notion list creation to an explicit yes. Why: saving is prose, so these tests are the only automated guard on the save rules. Verify: `node --test scripts/bookmark.test.mjs` exits non-zero on those assertions; paste that output.

4. [x] Add and export `renderListRow(bookmark, { conversationUrl } = {})` in plugins/gleaner/skills/glean/scripts/bookmark.mjs, reusing `webUrl`, `oneLine`, `escapeMarkdown`, and `markdownLink`. Return null unless status is `saved` or `chat`, otherwise `{ cells, line }`, where cells are Date, Title, Category, Type, Tags, Note, Source URL, Clip link, Saved in; prefix text cells starting with `=`, `+`, `-`, or `@` with an apostrophe; and include `list_row` in the CLI output, taking `conversationUrl` as a top-level input field. Why: one tested builder keeps the file, Sheet, and Notion rows identical. Verify: `node --test scripts/bookmark.test.mjs` passes the row and CLI tests, and `git diff` shows no change to the existing renderers.
5. [x] Extend `preferences()` in scripts/validate-skills.mjs to read `skills.gleaner.clip_list` from the document or its inherited values, require a nonempty string naming a merged alias, and require provider `drive`, `notion`, `cowork`, or `local`; add `clip_list: research` under `skills.gleaner` in examples/user.yaml. Why: a dangling or artifact list should fail validation, and the shipped example should show the setting. Verify: `node --test scripts/validate-skills.test.mjs` exits 0 with all four new cases passing.
6. [x] Update plugins/gleaner/skills/preferences/references/contract.md: replace "currently empty with no setting semantics" for `gleaner` with the `clip_list` definition, say which providers it allows, add it to the resolution order and alias-reference rules, state that it is off when unset, require a Notion list to be a database other than the clip database, and add the one exception to "setup must not create": a `Clip List` database after an explicit yes. Why: every skill reads the contract as the only authority on preferences. Verify: the contract prose test from step 3 passes and `node scripts/validate-skills.mjs` exits 0.
7. [x] Update the operations table in plugins/gleaner/skills/preferences/SKILL.md so `setup` offers the list as optional, `show` reports the list location and its scope, `update` accepts requests such as "keep my clip list in Notion", and `reset` turns it off; when Notion has no list database, ask once, and on a yes create `Clip List` under the page the user names, with the columns from step 4, then verify it before storing the alias; add the list to the contract's one-time setup mention. Why: this is how users configure the location, which the request asks for directly. Verify: read the table and confirm all four rows cover the list, and that the "never create a research database" sentence still stands alongside the one `Clip List` exception.
8. [x] Edit plugins/gleaner/skills/glean/SKILL.md: add a `**Clip list.**` block after the Fallback paragraph at the end of step 6, covering when a row is added, each provider's method, first-write creation only after a complete search, and the failure, decline, and skip rules; then make the Drive and local duplicate checks and Clip index step 2 skip anything named `Clip List`. Why: placing it inside step 6 keeps step numbers stable for the README and lets YouTube and follow-up inherit it through glean. Verify: the glean prose tests from step 3 pass, and step numbers 1 through 7 are unchanged.
9. [x] Revise the statements this change makes false in glean: "There is no separate index file" in Clip index, "Nothing is stored" under This conversation so it says the clip stays in chat while a configured list gets its row, and step 7 so it reports a row that couldn't be added in one line. Why: the model reads this prose literally, so a stale statement would override the new step. Verify: `grep -n "no separate index" plugins/gleaner/skills/glean/SKILL.md` prints nothing.
10. [x] Update plugins/gleaner/skills/glean/references/bookmark.md: add an optional `note` field, replace "No separate index is needed" with a pointer to the clip list, and document `list_row` and `conversationUrl` under the optional renderer. Why: the contract says every output derives from one bookmark, so the row must be described there. Verify: `grep -n "list_row" plugins/gleaner/skills/glean/references/bookmark.md` prints a match and `grep -n "No separate index" plugins/gleaner/skills/glean/references/bookmark.md` prints nothing.
11. [x] Add a `### Clip list` section to README.md after Bookmarks file, update the "A clip in the conversation isn't stored anywhere" paragraph, add an `**Unreleased**` entry at the top of the changelog, and add scenarios to docs/preferences-testing.md for each provider, Notion database creation with a yes and with a no, a chat save, a Fallback, a decline, a duplicate check with a list present, a YouTube save, a follow-up save, and the Sheets apostrophe. Why: the changelog is required in the PR that changes the plugin, and live connector behavior can only be proven by the maintainer. If tests still fail after 8 iterations across steps 4 to 11, stop and report the failing assertion, the last diff tried, and what was ruled out; do not report success. Verify: `npx markdownlint-cli2 README.md docs/preferences-testing.md` exits 0.

12. [x] Run the full suite with `npm test`. Why: the row helper shares code with the presentation and bookmarks renderers, so a local pass isn't enough. Verify: exit 0 with every test file reported, and the output observed rather than suppressed.
13. [x] Run `npm run validate`. Why: it parses frontmatter and contract examples, checks local references, and lints Markdown. Verify: exit 0, and state whether the Claude validators ran or reported SKIP.

## Tests

Tier 1 — This plan changes application code
- Objective: a clip saved to chat and a clip saved to Drive each produce a list row with their links, and a failed save produces none. File: scripts/bookmark.test.mjs; Type: mock; Asserts: renderListRow returns one-line cells for saved and chat receipts, drops scratch links, labels a Fallback as This conversation, and returns null for failed and skipped; Run: node --test scripts/bookmark.test.mjs
- Unit: row safety. File: scripts/bookmark.test.mjs; Targets: renderListRow; Key cases: line break in title, title starting with =, +, -, or @, non-HTTP Source, conversationUrl on a chat row, no Source at all
- Unit: preferences check. File: scripts/validate-skills.test.mjs; Targets: preferences(); Key cases: dangling alias, artifact provider, non-string value, valid drive alias, project scope inheriting a user alias
- Integration: CLI output. File: scripts/bookmark.test.mjs; Targets: bookmark.mjs CLI; Key cases: list_row present for a saved receipt, null for a skipped one, conversationUrl forwarded
- Integration: prose rules. File: scripts/bookmark.test.mjs; Targets: glean SKILL.md and contract.md; Key cases: list named in step 6, duplicate check and finds exclude it, failed row avoids the Fallback, explicit skip, artifact rejected, Notion creation needs a yes

## Acceptance Criteria

- [ ] A user can set, show, change, and turn off the list location through the preferences skill.
- [ ] With no `clip_list` set, a save writes nothing new anywhere.
- [ ] A clip saved to This conversation adds a row when a list is configured, with no scratch or attachment link in it.
- [x] A Fallback row says This conversation, not the destination that failed.
- [ ] A failed or declined row leaves the clip's save result unchanged and starts no Fallback.
- [ ] A same-session update adds a row only when the clip's link changed.
- [ ] "Don't save it anywhere" and "don't list this" add no row.
- [x] A row never holds raw formula text, and a page title cannot break it across lines.
- [ ] A `Clip List` entry is never reported as a duplicate or returned as a clip by a find.
- [ ] Gleaner creates a Notion `Clip List` database only after the user says yes, and creates no other database during setup.
- [x] `clip_list` naming a missing alias or an artifact destination fails `node scripts/validate-skills.mjs`.
- [x] `npm test` and `npm run validate` exit 0 with their output observed.

## Completion Report

- A user can set, show, change, and turn off the list location through the preferences skill — the preferences skill's operations table and contract cover it, but no maintainer has run the docs/preferences-testing.md Clip list scenarios yet.
- With no `clip_list` set, a save writes nothing new anywhere — glean step 6 states it; the Off by default live scenario has not been run.
- A clip saved to This conversation adds a row when a list is configured, with no scratch or attachment link in it — renderListRow tests prove the row's content; that a chat save actually writes the row is prose, not yet live-run.
- A failed or declined row leaves the clip's save result unchanged and starts no Fallback — prose test passes; the Decline live scenario has not been run.
- A same-session update adds a row only when the clip's link changed — prose test passes; the Same-session update live scenario has not been run.
- "Don't save it anywhere" and "don't list this" add no row — prose test passes; the Skip live scenario has not been run.
- A `Clip List` entry is never reported as a duplicate or returned as a clip by a find — prose test passes; the Duplicate check and finds live scenario has not been run.
- Gleaner creates a Notion `Clip List` database only after the user says yes, and creates no other database during setup — contract prose test passes; the Notion creation live scenario has not been run.
- Sheets apostrophe risk — whether `append_values` parses input like the Sheets UI, hiding the leading apostrophe, is unconfirmed until the Sheets apostrophe live scenario runs.

## Verification

Run `npm test` and `npm run validate`; both must exit 0. Then pipe a fixture through the CLI with a `chat` receipt whose `saved_file` is a `sandbox:/mnt/data/` path, and confirm `list_row.cells` keeps the Source, has an empty Clip link, and shows This conversation as Saved in. Set `clip_list: missing` in a scratch copy of `examples/user.yaml` and confirm the validator fails naming the clip list.

Saving itself is prose, so the end-to-end proof is the maintainer running the `docs/preferences-testing.md` scenarios: configure a list for each provider, save a page, a chat clip, a YouTube video, and a follow-up, and confirm one row each with working links. Report this part as not yet run until the maintainer does it.

## Next Steps

- Let finds read the list first
  Faster than crawling every destination, at the cost of dedupe rules between the list and the stores.

  ```text
  In the gleaner repo, change the Clip index section of plugins/gleaner/skills/glean/SKILL.md so a configured clip list is read before destinations, deduplicating on Source URL and Saved date as the past-conversations rule already does. Add an Unreleased entry to the README changelog. Verify with npm test and npm run validate.
  ```

- Add a list rebuild
  Backfills clips saved before the list existed, or rows lost to a failed write.

  ```text
  In the gleaner repo, add a "rebuild my clip list" request to plugins/gleaner/skills/glean/SKILL.md that gathers clips through Clip index steps 1 and 2 and appends rows for clips the list lacks, never removing rows. Add an Unreleased entry to the README changelog. Verify with npm test and npm run validate.
  ```

## Resources

- `plugins/gleaner/skills/glean/SKILL.md` step 6 and Clip index — the save flow and the "no separate index" statement.
- `plugins/gleaner/skills/preferences/references/contract.md` — schema, scope order, and the rule rejecting unknown top-level fields.
- Google Sheets connector `append_values` schema and Drive connector `update_file` schema — read this session; `update_file` changes metadata only.
