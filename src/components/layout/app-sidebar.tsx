/**
 * Conteúdo da sidebar REFATORADA
 * Simplificada para usar com o contexto existente
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { menuItems } from './sidebar-config';
import { SidebarThemeSelector } from './sidebar-theme-selector';
import { useSidebarContext } from '../../app/painel/layout';

export function AppSidebar() {
  const pathname = usePathname();
  const { isCollapsed, currentTheme, setCurrentTheme } = useSidebarContext();

  return (
    <div className="h-full flex flex-col">
      {/* Header com D-Art / Fluyt */}
      <div className="border-b border-white/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
            <h1 className="text-lg font-bold mb-0.5" style={{ color: 'hsl(var(--sidebar-foreground, 240 10% 3.9%))' }}>
              D-Art
            </h1>
            <p className="text-xs font-medium" style={{ color: 'hsl(var(--sidebar-foreground, 240 10% 3.9%) / 0.7)' }}>
              Fluyt
            </p>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="flex-1 px-2 py-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icone;
            const isActive = item.href === '/painel' 
              ? pathname === '/painel' 
              : pathname.startsWith(item.href);
            const isDisabled = !item.ativo && item.href !== '/painel/orcamento';
            
            return (
              <Link
                key={item.href}
                href={isDisabled ? '#' : item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors relative group",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
                style={{
                  backgroundColor: isActive 
                    ? 'hsl(var(--sidebar-accent, 240 4.8% 95.9%))' 
                    : 'transparent',
                  color: 'hsl(var(--sidebar-foreground, 240 10% 3.9%))'
                }}
                onMouseEnter={(e) => {
                  if (!isActive && !isDisabled) {
                    e.currentTarget.style.backgroundColor = 'hsl(var(--sidebar-accent, 240 4.8% 95.9%) / 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                title={isCollapsed ? item.titulo : undefined}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                
                {!isCollapsed && (
                  <span>{item.titulo}</span>
                )}

                {/* Tooltip para modo colapsado */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none">
                    {item.titulo}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer com João Silva + Theme Selector */}
      <div className="border-t border-white/20 px-2 py-3 space-y-3">
        {/* Usuário */}
        <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-2'}`}>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-700 text-sm font-medium flex-shrink-0">
            JS
          </div>
          <div className={`ml-3 transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
            <p className="text-sm font-medium" style={{ color: 'hsl(var(--sidebar-foreground, 240 10% 3.9%))' }}>
              João Silva
            </p>
            <p className="text-xs" style={{ color: 'hsl(var(--sidebar-foreground, 240 10% 3.9%) / 0.7)' }}>
              Designer
            </p>
          </div>
        </div>

        {/* Theme Selector */}
        <div className={`transition-all duration-300 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <SidebarThemeSelector 
            currentTheme={currentTheme} 
            onThemeChange={setCurrentTheme} 
            isCollapsed={isCollapsed}
          />
        </div>
      </div>
    </div>
  );
} 