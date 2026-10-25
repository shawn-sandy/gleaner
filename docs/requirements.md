# Gleaner requirements

Everything Gleaner needs, by surface, destination, and skill. Only a host and a readable page are required; the rest depends on where you want clips to go. For installation steps, see [Install](../README.md#install) in the README.

## Required

### A host

Any one of:

- **Claude, on a paid plan,** with the new Chrome side panel (the Cowork-style panel; its three-dot menu shows "Switch back to classic"). The classic panel doesn't work.
- **Claude Code**, in the CLI or the desktop app.
- **ChatGPT**, in a workspace that supports GitHub marketplace imports. A workspace admin imports `https://github.com/shawn-sandy/gleaner` from the Plugins settings. Importing the plugin doesn't connect your browser or Drive; connect those separately. See [ChatGPT marketplace installation](chatgpt-marketplace.md).

### A page Gleaner can read

Any one of:

- The Claude side panel in Chrome.
- The Browser pane in Claude Code desktop (Cmd+Shift+B on Mac, Ctrl+Shift+B on Windows). It has its own sign-ins, separate from Chrome, and asks you to allow each new site once.
- In ChatGPT, connected Chrome tabs or the Work browser.
- No browser: put a URL in the request or paste the text. Saving an answer Claude gave needs no browser at all.

## Destinations

Clips come back in the conversation by default, which needs nothing. Every other destination is optional.

| Destination | Needs |
| --- | --- |
| This conversation (`.md` in ChatGPT, `.html` in Claude) | Nothing |
| Google Drive | The Google Drive connector, with permission to create files in the target folder |
| Cowork project | The Claude desktop app, open and connected |
| This project (`--to local`) | A Claude Code session |
| Notion | The Notion connector |
| Artifact | A session that can publish artifacts, such as Claude Code |

claude.ai Projects aren't a destination: Cowork can read them but not write to them. See [Choosing where clips go](../README.md#choosing-where-clips-go).

## By skill

- **glean:** in ChatGPT, reading highlights and following an article's later pages need a browser with a JavaScript tool. With connected Chrome tabs, or a Work browser without one, name the part or paste it. Chrome allows one highlight at a time, so collect parts one by one.
- **youtube:** the transcript comes from YouTube's **Show transcript** panel in your own Chrome (the side panel or Claude in Chrome), or in ChatGPT once the Work browser or you open that panel. YouTube sends the panel empty to the Claude Code built-in browser, so without Claude in Chrome connected, clips there are written from the description and chapters; paste the transcript for a fuller summary or to clip parts. Private, members-only, and age-restricted videos need you signed in to YouTube in that browser.
- **follow-up:** needs a Gleaner clip, recognized by its **Saved:** and **Category:** lines, its Notion properties, or the `Gleaner clip` generator line in an HTML clip. A clip given only in the conversation isn't stored, so a later session can't find it.
- **preferences:** settings persist in local user storage, with optional project overrides. Drive sync needs a Drive connector that can read and update the preferences document; a create-only connector leaves sync pending. Hosts without local storage persist settings in Drive when it's connected, and otherwise keep them for the session only. See [Shared preferences](../README.md#shared-preferences).

Node.js isn't needed to use Gleaner. The [bookmark renderer](../plugins/gleaner/skills/glean/scripts/bookmark.mjs) is an optional helper, and hosts without Node follow the same instructions directly.

## Developing Gleaner

- Node.js 22 or newer and npm, then `npm ci`, `npm run validate`, and `npm test`.
- The Claude CLI on `PATH`, optional, for the two strict `claude plugin validate` checks. Without it they print a skip; the Validate workflow always runs them.

See [Local development and validation](../README.md#local-development-and-validation).
