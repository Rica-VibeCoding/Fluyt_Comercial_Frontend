/**
 * Sidebar principal - orchestrator dos componentes
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SidebarContent } from './sidebar-content';
import { SidebarMobile } from './sidebar-mobile';
import { sidebarConfig } from './sidebar-config';
import { useSidebarContext } from '../../app/painel/layout';

export function Sidebar() {
  const [isClient, setIsClient] = useState(false);
  const { isCollapsed, setIsCollapsed } = useSidebarContext();

  // Proteger contra SSR
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Durante SSR, retornar um placeholder simples
  if (!isClient) {
    const { layout } = sidebarConfig;
    return (
      <div className={`hidden ${layout.background} md:block ${layout.position} ${layout.width} overflow-y-auto overflow-x-hidden ${layout.zIndex} ${layout.border}`}>
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
    );
  }

  const { layout } = sidebarConfig;

  return (
    <>
      {/* Sidebar Desktop */}
      <div className={`
        hidden md:block ${layout.position} overflow-y-auto overflow-x-hidden ${layout.zIndex} ${layout.border} ${layout.background}
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : layout.width}
      `}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-white border rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow z-50 text-gray-600 hover:text-gray-800"
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        <SidebarContent className="w-full" isCollapsed={isCollapsed} />
      </div>

      {/* Sidebar Mobile */}
      <SidebarMobile onItemClick={() => {}} />
    </>
  );
}