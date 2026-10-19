---
name: youtube
description: Save YouTube videos, or moments from them, as summarized, tagged Gleaner clips built from the transcript, with key moments that link to the exact second. Use when the page or URL is a YouTube video (youtube.com/watch, youtu.be, Shorts, live) and the user wants to keep, save, clip, or bookmark it or part of it, such as "save this video", "clip this talk for the motion post", "grab the part about generics", "keep 3:10 to 5:40", "add this part", or "save https://youtu.be/… to Notion".
argument-hint: "[--to drive | notion | artifact | local | <path>]"
---

# Gleaner for YouTube

Clip a YouTube video, or moments from it, into a Gleaner clip: a summary written from the transcript, with key moments that link to the second they happen.

This skill covers only what's different about video. Everything else (understanding requests, notes, the `--to` flag, collecting parts, adding to a clip saved this session, shared preference setup and synchronization, destinations and formats, duplicate checks, categories and tags, file names, saving, confirming, and finding clips) follows Gleaner's glean skill (`gleaner:glean`, at `../glean/SKILL.md` relative to this skill's folder). Read it first and use it as written, with the changes below; skip its YouTube edge case, which points back here.

Before any video save, run glean step 2 including its shared preferences contract before duplicate detection. Reuse the resolved destination and format through saving; transcript handling never overrides preferences.

## Get the video

1. **Find the video ID** in the URL the user gave or the tab they're on: `youtube.com/watch?v=<id>`, `youtu.be/<id>`, `youtube.com/shorts/<id>`, `youtube.com/live/<id>`, or `m.youtube.com`. The clip's **Source** is always `https://www.youtube.com/watch?v=<id>`, with `t=`, `list=`, `si=`, and tracking parameters dropped, so the duplicate check matches the same video saved from any link.

2. **Open it.** If the tab isn't already that video's `/watch` page (a Shorts page, a different video, or no tab), open the Source URL in the current browser (see "Where Gleaner runs" in the glean skill), adding back any `t=` from the user's link so the player starts where they meant. The snippet below needs the regular player. In ChatGPT's browsers without a JavaScript tool, follow "In ChatGPT" below instead of this step and the next.

3. **Read the video and its transcript** by running this with the browser's JavaScript tool:

   ```js
   (async () => {
     const sleep = ms => new Promise(res => setTimeout(res, ms));
     const p = document.getElementById('movie_player');
     window.gleanerTranscript = null;
     if (p?.classList.contains('ad-showing')) return { ad: true };
     const r = p?.getPlayerResponse?.();
     const v = r?.videoDetails;
     if (!v) return { error: 'no video player on this page' };
     const meta = {
       id: v.videoId, title: v.title, channel: v.author, seconds: Number(v.lengthSeconds),
       published: r.microformat?.playerMicroformatRenderer?.publishDate?.slice(0, 10),
       description: v.shortDescription, position: Math.floor(p.getCurrentTime?.() ?? 0),
       tracks: (r.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []).map(t => t.kind === 'asr' ? `${t.languageCode} (auto)` : t.languageCode),
     };
     if (!meta.tracks.length) return { ...meta, transcript: null };
     // The player signs its own caption request: turn captions on, catch that URL, then restore the CC setting.
     const ccOn = document.querySelector('.ytp-subtitles-button')?.getAttribute('aria-pressed') === 'true';
     performance.setResourceTimingBufferSize(5000);
     performance.clearResourceTimings();
     if (ccOn) { p.toggleSubtitles(); await sleep(300); }
     p.toggleSubtitles();
     let url;
     for (let i = 0; i < 30 && !url; i++) {
       await sleep(300);
       url = performance.getEntriesByType('resource').map(e => e.name)
         .find(u => u.includes('/api/timedtext') && u.includes(`v=${v.videoId}`) && u.includes('pot='));
     }
     if (!ccOn) p.toggleSubtitles();
     if (!url) return { ...meta, transcript: null };
     const j = await fetch(url).then(res => res.json()).catch(() => null);
     const ts = s => {
       const mm = `${Math.floor(s / 60) % 60}:${String(s % 60).padStart(2, '0')}`;
       return s < 3600 ? mm : `${Math.floor(s / 3600)}:${mm.padStart(5, '0')}`;
     };
     window.gleanerTranscript = (j?.events ?? []).filter(e => e.segs)
       .map(e => `[${ts(Math.floor(e.tStartMs / 1000))}] ${e.segs.map(s => s.utf8).join('').replace(/\s+/g, ' ').trim()}`)
       .filter(line => !line.endsWith('] ')).join('\n') || null;
     if (!window.gleanerTranscript) return { ...meta, transcript: null };
     const captions = new URL(url).searchParams.get('kind') === 'asr' ? 'auto-captions' : 'captions';
     return { ...meta, captions, chars: window.gleanerTranscript.length, transcript: window.gleanerTranscript.slice(0, 40000) };
   })()
   ```

   What comes back:
   - **`{ ad: true }`:** an ad is playing, and its captions aren't the video's. Scripted clicks on Skip are ignored, so find the "Skip" button with the browser's `find` tool and click it, or wait for the ad to end, then run the snippet again.
   - **`{ error }`:** there's no player yet (still loading, or not a video page). Wait a few seconds and run it again.
   - **Details with a `transcript`:** lines like `[3:10] …` (`[1:15:03] …` past an hour), and `captions` saying whether they're `captions` or `auto-captions`. If `chars` is over 40000, read the rest in pieces with `window.gleanerTranscript.slice(40000, 80000)` and so on, before writing anything.
   - **Details with `transcript: null`:** the video has no captions, or the caption request couldn't be caught. See "No transcript" below.

   If `ad` or `error` comes back three times in a row, stop retrying and follow "No transcript".

   Don't fetch the caption URLs in `getPlayerResponse()` yourself; YouTube returns them empty without the player's token. Its "Show transcript" panel also fails in browsers YouTube doesn't trust, such as a signed-out built-in browser.

4. **Check auto-captions.** When `captions` is `auto-captions`, the text has no punctuation and often mishear names and jargon. Check product names, people, and code terms against the title and description before they go in the clip.

### No transcript

Before saving, ask in one line whether to continue, such as `This video has no transcript. Save it from the title and description anyway, or paste the transcript for a full summary?` Then follow the reply:

- **Yes:** ask for a short description, such as `Add a short description of the video, and I'll add it to the one from YouTube.` Add the user's words, lightly trimmed, to the description already read, then save a description-only clip from the title, that description, and the chapters, with `none` as its transcript source. Any reply to this question that gives no description ("no", "skip", "just save it") saves it from the video's description alone.
- **No** to the first question, or a reply to it about something else: save nothing.

A transcript the user pastes at any point (on YouTube: "…more" under the video, then "Show transcript", then copy) is the snippet's transcript, with `pasted` as its source. Its timestamps work the same as the snippet's.

When a description-only clip is saved, say in the confirmation that a transcript wasn't available, and mention that pasting it later gets a full summary as an updated copy.

That fallback is for whole videos only. A part (a time range, a topic, or "this part") needs transcript lines, so don't save one without them: say the part can't be clipped without a transcript, ask for it pasted, and offer a description-only clip of the whole video instead. If the user takes that offer, skip the first question and ask for a description as in **Yes**.

Never summarize what you didn't read: with no transcript, there's no **Key moments** section unless the description has chapters, and then the moments are the chapters.

### No browser

With no browser available, fetch the Source URL with WebFetch for the title, channel, and description, and follow "No transcript". Say the video was read without a browser.

### In ChatGPT

ChatGPT's connected Chrome tabs have no JavaScript tool, and the Work browser has one only if this session shows it. Without one, the snippet, skipping ads, and the playback position don't work. In place of steps 2 and 3:

- **Read the video's tab** as in the glean skill's "ChatGPT specifics". If no open tab shows the video, the Work browser can open the Source URL; connected tabs can't, so follow "No browser", fetching with the session's web tool.
- **Use what the tab returns.** Take the title, channel, published date, length, description, and chapters from it, and leave out of the **Video:** line anything it doesn't show. If it also returns timestamped transcript lines, use them as the snippet's transcript: `captions` when the tab says they're uploaded captions, otherwise `auto-captions`, checked as in step 4.
- **No transcript lines:** follow "No transcript".
- **Parts** work by time range or topic, from the transcript lines already read; with no transcript lines, a part can't be clipped (see "No transcript"). "This part" or "this bit" can't use the playback position, so ask for a time range or topic instead, and never guess one.

## Parts of a video

Adding parts works as in the glean skill's "Collecting parts", using time in place of highlights:

| The user says | The part is |
| --- | --- |
| "3:10 to 5:40", "from 12:00 on", "the first five minutes" | the transcript lines in that range |
| "the part about generics" | the chapter or passage that best matches the topic |
| "add this part", "this bit" while watching | the chapter that contains the current playback position; with no chapters, the ~60 seconds before it |

- **Chapters** are the description lines that start with a timestamp (`0:00 Intro`, `3:10 Generics`).
- **Current position:** read it when the user asks, with `Math.floor(document.getElementById('movie_player').getCurrentTime())`. For more parts of the same video, reuse `window.gleanerTranscript` and just read the position; run the snippet again after moving to another video. ChatGPT's browsers without a JavaScript tool can't read it; see "In ChatGPT".
- **Confirm** with the range and first few words: `Added part 2: generics (3:10–5:40, "So now let's look at…"). Add more, or say "done" to save.`

## Write the summary

This replaces step 3 of the glean skill.

**Video clip:**

```markdown
# <Video title>

**Source:** https://www.youtube.com/watch?v=<id>
**Saved:** <today's date, YYYY-MM-DD>
**Category:** <one category from the glean skill's step 4>
**Type:** <video | webinar | tutorial>
**Tags:** #<tag> #<tag> #<tag>
**Note:** <the user's note — only if given>
**Video:** <channel> · published <YYYY-MM-DD> · <length, m:ss or h:mm:ss> · transcript: <captions | auto-captions | pasted | none>

## TL;DR
<2–3 sentences: what the video covers and why it matters>

## Key moments
- [<timestamp>](https://www.youtube.com/watch?v=<id>&t=<seconds>s) <one specific point made at that moment>

## Notable details
- <code, numbers, tools, names, and links from the description worth keeping — omit section if none>

## Takeaways
- <1–3 bullets on how this could be used or what to follow up on>
```

**Part clip:** use the glean skill's part format. Each part's heading links to where it starts, `### 1. <part note or topic> ([3:10–5:40](https://www.youtube.com/watch?v=<id>&t=190s))`, and its `*From …*` line names the video. Parts added to a video clip saved this session get the same headings, in a Parts section just before its Takeaways. An answer part (an answer you gave about the video) follows the glean skill's answer-part rules instead: kept as given and not held to the length limits, headed by the user's question with no time link, and with an *Answer about* line that links the Source URL above. Link any timestamps in the answer to the second, as Key moments do, each taken from a transcript line or chapter.

Rules:
- **Key moments:** 5–8 bullets in time order, following the chapters when the video has them. Every timestamp comes from a transcript line or a chapter (`m:ss`, or `h:mm:ss` past an hour), converted to seconds for the link; never estimate one.
- **Type:** `video` for most videos, `webinar` for talks, livestreams, and recorded events, `tutorial` for step-by-step how-tos.
- **The transcript is source material, not clip content.** Paraphrase it; quote only short phrases (under 15 words) when the exact wording matters. Use the glean skill's length limits.
- **Notion:** no property holds the **Video:** line, so keep it as the first line of the page body.

## Edge cases

- **Live streams and premieres** have no transcript until they end; follow "No transcript".
- **Private, members-only, or age-restricted videos** don't load in a signed-out browser. Say so, and suggest signing in to YouTube in that browser.
- **Several videos** ("save these videos"): one clip per video, or one part clip if the user wants them together.
