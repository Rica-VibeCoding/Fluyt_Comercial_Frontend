'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Usar setTimeout para evitar problemas de hidratação
    const timer = setTimeout(() => {
      router.replace('/painel/clientes');
    }, 100);

    // Cleanup
    return () => {
      clearTimeout(timer);
      setIsLoading(false);
    };
  }, [router]);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-xl font-semibold mb-2 text-gray-800">Sistema Fluyt</div>
        <div className="text-gray-500">Carregando...</div>
      </div>
    </div>
  );
} 