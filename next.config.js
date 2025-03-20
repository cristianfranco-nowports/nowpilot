/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  swcMinify: false,
  env: {
    PORT: '4000'
  },
  typescript: {
    // !! WARN !!
    // Ignorar errores de TypeScript en compilación
    ignoreBuildErrors: true,
  },
  experimental: {
    // Desactivar características experimentales que podrían no ser compatibles
    appDir: false,
    serverComponents: false,
  },
};

module.exports = nextConfig; 