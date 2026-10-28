export const dynamicParams = false;

const seo = {
  ar: {
    title: 'الجمعية التعاونية للتنمية الزراعية والبيئة – غزة',
    description: 'الموقع الرسمي للجمعية التعاونية للتنمية الزراعية والبيئة في غزة.',
  },
  en: {
    title: 'Agricultural and Environmental Development Cooperative Association – Gaza',
    description: 'The official website of the Agricultural and Environmental Development Cooperative Association in Gaza.',
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
    alternates: { canonical: `/${lang}/`, languages: { ar: '/ar/', en: '/en/' } },
    openGraph: { title: content.title, description: content.description, url: `/${lang}/`, locale: lang === 'ar' ? 'ar_PS' : 'en_US' },
  };
}

export default function LanguageLayout({ children }) {
  return children;
}
