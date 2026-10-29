// @ts-check
// Decide whether main holds plugin changes that no release includes yet, for the auto-release and validate workflows.
// Usage: node scripts/auto-release.mjs pending   exit 0 when commits since the last release tag change the plugin
//        node scripts/auto-release.mjs plan      also pick the bump, ensure an Unreleased entry, and write outputs
import { appendFileSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { bumps, entry, unreleased } from './changelog.mjs';

/** @typedef {import('./changelog.mjs').Bump} Bump */
/** @typedef {{ sha: string, title: string, number: number | null, labels: string[], notes: boolean }} Change */
// notes: the change edited README.md, so it wrote its own changelog bullets.

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = resolve(root, 'plugins/gleaner/.claude-plugin/plugin.json');
const readmePath = resolve(root, 'README.md');

/** PR labels that choose the bump; with none, a change is a patch. */
export const labels = /** @type {const} */ ({ patch: 'release:patch', minor: 'release:minor', major: 'release:major', skip: 'release:skip' });

/**
 * Whether a changed path ships in the plugin. Docs, READMEs, and changelogs do not, even under plugins/.
 * Keep in step with the paths filter in .github/workflows/auto-release.yml.
 * @param {string} path
 * @returns {boolean}
 */
export function releasable(path) {
  if (!path.startsWith('plugins/') && !path.startsWith('.claude-plugin/')) return false;
  const parts = path.split('/');
  const name = parts.at(-1) ?? '';
  return !parts.includes('docs') && name !== 'README.md' && name !== 'CHANGELOG.md';
}

/**
 * The largest bump any change asks for, or skip when every change is labeled release:skip.
 * @param {string[][]} labelSets one list of labels per change
 * @returns {Bump | 'skip'}
 */
export function pickBump(labelSets) {
  const shipped = labelSets.filter(set => !set.includes(labels.skip));
  if (!shipped.length) return 'skip';
  let rank = 0;
  for (const set of shipped) {
    for (const [index, type] of bumps.entries()) if (set.includes(labels[type])) rank = Math.max(rank, index);
  }
  return bumps[rank] ?? 'patch';
}

/**
 * A title without a trailing PR reference such as " (#42)".
 * @param {string} title
 * @returns {string}
 */
function bare(title) {
  return title.replace(/\s*\(#\d+\)\s*$/, '').trim();
}

/**
 * The lowercase one-line commit summary for a release of these changes, oldest first.
 * @param {string[]} titles
 * @returns {string}
 */
export function summarize(titles) {
  const latest = bare(titles.at(-1) ?? '') || 'release plugin changes';
  const more = titles.length - 1;
  const summary = more > 0 ? `${latest} and ${more} more change${more === 1 ? '' : 's'}` : latest;
  return summary.replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Whether the changelog already has an Unreleased entry.
 * @param {string} readme
 * @returns {boolean}
 */
export function hasUnreleased(readme) {
  try {
    entry(readme, 'Unreleased');
    return true;
  } catch {
    return false;
  }
}

/**
 * Add a bullet from its title for each change that wrote no changelog bullets of its own, at the end of the
 * Unreleased entry. With no entry yet, start one at the top of the changelog with a bullet for every change.
 * @param {string} readme
 * @param {Change[]} changes
 * @returns {string}
 */
export function withUnreleased(readme, changes) {
  const lines = readme.split('\n');
  const heading = lines.indexOf('## Changelog');
  if (heading === -1) throw new Error('README.md has no ## Changelog section');
  const top = lines.findIndex((line, index) => index > heading && line.trim());
  const started = top !== -1 && lines[top] === unreleased;
  const bullets = changes.filter(change => !started || !change.notes).map(change => {
    const title = bare(change.title).replace(/\.$/, '');
    return `- ${title}${change.number === null ? '' : ` (#${change.number})`}.`;
  });
  if (started) {
    const blank = lines.findIndex((line, index) => index > top && !line.trim());
    lines.splice(blank === -1 ? lines.length : blank, 0, ...bullets);
  } else {
    lines.splice(top === -1 ? lines.length : top, 0, unreleased, ...bullets, '');
  }
  return lines.join('\n');
}

/**
 * Run a command in the repository root and return its stdout, or throw with its stderr.
 * @param {string} command
 * @param {string[]} args
 * @returns {string}
 */
function capture(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed: ${result.stderr.trim()}`);
  return result.stdout;
}

/** @returns {string} the plugin.json version */
function currentVersion() {
  const version = /** @type {{ version?: unknown }} */ (JSON.parse(readFileSync(manifestPath, 'utf8'))).version;
  if (typeof version !== 'string') throw new Error('plugin.json has no version');
  return version;
}

/**
 * First-parent commits since the tag that change a releasable path, oldest first.
 * @param {string} tag
 * @returns {string[]}
 */
function releasableCommits(tag) {
  return capture('git', ['rev-list', '--reverse', '--first-parent', `${tag}..HEAD`]).split('\n').filter(Boolean).filter(sha => {
    const files = capture('git', ['diff', '--name-only', `${sha}^1`, sha]).split('\n').filter(Boolean);
    return files.some(releasable);
  });
}

/**
 * The commit's pull request title, number, and labels from GitHub, or its subject when it has no PR.
 * @param {string} sha
 * @returns {Change}
 */
function describe(sha) {
  const notes = capture('git', ['diff', '--name-only', `${sha}^1`, sha]).split('\n').includes('README.md');
  const repository = process.env.GITHUB_REPOSITORY;
  if (repository) {
    /** @type {{ number: number, title: string, merge_commit_sha: string | null, labels: { name: string }[] }[]} */
    const pulls = JSON.parse(capture('gh', ['api', `repos/${repository}/commits/${sha}/pulls`]));
    const pull = pulls.find(candidate => candidate.merge_commit_sha === sha) ?? pulls[0];
    if (pull) return { sha, title: pull.title, number: pull.number, labels: pull.labels.map(label => label.name), notes };
  }
  return { sha, title: capture('git', ['log', '-1', '--format=%s', sha]).trim(), number: null, labels: [], notes };
}

/**
 * Append name=value to the step's outputs, or print it outside Actions.
 * @param {string} name
 * @param {string} value
 */
function output(name, value) {
  const file = process.env.GITHUB_OUTPUT;
  if (file) appendFileSync(file, `${name}=${value}\n`);
  else console.log(`${name}=${value}`);
}

/**
 * @param {string} mode pending or plan
 * @returns {number} the exit code
 */
function main(mode) {
  if (mode !== 'pending' && mode !== 'plan') throw new Error('Usage: node scripts/auto-release.mjs <pending|plan>');
  const version = currentVersion();
  const tag = `v${version}`;
  if (!capture('git', ['tag', '--list', tag]).trim()) {
    // A merged version bump that release.yml has not tagged yet: it publishes that, then runs this workflow again.
    console.log(`${tag} is not tagged yet, so release.yml publishes it and then runs this workflow again.`);
    if (mode === 'plan') output('release', 'false');
    return mode === 'pending' ? 1 : 0;
  }
  const commits = releasableCommits(tag);
  if (mode === 'pending') {
    console.log(commits.length ? `${commits.length} plugin change(s) since ${tag} are not released yet.` : `No plugin changes since ${tag}.`);
    return commits.length ? 0 : 1;
  }
  if (!commits.length) {
    console.log(`No plugin changes since ${tag}, so there is nothing to release.`);
    output('release', 'false');
    return 0;
  }
  const changes = commits.map(describe);
  const type = pickBump(changes.map(change => change.labels));
  if (type === 'skip') {
    console.log(`Every change since ${tag} is labeled ${labels.skip}; they go out with the next release.`);
    output('release', 'false');
    return 0;
  }
  const shipped = changes.filter(change => !change.labels.includes(labels.skip));
  const readme = readFileSync(readmePath, 'utf8');
  const written = hasUnreleased(readme);
  writeFileSync(readmePath, withUnreleased(readme, shipped));
  const body = `${entry(readFileSync(readmePath, 'utf8'), 'Unreleased')}\n- README: ${written ? 'date' : 'add and date'} the changelog entry\n`;
  const bodyPath = join(process.env.RUNNER_TEMP ?? root, 'release-body.md');
  writeFileSync(bodyPath, body);
  output('release', 'true');
  output('bump', type);
  output('summary', summarize(shipped.map(change => change.title)));
  output('body', bodyPath);
  console.log(`Releasing ${changes.length} change(s) since ${tag} as a ${type} bump.`);
  return 0;
}

// import.meta.url is the real path, so resolve symlinks in argv too (macOS /var is a link to /private/var).
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  try {
    process.exitCode = main(process.argv[2] ?? '');
  } catch (error) {
    console.error(`auto-release: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 2;
  }
}
