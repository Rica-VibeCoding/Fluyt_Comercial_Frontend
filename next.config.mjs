/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para desenvolvimento
  reactStrictMode: true,
  
  // Ignorar pasta de migração no build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Configuração de paths (equivalente ao alias "@" do Vite)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': new URL('./src', import.meta.url).pathname,
    };
    
    // Ignorar pasta de migração
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      exclude: /src\/migracao/,
    });
    
    return config;
  },
  
  // Configurações experimentais
  experimental: {
    typedRoutes: false, // Removido para evitar conflitos
  },
}

export default nextConfig; 