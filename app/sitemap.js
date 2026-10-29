const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://caade.vercel.app';
export const dynamic = 'force-static';

export default function sitemap() {
  const paths = ['', 'subpage/?page=about', 'subpage/?page=programs', 'subpage/?page=projects', 'subpage/?page=news', 'subpage/?page=gallery', 'subpage/?page=support', 'subpage/?page=contact'];
  return ['ar', 'en'].flatMap((lang) => paths.map((path, index) => ({
    url: `${siteUrl}/${lang}/${path}`,
    lastModified: new Date(),
    changeFrequency: index === 0 ? 'weekly' : 'monthly',
    priority: index === 0 ? 1 : 0.7,
  })));
}
