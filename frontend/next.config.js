/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    if (dev) {
      // Désactiver le cache disque .pack.gz de Webpack sur Windows (évite les erreurs ENOENT)
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
