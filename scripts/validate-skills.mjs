import { readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parseDocument } from 'yaml';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const plugin = 'plugins/gleaner';
const skills = ['glean', 'youtube'];
let failures = 0;

function check(label, action) {
  try {
    action();
    console.log(`PASS ${label}`);
  } catch (error) {
    failures++;
    console.error(`FAIL ${label}: ${error.message}`);
  }
}

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function object(value, label) {
  requireValue(value && typeof value === 'object' && !Array.isArray(value), `${label} must be a mapping`);
}

function text(value, label, max = Infinity) {
  requireValue(typeof value === 'string' && value.trim().length > 0 && value.length <= max,
    `${label} must be a nonempty string${max === Infinity ? '' : ` of at most ${max} characters`}`);
}

function localPath(base, target, kind = 'file') {
  text(target, 'local path');
  requireValue(!isAbsolute(target), `expected a relative path: ${target}`);
  const path = realpathSync(resolve(base, target));
  const fromRoot = relative(realpathSync(root), path);
  requireValue(fromRoot !== '..' && !fromRoot.startsWith(`..${sep}`) && !isAbsolute(fromRoot),
    `path leaves the repository: ${target}`);
  const stat = statSync(path);
  requireValue(kind === 'directory' ? stat.isDirectory() : stat.isFile(), `expected ${kind}: ${target}`);
  return path;
}

function read(file) {
  return readFileSync(localPath(root, file), 'utf8');
}

function yaml(source) {
  const doc = parseDocument(source, { uniqueKeys: true });
  requireValue(doc.errors.length === 0 && doc.warnings.length === 0,
    [...doc.errors, ...doc.warnings].map(error => error.message).join('; '));
  const value = doc.toJS({ maxAliasCount: 100 });
  object(value, 'YAML document');
  return value;
}

// Check file targets, not remote URLs or heading anchors. Fenced examples are excluded.
function references(file) {
  const source = read(file).replace(/^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\1\s*$/gm, '');
  const prose = source.replace(/`+[^`\n]*`+/g, '');
  const targets = [
    ...prose.matchAll(/\[[^\]\n]*\]\(<?([^\s)>]+)>?(?:\s+["'][^\n]*?["'])?\)/g),
    ...prose.matchAll(/^ {0,3}\[[^\]\n]+\]:\s*<?([^\s>]+)>?/gm),
    ...source.matchAll(/`((?:\.\.?\/)[^`\n]+\.[a-zA-Z0-9]+)`/g),
  ];
  for (const [, target] of targets) {
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(target)) continue;
    const path = decodeURIComponent(target.split(/[?#]/)[0]);
    if (path) localPath(dirname(resolve(root, file)), path);
  }
}

check('marketplace and plugin manifests', () => {
  const marketplace = JSON.parse(read('.claude-plugin/marketplace.json'));
  object(marketplace, 'marketplace');
  text(marketplace.name, 'marketplace.name');
  text(marketplace.owner?.name, 'marketplace.owner.name');
  requireValue(!Object.hasOwn(marketplace, 'version'), 'version belongs in plugin.json only');
  requireValue(Array.isArray(marketplace.plugins) && marketplace.plugins.length > 0, 'plugins must be a nonempty array');
  const names = new Set();
  for (const entry of marketplace.plugins) {
    object(entry, 'plugin entry');
    text(entry.name, 'plugin entry name');
    requireValue(!names.has(entry.name), `duplicate plugin: ${entry.name}`);
    names.add(entry.name);
    const directory = localPath(root, entry.source, 'directory');
    const manifest = JSON.parse(readFileSync(localPath(directory, '.claude-plugin/plugin.json'), 'utf8'));
    object(manifest, 'plugin manifest');
    requireValue(manifest.name === entry.name, 'marketplace and plugin names must match');
    text(manifest.description, 'plugin.description');
    requireValue(typeof manifest.version === 'string' && /^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/.test(manifest.version),
      'plugin.version must be a semantic version');
    if (entry.name === 'gleaner') requireValue(directory === realpathSync(resolve(root, plugin)), 'Gleaner source must point to plugins/gleaner');
  }
  requireValue(names.has('gleaner'), 'marketplace must register gleaner');
});

for (const name of skills) {
  const directory = `${plugin}/skills/${name}`;
  check(`${name} Skill frontmatter`, () => {
    const source = read(`${directory}/SKILL.md`);
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    requireValue(match, 'SKILL.md must start with delimited YAML frontmatter');
    const data = yaml(match[1]);
    requireValue(data.name === name, `name must match directory: ${name}`);
    text(data.description, 'description', 1024);
    if (data['argument-hint'] !== undefined) text(data['argument-hint'], 'argument-hint');
    requireValue(source.slice(match[0].length).trim(), 'Skill body must not be empty');
  });
  check(`${name} ChatGPT metadata`, () => {
    const data = yaml(read(`${directory}/agents/openai.yaml`));
    object(data.interface, 'interface');
    text(data.interface.display_name, 'interface.display_name');
    text(data.interface.short_description, 'interface.short_description', 64);
    requireValue(data.interface.short_description.length >= 25, 'short_description must contain at least 25 characters');
    if (data.interface.default_prompt !== undefined) text(data.interface.default_prompt, 'interface.default_prompt');
    for (const key of ['icon_small', 'icon_large']) {
      if (data.interface[key] !== undefined) localPath(resolve(root, directory), data.interface[key]);
    }
    if (data.policy !== undefined) {
      object(data.policy, 'policy');
      requireValue(typeof data.policy.allow_implicit_invocation === 'boolean', 'policy.allow_implicit_invocation must be boolean');
    }
  });
  check(`${name} local references`, () => references(`${directory}/SKILL.md`));
}

for (const file of ['README.md', 'LICENSE', 'plugins/gleaner/skills/README.md', 'docs/chatgpt-marketplace.md']) {
  check(`${file} required file${file.endsWith('.md') ? ' and local references' : ''}`, () => {
    read(file);
    if (file.endsWith('.md')) references(file);
  });
}

// ENOENT alone means optional CLI absence; installed but broken CLIs must fail.
for (const target of ['.', './plugins/gleaner']) {
  const result = spawnSync('claude', ['plugin', 'validate', target, '--strict'], { cwd: root, stdio: 'inherit' });
  if (result.error?.code === 'ENOENT') {
    console.log('SKIP Claude marketplace/plugin validation: claude is not installed on PATH.');
    break;
  }
  check(`claude plugin validate ${target} --strict`, () => {
    if (result.error) throw result.error;
    requireValue(result.status === 0, `Claude exited with ${result.signal ?? result.status}`);
  });
}

console.log(failures ? `${failures} validation check(s) failed.` : 'Local Skill validation passed.');
process.exitCode = failures ? 1 : 0;
