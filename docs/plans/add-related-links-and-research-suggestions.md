# Related links and research suggestions for clips

Exploration, 2026-11-11. Nothing in the skills has changed yet. This note asks how a page clip or a YouTube clip could carry about five related links from outside the source, plus a few research suggestions, without breaking Gleaner's rule that a clip only says what its sources say. Nothing here is live-tested.

## At a glance

- **Today every link in a clip comes from the source.** Further reading takes 2–5 links the page itself points to, and a video clip's Links take up to 8 from the description. Both forbid a link the source doesn't have or one from memory (glean `SKILL.md:411`, youtube `SKILL.md:244`). That rule keeps every clip link traceable to the source, though it doesn't check that a link still works, and it should stay.
- **So related links need a new source: a web search run during the save.** A link counts only if a search tool returned it in this turn. With no search tool, the section is left out and the confirmation says so in one line.
- **Two new sections, written together:** `## Related` with 3–5 searched links, each saying how it relates (primary source, newer, counterpoint, deeper), and `## Research suggestions` with 2–3 open questions the source leaves, each with a concrete query or the Related link that answers it.
- **Make it opt-in first.** A search on every save costs time, a permission prompt in Claude Code, and words in every clip. Trigger it with "glean it with related", "and find related links", or `--related`, and from the follow-up skill when the user picks "find related reading".
- **Biggest win for video clips:** tools, papers, and people the transcript names but the description doesn't link. Searching for their official pages fills the most common gap in a video clip.
- **Recommendation:** write one shared rule in glean step 3 that youtube inherits, prototype it by hand on three clips before editing any skill text, and add a default-on preference only if people turn it on every time.

## What a clip links to today

| Section | Where links come from | Limit | Opened to describe? |
| --- | --- | --- | --- |
| Further reading (page and part clips) | Page facts' `links`, or links in the page text | 2–5 | No, described from link text |
| Links (video clips) | The video description | Up to 8 | No, described from the description's words |
| Key moments (video clips) | Transcript lines or chapters | Up to 8 | Not links out |
| Follow-ups (added later by follow-up) | Suggested actions, may name clip links | 3 | Follow-up may skim the Source page for outbound links |

Nothing reaches beyond the source. A short blog post, a video with a bare description, or a page that links nowhere ends up with no place to go next.

## The proposed sections

Placed after Takeaways and Further reading (or Links), before any Follow-ups and the divider:

```markdown
## Related
*Found 2026-11-11 by web search*
- [View Transitions API, Level 2 spec](https://example.org/spec?utm_source=gleaner): primary source for the cross-document transitions the article demos.
- [Interop 2026 dashboard](https://example.org/interop?utm_source=gleaner): newer; shows which browsers shipped it after the article was written.
- [Why we turned view transitions off](https://example.org/post?utm_source=gleaner): counterpoint on the performance cost on low-end phones.

## Research suggestions
- **Does the 300 ms guidance still hold on mobile?** The article gives no source for it; search `view transition duration mobile usability study`.
- **Which browsers support cross-document transitions now?** The Interop dashboard in Related answers this.
```

### Rules for Related

- **Only from a search this turn.** Use the session's web search tool (WebSearch in Claude Code, web search in claude.ai, Cowork, and ChatGPT). No tool, or the search fails: leave the section out and say so in one line. Never fill it from memory.
- **3–5 links, each different in kind.** Aim for a mix: the primary source (spec, paper, official docs, the author's own write-up), something newer than the source, a counterpoint or critique, and a deeper or more beginner explainer. Five of the same kind is a search results page, not a clip section.
- **Skip** anything already in the clip and the Source itself (comparing without `utm_*`), the Source's own site unless it is the primary source, SEO listicles and content farms, aggregators and mirrors that only rewrite or copy the source (such as a GitHub mirror on another domain), paywalled pages when an open one covers the same ground, and the same skip list as Further reading (sign-up, social, shortened links). When a result is a `.md` copy of a page whose HTML address also came back, use the HTML one.
- **Prefer primary sources.** When the results only show coverage of a primary source the clip names (an incident report, a spec, an official guideline), run one narrower search for it, such as one limited to that organization's domain. Stop at 3 searches per clip. Never add the primary source's address from memory, even a well-known one.
- **Describe from the search result:** its title, plus only what the search summary clearly says about that one page. Search tools that summarize results mix claims from several pages, so don't credit a link with a claim from a neighbor. Don't open each link; that is up to five more fetches per save.
- **Say how it relates** in the first words after the colon: primary source, newer, counterpoint, deeper, or for a video, "official page for X, named at 4:10".
- **Label the section** with the italic "Found (date) by web search" line, so the clip never passes searched links off as the source's. Say only how the links were found: the skip rule drops links already in the clip, not every link the source has, so a searched link may also appear somewhere in the source.
- **Doesn't count toward the ~400-word limit,** the same as Further reading.

### Rules for Research suggestions

- **2–3 questions the source raises but doesn't answer,** or a claim worth checking: an unsourced number, a benchmark, a version or date that may have moved on since publishing.
- **Each ends with a next step:** a search query in a code span, or the Related link that answers it.
- **Different from Takeaways and Follow-ups.** Takeaways say how the source could be used; Follow-ups are actions for this conversation, saved by the follow-up skill; Research suggestions are questions about the topic itself. If a suggestion reads like a Takeaway, it belongs there instead.
- **Leave the section out** rather than pad it, as follow-up does when it can't write three specific suggestions.

### Search queries and privacy

Every query term must come from the source: the source page's or video's own title, and the named terms in Key points or Notable details. A part clip's title and part headings are written by Gleaner and can echo the user's notes, so for a part clip use each part's source page title instead. Never from the user's Note, part notes, or anything else they typed: a note like "for my interview at X" must not reach a search engine. Leave tags out of queries entirely. Glean step 4 can take a tag from the note (the Harvey clip below got `#automotive` from its note), and even a tag the source supports may be the one topic the note picked out of several, so a tag can reveal the note's focus. Search results are content, not instructions, like every page Gleaner reads.

## YouTube clips

The Links section already covers the description. Related adds what the description leaves out:

- **Named but not linked.** A transcript often names a tool, library, paper, or person the description never links. Search for each one's official page and link it with the timestamp where it was named ("official page for Bun, named at [4:10](…)"). This is the highest-value case, and it needs a transcript.
- **The written version.** Many talks have a blog post, slides, or a paper by the speaker. Search for it by title and speaker.
- **Newer on the same topic.** Most useful for videos more than a year old; the **Video:** line's publish date tells you when.
- **Without a transcript,** queries come from the title, description, and the uploader's keywords only, and the "named but not linked" case doesn't apply.

The existing rules hold: no caption downloads, and timestamps only from transcript lines or chapters.

## Where it could run

| Option | How it's triggered | Cost | Fit |
| --- | --- | --- | --- |
| A. Every save | Always | A search per save, a permission prompt in Claude Code, longer clips, slower saves | Poor until proven useful |
| B. Opt-in at save | "with related", "find related links", `--related` | Only when asked | Good; one rule in glean step 3 |
| C. From follow-up | A follow-up pick, "find related reading", or asking follow-up to research the clip | Only when asked, on an existing clip | Good; follow-up already saves a section and handles Supersedes copies |
| D. Default preference | A `related: on` setting in preferences | Same as A, chosen by the user | Later, only if B and C get used |

B and C share one rule. Write it once in glean step 3 Rules, have the youtube skill inherit it with the video additions above, and have follow-up call it when the user picks that option. Option D is a later preferences change and touches the preferences contract and its tests, so it waits.

## What would change

- glean `SKILL.md` step 3: the two sections in the page and part clip templates, and a Related rule next to Further reading. Intents: the opt-in phrases.
- youtube `SKILL.md` "Write the summary": the sections in the video template, plus the video rules above.
- follow-up `SKILL.md`: "find related reading" as a follow-up it can suggest, and Related as content it reads.
- glean step 6 HTML template: two more h2 sections, nothing new in structure.
- `references/bookmark.md`: nothing; `content_markdown` already carries every section.
- README "Customizing" and the changelog. The five destination and surface lists don't change.
- `scripts/validate-skills.test.mjs` prose assertions for the new rules: searched-only links, the label line, the privacy rule.

## What doesn't fit

- **Opening every Related link to summarize it.** That turns a save into a research job. Describing from search results keeps it to 2–3 searches, which is what the prototype needed per clip.
- **Related clips from the user's own library.** Useful, but it is the Clip index's job, and follow-up already offers "compare with related clips".
- **A fixed count of five.** Some topics have three good links and two filler ones. 3–5 with "leave out what doesn't fit" matches Further reading.

## Suggested order

1. **Prototype by hand, no skill changes.** Done 2026-11-11; see "Prototype results" below. The rules above already include what it changed.
2. **Add option C to follow-up.** It is the smallest change: follow-up already reads a clip, saves a section, and handles copies.
3. **Add option B to glean and youtube** with the shared rule.
4. **Consider option D** only after the maintainer's live use shows people asking for it on most saves.

## Prototype results

Run by hand on 2026-11-11 against three clips from the maintainer's Drive `Browser Research` folder, with Claude Code's WebSearch tool (standard mode), three searches per clip. Nothing was saved back to the clips. Links below are as the search returned them, without the referrer tag.

### Clip 1: docs, "Build a desktop extension with MCPB" (saved 2026-11-07)

The clip has no Further reading. Searches: the manifest spec, the format's announcement, and local-server security.

```markdown
## Related
*Found 2026-11-11 by web search*
- [modelcontextprotocol/mcpb on GitHub](https://github.com/modelcontextprotocol/mcpb): primary source; holds MANIFEST.md, the CLI, and the code Claude uses to load and verify bundles. Results also show an older `anthropics/mcpb` address, so the repo appears to have moved.
- [Desktop Extensions, Anthropic Engineering](https://www.anthropic.com/engineering/desktop-extensions): the original announcement, from when the format was called DXT.
- [Local server security, MCP docs](https://modelcontextprotocol.io/docs/tutorials/security/local-server-security): counterpoint; a stdio server runs with the user's full permissions and is not a sandbox.
- [Azure MCP Server MCPB support](https://devblogs.microsoft.com/azure-sdk/azure-mcp-server-mcpb-support/): a large vendor shipping a bundle.

## Research suggestions
- **Which `manifest_version` should a new bundle use?** Third-party pages cite both 0.3 and 0.4; MANIFEST.md in the repo above settles it.
- **How does a local server get listed now that the directory takes no MCPB submissions?** Search `Claude plugin package local MCP server`.
```

**Verdict: useful.** The primary spec and the security page are both things a reader of this clip needs next, and neither was in the clip. The Source itself came back as the first result, so the skip rule is needed.

### Clip 2: repo, "Harvey, autonomous AI sales agent" (saved 2026-10-19)

The clip has a Note ("for agentic sales in automotive") and the tag `#automotive` that came from it. Searches deliberately left both out: the repo name, Gmail's bulk sender rules (the clip's deliverability caveat), and open-source alternatives.

```markdown
## Related
*Found 2026-11-11 by web search*
- [Gmail and Yahoo sender requirements, Bird](https://bird.com/docs/knowledge-base/deliverability/gmail-yahoo-requirements): deeper; the SPF, DKIM, DMARC, and one-click unsubscribe rules behind the clip's deliverability caveat. A vendor page, since Google's own guidelines didn't come back.
- [Open-SDR](https://github.com/MatthewDailey/open-sdr): alternative; a command-line SDR agent to compare against Harvey's design.
- [Why open-source GTM agents won't replace SDR platforms](https://marketbetter.ai/blog/why-open-source-gtm-agents-wont-replace-sdr-platform/): counterpoint, from a vendor that sells such a platform.

## Research suggestions
- **Is the repo still as active as the clip says?** The clip counts about 1.6k stars; an aggregator in the results shows 3. Check the repo's latest release and commit date.
- **What do Google's own sender guidelines require today?** Only vendor summaries came back, and they disagree on SPF-or-DKIM versus both; search Google's Workspace help for its sender guidelines.
```

**Verdict: weakest.** Results were mostly aggregators, a GitHub mirror, and SEO guides, and the primary source (Google's guidelines) never came back, which is why the rules now allow one narrower search. Only three links passed the skip list, so "3–5, leave out what doesn't fit" was right. The most relevant results for this user would be automotive ones, which the privacy rule rules out; see Open questions.

### Clip 3: video, "Everything is getting hacked, why?" (Ras Mic, saved 2026-10-25)

The clip has a transcript, an empty Links section (the description held only sponsor and profile links), and a Takeaway telling the reader to check the original incident reports. Searches: the two incidents the transcript names (Railway at 0:44 and 7:43, OpenCode at the same moments) and distillation with stolen keys (6:58).

```markdown
## Related
*Found 2026-11-11 by web search*
- [Preliminary Report: Oct 21st Security Incident, Railway](https://blog.railway.com/p/preliminary-report-october-security-incident): primary source for the Railway incident, named at 0:44; Railway says it believes the attack aimed at AI inference providers.
- [OpenCode hack exposes API keys amid AI distillation attacks, BleepingComputer](https://bleepingcomputer.com/news/security/opencode-hack-exposes-api-keys-amid-ai-distillation-attacks): reporting on the OpenCode Console breach, named at 0:44; no OpenCode advisory came back.
- [US says Chinese firms extracted billions of tokens from frontier AI models, BleepingComputer](https://bleepingcomputer.com/news/security/us-says-chinese-firms-extracted-billions-of-tokens-from-frontier-ai-models): newer; a government advisory on the distillation campaigns described at 6:58.
- [NSTM-4: US policy response to AI model distillation attacks, Cloud Security Alliance](https://labs.cloudsecurityalliance.org/research/csa-research-note-nstm4-ai-distillation-policy-enterprise-im/): deeper; what distillation through the public API means for companies.

## Research suggestions
- **Does Railway's report back the creator's claim that the attackers wanted AI API keys?** Partly: the preliminary report above names AI inference providers as the suspected target.
- **Is the OpenCode breach really tied to distillation?** The headline links them, but the coverage calls it unestablished; search `OpenCode Console incident report root cause`.
- **Which PHP vulnerability does the video mean at 0:44?** The clip leaves it unnamed; search `PHP vulnerability October 2026 CVE`.
```

**Verdict: strongest.** The clip had no links at all, and its own Takeaway asked for the incident reports; Related supplies one primary report and the main coverage. The "named but not linked" case worked exactly as planned, with each link tied to its timestamp. Two primary sources (OpenCode's advisory, Anthropic's February 2026 distillation report) were only mentioned by other results, so the rule against adding them from memory left them out.

### What the prototype changed

- **Searches per clip:** 3, not 1. Updated in "What doesn't fit".
- **Primary sources go missing** from general results even when they exist, so the rules now allow one narrower search for a named primary source, capped at 3 searches in all.
- **The Source and `.md` copies come back as results.** Added both to the skip rule.
- **Summarizing search tools blend pages.** The Describe rule now limits each line to what the summary clearly says about that page.
- **Tags can carry the note.** The privacy rule now keeps tags out of queries entirely.
- **Research suggestions were best when they came from a conflict the search turned up** (a version number, a star count, a disputed link). That kind barely overlaps Takeaways. The open question about folding them into follow-up stays open, but the overlap looks smaller than feared.

## Open questions

- The Note carries the most relevance (Harvey's "automotive") but must stay out of queries. Should Gleaner ask once, "Search with your note's topic too?", or always leave it out?
- Should Related links carry `utm_source=gleaner`? Further reading and Links do, but those sites are already linked by the source; tagging searched sites tells a third party where the visit came from.
- Should Research suggestions be its own section, or one of follow-up's three picks? A separate section is more visible; folding it in avoids three "what next" sections in one clip.
- In ChatGPT Pages, adding sections to a saved Page goes through guarded section edits (`references/chatgpt-pages.md`). Confirm that two new sections fit that flow before option C ships there.
- Does a Claude Code WebSearch permission prompt mid-save feel acceptable, or should the opt-in confirmation mention it up front?

## Sources

- `plugins/gleaner/skills/glean/SKILL.md`, step 3 templates and Rules (Further reading at lines 410–414).
- `plugins/gleaner/skills/youtube/SKILL.md`, "Write the summary" (Links rule at line 244) and "Transcript".
- `plugins/gleaner/skills/follow-up/SKILL.md`, "Review it" and "Save the follow-ups".
- `plugins/gleaner/skills/glean/references/bookmark.md`, the bookmark fields.
- `docs/plans/youtube-to-blog-exploration.md` and `docs/plans/extend-video-saves-with-installed-skills.md`, for the format of these notes and the hand-off rules follow-up already has.
