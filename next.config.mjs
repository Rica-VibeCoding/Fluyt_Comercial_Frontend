import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para desenvolvimento
  reactStrictMode: true,
  
  // Configuração de paths (alias "@" para src)
  webpack: (config, { dev, isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };
    
    // Ignorar completamente a pasta de migração
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      exclude: [
        /node_modules/,
        /src\/migracao/,
        /\.next/
      ],
    });

    // Otimizações para chunks estáveis
    if (dev) {
      // Configuração de chunks mais estável para desenvolvimento
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: false,
            vendors: false,
            // Chunk específico para React
            react: {
              name: 'react',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              priority: 20,
              enforce: true,
            },
            // Chunk para UI components
            ui: {
              name: 'ui',
              chunks: 'all',
              test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
              priority: 15,
              enforce: true,
            },
            // Chunk para vendor libs
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](?!react|react-dom)/,
              priority: 10,
            },
          },
        },
      };
      
      // Cache mais robusto
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        version: '1.0.0',
      };
    }
    
    return config;
  },
  
  // Configurações experimentais otimizadas
  experimental: {
    optimizePackageImports: ['@/components/ui', 'lucide-react'],
  },
  
  // Melhor tratamento de arquivos
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
}

export default nextConfig; 