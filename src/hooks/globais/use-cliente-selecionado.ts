'use client';

import { useSearchParams } from 'next/navigation';

export const useClienteSelecionado = () => {
  const searchParams = useSearchParams();
  
  const clienteId = searchParams.get('clienteId');
  const clienteNome = searchParams.get('clienteNome');

  const temClienteSelecionado = !!(clienteId && clienteNome);

  const clienteSelecionado = temClienteSelecionado ? {
    id: clienteId,
    nome: decodeURIComponent(clienteNome)
  } : null;

  return {
    clienteId,
    clienteNome: clienteNome ? decodeURIComponent(clienteNome) : null,
    clienteSelecionado,
    temClienteSelecionado
  };
}; 