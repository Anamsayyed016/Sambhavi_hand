/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // middleware.ts matches /api/admin/*; bodies above this are truncated before route handlers.
    // Must cover MAX_VIDEO_BYTES (50 MB) in app/api/admin/media/upload/route.ts plus multipart overhead.
    proxyClientMaxBodySize: '60mb',
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/tcjtyr02/**',
      },
      {
        protocol: 'https',
        hostname: 'images.sambhaviheritagereimagined.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        // Generic collections index removed — category discovery is via Categories mega-menu.
        source: '/collections',
        destination: '/shop',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
