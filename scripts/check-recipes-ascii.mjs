import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const recipesRoot = join(repoRoot, 'recipes');
const nonAsciiPattern = /[^\x00-\x7f]/;

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

walk(recipesRoot);

const problems = [];

for (const file of recipeFiles) {
  const contents = readFileSync(file, 'utf8');
  if (!nonAsciiPattern.test(contents)) continue;

  const lines = contents.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!nonAsciiPattern.test(line)) continue;

    const codePoints = Array.from(
      new Set(
        Array.from(line)
          .filter((char) => char.charCodeAt(0) > 127)
          .map((char) => `U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`),
      ),
    );

    problems.push({
      file: relative(repoRoot, file),
      line: index + 1,
      codes: codePoints.join(', '),
    });
  }
}

if (problems.length > 0) {
  console.error('Non-ASCII characters detected in recipe files:');
  for (const problem of problems) {
    console.error(`- ${problem.file}:${problem.line} (${problem.codes})`);
  }
  process.exit(1);
}

console.log('All recipe files are ASCII-only.');
