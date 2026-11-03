# Gleaner

Gather the best of what you read into tagged, searchable clips.

Ask Gleaner in plain language to keep a web page, a YouTube video, or just the parts that matter, and it writes a short, structured summary, tags it, files it by category, and hands it to you as an HTML file in Claude or a Markdown file in ChatGPT. It can save to Google Drive, Notion, a Cowork project, your Claude Code project, or a private claude.ai artifact instead. Later, ask what you saved and it finds it.

## Skills

| Skill | Use it for |
| --- | --- |
| [glean](skills/glean/SKILL.md) | Save whole pages, collected parts of pages, and Claude's answers about them, and find saved clips |
| [youtube](skills/youtube/SKILL.md) | Save a video or a moment from it as a summary from its transcript or description, with timestamped key moments |
| [follow-up](skills/follow-up/SKILL.md) | Suggest three next steps for a saved clip and save them into it |
| [preferences](skills/preferences/SKILL.md) | Set up, show, update, reset, or sync default destinations and formats |

You don't have to pick a skill: describe what you want and Claude loads the right one. In Claude Code you can also call each one directly, such as `/gleaner:glean`.

## What Gleaner reads, writes, and sends

- **Reads** the page you ask it to keep, in the browser you're using: the Chrome side panel, Claude in Chrome, or the Claude Code desktop browser. Given a URL, it opens the page there or reads it with a web fetch. For a YouTube video it reads the video's description and YouTube's own transcript panel.
- **Writes** each clip only where you choose: a file in the conversation by default, or a destination you have connected yourself (Google Drive, Notion, a Cowork project folder, the current Claude Code project, or a private claude.ai artifact). It never deletes or changes clips saved in earlier sessions.
- **Stores preferences** in a local file, by default `~/.config/agent-preferences/preferences.yaml`, with an optional project override. Syncing them through Google Drive happens only when you turn it on.
- **Sends** clip content only to the destination you choose, through your own connection to it. Gleaner has no server of its own, no MCP server, no hooks, and no analytics. A bundled helper script that formats clips runs locally and makes no network calls.

## Install and learn more

To install it in Claude Code from its own marketplace, run this in a session:

```text
/plugin install gleaner --marketplace shawn-sandy/gleaner
```

The [Gleaner repository](https://github.com/shawn-sandy/gleaner) has install steps, the full usage guide, troubleshooting, and the changelog.

## License

MIT
