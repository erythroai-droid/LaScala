/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR || '.next',   // lets a verification build run without touching a running dev server
  async headers() {
    return [{ source: '/img/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }] }];
  },
};
export default nextConfig;
