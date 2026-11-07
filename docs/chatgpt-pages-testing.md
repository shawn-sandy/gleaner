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
| Unrelated save | Save another article without selecting Pages. | Resolve normal host defaults independently; retained explicit destinations do not become sticky. |
| Format | Explicitly request a Page and raw Markdown only. | Ask which delivery or Page plus export; no silent conversion. |
| Missing tools, built-in default | Make an unconfigured ChatGPT save without create/read/edit support before any write. | Automatic Markdown chat/file delivery with a truthful explanation; no Page save claim. |
| Missing tools, explicit or retained Page | Explicitly select a Page or update a retained Page without required tools before any write. | Explain the limitation and ask for an alternative; no silent fallback. |
| Access failure | Use an authorized controlled read-only/deleted test Page. | Original retained; no automatic replacement or permission change. |
| Stale hash | Change the target after read, before write. | Conflict handled by rereading; intervening edit preserved. |
| Uncertain create | Exercise an authorized failure or fixture. | Same creation key and arguments; no second Page. |
| Uncertain update | Exercise an authorized failure or fixture. | Read and reconcile before retry; no repeated insertion. |
| Duplicate | Locate an older Page clip by canonical Source. | Verified match and updated-copy policy; older Page unchanged. |
| Ambiguity | Save two clips and make an ambiguous update. | Clarification before editing either. |
| Preferences | Ask “always save as a Page.” | Explain built-in default and any winning saved destination; preference files unchanged. |
| Android reading | Edit the Page on web or desktop, then open and reopen Page/link on an actual Android device. | Readability, access, links, and latest web/desktop edits verified; no Android editing required. |

Do not trigger real failures by disrupting production systems or weakening security. Mark unavailable cases not tested. Static fixtures and controlled assistant-written notes do not establish actual human editing or Android rendering.

## Claude Code release gate

Capture baseline behavior before changing instructions and repeat with the branch version. Check chat HTML, explicit Markdown, local save, same-session update, YouTube description/transcript handling, and follow-up updates. Verify filenames, categories, sources, HTML companions, and full previews. Test Drive, Notion, artifact, and Cowork saves with existing preferences and explicit overrides where connected; mark missing environments unverified and obtain maintainer evidence before claiming coverage.

Page-like tools visible to Claude must not activate the ChatGPT route. The existing meanings of `--to chat`, `--to drive`, `--to notion`, `--to local`, and `--to artifact` must remain intact. Traditional chat Canvas must not be claimed. Packaging validation is separate from these live checks.

Block release on a changed Claude default or format, altered preference schema, lost manual edit, duplicate creation after retry, silent fallback, or an unsupported Canvas/Android claim. Merging plugin changes can auto-release: complete the gate before merge. Roll back the feature commits through normal repository review; keep created Pages and permissions intact.

## Default Page acceptance gates

All cases below are pending live verification with the installed branch. Record host, prompt, version, destination provenance, receipt, Page ID, and readback. Static instruction checks cannot establish these results.

| Case | Required result |
| --- | --- |
| Unconfigured supplied-text save | Exactly one private Page; complete content read back; full inline clip plus verified Page link. |
| Description-only YouTube | Same resolver; source limitations and timestamps preserved in both deliveries. |
| Blocked source | No Page before sufficient source content or explicit link-only choice. |
| Saved Drive/Notion or explicit destination | Existing destination wins; no Page write. |
| Raw Markdown explicit or saved; HTML chat-file request | Chat/file delivery when only built-in default would apply. |
| Explicit Page plus raw-file-only request | Ask before writing. |
| Missing Page tools before write | Built-in default alone falls back to Markdown with truthful explanation. |
| Refusal, uncertain create, failed readback | No silent fallback or duplicate; retain identity and reconcile pending writes. |
| Follow-ups and manual edits | Same Page, preserved changes and current inline output. |
| Short response or Page-only | Honor requested delivery. |
| Page failure with available content | Show available in-chat content and report persistence failure separately. |
| Unconfigured find | Search Pages with verified clip metadata, pagination and bounded-coverage disclosure. |
| Invalid preferences or unavailable configured destination | Existing recovery; Page default does not take over. |

Keep the implementation PR in draft until installed-plugin, critical live ChatGPT, actual Android reading, and live Claude compatibility evidence is complete. No merge or release is authorized by this checklist.
