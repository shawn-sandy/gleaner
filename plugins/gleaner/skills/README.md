# Gleaner skills

Gleaner ships two skills. You don't have to pick one: describe what you want, and Claude loads the right skill from your words and the page you're on. In Claude Code you can also call either one directly.

| Skill | Command | Use it for |
|---|---|---|
| [clip](clip/SKILL.md) | `/gleaner:clip` | Web pages, parts of pages, and finding saved clips |
| [youtube](youtube/SKILL.md) | `/gleaner:youtube` | YouTube videos and moments from them |

The youtube skill handles only what's different about video: reading the transcript and writing a summary with timestamped links. Everything else (notes, parts, destinations, categories, saving, and search) comes from clip. A video clip lands in the same folder, with the same categories and tags, as a page clip, and "what did I save about X?" finds both.

For installation and the full feature guide, see the [main README](../../../README.md).

## Before you start

- **A page Claude can see.** Use the Claude side panel in Chrome, or the Browser pane in Claude Code desktop (Cmd+Shift+B on Mac, Ctrl+Shift+B on Windows). Or skip browsing and put a URL in the request.
- **A destination.** The default is Google Drive in the Chrome side panel, and the project folder in Claude Code. Other destinations need their connector or app; see [Choosing where clips go](../../../README.md#choosing-where-clips-go).

## clip: pages and parts

### Save a whole page

Open the page and ask:

```text
save this page
keep this article for later, good intro to view transitions
save https://example.com/article
```

Gleaner reads the page, skips navigation and ads, and saves a clip of up to ~400 words: a TL;DR, key points, notable details, and takeaways. Anything you add after the request ("good intro to view transitions") is saved as the clip's note.

### Collect parts, then save once

Highlight text and say "add this", or describe the part and let Gleaner find it. Parts can come from several tabs and sites.

```text
grab the part about animation lengths, for the motion post
and this table too
what have I got so far?
drop the second one
done
```

Each part is confirmed with its first few words. Nothing is saved until you say "done" (or "save them", "wrap it up"); then all the parts go into one clip. Parts live only in the conversation, so save before you close it.

### Choose where it goes

Name the destination in words, or add `--to` (short form `-t`) for that one save:

```text
save this page to Notion
done --to ./notes
/gleaner:clip --to drive:"Design Inspiration"
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

Gleaner reads the transcript and saves a clip with a TL;DR, **key moments** that each link to the second they happen, notable details, and takeaways. A **Video** line records the channel, publish date, length, and whether the transcript came from captions or auto-captions. Every link to a video is saved as its canonical watch URL, so saving it again from a different link is still caught as a duplicate.

### Collect moments

Pick parts by time, by topic, or by where you are in the video:

```text
keep 3:10 to 5:40
grab the part about generics
add this part
done
```

"Add this part" takes the chapter you're watching, or the last minute or so if the video has no chapters.

### When there's no transcript

Without captions (or during a live stream), Gleaner saves a clip from the title, description, and chapters, and says so. Parts can't be clipped without a transcript. For a full summary, paste the transcript (on YouTube: **…more** under the video, then **Show transcript**), and Gleaner saves it as an updated copy.

### Things to know

- **Ads:** if an ad is playing, Gleaner skips it or waits for it to end before reading the transcript.
- **Auto-captions:** Gleaner checks names and code terms against the title and description, since auto-captions often mishear them.
- **Private, members-only, or age-restricted videos:** sign in to YouTube in the browser Gleaner is using. The Claude Code Browser pane has its own sign-ins, separate from Chrome.

## More help

- [What a clip looks like](../../../README.md#what-a-clip-looks-like): the page, part, and video clip formats.
- [Phrase cheat sheet](../../../README.md#phrase-cheat-sheet): more ways to ask.
- [Troubleshooting](../../../README.md#troubleshooting): common problems and fixes.
- [Customizing](../../../README.md#customizing): changing the default folder, categories, and summary length.
