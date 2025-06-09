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

  return (
    <div className="min-h-screen bg-gray-50 layout-container">
      <Sidebar />
      <div className="md:ml-64">
        {shouldShowProgressStepper && (
          <div className="sticky top-0 z-20">
            <ProgressStepper />
          </div>
        )}
        <main className="bg-gray-50">
          {children}
        </main>
      </div>
      
      {/* Debug de persistência - só aparece em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && <DebugPersistenciaCompacto />}
    </div>
  );
}