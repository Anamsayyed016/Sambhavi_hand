/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/tcjtyr02/**',
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
