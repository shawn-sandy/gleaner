# ChatGPT marketplace installation

Gleaner is distributed from the same GitHub repository as its Claude plugin. The marketplace manifest is at `.claude-plugin/marketplace.json` and points to `plugins/gleaner`. Its three skills are `glean`, `youtube`, and `preferences`.

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

For YouTube, use timestamped transcript text only if it is actually available from the connected browser or supplied by the user. Otherwise create a description-only clip with `transcript: none`; do not invent quotes or key moments.

## Validation checklist

- [ ] Import succeeds in an eligible ChatGPT workspace
- [ ] All three skills (`glean`, `youtube`, `preferences`) are discoverable
- [ ] URL clipping works without browser access
- [ ] Accessible Chrome tab clipping works where the connector exposes tabs
- [ ] Work browser clipping works in Work mode
- [ ] Google Drive creates a clip in `Browser Research/<Category>`
- [ ] Missing transcript produces a clearly labeled description-only clip
- [ ] Claude marketplace validation and existing workflows still work

Marketplace import, browser, and Drive behavior require live manual testing. Repository validation alone does not establish runtime compatibility.
