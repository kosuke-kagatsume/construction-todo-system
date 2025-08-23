/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  transpilePackages: ['@mui/material', '@mui/icons-material', '@mui/x-data-grid'],
  experimental: {
    esmExternals: false,
  },
};

module.exports = nextConfig;