/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker 部署支持
  output: 'standalone',

  turbopack: {
    root: '/workspace',
  },

  allowedDevOrigins: [
    'run-agent-6a2cc0c3cc974039d1dfafbd-mqbqn41t-preview.agent-sandbox-bj-a2-gw.trae.cn',
    '.trae.cn',
    'localhost',
    '127.0.0.1',
  ],

  images: {
    domains: [
      'dash.cloudflare.com',
      'www.google.com',
      'ph-static.imgix.net',
      'app.leonardo.ai'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*'
      },
      {
        source: '/auth/:path*',
        destination: '/auth/:path*'
      }
    ]
  },
  // Cloudflare Pages configuration
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost', 'newkit.site', '.trae.cn', '.agent-sandbox-bj-a2-gw.trae.cn']
    },
    optimizePackageImports: ['lucide-react', 'date-fns', 'lodash']
  }
}

module.exports = nextConfig
