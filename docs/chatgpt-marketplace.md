# ChatGPT marketplace installation

Gleaner is distributed from the same GitHub repository as its Claude plugin. The marketplace manifest is at `.claude-plugin/marketplace.json` and points to `plugins/gleaner`. Its four skills are `glean`, `youtube`, `preferences`, and `follow-up`.

## Import into ChatGPT

1. In a ChatGPT workspace with marketplace import enabled, open the workspace admin's Plugins settings and choose the GitHub marketplace import option.
2. Provide `https://github.com/shawn-sandy/gleaner`. The manifest is at the repository root's `.claude-plugin/marketplace.json`; do not set the marketplace path to `plugins/gleaner`.
3. Review the imported **Gleaner** plugin, enable it for the intended workspace members, and install it in a new chat.
4. Connect Google Drive if clips should be saved to Drive. Browser access and Notion are separate connections, not permissions granted by importing the plugin.
5. Test `save this page` with an accessible browser tab or URL, then test `save https://www.youtube.com/watch?v=... to Drive`.

Workspace menus, marketplace availability, and import permissions depend on the account and admin policy. If marketplace import is unavailable, use the individual Skill installation flow instead.

## Browser compatibility

- **Connected Chrome tabs:** list accessible tabs, choose the named or active tab, and read its text. Tab access does not imply selection/highlight or JavaScript access. A pasted URL can be fetched separately if it is not in an accessible tab.
- **ChatGPT Work browser:** use only browser tools actually available in the Work session. Work mode may be necessary to open and inspect pages.
- **No browser access:** a URL or pasted text is required; do not claim to have read the active Chrome tab.

Do not assume the ChatGPT Chrome extension exposes the current tab. Ask for a URL when a tab cannot be accessed.

## Storage and video limitations

Google Drive requires a connected Drive app with permission to create files in the target folder. If a save fails, return the generated Markdown and explicitly say it was **not** saved.

For YouTube, write the clip from the video's description and chapters, and use timestamped transcript text only if the connected browser shows it or the user supplies it. When it shows none, a Work browser that can click opens **Show transcript** itself; with connected tabs, ask the user to open **Show transcript** under the video and read the tab again before asking for a paste. When the video has no description, ask for an optional short one; do not invent quotes or key moments.

If access fails and neither a usable description nor transcript can be read, follow the [ChatGPT blocked-content fallback](../plugins/gleaner/skills/youtube/references/chatgpt-blocked-content.md): ask before creating or changing a clip. Pasted text can supply the summary without another fetch; "save link only" explicitly chooses an unsummarized bookmark. With no accessible tab, including on mobile, ask for pasted text directly rather than requiring a desktop browser. A readable description still saves normally when only the transcript is unavailable. Repair a same-session clip at its retained destination; explain and ask first if storage requires a replacement copy. A revised chat attachment replaces the earlier copy logically, without claiming the old attachment was edited or removed.

## Conversation previews

Every successful save also displays a structured preview in the conversation, separate from the saved file. Use normal headings, lists, and verified action links; an available interactive component may supplement them, but raw HTML is never assumed to execute. The [bookmark preview guide](bookmark-previews.md) documents equivalent Claude Code output, HTML storage, and Markdown fallbacks. No new connection or preference is needed for a text preview.

## Validation checklist

- [ ] Import succeeds in an eligible ChatGPT workspace
- [ ] All four skills (`glean`, `youtube`, `preferences`, `follow-up`) are discoverable
- [ ] The glean skill shows its Gleaner icon
- [ ] URL clipping works without browser access
- [ ] Accessible Chrome tab clipping works where the connector exposes tabs
- [ ] Work browser clipping works in Work mode
- [ ] With no preferences set, `save this page` returns the clip in the conversation, as an attached `.md` file (with the format unset, `auto`, or `markdown`) or, when attachments aren't available, the whole clip in one code block, and stores nothing
- [ ] A save displays Overview, Key details, Why it matters, metadata, and verified actions even when the file is saved outside chat
- [ ] A native preview failure falls back to readable Markdown without retrying the save
- [ ] New saves do not automatically generate HTML companions; an explicit HTML download works only where supported and never changes the configured primary destination
- [ ] Google Drive creates a clip in `Browser Research/<Category>`
- [ ] A video saves from its description with a **Channel** line, and one with no description asks for an optional short one
- [ ] On ChatGPT mobile with no browser access and an unreadable YouTube URL, one question offers pasted content or an explicit link-only bookmark; no clip is created or changed before a choice, and no desktop switch is required
- [ ] A verified access-denied result is reported accurately; a generic fetch failure is not asserted to be a YouTube block
- [ ] Pasted descriptions and transcripts produce supported summaries without another fetch; missing timestamps or passages never produce invented time links or parts
- [ ] "Save link only", "skip", and "just save it" after the question produce a bookmark with a canonical Source, verified metadata, and a visible unsummarized limitation; an initial explicit link-only request needs no second confirmation
- [ ] "Cancel", "no", an unrelated reply, and no reply create or change nothing; unusable pasted text leaves the choice pending rather than silently saving
- [ ] A readable description with an unavailable transcript saves normally without the blocked-content question
- [ ] A same-session clip repaired from pasted text retains its identity, destination, format, notes, parts, and Follow-ups; failed retrieval never erases an existing sourced summary
- [ ] A revised chat attachment uses the same filename and is described as replacing the earlier copy, without claiming the old attachment was edited or removed
- [ ] An unavailable/failed stored update leaves the original intact and asks before creating another copy or changing delivery; an upload-and-retire update asks first and reports any retirement failure accurately
- [ ] Earlier-session clips are never overwritten; a no-new-copy constraint is respected, and unavailable duplicate checks are disclosed without a "no duplicates" claim
- [ ] Claude marketplace validation and existing workflows still work

Marketplace import, browser, and Drive behavior require live manual testing. Repository validation alone does not establish runtime compatibility.
