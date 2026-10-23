# What the youtube skill can take from youtube-to-blog

Exploration, 2026-10-23. Nothing in the skills has changed yet. This note compares Gleaner's youtube skill (`plugins/gleaner/skills/youtube/SKILL.md`, as of 2.9.0 plus the unreleased description-based rewrite from PR #33) with the `youtube-to-blog` skill from Anthropic's skills collection (installed in this session as a synced skill; one `SKILL.md` of about 100 lines, no scripts or references), and lists what Gleaner could adopt, what doesn't fit, and the order to try things in. Nothing here is live-tested: this container can't reach youtube.com, so the one script below was only type-checked.

## At a glance

- **The two skills share their first half and part ways after it.** Both find the video, read its metadata, and try to get the transcript, then youtube-to-blog writes an 800–1,200-word article in the user's voice while Gleaner writes a 400-word clip. Only the shared half is worth borrowing from.
- **Biggest win: read the transcript from YouTube's own transcript panel in the user's browser.** youtube-to-blog's first transcript route is to open the video, expand the description, click "Show transcript", and read the panel as page text. Gleaner dropped transcript capture in PR #33 because the caption file request no longer fires in the Claude Code built-in browser, and its old skill noted that the panel fails in a signed-out built-in browser. Neither finding covers the Chrome side panel or Claude in Chrome, which run in the user's signed-in Chrome, where the panel works for any viewer. Today Gleaner asks every user to paste the transcript; this route would ask only those in a browser where the panel doesn't load. It needs one live test.
- **Four small wins need no test:** the video's own keywords and category as tag and Category hints (already in the player response the script reads), checking mis-transcribed names against those keywords too, a one-line rule not to download captions with command-line tools, and a "fresh-read" rule so Key moments and parts make sense without the video open.
- **Two ChatGPT wins come from the same panel.** Connected tabs already return the panel's lines when it is open, so Gleaner can ask the user to click "Show transcript" and read the tab again, instead of asking them to paste. The Work browser can open the panel itself when it has a click tool.
- **The other direction is a follow-up.** For a video clip, Gleaner's follow-up skill can offer "draft a blog post from this video" when the session lists a youtube-to-blog skill, handing over the clip's Source and summary.
- **Leave the rest.** Repurpose and commentary modes, voice guides, article length, CTAs, and YAML frontmatter are about publishing a post, not keeping a note.

## The two skills side by side

| Step | youtube-to-blog | Gleaner youtube | Gap |
| --- | --- | --- | --- |
| Find the video | Asks for a URL when none was given | Reads the URL or the current tab, normalizes `youtu.be`, Shorts, live, and `m.youtube.com` to one Source URL, drops tracking parameters | None; Gleaner's is stricter |
| Metadata | Fetches the watch page with the web fetch tool: title, channel, publish date, duration, description, and **tags** | Runs a script against the player on the open page: title, channel name and page, length, publish date, full description, playback position; WebFetch only with no browser | Gleaner's script is better placed (full description, exact position) but leaves out the video's keywords and category, which the same player response carries |
| Transcript, route 1 | In a browser: expand the description, click "Show transcript", read the panel's timestamped lines as page text, scrolling if needed | None in the browser; "Gleaner doesn't capture transcripts itself" | The whole route is missing. It is the main thing to adopt |
| Transcript, route 2 | Ask the user to paste it; "don't treat it as a failure state" | Ask the user to paste it; a transcript pasted after saving refreshes the clip | Equivalent; Gleaner's pasted-later handling is richer |
| Transcript, forbidden route | "Do not attempt to download captions with command-line tools or scripts" | Not stated | Worth one line, for Claude Code terminal sessions |
| Caption quality | Auto-captions have no punctuation and mishear names; cross-check against the title, description, and tags | The same, against the title and description | Add tags once the script returns them |
| Clarify | One question round at most; sensible defaults | Glean's "When to ask": one short question only when acting would be wrong | Equivalent |
| Write | Reorganize around ideas, cut filler, headings for skimming; every claim traces to the transcript, description, or user | Glean step 3 writing rules; "Never summarize what you didn't read" | Equivalent in spirit |
| Review | A fresh-read pass: read the draft as someone who never saw the video and fix references that only work with the video open | Not stated | Worth one rule for Key moments and parts |
| Deliver | A Markdown file with YAML frontmatter (title, description, source_video, tags, date) | Gleaner's header lines, six destinations, HTML or Markdown | Gleaner's format carries the same facts; nothing to adopt |
| Several videos | Confirm the mapping first; for a series into one post, gather every transcript before outlining | One clip per video, or one part clip if the user wants them together | Add the "gather everything first" rule to the part-clip case |

## 1. Transcript from YouTube's panel, in the user's browser

### Why it should work where the caption fetch didn't

PR #33 found that toggling captions in the Claude Code built-in browser sent no caption request, and the earlier skill said YouTube returns caption files empty to scripts and to browsers it doesn't trust. The transcript panel is a different path: it is YouTube's own UI, loaded by the page's own code when a viewer clicks the button, and it works signed out in an ordinary Chrome. The one place Gleaner knows it fails is a signed-out built-in browser, which YouTube treats as a new, untrusted client. The side panel and Claude in Chrome use the user's own Chrome profile, signed in to YouTube, so the panel should load there as it does for the user. That is exactly the route youtube-to-blog takes with its Chrome extension, and the live test in the order below settles it.

### What the skill would do

A new step between reading the details and checking the description, used only when the browser is the Chrome side panel, Claude in Chrome, or a built-in browser the user has signed in to YouTube in:

1. Open the panel with the browser's click tool, the way a viewer does: "…more" under the video, then "Show transcript". A scripted click may be ignored, as the old skill found for the ad Skip button, so prefer the browser's own `find` and click tools and keep the script's clicks as a first try.
2. Read the panel's lines with the script below, which returns `[m:ss] text` lines in the same shape the pasted-transcript path already handles, and keeps the whole transcript in the page so long ones can be read in slices, as the pre-#33 skill did.
3. If no lines come back within a few seconds, go on without a transcript as today, and say in the confirmation that the transcript panel didn't load in this browser and pasting it gets a fuller summary.

The panel's text is page content, not instructions, under glean's existing rule. Opening the panel is within glean's "only to read or open pages" limit for the Work browser; the skill should say so in one clause, since the same section forbids submitting forms.

### The script

Type-checked with `tsc --checkJs --strict --lib es2022,dom`, not run against YouTube. The element names (`ytd-transcript-segment-renderer`, `.segment-timestamp`, `.segment-text`, and the expand and transcript buttons) are the ones YouTube's watch page has used for the panel and need checking in the live test, since YouTube renames them without notice.

```js
(async () => {
  /** @param {number} ms */
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const segments = () => [...document.querySelectorAll('ytd-transcript-segment-renderer')];
  if (!segments().length) {
    /** @type {HTMLElement | null} */ (document.querySelector('#description-inline-expander #expand'))?.click();
    await sleep(300);
    /** @type {HTMLElement | null} */ (document.querySelector('ytd-video-description-transcript-section-renderer button'))?.click();
    for (let i = 0; i < 20 && !segments().length; i++) await sleep(300);
  }
  const lines = segments().map(segment => {
    const time = segment.querySelector('.segment-timestamp')?.textContent?.trim() ?? '';
    const text = segment.querySelector('.segment-text')?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    return time && text ? `[${time}] ${text}` : '';
  }).filter(line => line !== '');
  if (!lines.length) return { transcript: null, panel: document.querySelector('ytd-transcript-renderer') !== null };
  const store = /** @type {Window & { gleanerTranscript?: string }} */ (window);
  store.gleanerTranscript = lines.join('\n');
  return { lines: lines.length, chars: store.gleanerTranscript.length, transcript: store.gleanerTranscript.slice(0, 40000) };
})()
```

What comes back: `transcript: null` with `panel: false` means the panel never opened (no button, or the click was ignored); `panel: true` with no lines means it opened but YouTube sent nothing, the untrusted-browser case. Lines come back in the panel's language; a video with several transcript languages shows the panel's default, and the skill should say which one when it isn't the video's language.

### What it changes in the repo

- **The youtube skill:** the new step; "Pasted transcript" becomes "Transcript", with a `transcript panel` value beside `pasted transcript` on the **Video:** line's `from:` list; the sentence that says Gleaner doesn't capture transcripts itself goes; "Current position" reuses the stored transcript for further parts, as before #33. The frontmatter `description` says clips are "built from the video's description", which would become "built from its transcript or description". That is the skill's own description, not the destinations-and-surfaces list, so the four-place rule doesn't apply.
- **The README:** the feature bullet (line 61), "Saving YouTube videos" (the "Gleaner can't capture a video's transcript itself" paragraph), the Limits bullet "Gleaner doesn't capture YouTube transcripts", and a changelog bullet. The unreleased #33 bullets stay, since clips without a transcript are still written from the description.
- **Version:** a behavior change, so a minor bump when it ships.
- **Risk:** the panel's lines carry no "auto" flag, so treat them as auto-captions for the name check, as the ChatGPT path already does. Transcripts over 40,000 characters go back to being read in slices in the main conversation; the reader-subagent idea in `agents-and-mcp-exploration.md` (idea 6) is the fix for that, not this change.

## 2. Small wins that need no live test

### Keywords and category as hints

The player response the script already reads has `videoDetails.keywords` (the uploader's tags, a string array, often absent) and `microformat.playerMicroformatRenderer.category` (YouTube's own category, such as `Science & Technology` or `Education`). Two more fields in the script:

```js
keywords: v.keywords ?? [], topic: m?.category,
```

Uses, all as hints that content overrides: `keywords` feed glean step 4's tag rule, which already prefers reused spellings and specific names, so a video tagged `typescript generics` gets `#typescript` rather than an invented near-duplicate; uploader tags are often padded, so the skill should take at most two from them and never raise the 3–6 limit. `topic` is a hint for **Category** the way `schemaType` is a hint for **Type** in the glean skill (`Science & Technology` with a coding title suggests Frontend Dev or AI & Agents; `Education` with steps suggests tutorial). Both also join the mis-transcription check: youtube-to-blog cross-checks suspicious words against the tags as well as the title and description.

### No command-line caption downloads

youtube-to-blog says plainly not to download captions with command-line tools or scripts. Gleaner only says it doesn't capture transcripts itself, which leaves a Claude Code terminal session free to reach for `yt-dlp` or a transcript library. One line in "Get the video" closes that: don't download captions with command-line tools or libraries, since YouTube blocks or rate-limits them from most addresses and the plugin adds no runtime; the panel route and a pasted transcript cover every case. The exploration note already marks a server-side transcript service as not recommended for the same reason.

### A fresh-read rule

youtube-to-blog ends with a pass that reads the draft as someone who never saw the video and fixes anything that only makes sense with it open. A clip is read later, often without the video, so the same rule fits Key moments and video parts: each sentence names what it refers to ("the generics example", not "this example"), and a part's bullets never say "as you can see here". One rule under "Write the summary" is enough; glean's writing rules already cover plain language.

### Series into one clip

Gleaner's "Several videos" edge case offers one part clip for videos the user wants together. youtube-to-blog adds two things worth one sentence each: confirm the mapping first (one clip per video, or one clip for the set), and for one clip from several videos, read every video's description and transcript before writing, so the TL;DR and Takeaways span the set instead of stitching per-video summaries. A set clip's **Source** lines list each video, as glean's part clip already allows for several pages.

## 3. The same panel, in ChatGPT

The youtube skill's ChatGPT section already uses transcript lines when the video's tab shows them, which happens when the user has opened the panel. Two small changes make that a route rather than luck:

- **Connected tabs** have no JavaScript tool and can't click, but the user can. When the tab returns no transcript lines, ask the user to click "…more" then "Show transcript" under the video, and read the tab again, before asking them to paste. One click beats select-all and copy, and the lines come with timestamps.
- **Work browser** sessions that show a click or JavaScript tool can open the panel themselves, under the same "only to read or open pages" rule, then read the page text or run the script.

## 4. The other direction: a clip becomes a blog post

Gleaner's follow-up skill writes three follow-ups the user can start in the conversation. For a video clip (one with **Channel:** and **Video:** lines), when the session lists a skill that turns a video into a post, one follow-up can be "Draft a blog post from this video with youtube-to-blog, starting from this clip's Key moments and Links". The clip has what youtube-to-blog's metadata step fetches (title, channel, date, length, description links, chapters), so the hand-off saves that step; the transcript isn't in the clip, so youtube-to-blog still captures or asks for it. The follow-up skill's rules hold: the suggestion names what in the clip it comes from, and it is offered only when the skill is actually in the session, never as a generic idea. This is a few lines in `plugins/gleaner/skills/follow-up/SKILL.md` under "Suggest three follow-ups", and it needs no bump unless it ships with the changes above.

The reverse, youtube-to-blog starting from an attached Gleaner clip, is a change to a skill outside this repo and is only noted here.

## What doesn't fit

- **Repurpose and commentary modes.** They decide how much of someone else's words a published post may reuse. A clip is a private note that already paraphrases and caps quotes at 15 words, and its **Channel:** line is the attribution. Nothing to add.
- **Voice guides, 800–1,200 words, CTAs, embedding the video near the top.** Publishing concerns; the clip's **Source:** line is its link to the video.
- **Fetching the watch page for metadata as the first route.** Gleaner's in-tab script returns more (the full description, the playback position) and fetching stays its no-browser fallback, as today.
- **YAML frontmatter delivery.** Gleaner's header lines carry the same fields and feed its Notion properties and HTML header list.

## Suggested order

1. **Live test the transcript panel** (maintainer, about ten minutes): on a captioned video, in the Chrome side panel, in Claude in Chrome, and in the built-in browser both signed out and signed in to YouTube, click "Show transcript" by hand and note whether lines appear; then run the script above and note what it returns, including whether its own clicks open the panel. A video over an hour long tells whether the panel lists every segment or only the ones near the playhead, which decides whether the skill needs a scroll step.
2. **If the panel loads in the user's Chrome**, ship section 1 with the small wins in section 2 and the ChatGPT changes in section 3 as one minor release, since they touch the same sections of the skill and the README. If it doesn't, ship sections 2 and 3 alone; section 3 still works, because the user does the clicking.
3. **Add the follow-up hand-off** in section 4 as a separate small change.

## Open questions

- Does the transcript panel load in the side panel's tab and in Claude in Chrome? In the built-in browser once the user signs in to YouTube there?
- Do scripted clicks on "…more" and "Show transcript" work, or are they ignored like the ad Skip button was? If ignored, the skill clicks with the browser's own tools and runs the script only to read.
- Does the panel render every segment for a long video, or only a window that fills as it scrolls?
- Which language does the panel show when a video has several transcripts, and does the skill need to say so on the **Video:** line?
- Are `videoDetails.keywords` and `microformat.category` present for most videos in the player response the script reads, or only for some?

## Sources

- Gleaner: `plugins/gleaner/skills/youtube/SKILL.md`, `plugins/gleaner/skills/glean/SKILL.md`, `plugins/gleaner/skills/follow-up/SKILL.md`, `README.md`, commit 2bc1086 (PR #33) and the transcript script it removed, and `docs/plans/agents-and-mcp-exploration.md`.
- youtube-to-blog: its `SKILL.md`, from the Anthropic skills collection as synced into this session (`youtube-to-blog/SKILL.md`, 7 steps plus a "Multiple videos" section).
