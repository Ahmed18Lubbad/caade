/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: { root: __dirname },
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
};

module.exports = nextConfig;
