// منطق الصفحات التعريفية الفرعية، مع تحميل بيانات الصفحة وعرضها.
const pageKey = new URLSearchParams(location.search).get('page') || 'about';
let language = location.pathname.startsWith('/en/') ? 'en' : 'ar';
let data;
const PROJECT_GALLERY_IMAGES = Object.freeze({
  'caade-project-04': ['/media/projects/association-activities/activity-06.jpg', '/media/projects/association-activities/activity-07.jpg', '/media/projects/association-activities/activity-08.jpg', '/media/projects/association-activities/activity-09.jpg'],
  'caade-project-06': ['/media/projects/association-activities/activity-16.jpg', '/media/projects/association-activities/activity-17.jpg', '/media/projects/association-activities/activity-18.jpg', '/media/projects/association-activities/activity-19.jpg'],
  'caade-project-07': ['/media/projects/association-activities/activity-34.jpg', '/media/projects/association-activities/activity-35.jpg', '/media/projects/association-activities/activity-36.jpg', '/media/projects/association-activities/activity-37.jpg'],
  'caade-project-08': ['/media/projects/food-assistance/food-04.jpg', '/media/projects/food-assistance/food-05.jpg', '/media/projects/food-assistance/food-06.jpg', '/media/projects/food-assistance/food-07.jpg'],
  'caade-project-10': ['/media/projects/arab-fund-relief/relief-distribution-main.jpg', '/media/projects/arab-fund-relief/relief-distribution-wide.jpg', '/media/projects/arab-fund-relief/relief-food-packs.jpg', '/media/projects/arab-fund-relief/relief-family-meal.jpg'],
});
const FEATURED_GALLERY_IMAGES = [
  {image:'/media/projects/arab-fund-relief/relief-distribution-main.jpg',title:'توزيع مساعدات للأسر في غزة',titleEn:'Aid distribution to families in Gaza'},
  {image:'/media/projects/arab-fund-relief/relief-distribution-wide.jpg',title:'مشاهد من مشروع الإغاثة',titleEn:'Scenes from the relief project'},
  {image:'/media/projects/arab-fund-relief/relief-food-packs.jpg',title:'طرود غذائية للأسر المتضررة',titleEn:'Food parcels for affected families'},
  {image:'/media/projects/arab-fund-relief/relief-family-meal.jpg',title:'دعم غذائي للأسر النازحة',titleEn:'Food support for displaced families'},
  {image:'/media/projects/association-activities/activity-35.jpg',title:'وحدة التجفيف وإنتاج الزعتر',titleEn:'Drying unit and zaatar production'},
  {image:'/media/projects/association-activities/activity-36.jpg',title:'من أنشطة التصنيع الزراعي',titleEn:'Agricultural processing activities'},
  {image:'/media/projects/association-activities/activity-37.jpg',title:'معدات ومخرجات المشروع الزراعي',titleEn:'Agricultural project equipment and outputs'},
];
const $ = (selector, root=document) => root.querySelector(selector);
function node(tag, className, value) { const el=document.createElement(tag); if(className) el.className=className; if(value!=null) el.textContent=value; return el; }
function text(ar,en) { return language==='en' ? en : ar; }
function get(item,key) { return language==='en' ? item?.[`${key}En`] || item?.[key] || '' : item?.[key] || item?.[`${key}En`] || ''; }
function section(title) { const el=node('section','subpage-section'); el.append(node('h2','',title)); $('#pageContent').append(el); return el; }
function renderAbout() {
  const p=data.profile, intro=section(text('نبذة الجمعية','About the Association'));
  intro.append(node('div','subpage-copy',get(p,'about')));
  const facts=section(text('بيانات أساسية','Key facts')); const grid=node('div','subpage-facts'); facts.append(grid);
  (data.institutionFacts||[]).forEach(fact=>{const card=node('article','subpage-fact');card.append(node('span','',get(fact,'label')),node('strong','',get(fact,'value')));grid.append(card);});
  const identity=section(text('الرؤية والرسالة','Vision and mission')); const cards=node('div','subpage-cards'); identity.append(cards);
  [[text('رؤيتنا','Our vision'),get(p,'vision')],[text('رسالتنا','Our mission'),get(p,'mission')]].forEach(([title,copy])=>{const c=node('article','subpage-card');c.append(node('h2','',title),node('p','',copy));cards.append(c);});
  const values=section(text('قيم الجمعية','Association values')); const list=node('ul','subpage-values'); values.append(list);
  String(get(p,'values')).split(/[؛;،,]/).map(v=>v.trim()).filter(Boolean).slice(0,4).forEach(value=>list.append(node('li','',value)));
  renderBoard();
}
function renderBoard() {
  const s=section(text('مجلس الإدارة','Board of Directors')); const grid=node('div','board-grid');s.append(grid);
  (data.board||[]).forEach(member=>{const card=node('article','board-card');card.append(node('h3','',get(member,'name')),node('p','',get(member,'role')));grid.append(card);});
  const os=section(text('لجنة الرقابة','Supervisory Committee'));const og=node('div','board-grid');os.append(og);
  (data.oversightCommittee||[]).forEach(member=>{const card=node('article','board-card');card.append(node('h3','',get(member,'name')),node('p','',get(member,'role')));og.append(card);});
}
function renderPrograms() {
  const s=section(text('البرامج الاستراتيجية','Strategic programmes'));const grid=node('div','subpage-cards');s.append(grid);
  (data.programs||[]).forEach((program,i)=>{const card=node('article','subpage-card');card.append(node('span','program-number',`${String(i+1).padStart(2,'0')} / ${text('برنامج استراتيجي','STRATEGIC PROGRAMME')}`),node('h2','',get(program,'title')),node('p','',get(program,'description')));grid.append(card);});
}
function renderProjects() {
  const s=section(text('المشاريع والتدخلات','Projects and interventions'));const grid=node('div','subpage-projects');s.append(grid);
  [...(data.projects||[])].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).forEach(project=>{
    const card=node('article','subpage-project');const year=String(project.date||'').slice(0,4);
    const projectImages=[project.image,...(PROJECT_GALLERY_IMAGES[project.id]||[]),...(project.gallery||'').split(/\r?\n/)]
      .map(source=>String(source||'').trim())
      .filter((source,index,sources)=>(source.startsWith('/media/')||source.startsWith('https://'))&&sources.indexOf(source)===index)
      .slice(0,4);
    if(projectImages.length>1){
      const gallery=node('div','subpage-project-gallery');
      projectImages.forEach((source,index)=>{const image=node('img','');image.src=source;image.alt=index===0?get(project,'title'):'';image.loading='lazy';image.decoding='async';gallery.append(image);});
      card.append(gallery);
    } else if(projectImages.length===1){
      const image=node('img','');
      image.src=projectImages[0];
      image.alt=get(project,'title');
      image.loading='lazy';
      image.decoding='async';
      card.append(image);
    }
    card.append(node('span','subpage-pill',get(project,'category')||text('مشروع','Project')));
    if(year) card.append(node('time','',year));
    card.append(node('h2','',get(project,'title')),node('p','',get(project,'description')));
    const link=node('a','detail-link',text('تفاصيل المشروع ←','Project details →'));link.href=`/projects/${encodeURIComponent(project.id)}`;card.append(link);grid.append(card);
  });
}
function renderPartners() {
  const s=section(text('الجهات الواردة في سجل المشاريع','Organizations named in the project portfolio'));
  s.append(node('p','partners-lead',text('تضم القائمة الجهات الممولة والمنفذة والشريكة المذكورة في بيانات المشاريع المنشورة، ولا تعني وحدها وجود اتفاقية شراكة حالية.','This list includes funders, implementers, and partners named in the published project records. Inclusion does not by itself imply a current partnership agreement.')));
  const organizations=language==='en' ? [
    ['ANERA','Funder and project partner'],['Al-Mustaqbal Foundation for Development','Project partner'],['Swedish International Development Cooperation Agency (Sida)','Funder'],['Gaza Culture Group','Implementing partner'],['Islamic Relief Palestine','Implementing partner'],['Islamic Relief USA','Funder'],['GIZ','Funder'],['Oxfam','Project and implementation partner'],['Palestinian Center for Economic and Social Development','Implementing partner'],['Spanish Agency for International Development Cooperation (AECID)','Funder'],['European Union','Funder'],['Rural Women’s Development Society','Implementing partner'],['Taawon (Welfare Association)','Funder'],['Women’s Affairs Center','Project partner'],['Arab Fund for Economic and Social Development – Kuwait','Funder']
  ] : [
    ['أنيرا (ANERA)','جهة ممولة وشريك في المشاريع'],['هيئة المستقبل للتنمية','شريك في تنفيذ مشروع'],['الوكالة السويدية للتعاون الإنمائي الدولي (Sida)','جهة ممولة'],['مجموعة غزة للثقافة','جهة منفذة'],['الإغاثة الإسلامية – فلسطين','جهة منفذة'],['الإغاثة الإسلامية – الولايات المتحدة','جهة ممولة'],['الوكالة الألمانية للتعاون الدولي (GIZ)','جهة ممولة'],['أوكسفام','شريك وجهة منفذة'],['المركز الفلسطيني للتنمية الاقتصادية والاجتماعية','جهة منفذة'],['الوكالة الإسبانية للتعاون الإنمائي (AECID)','جهة ممولة'],['الاتحاد الأوروبي','جهة ممولة'],['جمعية تنمية المرأة الريفية','جهة منفذة'],['مؤسسة التعاون (Taawon)','جهة ممولة'],['مركز شؤون المرأة','شريك في مشروع'],['الصندوق العربي للإنماء الاقتصادي والاجتماعي – الكويت','جهة ممولة']
  ];
  const grid=node('div','subpage-cards');s.append(grid);
  organizations.slice(0,4).forEach(([name,role])=>{const card=node('article','subpage-card');card.append(node('h2','',name),node('p','',role));grid.append(card);});
}
function renderCollection(collection, kind) {
  const titles={news:text('آخر الأخبار والأنشطة','Latest news and activities'),stories:text('حكايات من الميدان','Stories from the field'),gallery:text('صور توثق أنشطة الجمعية ومشاريعها','Photos documenting the Association’s work')};
  const s=section(titles[kind]), grid=node('div',kind==='gallery'?'subpage-gallery':'subpage-cards');s.append(grid);
  const items=kind==='gallery'?[...(data[collection]||[]),...FEATURED_GALLERY_IMAGES]:data[collection]||[];
  items.slice(0,4).forEach((item,index)=>{
    if(kind==='gallery'){
      const figure=node('figure','subpage-gallery-item'),image=node('img','');image.src=item.image||'';image.alt=get(item,'title');image.loading='lazy';image.decoding='async';figure.append(image,node('figcaption','',get(item,'title')));grid.append(figure);return;
    }
    const card=node('article',kind==='stories'?'subpage-card subpage-story':'subpage-card');
    if(item.image){const image=node('img','subpage-card-image');image.src=item.image;image.alt=get(item,'title');image.loading='lazy';image.decoding='async';card.append(image);}
    if(item.date){const time=node('time','subpage-pill',item.date);time.dateTime=item.date;card.append(time);}
    card.append(node('h2','',get(item,'title')));
    const copy=kind==='stories'?get(item,'quote'):get(item,'excerpt');if(copy)card.append(node('p','',copy));
    if(kind==='stories'&&item.attribution)card.append(node('span','subpage-attribution',get(item,'attribution')));
    if(kind==='news'){const link=node('a','detail-link',text('التفاصيل ←','Read more →'));link.href=`/news/${encodeURIComponent(item.id||index+1)}`;card.append(link);}
    grid.append(card);
  });
  if(!items.length)grid.append(node('p','empty-page',text('لا يوجد محتوى منشور في هذا القسم حاليًا.','There is no published content in this section yet.')));
}
function renderSupport(){
  const s=section(text('طرق دعم الجمعية','Ways to support the Association')),grid=node('div','subpage-cards');s.append(grid);
  const options=language==='en'?[['Financial support','Support seeds, supplies, irrigation, and essential agricultural equipment.'],['Strategic partnership','Work with local and international organizations to expand project impact.'],['In-kind support','Contribute equipment, agricultural materials, or environmental project support.']]:[['الدعم المالي','المساهمة في تمويل البذور والإمدادات والري والتجهيزات الأساسية للمشاريع الزراعية.'],['الشراكة الاستراتيجية','التعاون مع المؤسسات المحلية والدولية لتوسيع نطاق المشاريع وتعزيز أثرها.'],['الدعم العيني','المساهمة بالمعدات والمواد الزراعية ودعم مشاريع البيئة والتربة.']];
  options.forEach(([title,copy])=>{const card=node('article','subpage-card');card.append(node('h2','',title),node('p','',copy));grid.append(card);});
  const link=node('a','detail-link',text('تواصل معنا بشأن الدعم ←','Contact us about support →'));link.href='/contact';s.append(link);
}
function renderContact(){
  const s=section(text('بيانات التواصل','Contact information')),p=data.profile||{},grid=node('div','subpage-cards');s.append(grid);
  const fields=[[text('الهاتف','Phone'),p.phone],[text('البريد الإلكتروني','Email'),p.email],[text('العنوان','Address'),get(p,'address')],[text('ساعات العمل','Office hours'),get(p,'officeHours')]];
  fields.filter(([,value])=>value).forEach(([label,value])=>{const card=node('article','subpage-card');card.append(node('span','program-number',label),node('p','',value));grid.append(card);});
  const social=[[text('فيسبوك','Facebook'),p.facebook],[text('إنستغرام','Instagram'),p.instagram],[text('واتساب','WhatsApp'),p.whatsapp]];
  social.filter(([,url])=>url).slice(0,Math.max(0,4-grid.children.length)).forEach(([label,url])=>{const link=node('a','detail-link',`${label} ↗`);link.href=url;link.target='_blank';link.rel='noopener noreferrer';grid.append(link);});
  if(p.mapUrl&&grid.children.length<4){const map=node('a','detail-link',text('افتح الموقع على الخريطة ↗','Open map ↗'));map.href=p.mapUrl;map.target='_blank';map.rel='noopener noreferrer';s.append(map);}
}
const pages={
  about:{title:['من نحن','About CAADE'],intro:['تعرف على الجمعية ورسالتها وقيمها وهيئاتها المنتخبة.','Learn about the Association, its mission, values, and elected bodies.'],render:renderAbout},
  programs:{title:['البرامج الاستراتيجية','Strategic Programmes'],intro:['خمسة برامج مترابطة لدعم التنمية الزراعية والبيئية والصمود المجتمعي.','Five connected programmes support agricultural and environmental development and community resilience.'],render:renderPrograms},
  projects:{title:['المشاريع والتدخلات','Projects and Interventions'],intro:['نماذج من المشاريع المنفذة والشراكات التي دعمت الأسر والمزارعين في غزة.','Selected completed projects and partnerships supporting households and farmers in Gaza.'],render:renderProjects},
  partners:{title:['الشركاء والجهات الداعمة','Partners and Supporting Organizations'],intro:['الجهات الممولة والمنفذة والشريكة الواردة في سجل مشاريع الجمعية.','Funders, implementers, and partners named in the Association’s project portfolio.'],render:renderPartners},
  news:{title:['الأخبار والأنشطة','News and Activities'],intro:['آخر أخبار الجمعية وأنشطتها ومبادراتها.','Updates on the Association’s activities and initiatives.'],render:()=>renderCollection('news','news')},
  stories:{title:['قصص الأثر','Impact Stories'],intro:['قصص وتجارب من أصحابها توثق أثر العمل المجتمعي.','Firsthand stories documenting the impact of community work.'],render:()=>renderCollection('stories','stories')},
  gallery:{title:['معرض الصور','Photo Gallery'],intro:['صور من المشاريع والأنشطة الميدانية للجمعية.','Photos from the Association’s projects and field activities.'],render:()=>renderCollection('gallery','gallery')},
  support:{title:['ادعم الجمعية','Support the Association'],intro:['ساهم في دعم التنمية الزراعية والبيئية وخدمة المجتمع.','Help support agricultural and environmental development and community services.'],render:renderSupport},
  contact:{title:['تواصل معنا','Contact Us'],intro:['نرحب باستفساراتكم ومقترحاتكم وطلبات التعاون.','We welcome your questions, suggestions, and partnership inquiries.'],render:renderContact}
};
function render() {
  const page=pages[pageKey]||pages.about, p=data.profile||{};
  document.documentElement.lang=language;document.documentElement.dir=language==='en'?'ltr':'rtl';
  document.title=`${page.title[language==='en'?1:0]} – ${get(p,'nameEn')||data.name}`;
  $('#pageEyebrow').textContent=text('الجمعية التعاونية للتنمية الزراعية والبيئة – غزة','Cooperative Association for Agricultural Development and Environment – Gaza');
  $('#pageTitle').textContent=page.title[language==='en'?1:0];$('#pageIntro').textContent=page.intro[language==='en'?1:0];
  $('#subpageLogo').alt=text('شعار الجمعية التعاونية للتنمية الزراعية والبيئة – غزة','Logo of the Cooperative Association for Agricultural Development and Environment – Gaza');
  document.querySelectorAll('[data-name]').forEach(el=>el.textContent=language==='en'?(p.nameEn||data.name):data.name);
  document.querySelectorAll('[data-home-label]').forEach(el=>el.textContent=text('الرئيسية','Home'));
  const labels={home:text('الرئيسية','Home'),about:text('من نحن','About'),programs:text('البرامج','Programmes'),projects:text('المشاريع','Projects'),partners:text('الشركاء','Partners'),news:text('الأخبار','News'),stories:text('قصص الأثر','Impact stories'),gallery:text('الصور','Photos'),support:text('ادعمنا','Support'),contact:text('تواصل معنا','Contact')};
  document.querySelectorAll('[data-nav]').forEach(el=>{const k=el.dataset.nav;el.textContent=labels[k];if(k===pageKey)el.setAttribute('aria-current','page');});
  $('#languageToggle').textContent=language==='en'?'العربية':'English';$('#languageToggle').setAttribute('aria-label',language==='en'?'Switch to Arabic':'Switch to English');
  $('#pageContent').replaceChildren();page.render();
}
$('#languageToggle').addEventListener('click',()=>{const target=language==='ar'?'en':'ar';location.href=`/${target}/subpage/${location.search}`;});
loadSiteContent().then(result=>{data=result;render();document.querySelectorAll('a[href^="/"]').forEach(link=>{const href=link.getAttribute('href');if(href.startsWith('/#'))link.href=`/${language}/${href.slice(1)}`;else if(href==='/'||href==='/index.html')link.href=`/${language}/`;else if(/^\/(about|programs|projects|partners|news|stories|gallery|support|contact)\/?$/.test(href)){const page=href.replaceAll('/','');link.href=`/${language}/subpage/?page=${page}`;}else if(/^\/(news|projects)\/[A-Za-z0-9_-]+$/.test(href)){const [,collection,id]=href.split('/');link.href=`/${language}/detail/?collection=${collection}&id=${encodeURIComponent(id)}`;}});}).catch(()=>{$('#pageContent').replaceChildren(node('p','empty-page',text('تعذر تحميل محتوى الصفحة. حاول تحديثها.','Page content could not be loaded. Please refresh.')));});

const subpageMenuToggle=document.querySelector('#subpageMenuToggle');
const subpageNav=document.querySelector('#subpageNav');
if(subpageMenuToggle&&subpageNav){
  const closeSubpageMenu=()=>{subpageNav.classList.remove('is-open');subpageMenuToggle.setAttribute('aria-expanded','false');subpageMenuToggle.setAttribute('aria-label',language==='en'?'Open menu':'فتح القائمة');};
  subpageMenuToggle.addEventListener('click',()=>{const open=subpageMenuToggle.getAttribute('aria-expanded')!=='true';subpageMenuToggle.setAttribute('aria-expanded',String(open));subpageNav.classList.toggle('is-open',open);subpageMenuToggle.setAttribute('aria-label',open?(language==='en'?'Close menu':'إغلاق القائمة'):(language==='en'?'Open menu':'فتح القائمة'));});
  subpageNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeSubpageMenu));
  document.addEventListener('click',event=>{if(!subpageNav.contains(event.target)&&!subpageMenuToggle.contains(event.target))closeSubpageMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeSubpageMenu();});
  document.querySelector('#languageToggle')?.addEventListener('click',closeSubpageMenu);
}
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
