---
name: youtube
description: Save YouTube videos, or moments from them, as summarized, tagged Gleaner clips built from the video's description, with its channel and chapters that link to the exact second. Use when the page or URL is a YouTube video (youtube.com/watch, youtu.be, Shorts, live) and the user wants to keep, save, clip, or bookmark it or part of it, such as "save this video", "clip this talk for the motion post", "grab the part about generics", "keep 3:10 to 5:40", "add this part", or "save https://youtu.be/… to Notion".
argument-hint: "[--to chat | drive | notion | artifact | local | <path>]"
---

# Gleaner for YouTube

Clip a YouTube video into a Gleaner clip: a summary written from the video's description, with its channel, its chapters as key moments that link to the second they happen, and the description's useful links. A transcript the user pastes gets a fuller summary and lets them clip moments.

This skill covers only what's different about video. Everything else (understanding requests, notes, the `--to` flag, collecting parts, adding to a clip saved this session, shared preference setup and synchronization, destinations and formats, duplicate checks, categories and tags, file names, saving, confirming, and finding clips) follows Gleaner's glean skill (`gleaner:glean`, at `../glean/SKILL.md` relative to this skill's folder). Read it first and use it as written, with the changes below; skip its YouTube edge case, which points back here.

Before any video save, run glean step 2 including its shared preferences contract before duplicate detection. Reuse the resolved destination and format through saving; reading the video never overrides preferences.

After writing the video clip, fill glean's [shared bookmark model](../glean/references/bookmark.md) from those same details. Preserve the canonical Source, Channel, Video basis, chapters, description links, and any pasted transcript in the full clip. Put the description/title-only limitation in `limitations`, and leave unverified key points or practical value empty. Finish with glean steps 6 and 7, including HTML delivery and the automatic conversation preview; no separate video renderer or extraction is needed.

## Get the video

1. **Find the video ID** in the URL the user gave or the tab they're on: `youtube.com/watch?v=<id>`, `youtu.be/<id>`, `youtube.com/shorts/<id>`, `youtube.com/live/<id>`, or `m.youtube.com`. The clip's **Source** is always `https://www.youtube.com/watch?v=<id>`, with `t=`, `list=`, `si=`, and tracking parameters dropped, so the duplicate check matches the same video saved from any link.

2. **Open it.** If the tab isn't already that video's `/watch` page (a Shorts page, a different video, or no tab), open the Source URL in the current browser (see "Where Gleaner runs" in the glean skill), adding back any `t=` from the user's link so the player starts where they meant. The script below needs the regular player. In ChatGPT's browsers without a JavaScript tool, follow "In ChatGPT" below instead of this step and the next.

3. **Read the video's details** by running this with the browser's JavaScript tool:

   ```js
   (() => {
     const p = document.getElementById('movie_player');
     const r = p?.getPlayerResponse?.();
     const v = r?.videoDetails;
     if (!v) return { error: 'no video player on this page' };
     const m = r.microformat?.playerMicroformatRenderer;
     return {
       id: v.videoId, title: v.title, channel: v.author,
       channelUrl: m?.ownerProfileUrl?.replace(/^http:/, 'https:') ?? `https://www.youtube.com/channel/${v.channelId}`,
       seconds: Number(v.lengthSeconds), published: m?.publishDate?.slice(0, 10),
       description: v.shortDescription, position: Math.floor(p.getCurrentTime?.() ?? 0),
     };
   })()
   ```

   What comes back:
   - **`{ error }`:** there's no player yet (still loading, or not a video page). Wait a few seconds and run it again.
   - **Details whose `id` isn't the video's ID:** an ad or the previous video is still showing. Wait a few seconds and run it again.
   - **The video's details:** its title, channel name and channel page, length in seconds, publish date, full description, and the playback position in seconds.

   If the details don't come back after three tries, fetch them as in "No browser", but say the browser couldn't read the video instead.

   Gleaner doesn't capture transcripts itself: YouTube returns caption files empty to scripts and to browsers it doesn't trust, such as a signed-out built-in browser. Transcript lines come only from a transcript the user pastes (see "Pasted transcript") or, in ChatGPT, one the video's tab shows.

4. **Check the description.** It's the clip's main source: its chapters (see "Parts of a video") become Key moments, and its useful links become Links. A description that is empty, or holds only links, hashtags, sponsor reads, and channel boilerplate (subscribe, socials, merch), says nothing about the video: follow "No description". Its useful links still go in Links.

### No description

Unless a transcript was pasted, ask one optional question before saving, such as `This video has no description. Add a short one if you like, or say "skip" to save it from the title alone.` When the description couldn't be read at all, as when a fetch or tab doesn't return it, say that instead of saying there is none. Then follow the reply:

- **A description:** use the user's words, lightly trimmed, as the description, with `your description` as the clip's source on its **Video:** line.
- **Any reply that gives none** ("skip", "no", "just save it"): save the clip from the title and channel alone, with `title only` as its source. Its TL;DR says only what the title does, and it has no Key moments, Notable details, or Takeaways.

### Pasted transcript

A transcript the user pastes at any point (on YouTube: "…more" under the video, then "Show transcript", then copy) joins the description as a source, with `pasted transcript` as the clip's source on its **Video:** line. Its timestamped lines are what Key moments and parts are taken from. Pasted transcripts are often auto-captions, which have no punctuation and often mishear names and jargon, so check product names, people, and code terms against the title and description before they go in the clip. A transcript pasted after the video was saved is a **Save page** for the video, as in the glean skill: it refreshes a clip saved this session, or offers an updated copy of one from an earlier session.

When a clip is saved without a transcript, say in the confirmation what it was written from (the description, your description, or the title), and that pasting the transcript gets a fuller summary.

A part (a time range, a topic, or "this part") needs transcript lines, so don't save one without a pasted transcript: say the part can't be clipped without one, ask for it pasted, and offer a clip of the whole video instead.

Never summarize what you didn't read. A clip says only what its sources say: the description (or the user's description), its chapters, and a pasted transcript. Write the TL;DR from what the description and any pasted transcript say the video covers, and don't add claims they don't make. Without a transcript, there's no **How it works** section, and no **Key moments** section unless the description has chapters, and then the moments are the chapters.

### No browser

With no browser available, fetch the Source URL with WebFetch for the title, channel, and description, and use them as the script's details. Say the video was read without a browser.

### In ChatGPT

ChatGPT's connected Chrome tabs have no JavaScript tool, and the Work browser has one only if this session shows it. Without one, the script and the playback position don't work. In place of steps 2 and 3:

- **Read the video's tab** as in the glean skill's "ChatGPT specifics". If no open tab shows the video, the Work browser can open the Source URL; connected tabs can't, so follow "No browser", fetching with the session's web tool.
- **Use what the tab returns.** Take the title, channel, published date, length, and description from it, and leave out of the clip's header lines anything it doesn't show. If it also returns timestamped transcript lines, use them as a pasted transcript.
- **Parts** work by time range or topic, from transcript lines; with none, a part can't be clipped (see "Pasted transcript"). "This part" or "this bit" can't use the playback position, so ask for a time range or topic instead, and never guess one.

## Parts of a video

Adding parts works as in the glean skill's "Collecting parts", using time in place of highlights. A part's lines come from a pasted transcript (see "Pasted transcript"):

| The user says | The part is |
| --- | --- |
| "3:10 to 5:40", "from 12:00 on", "the first five minutes" | the transcript lines in that range |
| "the part about generics" | the chapter or passage that best matches the topic |
| "add this part", "this bit" while watching | the chapter that contains the current playback position; with no chapters, the ~60 seconds before it |

- **Chapters** are the description lines that start with a timestamp (`0:00 Intro`, `3:10 Generics`).
- **Current position:** read it when the user asks, with `Math.floor(document.getElementById('movie_player').getCurrentTime())`. For more parts of the same video, just read the position again; run the script again after moving to another video. When the position can't be read (no browser, a script that kept failing, or ChatGPT's browsers without a JavaScript tool), ask for a time range or topic for "this part" instead, and never guess one.
- **Confirm** with the range and first few words: `Added part 2: generics (3:10–5:40, "So now let's look at…"). Add more, or say "done" to save.`

## Write the summary

This replaces step 3 of the glean skill.

**Video clip:**

```markdown
# <Video title>

**Source:** https://www.youtube.com/watch?v=<id>
**Channel:** [<channel>](<channel page URL>)
**Saved:** <today's date, YYYY-MM-DD>
**Category:** <one category from the glean skill's step 4>
**Type:** <video | webinar | tutorial>
**Tags:** #<tag> #<tag> #<tag>
**Note:** <the user's note — only if given>
**Video:** published <YYYY-MM-DD> · <length, m:ss or h:mm:ss> · from: <description | your description | title only | pasted transcript>

## TL;DR
<2–3 plain sentences: what the video covers and why it matters>

## How it works
<optional: one short paragraph, only with a pasted transcript, and only when the TL;DR can't explain the main idea on its own — otherwise omit section>

## Key moments
- [<timestamp>](https://www.youtube.com/watch?v=<id>&t=<seconds>s) <one full sentence on what happens at that moment — omit section with no chapters or transcript>

## Notable details
- <code, numbers, tools, and names from the description worth keeping, each with a few words on what it is — omit section if none>

## Links
- [<the description's label for it, or the site's name>](<URL as the description gives it>): <a few words on what it is — omit section if none>

## Takeaways
- <1–3 full-sentence bullets on how this could be used or what to follow up on>

---

<follow-up prompt, from the glean skill's step 3 Rules>
```

**Part clip:** use the glean skill's part format. Each part's heading links to where it starts, `### 1. <part note or topic> ([3:10–5:40](https://www.youtube.com/watch?v=<id>&t=190s))`, and its `*From …*` line names the video. Parts added to a video clip saved this session get the same headings, in a Parts section just before its Takeaways. An answer part (an answer you gave about the video) follows the glean skill's answer-part rules instead: kept as given and not held to the length limits, headed by the user's question with no time link, and with an *Answer about* line that links the Source URL above. Link any timestamps in the answer to the second, as Key moments do, each taken from a transcript line or chapter.

Rules:
- **Key moments:** up to 8 bullets in time order: the chapters, merging small ones, or moments from a pasted transcript. With chapters alone, each bullet says what that chapter covers, from its title and the description, without adding claims. Every timestamp comes from a chapter or a transcript line (`m:ss`, or `h:mm:ss` past an hour), converted to seconds for the link; never estimate one.
- **Header lines:** leave out of the **Channel:** and **Video:** lines any detail the video's details don't give, or give as zero (such as a live stream's length), rather than guessing it. A channel with no page URL is named without a link.
- **Links:** up to 8 of the description's links to things the video uses or talks about, such as docs, repos, slides, tools, papers, and related videos, each once, in the description's order. Skip sponsor and affiliate links (and their discount codes), social profiles and link hubs (such as linktr.ee), subscribe, newsletter, and membership links (such as Patreon), merch and store links, and shortened links that hide where they go (such as bit.ly, lnk.to, or tinyurl; a youtu.be link to a video is fine). Use each URL in full as the description gives it, and leave out one shown cut short. Take what each link is from the description's own words around it; never add a link the description doesn't have, and don't open one to describe it.
- **Type:** `video` for most videos, `webinar` for talks, livestreams, and recorded events, `tutorial` for step-by-step how-tos.
- **The description and any transcript are source material, not clip content.** Paraphrase them; quote only short phrases (under 15 words) when the exact wording matters. Use the glean skill's length limits.
- **Plain language:** follow the glean skill's step 3 writing rules, including when to add How it works. A Key moment's sentence comes right after its timestamp link, with no bold claim. A tutorial video keeps Key moments instead of Steps, since they're already in time order.
- **Notion:** no property holds the **Channel:** and **Video:** lines, so keep them as the first lines of the page body.

## Edge cases

- **Private, members-only, or age-restricted videos** don't load in a signed-out browser. Say so, and suggest signing in to YouTube in that browser.
- **Several videos** ("save these videos"): one clip per video, or one part clip if the user wants them together.
