// تحميل تفاصيل الخبر أو المشروع المحدد وعرض محتواه.
const container = document.querySelector('#detailContent');
const params = new URLSearchParams(window.location.search);
const collection = params.get('collection');
const id = params.get('id');
const PROJECT_GALLERY_IMAGES = Object.freeze({
  'caade-project-04': ['/media/projects/association-activities/activity-07.jpg', '/media/projects/association-activities/activity-08.jpg', '/media/projects/association-activities/activity-09.jpg'],
  'caade-project-06': ['/media/projects/association-activities/activity-17.jpg', '/media/projects/association-activities/activity-18.jpg', '/media/projects/association-activities/activity-19.jpg'],
  'caade-project-07': ['/media/projects/association-activities/activity-35.jpg', '/media/projects/association-activities/activity-36.jpg', '/media/projects/association-activities/activity-37.jpg'],
  'caade-project-08': ['/media/projects/food-assistance/food-05.jpg', '/media/projects/food-assistance/food-06.jpg', '/media/projects/food-assistance/food-07.jpg'],
  'caade-project-10': [
    '/media/projects/arab-fund-relief/relief-distribution-wide.jpg',
    '/media/projects/arab-fund-relief/relief-food-packs.jpg',
    '/media/projects/arab-fund-relief/relief-family-meal.jpg',
  ],
});
const language = location.pathname.startsWith('/en/') ? 'en' : 'ar';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function getText(item, key) {
  return language === 'en' ? item[`${key}En`] || item[key] || '' : item[key] || item[`${key}En`] || '';
}

function renderDetail(item, profile = {}) {
  const isNews = collection === 'news';
  const title = getText(item, 'title');
  const summary = getText(item, isNews ? 'excerpt' : 'description');
  const logoValue=String(profile.logo||'').trim();
  const logoSrc=logoValue.startsWith('/media/')||/^https:\/\//i.test(logoValue)?logoValue:'/media/b24baa03-8373-4a32-9afb-d6d03d04755c.svg';
  document.querySelectorAll('.brand-mark img').forEach(image=>{image.src=logoSrc;});
  const favicon=document.querySelector('#siteFavicon');if(favicon){favicon.href=logoSrc;if(logoValue)favicon.removeAttribute('type');}
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
  const languageToggle = document.querySelector('#languageToggle');
  if (languageToggle) {
    languageToggle.textContent = language === 'en' ? 'العربية' : 'English';
    languageToggle.addEventListener('click', () => { location.href = `/${language === 'en' ? 'ar' : 'en'}/detail/${location.search}`; }, { once: true });
  }
  const headerLabels={home:language==='en'?'Home':'',about:language==='en'?'About':'',programs:language==='en'?'Programmes':'',projects:language==='en'?'Projects':'',news:language==='en'?'News':'',gallery:language==='en'?'Photo gallery':'',support:language==='en'?'Support':'',contact:language==='en'?'Contact':''};
  document.querySelectorAll('.detail-header [data-nav]').forEach(link=>{const key=link.dataset.nav;if(language==='en')link.textContent=headerLabels[key]||'';if(key==='home')link.href=`/${language}/`;else if(['about','programs','projects','news','gallery','support','contact'].includes(key))link.href=`/${language}/subpage/?page=${key}`;});
  const menuButton=document.querySelector('#detailMenuToggle'),mainNav=document.querySelector('#detailNav');
  const closeMenu=()=>{menuButton?.setAttribute('aria-expanded','false');menuButton?.setAttribute('aria-label',language==='en'?'Open menu':'فتح القائمة');mainNav?.classList.remove('is-open');document.body.classList.remove('menu-open');};
  menuButton?.setAttribute('aria-label',language==='en'?'Open menu':'فتح القائمة');
  menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?(language==='en'?'Close menu':'إغلاق القائمة'):(language==='en'?'Open menu':'فتح القائمة'));mainNav?.classList.toggle('is-open',open);document.body.classList.toggle('menu-open',open);});
  mainNav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('click',event=>{if(mainNav?.classList.contains('is-open')&&!event.target.closest('.detail-header'))closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
  const backHome = document.querySelector('#detailBackHome');
  if (backHome) {
    backHome.href = `/${language}/`;
    backHome.textContent = language === 'en' ? 'Back to website' : 'العودة إلى الموقع';
  }
  document.querySelectorAll('.brand,.footer-brand').forEach(link => { link.href = `/${language}/`; });
  const footerLabels = language === 'en'
    ? ['Home', 'About', 'Programmes', 'Projects', 'News', 'Impact stories', 'Photo gallery', 'Partners', 'Support us', 'Contact us']
    : ['الرئيسية', 'من نحن', 'البرامج', 'المشاريع', 'الأخبار', 'قصص الأثر', 'معرض الصور', 'الشركاء', 'ادعمنا', 'تواصل معنا'];
  document.querySelectorAll('.footer-sitemap a').forEach((link, index) => {
    if (footerLabels[index]) link.textContent = footerLabels[index];
    const page = link.getAttribute('href');
    if (page === '/') link.href = `/${language}/`;
    else if (/^\/(about|programs|projects|partners|news|stories|gallery|support|contact)$/.test(page)) link.href = `/${language}/subpage/?page=${page.slice(1)}`;
  });
  document.title = `${title} – ${language === 'en' ? 'Association' : 'الجمعية التعاونية'}`;
  container.replaceChildren();
  container.append(element('a', 'detail-back', language === 'en' ? '← Back to website' : '← العودة إلى الموقع'));
  container.lastElementChild.href = `/${language}/#${isNews ? 'news' : 'projects'}`;
  const article = element('article', 'detail-article');
  const projectImages = isNews ? [] : [item.image, ...(PROJECT_GALLERY_IMAGES[id] || []), ...(item.gallery || '').split(/\r?\n/)]
    .map(source => String(source || '').trim())
    .filter((source, index, sources) => (source.startsWith('/media/') || source.startsWith('https://')) && sources.indexOf(source) === index)
    .slice(0, 12);
  if (projectImages.length > 1) {
    const gallery = element('div', 'detail-gallery');
    projectImages.forEach((source, index) => {
      const image = element('img', 'detail-image');
      image.src = source;
      image.alt = index === 0 ? [title, summary.split(/[.!?طںط›]/)[0]].filter(Boolean).join('. ').slice(0, 180) : '';
      image.loading = index < 2 ? 'eager' : 'lazy';
      image.decoding = 'async';
      if (index === 0) image.fetchPriority = 'high';
      gallery.append(image);
    });
    article.append(gallery);
  }
  if (projectImages.length <= 1 && (item.image?.startsWith('/media/') || item.image?.startsWith('https://'))) {
    const image = element('img', 'detail-image');
    image.src = item.image;
    image.alt = [title, summary.split(/[.!?؟؛]/)[0]].filter(Boolean).join('. ').slice(0, 180);
    image.loading = 'eager';
    image.decoding = 'async';
    image.fetchPriority = 'high';
    article.append(image);
  }
  const category = getText(item, 'category');
  if (category) article.append(element('span', 'content-tag', category));
  article.append(element('h1', '', title));
  if (item.date) {
    const date = element('time', 'content-date', item.date);
    date.dateTime = item.date;
    article.append(date);
  }
  if (summary) article.append(element('p', 'detail-summary', summary));
  const body = isNews ? getText(item, 'body') : getText(item, 'description');
  if (body && body !== summary) {
    const copy = element('div', 'detail-copy');
    body.split(/\r?\n/).filter(Boolean).forEach(paragraph => copy.append(element('p', '', paragraph)));
    article.append(copy);
  }
  if (item.url && /^https?:\/\//i.test(item.url)) {
    const source = element('a', 'btn button button-outline detail-source', language === 'en' ? 'Visit the external source ↗' : 'زيارة الرابط الخارجي ↗');
    source.href = item.url;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    article.append(source);
  }
  container.append(article);
  document.querySelectorAll('[data-detail-name]').forEach(el=>el.textContent=language==='en'?'Cooperative Association for Agricultural Development and Environment – Gaza':'الجمعية التعاونية للتنمية الزراعية والبيئة – غزة');
  const footerTagline=document.querySelector('#detailFooterTagline');if(footerTagline)footerTagline.textContent=language==='en'?'Working together for sustainable agricultural and environmental development in Gaza.':'نعمل معًا من أجل تنمية زراعية وبيئية مستدامة في قطاع غزة.';
}

async function loadDetail() {
  if (!['news', 'projects'].includes(collection) || !id || !/^[A-Za-z0-9_-]{1,80}$/.test(id)) {
    throw new Error(language === 'en' ? 'This content could not be found.' : 'تعذر العثور على المحتوى المطلوب.');
  }
  const data = await loadSiteContent();
  const item = (data[collection] || []).find(entry => entry.id === id);
  if (!item) throw new Error(language === 'en' ? 'This content could not be found.' : 'تعذر العثور على المحتوى المطلوب.');
  renderDetail(item, data.profile);
}

loadDetail().catch(error => {
  container.replaceChildren(element('p', 'empty-content', error.message));
  const back = element('a', 'btn button button-outline detail-back-button', language === 'en' ? 'Back to website' : 'العودة إلى الموقع');
  back.href = `/${language}/`;
  container.append(back);
});

document.querySelectorAll('#year').forEach(el=>el.textContent=new Date().getFullYear());
