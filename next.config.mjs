/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // ✅ This enables static export (replaces `next export`)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  assetPrefix: './',
  trailingSlash: true, // ensures paths like /warehouse-app/index.html are used
};

export default nextConfig;
