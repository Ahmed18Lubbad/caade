export const dynamicParams = false;

export function generateStaticParams() {
  return [{ lang: 'ar' }, { lang: 'en' }];
}

export default function LanguageLayout({ children }) {
  return children;
}
