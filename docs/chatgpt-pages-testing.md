# ChatGPT Page acceptance and Claude regression checks

## Scope and evidence

The product is skill instructions, not an executable destination dispatcher. Static checks verify routing instructions, linked references, and protected file hashes; they do not prove model compliance or live connector behavior. Run the live cases with the branch version, record prompts, tool receipts, Page IDs, and readbacks, and distinguish mocked failures from real service failures. Use pasted content first to isolate Page delivery from browser retrieval.

## Local checks

Use Node.js 22 or newer. Run `npm ci`, `npm run validate`, and `npm test`. Strict Claude checks must also pass with the Claude CLI installed: `claude plugin validate . --strict` and `claude plugin validate ./plugins/gleaner --strict`. A skipped strict check is not a pass. No new CI workflow, runtime dependency, preference migration, or renderer change is needed.

The Page tests are imported by the existing bookmark test suite. The protected-file fixture records the pre-feature versions of Claude rendering, the shared preference contract/examples, dependencies, CLI hooks, and release automation. Review any intentional future change before updating its hash; never regenerate the fixture merely to silence a failure.

## Live ChatGPT matrix

| Case | Action | Expected evidence |
| --- | --- | --- |
| Create | Save supplied text with metadata as a Page. | One private Page; full content and returned canonical link read back. |
| Two additions | Add workflow, then tools. | Same Page ID; both sections persist. |
| Repeat | Repeat the tools request. | No duplicate section or Page. |
| Preserve manual changes | Manually add a note, then change another section. | Note and unrelated blocks are unchanged. |
| Export | Request Markdown after a manual change. | Export includes current Page content, not the stale attachment. |
| Explicit preview | Say “show the full clip here.” | Full current clip inline; no new save. |
| YouTube | Save a description-only video with chapter links as a Page. | Basis, limitations, channel, and timestamps remain intact. |
| Follow-up | Request three follow-ups for the Page clip. | Same Page; three dated choices; earlier text preserved. |
| Destination precedence | Say “as a Page --to chat.” | Chat delivery; no Page write. |
| Unrelated save | Save another article without selecting Pages. | Existing default applies; retained Page does not redirect it. |
| Format | Explicitly request a Page and raw Markdown only. | Ask which delivery or Page plus export; no silent conversion. |
| Missing tools | Use a session without create/read/edit support. | No false save; choice of alternative, no silent fallback. |
| Access failure | Use an authorized controlled read-only/deleted test Page. | Original retained; no automatic replacement or permission change. |
| Stale hash | Change the target after read, before write. | Conflict handled by rereading; intervening edit preserved. |
| Uncertain create | Exercise an authorized failure or fixture. | Same creation key and arguments; no second Page. |
| Uncertain update | Exercise an authorized failure or fixture. | Read and reconcile before retry; no repeated insertion. |
| Duplicate | Locate an older Page clip by canonical Source. | Verified match and updated-copy policy; older Page unchanged. |
| Ambiguity | Save two clips and make an ambiguous update. | Clarification before editing either. |
| Preferences | Ask “always save as a Page.” | Explain temporary support; preference files unchanged. |
| Android reading | Edit the Page on web or desktop, then open and reopen Page/link on an actual Android device. | Readability, access, links, and latest web/desktop edits verified; no Android editing required. |

Do not trigger real failures by disrupting production systems or weakening security. Mark unavailable cases not tested. Static fixtures and controlled assistant-written notes do not establish actual human editing or Android rendering.

## Claude Code release gate

Capture baseline behavior before changing instructions and repeat with the branch version. Check chat HTML, explicit Markdown, local save, same-session update, YouTube description/transcript handling, and follow-up updates. Verify filenames, categories, sources, HTML companions, and full previews. Test Drive, Notion, artifact, and Cowork saves with existing preferences and explicit overrides where connected; mark missing environments unverified and obtain maintainer evidence before claiming coverage.

Page-like tools visible to Claude must not activate the ChatGPT route. The existing meanings of `--to chat`, `--to drive`, `--to notion`, `--to local`, and `--to artifact` must remain intact. Traditional chat Canvas must not be claimed. Packaging validation is separate from these live checks.

Block release on a changed Claude default or format, altered preference schema, lost manual edit, duplicate creation after retry, silent fallback, or an unsupported Canvas/Android claim. Merging plugin changes can auto-release: complete the gate before merge. Roll back the feature commits through normal repository review; keep created Pages and permissions intact.
