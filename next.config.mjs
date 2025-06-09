/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para desenvolvimento
  reactStrictMode: true,
  
  // Ignorar pasta de migração no build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Configuração de paths (equivalente ao alias "@" do Vite)
  webpack: (config, { dev }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': new URL('./src', import.meta.url).pathname,
    };
    
    // Ignorar pasta de migração
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      exclude: /src\/migracao/,
    });
    
    // Otimizações para desenvolvimento
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          '**/node_modules',
          '**/src/migracao/**',
          '**/.git/**',
          '**/.next/**'
        ]
      };
    }
    
    return config;
  },
  
  // Configurações experimentais
  experimental: {
    typedRoutes: false,
    optimizePackageImports: ['@/components/ui', 'lucide-react'],
  }
}

export default nextConfig; 