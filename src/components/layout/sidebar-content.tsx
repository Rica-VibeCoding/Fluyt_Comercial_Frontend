/**
 * Conteúdo interno da sidebar - menu e navegação
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { menuItems, sidebarConfig } from './sidebar-config';
import { SidebarThemeSelector } from './sidebar-theme-selector';

interface SidebarContentProps {
  className?: string;
  onItemClick?: () => void;
  isCollapsed?: boolean;
  currentTheme?: string;
  onThemeChange?: (themeId: string) => void;
}

export function SidebarContent({ 
  className, 
  onItemClick, 
  isCollapsed = false,
  currentTheme = 'light-default',
  onThemeChange = () => {}
}: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="flex-1 space-y-4 py-4">
        {/* Logo/Header */}
        <div className="px-3 py-2">
          <Link href={sidebarConfig.logo.href}>
            <h2 
              className={`mb-2 px-4 text-lg font-semibold tracking-tight transition-all duration-300 ${
                isCollapsed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
              style={{ color: 'hsl(var(--sidebar-primary, 210 100% 56%))' }}
            >
              {!isCollapsed && sidebarConfig.logo.text}
              {isCollapsed && '🏢'}
            </h2>
          </Link>
          <p 
            className={`px-4 text-sm transition-all duration-300 ${
              isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
            }`}
            style={{ color: 'hsl(var(--sidebar-foreground, 240 10% 3.9%) / 0.7)' }}
          >
            {sidebarConfig.logo.subtitle}
          </p>
        </div>

        {/* Menu de Navegação */}
        <div className="px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icone;
              const isActive = pathname.startsWith(item.href);
              const isDisabled = !item.ativo && item.href !== '/painel/orcamento';
              
              return (
                <Link
                  key={item.href}
                  href={isDisabled ? '#' : item.href}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors relative group",
                    isActive 
                      ? "" // Remover classes padrão para usar CSS custom
                      : "",
                    isDisabled 
                      ? "opacity-50 cursor-not-allowed" 
                      : "cursor-pointer"
                  )}
                  style={{
                    backgroundColor: isActive 
                      ? 'hsl(var(--sidebar-accent, 240 4.8% 95.9%))' 
                      : 'transparent',
                    color: isActive 
                      ? 'hsl(var(--sidebar-accent-foreground, 240 5.9% 10%))' 
                      : 'hsl(var(--sidebar-foreground, 240 10% 3.9%))'
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
                  <Icon className={`h-4 w-4 flex-shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-2'}`} />
                  
                  {/* Conteúdo do menu - oculto quando colapsado */}
                  <div className={`flex-1 transition-all duration-300 ${
                    isCollapsed ? 'opacity-0 w-0 overflow-hidden ml-0' : 'opacity-100 ml-0'
                  }`}>
                    <div className="flex items-center gap-2">
                      {item.titulo}
                      {item.ativo && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          Ativo
                        </span>
                      )}
                      {isDisabled && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          Em breve
                        </span>
                      )}
                    </div>
                    <p 
                      className="text-xs mt-1"
                      style={{ color: 'hsl(var(--sidebar-foreground, 240 10% 3.9%) / 0.6)' }}
                    >
                      {item.descricao}
                    </p>
                  </div>

                  {/* Tooltip para modo colapsado */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none">
                      {item.titulo}
                      {item.ativo && <span className="block text-green-400">Ativo</span>}
                      {isDisabled && <span className="block text-gray-400">Em breve</span>}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Informações do Sistema */}
        <div className={`px-3 pt-4 transition-all duration-300 ${
          isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
        }`} style={{ borderTopColor: 'hsl(var(--sidebar-accent, 240 4.8% 95.9%))' }}>
          <div 
            className="px-4 py-2 border-t"
            style={{ borderTopColor: 'hsl(var(--sidebar-accent, 240 4.8% 95.9%))' }}
          >
            <p 
              className="text-xs"
              style={{ color: 'hsl(var(--sidebar-foreground, 240 10% 3.9%) / 0.7)' }}
            >
              Módulo Orçamentos ativo
            </p>
            <p 
              className="text-xs font-medium"
              style={{ color: 'hsl(var(--sidebar-primary, 210 100% 56%))' }}
            >
              Simulador Financeiro
            </p>
          </div>
        </div>
      </div>

      {/* Footer com Configurações */}
      <div 
        className="p-3 space-y-3 border-t"
        style={{ borderTopColor: 'hsl(var(--sidebar-accent, 240 4.8% 95.9%))' }}
      >
        {/* Seletor de Temas */}
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <SidebarThemeSelector 
            currentTheme={currentTheme}
            onThemeChange={onThemeChange}
            isCollapsed={isCollapsed}
          />
          
          {/* Label do seletor quando expandido */}
          {!isCollapsed && (
            <div className="flex-1">
              <p 
                className="text-xs font-medium"
                style={{ color: 'hsl(var(--sidebar-foreground, 240 10% 3.9%))' }}
              >
                Personalizar
              </p>
              <p 
                className="text-xs"
                style={{ color: 'hsl(var(--sidebar-foreground, 240 10% 3.9%) / 0.6)' }}
              >
                Trocar tema da sidebar
              </p>
            </div>
          )}
        </div>

        {/* Informações da versão (quando expandido) */}
        {!isCollapsed && (
          <div className="px-2 py-1 text-center">
            <p 
              className="text-xs"
              style={{ color: 'hsl(var(--sidebar-foreground, 240 10% 3.9%) / 0.5)' }}
            >
              Sistema Fluyt v1.0
            </p>
          </div>
        )}
      </div>
    </div>
  );
}