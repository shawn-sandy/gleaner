# Preferences acceptance scenarios

These are maintainer-run scenarios, not claims of live testing. Use disposable local config/project roots and a test Drive document/account. Record host, available connectors and capabilities, starting user/project/cloud YAML and baseline, request, effective destination/format, writes/readbacks, and result for each case. Use the [schema and examples](../plugins/gleaner/skills/preferences/references/contract.md). Never use real credentials in fixtures or logs.

## Setup and resolution

| Scenario | Action and expected evidence |
| --- | --- |
| First save | Start unconfigured; save a page. Gleaner gives the clip in the chat with no setup prompt and mentions setup once per session. Run `/gleaner:preferences setup`: setup offers destination, format left unset (with `auto` and `markdown` as choices), sync opt-in, and skip. Accepting the format suggestion writes no `default_format`. Verify the selected resource before local persistence; no clip moves or database creation during setup. |
| Skip | Choose “just this save”; use the environment default or chosen session value, without creating preferences. Another save in the session does not repeat setup. |
| Precedence | Give all scopes different destinations and formats. Remove explicit, session, project, then user settings in turn; verify each next scope wins. `--to` beats conflicting words. Show includes alias and record provenance when different. |
| Permanent/temporary | “Always save here” updates user preferences; “save this here” and flags leave them unchanged. Explicit project/session updates touch only that scope. |
| Project isolation | Use two project roots with different overrides; switch roots and confirm overrides do not leak. Reset an override reveals user/default values. Inspect cloud payload: no project or effective merged configuration. |
| Invalid data | Try malformed YAML, schema 2, missing alias, and instruction-like labels. Report and preserve invalid files, offer session settings, execute no configuration text. Preserve an unknown namespace through updates. |
| Formats | Test local and Drive raw `.md`, normal `auto` outputs, Notion/artifact with `markdown`, and Drive without raw upload. With an explicit `markdown`, an incompatible destination asks before any save; defaults remain unchanged. With no format set, Drive saves raw `.md` when its connector supports raw uploads and a Google Doc when it doesn't, and Notion/artifact save natively without asking. With no format set or `auto`, a chat clip is an attached `.md` file in ChatGPT and `.html` in Claude. With `markdown`, both give `.md`; without attachments, ChatGPT delivers the full clip inline once as rendered Markdown, while Claude gives one Markdown code block. Verify that the assistant host, not its connected browser, selects the default. |
| Host-specific chat delivery | In each host, save a page, a YouTube video, and an answer with unset and `auto` formats, then add a part and follow-ups to the same-session clip. ChatGPT keeps `.md` with no automatic HTML companion; Claude keeps HTML. Explicit Markdown wins in Claude; an explicit HTML chat-file request works in ChatGPT without changing preferences. Existing HTML clips/companions retain their format on update. A failed Drive save offered back in ChatGPT uses Markdown unless HTML was explicitly requested. |
| Chat-only delivery without attachments | Save a page, video, and answer in ChatGPT without attachment support, then add a part and follow-ups. Deliver the complete clip inline once, outside a surrounding code block, with actual code fences, source links, notes, limitations, and the copyable prompt preserved. Say no file was attached. Repeat with no-preview: full content is still required for chat-only delivery. In Claude, retain the Markdown file code block and compact preview. |
| Drive selection | Connect Drive with no preferences: a normal save still uses the conversation. Select Drive explicitly: use `Browser Research/<Category>`. Repeat with a custom folder name and a configured folder ID: each overrides that folder default. Keep the same resolved ID throughout duplicate checks, category organization, and saving; multiple matching folders require a choice. |
| Drive filename collisions | Precreate `<name>.md` and `<name>-2.md` in the category folder. A new raw Markdown clip checks and uses `<name>-3.md`, with no doubled extension. Repeat after conversion falls back to raw Markdown; converted Docs retain extensionless collision handling. |
| Unreachable destination | Disconnect the saved provider or move to a device lacking the path. Ask for a temporary alternative; repeat duplicate detection there, never silently redirect or persist the alternative. |
| Cloud-only | Disable local file access; discover/select Drive and verify updates by readback. Restart session and rediscover. A second save in one conversation makes no new discovery or sync call, including after finding nothing or a declined search. Without writable Drive, show session-only status. |
| Shared page/video flow | Save a page and YouTube video with identical settings, including `markdown` and an explicit override. Observe the same resolved ID/path and format in duplicate checks, organization, and writes. |
| Setup side effects | Choose a nonexistent Notion database or Drive folder. Setup does not create it; offer an existing destination or temporary normal save flow. Artifact persistence requires verified publishing scope, never an existing clip ID. |

## Sync matrix

Use valid schema-1 documents. Establish B by a verified sync unless the case specifies none. Change independent defaults, destination records, and unknown namespaces; compare parsed values rather than YAML formatting.

| Scenario | Expected result |
| --- | --- |
| Identical L/R | No cloud write; record/retain verified baseline. Whitespace changes alone do not conflict. |
| Local-only change | Keep local setting, write cloud, read back, then advance baseline. |
| Cloud-only change | Update local and verify; baseline advances only when both match. |
| Independent changes | Merge local format change and remote destination change; preserve both and unknown namespaces. |
| Conflicting change | Change the same setting differently on both sides; ask with both values. No timestamp winner or save affected by the conflict before a choice/session override. |
| No baseline | Different existing L/R require reconciliation before first upload, even if one only has extra keys. Identical copies establish baseline; inaccessible never means absent. |
| Disconnected update | Verified local update survives; pending is reported, old B retained. Next invocation compares fresh remote values and retries without a background job. |
| Duplicate documents | Search all exact-title results; ask which ID before reading/updating a selected document. Retain chosen ID locally; do not create a third document. |
| Failed/ambiguous write | Simulate timeout or mismatching readback. No success claim or baseline advance; retain ID and local update, reread on retry rather than create a replacement. |
| Intervening remote edit | Change R between initial read and prewrite check; restart merge. With conditional writes, rejected revision must not overwrite. Record residual race limitation without conditional writes. |
| Concurrent local writers | Pause writer A after it reads under the lock; writer B must report busy/pending without replacing preferences or metadata. After A releases, retry B from fresh values and verify both independent edits and unknown namespaces survive. Exercise setup, reset, project writes, and sync checkpointing with the same lock protocol. |
| Lock recovery and unsupported tools | Verify errors release only the invocation's own lock; prompts release and restart after reacquisition. An existing lock is never removed solely due to age. Without atomic lock creation, no persistent local write occurs and session settings are offered. External editors ignoring the lock are explicitly outside its protection. |
| Deletion/reset | Delete a setting on one side; propagate deletion against B. Delete-versus-edit conflicts ask. Deleting an alias used by the default cannot leave an invalid merged document. |
| Read-only connector | A connector that cannot update the document reports pending; it never creates replacement preference documents. |
| Invalid remote | Malformed/unsupported/empty existing document remains untouched. Offer session settings; no upload or invented baseline. |
| Privacy boundary | Inspect every upload: only the user contract, never project overrides, sync metadata, session/explicit values, or credentials. Local paths remain device-specific. |

## Static validation versus live execution

Run `npm run validate` and `npm test`. Static checks cover all four skill definitions and metadata, direct shared-contract links, required examples, YAML syntax/schema/locators/alias references, and Markdown. Fixture tests include failure cases and CLI pass/fail behavior. Strict Claude validation runs when installed and reports a skip otherwise.

Fixture tests do not execute these Markdown procedures or prove connector permissions, conditional writes, synchronization reliability, or page/video save behavior. Record the matrix results separately after live maintainer testing; leave unexecuted scenarios explicitly unverified.
