const siteName = 'الجمعية التعاونية للتنمية الزراعية والبيئة – غزة';
const siteDescription = 'الموقع الرسمي للجمعية التعاونية للتنمية الزراعية والبيئة في غزة.';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://caade.vercel.app'),
  verification: { google: 'pRS-SKDGcrIjB7ECG2lW1Y4HmAE5-sLL5bBQUb6s32I' },
  title: { default: siteName, template: `%s | ${siteName}` },
  description: siteDescription,
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
