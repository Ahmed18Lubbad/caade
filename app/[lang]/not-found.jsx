'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LanguageNotFound() {
  const lang = usePathname()?.split('/')[1] || 'ar';
  const english = lang === 'en';
  return <main className="not-found" dir={english ? 'ltr' : 'rtl'} lang={lang}><p className="eyebrow">404</p><h1>{english ? 'Page not found' : 'الصفحة غير موجودة'}</h1><p>{english ? 'The page you requested is unavailable.' : 'يمكنك العودة إلى الصفحة الرئيسية ومتابعة تصفح الموقع.'}</p><Link className="button" href={`/${english ? 'en' : 'ar'}/`}>{english ? 'Back to home' : 'العودة إلى الرئيسية'}</Link></main>;
}
