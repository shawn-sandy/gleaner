// Keep the shared Claude source intact; adapt only the disposable OpenAI staging tree.
import { readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

/** Apply checked edits to a staged text file, failing when the shared source drifts. */
function edit(root, path, replacements, removedPrefixes = []) {
  const file = resolve(root, path);
  let text = readFileSync(file, 'utf8');
  for (const [before, after] of replacements) {
    if (text.split(before).length !== 2) throw new Error(`Review OpenAI conversion for ${path}: expected one ${before}`);
    text = text.replace(before, after);
  }
  for (const prefix of removedPrefixes) {
    const lines = text.split('\n');
    if (lines.filter(line => line.startsWith(prefix)).length !== 1) throw new Error(`Review OpenAI conversion for ${path}: expected one ${prefix}`);
    text = lines.filter(line => !line.startsWith(prefix)).join('\n');
  }
  writeFileSync(file, text);
}

/** Remove Claude live-artifact workflows while preserving clipping, storage and HTML downloads. */
export function adaptOpenAIContent(root, listing) {
  // This repository-level overview links outside the standalone package.
  rmSync(resolve(root, 'skills/README.md'));
  edit(root, 'skills/glean/SKILL.md', [
    [", or a private claude.ai artifact", ""],
    [' | artifact |', ' |'],
    [', "as an artifact"', ''],
    ['"save it as an artifact" → Artifact; ', ''],
    [', and `artifact` needs the Artifact tool', ', and `notion` needs the Notion connector'],
    ['doc, file, page, or artifact.', 'doc, file, or page.'],
    ['the artifact link and its scratch file, ', ''],
    ['`in my Notion database "<database name>"`, or `in my artifacts`', 'or `in my Notion database "<database name>"`'],
    ['never publish the clip as an artifact or write it into the project for this destination.', 'never write it into the project for this destination.'],
    ['template under Artifact below', 'template under HTML download template below'],
    ['   **Artifact**', '   **HTML download template**'],
    ['Publishing a path that was already published in this session republishes over that artifact, so reuse a path only to update that same clip (see Updating a clip saved this session).', 'Use this template only for a requested HTML download or an existing clip retained in HTML format; return a supported chat attachment, never a live published page.'],
    ["the artifact's link; ", ''],
    [' Keep artifact search opt-in as before.', ''],
    ['("in Drive", "in my artifacts")', '("in Drive", "in my project folder")'],
    ['(Drive, Notion, a project folder, or artifacts)', '(Drive, Notion, or a project folder)'],
  ], [
    '- **Artifact** (on request):',
    '| `--to artifact` |',
    '   - "Save it as an artifact",',
    "     - Artifact: list the user's artifacts",
    '   - **Needs the Artifact tool**',
    '   - **One artifact per clip.**',
    '     <meta name="claude:viewport-fit-sides"',
    '   - **Publish** with the Artifact tool',
    '   - **If the publish is refused,**',
    '   - Artifacts have no folders;',
    "   - Confirm with the artifact's link.",
    '   - **Artifact:** write the updated page',
    "   - Artifacts: list the user's artifacts",
  ]);
  edit(root, 'skills/youtube/SKILL.md', [[' | artifact |', ' |']]);
  edit(root, 'skills/follow-up/SKILL.md', [
    [', a claude.ai artifact', ''],
    ["the Artifact tool's `read` action, ", ''],
    ['an artifact or an HTML clip file', 'an HTML clip file'],
    ['In an HTML clip (an artifact, or an HTML file given in the chat)', 'In an HTML clip file given in the chat'],
  ]);
  edit(root, 'skills/preferences/SKILL.md', [["Artifact and the conversation can't hold the list", "The conversation can't hold the list"]]);
  edit(root, 'skills/preferences/references/contract.md', [
    ['Notion, artifacts, and Drive', 'Notion and Drive'],
    ['because its `remote_id` is a publishing scope with no document to append to', 'because that provider is unsupported in this package'],
    ['; artifact publishes HTML', ''],
    ['Notion pages and HTML artifacts are incompatible', 'Notion pages are incompatible'],
    [' Verify artifact publishing scope without publishing a test artifact.', ''],
  ], ['- Artifact uses `remote_id`']);
  const contract = resolve(root, 'skills/preferences/references/contract.md');
  const content = readFileSync(contract, 'utf8');
  writeFileSync(contract, content.replace('## Storage and precedence',
    'The `artifact` provider is recognized only to preserve existing cross-host preferences. It is unavailable in this OpenAI package: do not create, read, reopen, update, or publish Claude live artifacts. If an explicit request or selected preference uses that provider, explain the limitation and ask for a temporary supported destination before proceeding. Preserve the stored alias and permanent default unchanged. Do not offer this provider during setup.\n\n## Storage and precedence'));
  edit(root, 'skills/preferences/references/examples/user.yaml', [
    ['  web:\n    provider: artifact\n    label: Private artifacts\n    remote_id: example-publishing-workspace-id\n', ''],
  ]);
  edit(root, 'skills/glean/references/bookmark.md', [
    ['HTML artifact URL/path', 'HTML file path'],
    ['explicit HTML download or Artifact request', 'explicit HTML download request'],
    ['chat HTML and Artifact publishing', 'chat HTML downloads'],
    ['For chat HTML or an Artifact save,', 'For chat HTML,'],
    ['publish an artifact, ', ''],
  ]);
  checkArtifactInstructions(resolve(root, 'skills'));
  writeFileSync(resolve(root, 'README.md'), `# Gleaner\n\n${listing.longDescription}\n\n## Skills\n\n- [Glean](skills/glean/SKILL.md) saves pages, selected text, and answers.\n- [YouTube](skills/youtube/SKILL.md) saves available video text and timestamped notes.\n- [Preferences](skills/preferences/SKILL.md) manages optional destinations and synchronization.\n- [Follow-up](skills/follow-up/SKILL.md) adds research follow-ups to saved clips.\n\n## Requirements\n\nUse only tools and connections available in the current host. Browser access, Google Drive, Notion, and persistent local storage require separate capabilities and permissions. Without persistent preferences, clips stay in the conversation by default. Claude live artifacts are unavailable; existing cross-host preferences are preserved and an unsupported destination requires a temporary choice.\n\n[Privacy policy](PRIVACY.md) · [Support](${listing.supportURL})\n`);
}

/** Fail closed when new artifact guidance has not been reviewed for the OpenAI package. */
function checkArtifactInstructions(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) checkArtifactInstructions(path);
    else if (/\.(md|yaml)$/.test(entry.name)) {
      for (const line of readFileSync(path, 'utf8').split('\n')) {
        if (!/artifact/i.test(line)) continue;
        if (entry.name === 'contract.md' && (
          line.startsWith('- `provider`: one of ') ||
          line.startsWith('- `skills.gleaner.clip_list`: ') ||
          line.startsWith('The `artifact` provider is recognized only ')
        )) continue;
        throw new Error(`Review OpenAI conversion for unhandled artifact guidance in ${path}`);
      }
    }
  }
}
