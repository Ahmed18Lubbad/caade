export const dynamicParams = false;

// Export both supported languages during the static build.
export function generateStaticParams() {
  return [{ lang: 'ar' }, { lang: 'en' }];
}

export default function LanguageLayout({ children }) {
  return children;
}
