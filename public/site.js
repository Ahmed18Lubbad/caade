// منطق الواجهة العامة: عرض المحتوى، التنقل، الترجمة والتفاعل مع خادم الموقع.
const CAADEImageQuality = Object.freeze({
  validate(image, source, _context, onInvalid = () => {}) {
    if (!(image instanceof HTMLImageElement) || !source) {
      onInvalid();
      return;
    }

    let settled = false;
    const invalid = () => {
      if (settled) return;
      settled = true;
      image.removeEventListener('load', valid);
      image.removeEventListener('error', invalid);
      onInvalid();
    };
    const valid = () => {
      if (settled) return;
      if (!image.naturalWidth || !image.naturalHeight) {
        invalid();
        return;
      }
      settled = true;
      image.removeEventListener('load', valid);
      image.removeEventListener('error', invalid);
      image.dataset.imageQuality = 'valid';
    };

    image.addEventListener('load', valid, { once: true });
    image.addEventListener('error', invalid, { once: true });
    image.src = source;
    if (image.complete) queueMicrotask(() => image.naturalWidth ? valid() : invalid());
  },
});

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const PROJECT_GALLERY_IMAGES = Object.freeze({
  'caade-project-04': [
    '/media/projects/association-activities/activity-07.jpg',
    '/media/projects/association-activities/activity-08.jpg',
    '/media/projects/association-activities/activity-09.jpg',
  ],
  'caade-project-06': [
    '/media/projects/association-activities/activity-17.jpg',
    '/media/projects/association-activities/activity-18.jpg',
    '/media/projects/association-activities/activity-19.jpg',
  ],
  'caade-project-07': [
    '/media/projects/association-activities/activity-35.jpg',
    '/media/projects/association-activities/activity-36.jpg',
    '/media/projects/association-activities/activity-37.jpg',
  ],
  'caade-project-08': [
    '/media/projects/food-assistance/food-05.jpg',
    '/media/projects/food-assistance/food-06.jpg',
    '/media/projects/food-assistance/food-07.jpg',
  ],
  'caade-project-10': [
    '/media/projects/arab-fund-relief/relief-distribution-wide.jpg',
    '/media/projects/arab-fund-relief/relief-food-packs.jpg',
    '/media/projects/arab-fund-relief/relief-family-meal.jpg',
  ],
});
const PROJECT_PHOTO_GALLERY = Object.freeze([
  { image: '/media/projects/arab-fund-relief/relief-distribution-main.jpg', title: 'توزيع المساعدات للأسر في غزة', titleEn: 'Aid distribution to families in Gaza' },
  { image: '/media/projects/arab-fund-relief/relief-distribution-wide.jpg', title: 'مشاهد من مشروع الإغاثة في غزة', titleEn: 'Scenes from the Gaza relief project' },
  { image: '/media/projects/arab-fund-relief/relief-food-packs.jpg', title: 'طرود غذائية للأسر المتضررة', titleEn: 'Food parcels for affected families' },
  { image: '/media/projects/arab-fund-relief/relief-family-meal.jpg', title: 'دعم غذائي للأسر النازحة', titleEn: 'Food support for displaced families' },
  { image: '/media/projects/association-activities/activity-35.jpg', title: 'تجهيزات وحدة التجفيف وإنتاج الزعتر', titleEn: 'Drying unit and zaatar production' },
  { image: '/media/projects/association-activities/activity-36.jpg', title: 'من أنشطة التصنيع الزراعي', titleEn: 'Agricultural processing activities' },
  { image: '/media/projects/association-activities/activity-37.jpg', title: 'معدات ومخرجات المشروع الزراعي', titleEn: 'Agricultural project equipment and outputs' },
]);
const DEFAULT_NAME = document.documentElement.dataset.siteName || 'الجمعية التعاونية للتنمية الزراعية والبيئة – غزة';
const EN_TRANSLATIONS = {
  'تواصل معنا': 'Contact us', 'تعرّف على الجمعية': 'About the association', 'الرئيسية': 'Home', 'من نحن': 'About us', 'نبذة عن الجمعية': 'About the association', 'الرؤية والرسالة': 'Vision and mission', 'الشراكات': 'Partners', 'برامجنا': 'Our programs', 'المشاريع': 'Projects', 'الإعلانات': 'Announcements', 'المعرفة': 'Resources', 'التقارير والحوكمة': 'Reports and governance', 'الأخبار': 'News', 'قصص الأثر': 'Impact stories', 'معرض الصور': 'Photo gallery',   'الإصدارات': 'Publications', 'اتصل بنا': 'Contact', 'كن شريكًا': 'Become a partner', 'ادعمنا': 'Support us', 'لنُعزّز الزراعة': 'To strengthen agriculture', 'والتنمية المستدامة': 'and sustainable development', 'مساهمتكم تُمكّن الجمعية من تنفيذ المزيد من المشاريع الزراعية والبيئية وتحسين حياة الأسر والمجتمعات.': 'Your support enables the association to carry out more agricultural and environmental projects and improve the lives of families and communities.', 'دعم مالي': 'Financial support', 'تمويل البذور، الإمدادات، الري، والتجهيزات الأساسية للمشاريع الزراعية.': 'Funding for seeds, supplies, irrigation, and essential equipment for agricultural projects.', 'اطلب تفاصيل التبرع': 'Request donation details', 'شراكة استراتيجية': 'Strategic partnership', 'تعاون مع مؤسسات محلية ودولية لتوسيع نطاق المشاريع ومضاعفة الأثر.': 'Partner with local and international institutions to expand projects and multiply impact.', 'تواصل مع الإدارة': 'Contact the administration', 'دعم مادي': 'Material support', 'مساهمة في المعدات، المواد الزراعية، أو دعم مشاريع التربة والبيئة.': 'Support through equipment, agricultural materials, or soil and environmental project support.', 'أرسل طلبك اليوم': 'Send your request today', 'البحث': 'Search', 'ابحث داخل الأخبار': 'Search news', 'ابحث عن مشروع أو كلمة مفتاحية': 'Search for a project or keyword', 'كل التصنيفات': 'All categories', 'كل الأنواع': 'All types', 'كل السنوات': 'All years',  'الجمعية التعاونية للتنمية الزراعية والبيئة': 'Agricultural and Environmental Development Cooperative Association', 'معًا نحو': 'Together towards', 'أرضٍ أكثر خضرة': 'a greener land', 'منصة الجمعية للتعريف ببرامجها ومشاريعها ومبادراتها الزراعية والبيئية.': 'The association’s platform for sharing its agricultural and environmental programs, projects, and initiatives.', 'استكشف المشاريع': 'Explore projects', 'التنمية تبدأ من الأرض': 'Development begins with the land', 'وتنمو بالعمل المشترك': 'and grows through collaboration', 'شرائح الواجهة': 'Hero slides', 'الشريحة السابقة': 'Previous slide', 'الشريحة التالية': 'Next slide', 'رسم توضيحي لحقول زراعية ونباتات': 'Illustration of agricultural fields and plants', 'من الميدان': 'From the field', 'أخبار ومبادرات الجمعية': 'Association news and initiatives', 'انتقل إلى الأخبار': 'Go to news', 'نزرع اليوم، لننمو معًا': 'We plant today to grow together', 'اكتشف الموقع': 'Explore the site', 'للتنمية الزراعية والبيئة': 'for Agricultural and Environmental Development', 'اكتشف رؤيتنا': 'Discover our vision', 'رؤيتنا': 'Our vision', 'أضف الرؤية من لوحة إدارة المحتوى.': 'Add the vision in the content management panel.', 'رسالتنا': 'Our mission', 'أضف الرسالة من لوحة إدارة المحتوى.': 'Add the mission in the content management panel.', 'قيمنا': 'Our values', 'أضف القيم من لوحة إدارة المحتوى.': 'Add the values in the content management panel.', 'غزة': 'Gaza',
  'مجالات العمل': 'Areas of work', 'برامج تنموية': 'Development programs', 'قريبة من المجتمع': 'Rooted in the community', 'تُعرض في هذا القسم البرامج والمجالات المعتمدة للجمعية.': 'This section presents the association’s approved programs and areas of work.', 'أثرنا بالأرقام': 'Our impact in numbers', 'مسيرة تنموية': 'A journey of development', 'تُثمر أثرًا': 'creating lasting impact', 'مؤشرات موجزة عن مسيرة الجمعية ومشاريعها وخدمة المجتمع.': 'A snapshot of the association’s journey, projects, and service to the community.', 'عامًا من العمل': 'years of work', 'مشروعًا ومبادرة': 'projects and initiatives', 'مستفيدًا ومستفيدة': 'people reached', 'آخر المستجدات': 'Latest updates', 'الأخبار والفعاليات': 'News and events', 'جميع الأخبار': 'All news', 'قصص من الميدان': 'Stories from the field', 'قصص أثر': 'Impact stories', 'تُروى من أصحابها': 'Told by the people behind them', 'أضف القصص والشهادات بعد موافقة أصحابها واعتماد نصوصها.': 'Add stories and testimonials with the authors’ consent and approved wording.', 'شاركنا قصة': 'Share a story', 'لا توجد قصص منشورة حاليًا.': 'No stories have been published yet.',   'لحظات من الميدان': 'Moments from the field', 'استكشف المعرض': 'Explore the gallery', 'أضف الصور من لوحة إدارة المحتوى.': 'Add photos in the content management panel.', 'صور توثق أنشطة الجمعية ومشاريعها.': 'Photos documenting the Association’s activities and projects.', 'أبرز المشاريع المنفذة': 'Featured projects', 'تُعرض هنا المشاريع والأنشطة التي تضيفها الجمعية.': 'Projects and activities added by the association will appear here.', 'المعرفة والشفافية': 'Knowledge and transparency', 'التقارير والإصدارات': 'Reports and publications', 'أضف التقارير والمواد التعريفية من لوحة إدارة المحتوى.': 'Add reports and information materials in the content management panel.', 'معًا نصنع الأثر': 'Creating impact together', 'الشركاء والداعمون': 'Partners and supporters', 'أضف أسماء الجهات الشريكة وشعاراتها من لوحة إدارة المحتوى.': 'Add partner names and logos in the content management panel.', 'لنعمل معًا': 'Let’s work together', 'من أجل تنمية مستدامة': 'for sustainable development', 'العودة إلى الأعلى': 'Back to top', 'إدارة المحتوى': 'Manage content', 'انتقل إلى المحتوى': 'Skip to content',
  'لا توجد برامج منشورة حاليًا. أضف البرامج من لوحة إدارة المحتوى.': 'No programs yet. Add programs in the content management panel.', 'لا توجد أخبار منشورة حاليًا. أضف الأخبار من لوحة إدارة المحتوى.': 'No news yet. Add news in the content management panel.', 'لا توجد صور منشورة حاليًا. أضف الصور من لوحة إدارة المحتوى.': 'No photos yet. Add photos in the content management panel.', 'لا توجد مشاريع منشورة حاليًا. أضف المشاريع من لوحة إدارة المحتوى.': 'No projects yet. Add projects in the content management panel.', 'لا توجد تقارير منشورة حاليًا. أضف الإصدارات من لوحة إدارة المحتوى.': 'No reports yet. Add publications in the content management panel.', 'ستظهر أسماء الشركاء هنا عند إضافتها.': 'Partner names will appear here once added.', 'أضف نبذة الجمعية من لوحة إدارة المحتوى.': 'Add the association profile in the content management panel.', 'عرض الملف ↗': 'View file ↗', 'أخبار الجمعية': 'Association news', 'اقرأ التفاصيل ←': 'Read more ←', 'التفاصيل ↗': 'Details ↗', 'تابعونا على واتساب': 'Follow us on WhatsApp', 'تابعونا على فيسبوك': 'Follow us on Facebook', 'تابعونا على إنستغرام': 'Follow us on Instagram', 'اتصل بنا': 'Call us', 'البريد الإلكتروني': 'Email', 'العنوان': 'Address',
  'لوحة الموقع': 'Site dashboard', 'إدارة محتوى الموقع': 'Manage website content', 'إغلاق': 'Close', 'بيانات الجمعية': 'Association details', 'الأقسام والمحتوى': 'Sections and content', 'اسم الجمعية': 'Association name', 'شعار الجمعية (JPG أو PNG أو WEBP أو SVG، حتى 8 ميغابايت)': 'Association logo (JPG, PNG, WEBP, or SVG, up to 8 MB)', 'اختر شعارًا بصيغة JPG أو PNG أو WEBP أو SVG.': 'Choose a JPG, PNG, WEBP, or SVG logo.', 'يُحفظ الشعار ويظهر بجانب اسم الجمعية في أعلى الموقع وتذييله.': 'The logo is saved and shown beside the association name in the header and footer.', 'نبذة الجمعية':  'About the association', 'الرؤية': 'Vision', 'الرسالة': 'Mission', 'القيم': 'Values', 'سنوات العمل': 'Years of work', 'المشاريع والمبادرات': 'Projects and initiatives', 'عدد المستفيدين': 'People reached', 'رقم الهاتف': 'Phone number', 'البريد الإلكتروني': 'Email address', 'صفحة فيسبوك': 'Facebook page', 'صفحة إنستغرام': 'Instagram page', 'واتساب': 'WhatsApp', 'حفظ بيانات الجمعية': 'Save association details', 'القسم': 'Section', 'البرامج': 'Programs', 'الأخبار والإعلانات': 'News and announcements', 'قصص الأثر': 'Impact stories', 'معرض الصور': 'Photo gallery', 'المشاريع والأنشطة': 'Projects and activities', 'الشركاء': 'Partners', 'إضافة محتوى': 'Add content', 'حفظ التعديل': 'Save changes', 'إلغاء التعديل': 'Cancel editing', 'تعديل': 'Edit', 'حذف': 'Delete', 'لا يوجد محتوى في هذا القسم بعد. استخدم النموذج أعلاه لإضافة أول عنصر.': 'There is no content in this section yet. Use the form above to add the first item.', 'اكتب اسم الجمعية قبل الحفظ.': 'Enter the association name before saving.', 'جارٍ الحفظ…': 'Saving…', 'تم حفظ بيانات الجمعية بنجاح.': 'Association details saved successfully.', 'تم حفظ البيانات بنجاح': 'Data saved successfully', 'تعذر الحفظ:': 'Unable to save:', 'لم يتم اختيار ملف.': 'No file selected.',
  'المعرفة تنمو': 'Knowledge grows', 'بالعمل المشترك': 'through collaboration', 'تعرّف على مجالات التنمية الزراعية والبيئية من خلال أقسام الموقع.': 'Explore agricultural and environmental development through the sections of this website.', 'برامج ومجالات العمل': 'Programs and areas of work', 'إلى المجتمع': 'to the community', 'تابع الأخبار والأنشطة والمشاريع التي تُنشر عبر المنصة.': 'Follow the news, activities, and projects published on this platform.',
};
Object.assign(EN_TRANSLATIONS, {
  'حالات استفادة أسرية عبر المشاريع': 'household assistance instances across projects',
  'تشمل الأرقام الأسر المستفيدة المسجلة في المشاريع، إضافة إلى 535 مستفيدًا مباشرًا في مشاريع أخرى؛ ولا تمثل أعدادًا موحدة لأشخاص فريدين.': 'These figures include household assistance recorded across projects, plus 535 direct beneficiaries in other projects; they are not deduplicated counts of unique people.',
  'اتصل بنا': 'Contact', 'الاتصال الهاتفي': 'Call us', 'المعرفة تنمو': 'Knowledge grows', 'بالعمل المشترك': 'through collaboration', 'إلى المجتمع': 'to the community',
  'اسم البرنامج': 'Program name', 'نبذة البرنامج': 'Program summary', 'رمز مختصر (اختياري)': 'Short icon (optional)', 'التصنيف': 'Category', 'عنوان الخبر': 'News title', 'ملخص الخبر': 'News summary', 'التاريخ': 'Date', 'رابط التفاصيل': 'Details link', 'رابط الصورة': 'Image URL', 'نص القصة أو الشهادة': 'Story or testimonial', 'اسم صاحب القصة (اختياري)': 'Author (optional)', 'وصف الصورة': 'Image caption', 'رابط صورة الغلاف (اختياري)': 'Cover image URL (optional)', 'عنوان المشروع أو النشاط': 'Project or activity title', 'نبذة': 'Summary', 'رابط الصورة (اختياري)': 'Image URL (optional)', 'رابط التفاصيل (اختياري)': 'Details link (optional)', 'نوع الإصدار': 'Publication type', 'اسم التقرير أو الإصدار': 'Report or publication title', 'وصف مختصر (اختياري)': 'Short description (optional)', 'رابط الملف': 'File URL', 'اسم الشريك': 'Partner name', 'رابط الشريك (اختياري)': 'Partner URL (optional)', 'رابط الشعار (اختياري)': 'Logo URL (optional)', 'رفع صورة (JPG أو PNG أو WEBP، حتى 8 ميغابايت)': 'Upload image (JPG, PNG, or WEBP, up to 8 MB)', 'رفع تقرير PDF (حتى 8 ميغابايت)': 'Upload PDF report (up to 8 MB)', 'تمت إضافة المحتوى.': 'Content added.', 'تم تحديث المحتوى.': 'Content updated.', 'تم حذف العنصر.': 'Item deleted.', 'تم رفع الصورة وإدراج رابطها تلقائيًا. احفظ العنصر لإضافته إلى الموقع.': 'Image uploaded and its link inserted automatically. Save the item to add it to the site.', 'جارٍ رفع الملف…': 'Uploading file…', 'اختر ملف PDF صالحًا.': 'Choose a valid PDF file.', 'اختر صورة JPG أو PNG أو WEBP.': 'Choose a JPG, PNG, or WEBP image.', 'حجم الملف أكبر من 8 ميغابايت.': 'File size exceeds 8 MB.', 'إلغاء': 'Cancel', 'عنصر بلا عنوان': 'Untitled item'
});
Object.assign(EN_TRANSLATIONS, {
  'نعمل معًا من أجل تنمية زراعية وبيئية مستدامة في قطاع غزة.': 'Working together for sustainable agricultural and environmental development in Gaza.', 'فتح القائمة': 'Open menu', 'إغلاق القائمة': 'Close menu', 'الشريحة 1': 'Slide 1', 'الشريحة 2': 'Slide 2', 'الشريحة 3': 'Slide 3', 'العودة للأعلى ↑': 'Back to top ↑', 'مثال: 12+': 'Example: 12+', 'برامج ومجالات العمل': 'Programs and areas of work', 'تابع الأخبار والأنشطة والمشاريع التي تُنشر عبر المنصة.': 'Follow news, activities, and projects published on the platform.',
  'كل التصنيفات': 'All categories', 'الأحدث أولًا': 'Newest first', 'الأقدم أولًا': 'Oldest first', 'نوع المشروع': 'Project type', 'كل الأنواع': 'All types', 'السنة': 'Year', 'كل السنوات': 'All years', 'عرض المزيد': 'Show more', 'عرض أقل': 'Show less', 'لا توجد نتائج مطابقة للفلاتر.': 'No results match these filters.',
  'لنعمل معًا': 'Let’s work together', 'من أجل تنمية مستدامة': 'for sustainable development', 'يسعدنا استقبال استفساراتكم ومقترحاتكم وطلبات الشراكة.': 'We welcome your questions, suggestions, and partnership requests.',
  'موقع الجمعية وساعات العمل': 'Location and office hours', 'افتح الموقع على الخريطة ↗': 'Open location in maps ↗', 'معًا نحو أثر أكبر': 'Together, we can make a greater impact', 'شاركونا استفساراتكم ومقترحاتكم.': 'Share your questions and suggestions with us.', 'ابدأ التواصل': 'Get in touch',
  'ساعات العمل': 'Office hours', 'رابط الموقع على الخريطة': 'Map location URL', 'ساعات العمل (بالإنجليزية)': 'Office hours (English)', 'نص الخبر الكامل': 'Full news story', 'رابط خارجي (اختياري)': 'External link (optional)', 'ترتيب التاريخ': 'Date order', 'اقرأ الخبر كاملًا ←': 'Read full story →', 'تفاصيل المشروع ←': 'Project details →', 'المصدر الخارجي ↗': 'External source ↗', 'رابط خارجي ↗': 'External link ↗', 'عرض 0 من 0 خبر': 'Showing 0 of 0 news items'
});
Object.assign(EN_TRANSLATIONS, {
  'صور الواجهة الرئيسية': 'Homepage images', 'وصف الصورة': 'Image description', 'الصورة السابقة': 'Previous image', 'الصورة التالية': 'Next image',
  'أضف نبذة الجمعية في data/ar.json.': 'Add the association profile in data/en.json.',
  'أضف الرؤية في data/ar.json.': 'Add the vision in data/en.json.',
  'أضف الرسالة في data/ar.json.': 'Add the mission in data/en.json.',
  'أضف القيم في data/ar.json.': 'Add the values in data/en.json.',
  'تعرّف على الجهات التي تدعم عمل الجمعية.': 'Meet the organizations supporting the Association.',
});
const originalTextNodes = new WeakMap();
const originalAttributes = new WeakMap();
const EMPTY_DATA = {
  name: DEFAULT_NAME,
  profile: { logo: '', nameEn: '', about: '', aboutEn: '', vision: '', visionEn: '', mission: '', missionEn: '', values: '', valuesEn: '', statYears: '', statProjects: '', statBeneficiaries: '', phone: '', email: '', address: '', addressEn: '', mapUrl: '', officeHours: '', officeHoursEn: '', facebook: '', instagram: '', whatsapp: '' },
  programs: [], news: [], stories: [], gallery: [], projects: [], partners: [], heroImages: [],
};
let siteData = structuredClone(EMPTY_DATA);
let currentLanguage = location.pathname === '/en' || location.pathname.startsWith('/en/') ? 'en' : 'ar';

const CONTENT_PAGE_SIZE = 4;
let visibleNewsCount = CONTENT_PAGE_SIZE;
let visibleProjectsCount = CONTENT_PAGE_SIZE;
let visibleGalleryCount = 4;
let galleryResizeObserver; let galleryViewItems = [];

function normalizeData(data = {}) {
  const normalized = { ...structuredClone(EMPTY_DATA), ...data };
  normalized.profile = { ...EMPTY_DATA.profile, ...(data.profile || {}) };
  ['programs', 'news', 'stories', 'gallery', 'projects', 'partners', 'heroImages'].forEach(key => { normalized[key] = Array.isArray(data[key]) ? data[key] : []; });
  return normalized;
}

function safeHref(value) {
  const url = String(value || '').trim();
  return /^(https?:\/\/|mailto:|tel:|#|\/media\/)/i.test(url) ? url : '';
}

function safeImage(value) {
  const url = String(value || '').trim();
  return url.startsWith('/media/') || /^https:\/\//i.test(url) ? url : '';
}

function make(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function localized(item, field) {
  if (currentLanguage === 'en') return item?.[`${field}En`] || item?.[field] || '';
  return item?.[field] || item?.[`${field}En`] || '';
}

function imageAlt(item, detailField) {
  const title = String(localized(item, 'title') || '').trim();
  const detail = String(localized(item, detailField) || '').trim().split(/[.!?؟؛]/)[0];
  return [title, detail && detail !== title ? detail : ''].filter(Boolean).join('. ').slice(0, 180);
}

function formatEnglishBrandName(node, text) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) { node.textContent = ''; return; }
  if (words.length < 2) { node.textContent = text; return; }
  const style = getComputedStyle(node);
  const context = document.createElement('canvas').getContext('2d');
  const available = Math.max(1, node.getBoundingClientRect().width || 260);
  const family = style.fontFamily || 'sans-serif';
  const baseSize = parseFloat(style.fontSize) || 10;
  let selected = null;
  for (let size = baseSize; size >= 6.5; size -= .25) {
    context.font = size + 'px ' + family;
    let best = null;
    for (let split = 1; split < words.length; split++) {
      const first = words.slice(0, split).join(' ');
      const second = words.slice(split).join(' ');
      const widest = Math.max(context.measureText(first).width, context.measureText(second).width);
      if (!best || widest < best.widest) best = { first, second, widest };
    }
    selected = { ...best, size };
    if (best.widest <= available) break;
  }
  node.replaceChildren();
  node.style.fontSize = selected.size + 'px';
  for (const line of [selected.first, selected.second]) {
    const span = document.createElement('span');
    span.className = 'brand-name-line';
    span.textContent = line;
    node.append(span);
  }
}
function applyLanguage(root = document.body) {
  const isEnglish = currentLanguage === 'en';
  document.documentElement.lang = isEnglish ? 'en' : 'ar';
  document.documentElement.dir = isEnglish ? 'ltr' : 'rtl';
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const original = originalTextNodes.get(node) ?? node.nodeValue;
    if (!originalTextNodes.has(node)) originalTextNodes.set(node, original);
    const trimmed = original.trim();
    let translated = isEnglish ? (EN_TRANSLATIONS[trimmed] || trimmed) : original;
    if (isEnglish && /^\d+ عنصر$/.test(trimmed)) translated = `${trimmed.match(/^\d+/)[0]} items`;
    if (isEnglish && trimmed === 'لا توجد قصص منشورة حاليًا.') translated = 'No stories have been published yet.';
    node.nodeValue = original.replace(trimmed, translated);
  }
  const elements = root.querySelectorAll ? root.querySelectorAll('[aria-label],[placeholder],[title]') : [];
  elements.forEach(element => {
    const originals = originalAttributes.get(element) || {};
    ['aria-label', 'placeholder', 'title'].forEach(attribute => {
      if (!element.hasAttribute(attribute)) return;
      if (!(attribute in originals)) originals[attribute] = element.getAttribute(attribute);
      const original = originals[attribute];
      const trimmed = original.trim();
      element.setAttribute(attribute, isEnglish ? (EN_TRANSLATIONS[trimmed] || original) : original);
    });
    originalAttributes.set(element, originals);
  });
  document.title = isEnglish ? (siteData.profile.nameEn || 'Agricultural and Environmental Development Cooperative Association – Gaza') : siteData.name;
  const description = $('meta[name="description"]');
  if (description) description.content = isEnglish ? 'Official website of the Agricultural and Environmental Development Cooperative Association.' : `الموقع الرسمي لـ ${siteData.name}`;
  const toggle = $('#languageToggle');
  if (toggle) {
    toggle.textContent = isEnglish ? 'العربية' : 'English';
    toggle.lang = isEnglish ? 'ar' : 'en';
    toggle.setAttribute('aria-label', isEnglish ? 'التبديل إلى العربية' : 'Switch to English');
  }
  const translatedName = isEnglish ? (siteData.profile.nameEn || 'Agricultural and Environmental Development Cooperative Association – Gaza') : siteData.name;
  document.querySelectorAll('[data-organization-name]').forEach(node => {
    if (isEnglish && node.classList.contains('brand-name')) formatEnglishBrandName(node, translatedName);
    else { node.textContent = translatedName; node.style.removeProperty('font-size'); }
  });
}

async function toggleLanguage() {
  const pathname = location.pathname;
  const suffix = /^\/(?:ar|en)(?=\/|$)/.test(pathname) ? pathname.replace(/^\/(?:ar|en)/, '') : pathname;
  const target = currentLanguage === 'ar' ? 'en' : 'ar';
  location.href = `/${target}${suffix || '/'}` + location.search + location.hash;
}

function normalizeLocalLinks(root = document) {
  const prefix = currentLanguage === 'en' ? '/en' : '/ar';
  root.querySelectorAll('a[href^="/"]').forEach(link => {
    const href = link.getAttribute('href');
    if (/^\/(?:ar|en)(?:\/|$)/.test(href) || /^\/(?:media|data|vendor|favicon\.svg|site\.|subpage\.|detail\.)/.test(href)) return;
    if (href === '/') { link.href = `${prefix}/`; return; }
    if (href.startsWith('/#')) { link.href = `${prefix}/${href.slice(1)}`; return; }
    const detail = href.match(/^\/(news|projects)\/([A-Za-z0-9_-]{1,80})$/);
    if (detail) { link.href = `${prefix}/detail/?collection=${detail[1]}&id=${encodeURIComponent(detail[2])}`; return; }
    const page = href.match(/^\/(about|programs|projects|partners|news|stories|gallery|support|contact)\/?$/);
    if (page) link.href = `${prefix}/subpage/?page=${page[1]}`;
  });
}

function updateOrganizationName() {
  document.querySelectorAll('[data-organization-name]').forEach(node => { node.textContent = siteData.name; });
  const watermarkSrc = String(siteData.profile.logo || '').trim();
  document.documentElement.style.setProperty('--site-watermark', watermarkSrc.startsWith('/media/') ? `url("${watermarkSrc}")` : 'none');
  const favicon = $('#siteFavicon');
  const logoSrc = safeImage(siteData.profile.logo);
  if (favicon) {
    favicon.href = logoSrc || '/favicon.svg';
    if (logoSrc) favicon.removeAttribute('type');
    else favicon.type = 'image/svg+xml';
  }
  document.querySelectorAll('.brand-mark').forEach(mark => {
    const src = safeImage(siteData.profile.logo);
    const current = $('img', mark);
    if (src) {
      mark.classList.add('has-logo');
      if (current) current.src = src;
      else { mark.replaceChildren(); const image = make('img'); image.src = src; image.alt = 'شعار الجمعية'; mark.append(image); }
    } else if (current) {
      mark.classList.remove('has-logo');
      mark.replaceChildren();
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 48 48');
      svg.innerHTML = '<path d="M24 40V18M24 28C14 28 9 22 9 14c9 0 15 5 15 14Zm0-8c0-9 5-15 15-15 0 9-5 15-15 15Z"/><path d="M11 39h26M15 35h18"/>';
      mark.append(svg);
    }
  });
  document.title = siteData.name;
  $('meta[name="description"]').content = `الموقع الرسمي لـ ${siteData.name}`;
}

function fillText(id, value, placeholder) {
  const node = document.getElementById(id);
  if (node) node.textContent = value || placeholder;
}

function renderPrograms() {
  const section = document.querySelector('#programs');
  const grid = $('#programGrid');
  grid.replaceChildren();
  if (!siteData.programs.length) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  const track = make('div', 'program-track');
  siteData.programs.slice(0, 4).forEach((item, index) => {
    const card = make('article', 'program-card');
    card.append(make('span', 'program-icon', item.icon || '✳'));
    card.append(make('span', 'program-number', String(index + 1).padStart(2, '0')));
    card.append(make('h3', '', localized(item, 'title')));
    card.append(make('p', '', localized(item, 'description')));
    const link = make('a', '', '↗');
    link.href = '#contact';
    link.setAttribute('aria-label', `${currentLanguage === 'en' ? 'Ask about' : 'استفسر عن'} ${localized(item, 'title')}`);
    card.append(link);
    track.append(card);
  });
  grid.append(track);
  duplicateLoopCards(track);
}

function duplicateLoopCards(track) {
  [...track.children].forEach(card => {
    const copy = card.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelectorAll('a,button,[tabindex]').forEach(node => node.setAttribute('tabindex', '-1'));
    track.append(copy);
  });
}

function createEditorialCard(item, index) {
  const card = make('article', `editorial-card${index === 0 ? ' editorial-feature' : ''}`);
  const art = make('div', `editorial-art ${['art-field', 'art-seed', 'art-harvest'][index % 3]}`);
  const imageSrc = safeImage(item.image);
  if (imageSrc) {
    const image = make('img');
    image.alt = imageAlt(item, 'excerpt') || localized(item, 'title');
    image.loading = 'lazy';
    image.decoding = 'async';
    art.append(image);
    CAADEImageQuality.validate(image, imageSrc, 'card', () => {
      art.replaceChildren(make('span', '', ['✳', '⌁', '❋'][index % 3]));
    });
  } else art.append(make('span', '', ['✳', '⌁', '❋'][index % 3]));
  const copy = make('div', 'editorial-copy');
  copy.append(make('span', 'content-tag', localized(item, 'category') || (currentLanguage === 'en' ? 'Association news' : 'أخبار الجمعية')));
  copy.append(make('h3', '', localized(item, 'title')));
  if (item.date) {
    const date = make('time', 'content-date', item.date);
    date.dateTime = item.date;
    copy.append(date);
  }
  if (localized(item, 'excerpt')) copy.append(make('p', '', localized(item, 'excerpt')));
  const detailLink = make('a', 'detail-link', currentLanguage === 'en' ? 'Read full story →' : 'اقرأ الخبر كاملًا ←');
  detailLink.href = `/news/${encodeURIComponent(item.id)}`;
  copy.append(detailLink);
  const externalUrl = safeHref(item.url);
  if (externalUrl && /^https?:/i.test(externalUrl)) {
    const externalLink = make('a', 'external-link', currentLanguage === 'en' ? 'External source ↗' : 'المصدر الخارجي ↗');
    externalLink.href = externalUrl;
    externalLink.target = '_blank';
    externalLink.rel = 'noopener noreferrer';
    copy.append(externalLink);
  }
  card.append(art, copy);
  return card;
}

function populateFilter(select, values, allLabel) {
  const selected = select.value;
  select.replaceChildren(make('option', '', allLabel));
  select.options[0].value = '';
  values.forEach(([value, label]) => {
    const option = make('option', '', label);
    option.value = value;
    select.append(option);
  });
  if (values.some(([value]) => value === selected)) select.value = selected;
}

function dateValue(value) {
  const timestamp = Date.parse(value || '');
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function matchesSearchTerm(item, query) {
  if (!query) return true;
  const text = [
    item.title, item.titleEn, item.category, item.categoryEn, item.description, item.descriptionEn,
    item.excerpt, item.excerptEn, item.quote, item.quoteEn, item.name, item.nameEn, item.url,
  ].filter(Boolean).join(' ').toLowerCase();
  return text.includes(query.toLowerCase());
}

function renderNews() {
  const grid = $('#newsGrid');
  grid.replaceChildren();
  const section = $('#news');
  const toolbar = $('#newsToolbar');
  const more = $('#newsMore');
  if (!siteData.news.length) {
    section.hidden = true;
    if (toolbar) toolbar.hidden = true;
    more.hidden = true;
    return;
  }
  section.hidden = false;
  if (toolbar) toolbar.hidden = false;
  let filtered = siteData.news.slice();
  if (toolbar) {
    const categories = new Map();
    siteData.news.forEach(item => {
      if (item.category && !categories.has(item.category)) categories.set(item.category, localized(item, 'category') || item.category);
    });
    populateFilter($('#newsCategory'), [...categories], currentLanguage === 'en' ? 'All categories' : 'كل التصنيفات');
    const category = $('#newsCategory').value;
    const searchTerm = $('#newsSearch').value.trim();
    filtered = filtered.filter(item => (!category || item.category === category) && matchesSearchTerm(item, searchTerm));
  }
  filtered.sort((left, right) => dateValue(right.date) - dateValue(left.date));
  if ($('#newsOrder').value === 'oldest') filtered.reverse();
  filtered.slice(0, visibleNewsCount).forEach((item, index) => grid.append(createEditorialCard(item, index)));
  const shown = Math.min(filtered.length, visibleNewsCount);
  const count = $('#newsCount');
  if (count) count.textContent = currentLanguage === 'en' ? shown + ' of ' + filtered.length + ' news items' : 'عرض ' + shown + ' من ' + filtered.length + ' خبر';
  more.hidden = filtered.length <= shown;
}

function renderProjects() {
  const section = document.querySelector('#projects');
  const grid = $('#projectGrid');
  grid.replaceChildren();
  const toolbar = $('#projectToolbar');
  const more = $('#projectMore');
  if (!siteData.projects.length) {
    section.hidden = true;
    if (toolbar) toolbar.hidden = true;
    more.hidden = true;
    return;
  }
  section.hidden = false;
  if (toolbar) toolbar.hidden = false;
  const track = make('div', 'project-track');
  let filtered = siteData.projects.slice().sort((left, right) => dateValue(right.date) - dateValue(left.date));
  if (toolbar) {
    const categories = new Map();
    const years = new Set();
    siteData.projects.forEach(item => {
      if (item.category && !categories.has(item.category)) categories.set(item.category, localized(item, 'category') || item.category);
      const year = /^\d{4}/.exec(item.date || '')?.[0];
      if (year) years.add(year);
    });
    populateFilter($('#projectCategory'), [...categories], currentLanguage === 'en' ? 'All types' : 'كل الأنواع');
    populateFilter($('#projectYear'), [...years].sort((left, right) => right.localeCompare(left)).map(year => [year, year]), currentLanguage === 'en' ? 'All years' : 'كل السنوات');
    const category = $('#projectCategory').value;
    const year = $('#projectYear').value;
    const searchTerm = $('#projectSearch').value.trim();
    filtered = filtered.filter(item => (!category || item.category === category) && (!year || item.date?.startsWith(year)) && matchesSearchTerm(item, searchTerm));
  }
  if (!filtered.length) {
    grid.append(make('p', 'empty-content', currentLanguage === 'en' ? 'No projects match the selected filters.' : 'لا توجد نتائج مطابقة للفلاتر.'));
  }
  filtered.slice(0, 4).forEach(item => {
    const card = make('article', 'project-card');
    const imageSrc = safeImage(item.image);
    const gallerySources = [...(PROJECT_GALLERY_IMAGES[item.id] || []), ...(item.gallery || '').split(/\r?\n/)]
      .map(safeImage).filter(Boolean).filter((source, index, sources) => sources.indexOf(source) === index).slice(0, 3);
    const artwork = make('div', 'project-card-art' + (imageSrc || gallerySources.length ? '' : ' project-card-art--placeholder') + (gallerySources.length ? ' project-card-art--gallery' : ''));
    const appendArtworkImage = (source, alt, isLogo = false) => {
      const image = make('img', isLogo ? 'project-card-logo' : '');
      image.alt = alt;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.fetchPriority = 'low';
      artwork.append(image);
      CAADEImageQuality.validate(image, source, 'card', () => image.remove());
    };
    if (imageSrc) appendArtworkImage(imageSrc, imageAlt(item, 'description') || localized(item, 'title'));
    else {
      artwork.setAttribute('aria-hidden', 'true');
      const logoSrc = safeImage(siteData.profile.logo);
      if (logoSrc) appendArtworkImage(logoSrc, '', true);
      else artwork.append(make('span', 'project-card-placeholder-icon', '✳'));
    }
    gallerySources.forEach(source => appendArtworkImage(source, ''));
    card.append(artwork);
    card.append(make('span', '', localized(item, 'category') || (currentLanguage === 'en' ? 'Project' : 'مشروع')));
    card.append(make('h3', '', localized(item, 'title')));
    if (item.date) card.append(make('time', '', item.date));
    if (localized(item, 'description')) card.append(make('p', '', localized(item, 'description')));
    const detail = make('a', 'detail-link', currentLanguage === 'en' ? 'Project details →' : 'تفاصيل المشروع ←');
    detail.href = '/projects/' + encodeURIComponent(item.id);
    card.append(detail);
    const href = safeHref(item.url);
    if (href && /^https?:/i.test(href)) {
      const link = make('a', 'external-link', currentLanguage === 'en' ? 'External link ↗' : 'رابط خارجي ↗');
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      card.append(link);
    }
    track.append(card);
  });
  grid.append(track);
  if (track.children.length) duplicateLoopCards(track);
  const count = $('#projectCount');
  if (count) count.textContent = currentLanguage === 'en' ? Math.min(filtered.length, 4) + ' of ' + filtered.length + ' projects' : 'عرض ' + Math.min(filtered.length, 4) + ' من ' + filtered.length + ' مشروع';
  more.hidden = true;
}
function renderStories() {
  const section = $('#stories');
  const host = $('#storyList');
  const items = (siteData.stories || []).filter(item => localized(item, 'quote') || localized(item, 'description')).slice(0, 3);
  host.replaceChildren();
  if (!items.length) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  host.classList.add('story-placeholder');
  items.forEach(item => {
    const card = make('article', 'story-card');
    const mark = make('span', 'quote-mark', '“');
    mark.setAttribute('aria-hidden', 'true');
    card.append(mark, make('p', '', localized(item, 'quote') || localized(item, 'description')));
    const attribution = localized(item, 'attribution');
    if (attribution) card.append(make('span', 'story-credit', attribution));
    host.append(card);
  });
}
function renderGallery() {
  const section = $('#gallery');
  const grid = $('#galleryGrid');
  const more = $('#galleryMore');
  grid.replaceChildren();
  const items = (siteData.gallery || []).filter(item => safeImage(item.image));
  if (!items.length) {
    section.hidden = true;
    more.hidden = true;
    return;
  }
  section.hidden = false;
  const track = make('div', 'gallery-track');
  items.slice(0, 4).forEach(item => {
    const tile = make('figure', 'gallery-tile');
    const image = make('img');
    const source = safeImage(item.image);
    image.alt = imageAlt(item, 'title');
    image.loading = 'lazy';
    image.decoding = 'async';
    image.fetchPriority = 'low';
    tile.append(image);
    const caption = localized(item, 'title');
    if (caption) tile.append(make('figcaption', '', caption));
    track.append(tile);
    CAADEImageQuality.validate(image, source, 'gallery', () => image.remove());
  });
  grid.append(track);
  if (track.children.length) duplicateLoopCards(track);
  more.hidden = false;
}
function renderPartners() {
  const grid = $('#partnerGrid');
  grid.replaceChildren();
  if (!siteData.partners.length) {
    $('#partners').hidden = true;
    grid.append(make('p', 'empty-content', 'ستظهر أسماء الشركاء هنا عند إضافتها.'));
    return;
  }
  $('#partners').hidden = false;
  siteData.partners.slice(0, 4).forEach(item => {
    const href = safeHref(item.url);
    const node = href ? make('a', 'partner-logo') : make('div', 'partner-logo');
    if (href) { node.href = href; node.target = '_blank'; node.rel = 'noopener noreferrer'; }
    const logoSrc = safeImage(item.logo);
    if (logoSrc) { const image = make('img'); image.src = logoSrc; image.alt = localized(item, 'name'); image.loading = 'lazy'; image.decoding = 'async'; image.fetchPriority = 'low'; node.append(image); }
    else node.append(make('span', '', localized(item, 'name')));
    grid.append(node);
  });
}

function renderContact() {
  const host = $('#publicContact');
  host.replaceChildren();
  const profile = siteData.profile;
  const locationCard = $('#locationCard');
  const officeHours = localized(profile, 'officeHours');
  const mapUrl = safeHref(profile.mapUrl) || (localized(profile, 'address') ?
    `https://www.google.com/maps/search/?query=${encodeURIComponent(localized(profile, 'address'))}` : '');
  locationCard.hidden = !officeHours && !mapUrl;
  $('#officeHoursText').textContent = officeHours || '';
  const mapLink = $('#mapLink');
  mapLink.hidden = !mapUrl;
  if (mapUrl) mapLink.href = mapUrl;
  const entries = [
    ['phone', 'الاتصال الهاتفي', value => `tel:${value.replace(/[^+\d]/g, '')}`, false, '☎'],
    ['email', 'البريد الإلكتروني', value => `mailto:${value}`, false, '✉'],
    ['address', 'العنوان', () => '', false, '⌖'],
    ['whatsapp', 'تابعونا على واتساب', value => `https://wa.me/${value.replace(/\D/g, '')}`, true, '◉'],
    ['facebook', 'تابعونا على فيسبوك', value => safeHref(value), true, 'f'],
    ['instagram', 'تابعونا على إنستغرام', value => safeHref(value), true, '◎'],
  ];
  let count = 0;
  entries.forEach(([key, label, getHref, isSocial, icon]) => {
    const value = String(key === 'address' ? localized(profile, 'address') : profile[key] || '').trim();
    if (!value) return;
    count++;
    const href = getHref(value);
    const node = href ? make('a', isSocial ? `social-link social-link--${key}` : `contact-entry contact-entry--${key}`) : make('p', `contact-entry contact-entry--${key}`);
    if (href) {
      node.href = href;
      if (isSocial) { node.target = '_blank'; node.rel = 'noopener noreferrer'; }
    }
    const iconNode = make('span', 'contact-icon', icon);
    iconNode.setAttribute('aria-hidden', 'true');
    node.append(iconNode);
    node.append(make('span', '', label));
    if (!isSocial) node.append(make('strong', '', value));
    else node.append(make('span', 'social-arrow', '↗'));
    host.append(node);
  });
  if (!count) host.append(make('p', 'contact-entry', 'أضف بيانات التواصل من لوحة إدارة المحتوى.'));
}

$('#newsCategory').addEventListener('change', () => { visibleNewsCount = CONTENT_PAGE_SIZE; renderNews(); applyLanguage($('#newsToolbar')); });
$('#newsOrder').addEventListener('change', renderNews);
$('#newsSearch').addEventListener('input', () => { visibleNewsCount = CONTENT_PAGE_SIZE; renderNews(); });
$('#newsMore').addEventListener('click', () => { visibleNewsCount += CONTENT_PAGE_SIZE; renderNews(); });
$('#projectCategory')?.addEventListener('change', () => { visibleProjectsCount = CONTENT_PAGE_SIZE; renderProjects(); applyLanguage($('#projectToolbar')); });
$('#projectYear')?.addEventListener('change', () => { visibleProjectsCount = CONTENT_PAGE_SIZE; renderProjects(); applyLanguage($('#projectToolbar')); });
$('#projectSearch')?.addEventListener('input', () => { visibleProjectsCount = CONTENT_PAGE_SIZE; renderProjects(); });
$('#projectMore').addEventListener('click', () => { visibleProjectsCount += CONTENT_PAGE_SIZE; renderProjects(); });

let activeHeroImage = 0;
let heroImageTimer;

function getHeroImages() {
  return (siteData.heroImages || []).map(item => ({ item, src: safeImage(item.image) })).filter(entry => entry.src);
}

function showHeroImage(index) {
  const photos = $$('.hero-photo', $('#heroImageTrack'));
  if (!photos.length) return;
  const dots = $$('.hero-image-dot', $('#heroImageDots'));
  activeHeroImage = (index + photos.length) % photos.length;
  photos.forEach((photo, photoIndex) => {
    const active = photoIndex === activeHeroImage;
    photo.classList.toggle('is-active', active);
    photo.setAttribute('aria-hidden', String(!active));
  });
  dots.forEach((dot, dotIndex) => {
    const active = dotIndex === activeHeroImage;
    dot.classList.toggle('is-active', active);
    dot.setAttribute('aria-pressed', String(active));
  });
}

function restartHeroImageRotation() {
  window.clearInterval(heroImageTimer);
  if ($$('.hero-photo', $('#heroImageTrack')).length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroImageTimer = window.setInterval(() => showHeroImage(activeHeroImage + 1), 5000);
  }
}

function renderHeroImages() {
  const track = $('#heroImageTrack');
  const controls = $('#heroImageControls');
  const dots = $('#heroImageDots');
  if (!track || !controls || !dots) return;
  const images = getHeroImages();
  track.replaceChildren();
  dots.replaceChildren();
  $('.hero').classList.toggle('has-hero-photos', images.length > 0);
  if (!images.length) {
    controls.hidden = true;
    $('#heroLandscape').setAttribute('aria-label', currentLanguage === 'en' ? 'Illustration of agricultural fields and plants' : 'رسم توضيحي لحقول زراعية ونباتات');
    window.clearInterval(heroImageTimer);
    return;
  }
  images.forEach(({ item, src }, index) => {
    const photo = make('div', 'hero-photo');
    const image = make('img');
    image.alt = localized(item, 'title') || (currentLanguage === 'en' ? 'Agricultural project' : 'مشهد زراعي');
    image.loading = index === 0 ? 'eager' : 'lazy';
    image.decoding = 'async';
    if (index > 0) image.fetchPriority = 'low';
    if (index === 0) image.fetchPriority = 'high';
    photo.append(image);
    track.append(photo);
    let dot = null;
    if (images.length > 1) {
      dot = make('button', 'hero-image-dot');
      dot.type = 'button';
      dot.setAttribute('aria-label', currentLanguage === 'en' ? 'Image ' + (index + 1) : 'الصورة ' + (index + 1));
      dot.setAttribute('aria-pressed', 'false');
      dot.addEventListener('click', () => { showHeroImage(index); restartHeroImageRotation(); });
      dots.append(dot);
    }
    CAADEImageQuality.validate(image, src, 'hero', () => {
      photo.remove();
      dot?.remove();
      const remaining = $$('.hero-photo', track).length;
      controls.hidden = remaining < 2;
      dots.hidden = remaining < 2;
      if (!remaining) {
        $('.hero').classList.remove('has-hero-photos');
        $('#heroLandscape').setAttribute('aria-label', currentLanguage === 'en' ? 'Illustration of agricultural fields and plants' : 'رسم توضيحي لحقول زراعية ونباتات');
        window.clearInterval(heroImageTimer);
      } else {
        showHeroImage(Math.min(activeHeroImage, remaining - 1));
        restartHeroImageRotation();
      }
    });
  });
  controls.hidden = images.length < 2;
  $('#heroPattern').setAttribute('aria-label', currentLanguage === 'en' ? 'Agricultural photo carousel' : 'عرض صور زراعية متتابعة');
  showHeroImage(Math.min(activeHeroImage, images.length - 1));
  restartHeroImageRotation();
}

function addSectionPageLinks() {
  const links = [
    ['programs', '/programs', 'استكشف جميع البرامج', 'Explore all programmes'],
    ['news', '/news', 'جميع الأخبار', 'All news'],
    ['stories', '/stories', 'جميع قصص الأثر', 'All impact stories'],
    ['partners', '/partners', 'استعرض الشركاء', 'View partners'],
  ];
  links.forEach(([sectionId, href, labelAr, labelEn]) => {
    const section = $(`#${sectionId}`);
    if (!section || section.hidden) return;
    const existingLink = section.querySelector('.section-page-link');
    if (existingLink) {
      existingLink.textContent = sectionId === 'programs' ? (currentLanguage === 'en' ? 'View more' : '\u0639\u0631\u0636 \u0627\u0644\u0645\u0632\u064a\u062f') : (currentLanguage === 'en' ? labelEn : labelAr);
      return;
    }
    const link = make('a', 'btn button button-outline section-page-link', sectionId === 'programs' ? (currentLanguage === 'en' ? 'View more' : '\u0639\u0631\u0636 \u0627\u0644\u0645\u0632\u064a\u062f') : (currentLanguage === 'en' ? labelEn : labelAr));
    link.href = href;
    section.querySelector('.container')?.append(link);
  });
}

function renderSite() {
  updateOrganizationName();
  fillText('heroTitle', currentLanguage === 'en' ? siteData.profile.nameEn || siteData.nameEn || siteData.name : siteData.name, siteData.name);
  fillText('heroDescription', localized(siteData.profile, 'heroIntro'), '');
  const heroAboutLink = $('#heroAboutLink');
  if (heroAboutLink) heroAboutLink.textContent = currentLanguage === 'en' ? 'Learn more about us →' : 'تعرّف على المزيد ←';
  fillText('aboutCopy', localized(siteData.profile, 'about'), currentLanguage === 'en' ? 'Add the association profile in data/en.json.' : 'أضف نبذة الجمعية في data/ar.json.');
  fillText('visionCopy', localized(siteData.profile, 'vision'), currentLanguage === 'en' ? 'Add the vision in data/en.json.' : 'أضف الرؤية في data/ar.json.');
  fillText('missionCopy', localized(siteData.profile, 'mission'), currentLanguage === 'en' ? 'Add the mission in data/en.json.' : 'أضف الرسالة في data/ar.json.');
  fillText('valuesCopy', localized(siteData.profile, 'values'), currentLanguage === 'en' ? 'Add the values in data/en.json.' : 'أضف القيم في data/ar.json.');
  fillText('statYears', siteData.profile.statYears, '—');
  fillText('statProjects', siteData.profile.statProjects, '—');
  fillText('statBeneficiaries', siteData.profile.statBeneficiaries, '—');
  renderHeroImages();
  renderPrograms(); renderNews(); renderStories(); renderGallery(); renderProjects(); renderPartners(); renderContact();
  addSectionPageLinks();
  for (const sectionId of ['programs', 'news', 'stories', 'gallery', 'projects', 'partners']) {
    const unavailable = $(`#${sectionId}`).hidden;
    document.querySelectorAll(`a[href="#${sectionId}"],a[href="/#${sectionId}"]`).forEach(link => { link.hidden = unavailable; });
  }
  normalizeLocalLinks();
  applyLanguage();
}

const heroSection = $('.hero');
heroSection?.addEventListener('mouseenter', () => window.clearInterval(heroImageTimer));
heroSection?.addEventListener('mouseleave', restartHeroImageRotation);
heroSection?.addEventListener('focusin', () => window.clearInterval(heroImageTimer));
heroSection?.addEventListener('focusout', event => {
  if (!heroSection.contains(event.relatedTarget)) restartHeroImageRotation();
});

const menuButton = $('.menu-toggle');
const mainNav = $('#mainNav');
menuButton?.addEventListener('click', () => {
  const opened = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!opened));
  menuButton.setAttribute('aria-label', opened ? (currentLanguage === 'en' ? 'Open menu' : 'فتح القائمة') : (currentLanguage === 'en' ? 'Close menu' : 'إغلاق القائمة'));
  mainNav?.classList.toggle('is-open', !opened);
  document.body.classList.toggle('menu-open', !opened);
});
mainNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', currentLanguage === 'en' ? 'Open menu' : 'فتح القائمة');
  mainNav?.classList.remove('is-open');
  document.body.classList.remove('menu-open');
}));
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', currentLanguage === 'en' ? 'Open menu' : 'فتح القائمة');
  mainNav?.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  mainNav?.querySelectorAll('details[open]').forEach(item => { item.open = false; });
});

$('#year').textContent = new Date().getFullYear();
$('#languageToggle').addEventListener('click', toggleLanguage);

async function loadSiteData() {
  try {
    siteData = normalizeData(await loadSiteContent());
  } catch (error) {
    console.error('Unable to load site content:', error);
    siteData = normalizeData();
  }
  renderSite();
}

const revealItems = $$('.program-card,.editorial-card,.gallery-tile,.project-placeholder-grid article,.identity-row');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('has-reveal');
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
  }), { threshold: 0.12 });
  revealItems.forEach(item => { item.classList.add('will-reveal'); revealObserver.observe(item); });
}

loadSiteData();
