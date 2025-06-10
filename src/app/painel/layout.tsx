/**
 * Layout do painel REFATORADO
 * Usa app-sidebar.tsx com contexto mantido para compatibilidade
 */

'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { loadSavedTheme, applyTheme } from '../../components/layout/sidebar-themes';

// Context mantido para compatibilidade
const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
  currentTheme: 'light-default',
  setCurrentTheme: () => {},
});

export const useSidebarContext = () => useContext(SidebarContext);

// Usar nossa nova AppSidebar ao invés da antiga
import { AppSidebar } from '../../components/layout/app-sidebar';

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

import { DebugPersistenciaCompacto } from '../../components/shared/debug-persistencia';

// Componente para carregar hooks apenas no cliente
function ClientOnlyPersistence() {
  useEffect(() => {
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light-default');
  
  // Carregar tema salvo e aplicar
  useEffect(() => {
    const savedTheme = loadSavedTheme();
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);
  
  // Não mostrar ProgressStepper nas páginas de sistema
  const shouldShowProgressStepper = !pathname.startsWith('/painel/sistema');

  // Altura real calculada do ProgressStepper
  const progressStepperHeight = 100;

  // Calcular largura da sidebar baseado no estado de collapse
  const sidebarWidth = isCollapsed ? '4rem' : '16rem';

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, currentTheme, setCurrentTheme }}>
      <div className="min-h-screen bg-gray-50 layout-container overflow-hidden">
        <ClientOnlyPersistence />
        
        {/* Wrapper para AppSidebar com contexto personalizado */}
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
          {/* Toggle Button Moderno */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-6 group bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:shadow-md transition-all duration-200 z-50 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
            style={{
              backgroundColor: 'hsl(var(--sidebar-background, 255 255 255))',
              borderColor: 'hsl(var(--sidebar-accent, 240 4.8% 95.9%))',
            }}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 transition-transform group-hover:scale-110" />
            ) : (
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:scale-110" />
            )}
          </button>

          {/* Conteúdo da sidebar simplificado */}
          <AppSidebar />
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
        
        {/* Debug de persistência */}
        {process.env.NODE_ENV === 'development' && <DebugPersistenciaCompacto />}
      </div>
    </SidebarContext.Provider>
  );
}