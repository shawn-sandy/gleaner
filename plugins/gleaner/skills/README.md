# Gleaner skills

Gleaner ships four skills. You don't have to pick one: describe what you want, and Claude loads the right skill from your words and the page you're on. In Claude Code you can also call each one directly.

| Skill | Claude Code command | Use it for |
| --- | --- | --- |
| [glean](glean/SKILL.md) | `/gleaner:glean` | Web pages, parts of pages, Claude's answers about them, and finding saved clips |
| [preferences](preferences/SKILL.md) | `/gleaner:preferences` | Shared destinations, formats, setup, show, update, reset, and sync |
| [youtube](youtube/SKILL.md) | `/gleaner:youtube` | YouTube videos and moments from them |
| [follow-up](follow-up/SKILL.md) | `/gleaner:follow-up` | Three suggested next steps for a saved clip, saved into it |

The youtube skill handles only what's different about video: reading the video's transcript or description and its channel, and writing a summary with timestamped key moments. Everything else (notes, parts, destinations, categories, saving, and search) comes from glean. A video clip lands in the same folder, with the same categories and tags, as a page clip, and "what did I save about X?" finds both.

For installation and the full feature guide, see the [main README](../../../README.md).

## Upgrading to 2.0.0

The `clip` skill is now named `glean`. Use `/gleaner:glean` wherever you previously used `/gleaner:clip`, including saved prompts and shortcuts. The old command is no longer available; `/gleaner:youtube` is unchanged.

The rename does not change existing clips or plain-language requests such as "save this page" and "done." If you customize the skill, edit [glean/SKILL.md](glean/SKILL.md). See the [upgrade instructions](../../../README.md#upgrading-from-clip-to-glean) if the new command is not available after updating.

## preferences: shared save settings

Gleaner skips the setup prompt on your first save, since its default, the chat, needs nothing stored; it mentions setup once instead. Run `/gleaner:preferences setup` to choose a verified default destination, a format (left unset by default, so chat clips are Markdown in ChatGPT and HTML in Claude, and stored clips are Markdown where supported; `default_format` is written only if you pick `auto` or `markdown`), and optional Drive sync, or choose “just this save” to keep session settings. Existing environment defaults remain when setup is skipped. Both page and video saves use the same preferences.

```text
/gleaner:preferences setup
always save here
use markdown for this project
show my preferences
reset my project format override
sync my preferences
```

“Always” persists at user scope unless project/session scope is explicit; “save this here” stays temporary. Precedence is explicit request (`--to` before words), session, project, user, then environment defaults. With no format set, chat clips are Markdown in ChatGPT and HTML in Claude and Gleaner saves raw `markdown` wherever another destination supports it. `auto` preserves native output, such as Markdown chat files in ChatGPT, HTML chat files in Claude, or Google Docs in Drive; raw `markdown` supports the chat, local/Cowork, and capable Drive connectors, with a prompt for incompatible Notion/artifact saves.

Preferences use local user storage and optional project overrides. Drive sync runs only during invocations, keeps project overrides and metadata local, and asks about conflicts. Disconnected writes stay pending; cloud-only hosts can persist in Drive, otherwise settings are session-only. See [storage and sync details](../../../README.md#shared-preferences) and the [shared contract](preferences/references/contract.md).

## Before you start

- **A page Claude can see.** Use the Claude side panel in Chrome, or the Browser pane in Claude Code desktop (Cmd+Shift+B on Mac, Ctrl+Shift+B on Windows). In ChatGPT, use connected Chrome tabs or the Work browser. Or skip browsing and put a URL in the request.
- **A destination, if you want one stored.** Until you set your own with preferences, ChatGPT gives you the clip as a Markdown file in the conversation and Claude gives you an HTML file. Other destinations need their connector or app; see [Choosing where clips go](../../../README.md#choosing-where-clips-go).

## glean: pages, parts, answers, and search

### Save a whole page

Open the page and ask:

```text
save this page
keep this article for later, good intro to view transitions
save https://example.com/article
```

Gleaner reads the page, skips navigation and ads, and saves a plain-language clip of up to ~400 words: a TL;DR, key points (or a numbered Steps section for a tutorial), notable details, and takeaways, plus a short explanation of how the main idea works when the TL;DR can't cover it. Technical terms are explained the first time they appear. Anything you add after the request ("good intro to view transitions") is saved as the clip's note.

### Collect parts, then save once

Highlight text and say "add this", or describe the part and let Gleaner find it. Parts can come from several tabs and sites. In ChatGPT, where highlights usually can't be read, describe the part or paste it.

```text
grab the part about animation lengths, for the motion post
and this table too
what have I got so far?
drop the second one
done
```

Each part is confirmed with its first few words. Nothing is saved until you say "done" (or "save them", "wrap it up"); then all the parts go into one clip. Parts live only in the conversation, so save before you close it.

Once a page has a clip from this session, more saves and parts from that page go into that clip, which is saved again right away, instead of starting a new doc. Say "as a new clip" to keep one separate.

### Save an answer

Ask Claude about the page, such as a clarification or a list of steps, then save the answer:

```text
how do I rotate an API key in these docs?
save that
explain the auth flow and save it
```

"Save that" right after an answer saves the answer and says so; say "save the page" if you meant the whole page. While you're collecting parts, an answer is added as the next part instead. Answers are kept as given, headed by your question, with anything that didn't come from the page marked "(not from the page)". See [Saving answers](../../../README.md#saving-answers).

### Choose where it goes

Name the destination in words, or add `--to` (short form `-t`) for that one save:

```text
save this page to Notion
save this page as an artifact
done --to ./notes
/gleaner:glean --to drive:"Design Inspiration"
```

A flag beats words, and words beat the default. Every flag value is listed under [The `--to` flag](../../../README.md#the---to-flag).

### Set the category and tags

Gleaner picks one category and 3 to 6 tags on its own. Override either in the request:

```text
file this under design
tag it motion and css
```

### Find what you saved

```text
what did I save about Cowork?
show my #prompting clips
clips from this week
make me an index sheet
```

You get a table, newest first, with a link to each clip. "Make me an index sheet" creates a Google Sheet snapshot that doesn't update itself; ask for a new one when you need it.

## youtube: videos and moments

### Save a whole video

Open the video (a watch page, a Short, or a live replay), or pass its link:

```text
save this video
clip this talk, for the motion post
save https://youtu.be/<video-id> --to notion
```

Gleaner reads the video's transcript from YouTube's own **Show transcript** panel when the browser allows it, and its description, and saves the same plain-language clip as for a page, with **key moments** from the transcript, or the video's chapters without one, that each link to the second they start, in place of key points. A **Channel** line names and links the channel, and a **Video** line records the publish date, length, and what the summary was written from. A **Links** section keeps the description's useful links, such as docs and repos, and leaves out sponsor, social, subscribe, merch, and shortened links. Every link to a video is saved as its canonical watch URL, so saving it again from a different link is still caught as a duplicate.

### Collect moments

With a transcript (see [Transcripts and missing descriptions](#transcripts-and-missing-descriptions)), pick parts by time, by topic, or by where you are in the video:

```text
keep 3:10 to 5:40
grab the part about generics
add this part
done
```

"Add this part" takes the chapter you're watching, or the last minute or so if the video has no chapters.

### Transcripts and missing descriptions

In your own Chrome (the Chrome side panel or Claude in Chrome), Gleaner opens the video's **Show transcript** panel and reads it. YouTube sends the panel empty to the Claude Code Browser pane, even signed in, so Claude Code reads the transcript through Claude in Chrome when it's connected; otherwise a clip is written from the video's description and chapters unless you paste the transcript. If the video has no description and no transcript, Gleaner asks for a short description, which is optional; say "skip" to save it from the title alone.

A part can't be clipped without the transcript. If you ask for one anyway, Gleaner asks you to paste the transcript and offers a clip of the whole video instead.

To copy a transcript on YouTube, open **…more** under the video, then **Show transcript**. Paste it before saving, or after, to get a fuller summary: a clip saved this session is refreshed, and one from an earlier session gets an updated copy.

### Things to know

- **Transcripts:** Gleaner checks names and code terms against the title, description, and the video's keywords, since transcripts from auto-captions often mishear them. When the panel's transcript isn't in the video's language, Gleaner says which language the clip was written from.
- **Private, members-only, or age-restricted videos:** sign in to YouTube in the browser Gleaner is using. The Claude Code Browser pane has its own sign-ins, separate from Chrome.
- **ChatGPT without a JavaScript tool** (connected Chrome tabs, or a Work browser without one): Gleaner uses a transcript when the video's tab shows one. Where it would ask you to paste one, it first asks you to open **Show transcript** in the video's tab, unless a Work browser that can click opens it itself; otherwise paste it (see [Transcripts and missing descriptions](#transcripts-and-missing-descriptions)). It also can't read where you are in the video, so give "add this part" a time range or topic instead.

## follow-up: what to do next with a clip

Ask right after a save, or point at any saved clip by link, path, or topic:

```text
what should I follow up on?
suggest follow-ups for my view transitions clip
/gleaner:follow-up ./browser-research/design-engineering/2026-10-18-motion-timing.md
```

Gleaner reads the clip's link, TL;DR, note, content, and the links inside it, then suggests three follow-ups, each tied to something in the clip, such as reading a linked page, moving the post your note mentions forward, or comparing it with clips that share its tags. Pick one, or say what you'd rather do. When the clip has no note, takeaways, or links to work from, Gleaner asks what you want instead of guessing. If your session lists a skill that turns a video or page into something, such as youtube-to-blog, one follow-up may hand the clip to it; Gleaner never suggests a skill your session doesn't list. The follow-ups are saved after the clip's takeaways, under a dated Follow-ups heading. A clip from an earlier session is never edited: you get an updated copy that links to the original. Nothing else is saved unless you ask.

## More help

- [What a clip looks like](../../../README.md#what-a-clip-looks-like): the page, part, and video clip formats.
- [Phrase cheat sheet](../../../README.md#phrase-cheat-sheet): more ways to ask.
- [Troubleshooting](../../../README.md#troubleshooting): common problems and fixes.
- [Customizing](../../../README.md#customizing): changing the default folder, categories, and summary length.

## Automatic bookmark previews

All existing save commands show a structured preview after saving, including `@gleaner save <URL>` in ChatGPT and `/gleaner:glean <URL>` in Claude Code. Both use one bookmark model for metadata, summary, HTML, and the conversation preview. The stored format and configured destination remain independent of presentation. Say "use a Markdown preview" or "no preview" for one request without changing storage preferences.

See [the cross-platform examples](../../../docs/bookmark-previews.md) for the same bookmark in ChatGPT and Claude Code, HTML companion behavior, and offline versus live testing limits.
