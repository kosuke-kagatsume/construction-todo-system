/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@mui/material', '@mui/icons-material', '@mui/x-data-grid'],
  experimental: {
    esmExternals: false,
  },
};

module.exports = nextConfig;