import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para desenvolvimento
  reactStrictMode: true,
  
  // Configuração de paths (alias "@" para src)
  webpack: (config) => {
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
    
    // Adicionar uma regra específica para ignorar arquivos de migração
    config.module.rules.unshift({
      test: /src\/migracao/,
      loader: 'ignore-loader'
    });
    
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