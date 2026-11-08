/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: { root: __dirname },
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  async redirects() {
    const sections = [
      'about',
      'programs',
      'projects',
      'news',
      'stories',
      'gallery',
      'partners',
      'support',
      'contact',
    ];

    return sections.flatMap((section) => [
      {
        source: `/${section}`,
        destination: `/ar/subpage/?page=${section}`,
        permanent: true,
      },
      {
        source: `/ar/${section}`,
        destination: `/ar/subpage/?page=${section}`,
        permanent: true,
      },
    ]);
  },
};

module.exports = nextConfig;
