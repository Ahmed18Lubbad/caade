// خادم الموقع: يدير الصفحات العامة وواجهات API والمصادقة والرفع والنسخ الاحتياطي.
const http = require('node:http');
const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const nodemailer = require('nodemailer');

const ROOT = path.resolve(__dirname);
function loadLocalEnv() {
  let contents;
  try { contents = fsSync.readFileSync(path.join(ROOT, '.env'), 'utf8'); }
  catch { return; }
  contents.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || Object.hasOwn(process.env, match[1])) return;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    else value = value.replace(/\s+#.*$/, '').trim();
    process.env[match[1]] = value;
  });
}
loadLocalEnv();
let ADMIN_USERNAME = process.env.ADMIN_USERNAME ? String(process.env.ADMIN_USERNAME).trim().slice(0, 80) : '';
let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ? String(process.env.ADMIN_PASSWORD) : '';
let ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ? String(process.env.ADMIN_EMAIL).trim() : (process.env.CONTACT_TO ? String(process.env.CONTACT_TO).trim() : '');
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const passwordResetTokens = new Map();
const DATA_DIR = path.join(ROOT, 'data');
const MEDIA_DIR = path.join(ROOT, 'media');
const BACKUP_DIR = path.join(ROOT, 'backups');
const DATA_FILE = path.join(DATA_DIR, 'site-data.json');
const PORT = Number(process.env.PORT || 3000);
const BACKUP_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_BACKUPS = 12;
const MAX_BODY_BYTES = 12 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES = 10;
const loginFailures = new Map();
const PUBLIC_FILES = new Set([
  '/index.html', '/admin.html', '/subpage.html', '/detail.html',
  '/site.js', '/admin.js', '/subpage.js', '/detail.js',
  '/site.css', '/subpage.css', '/favicon.svg', '/favicon.ico',
]);
const COLLECTION_FIELDS = {
  programs: ['title', 'titleEn', 'description', 'descriptionEn', 'icon'],
  news: ['category', 'categoryEn', 'title', 'titleEn', 'excerpt', 'excerptEn', 'body', 'bodyEn', 'date', 'url', 'image'],
  stories: ['title', 'titleEn', 'quote', 'quoteEn', 'attribution', 'attributionEn', 'image'],
  gallery: ['title', 'titleEn', 'image'],
  projects: ['category', 'categoryEn', 'title', 'titleEn', 'description', 'descriptionEn', 'date', 'image', 'gallery', 'url'],
  partners: ['name', 'nameEn', 'url', 'logo'],
  heroImages: ['title', 'titleEn', 'image'],
};
const PROFILE_FIELDS = ['logo', 'nameEn', 'about', 'aboutEn', 'vision', 'visionEn', 'mission', 'missionEn', 'values', 'valuesEn', 'statYears', 'statProjects', 'statBeneficiaries', 'phone', 'email', 'address', 'addressEn', 'mapUrl', 'officeHours', 'officeHoursEn', 'facebook', 'instagram', 'whatsapp'];
const MIME_EXTENSIONS = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/svg+xml': '.svg', 'application/pdf': '.pdf' };
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function sendJson(response, status, value) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(JSON.stringify(value));
}

function readCookies(request) {
  const header = request.headers.cookie || '';
  const cookies = {};
  header.split(';').forEach(part => {
    const [name, ...rest] = part.trim().split('=');
    if (!name) return;
    cookies[name] = decodeURIComponent(rest.join('='));
  });
  return cookies;
}

function signSession(username) {
  if (!username || !ADMIN_SESSION_SECRET) return '';
  const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
  const payload = `${username}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', ADMIN_SESSION_SECRET).update(payload).digest('hex');
  return `${encodeURIComponent(username)}.${expiresAt}.${signature}`;
}

function verifySessionToken(token) {
  if (!token || !ADMIN_SESSION_SECRET) return null;
  const [username, expiresAtText, signature] = String(token).split('.');
  if (!username || !expiresAtText || !signature) return null;
  const expected = crypto.createHmac('sha256', ADMIN_SESSION_SECRET).update(`${decodeURIComponent(username)}:${expiresAtText}`).digest('hex');
  const expectedBytes = Buffer.from(expected, 'hex');
  const signatureBytes = Buffer.from(signature, 'hex');
  if (signatureBytes.length !== expectedBytes.length || !crypto.timingSafeEqual(signatureBytes, expectedBytes)) return null;
  const expiresAt = Number(expiresAtText);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;
  return decodeURIComponent(username);
}

function getAdminSession(request) {
  const cookies = readCookies(request);
  const token = cookies.admin_session;
  const username = verifySessionToken(token);
  return username === ADMIN_USERNAME ? username : null;
}

function requireAdmin(request) {
  const username = getAdminSession(request);
  if (!username) {
    throw Object.assign(new Error('يجب تسجيل الدخول أولًا للوصول إلى إدارة المحتوى.'), { status: 401 });
  }
  return username;
}

function setAdminCookie(response, token) {
  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.setHeader('Set-Cookie', `admin_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200${secureFlag}`);
}

function clearAdminCookie(response) {
  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.setHeader('Set-Cookie', `admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureFlag}`);
}

function setAdminPassword(nextPassword) {
  const candidate = String(nextPassword || '').trim();
  if (!candidate || candidate.length < 8) {
    throw Object.assign(new Error('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.'), { status: 400 });
  }
  ADMIN_PASSWORD = candidate;
  process.env.ADMIN_PASSWORD = candidate;
}

function getLoginFailureRecord(request) {
  const key = request.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let record = loginFailures.get(key);
  if (!record || now >= record.expiresAt) {
    record = { failures: 0, expiresAt: now + LOGIN_WINDOW_MS };
    loginFailures.set(key, record);
  }
  if (loginFailures.size > 1000) {
    for (const [address, entry] of loginFailures) {
      if (now >= entry.expiresAt) loginFailures.delete(address);
    }
  }
  return { key, record };
}

function buildResetUrl(token) {
  const baseUrl = process.env.ADMIN_RESET_BASE_URL || process.env.PUBLIC_SITE_URL || `http://127.0.0.1:${PORT}`;
  return new URL(`/admin/reset?token=${encodeURIComponent(token)}`, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString();
}

async function sendPasswordResetEmail(recipient, resetUrl) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass || !recipient) {
    console.warn('SMTP is not configured; skipping email send for password reset.');
    return false;
  }
  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: { user, pass },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || user,
    to: recipient,
    replyTo: recipient,
    subject: 'إعادة تعيين كلمة المرور - لوحة إدارة المحتوى',
    text: `يمكنك إعادة تعيين كلمة المرور عبر الرابط التالي:\n${resetUrl}\n\nإذا لم تطلب هذا الإجراء، يمكنك تجاهل هذه الرسالة.`,
    html: `<p>لإعادة تعيين كلمة المرور، استخدم الرابط التالي:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>إذا لم تطلب هذا الإجراء، يمكنك تجاهل هذه الرسالة.</p>`,
  });
  return true;
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('الطلب أكبر من الحجم المسموح.'), { status: 413 }));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
      catch { reject(Object.assign(new Error('بيانات الطلب غير صالحة.'), { status: 400 })); }
    });
    request.on('error', reject);
  });
}

function cleanString(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function normaliseData(input) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const profileSource = source.profile && typeof source.profile === 'object' ? source.profile : {};
  const output = {
    name: cleanString(source.name, 160) || 'الجمعية التعاونية للتنمية الزراعية والبيئة – غزة',
    profile: {},
  };
  PROFILE_FIELDS.forEach(field => { output.profile[field] = cleanString(profileSource[field], field.startsWith('stat') ? 40 : 4000); });
  Object.entries(COLLECTION_FIELDS).forEach(([collection, fields]) => {
    const values = Array.isArray(source[collection]) ? source[collection].slice(0, 100) : [];
    output[collection] = values.map((entry, index) => {
      const legacyId = crypto.createHash('sha256').update(`${collection}:${index}:${JSON.stringify(entry)}`).digest('hex').slice(0, 32);
      const item = { id: cleanString(entry?.id, 80) || legacyId };
      fields.forEach(field => { item[field] = cleanString(entry?.[field], /(body|description|excerpt|quote)/i.test(field) ? 5000 : 1200); });
      return item;
    });
  });
  return output;
}

async function readSiteData() {
  try {
    return normaliseData(JSON.parse(await fs.readFile(DATA_FILE, 'utf8')));
  } catch {
    return normaliseData({});
  }
}

async function writeSiteData(data) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tempFile = `${DATA_FILE}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tempFile, DATA_FILE);
}

async function uploadFile(body) {
  if (typeof body.data !== 'string') throw Object.assign(new Error('لم يتم اختيار ملف.'), { status: 400 });
  const match = body.data.match(/^data:(image\/(?:jpeg|png|webp|svg\+xml)|application\/pdf);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw Object.assign(new Error('الملفات المسموح بها هي JPG وPNG وWEBP وPDF، ويسمح بـSVG للشعار فقط.'), { status: 415 });
  if (match[1] === 'image/svg+xml' && body.purpose !== 'logo') {
    throw Object.assign(new Error('يسمح بملفات SVG لشعار الجمعية فقط.'), { status: 415 });
  }
  const buffer = Buffer.from(match[2], 'base64');
  if (!buffer.length || buffer.length > MAX_UPLOAD_BYTES) {
    throw Object.assign(new Error('يجب ألا يتجاوز حجم الملف 8 ميغابايت.'), { status: 413 });
  }
  if (match[1] === 'image/svg+xml') {
    let svg;
    try { svg = new TextDecoder('utf-8', { fatal: true }).decode(buffer); }
    catch { throw Object.assign(new Error('ملف SVG غير صالح.'), { status: 400 }); }
    if (!/^(?:\uFEFF)?\s*(?:<\?xml\s+[^?]*\?>\s*)?<svg(?:\s|>)/i.test(svg) ||
        !/<\/svg>\s*$/i.test(svg) || /<!DOCTYPE|<!ENTITY/i.test(svg)) {
      throw Object.assign(new Error('ملف SVG غير صالح.'), { status: 400 });
    }
  }
  await fs.mkdir(MEDIA_DIR, { recursive: true });
  const filename = `${crypto.randomUUID()}${MIME_EXTENSIONS[match[1]]}`;
  await fs.writeFile(path.join(MEDIA_DIR, filename), buffer, { flag: 'wx' });
  return `/media/${filename}`;
}

async function translateTexts(body) {
  const endpoint = process.env.LIBRETRANSLATE_URL || 'http://127.0.0.1:5000/translate';
  const texts = Array.isArray(body.texts) ? body.texts : [];
  if (!texts.length || texts.length > 128 || texts.some(text => typeof text !== 'string' || text.length > 5000)) {
    throw Object.assign(new Error('قائمة النصوص المطلوب ترجمتها غير صالحة.'), { status: 400 });
  }
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: texts, source: 'ar', target: 'en', format: 'text' }),
    });
  } catch {
    throw Object.assign(new Error('خادم LibreTranslate المحلي غير متاح. شغّله على 127.0.0.1:5000 ثم أعد المحاولة.'), { status: 503 });
  }
  const result = await response.json().catch(() => ({}));
  const translations = Array.isArray(result.translatedText) ? result.translatedText : [result.translatedText];
  if (!response.ok || translations.length !== texts.length || translations.some(value => typeof value !== 'string')) {
    throw Object.assign(new Error(result.error || 'تعذرت الترجمة عبر LibreTranslate. تحقق من توفر زوج العربية والإنجليزية.'), { status: 502 });
  }
  return translations;
}

async function backupSiteData() {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const targetDir = path.join(BACKUP_DIR, `snapshot-${stamp}`);
  await fs.mkdir(targetDir);
  for (const source of [DATA_DIR, MEDIA_DIR]) {
    try {
      await fs.cp(source, path.join(targetDir, path.basename(source)), { recursive: true, errorOnExist: true });
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  const snapshots = (await fs.readdir(BACKUP_DIR, { withFileTypes: true }))
    .filter(entry => entry.isDirectory() && /^snapshot-\d{4}-/.test(entry.name))
    .sort((left, right) => right.name.localeCompare(left.name));
  for (const entry of snapshots.slice(MAX_BACKUPS)) {
    const oldSnapshot = path.resolve(BACKUP_DIR, entry.name);
    if (path.dirname(oldSnapshot) === BACKUP_DIR) await fs.rm(oldSnapshot, { recursive: true, force: false });
  }
  console.log(`Backup created: ${path.relative(ROOT, targetDir)}`);
}

function scheduleBackup() {
  fs.mkdir(BACKUP_DIR, { recursive: true }).then(() => fs.readdir(BACKUP_DIR, { withFileTypes: true })).then(async entries => {
    const latest = entries.filter(entry => entry.isDirectory() && /^snapshot-\d{4}-/.test(entry.name))
      .sort((left, right) => right.name.localeCompare(left.name))[0];
    if (!latest) {
      await backupSiteData();
      scheduleBackup();
      return;
    }
    const latestPath = path.resolve(BACKUP_DIR, latest.name);
    if (path.dirname(latestPath) !== BACKUP_DIR) throw new Error('Invalid backup directory.');
    const stats = await fs.stat(latestPath);
    const delay = Math.max(1000, BACKUP_INTERVAL_MS - (Date.now() - stats.mtimeMs));
    const timer = setTimeout(() => {
      backupSiteData().then(scheduleBackup).catch(error => {
        console.error('Scheduled backup failed:', error.message);
        const retryTimer = setTimeout(scheduleBackup, 24 * 60 * 60 * 1000);
        retryTimer.unref();
      });
    }, delay);
    timer.unref();
  }).catch(error => {
    console.error('Unable to schedule backups:', error.message);
    const retryTimer = setTimeout(scheduleBackup, 24 * 60 * 60 * 1000);
    retryTimer.unref();
  });
}

async function handleApi(request, response, pathname) {
  if (pathname === '/api/admin/session' && request.method === 'GET') {
    const authenticated = Boolean(getAdminSession(request));
    sendJson(response, 200, { authenticated });
    return true;
  }
  if (pathname === '/api/admin/login' && request.method === 'POST') {
    const body = await readBody(request);
    const username = String(body.username || '').trim();
    const password = String(body.password || '');
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_SESSION_SECRET || ['change-this-secret-in-production', 'replace-with-a-long-random-secret-for-production', 'replace-with-a-unique-random-secret-before-starting'].includes(ADMIN_SESSION_SECRET)) {
      throw Object.assign(new Error('لم يتم إعداد بيانات الدخول لإدارة المحتوى بعد.'), { status: 503 });
    }
    const { key, record } = getLoginFailureRecord(request);
    if (record.failures >= LOGIN_MAX_FAILURES) {
      throw Object.assign(new Error('Too many login attempts. Try again later.'), { status: 429 });
    }
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      record.failures += 1;
      throw Object.assign(new Error('اسم المستخدم أو كلمة المرور غير صحيحة.'), { status: 401 });
    }
    loginFailures.delete(key);
    const sessionToken = signSession(ADMIN_USERNAME);
    setAdminCookie(response, sessionToken);
    sendJson(response, 200, { ok: true, authenticated: true });
    return true;
  }
  if (pathname === '/api/admin/logout' && request.method === 'POST') {
    clearAdminCookie(response);
    sendJson(response, 200, { ok: true, authenticated: false });
    return true;
  }
  if (pathname === '/api/admin/reset-request' && request.method === 'POST') {
    const body = await readBody(request);
    const username = String(body.username || '').trim();
    const email = String(body.email || '').trim();
    if (!username && !email) {
      throw Object.assign(new Error('يرجى إدخال اسم المستخدم أو البريد الإلكتروني.'), { status: 400 });
    }
    if (username && username !== ADMIN_USERNAME) {
      throw Object.assign(new Error('اسم المستخدم غير موجود.'), { status: 404 });
    }
    const contact = (email || ADMIN_EMAIL || process.env.CONTACT_TO || '').trim();
    if (!contact) {
      throw Object.assign(new Error('لم يتم إعداد بريد الإدارة بعد. أضف ADMIN_EMAIL أو CONTACT_TO في ملف .env.'), { status: 503 });
    }
    const token = crypto.randomBytes(24).toString('hex');
    const resetUrl = buildResetUrl(token);
    passwordResetTokens.set(token, {
      username: ADMIN_USERNAME,
      email: contact,
      expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
    });
    const sent = await sendPasswordResetEmail(contact, resetUrl);
    if (!sent) {
      sendJson(response, 200, {
        ok: true,
        message: 'تم إنشاء رابط إعادة تعيين كلمة المرور محليًا لأن خدمة البريد غير مفعلة بعد.',
        resetUrl,
      });
      return true;
    }
    console.log(`Admin reset request received for ${username || contact}`);
    sendJson(response, 200, {
      ok: true,
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريد الإدارة. استخدم الرابط المرسل في الرسالة.',
      contact,
    });
    return true;
  }
  if (pathname === '/api/admin/reset' && request.method === 'POST') {
    const body = await readBody(request);
    const token = String(body.token || '').trim();
    const password = String(body.password || '').trim();
    if (!token) {
      throw Object.assign(new Error('الرابط غير صالح أو منتهي الصلاحية.'), { status: 400 });
    }
    const record = passwordResetTokens.get(token);
    if (!record || Date.now() > record.expiresAt || record.username !== ADMIN_USERNAME) {
      passwordResetTokens.delete(token);
      throw Object.assign(new Error('رابط إعادة التعيين منتهي أو غير صالح.'), { status: 401 });
    }
    if (!password || password.length < 8) {
      throw Object.assign(new Error('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.'), { status: 400 });
    }
    setAdminPassword(password);
    passwordResetTokens.delete(token);
    sendJson(response, 200, {
      ok: true,
      message: 'تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.',
    });
    return true;
  }
  if (pathname === '/api/site-data' && request.method === 'GET') {
    sendJson(response, 200, await readSiteData());
    return true;
  }
  if (pathname === '/api/site-data' && request.method === 'PUT') {
    requireAdmin(request);
    const data = normaliseData(await readBody(request));
    await writeSiteData(data);
    sendJson(response, 200, { ok: true, data });
    return true;
  }
  const contentMatch = pathname.match(/^\/api\/content\/(news|projects)\/([A-Za-z0-9_-]{1,80})$/);
  if (contentMatch && request.method === 'GET') {
    const [, collection, id] = contentMatch;
    const data = await readSiteData();
    const item = data[collection].find(entry => entry.id === id);
    if (!item) sendJson(response, 404, { error: 'المحتوى المطلوب غير موجود.' });
    else sendJson(response, 200, { item });
    return true;
  }
  if (pathname === '/api/media' && request.method === 'POST') {
    requireAdmin(request);
    const url = await uploadFile(await readBody(request));
    sendJson(response, 201, { url });
    return true;
  }
  if (pathname === '/api/translate' && request.method === 'POST') {
    const translations = await translateTexts(await readBody(request));
    sendJson(response, 200, { translations });
    return true;
  }
  if (pathname.startsWith('/api/')) {
    sendJson(response, 404, { error: 'المسار غير موجود.' });
    return true;
  }
  return false;
}

const server = http.createServer(async (request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400).end('Bad request'); return; }

  try {
    if (await handleApi(request, response, pathname)) return;
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    if (['/about', '/programs', '/projects', '/partners', '/news', '/stories', '/gallery', '/support', '/contact'].includes(pathname)) {
      const page = await fs.readFile(path.join(ROOT, 'subpage.html'));
      response.writeHead(200, {
        'Content-Type': MIME_TYPES['.html'],
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Cache-Control': 'no-cache',
      });
      response.end(request.method === 'HEAD' ? undefined : page);
      return;
    }
    if (/^\/(news|projects)\/[A-Za-z0-9_-]{1,80}$/.test(pathname)) {
      const detail = await fs.readFile(path.join(ROOT, 'detail.html'));
      response.writeHead(200, {
        'Content-Type': MIME_TYPES['.html'],
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Cache-Control': 'no-cache',
      });
      response.end(request.method === 'HEAD' ? undefined : detail);
      return;
    }
    if ((pathname === '/admin' || pathname === '/admin/' || pathname === '/admin/login' || pathname === '/admin/reset') && request.method === 'GET') {
      const filePath = path.join(ROOT, 'admin.html');
      const body = await fs.readFile(filePath);
      response.writeHead(200, {
        'Content-Type': MIME_TYPES['.html'],
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Cache-Control': 'no-cache',
      });
      response.end(request.method === 'HEAD' ? undefined : body);
      return;
    }
    const isPublicMedia = pathname.startsWith('/media/') && !pathname.split('/').some(segment => segment.startsWith('.'));
    if (pathname !== '/' && !PUBLIC_FILES.has(pathname) && !isPublicMedia && pathname !== '/vendor/bootstrap.rtl.min.css') {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
      return;
    }
    const staticPath = pathname === '/vendor/bootstrap.rtl.min.css'
      ? require.resolve('bootstrap/dist/css/bootstrap.rtl.min.css')
      : null;
    const requestedPath = pathname === '/favicon.ico' ? '/favicon.svg' : (pathname === '/' ? '/index.html' : pathname);
    const filePath = staticPath || path.resolve(ROOT, `.${requestedPath}`);
    if (filePath !== ROOT && !filePath.startsWith(`${ROOT}${path.sep}`)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    if (requestedPath.split('/').some(segment => segment.startsWith('.'))) {
      response.writeHead(404).end('Not found');
      return;
    }
    const body = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const headers = {
      'Content-Type': MIME_TYPES[extension] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': ['.html', '.css', '.js', '.json'].includes(extension) ? 'no-cache' : 'public, max-age=300',
    };
    if (extension === '.svg') headers['Content-Security-Policy'] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
    response.writeHead(200, {
      ...headers,
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch (error) {
    if (pathname.startsWith('/api/')) {
      sendJson(response, error.status || 500, { error: error.message || 'تعذر تنفيذ العملية.' });
      return;
    }
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Website ready at http://127.0.0.1:${PORT}`);
  scheduleBackup();
});
