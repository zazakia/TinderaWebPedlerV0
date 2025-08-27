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
  // Enable standalone output for Netlify
  output: 'export',
  // Disable server-side features for static export
  trailingSlash: true,
  // Required for static export
  distDir: 'out',
}

export default nextConfig
