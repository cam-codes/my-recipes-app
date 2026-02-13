import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const recipesRoot = join(repoRoot, 'recipes');
const nonAsciiPattern = /[^\x00-\x7f]/;

const fractionMap = {
  '¼': '1/4',
  '½': '1/2',
  '¾': '3/4',
  '⅐': '1/7',
  '⅑': '1/9',
  '⅒': '1/10',
  '⅓': '1/3',
  '⅔': '2/3',
  '⅕': '1/5',
  '⅖': '2/5',
  '⅗': '3/5',
  '⅘': '4/5',
  '⅙': '1/6',
  '⅚': '5/6',
  '⅛': '1/8',
  '⅜': '3/8',
  '⅝': '5/8',
  '⅞': '7/8',
};

const replacementMap = {
  '–': '-',
  '—': '-',
  '−': '-',
  '‒': '-',
  '‐': '-',
  '‑': '-',
  '’': "'",
  '‘': "'",
  '“': '"',
  '”': '"',
  '…': '...',
  '×': 'x',
  '°': '',
  '\u00A0': ' ',
};

const recipeFiles = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.md')) {
      recipeFiles.push(fullPath);
    }
  }
};

const replaceFractions = (input) => {
  let output = input;
  output = output.replace(
    /(\d)([¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])/g,
    (_, whole, frac) => `${whole} ${fractionMap[frac] ?? frac}`,
  );
  for (const [fraction, replacement] of Object.entries(fractionMap)) {
    output = output.split(fraction).join(replacement);
  }
  return output;
};

const replaceSymbols = (input) => {
  let output = input;
  for (const [symbol, replacement] of Object.entries(replacementMap)) {
    output = output.split(symbol).join(replacement);
  }
  return output;
};

const stripDiacritics = (input) =>
  input.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

const fixContent = (input) => {
  let output = input;
  output = replaceFractions(output);
  output = replaceSymbols(output);
  output = stripDiacritics(output);
  return output;
};

const collectProblems = (contents, file) => {
  const problems = [];
  const lines = contents.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!nonAsciiPattern.test(line)) continue;
    const codePoints = Array.from(
      new Set(
        Array.from(line)
          .filter((char) => char.charCodeAt(0) > 127)
          .map((char) =>
            `U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`,
          ),
      ),
    );
    problems.push({
      file: relative(repoRoot, file),
      line: index + 1,
      codes: codePoints.join(', '),
    });
  }
  return problems;
};

walk(recipesRoot);

const changed = [];
const problems = [];

for (const file of recipeFiles) {
  const contents = readFileSync(file, 'utf8');
  const fixed = fixContent(contents);

  if (fixed !== contents) {
    writeFileSync(file, fixed, 'utf8');
    changed.push(relative(repoRoot, file));
  }

  if (nonAsciiPattern.test(fixed)) {
    problems.push(...collectProblems(fixed, file));
  }
}

if (changed.length > 0) {
  console.log('Updated recipe files to ASCII-only content:');
  for (const file of changed) {
    console.log(`- ${file}`);
  }
}

if (problems.length > 0) {
  console.error('Non-ASCII characters remain after auto-fix:');
  for (const problem of problems) {
    console.error(`- ${problem.file}:${problem.line} (${problem.codes})`);
  }
  process.exit(1);
}

console.log('All recipe files are ASCII-only.');
