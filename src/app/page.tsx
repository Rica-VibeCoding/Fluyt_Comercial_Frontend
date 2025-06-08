'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/painel/orcamento/simulador');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-xl font-semibold mb-2">Carregando Sistema Fluyt...</div>
        <div className="text-gray-500">Redirecionando para o simulador...</div>
      </div>
    </div>
  );
} 