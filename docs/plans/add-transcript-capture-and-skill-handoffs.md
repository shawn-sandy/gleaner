---
status: todo
type: feature
created: 2026-10-24
repo-name: gleaner
artifact-url: https://claude.ai/artifact/SE51eUgQLwTrv8HFPv3uKS
issue: https://github.com/shawn-sandy/gleaner/issues/37
glance: Video clips stop depending on the user pasting a transcript, and saved clips start pointing at the skills the user already has. Done means a captioned video saves with panel-read key moments in a browser the live test passed, and follow-ups offer a blog-post hand-off only when such a skill is listed.
---

# Plan: Capture YouTube transcripts from the panel and hand clips to installed skills

## Objective

Ship the recommended solution from the two exploration notes: the youtube skill reads the transcript from YouTube's own "Show transcript" panel in the user's browser (plus four small borrowings and two ChatGPT routes), and the follow-up skill offers a hand-off to an installed skill that turns a video or page into something, only when the session lists one.

## Context

Gleaner 2.10.x writes video clips from the description alone because PR #33 found the caption-file request never fires in the Claude Code built-in browser, and the skill now tells every user to paste the transcript. The exploration note docs/plans/youtube-to-blog-exploration.md found that the youtube-to-blog skill takes a different route that Gleaner never tried: clicking YouTube's own "Show transcript" panel and reading it as page content, which works in a signed-in Chrome. The follow-up note docs/plans/extend-video-saves-with-installed-skills.md found that the only way a skill can use another installed skill is by matching the session's skill-list descriptions, and recommended borrowing the panel technique into Gleaner's own text plus one outward hand-off rule in the follow-up skill. Deferring to another skill for transcripts was examined and rejected there.

The one risk that shapes the plan: the panel route is unverified. YouTube returns captions empty to browsers it doesn't trust, and the one place Gleaner tested (a signed-out built-in browser) failed. The live test in step 1 settles where the panel loads before any skill text changes; if it fails in every user browser, the panel step is skipped and the rest still ships.

## Decisions

- Borrow techniques into Gleaner's own skill text instead of invoking youtube-to-blog with the Skill tool — invocation is all-or-nothing and would load a blog pipeline with questions a save never needs.
- The follow-up hand-off matches skills by what their listed description says, never by name — the same skill is named anthropic-skills:youtube-to-blog, youtube-to-blog, or plugin:youtube-to-blog depending on how it was installed.
- No lanes: the transcript work is gated on the step 1 live test and both pieces share README.md, so the plan runs sequentially.
- The corrected panel script is inlined in the youtube skill, as the details script is, so the skill stays self-contained at runtime.
- The panel step names the browsers the live test passed rather than trying everywhere, since a wasted wait in browsers YouTube distrusts reads as a hang.
- Transcripts over 40,000 characters are read in slices, restoring the pre-2.9 rule the panel script's stored transcript supports.
- At most one of the three follow-ups may be a hand-off, keeping two grounded in the clip's own content.
- The version bump ships through the existing /release flow; this plan only adds changelog bullets under the Unreleased line.

## Files

- plugins/gleaner/skills/youtube/SKILL.md (modified) — the transcript-panel step, the four small borrowings, the ChatGPT routes, and the frontmatter description
- plugins/gleaner/skills/follow-up/SKILL.md (modified) — the hand-off rule in "Suggest three follow-ups" and "When the user picks one"
- README.md (modified) — feature bullet, "Saving YouTube videos", the transcript Limits bullets, a follow-up sentence, and Unreleased changelog bullets
- docs/plans/add-transcript-capture-and-skill-handoffs.md (modified) — step 1 records the live-test outcomes in Decisions

## Steps

1. Run the transcript-panel live test from docs/plans/youtube-to-blog-exploration.md on a captioned video and on one over an hour long: in the Chrome side panel, in Claude in Chrome, and in the built-in browser signed out and signed in to YouTube, click "…more" then "Show transcript" by hand, then run the note's panel script, noting whether scripted clicks open the panel, whether long videos list every segment, and which language the panel shows; record one outcome per browser in this plan's Decisions section. Why: PR #33 dropped transcript capture after one failing route, and only this test says where YouTube's own panel loads, which decides whether step 2 ships. Verify: the Decisions section carries a pass-or-fail line for each of the four browser states and an answer on scripted clicks and long videos.
2. Add a "Read the transcript" step to plugins/gleaner/skills/youtube/SKILL.md between reading the video's details and checking the description, used only in browsers the live test passed: open the panel the way a viewer does (the browser's find and click tools first, scripted clicks only if the test showed they work), read it with the note's panel script, inlined in the skill the way the details script is, with element names corrected to what the test found, keeping the full transcript stored in the page and reading transcripts over 40,000 characters in slices, give up after a few seconds and continue as today, and state that opening the panel counts as reading the page under glean's read-only rule; rename "Pasted transcript" to "Transcript", add transcript panel to the Video line's from: values, drop the sentence that Gleaner doesn't capture transcripts itself, and change the frontmatter description's "built from the video's description" to "built from its transcript or description"; skip this whole step and strike its criteria if step 1 failed in every user browser, recording that in Decisions. Why: the panel is YouTube's own UI and the one route that gets a transcript without asking every user to paste, and the skill's own description must stop promising less than the skill does. Verify: npm run validate exits 0 and the new step names the browsers it applies to, the give-up path, and the panel language caveat.
3. Add the four no-test borrowings to plugins/gleaner/skills/youtube/SKILL.md: keywords and category fields in the details script with their rules (at most two uploader tags feed the step 4 tag choice, category is a hint for Category and Type, both join the mis-transcription check), a one-line rule never to download captions or video with command-line tools or libraries, a fresh-read rule under "Write the summary" so Key moments and parts name what they refer to without the video open, and two sentences in "Several videos" (confirm the mapping first; for one clip from several videos, read every description and transcript before writing). Why: these are the youtube-to-blog note's section 2 wins, safe without any live test. Verify: npm run validate exits 0 and each addition sits in the section named here.
4. Rework the "In ChatGPT" section of plugins/gleaner/skills/youtube/SKILL.md: when a connected tab returns no transcript lines, ask the user to click "…more" then "Show transcript" and read the tab again before asking for a paste, and let a Work browser session that shows a click or JavaScript tool open the panel itself under the same read-only rule. Why: the tab already returns the panel's timestamped lines when it is open, so one click by the user beats select-all and paste. Verify: npm run validate exits 0 and the section names both routes with paste as the remaining fallback.
5. Add the hand-off rule to plugins/gleaner/skills/follow-up/SKILL.md: under "Suggest three follow-ups", when the session lists a skill whose description says it turns a video or page into something, at most one of the three may hand off to it, named by its listed name, starting from the clip's Source, TL;DR, Key moments, and Links, offered only when the skill is actually listed and never as a generic idea; under "When the user picks one", invoke that skill with the clip's Source URL and content, noting the transcript is not in the clip. Why: clips already carry what such skills fetch first, and matching on descriptions keeps the offer honest on every surface. Verify: npm run validate exits 0 and both named sections carry the rule.
6. Update README.md in the same commit style the repo uses: the YouTube feature bullet, the "Saving YouTube videos" section, the two Limits bullets that say Gleaner doesn't capture transcripts, one sentence in the follow-up docs, and changelog bullets under the Unreleased line covering the panel route (or its absence), the borrowings, the ChatGPT routes, and the hand-off. Why: the README states a limitation that stops being true, and the changelog is where /release reads the next version's entry from. Verify: grep -n "can't capture" README.md returns nothing stale, and npm run validate plus npm test exit 0.

## Tests

Tier 2 — This plan changes skill prose and docs, which the repo tests with its static validator suite
- Objective: the youtube skill carries the transcript route and the follow-up skill carries the hand-off rule, and the repo's validators accept both. File: scripts/validate-skills.mjs (existing suite); Type: smoke; Asserts: frontmatter, references, and markdown lint pass with the new sections present; Run: grep -q "transcript panel" plugins/gleaner/skills/youtube/SKILL.md && grep -qi "hand off\|hand-off" plugins/gleaner/skills/follow-up/SKILL.md && npm run validate && npm test

## Acceptance Criteria

- [ ] The Decisions section records a live-test outcome for the side panel, Claude in Chrome, and the built-in browser signed out and signed in.
- [ ] In a browser the live test passed, the youtube skill's text reads the transcript from the panel before asking for a paste, and the Video line's from: values include transcript panel — or step 1 failed everywhere and Decisions says the panel step was dropped.
- [ ] A clip saved without a transcript still says what it was written from and that pasting the transcript gets a fuller summary.
- [ ] The follow-up skill offers a hand-off only when a matching skill is listed in the session, and its text forbids offering one otherwise.
- [ ] README.md no longer claims Gleaner can't capture YouTube transcripts (unless step 2 was dropped), and the changelog has Unreleased bullets for every shipped piece.
- [ ] npm run validate and npm test both exit 0.

## Verification

Run npm run validate and npm test from the repo root; both must exit 0 with the Claude strict validators reporting pass or an explained skip. Then read plugins/gleaner/skills/youtube/SKILL.md top to bottom as a fresh session would: the transcript route, the paste fallback, the no-description flow, and the ChatGPT section must name the same from: values and never contradict each other.

The behavior check is the maintainer's, per this repo's rule that nothing is reported as live-tested: in Claude Code desktop with the plugin reloaded, save a captioned video in a browser the live test passed and confirm the clip's Key moments come from panel lines with a transcript panel source; then ask for follow-ups on that clip in a session with youtube-to-blog synced and confirm one hand-off naming it appears, and in a session without it confirm no hand-off is offered.

## Next Steps

- Cut the release once the branch merges
  The changelog bullets land under Unreleased; the bump is a behavior change, so it is a minor version.
  ```text
  In the gleaner repo on main, run /release to cut the next minor version: it dates the Unreleased changelog entry, bumps plugins/gleaner/.claude-plugin/plugin.json, validates, and commits. Verify npm run validate and npm test exit 0 and the commit subject matches "Gleaner X.Y.Z: <lowercase summary>".
  ```
- Revisit deferring transcript capture to another skill
  Rejected for now in docs/plans/extend-video-saves-with-installed-skills.md; worth revisiting only on new capability.
  ```text
  In the gleaner repo, re-read docs/plans/extend-video-saves-with-installed-skills.md section "2. Defer to a listed skill". If a skill or MCP tool now exists in your session that returns YouTube transcripts a way Gleaner's own text can't reproduce, draft the one-sentence deferral for plugins/gleaner/skills/youtube/SKILL.md and open a PR; otherwise report that nothing new exists. Verify npm run validate exits 0.
  ```

## Unresolved Questions

- Does ChatGPT show an imported skill the names and descriptions of the user's other imported skills? If not, the hand-off rule is Claude-only in practice; the rule's "only when listed" wording already degrades safely.

## Resources

- docs/plans/youtube-to-blog-exploration.md — the borrowings, the panel script, and the live-test design
- docs/plans/extend-video-saves-with-installed-skills.md — the skill-to-skill mechanisms and the hand-off rule (also published at https://claude.ai/artifact/5YNNQq2WnDhoWT6MeWuoQT)
- Claude Code docs: skills.md (skill listing and namespacing), sub-agents.md (the skills preload field)
