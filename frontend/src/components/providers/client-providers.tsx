/**
 * Providers que precisam rodar exclusivamente no lado do cliente
 * 
 * Este componente centraliza todos os providers que dependem de APIs do navegador,
 * evitando conflitos de SSR/CSR e garantindo hidratação correta.
 * 
 * Inclui:
 * - QueryClient para gerenciamento de estado servidor
 * - TooltipProvider para componentes de UI
 * - Sistema de notificações (Toaster)
 * - Debug de persistência (apenas em desenvolvimento)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '../ui/tooltip';
import { Toaster } from '../ui/toaster';
import { Toaster as SonnerToaster } from '../ui/sonner';
import { DebugPersistenciaCompacto } from '../shared/debug-persistencia';
import { usePersistenciaBasica } from '../../hooks/globais/use-persistencia-sessao';
import { ErrorBoundary } from '../error-boundary';
// import { FluytProvider } from '@/context/fluyt-context'; // TEMPORARIAMENTE DESABILITADO

// Criar QueryClient uma única vez para evitar recriação em re-renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configurações otimizadas para SSR
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface ClientProvidersProps {
  children: React.ReactNode;
}

/**
 * Componente interno que gerencia a persistência
 * Separado para evitar hooks no componente principal
 */
function PersistenceManager({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  
  // Hook sempre chamado (nunca condicional)
  const persistencia = usePersistenciaBasica();
  
  // Detectar quando estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Persistência só funciona no cliente, mas hook sempre é chamado
  useEffect(() => {
    if (!isClient) return;
    
    // A lógica de persistência já está encapsulada no hook
    // O hook internamente já faz as verificações de SSR
  }, [isClient, persistencia]);
  
  return <>{children}</>;
}

/**
 * Provider principal que encapsula todos os providers client-side
 */
export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {/* <FluytProvider> TEMPORARIAMENTE DESABILITADO */}
            <PersistenceManager>
              {children}
              
              {/* Sistema de notificações */}
              <Toaster />
              <SonnerToaster />
              
              {/* Debug de persistência - TEMPORARIAMENTE DESABILITADO para hidratação */}
              {false && process.env.NODE_ENV === 'development' && (
                <DebugPersistenciaCompacto />
              )}
            </PersistenceManager>
          {/* </FluytProvider> */}
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}