import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const jsFiles = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['node_modules', '.next', 'out'].includes(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith('.js') && !full.endsWith('.config.js')) jsFiles.push(full);
  }
}
walk(path.join(root, 'public'));
for (const file of jsFiles) execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
for (const script of ['build', 'lint', 'check']) if (!packageJson.scripts?.[script]) throw new Error(`Missing npm script: ${script}`);
console.log(`Lint passed (${jsFiles.length} browser scripts syntax-checked).`);
