export const dynamicParams = false;

const seo = {
  ar: {
    title: 'الجمعية التعاونية للتنمية الزراعية والبيئة – غزة',
    description: 'الجمعية التعاونية للتنمية الزراعية والبيئة في غزة (CAADE): جمعية فلسطينية تدعم المزارعين والأمن الغذائي وسبل العيش والزراعة المستدامة في شمال غزة.',
    keywords: [
      'الجمعية التعاونية للتنمية الزراعية والبيئة',
      'جمعية تعاونية في غزة',
      'جمعية زراعية في غزة',
      'التنمية الزراعية في غزة',
      'دعم المزارعين في غزة',
      'الأمن الغذائي في غزة',
      'الزراعة المستدامة في فلسطين',
      'التعاونيات الزراعية الفلسطينية',
      'CAADE Gaza',
    ],
  },
  en: {
    title: 'Agricultural and Environmental Development Cooperative Association – Gaza',
    description: 'The official website of the Agricultural and Environmental Development Cooperative Association in Gaza.',
    keywords: [
      'Agricultural Cooperative in Gaza',
      'Agricultural and Environmental Development Cooperative Association',
      'sustainable agriculture in Gaza',
      'farmers support in Gaza',
      'food security in Gaza',
      'CAADE Gaza',
    ],
  },
};

// Export both supported languages during the static build.
export function generateStaticParams() {
  return [{ lang: 'ar' }, { lang: 'en' }];
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const content = seo[lang] || seo.ar;
  return {
    title: content.title,
    description: content.description,
    keywords: content.keywords,
    alternates: { canonical: `/${lang}/`, languages: { ar: '/ar/', en: '/en/' } },
    openGraph: { title: content.title, description: content.description, url: `/${lang}/`, locale: lang === 'ar' ? 'ar_PS' : 'en_US' },
  };
}

export default function LanguageLayout({ children }) {
  return children;
}
