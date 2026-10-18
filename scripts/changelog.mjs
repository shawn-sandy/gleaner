// @ts-check
// Changelog helpers shared by release.mjs and release-notes.mjs. The changelog is the README's last section.

export const bumps = /** @type {const} */ (['patch', 'minor', 'major']);
/** @typedef {typeof bumps[number]} Bump */

export const unreleased = '**Unreleased**';
const entryHeading = /^\*\*(\d+\.\d+\.\d+)\*\* \(\d{4}-\d{2}-\d{2}\)$/;

/**
 * @param {unknown} value
 * @returns {value is Bump}
 */
export function isBump(value) {
  return /** @type {readonly unknown[]} */ (bumps).includes(value);
}

/**
 * @param {string} version
 * @param {Bump} type
 * @returns {string}
 */
export function bump(version, type) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) throw new Error(`cannot bump ${version}: expected X.Y.Z`);
  const major = Number(match[1]), minor = Number(match[2]), patch = Number(match[3]);
  if (type === 'major') return `${major + 1}.0.0`;
  if (type === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

/**
 * @param {string} line
 * @returns {boolean}
 */
function isHeading(line) {
  return line === unreleased || entryHeading.test(line);
}

/**
 * The Changelog section's line range, from the line after its heading up to the next ## heading.
 * @param {string[]} lines
 * @returns {{ start: number, end: number }}
 */
function section(lines) {
  const heading = lines.indexOf('## Changelog');
  if (heading === -1) throw new Error('README.md has no ## Changelog section');
  const end = lines.findIndex((line, index) => index > heading && line.startsWith('## '));
  return { start: heading + 1, end: end === -1 ? lines.length : end };
}

/**
 * Text under the heading at index, up to the next changelog heading.
 * @param {string[]} lines
 * @param {number} index
 * @param {number} end
 * @returns {string}
 */
function body(lines, index, end) {
  const rest = lines.slice(index + 1, end);
  const next = rest.findIndex(isHeading);
  return (next === -1 ? rest : rest.slice(0, next)).join('\n').trim();
}

/**
 * The changelog entry for one version, without its heading.
 * @param {string} readme
 * @param {string} version
 * @returns {string}
 */
export function entry(readme, version) {
  const lines = readme.split('\n');
  const { start, end } = section(lines);
  const index = lines.findIndex((line, i) => i >= start && i < end && line.match(entryHeading)?.[1] === version);
  if (index === -1) throw new Error(`README.md has no changelog entry for ${version}`);
  const text = body(lines, index, end);
  if (!text) throw new Error(`the ${version} changelog entry is empty`);
  return text;
}

/**
 * Replace the Unreleased heading at the top of the changelog with the version and date.
 * @param {string} readme
 * @param {string} version
 * @param {string} date YYYY-MM-DD
 * @returns {string}
 */
export function stamp(readme, version, date) {
  const lines = readme.split('\n');
  const { start, end } = section(lines);
  const top = lines.findIndex((line, index) => index >= start && line.trim());
  if (top === -1 || top >= end || lines[top] !== unreleased) {
    throw new Error(`add a ${unreleased} line at the top of ## Changelog, with the user-facing changes as bullets under it`);
  }
  if (!body(lines, top, end).startsWith('- ')) throw new Error(`the ${unreleased} entry needs at least one bullet`);
  if (lines.slice(top + 1, end).includes(unreleased)) throw new Error(`merge the ${unreleased} entries into one at the top`);
  if (lines.slice(start, end).some(line => line.match(entryHeading)?.[1] === version)) {
    throw new Error(`the changelog already has an entry for ${version}`);
  }
  lines[top] = `**${version}** (${date})`;
  return lines.join('\n');
}
