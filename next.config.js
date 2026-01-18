/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone',
  trailingSlash: false,
  experimental: {
    serverActions: {
      allowedOrigins: ['get-youtube-transcripts.io', 'localhost:3000'],
    },
  },
};

module.exports = nextConfig;