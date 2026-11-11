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

// Project-specific image fallbacks supplement gallery paths stored in JSON.
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
    { code: 'SDG 1', name: 'القضاء على الفقر', nameEn: 'No Poverty' },
    { code: 'SDG 2', name: 'القضاء على الجوع', nameEn: 'Zero Hunger' },
    { code: 'SDG 8', name: 'العمل اللائق والنمو الاقتصادي', nameEn: 'Decent Work and Economic Growth' },
    { code: 'SDG 12', name: 'الإنتاج والاستهلاك المسؤول', nameEn: 'Responsible Consumption and Production' },
  ],
  'caade-project-09': [
    { code: 'SDG 1', name: 'القضاء على الفقر', nameEn: 'No Poverty' },
    { code: 'SDG 2', name: 'القضاء على الجوع', nameEn: 'Zero Hunger' },
    { code: 'SDG 3', name: 'الصحة الجيدة والرفاه', nameEn: 'Good Health and Well-being' },
  ],
  'caade-project-10': [
    { code: 'SDG 1', name: 'القضاء على الفقر', nameEn: 'No Poverty' },
    { code: 'SDG 2', name: 'القضاء على الجوع', nameEn: 'Zero Hunger' },
    { code: 'SDG 3', name: 'الصحة الجيدة والرفاه', nameEn: 'Good Health and Well-being' },
    { code: 'SDG 10', name: 'الحد من عدم المساواة', nameEn: 'Reduced Inequalities' },
  ],
  'caade-project-11': [
    { code: 'SDG 1', name: 'القضاء على الفقر', nameEn: 'No Poverty' },
    { code: 'SDG 2', name: 'القضاء على الجوع', nameEn: 'Zero Hunger' },
    { code: 'SDG 3', name: 'الصحة الجيدة والرفاه', nameEn: 'Good Health and Well-being' },
    { code: 'SDG 10', name: 'الحد من عدم المساواة', nameEn: 'Reduced Inequalities' },
  ],
});
const DEFAULT_SDGS_BY_ID = Object.freeze({
  'strategic-1': [
    { code: 'SDG 8', name: 'العمل اللائق والنمو الاقتصادي', nameEn: 'Decent Work and Economic Growth' },
    { code: 'SDG 16', name: 'السلام والعدل والمؤسسات القوية', nameEn: 'Peace, Justice and Strong Institutions' },
    { code: 'SDG 17', name: 'الشراكات من أجل تحقيق الأهداف', nameEn: 'Partnerships for the Goals' },
  ],
  'strategic-2': [
    { code: 'SDG 2', name: 'القضاء على الجوع', nameEn: 'Zero Hunger' },
    { code: 'SDG 12', name: 'الإنتاج والاستهلاك المسؤول', nameEn: 'Responsible Consumption and Production' },
    { code: 'SDG 13', name: 'الإجراءات المتعلقة بالمناخ', nameEn: 'Climate Action' },
  ],
  'strategic-3': [
    { code: 'SDG 2', name: 'القضاء على الجوع', nameEn: 'Zero Hunger' },
    { code: 'SDG 8', name: 'العمل اللائق والنمو الاقتصادي', nameEn: 'Decent Work and Economic Growth' },
    { code: 'SDG 9', name: 'الصناعة والابتكار والبنية التحتية', nameEn: 'Industry, Innovation and Infrastructure' },
  ],
  'strategic-4': [
    { code: 'SDG 1', name: 'القضاء على الفقر', nameEn: 'No Poverty' },
    { code: 'SDG 2', name: 'القضاء على الجوع', nameEn: 'Zero Hunger' },
    { code: 'SDG 8', name: 'العمل اللائق والنمو الاقتصادي', nameEn: 'Decent Work and Economic Growth' },
    { code: 'SDG 10', name: 'الحد من عدم المساواة', nameEn: 'Reduced Inequalities' },
  ],
  'strategic-5': [
    { code: 'SDG 6', name: 'المياه النظيفة والصرف الصحي', nameEn: 'Clean Water and Sanitation' },
    { code: 'SDG 12', name: 'الإنتاج والاستهلاك المسؤول', nameEn: 'Responsible Consumption and Production' },
    { code: 'SDG 13', name: 'الإجراءات المتعلقة بالمناخ', nameEn: 'Climate Action' },
    { code: 'SDG 15', name: 'الحياة على الأرض', nameEn: 'Life on Land' },
  ],
  'caade-project-01': [
    { code: 'SDG 1', name: 'القضاء على الفقر', nameEn: 'No Poverty' },
    { code: 'SDG 2', name: 'القضاء على الجوع', nameEn: 'Zero Hunger' },
    { code: 'SDG 3', name: 'الصحة الجيدة والرفاه', nameEn: 'Good Health and Well-being' },
  ],
  'caade-project-02': [
    { code: 'SDG 1', name: 'القضاء على الفقر', nameEn: 'No Poverty' },
    { code: 'SDG 2', name: 'القضاء على الجوع', nameEn: 'Zero Hunger' },
    { code: 'SDG 3', name: 'الصحة الجيدة والرفاه', nameEn: 'Good Health and Well-being' },
  ],
  'caade-project-03': [
    { code: 'SDG 1', name: 'القضاء على الفقر', nameEn: 'No Poverty' },
    { code: 'SDG 2', name: 'القضاء على الجوع', nameEn: 'Zero Hunger' },
    { code: 'SDG 8', name: 'العمل اللائق والنمو الاقتصادي', nameEn: 'Decent Work and Economic Growth' },
  ],
  'caade-project-04': [
    { code: 'SDG 2', name: 'القضاء على الجوع', nameEn: 'Zero Hunger' },
    { code: 'SDG 9', name: 'الصناعة والابتكار والبنية التحتية', nameEn: 'Industry, Innovation and Infrastructure' },
    { code: 'SDG 12', name: 'الإنتاج والاستهلاك المسؤول', nameEn: 'Responsible Consumption and Production' },
  ],
  'caade-project-05': [
    { code: 'SDG 1', name: 'القضاء على الفقر', nameEn: 'No Poverty' },
    { code: 'SDG 2', name: 'القضاء على الجوع', nameEn: 'Zero Hunger' },
    { code: 'SDG 3', name: 'الصحة الجيدة والرفاه', nameEn: 'Good Health and Well-being' },
  ],
  'caade-project-06': [
    { code: 'SDG 1', name: 'القضاء على الفقر', nameEn: 'No Poverty' },
    { code: 'SDG 2', name: 'القضاء على الجوع', nameEn: 'Zero Hunger' },
    { code: 'SDG 3', name: 'الصحة الجيدة والرفاه', nameEn: 'Good Health and Well-being' },
  ],
  'caade-project-07': [
    { code: 'SDG 2', name: 'القضاء على الجوع', nameEn: 'Zero Hunger' },
    { code: 'SDG 8', name: 'العمل اللائق والنمو الاقتصادي', nameEn: 'Decent Work and Economic Growth' },
    { code: 'SDG 9', name: 'الصناعة والابتكار والبنية التحتية', nameEn: 'Industry, Innovation and Infrastructure' },
  ],
  'caade-project-08': [
    { code: 'SDG 1', name: 'القضاء على الفقر', nameEn: 'No Poverty' },
    { code: 'SDG 2', name: 'القضاء على الجوع', nameEn: 'Zero Hunger' },
    { code: 'SDG 3', name: 'الصحة الجيدة والرفاه', nameEn: 'Good Health and Well-being' },
    { code: 'SDG 10', name: 'الحد من عدم المساواة', nameEn: 'Reduced Inequalities' },
  ],
  'caade-project-09': [
    { code: 'SDG 4', name: 'التعليم الجيد', nameEn: 'Quality Education' },
    { code: 'SDG 10', name: 'الحد من عدم المساواة', nameEn: 'Reduced Inequalities' },
    { code: 'SDG 11', name: 'المدن والمجتمعات المستدامة', nameEn: 'Sustainable Cities and Communities' },
  ],
  'caade-project-10': [
    { code: 'SDG 1', name: 'القضاء على الفقر', nameEn: 'No Poverty' },
    { code: 'SDG 2', name: 'القضاء على الجوع', nameEn: 'Zero Hunger' },
    { code: 'SDG 3', name: 'الصحة الجيدة والرفاه', nameEn: 'Good Health and Well-being' },
    { code: 'SDG 10', name: 'الحد من عدم المساواة', nameEn: 'Reduced Inequalities' },
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
  'مشروعًا تم تنفيذه': 'implemented projects',
  'مستفيد مباشر': 'direct beneficiaries',
  'تطوير قدرات': 'Capacity Development',
  'إغاثة طارئة': 'Emergency Relief',
  'تمكين اقتصادي': 'Economic Empowerment',
  'تنمية زراعية': 'Agricultural Development',
  'حماية بيئية': 'Environmental Protection',
  'إغاثة طارئة وتنمية': 'Emergency Relief and Development',
  'دعم مزارعين': 'Farmer Support',
  'استصلاح أراضٍ': 'Land Reclamation',
  'أمن غذائي': 'Food Security',
  'مساعدات غذائية': 'Food Assistance',
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
let visibleGalleryCount = 4;
let galleryResizeObserver; let galleryViewItems = [];

function normalizeData(data = {}) {
  // Provide predictable collection shapes so rendering remains defensive.
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

function uniqueItemsByImage(items) {
  const seen = new Set();
  return items.filter(item => {
    const source = safeImage(item?.image);
    if (!source) return true;
    if (seen.has(source)) return false;
    seen.add(source);
    return true;
  });
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

function getSdgs(item = {}) {
  if (Array.isArray(item.sdgs) && item.sdgs.length) return item.sdgs;
  const fallback = DEFAULT_SDGS_BY_ID[item.id];
  return Array.isArray(fallback) ? fallback : [];
}

function sdgImageUrl(goal) {
  const numeric = String(goal?.code || goal?.id || '').match(/\d+/)?.[0];
  const number = numeric ? Number(numeric) : null;
  if (!number || number < 1 || number > 17) return '';
  return `https://www.un.org/sustainabledevelopment/ar/wp-content/uploads/sites/2/2018/07/A_SDG-goals_icons-individual-rgb-${number}.png`;
}

function formatGoal(goal) {
  if (!goal || typeof goal === 'string') {
    const text = goal || '';
    return text.trim();
  }
  const code = (goal.code || goal.id || '').trim();
  const label = currentLanguage === 'en' ? (goal.nameEn || goal.name || code) : (goal.name || goal.nameEn || code);
  if (!code && !label) return '';
  if (!code || label === code) return label;
  return `${code} • ${label}`;
}

function appendSdgs(container, item) {
  const goals = getSdgs(item);
  if (!goals.length) return;
  const list = make('ul', 'sdg-list');
  const heading = make('li', 'sdg-heading', currentLanguage === 'en' ? 'Sustainable Development Goals' : 'أهداف التنمية المستدامة');
  list.append(heading);
  goals.forEach(goal => {
    const chip = make('li', 'sdg-badge');
    const code = (goal.code || goal.id || '').trim();
    const label = currentLanguage === 'en' ? (goal.nameEn || goal.name || code) : (goal.name || goal.nameEn || code);
    const icon = make('img', 'sdg-badge-icon');
    const iconSrc = sdgImageUrl(goal);
    icon.src = iconSrc || 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
    icon.alt = label || code || 'SDG';
    icon.loading = 'lazy';
    icon.decoding = 'async';
    if (!iconSrc) icon.style.display = 'none';
    else icon.onerror = () => { icon.style.display = 'none'; };
    chip.append(icon);
    chip.title = label || code || 'SDG';
    chip.setAttribute('aria-label', label || code || 'SDG');
    list.append(chip);
  });
  container.append(list);
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
  document.body.classList.toggle('english-layout', isEnglish);
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
  if (description) description.content = isEnglish
    ? 'CAADE is a Palestinian cooperative in Gaza supporting farmers, food security, livelihoods, and sustainable agriculture in North Gaza.'
    : 'الجمعية التعاونية للتنمية الزراعية والبيئة في غزة (CAADE): جمعية فلسطينية تدعم المزارعين والأمن الغذائي وسبل العيش والزراعة المستدامة في شمال غزة.';
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
    if (/^\/(?:ar|en)(?:\/|$)/.test(href) || /^\/(?:media|data|vendor|favicon\.(?:png|ico)|site\.|subpage\.|detail\.)/.test(href)) return;
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
  document.documentElement.style.removeProperty('--site-watermark');
  const favicon = $('#siteFavicon');
  const logoSrc = safeImage(siteData.profile.logo);
  if (favicon) {
    favicon.href = logoSrc || '/favicon.png';
    if (logoSrc) favicon.removeAttribute('type');
    else favicon.type = 'image/png';
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
  const description = $('meta[name="description"]');
  if (description) description.content = 'الجمعية التعاونية للتنمية الزراعية والبيئة في غزة (CAADE): جمعية فلسطينية تدعم المزارعين والأمن الغذائي وسبل العيش والزراعة المستدامة في شمال غزة.';
}

function fillText(id, value, placeholder) {
  const node = document.getElementById(id);
  if (node) node.textContent = value || placeholder;
}

function renderAboutText() {
  const node = document.getElementById('aboutCopy');
  if (!node) return;
  const raw = localized(siteData.profile, 'about') || '';
  const sections = raw.split(/\n\s*\n(?=\d+\.\s)/).filter(Boolean);
  const origin = localized(siteData.profile, 'origin');
  if (origin && sections[1]) {
    sections[1] = `2. ${currentLanguage === 'en' ? 'Establishment and origins' : 'النشأة والتأسيس'}\n\n${origin}`;
  }
  if (!sections.length) {
    fillText('aboutCopy', raw, currentLanguage === 'en' ? 'Add the association profile in data/en.json.' : 'أضف نبذة الجمعية في data/ar.json.');
    return;
  }
  node.innerHTML = sections.map((section, index) => {
    const lines = section.split(/\n+/).map(line => line.trim()).filter(Boolean);
    const heading = lines.shift() || '';
    const paragraphs = lines.map(line => `<p>${line}</p>`).join('');
    const className = index === 1 ? 'about-story-block about-origin-block' : 'about-story-block';
    return `<div class="${className}"><strong>${heading}</strong>${paragraphs}</div>`;
  }).join('');
}


function initImpactCounter() {
  const section = document.querySelector('.impact-band');
  if (!section) return;

  const animateNumber = (elementId, targetVal) => {
    const el = document.getElementById(elementId);
    if (!el || !targetVal) return;
    const rawNumber = parseInt(String(targetVal).replace(/[^0-9]/g, ''), 10);
    if (isNaN(rawNumber)) {
      el.textContent = targetVal;
      return;
    }
    const hasPlus = String(targetVal).includes('+');
    const hasComma = String(targetVal).includes(',');
    const duration = 1600;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(ease * rawNumber);
      let formatted = hasComma ? current.toLocaleString('en-US') : String(current);
      if (hasPlus) formatted += '+';
      el.textContent = formatted;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = targetVal;
      }
    }
    requestAnimationFrame(update);
  };

  let hasAnimated = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        animateNumber('statYears', siteData.profile.statYears);
        animateNumber('statProjects', siteData.profile.statProjects);
        animateNumber('statBeneficiaries', siteData.profile.statBeneficiaries);
        observer.disconnect();
      }
    });
  }, { threshold: 0.25 });

  observer.observe(section);
}

function attachCarouselNav(sectionSelector, gridSelector, trackSelector) {
  const section = document.querySelector(sectionSelector);
  if (!section || section.hidden) return;
  const heading = section.querySelector('.section-heading');
  const grid = section.querySelector(gridSelector);
  if (!heading || !grid) return;
  let nav = heading.querySelector('.carousel-nav');
  if (nav) return;

  nav = make('div', 'carousel-nav');
  nav.setAttribute('aria-label', currentLanguage === 'en' ? 'Carousel controls' : 'التحكم في الشريط');

  const prevBtn = make('button', 'carousel-btn carousel-prev');
  prevBtn.type = 'button';
  prevBtn.setAttribute('aria-label', currentLanguage === 'en' ? 'Previous slide' : 'السابق');
  prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';

  const pauseBtn = make('button', 'carousel-btn carousel-pause');
  pauseBtn.type = 'button';
  pauseBtn.setAttribute('aria-label', currentLanguage === 'en' ? 'Pause movement' : 'إيقاف الحركة');
  pauseBtn.innerHTML = '<svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg><svg class="icon-play" viewBox="0 0 24 24" fill="currentColor" style="display:none"><polygon points="7 4 19 12 7 20 7 4"/></svg>';

  const nextBtn = make('button', 'carousel-btn carousel-next');
  nextBtn.type = 'button';
  nextBtn.setAttribute('aria-label', currentLanguage === 'en' ? 'Next slide' : 'التالي');
  nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';

  nav.append(prevBtn, pauseBtn, nextBtn);
  heading.append(nav);

  let isPaused = false;
  pauseBtn.addEventListener('click', () => {
    const track = grid.querySelector(trackSelector);
    if (!track) return;
    isPaused = !isPaused;
    track.style.animationPlayState = isPaused ? 'paused' : 'running';
    pauseBtn.querySelector('.icon-pause').style.display = isPaused ? 'none' : 'block';
    pauseBtn.querySelector('.icon-play').style.display = isPaused ? 'block' : 'none';
    pauseBtn.setAttribute('aria-label', isPaused ? (currentLanguage === 'en' ? 'Resume movement' : 'استئناف الحركة') : (currentLanguage === 'en' ? 'Pause movement' : 'إيقاف الحركة'));
  });

  const shiftTrack = (direction) => {
    const track = grid.querySelector(trackSelector);
    if (!track || !track.firstElementChild) return;
    track.style.animationPlayState = 'paused';
    pauseBtn.querySelector('.icon-pause').style.display = 'none';
    pauseBtn.querySelector('.icon-play').style.display = 'block';
    isPaused = true;

    const cardWidth = track.firstElementChild.getBoundingClientRect().width + 18;
    const isRtl = document.documentElement.dir !== 'ltr' && !document.body.classList.contains('english-layout');
    const delta = direction === 'next' ? (isRtl ? cardWidth : -cardWidth) : (isRtl ? -cardWidth : cardWidth);

    const computed = window.getComputedStyle(track);
    let currentX = 0;
    if (computed.transform && computed.transform !== 'none') {
      const matrix = computed.transform.match(/matrix.*\((.+)\)/);
      if (matrix) {
        const parts = matrix[1].split(',');
        currentX = parseFloat(parts[4]) || 0;
      }
    }
    track.style.animation = 'none';
    track.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    track.style.transform = 'translateX(' + (currentX + delta) + 'px)';
  };

  nextBtn.addEventListener('click', () => shiftTrack('next'));
  prevBtn.addEventListener('click', () => shiftTrack('prev'));
}

function initScrollReveal() {
  const elements = document.querySelectorAll('.intro-section, .identity-panel, .impact-band, .program-section, .news-section, .projects-section, .gallery-section, .partners-section, .support-section, .footer-contact');
  elements.forEach(el => el.classList.add('reveal-on-scroll'));

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));
  } else {
    elements.forEach(el => el.classList.add('is-revealed'));
  }
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
  const programItems = currentLanguage === 'en' ? siteData.programs : siteData.programs.slice(0, 4);
  programItems.forEach((item, index) => {
    const card = make('article', 'program-card');
    card.append(make('span', 'program-icon', item.icon || '✳'));
    card.append(make('span', 'program-number', String(index + 1).padStart(2, '0')));
    card.append(make('h3', '', localized(item, 'title')));
    card.append(make('p', '', localized(item, 'description')));
    appendSdgs(card, item);
    const link = make('a', '', '↗');
    link.href = '#contact';
    link.setAttribute('aria-label', `${currentLanguage === 'en' ? 'Ask about' : 'استفسر عن'} ${localized(item, 'title')}`);
    card.append(link);
    track.append(card);
  });
  grid.append(track);
  duplicateLoopCards(track);
  attachCarouselNav('#programs', '#programGrid', '.program-track');
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
  const card = make('article', 'editorial-card');
  const art = make('div', 'editorial-art');
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
  const section = $('#news');
  const grid = $('#newsGrid');
  grid.replaceChildren();
  if (!siteData.news.length) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  const track = make('div', 'editorial-track');
  const newsItems = uniqueItemsByImage(siteData.news);
  newsItems.forEach((item, index) => {
    track.append(createEditorialCard(item, index));
  });
  grid.append(track);
  attachCarouselNav('#news', '#newsGrid', '.editorial-track');
}

function renderProjects() {
  // Render a compact project preview; the dedicated subpage contains the full collection.
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
  const projectItems = uniqueItemsByImage(currentLanguage === 'en' ? filtered : filtered.slice(0, 4));
  const usedProjectImages = new Set();
  projectItems.forEach(item => {
    const card = make('article', 'project-card');
    let imageSrc = safeImage(item.image);
    if (imageSrc && usedProjectImages.has(imageSrc)) imageSrc = '';
    if (imageSrc) usedProjectImages.add(imageSrc);
    const gallerySources = [...(PROJECT_GALLERY_IMAGES[item.id] || []), ...(item.gallery || '').split(/\r?\n/)]
      .map(safeImage).filter(Boolean).filter((source, index, sources) => sources.indexOf(source) === index)
      .filter(source => !usedProjectImages.has(source)).slice(0, 1);
    if (imageSrc) gallerySources.length = 0;
    gallerySources.forEach(source => usedProjectImages.add(source));
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
    appendSdgs(card, item);
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
  attachCarouselNav('#projects', '#projectGrid', '.project-track');
  const count = $('#projectCount');
  if (count) count.textContent = currentLanguage === 'en' ? projectItems.length + ' of ' + filtered.length + ' projects' : 'عرض ' + Math.min(filtered.length, 4) + ' من ' + filtered.length + ' مشروع';
  more.hidden = false;
}
function renderStories() {
  const section = $('#stories');
  const host = $('#storyList');
  if (!host) return;
  const items = (siteData.stories || []).filter(item => localized(item, 'quote') || localized(item, 'description') || localized(item, 'title')).slice(0, 3);
  host.replaceChildren();
  if (!items.length) {
    if (section) {
      section.hidden = true;
      section.setAttribute('hidden', '');
      section.style.display = 'none';
    }
    return;
  }
  if (section) {
    section.hidden = false;
    section.removeAttribute('hidden');
    section.style.removeProperty('display');
  }
  host.classList.add('story-placeholder');
  items.forEach(item => {
    const card = make('article', 'story-card');
    const mark = make('span', 'quote-mark', '“');
    mark.setAttribute('aria-hidden', 'true');
    card.append(mark, make('p', '', localized(item, 'quote') || localized(item, 'description') || localized(item, 'title')));
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
  const galleryItems = currentLanguage === 'en' ? items : items.slice(0, 4);
  galleryItems.forEach(item => {
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
  if (track.children.length) {
    duplicateLoopCards(track);
    track.style.setProperty('--carousel-duration', `${Math.max(90, galleryItems.length * 18)}s`);
  }
  attachCarouselNav('#gallery', '#galleryGrid', '.gallery-track');
  more.hidden = false;
}
function renderPartners() {
  const grid = $('#partnerGrid');
  grid.replaceChildren();
  // Deduplicate partners by unique logo and id so no logo ever repeats
  const seen = new Set();
  const partners = (siteData.partners || []).filter(item => {
    if (!item || !item.logo) return false;
    const key = (item.logo || '') + '|' + (item.id || '');
    if (seen.has(item.logo) || seen.has(key)) return false;
    seen.add(item.logo);
    seen.add(key);
    return true;
  });
  if (!partners.length) {
    $('#partners').hidden = true;
    grid.append(make('p', 'empty-content', 'ستظهر أسماء الشركاء هنا عند إضافتها.'));
    return;
  }
  $('#partners').hidden = false;
  partners.forEach(item => {
    const href = safeHref(item.url);
    const node = href ? make('a', `partner-logo partner-${item.id}`) : make('div', `partner-logo partner-${item.id}`);
    if (href) { node.href = href; node.target = '_blank'; node.rel = 'noopener noreferrer'; }
    const logoSrc = safeImage(item.logo);
    if (logoSrc) { const image = make('img'); image.src = logoSrc; image.alt = localized(item, 'name'); image.loading = 'lazy'; image.decoding = 'async'; image.fetchPriority = 'low'; node.append(image); }
    else node.append(make('span', '', localized(item, 'name')));
    grid.append(node);
  });
}

// Renders the footer contact cards from the localized profile data.
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
  const whatsappEntry = entries.find(([key]) => key === 'whatsapp');
  if (whatsappEntry) whatsappEntry[1] = currentLanguage === 'en' ? 'Contact us via WhatsApp' : 'تواصل معنا عبر واتساب';
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
$('#projectCategory')?.addEventListener('change', () => { renderProjects(); applyLanguage($('#projectToolbar')); });
$('#projectYear')?.addEventListener('change', () => { renderProjects(); applyLanguage($('#projectToolbar')); });
$('#projectSearch')?.addEventListener('input', renderProjects);
$('#projectMore').addEventListener('click', () => {
  window.location.href = `/${currentLanguage}/subpage/?page=projects`;
});

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

function positionHeroImageControls() {
  const controls = $('#heroImageControls');
  if (!controls) return;
  controls.style.removeProperty('top');
  controls.style.removeProperty('bottom');
  controls.style.removeProperty('left');
  controls.style.removeProperty('right');
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
  positionHeroImageControls();
}

window.addEventListener('resize', positionHeroImageControls, { passive: true });

function addSectionPageLinks() {
  const links = [
    ['programs', '/programs', 'استكشف جميع البرامج', 'Explore all programmes'],
    
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

function applyEnglishHomepageLabels() {
  if (currentLanguage !== 'en') return;
  const set = (selector, value) => { const element = document.querySelector(selector); if (element) element.textContent = value; };
  const setAll = (selector, values) => document.querySelectorAll(selector).forEach((element, index) => { if (values[index] !== undefined) element.textContent = values[index]; });
  set('.skip-link', 'Skip to content');
  set('.header-utility-links a[data-nav="news"]', 'News');
  set('.header-utility-links a[data-nav="contact"]', 'Contact us');
  set('.main-nav > a[href="#home"]', 'Home');
  set('.main-nav .nav-dropdown:nth-of-type(1) summary', 'About us');
  setAll('.main-nav .nav-dropdown:nth-of-type(1) .dropdown-panel a', ['About the Association', 'Vision and mission']);
  set('.main-nav > a[href="/#programs"]', 'Programmes');
  set('.main-nav > a[href="/#projects"]', 'Projects');
  set('.main-nav .nav-dropdown:nth-of-type(2) summary', 'News & media');
  document.querySelectorAll('.main-nav .nav-dropdown:nth-of-type(2) .dropdown-panel a').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.includes('news')) link.textContent = 'News';
      else if (href.includes('stories')) link.textContent = 'Impact stories';
      else if (href.includes('gallery')) link.textContent = 'Photo gallery';
    });
  set('.main-nav > a[href="/partners"]', 'Partners');
  set('.nav-cta', 'Become a partner ↗');
  set('.hero-landscape', '');
  set('.feature-kicker', 'From the field');
  set('.feature-card strong', 'Association news and initiatives');
  document.querySelector('.feature-card a')?.setAttribute('aria-label', 'Go to news');
  set('.visual-note', 'We plant today, to grow together');
  set('.impact-heading .eyebrow', 'Our impact in numbers');
  set('.impact-heading h2', 'A journey of development');
  const impactTitle = document.querySelector('.impact-heading h2'); if (impactTitle) impactTitle.innerHTML = 'A journey of development <em>creating lasting impact</em>';
  set('.impact-heading > p:last-child', 'Key highlights of the Association’s journey, projects, and community service.'); set('#impactNote', 'Covers 11 development and relief projects implemented with a 100% completion rate (2022–2026) in partnership with international and local partners, with total funding of approximately $564K and 10,471 direct beneficiaries.');
  setAll('.impact-label', ['Years of work', 'Implemented projects', 'Direct beneficiaries']);
  set('.program-section .eyebrow', 'Areas of work'); set('.program-section h2', 'Strategic programmes'); set('.program-section .section-summary', 'This section presents the Association’s approved programmes and areas of work.');
  set('.news-section .eyebrow', 'Latest updates'); set('.news-section h2', 'News and events');
  set('.projects-section .eyebrow', 'Our projects'); set('.projects-section h2', 'Featured projects'); set('.projects-section .section-summary', 'Projects and activities added by the Association will appear here.'); set('#projectMore', 'Show more');
  set('.support-section .eyebrow', 'Support us'); set('.support-section h2', 'To strengthen agriculture'); const supportTitle = document.querySelector('.support-section h2'); if (supportTitle) supportTitle.innerHTML = 'To strengthen agriculture<br><em>and sustainable development</em>'; set('.support-section .section-summary', 'Your support enables the Association to carry out more agricultural and environmental projects and improve the lives of families and communities.');
  setAll('.stories-heading .eyebrow, .stories-heading h2, .stories-heading > p, .stories-heading a, .story-placeholder p', ['Stories from the field', 'Impact stories', 'Told by the people behind them', 'Add stories and testimonials with the authors’ consent and approved wording.', 'Share a story', 'No stories have been published yet.']);
  set('.gallery-section .eyebrow', 'Moments from the field'); set('.gallery-section h2', 'Photo gallery'); set('.gallery-section .text-link', 'Explore the gallery ←'); set('#galleryMore', 'View more'); set('.gallery-section .section-footnote', 'Photos documenting the Association’s activities and projects.');
  set('.partners-section .eyebrow', 'Creating impact together'); set('.partners-section h2', 'Partners and supporters'); set('.partners-section .section-summary', 'Partner names and logos added through the content management panel will appear here.');
  document.querySelector('.partner-slots')?.setAttribute('aria-label', 'Association partners');
  document.querySelector('.footer-sitemap nav')?.setAttribute('aria-label', 'Site map');
  set('.footer-identity > p', 'Through Cooperation, We Produce | Through Solidarity, We Grow | Through Sustainability, We Thrive');
  const footerLabelMap = {
      '#home': 'Home', '/en': 'Home', '/': 'Home',
      'about': 'About us', 'programs': 'Programmes', 'projects': 'Projects',
      'news': 'News', 'stories': 'Impact stories', 'gallery': 'Photo gallery',
      'partners': 'Partners', 'support': 'Support us', 'contact': 'Contact us'
    };
    document.querySelectorAll('.footer-sitemap nav a').forEach(link => {
      const href = link.getAttribute('href') || '';
      for (const [key, label] of Object.entries(footerLabelMap)) {
        if (href === key || (key !== '/' && href.includes(key))) {
          link.textContent = label;
          break;
        }
      }
    });
  set('.footer-contact .eyebrow', 'Contact us'); set('#footerContactTitle', 'Let’s work together'); set('.footer-contact-heading > p', 'We welcome your questions, suggestions, and partnership requests.');
 set('.location-card h3', 'Location and office hours'); set('#mapLink', 'Open location in maps ↗'); set('.footer-bottom a', 'Back to top ↑');
}

function renderSite() {
  updateOrganizationName();
  fillText('heroTitle', currentLanguage === 'en' ? siteData.profile.nameEn || siteData.nameEn || siteData.name : siteData.name, siteData.name);
  const heroTitle = $('#heroTitle');
  if (heroTitle && currentLanguage === 'ar') {
    const title = heroTitle.textContent.trim();
    const breakMarker = ' للتنمية ';
    const breakIndex = title.indexOf(breakMarker);
    if (breakIndex > 0) {
      const firstLine = document.createElement('span');
      const secondLine = document.createElement('span');
      firstLine.className = 'hero-title-line';
      secondLine.className = 'hero-title-line';
      firstLine.textContent = title.slice(0, breakIndex + breakMarker.length).trim();
      secondLine.textContent = title.slice(breakIndex + breakMarker.length).trim();
      heroTitle.replaceChildren(
        firstLine,
        document.createElement('br'),
        secondLine,
      );
    }
  }
  fillText('heroDescription', localized(siteData.profile, 'heroIntro'), '');
  const heroAboutLink = $('#heroAboutLink');
  if (heroAboutLink) heroAboutLink.textContent = currentLanguage === 'en' ? 'Learn more about us →' : 'تعرّف على المزيد ←';
  renderAboutText();
  fillText('visionCopy', localized(siteData.profile, 'vision'), currentLanguage === 'en' ? 'Add the vision in data/en.json.' : 'أضف الرؤية في data/ar.json.');
  fillText('missionCopy', localized(siteData.profile, 'mission'), currentLanguage === 'en' ? 'Add the mission in data/en.json.' : 'أضف الرسالة في data/ar.json.');
  fillText('valuesCopy', localized(siteData.profile, 'values'), currentLanguage === 'en' ? 'Add the values in data/en.json.' : 'أضف القيم في data/ar.json.');
  fillText('statYears', siteData.profile.statYears, '—');
  fillText('statProjects', siteData.profile.statProjects, '—');
  fillText('statBeneficiaries', siteData.profile.statBeneficiaries, '—');
  renderHeroImages();
  renderPrograms(); renderNews(); renderStories(); renderGallery(); renderProjects(); renderPartners(); renderContact();
  addSectionPageLinks();
  const sectionsToCheck = [
    { id: 'programs', count: (siteData.programs || []).length },
    { id: 'news', count: (siteData.news || []).length },
    { id: 'stories', count: (siteData.stories || []).filter(item => localized(item, 'quote') || localized(item, 'description') || localized(item, 'title')).length },
    { id: 'gallery', count: (siteData.gallery || []).filter(item => safeImage(item.image)).length },
    { id: 'projects', count: (siteData.projects || []).length },
    { id: 'partners', count: (siteData.partners || []).length },
  ];
  sectionsToCheck.forEach(({ id, count }) => {
    const section = $(`#${id}`);
    const hasData = count > 0;
    if (section) {
      section.hidden = !hasData;
      if (!hasData) {
        section.setAttribute('hidden', '');
        section.style.display = 'none';
      } else {
        section.removeAttribute('hidden');
        section.style.removeProperty('display');
      }
    }
    const linkSelectors = [
      `a[href="#${id}"]`,
      `a[href="/#${id}"]`,
      `a[href="/en#${id}"]`,
      `a[href="/${id}"]`,
      `a[href="/${id}/"]`,
      `a[href="/en/${id}"]`,
      `a[href="/en/${id}/"]`,
      `a[href*="page=${id}"]`,
      `[data-nav="${id}"]`,
    ];
    document.querySelectorAll(linkSelectors.join(',')).forEach(link => {
      link.hidden = !hasData;
      if (!hasData) {
        link.setAttribute('hidden', '');
        link.style.display = 'none';
      } else {
        link.removeAttribute('hidden');
        link.style.removeProperty('display');
      }
    });
  });

  document.querySelectorAll('.main-nav .nav-dropdown, .subpage-nav .subpage-nav-dropdown').forEach(dropdown => {
    const childLinks = [...dropdown.querySelectorAll('.dropdown-panel a, div a')];
    const visibleLinks = childLinks.filter(l => !l.hidden && l.style.display !== 'none');
    if (childLinks.length > 0 && visibleLinks.length === 0) {
      dropdown.hidden = true;
      dropdown.style.display = 'none';
      dropdown.setAttribute('hidden', '');
    } else {
      dropdown.hidden = false;
      dropdown.style.removeProperty('display');
      dropdown.removeAttribute('hidden');
    }
  });
  normalizeLocalLinks();
  applyLanguage();
  applyEnglishHomepageLabels();
  initImpactCounter();
  initScrollReveal();
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
const sectionRevealItems = $$('main > section:not(.hero)');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('has-reveal','has-section-reveal');
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
  }), { threshold: 0.12 });
  revealItems.forEach(item => { item.classList.add('will-reveal'); revealObserver.observe(item); });
  sectionRevealItems.forEach(item => { item.classList.add('will-reveal-section'); revealObserver.observe(item); });
}

loadSiteData();
