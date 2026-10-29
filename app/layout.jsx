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
  logo: 'https://caade.vercel.app/media/caade-gaza-logo.svg',
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
  title: { default: siteName, template: `%s | ${siteName}` },
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
    images: [{ url: '/media/caade-gaza-logo.svg', width: 900, height: 900, alt: 'شعار الجمعية' }],
  },
  twitter: { card: 'summary_large_image', title: siteName, description: siteDescription, images: ['/media/caade-gaza-logo.svg'] },
  icons: { icon: '/media/caade-gaza-logo.svg' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <link rel="stylesheet" href="/site.css" />
        <link rel="stylesheet" href="/subpage.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
