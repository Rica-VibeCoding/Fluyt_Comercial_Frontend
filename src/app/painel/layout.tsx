'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '../../components/layout/sidebar';
import { ProgressStepper } from '../../components/layout/progress-stepper';
import { DebugPersistenciaCompacto } from '../../components/shared/debug-persistencia';
import { usePersistenciaBasica } from '../../hooks/globais/use-persistencia-sessao';

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Ativar persistência automática em todo o painel
  usePersistenciaBasica();
  
  // Não mostrar ProgressStepper nas páginas de sistema
  const shouldShowProgressStepper = !pathname.startsWith('/painel/sistema');

  // Altura real calculada do ProgressStepper:
  // py-6 (48px) + w-12 h-12 icons (48px) + text height (~20px) + border = ~100px
  const progressStepperHeight = 100;

  return (
    <div className="min-h-screen bg-gray-50 layout-container overflow-hidden">
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