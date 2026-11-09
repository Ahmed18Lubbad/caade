const siteName = 'الجمعية التعاونية للتنمية الزراعية والبيئة – غزة';
const siteDescription = 'الجمعية التعاونية للتنمية الزراعية والبيئة في غزة (CAADE): جمعية فلسطينية تدعم المزارعين والأمن الغذائي وسبل العيش والزراعة المستدامة في شمال غزة.';
const siteKeywords = [
  'الجمعية التعاونية للتنمية الزراعية والبيئة',
  'جمعية تعاونية في غزة',
  'جمعية زراعية في غزة',
  'التنمية الزراعية في غزة',
  'دعم المزارعين في غزة',
  'الأمن الغذائي في غزة',
  'الزراعة المستدامة في فلسطين',
  'التعاونيات الزراعية الفلسطينية',
  'CAADE Gaza',
];

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteName,
  alternateName: ['CAADE', 'الجمعية التعاونية للتنمية الزراعية والبيئة في غزة'],
  url: 'https://caade.vercel.app/',
  logo: 'https://caade.vercel.app/media/caade-logo.png',
  description: siteDescription,
  email: 'caade.coop@gmail.com',
  telephone: '+970599807090',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'غزة',
    addressCountry: 'PS',
  },
  areaServed: ['قطاع غزة', 'شمال غزة'],
  knowsAbout: [
    'التنمية الزراعية',
    'العمل التعاوني',
    'الأمن الغذائي',
    'سبل العيش',
    'الزراعة المستدامة',
    'الإدارة البيئية',
  ],
  sameAs: [
    'https://www.facebook.com/p/%D8%A7%D9%84%D8%AC%D9%85%D8%B9%D9%8A%D8%A9-%D8%A7%D9%84%D8%AA%D8%B9%D8%A7%D9%88%D9%86%D9%8A%D8%A9-%D9%84%D9%84%D8%AA%D9%86%D9%85%D9%8A%D8%A9-%D8%A7%D9%84%D8%B2%D8%B1%D8%A7%D8%B9%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D8%A8%D9%8A%D8%A6%D8%A9-%D8%BA%D8%B2%D8%A9-100076959926696',
  ],
};

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://caade.vercel.app'),
  verification: { google: 'pRS-SKDGcrIjB7ECG2lW1Y4HmAE5-sLL5bBQUb6s32I' },
  title: { default: siteName, template: '%s' },
  description: siteDescription,
  keywords: siteKeywords,
  applicationName: siteName,
  alternates: { languages: { ar: '/ar/', en: '/en/' } },
  openGraph: {
    type: 'website',
    locale: 'ar_PS',
    alternateLocale: ['en_US'],
    siteName,
    title: siteName,
    description: siteDescription,
    images: [{ url: '/media/caade-logo.png', width: 800, height: 800, alt: 'شعار الجمعية' }],
  },
  twitter: { card: 'summary_large_image', title: siteName, description: siteDescription, images: ['/media/caade-logo.png'] },
  icons: { icon: [{ url: '/favicon.ico', sizes: 'any' }, { url: '/favicon.png', type: 'image/png' }], apple: '/media/caade-logo.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <link rel="stylesheet" href="/site.css" />
        <link rel="stylesheet" href="/subpage.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
