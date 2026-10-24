# Using skills the user has installed to improve video saves

Exploration, 2026-10-23. Nothing in the skills has changed yet. This note asks whether Gleaner's skills can notice and use other skills the user has installed, with video saves as the case that matters most, and what that would take. It builds on `youtube-to-blog-exploration.md` (what the youtube skill can borrow from one such skill) and `agents-and-mcp-exploration.md` (subagents and MCP servers). Nothing here is live-tested.

## At a glance

- **A skill can see other skills, but only by reading the session's skill list.** Claude Code puts every skill's name and description in context and loads the full text only when a skill is invoked. There is no frontmatter field that declares a dependency on another skill, none that says "use skill X when present", and no tool that asks whether a skill exists. Prose such as "when the session lists a skill whose description says it does X" is the whole mechanism. It is the one youtube-to-blog itself uses to lean on voice-guide skills, and the one glean's "Where Gleaner runs" uses to pick a browser by tool name.
- **Invoking another skill is all or nothing.** The Skill tool loads the other skill's complete instructions into the turn. For a video save that means loading youtube-to-blog's seven-step blog pipeline to reach its transcript step, and taking its questions (is this your own video?) along with it. Borrowing the step into Gleaner's own text is cheaper and works on every surface; the youtube-to-blog note already lays that out.
- **Names vary with how a skill was installed, so match on descriptions, never on names.** The same youtube-to-blog is `anthropic-skills:youtube-to-blog` when synced from claude.ai, `youtube-to-blog` as a personal skill, and `<plugin>:youtube-to-blog` from a plugin.
- **The one place a dependency can be declared is a subagent's `skills` field.** It preloads a skill's full text and skips a missing skill with a debug-log warning. That only works where plugin subagents run (Claude Code and Cowork), so it belongs with the agents note's Phase 2, not here.
- **Of the video skills installed on this machine, only youtube-to-blog helps a save, one way in each direction.** Inward, Gleaner borrows its transcript-panel route. Outward, Gleaner's follow-up skill offers "draft a blog post from this clip" when the session lists it. The transcription skills (remotion-captions, chatcut-transcription) need a media file, which means downloading the video, which Gleaner shouldn't do.
- **Recommendation:** ship the youtube-to-blog note's borrowings first, since they need no other skill; add the outward hand-off to follow-up as one small general rule; write nothing that stops working when another skill is absent.

## How a skill can reach another skill

| Mechanism | What it gives Gleaner | Where it works | Limit |
| --- | --- | --- | --- |
| Skill list in context | The skill text can say "when the session lists a skill whose description says it …" and act on that | Every surface that lists skills: Claude Code, Cowork, the side panel (a Cowork session on Max and Team plans), claude.ai; ChatGPT untested | The list carries name and description only, cut at 1,536 characters; nothing about the skill's steps or tools |
| Skill tool invocation | Loads the other skill's full instructions into the turn | The same surfaces | All or nothing: the other skill's questions, outputs, and voice come with it; it needs the listed name, which varies by install |
| Subagent `skills` preload | Full skill text injected into a plugin agent at startup; a missing skill is skipped with a debug-log warning | Claude Code, Cowork | Needs a plugin agent under `plugins/gleaner/agents/`; whether it accepts `anthropic-skills:` or `<plugin>:` names is undocumented; not available on the side panel, claude.ai chat, or ChatGPT (agents note) |
| User-stacked skills (`/a /b` at the prompt) | The user loads two skills at once | Claude Code terminal | User-driven; a skill can't rely on it |
| Tool detection by name | "If a tool whose description says X is in the session", the pattern "Where Gleaner runs" already uses for browsers | All | Covers MCP tools, not skills; no tool in this session returns a YouTube transcript |

Two facts from the Claude Code docs frame all of this: a skill's `allowed-tools` grants permission without adding tools, and `disallowed-tools` only removes them, so no frontmatter field reaches outside the skill. Skill text is the only lever, and it has to read like glean's browser table: use what the session shows, fall back to today's path when it isn't there, and never claim a step that didn't run.

## What is installed here that touches video

Surveyed on this machine (personal skills, synced claude.ai skills, and installed plugins). Names are as this session lists them.

| Skill | What it does | For a video save |
| --- | --- | --- |
| `anthropic-skills:youtube-to-blog` | Fetches the watch page for title, channel, date, length, description, and tags; captures the transcript by opening YouTube's "Show transcript" panel in the Chrome extension or asking for a paste; drafts an 800–1,200-word post | **Inward:** the transcript-panel route, keywords as tag hints, the no-command-line-captions rule, and the fresh-read pass, all in the youtube-to-blog note's sections 1 to 3. **Outward:** a follow-up hand-off, its section 4 |
| `remotion-captions` (its `transcribe-captions.md`) | Runs whisper.cpp on a local audio or video file through `@remotion/install-whisper-cpp` | No. It needs the file, so a YouTube video would have to be downloaded first, which YouTube blocks or rate-limits from most addresses and which only a terminal session could run |
| `chatcut-transcription` | Transcribes assets imported into ChatCut Desktop and waits on its jobs | No. It needs media inside ChatCut; there is no URL path |
| `social-media-tools:share-video` | Reads YouTube or Vimeo oEmbed metadata and renders a social card with Playwright | Marginal. The oEmbed endpoint (title, channel name and URL, thumbnail) is a lighter no-browser fallback than fetching the watch page, but it has no description, so it is a technique to borrow at most, not a skill to call. **Outward:** a "share this video" follow-up when listed |
| `argent-screen-recording` and the other device skills | Record a simulator or emulator screen | No |

A ToolSearch for YouTube transcript and caption tools in this session found none, so the tool-detection row above has nothing to detect today.

## Three ways to use them

### 1. Borrow the technique (recommended)

Copy the useful step into Gleaner's own skill text, as the youtube-to-blog note proposes for the transcript panel, tags, and the fresh-read rule. This is the only approach that works on every surface, needs no other skill to be installed, and keeps Gleaner's own questions and clip format. It is also what youtube-to-blog did in reverse: its transcript route is YouTube's own panel, not a skill it calls.

### 2. Defer to a listed skill (skip for now)

The sentence would sit in the youtube skill's "Get the video", after the browser route and before asking for a paste: when the session lists a skill whose description says it captures or transcribes a YouTube video's transcript, invoke it for the transcript only, treat its lines as auto-captions, and ignore its other steps.

Skip it, for three reasons. The only candidate installed here is youtube-to-blog, whose transcript route is the one approach 1 borrows, so the deferral adds nothing. Invoking it loads a blog pipeline that asks whether the video is the user's own, a question a save never needs, and "ignore its other steps" asks the model to half-follow instructions it was just handed. And a save that silently ran another skill is harder to explain in the confirmation than a save that read the panel itself. Add it when a skill or MCP tool appears that gets transcripts a way Gleaner can't reproduce in its own text.

### 3. Hand off outward from follow-up (recommended, small)

The follow-up skill writes three follow-ups the user can start in the conversation. One general rule covers every installed skill that takes a video or page: when the session lists a skill whose description says it turns a video or page into something (a blog post, a social post, a newsletter piece), one of the three may be a hand-off to it, named by the skill's listed name, starting from what the clip already has (its Source, TL;DR, Key moments, and Links), and offered only when the skill is actually listed, never as a generic idea. The existing rules hold: it names what in the clip it comes from, and the saved note still comes first. When the user picks it, invoke that skill with the clip's Source URL and the clip itself; the transcript isn't in the clip, so the other skill still captures or asks for it.

On this machine that yields "Draft a blog post from this video with youtube-to-blog, starting from this clip's Key moments and Links" and "Share this video with share-video". It is a few lines under "Suggest three follow-ups" and one under "When the user picks one" in `plugins/gleaner/skills/follow-up/SKILL.md`, plus a sentence in the README's follow-up section. It needs no version bump on its own.

## What doesn't fit

- **Bundling or requiring another skill.** A plugin can't declare a skill dependency, and a hard dependency would break the side panel and ChatGPT, where the other skill may not be listed. Everything above stays optional.
- **Transcribing media locally** with whisper.cpp or ChatCut. Both need the video file, and the youtube skill should say plainly not to download captions or video with command-line tools, as the youtube-to-blog note already recommends.
- **A preloaded-skill subagent today.** A `gleaner:transcript-reader` agent with `skills: [youtube-to-blog]` would be the one declared dependency the platform supports, but it runs only in Claude Code and Cowork and is the agents note's Phase 2 reader with one more field. Revisit it there.
- **A `skills.youtube` preference for a transcript source.** The preferences contract reserves the namespace, empty. There is nothing to store until there is a choice to make.

## Suggested order

1. **Ship the youtube-to-blog note's sections 1 to 3** in the order that note gives, starting with its live test of the transcript panel. None of it depends on another skill.
2. **Add the follow-up hand-off rule** (approach 3), then test it in a Claude Code session with youtube-to-blog synced, which this machine has, and once in a session without it to confirm no hand-off is offered.
3. **Revisit the deferral** (approach 2) and the preloaded-skill agent only when a skill or MCP tool shows up that reaches transcripts a way Gleaner's own text can't.

## Open questions

- Does ChatGPT show an imported skill the names and descriptions of the user's other imported skills? Nothing in `docs/chatgpt-marketplace.md` or the ChatGPT metadata says, so the hand-off may be Claude-only.
- Does the Chrome side panel list synced claude.ai skills beside plugin skills, so the hand-off can appear there?
- Does a subagent's `skills` field accept `anthropic-skills:youtube-to-blog`, or only a plain `youtube-to-blog` that exists as a personal or project skill?

## Sources

- Gleaner: `plugins/gleaner/skills/glean/SKILL.md` ("Where Gleaner runs"), `plugins/gleaner/skills/youtube/SKILL.md`, `plugins/gleaner/skills/follow-up/SKILL.md`, `plugins/gleaner/skills/preferences/references/contract.md`, `docs/plans/youtube-to-blog-exploration.md`, `docs/plans/agents-and-mcp-exploration.md`.
- Installed skills read on this machine: `youtube-to-blog/SKILL.md` (synced from claude.ai), `remotion-captions/SKILL.md` and `transcribe-captions.md`, `chatcut-transcription/SKILL.md`, `social-media-tools/skills/share-video/SKILL.md`.
- Claude Code docs: [Skills](https://code.claude.com/docs/en/skills.md) (frontmatter fields, the skill listing, synced skills and namespacing), [Subagents](https://code.claude.com/docs/en/sub-agents.md) (the `skills` field), [Add components to a plugin](https://code.claude.com/docs/en/plugins/components.md).
