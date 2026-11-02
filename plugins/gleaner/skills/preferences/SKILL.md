---
name: preferences
description: Gleaner's shared save preferences. Sets up, shows, updates, resets, or syncs default destinations and formats, stored locally with optional Drive sync. Use when changing where or how Gleaner saves.
argument-hint: '[setup | show | update | reset | sync]'
---

# Shared preferences

Read and follow the [shared preferences contract](references/contract.md) directly for every invocation. It defines the schema, resolution, verification, storage, and synchronization procedures; do not maintain a second copy of those rules here. Use only tools available in this session. This skill is Markdown instructions, not a background service.

## Operations

| Operation | Behavior |
| --- | --- |
| `setup` | Offer destination, format (unset suggested, so the skill's normal format applies), an optional clip list (off unless chosen), and optional Drive sync. Verify the destination and any list location, then persist at user scope unless another scope was requested. |
| `show` | Synchronize when enabled, then show the effective destination, format, and clip list location (or that the list is off), the scope supplying each, verified ID/path, persistence location, and sync status (disabled, synchronized, pending, conflict, or cloud-only). Include any session fallback or invalid store excluded from resolution. |
| `update` | Apply the requested fields only, preserving unrelated destinations and namespaces. “Always save here” persists at user scope; “for this project” writes project scope; “for this session” is memory only. “Keep my clip list in Notion” or “list my clips in my notes folder” sets `skills.gleaner.clip_list` to a verified alias, adding one when needed. Verify changed destinations before writing. |
| `reset` | Remove the named override in the requested scope (user by default), revealing the next applicable value. Preserve other settings. Do not delete destination aliases still referenced in that scope or known project/session overrides, including by `clip_list`; ask the user to select a replacement or remove those references. Resetting `clip_list` (“stop my clip list”) turns the list off, unless another scope still sets one; say which list stays on. Resetting all user settings leaves a valid schema-only document so deletions can synchronize. Reset never deletes clips, the clip list, or the Drive document. |
| `sync` | Run the contract's sync procedure now. If disabled, offer setup; do not enable it without the user's choice. Disabling sync clears local selection/baseline after any pending-state warning and leaves both preference copies intact. |

Natural-language requests map to the same operations. “Save this here” and `--to` are temporary save instructions, not permission to update permanent preferences. For a combined “always save here and save this” request, finish the preference update, then return to glean's save flow. Never move clips, create a research database, or save a clip merely because setup was requested. The `Clip List` database below is the one exception.

**Choosing a clip list location.** Drive takes a folder (glean creates the `Clip List` Sheet there on the first row), local and Cowork take a base folder (glean creates `Clip List.md`), and Notion takes a list database. Artifact and the conversation can't hold the list; say so and offer another. For Notion, search for a database titled `Clip List` and use it when exactly one exists, asking which when several do. A Notion list must be a different database from the clip database. When none exists, ask once whether to create one; on a yes, ask which page should hold it and create `Clip List` there with the properties Name (title), Saved (date), Category, Type, Tags, Note (text), Source (URL), Clip (URL), Path (text), and Saved in (text), then fetch it to verify it before storing its alias. On a no, create nothing and leave the list off.

Before an update or reset, load valid stores and run enabled sync to incorporate remote changes. If disconnected, retain the last baseline, make the verified local change, and mark it pending. If a conflict is unresolved, ask which value to retain before changing that setting; the user may instead choose session settings. After a persistent user update, write locally first and run sync again. Project and session changes never enter the sync payload.

For first-save setup and hosts without local access, follow the contract's specific flow. Confirm where settings actually persisted and whether synchronization was verified. Never report persistence or synchronization merely because a write was attempted.
