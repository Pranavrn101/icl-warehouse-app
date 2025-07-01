// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // This is correct for static site generation.
//   output: 'export',

//   // These are fine to keep.
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
  
//   // This is required for `output: 'export'`.
//   images: {
//     unoptimized: true,
//   },
  
//   // This is optional but fine to keep for static exports.
//   trailingSlash: true,

//   // --- REMOVED THE FOLLOWING PROBLEMATIC LINES ---
//   // assetPrefix: './',  <- This was the main cause of the 404 errors.
//   // basePath: ''        <- This is the default and not needed.
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // This is for your final build, not for development.
  // When running `npm run dev`, this line is ignored.
  output: 'export',

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    unoptimized: true,
  },
  
  trailingSlash: true,

  // ✅ ADD THIS BLOCK TO FIX THE WARNING
  experimental: {
    // Add the URL you use to access the dev server from your tablet/other devices.
    // Make sure the port number matches the one in your browser's address bar.
    allowedDevOrigins: ["http://192.168.1.7:3000", "http://192.168.1.7:3002"],
  },
};

export default nextConfig;