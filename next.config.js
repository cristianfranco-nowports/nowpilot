/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  experimental: {
    // Desactivar completamente SWC
    forceSwcTransforms: false,
    swcTraceProfiling: false,
  },
  // Forzar el uso de Babel en lugar de SWC
  webpack: (config, { isServer }) => {
    // Usar babel-loader para archivos JS/TS
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      use: 'babel-loader',
      exclude: /node_modules/,
    });
    
    return config;
  },
};

module.exports = nextConfig; 