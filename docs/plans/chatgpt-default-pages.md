# Gleaner ChatGPT Default Page Saving Implementation Plan

Make editable Pages the built-in destination for new Gleaner saves in ChatGPT when no explicit destination or saved destination applies. Preserve existing destinations, raw file requests, and every Claude workflow. This plan proposes a plugin change; it does not change current preferences or authorize a merge or release.

## Scope and design decision

Implement a ChatGPT host default, not a new shared preference provider. Keep schema 1 and its destination records unchanged. Page saves use native editable content and verified canonical links. Ordinary Page saves preserve the current in-chat output and also save the complete clip to an editable Page. Include a verified Page link alongside the existing output. Exports remain available on request.

Existing configured Drive, Notion, local, Cowork, and artifact destinations keep precedence. Existing clips keep their retained destination on updates. No automatic migration of old clips, Page collection creation, sharing changes, or traditional Canvas support is included.

## Current foundation

[PR 81](https://github.com/shawn-sandy/gleaner/pull/81) added explicit Page saves, guarded updates, duplicate handling, readback, and export guidance. The [Page adapter](https://github.com/shawn-sandy/gleaner/blob/main/plugins/gleaner/skills/glean/references/chatgpt-pages.md) currently requires explicit selection. The [preferences contract](https://github.com/shawn-sandy/gleaner/blob/main/plugins/gleaner/skills/preferences/references/contract.md) currently says the environment default is the conversation on every surface.

These repository sources establish intended behavior. Static instruction tests establish wording and protected-file integrity; they do not establish model compliance, installed-plugin behavior, device rendering, or live Claude compatibility.

## Destination resolution

Resolve validated preferences and enabled sync before deciding the destination. Preserve invalid-store, unreachable configured destination, and unresolved sync conflict handling.

| Priority | Condition | Behavior |
| --- | --- | --- |
| 1 | Explicit destination flag | Use it; flags beat destination wording. |
| 2 | Explicit destination wording | Use that destination. |
| 3 | Update to an identified retained clip | Reuse its destination and format. |
| 4 | Session destination override | Preserve it. |
| 5 | Project destination preference | Preserve it. |
| 6 | User destination preference | Preserve it. |
| 7 | New save in ChatGPT with no destination selected | Select the built-in Page default, subject to format and capability rules. |
| 8 | Other host with no destination selected | Keep its existing default. |

Explicit or saved raw Markdown formats need separate handling. If only the built-in Page default would apply, preserve a winning raw Markdown format by using existing Markdown chat/file delivery. Apply the equivalent rule to an explicit HTML chat-file request. Do not ask about an incompatibility created solely by the new built-in default. An explicitly selected Page combined with raw Markdown or HTML only still requires a choice between native Page delivery, a file, or Page plus export.

Keep per-save provenance: explicit, retained clip, session, project, user, or built-in default. This distinction controls fallback and reporting. Do not store this runtime record in shared preferences.

## Capability and fallback policy

Discover current create, read, and edit tools; never hard-code an API name from a prior session. Use existing Page creation and recovery guidance.

| State | Built-in Page default | Explicit Page or retained Page |
| --- | --- | --- |
| Required tools absent before any write | Deliver through existing Markdown chat/file route; explain once that Pages are unavailable here. | Explain the limitation and ask for an alternative. |
| Access denial or confirmed write rejection | Report the failure and offer a choice; do not silently redirect. | Same. |
| Create or update outcome uncertain | Retain identity and original arguments; reconcile the same operation before any alternative. | Same. |
| Create succeeded but readback failed | Report verification pending with the returned identity; do not create another copy. | Same. |
| Configured non-Page destination unavailable | Keep existing explicit recovery behavior; the Page default does not take over. | Not applicable. |

Limit automatic fallback to missing tools detected before a write. Missing capability is different from a service refusal or uncertain write. A successful fallback says what was delivered and why; it never claims a Page save.

## Implementation steps

### 1 Establish the baseline

Create an isolated feature branch from the latest main branch and read repository instructions. Recheck PR 81 and any subsequent release changes. Run the repository's existing local validation and test commands before edits. Record baseline failures separately.

Inventory routing and default statements using repository search, including explicit Page wording, conversation defaults, first-save setup, format defaults, YouTube entry points, follow-up handling, previews, search, examples, and release notes. Inspect actual file paths before editing.

### 2 Update the central route

In plugins/gleaner/skills/glean/SKILL.md, replace the all-surface conversation default with host-specific defaults. Route a new unconfigured ChatGPT save to the existing Page adapter after preference resolution. Retain explicit flags, collected-part destinations, retained clip identity, source extraction, and blocked-content safeguards.

In plugins/gleaner/skills/glean/references/chatgpt-pages.md, allow selection by the built-in ChatGPT default as well as existing explicit and retained-clip requests. Add selection provenance and the fallback decision table. Keep private creation, idempotency, guarded edits, manual-edit preservation, readback, and earlier-session updated-copy rules.

Do not interpret an article called a page or a selected unrelated Page as the target. Do not create a Page until the source evidence supports the requested clip.

### 3 Align preferences and formats

Make the smallest necessary changes to plugins/gleaner/skills/preferences/references/contract.md: describe host-specific environment defaults, default-only raw file handling, first-save behavior, and reporting. Leave allowed providers, schema, synchronization, locking, and stored data untouched.

Update plugins/gleaner/skills/preferences/SKILL.md to explain that Pages are the ChatGPT built-in default rather than a storable provider. “Always save as a Page” can explain the built-in behavior without writing a preference. If a saved destination currently wins, explain that conflict and handle any explicit request to remove it through normal preference operations. Never silently clear an existing default.

Define first-save behavior explicitly: the built-in Page route does not require setup or a test Page. Capability discovery does not prove permission; the actual create/readback establishes a save.

### 4 Align dependent skills and presentation

Inspect YouTube and follow-up instructions, the bookmark presentation contract, and ChatGPT compatibility references. Remove contradictory explicit-only gates. Make YouTube delegate to the same destination resolution rather than add another resolver.

For follow-ups and same-session additions, read the retained Page and edit that identity. Preserve the earlier-session updated-copy policy. Export reads current Page content, including manual edits.

Verified Pages preserve the existing in-chat clip output, including its current summary, details, source links, tags, and preview behavior as applicable. Add a short save confirmation and verified Page link alongside that output; do not replace the output with a link-only receipt or require a separate request to see the clip in chat. Save the complete clip to the Page from the same source-grounded content used for the chat response. Explicit requests for a shorter response or Page-only delivery still take precedence.

For follow-up additions, retain the current in-chat response behavior while updating the same Page. Report Page save or update failures separately and truthfully without suppressing the available in-chat content or implying persistence succeeded. Non-Page deliveries retain their existing preview behavior. Do not add automatic Markdown exports or HTML companions to Page saves.

### 5 Align search and duplicate checks

When the effective destination is the built-in Page default, search Pages using available search tools and verify clip metadata. Preserve explicit destination scoping, existing conversation-tag search, pagination, bounded-result disclosures, and index exclusions.

Use retained identity for same-session duplicates. An earlier-session title or Source match still follows the existing updated-copy or skip choice. Missing search capability must not be described as proof that no duplicate exists.

Do not make Page search run on Claude or explicitly non-Page saves. Existing clip lists and requested indexes receive verified Page links; their failure never repeats the clip save.

### 6 Update documentation and packaging text

Update README examples, ChatGPT compatibility documentation, Page acceptance checks, skill descriptions, and marketplace descriptions that still advertise explicit-only support. State the Page default applies only in ChatGPT when another destination or raw file request does not win. Explain that it adds editable Page persistence while preserving the current in-chat output, with a verified Page link alongside it.

Add a changelog entry with fallback and compatibility limits. Avoid claims that Gleaner installs Page tools, guarantees Android editing, supports traditional Canvas, or synchronizes exported files.

## Validation and evidence

### Local checks

Run the repository's documented validation, Markdown lint, tests, and diff whitespace checks. Inspect package scripts before selecting commands. Run strict plugin validation in an authorized available Claude environment; record unavailable checks as unverified.

Extend scripts/chatgpt-pages.test.mjs and the existing test entry point where appropriate. Test the routing contract at each actual entry point, including negative host cases and contradictory wording. Do not add a fake executable dispatcher simply to make instruction tests pass.

Review protected-content fixtures individually. Existing hashes for an intentionally changed preferences contract must be updated only after reviewing the exact diff and explaining why; never regenerate the entire baseline to suppress failures. Keep unrelated Claude renderer, templates, dependencies, hooks, release tooling, and preference examples protected.

### Live acceptance matrix

| Case | Required result |
| --- | --- |
| Fresh unconfigured ChatGPT save using supplied text | Exactly one private Page, full metadata and content read back, current in-chat clip output preserved, and verified Page link alongside it. |
| YouTube with readable description | Same Page default and current in-chat output, with source limitations, channel, and timestamps preserved in both deliveries as applicable. |
| Blocked source without sufficient content | Existing blocked-content behavior; no premature Page creation. |
| Existing saved Drive or Notion destination | Existing destination wins; no Page write. |
| Explicit --to chat, Drive, local, or another supported destination | Explicit route wins. |
| Conflicting flag and destination wording | Flag wins. |
| Explicit or saved raw Markdown without explicit destination | Existing Markdown delivery; no Page write. |
| Explicit Page plus raw-file-only format | Choice requested before saving. |
| Missing Page tools before write | Markdown fallback with truthful explanation; no false Page receipt. |
| Access refusal or confirmed rejection | Failure reported and alternative offered; no silent fallback. |
| Uncertain create or lost readback | Same identity and creation key retained; no duplicate Page. |
| Same-session workflow then tools additions | Same Page; both sections retained; current in-chat follow-up output preserved. |
| Repeated addition | No duplicate section or Page. |
| Human edit followed by assistant addition | Human edit and unrelated content preserved. |
| Stale guard | Reread and reconcile; intervening change preserved. |
| Explicit short response or Page-only request | Requested response length or delivery honored; no forced full inline duplication. |
| Page save or update failure with available clip content | Current in-chat content remains available; failure clearly reported; no false save claim. |
| Full preview and Markdown export | Current Page content, including manual edits; no new Page. |
| Find with no configured destination | Page clips searched with verified metadata and bounded coverage disclosed. |
| Earlier-session duplicate | Existing updated-copy or skip choice retained. |
| Unrelated new clip after a retained explicit destination | Normal resolved defaults; no accidental sticky routing. |
| Configured destination or preference store unavailable | Existing recovery; no automatic switch to Pages. |
| Android opening and reopening | Actual device confirms readable latest content and working links. |
| Claude, Claude Code, and Cowork | Baseline default, formats, saves, updates, YouTube handling, and follow-ups unchanged. |

Capture prompts, host, installed version or branch, selected destination provenance, tool receipts, Page IDs, readbacks, and pass/fail status. Keep test Pages private; do not delete existing clips. Clearly separate actual service cases from mocked failures. A branch session is not an installed-marketplace test.

## Rollout and rollback

Keep the implementation PR in draft until local validation, critical ChatGPT acceptance cases, installed-plugin verification, actual Android reading, and required Claude compatibility evidence are complete. Missing access is an unverified gate, not a pass.

Review shared instruction diffs specifically for Claude effects, despite no schema change. Merging may trigger the existing automatic release workflow, so complete release gates before merge. Do not add new release automation or manually bump versions unless the repository's current process requires it.

Release notes must explain the changed unconfigured ChatGPT default, precedence of existing destinations and file requests, preservation of current in-chat output alongside the Page link, and the missing-tool fallback.

Rollback through a reviewed revert of this feature's changes. Restore the prior explicit Page route without deleting created Pages, changing their permissions, removing exported files, or migrating preferences.

## Completion criteria

- Unconfigured ChatGPT saves reliably create and verify one editable Page.
- Current in-chat clip and follow-up output remains available by default, with the verified Page link alongside it; explicit response-length and Page-only requests are honored.
- Explicit destinations, saved destinations, retained clips, and raw file requests keep their intended behavior.
- Missing-tool fallback is truthful and never masks an uncertain write or refusal.
- Source extraction and blocked-content behavior remain intact.
- Same-Page edits preserve human changes and avoid duplicates.
- Search, YouTube, follow-ups, previews, and exports agree on the new default.
- Schema 1 remains valid with no new provider or preference migration.
- Required Claude and Android evidence is recorded before merge and release.

The implementation deliverable should include the focused PR, an updated acceptance checklist, verification evidence with remaining gaps, and release notes.
