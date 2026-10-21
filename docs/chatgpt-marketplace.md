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

For YouTube, write the clip from the video's description and chapters, and use timestamped transcript text only if the connected browser shows it or the user supplies it. When the video has no description, ask for an optional short one; do not invent quotes or key moments.

## Validation checklist

- [ ] Import succeeds in an eligible ChatGPT workspace
- [ ] All four skills (`glean`, `youtube`, `preferences`, `follow-up`) are discoverable
- [ ] The glean skill shows its Gleaner icon
- [ ] URL clipping works without browser access
- [ ] Accessible Chrome tab clipping works where the connector exposes tabs
- [ ] Work browser clipping works in Work mode
- [ ] With no preferences set, `save this page` returns the clip in the conversation, as an attached `.html` file (`.md` when the format is `markdown`) or, when attachments aren't available, the whole clip in one code block, and stores nothing
- [ ] Google Drive creates a clip in `Browser Research/<Category>`
- [ ] A video saves from its description with a **Channel** line, and one with no description asks for an optional short one
- [ ] Claude marketplace validation and existing workflows still work

Marketplace import, browser, and Drive behavior require live manual testing. Repository validation alone does not establish runtime compatibility.
