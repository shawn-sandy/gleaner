# Gleaner ChatGPT editable Pages implementation plan

Implement an optional editable Page destination for Gleaner in ChatGPT. A clip should remain in one editable document while later requests update the relevant sections and return a short confirmation. Preserve Claude Code behavior, formats, destinations, preferences, and release tooling. This is an implementation plan; no plugin code has been changed.

## Scope and verified foundation

On November 7, 2026, a live test in this account created a private Page, read its blocks, updated one paragraph using its observed block ID and hash, and read back the same Page to verify the change. The source link and other blocks remained intact. [Verification Page](https://chatgpt.com/space/page_e886d8305f248191aa40f41451a1bf5b). This establishes basic creation and guarded editing in this session. It does not establish availability in every account, Android rendering, cross-session discovery, conflict handling, or integration with installed Gleaner.

Use the product name Page. Traditional chat Canvas remains outside scope unless an exposed, supported capability is separately verified. Do not advertise this change as Canvas support. Pages tools are supplied by the host or connected app; installing Gleaner cannot grant their availability or permissions.

## Nonnegotiable compatibility requirements

- Activate the new route only when the active assistant host is ChatGPT and the request explicitly selects a Page, or continues an already identified Page clip.

- Claude Code, Claude web, Cowork, and Chrome side-panel behavior must continue through the existing workflow, even when Page-like tools are visible.

- Keep existing defaults, destination flags, output formats, clip schema, extraction, browser selection, YouTube source limitations, and duplicate rules unchanged outside the explicit ChatGPT Page route.

- Do not modify shared preference schema 1, its provider enum, preference examples, synchronization, or stored settings in the first release.

- Do not change shared HTML rendering, Claude artifact publishing, dependency versions, CLI hooks, release scripts, or workflow configuration.

- Narrow host-specific dispatch edits to shared instructions may be necessary. Zero edits to shared files is not a realistic promise; no changes to Claude execution behavior is the acceptance requirement.

## Phase 1 Capture the baseline

1. Create a feature branch from the current default branch. Read AGENTS.md, CLAUDE.md, all four skills, bookmark and preference contracts, validator tests, and current ChatGPT compatibility documentation. Record the base commit SHA and plugin version.

2. Run npm ci, npm run validate, and npm test with Node.js 22 or newer. Run both strict Claude validators with the Claude CLI installed; a reported skip is not a pass.

3. Capture representative Claude outputs and save receipts before editing: chat HTML, explicit Markdown, local project save, same-session update, description-only YouTube save, and follow-up update. Record requested prompts, destination, format, and resulting files.

4. Save baseline hashes for Claude HTML templates, renderer code, preference contract and examples, hooks, dependencies, and release tooling. Use these during final diff review. Keep test records free of credentials and private source content.

## Phase 2 Isolate ChatGPT Page instructions

Add plugins/gleaner/skills/glean/references/chatgpt-pages.md as the single source of Page-specific behavior. The shared glean entry point should contain one explicit ChatGPT-only routing instruction linking to it. Reuse the existing bookmark model and clip content; do not build a second extraction or summarization pipeline.

Recognize requests such as “save this as an editable Page,” “save the clip to a ChatGPT Page,” and “add the tools to this Page clip.” Introduce --to page only as a temporary ChatGPT destination. Do not reinterpret --to chat, --to artifact, an existing named destination, or a saved default. If someone asks for Canvas, explain the verified Page option and obtain their choice instead of silently changing destinations.

Discover the active Page capabilities and read their current tool schemas and host instructions. Creation requires create, read, and edit support for the promised workflow. Existing Page updates require read and edit. Tool presence alone does not prove access: handle returned access failures. If the route is unavailable, explain why and offer chat/file delivery; do not silently redirect an explicitly selected Page destination or claim a Page was saved.

Keep the first release session-scoped. “Always save as a Page” should explain that persistent Page defaults are not yet supported; do not write an unknown provider into shared preferences. A later persistent setting requires a separate design and compatibility review.

## Phase 3 Create one editable clip

1. Resolve the explicit Page request before duplicate checks and preserve the original canonical Source, Saved date, category, tags, notes, parts, and source limitations.

2. For an existing same-session Page clip with the same canonical Source, use the retained Page identity. An explicit request for a new clip creates a separate identity. When searching for an older clip, verify both its source and identity; ambiguous results require a choice.

3. Create a private Page without a parent or Space unless the request names a destination. Do not add sharing, collaborators, automations, or a Space as part of clipping.

4. Convert the full clip into supported native Markdown blocks. Keep the title in the native Page title and avoid repeating it in the body. Preserve timestamp links, code fences, tables, metadata, source limitations, and the copyable follow-up prompt. Do not turn ordinary text into screenshots or executable HTML.

5. Retain one idempotency key per creation attempt and reuse it after an uncertain response with the same arguments. Never create another Page merely because a response timed out.

6. Retain the returned Page ID and canonical URL in session delivery state alongside the existing bookmark ID. Do not invent URLs or place per-clip identities in global preferences.

7. Read the Page back. Confirm the expected title, full clip content, canonical Source, and editable block structure before reporting success. Inspect the rendered preview when available; otherwise distinguish content verification from visual verification.

## Phase 4 Update without losing edits

1. Resolve “add,” “expand,” “correct,” and follow-up requests to the retained Page. If several clips are plausible, ask which one. Do not choose the most recently opened unrelated Page.

2. Read current Page content and instructions before every edit. Treat manual changes as current content; do not replace the Page from a stale Markdown attachment or old bookmark snapshot.

3. Identify the exact target section and preserve unrelated blocks, notes, links, metadata, and manual edits. Use a literal guarded patch for text changes within a block. Use structural edit operations for adding lists, headings, sections, or blocks.

4. Use read-derived Page IDs, block IDs, hashes, stream kind, and sequence guards when provided. Keep logically atomic structural changes in a single supported batch.

5. Inspect every operation receipt, including ignored operations and partial failures. On a stale hash, reread and rebuild only unapplied changes. On an unknown outcome, reconcile current content before another write. Never replay an already applied insertion.

6. Read back added sections and preservation-sensitive edits. Confirm that a repeated request does not add the same section twice. Record the updated content as the current session clip only after verified success.

7. If the Page was deleted, is read-only, or lost access, report the failure without recreating it automatically. Offer a new copy or file only as an explicit recovery choice.

## Phase 5 Keep chat concise and exports accurate

The existing full-preview rule must gain a narrow exception: only a successfully verified ChatGPT Page delivery may return a short outcome and the canonical Page link or supported native preview. A failed Page save cannot use this exception. Ordinary ChatGPT file/chat saves and all Claude previews retain their current rules. An explicit “show the full clip here” request still renders the full current clip.

After “add the tools,” reply with a short confirmation such as “Added the tools list” and the same Page link. Do not append the entire document by default. Use only preview syntax returned or documented by the host. Do not promise that the mobile app opens a particular pane.

Export Markdown only on request in this route. Read the current Page, including manual edits, and derive the export from that verified content. A Page plus an older file creates two independently editable copies: do not claim automatic synchronization. Track export success separately; a failed export does not undo or invalidate a successful Page update.

## Phase 6 Integrate all four skills and documentation

| File or area | Intended change | Compatibility boundary |
| --- | --- | --- |
| glean/SKILL.md | Add host-gated dispatch and temporary Page destination recognition. | Existing host branches and defaults remain intact. |
| glean/references/chatgpt-pages.md | Add create, read, update, recovery, export, and receipt instructions. | ChatGPT only. |
| glean/references/bookmark.md | Add the verified-Page short-confirmation exception and session delivery-reference guidance. | Preserve Claude preview and HTML rules. |
| youtube/SKILL.md | Route explicit ChatGPT Page delivery through the shared adapter. | Do not change extraction or transcript fallbacks. |
| follow-up/SKILL.md | Read and edit the identified Page through the same adapter. | Preserve existing follow-up destinations and three-step behavior. |
| preferences/SKILL.md | Explain the temporary nature of Page requests where needed. | Do not change contract.md, schema, sync, or defaults. |
| docs/chatgpt-marketplace.md | Add capability requirements, examples, limitations, and manual tests. | No universal availability claim. |
| README.md and skill usage guide | Add Page prompts and qualified support statement. | Preserve existing Claude installation and usage. |
| Manifest descriptions and glean frontmatter | Keep destination descriptions synchronized as required by repository guidance. | No new tool permissions or version field. |
| Tests | Add focused host-routing and compatibility fixtures. | Keep baseline tests and snapshots intact. |

Confirm actual paths on the implementation branch before editing. Update all destination descriptions required by AGENTS.md and CLAUDE.md in the same commit. Do not bump the plugin version in the feature PR. Add the behavior change under Unreleased in the README changelog.

## Phase 7 Automated local verification

Run the existing full validation and test suites after the change. If the repository already exposes a deterministic bookmark renderer, test only the changed presentation behavior there; do not add a large application runtime merely to test prose instructions.

Add meaningful fixtures for host routing: ChatGPT plus explicit Page request selects the Page route; Claude plus the same visible tools does not; absent Page tools preserves normal chat behavior; existing destination flags remain unchanged. If there is no executable dispatcher, label instruction-structure checks as static safeguards rather than runtime proof.

Test the scoped preview exception where executable support exists: verified Page success permits a short receipt; failed or uncertain saves do not; explicit full preview still returns the complete clip; ordinary chat and Claude rendering remain byte-identical against committed baseline fixtures where deterministic.

Verify that all existing preference examples still validate without migration and that the preference contract, HTML renderer/templates, dependency files, hooks, and release tooling remain unchanged. Investigate baseline snapshot differences instead of regenerating snapshots to hide regressions. Run npm run validate and npm test and both strict Claude validators locally before pushing.

## Phase 8 Live ChatGPT acceptance tests

| Test | Action | Required result |
| --- | --- | --- |
| Create | Save a supplied short article as a Page. | One private Page; full content, metadata, source, and returned link verified. |
| Update | Add workflow and tools in two requests. | Same Page ID; both additions persist; no duplicate Pages. |
| Repeat | Repeat the tools request. | Existing section is retained or revised once, not duplicated. |
| Manual edit preservation | Manually add a note, then ask Gleaner to edit another section. | Note and unrelated content remain intact. |
| YouTube | Save this description-based video as a Page. | Chapters and limitations persist; no invented transcript details. |
| Follow-up | Request three follow-ups for the Page clip. | Same Page updated; existing content preserved. |
| Export | Manually revise text, then request Markdown. | Export includes the latest manual revision. |
| Tool unavailable | Run in a session without Page tools. | Clear limitation; no false save or silent destination switch. |
| Conflict | Modify a target between read and write in an authorized test. | Conflict is surfaced or safely reconciled; intervening edits survive. |
| Uncertain write | Exercise a controlled timeout or recorded failure fixture. | Reconcile or retry same creation key; no duplicate creation. |
| Lost access or deletion | Use a controlled test Page. | No automatic recreation, overwrite, or permission change. |
| Multiple clips | Save two different sources and request an ambiguous update. | Gleaner asks which clip; no unintended edit. |
| Earlier-session clip | Locate an existing older Page clip. | Existing updated-copy policy remains in force unless a separately approved policy change exists. |
| Mobile | Open the link and preview in Android; reopen and request an edit. | Readability, links, access, and latest content verified on that device. |

Use pasted source material for initial tests so browser and transcript failures do not obscure Page delivery results. Exercise actual URL retrieval separately. Mark unavailable negative scenarios as not tested; a mocked response is not a live service failure. Ask the maintainer to complete device-only or unavailable-account checks and record the evidence.

## Phase 9 Claude Code regression gate

Repeat the baseline prompts in Claude Code after installing the branch version. Test chat HTML output, explicit Markdown, local project save, same-session additions, description-only YouTube behavior, and follow-up updates. Confirm filenames, categories, canonical sources, HTML output, and inline presentation match baseline behavior.

Exercise existing Drive, Notion, artifact, and Cowork destinations where available, including saved preferences and explicit overrides. If those live environments are unavailable, record the gap and obtain maintainer verification before claiming full destination regression coverage. A strict plugin validation pass proves packaging, not live skill behavior.

Run a deliberate isolation test with Page-like tools visible to Claude, or a documented routing fixture when that environment cannot be created. Claude must never invoke the new Page route. Confirm --to chat, --to local, --to drive, --to notion, and --to artifact retain their meanings.

Block release for any changed Claude default, unexpected output-format change, preference migration, lost manual edit, duplicate Page after retry, silent fallback, or unsupported Canvas claim. No finite suite proves zero regressions; the release claim should specify the exact scenarios verified.

## Rollout and rollback

Start with explicit Page requests only, with no automatic migration of clips and no change to default chat delivery. Open a reviewable PR with implementation scope, before-and-after examples, local results, live ChatGPT evidence, Claude regression evidence, and clearly marked gaps. Do not alter CI to avoid tests; local verification can be completed first without adding a new hosted test workflow.

Merging plugin changes can trigger the repository’s existing automatic release. Complete the required acceptance checks before merge. Do not create tags, publish releases, change workflow files, or manually bump versions as part of this feature. Choose the release label through the existing maintainer process.

If regressions appear, revert the feature commits through the normal repository process. Do not delete created Pages, alter their permissions, downgrade preferences, or change existing clips during rollback. The saved Pages remain accessible; direct Page editing can continue through available host tools.

## Definition of done

- A ChatGPT clip can be created, edited twice in the same Page, reopened, and exported with current manual edits preserved.

- Source metadata, timestamp links, notes, limitations, and follow-ups survive updates.

- Successful Page edits use short chat confirmations; existing chat-only delivery still shows the full clip.

- Missing tools, read-only Pages, conflicts, and uncertain saves do not cause false success or duplicate creation.

- Shared preference schema and Claude-specific renderer, defaults, and destination behavior remain unchanged.

- Existing static checks, targeted fixtures, strict Claude validation, and required live Claude and ChatGPT scenarios pass with evidence.

- Android behavior is verified on an actual device before advertising Android support.

- Documentation says Pages and lists capability requirements; traditional chat Canvas is not claimed.

## Evidence and credibility

Repository requirements were read from the current default branch: [AGENTS.md](https://github.com/shawn-sandy/gleaner/blob/main/AGENTS.md), [CLAUDE.md](https://github.com/shawn-sandy/gleaner/blob/main/CLAUDE.md), [README.md](https://github.com/shawn-sandy/gleaner/blob/main/README.md), and [package.json](https://github.com/shawn-sandy/gleaner/blob/main/package.json). These are primary sources for repository structure, validation, and release policy. [Official OpenAI Space documentation](https://learn.chatgpt.com/docs/space) describes collaborative editable Pages. The linked verification Page supplies direct evidence only for this session’s successful create, read, and guarded update. The remaining behavior in this document is proposed implementation and required verification.
