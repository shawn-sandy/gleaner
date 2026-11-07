# Gleaner

Gather the best of what you read into tagged, searchable clips.

Ask Gleaner in plain language to keep a web page, a YouTube video, or just the parts that matter, and it writes a short, structured summary, tags it, files it by category, and hands it to you as an HTML file in Claude. In ChatGPT, new unconfigured saves create private editable Pages when required tools and access are available, preserving the full in-chat clip and adding a verified Page link. Explicit/saved destinations, retained clips, and raw-file requests keep precedence. It can save to Google Drive, Notion, a Cowork project, your Claude Code project, or a private claude.ai artifact instead. Later, ask what you saved and it finds it.

## Skills

| Skill | Use it for |
| --- | --- |
| [glean](skills/glean/SKILL.md) | Save whole pages, collected parts of pages, and Claude's answers about them, and find saved clips |
| [youtube](skills/youtube/SKILL.md) | Save a video or a moment from it as a summary from its transcript or description, with timestamped key moments |
| [follow-up](skills/follow-up/SKILL.md) | Suggest three next steps for a saved clip and save them into it |
| [preferences](skills/preferences/SKILL.md) | Set up, show, update, reset, or sync default destinations and formats |

You don't have to pick a skill: describe what you want and Claude loads the right one. In Claude Code you can also call each one directly, such as `/gleaner:glean`.

## What Gleaner reads, writes, and sends

- **Reads pages** you ask it to keep, in the browser you're using: the Chrome side panel, Claude in Chrome, the Claude Code desktop browser, or ChatGPT's connected Chrome tabs and Work browser. Given a URL it opens the page there, or reads it with the session's web fetch. For a YouTube video it reads the video's description, and its transcript from YouTube's own transcript panel in the Chrome side panel or Claude in Chrome. YouTube sends that panel empty to the Claude Code desktop browser, so in Claude, when neither the side panel nor Claude in Chrome is available, it uses Playwright browser tools if the session has them, and otherwise writes the clip from the description and chapters.
- **Reads your saved clips** when you search them or save again: it searches the resolved destination (including Pages for unconfigured ChatGPT finds, or the Google Drive, Notion, project folder, or artifacts destination you select) and, where your host offers it, your past conversations, and checks for an existing clip of the same page before saving.
- **Writes clips** to private editable Pages by default in ChatGPT when no explicit, retained, session, project, or user destination and no raw-file request wins. Claude keeps file delivery in the conversation by default. Other destinations are those you select through requests or preferences (Google Drive, Notion, a Cowork project folder, the current Claude Code project, or a private claude.ai artifact). Only missing required Page tools before any write allow automatic Markdown chat/file fallback for the built-in default, with a truthful explanation; explicit or retained Pages require an alternative choice. A Page refusal or confirmed rejection requires a choice; an uncertain write or failed readback retains identity and must be reconciled before another save. It creates category folders as needed. Updating a clip saved in the same session replaces that clip's earlier version (on Drive, by moving it to the trash). Clips saved in earlier sessions are never edited or deleted; an update saves a new copy that links to the original.
- **Writes indexes you ask for:** an opt-in clip list (a `Clip List` Google Sheet, a `Clip List.md` file, or a Notion database) that gets a row for each new clip or updated copy, and for a same-session update only when the clip's link changes; a failed or skipped save adds none. On request, it also writes a dated `Clip Index` Google Sheet in Drive. In a Notion clip database it adds any missing properties and new tag options, and never renames or deletes existing ones.
- **Stores preferences** in a local file, `agent-preferences/preferences.yaml` in your config folder: the folder the XDG_CONFIG_HOME environment variable names when it is set, and `~/.config` otherwise. That folder path is the only thing it reads from your environment, and it never sends it anywhere. Beside the file it keeps a `sync-state.yaml` file and a `preferences.lock` folder. On a host without local file access, it can keep them only in the Google Drive document described under Sends, holding the sync details in session memory instead. A project can override them in `.agent-preferences/preferences.yaml` at its root.
- **Sends** clip content through the active host’s tools to the resolved destination, including the built-in private Page default in ChatGPT, or to destinations selected by your requests or saved preferences through your own connections. If you turn on preference sync, it uploads your preferences to a Google Drive document titled `Agent Preferences`, creating it if none exists. Gleaner has no server of its own, no MCP server, no hooks, and no analytics. A bundled helper script that formats clips runs locally and makes no network calls.

## Install and learn more

To install it in Claude Code from its own marketplace, run this in a session (Claude Code 2.1.275 or later):

```text
/plugin install gleaner --marketplace shawn-sandy/gleaner
```

On earlier versions, add the marketplace first:

```text
/plugin marketplace add shawn-sandy/gleaner
/plugin install gleaner@shawn-sandy
```

The [Gleaner repository](https://github.com/shawn-sandy/gleaner) has install steps, the full usage guide, troubleshooting, and the changelog.

## License

MIT
