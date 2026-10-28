import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const ar = readJson('public/data/ar.json');
const en = readJson('public/data/en.json');

for (const collection of ['programs', 'news', 'stories', 'gallery', 'projects', 'partners']) {
  // Gallery captions are maintained independently in each language because the
  // source collections contain different editorial selections.
  if (collection === 'gallery') continue;
  const left = ar[collection] || [];
  const right = en[collection] || [];
  const rightIds = new Set(right.map((item) => item?.id).filter(Boolean));
  for (const item of left) if (item?.id && !rightIds.has(item.id)) errors.push(`${collection}: missing English id ${item.id}`);
  const leftIds = new Set(left.map((item) => item?.id).filter(Boolean));
  for (const item of right) if (item?.id && !leftIds.has(item.id)) errors.push(`${collection}: missing Arabic id ${item.id}`);
}

const mediaReferences = new Set();
function collect(value) {
  if (typeof value === 'string') {
    for (const match of value.matchAll(/\/media\/[A-Za-z0-9_./-]+/g)) mediaReferences.add(match[0]);
  } else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
}
collect(ar); collect(en);
for (const file of ['src/templates/ar/index.html', 'src/templates/ar/subpage.html', 'src/templates/ar/detail.html', 'src/templates/en/index.html', 'src/templates/en/subpage.html', 'src/templates/en/detail.html']) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of source.matchAll(/(?:src|href)=["'](\/media\/[^"'#?]+)/g)) mediaReferences.add(match[1]);
}
for (const reference of mediaReferences) if (!fs.existsSync(path.join(root, 'public', reference.slice(1)))) errors.push(`Missing media asset: ${reference}`);

const largeAssets = [...mediaReferences].filter((reference) => fs.statSync(path.join(root, 'public', reference.slice(1))).size > 2.5 * 1024 * 1024);
if (largeAssets.length) console.warn(`Warning: ${largeAssets.length} media asset(s) exceed 2.5 MB: ${largeAssets.join(', ')}`);

if (errors.length) {
  console.error(`Content check failed with ${errors.length} issue(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else console.log(`Content check passed (${mediaReferences.size} media references checked).`);
