# Preferences acceptance scenarios

These are maintainer-run scenarios, not claims of live testing. Use disposable local config/project roots and a test Drive document/account. Record host, available connectors and capabilities, starting user/project/cloud YAML and baseline, request, effective destination/format, writes/readbacks, and result for each case. Use the [schema and examples](../plugins/gleaner/skills/preferences/references/contract.md). Never use real credentials in fixtures or logs.

## Setup and resolution

| Scenario | Action and expected evidence |
| --- | --- |
| First save | Start unconfigured; save a page. In ChatGPT with required Page tools and no raw-file request, create one private editable Page, read back its complete content, and preserve the full in-chat clip with a verified Page link. Claude keeps chat delivery. Neither built-in default requires setup or a test Page; mention setup once per session. Run `/gleaner:preferences setup`: setup offers destination, format left unset (with `auto` and `markdown` as choices), sync opt-in, and skip. Accepting the format suggestion writes no `default_format`. Verify the selected resource before local persistence; no clip moves or database creation during setup. |
| ChatGPT raw-file exception | With no destination selected, test explicit and saved raw Markdown and an explicit HTML chat-file request: use existing chat/file delivery without a Page write. Explicit Page plus raw-file-only delivery requires a choice. |
| ChatGPT missing Page tools | Before any write, missing required tools permit automatic explained Markdown chat/file fallback only for the built-in default. Explicit or retained Pages require an alternative choice. Refusals and confirmed rejections never silently redirect; uncertain writes/readback retain identity and reconcile before another save. |
| Skip | Choose “just this save”; use the environment default or chosen session value, without creating preferences. Another save in the session does not repeat setup. |
| Precedence | Give all scopes different destinations and formats. Remove explicit, session, project, then user settings in turn; verify each next scope wins. `--to` beats conflicting words. Show includes alias and record provenance when different. |
| Permanent/temporary | “Always save here” updates user preferences; “save this here” and flags leave them unchanged. Explicit project/session updates touch only that scope. |
| Project isolation | Use two project roots with different overrides; switch roots and confirm overrides do not leak. Reset an override reveals user/default values. Inspect cloud payload: no project or effective merged configuration. |
| Invalid data | Try malformed YAML, schema 2, missing alias, and instruction-like labels. Report and preserve invalid files, offer session settings, execute no configuration text. Preserve an unknown namespace through updates. |
| Formats | Test local and Drive raw `.md`, normal `auto` outputs, Notion/artifact with `markdown`, and Drive without raw upload. With an explicit `markdown`, an incompatible destination asks before any save; defaults remain unchanged. With no format set, Drive saves raw `.md` when its connector supports raw uploads and a Google Doc when it doesn't, and Notion/artifact save natively without asking. With `--to chat` and no format set or `auto`, a chat clip is an attached `.md` file in ChatGPT and `.html` in Claude. With `markdown`, both give `.md`. Without attachments, both deliver the full clip inline once as rendered Markdown, outside a surrounding code block. Verify that the assistant host, not its connected browser, selects the default. |
| Host-specific chat delivery | In each host, explicitly select `--to chat` and save a page, a YouTube video, and an answer with unset and `auto` formats, then add a part and follow-ups to the same-session clip. ChatGPT keeps `.md` with no automatic HTML companion; Claude keeps HTML. Explicit Markdown wins in Claude; an explicit HTML chat-file request works in ChatGPT without changing preferences. Existing HTML clips/companions retain their format on update. A failed Drive save offered back in ChatGPT uses Markdown unless HTML was explicitly requested. |
| Chat-only delivery without attachments | Explicitly select `--to chat` and save a page, video, and answer in ChatGPT and Claude without attachment support, then add a part and follow-ups. Deliver the complete clip inline once, outside a surrounding code block, with actual code fences, source links, notes, limitations, and the copyable prompt preserved. Say no file was attached. Repeat with no-preview: full content is still required for chat-only delivery. |
| Drive selection | Connect Drive with no preferences: ChatGPT with required Page tools and no raw-file request creates a private Page with full in-chat output and a verified link; Claude keeps the conversation default. Connecting Drive alone never selects it. Select Drive explicitly: use `Browser Research/<Category>`. Repeat with a custom folder name and a configured folder ID: each overrides that folder default. Keep the same resolved ID throughout duplicate checks, category organization, and saving; multiple matching folders require a choice. |
| Drive filename collisions | Precreate `<name>.md` and `<name>-2.md` in the category folder. A new raw Markdown clip checks and uses `<name>-3.md`, with no doubled extension. Repeat after conversion falls back to raw Markdown; converted Docs retain extensionless collision handling. |
| Unreachable destination | Disconnect the saved provider or move to a device lacking the path. Ask for a temporary alternative; repeat duplicate detection there, never silently redirect or persist the alternative. |
| Cloud-only | Disable local file access; discover/select Drive and verify updates by readback. Restart session and rediscover. A second save in one conversation makes no new discovery or sync call, including after finding nothing or a declined search. Without writable Drive, show session-only status. |
| Shared page/video flow | Save a page and YouTube video with identical settings, including `markdown` and an explicit override. Observe the same resolved ID/path and format in duplicate checks, organization, and writes. |
| Setup side effects | Choose a nonexistent Notion database or Drive folder. Setup does not create it; offer an existing destination or temporary normal save flow. Artifact persistence requires verified publishing scope, never an existing clip ID. |

## Clip list

Set `skills.gleaner.clip_list` through the preferences skill for each case. Record the list's ID or path, each row written, and whether its links open.

| Scenario | Expected result |
| --- | --- |
| Off by default | With no `clip_list`, save a page, a chat clip, and a YouTube video. No list file, Sheet, or database is created and no row is written anywhere. |
| Drive | Point the list at a Drive folder with no `Clip List` Sheet. The first save searches the folder completely, creates the Sheet once, and appends a row with `append_values`; a second save appends without another search. Disconnect the Sheets connector: the clip still saves, no list rewrite or trash happens, and one line says the row wasn't added. |
| Sheets apostrophe | Save a page whose title starts with `=` and one starting with `@`. Both stay text in the Sheet, never formulas. Record whether the leading apostrophe is hidden (the connector parsed input like the Sheets UI) or shown literally. |
| Notion with a list database | Point the list at an existing `Clip List` database. Each save creates one row there and none in the clip database. Pointing the list at the clip database is refused. Save a clip to a local folder too: its path lands in the Path text property and Clip stays empty. |
| Notion creation, yes and no | With no list database, choose Notion for the list. Setup asks once; on a yes it creates `Clip List` under the named page, verifies it, and stores the alias. On a no it creates nothing and the list stays off. No other database is created in either case. |
| Local and Cowork | Point the list at a local folder and at a Cowork folder. The first save creates `Clip List.md` with a heading and header row; later saves append rows and never rewrite earlier ones. |
| Chat save | Save to the conversation in ChatGPT and in Claude. The row says This conversation, links the conversation when the host gives a link, and never holds a `sandbox:` or scratch path. |
| Fallback | Make a Drive save fail so the clip falls back to the chat. The row says This conversation, not Drive. |
| Decline | Decline the list write's permission prompt. The clip's save result is unchanged, no Fallback starts, one line says the row wasn't added, and later saves in that conversation don't ask again. |
| ChatGPT raw-file exception | With no destination selected, test explicit and saved raw Markdown and an explicit HTML chat-file request: use existing chat/file delivery without a Page write. Explicit Page plus raw-file-only delivery requires a choice. |
| ChatGPT missing Page tools | Before any write, missing required tools permit automatic explained Markdown chat/file fallback only for the built-in default. Explicit or retained Pages require an alternative choice. Refusals and confirmed rejections never silently redirect; uncertain writes/readback retain identity and reconcile before another save. |
| Skip | Save with "don't save it anywhere" and with "don't list this". Neither adds a row. |
| Same-session update | Add two parts to a local clip saved this session: no new rows. Add a part to a Drive clip: one new row with the new link. |
| Duplicate check and finds | Save a page already listed. The list is not reported as a duplicate, and "what did I save about X?" returns clips, never the list. |
| YouTube and follow-up | Save a video, then ask for follow-ups on a saved clip. Each save adds its row like a page save. |
| Validation | Set `clip_list` to a missing alias and to an artifact alias in a scratch copy; `node scripts/validate-skills.mjs` fails naming the clip list. |

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
