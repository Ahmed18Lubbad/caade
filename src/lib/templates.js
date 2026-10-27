import { readFile } from 'node:fs/promises';
import path from 'node:path';

const templateFiles = {
  ar: {
    home: 'ar/index.html',
    subpage: 'ar/subpage.html',
    detail: 'ar/detail.html',
  },
  en: {
    home: 'en/index.html',
    subpage: 'en/subpage.html',
    detail: 'en/detail.html',
  },
};

// Read the body of the static HTML templates and return only the markup
// required by the client-side page renderer.
export async function readTemplate(language, kind) {
  const filename = templateFiles[language]?.[kind];
  if (!filename) throw new Error(`Unknown page template: ${language}/${kind}`);
  const file = await readFile(path.join(process.cwd(), 'src', 'templates', filename), 'utf8');
  const body = file.match(/<body\b([^>]*)>([\s\S]*?)<\/body>/i);
  if (!body) throw new Error(`The ${filename} template has no body`);
  const className = body[1].match(/\bclass="([^"]*)"/i)?.[1] || '';
  const markup = body[2].replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
  return { body: markup, bodyClass: className };
}
