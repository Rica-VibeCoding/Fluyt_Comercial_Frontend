/**
 * Sidebar principal - orchestrator dos componentes
 */

'use client';

import React, { useState, useEffect } from 'react';
import { SidebarContent } from './sidebar-content';
import { SidebarMobile } from './sidebar-mobile';
import { sidebarConfig } from './sidebar-config';

export function Sidebar() {
  const [isClient, setIsClient] = useState(false);

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
      <div className={`hidden ${layout.background} md:block ${layout.position} ${layout.width} overflow-y-auto overflow-x-hidden ${layout.zIndex} ${layout.border}`}>
        <SidebarContent className="w-full" />
      </div>

      {/* Sidebar Mobile */}
      <SidebarMobile onItemClick={() => {}} />
    </>
  );
}