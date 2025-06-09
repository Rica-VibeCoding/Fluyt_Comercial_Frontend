'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// Importar Sidebar dinamicamente sem SSR para evitar erros de hidratação
const Sidebar = dynamic(() => import('../../components/layout/sidebar').then(mod => ({ default: mod.Sidebar })), { 
  ssr: false,
  loading: () => (
    <div className="hidden border-r bg-gray-50/40 md:block fixed left-0 top-0 h-screen w-64 overflow-y-auto overflow-x-hidden z-30">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-blue-600">
            🏢 Sistema Fluyt
          </h2>
          <p className="px-4 text-sm text-muted-foreground">
            Carregando...
          </p>
        </div>
      </div>
    </div>
  )
});
import { ProgressStepper } from '../../components/layout/progress-stepper';
import { DebugPersistenciaCompacto } from '../../components/shared/debug-persistencia';

// Componente para carregar hooks apenas no cliente
function ClientOnlyPersistence() {
  useEffect(() => {
    // Simples verificação de que estamos no cliente
    console.log('🔧 Persistência ativada no cliente');
  }, []);
  
  return null;
}

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Não mostrar ProgressStepper nas páginas de sistema
  const shouldShowProgressStepper = !pathname.startsWith('/painel/sistema');

  // Altura real calculada do ProgressStepper:
  // py-6 (48px) + w-12 h-12 icons (48px) + text height (~20px) + border = ~100px
  const progressStepperHeight = 100;

  return (
    <div className="min-h-screen bg-gray-50 layout-container overflow-hidden">
      <ClientOnlyPersistence />
      <Sidebar />
      
      {/* ProgressStepper fixo e completamente fora do scroll */}
      {shouldShowProgressStepper && (
        <div className="fixed top-0 left-0 right-0 z-50 md:left-64 bg-white border-b shadow-sm">
          <ProgressStepper />
        </div>
      )}
      
      <div className="md:ml-64 h-screen flex flex-col">
        {/* Container de conteúdo com altura calculada corretamente */}
        <main 
          className="flex-1 bg-gray-50 transition-all duration-300 overflow-y-auto"
          style={{ 
            marginTop: shouldShowProgressStepper ? `${progressStepperHeight}px` : '0',
            height: shouldShowProgressStepper ? `calc(100vh - ${progressStepperHeight}px)` : '100vh'
          }}
        >
          {children}
        </main>
      </div>
      
      {/* Debug de persistência - só aparece em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && <DebugPersistenciaCompacto />}
    </div>
  );
}