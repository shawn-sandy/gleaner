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

Honor the browser or tab the user names and discover the available tool names rather than assuming an API. With no browser named, use the surface that identifies the requested page; when both identify it, prefer the Work browser over connected tabs. Ask when the page is ambiguous. Keep the chosen surface and tab throughout the read instead of switching pages for JavaScript access.

Do not assume the ChatGPT Chrome extension exposes the current tab. Ask for a URL when a tab cannot be accessed.

## Storage and video limitations

Google Drive requires a connected Drive app with permission to create files in the target folder. If a save fails, return the generated Markdown and explicitly say it was **not** saved.

For YouTube, write the clip from the video's description and chapters, and use timestamped transcript text only if the connected browser shows it or the user supplies it. When it shows none, a Work browser that can click opens **Show transcript** itself; with connected tabs, ask the user to open **Show transcript** under the video and read the tab again before asking for a paste. When the video has no description, ask for an optional short one; do not invent quotes or key moments.

Discover eligible browser tools before choosing retrieval. A Work browser that can navigate may open the supplied video URL with no matching tab; connected tabs require a matching existing tab. If a web fetch fails, try an eligible, untried browser before treating the content as unavailable, while honoring a named browser and the host's tool requirements. Do not repeat a blocked fetch or cycle between failed routes. This is a ChatGPT-specific rule; Claude's browser and Playwright transcript routes are unchanged.

Only after eligible retrieval routes fail or are unavailable and neither a usable description nor transcript can be read, follow the [ChatGPT blocked-content fallback](../plugins/gleaner/skills/youtube/references/chatgpt-blocked-content.md): ask before creating or changing a clip. Pasted text can supply the summary without another fetch; an explicit "save link only" request needs no content retrieval. Once eligible routes are exhausted, including on mobile, ask for pasted text directly rather than requiring a desktop browser. A readable description still saves normally when only the transcript is unavailable. Repair a same-session clip at its retained destination; explain and ask first if storage requires a replacement copy. A revised chat attachment replaces the earlier copy logically, without claiming the old attachment was edited or removed.

## Conversation previews

Every successful save or update displays the full clip directly in the ChatGPT conversation, including on mobile and when the destination is Drive or another service. Render normal Markdown headings, lists, and links outside a surrounding code block, preserving metadata, notes, source limitations, timestamp links, Follow-ups, and the final copyable prompt. Put verified attachment and destination links afterward; label Markdown chat attachments `Download Markdown (.md)`, without promising that tapping opens a preview pane. A file card, download link, or short summary alone does not satisfy this rule. An available interactive component may supplement the inline content, but raw HTML is never assumed to execute. Explicit short-preview, download-only, and no-preview requests still apply; without attachments, a chat-only save must deliver its full content inline once. If a response limit prevents completion, identify what remains and offer to continue rather than silently truncating. The [bookmark preview guide](bookmark-previews.md) documents equivalent Claude Code output, HTML storage, and Markdown fallbacks. No new connection or preference is needed for a text preview.

## Validation checklist

- [ ] Import succeeds in an eligible ChatGPT workspace
- [ ] All four skills (`glean`, `youtube`, `preferences`, `follow-up`) are discoverable
- [ ] The glean skill shows its Gleaner icon
- [ ] URL clipping works without browser access
- [ ] Accessible Chrome tab clipping works where the connector exposes tabs
- [ ] Work browser clipping works in Work mode
- [ ] With both Work browser and connected tabs available, a named browser/tab wins; otherwise the surface identifying the requested page wins, with Work preferred only when both identify it. An ambiguous page prompts for a choice, and later highlight/page-facts reads use the selected page.
- [ ] With no preferences set, `save this page` displays the full clip inline and returns an attached `.md` file when supported (with the format unset, `auto`, or `markdown`); without attachments, it delivers the full clip inline once, outside a surrounding code block, and accurately reports chat-only delivery
- [ ] On ChatGPT mobile, the entire clip is readable without tapping a file; a verified Markdown attachment appears separately as `Download Markdown (.md)` with no promise that it opens a preview pane
- [ ] On ChatGPT mobile, count the approval prompts across two Drive saves in one conversation: the second save repeats no preference or folder lookup, and a declined prompt is not shown again
- [ ] Saves and updates, including YouTube and follow-ups, show the full clip even for external destinations, preserving notes, source limitations, timestamp links, actual code fences, and the final copyable prompt
- [ ] Explicit short-preview, download-only, and no-preview requests are respected; no-preview with no attachment still delivers a chat-only clip once
- [ ] An oversized clip is split where supported or identifies what remains and offers continuation; it is never silently truncated
- [ ] A native preview failure falls back to the full inline clip without retrying the save
- [ ] New saves do not automatically generate HTML companions; an explicit HTML download works only where supported and never changes the configured primary destination
- [ ] Google Drive creates a clip in `Browser Research/<Category>`
- [ ] With Drive connected but no preferences or destination request, a save stays in the chat. An explicit Drive request uses `Browser Research/<Category>`; a configured folder ID or explicit folder name takes precedence, without changing persistent defaults.
- [ ] A video saves from its description with a **Channel** line, and one with no description asks for an optional short one
- [ ] Available browser capabilities are discovered before retrieval; a Work browser opens a supplied video URL even with no video tab open, while connected tabs read only matching existing tabs
- [ ] After a throttled fetch, an eligible, untried browser reads the description or transcript and the clip saves normally; no premature blocked-content question appears
- [ ] An explicitly named browser, a declined permission, and host tool requirements remain respected during fallback; failed routes are not retried in a loop
- [ ] If all eligible routes fail, ask once and create or change no clip; report fetch throttling separately from observed browser errors
- [ ] An initial explicit link-only request skips content retrieval while retaining preferences, duplicate checks, storage, and preview handling
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
- [ ] In Claude, browser-first reading, the Claude in Chrome and Playwright transcript fallbacks (including after fetched details), ad waiting, long transcripts, and cleanup of only Gleaner-opened tabs remain unchanged; ChatGPT's blocked-content question never applies

Marketplace import, browser, and Drive behavior require live manual testing. Repository validation alone does not establish runtime compatibility.
