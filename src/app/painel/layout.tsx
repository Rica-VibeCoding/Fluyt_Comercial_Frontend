/**
 * Layout do painel REFATORADO
 * Versão limpa sem conflitos de context
 */

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { SidebarProvider, useSidebar } from '../../components/layout/sidebar/core/sidebar-context';
import { ThemeProvider } from '../../components/layout/sidebar/themes/theme-provider';
import { Sidebar } from '../../components/layout/sidebar/core/sidebar';
import { SidebarHeader } from '../../components/layout/sidebar/components/sidebar-header';
import { SidebarMenu } from '../../components/layout/sidebar/components/sidebar-menu';
import { SidebarFooter } from '../../components/layout/sidebar/components/sidebar-footer';
import { SidebarUser } from '../../components/layout/sidebar/components/sidebar-user';
import { menuItems } from '../../components/layout/sidebar/config/menu-config';

// Importar ProgressStepper dinamicamente sem SSR
const ProgressStepper = dynamic(() => import('../../components/layout/progress-stepper').then(mod => ({ default: mod.ProgressStepper })), { 
  ssr: false,
  loading: () => (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Carregando navegação...</div>
        </div>
      </div>
    </div>
  )
});

// import { DebugPersistenciaCompacto } from '../../components/shared/debug-persistencia'; // REMOVIDO

// Componente interno que tem acesso ao context
function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();
  
  // Não mostrar ProgressStepper nas páginas de sistema
  const shouldShowProgressStepper = !pathname.startsWith('/painel/sistema');
  
  // Altura real calculada do ProgressStepper
  const progressStepperHeight = 100;
  
  // Calcular largura da sidebar baseado no estado de collapse
  const sidebarWidth = isCollapsed ? '4rem' : '16rem';

  return (
    <div className="min-h-screen bg-gray-50 layout-container overflow-hidden">
      {/* Sidebar com novo sistema */}
      <div 
        className={`
          hidden md:block fixed left-0 top-0 h-screen overflow-y-auto overflow-x-hidden z-30 border-r
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-64'}
        `}
        style={{
          backgroundColor: 'hsl(var(--sidebar-background, 0 0% 98%))',
          borderColor: 'hsl(var(--sidebar-accent, 240 4.8% 95.9%))',
          color: 'hsl(var(--sidebar-foreground, 240 10% 3.9%))'
        }}
      >
        <Sidebar>
          <SidebarHeader />
          <SidebarMenu items={menuItems} />
          <SidebarFooter>
            <SidebarUser />
          </SidebarFooter>
        </Sidebar>
      </div>
      
      {/* ProgressStepper fixo */}
      {shouldShowProgressStepper && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm transition-all duration-300 md:left-64"
          style={{ 
            left: `${sidebarWidth}` 
          }}
        >
          <ProgressStepper />
        </div>
      )}
      
      <div 
        className="h-screen flex flex-col transition-all duration-300"
        style={{
          marginLeft: sidebarWidth
        }}
      >
        {/* Container de conteúdo */}
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
      
      {/* Debug de persistência - REMOVIDO para produção */}
      {/* {process.env.NODE_ENV === 'development' && <DebugPersistenciaCompacto />} */}
    </div>
  );
}

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ThemeProvider>
        <LayoutContent>{children}</LayoutContent>
      </ThemeProvider>
    </SidebarProvider>
  );
} 