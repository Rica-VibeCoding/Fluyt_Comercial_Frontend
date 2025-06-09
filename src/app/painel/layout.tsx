'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '../../components/layout/sidebar';
import { ProgressStepper } from '../../components/layout/progress-stepper';

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Não mostrar ProgressStepper nas páginas de sistema
  const shouldShowProgressStepper = !pathname.startsWith('/painel/sistema');

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        {shouldShowProgressStepper && <ProgressStepper />}
        <main className="bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}