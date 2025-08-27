/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Vercel handles server-side rendering natively
  // No need for static export - let Vercel use full Next.js features
  experimental: {
    // Enable experimental features if needed
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
  // Enable server-side features for Vercel
  trailingSlash: false,
}

export default nextConfig