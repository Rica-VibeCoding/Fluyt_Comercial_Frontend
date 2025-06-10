'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrcamentoPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/painel/orcamento/simulador');
  }, [router]);

  return <div>Redirecionando...</div>;
}