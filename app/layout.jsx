export const metadata = {
  title: 'الجمعية التعاونية للتنمية الزراعية والبيئة – غزة',
  description: 'الموقع الرسمي للجمعية التعاونية للتنمية الزراعية والبيئة – غزة',
  icons: { icon: '/favicon.svg' },
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
