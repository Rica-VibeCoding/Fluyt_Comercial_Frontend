/**
 * Conteúdo interno da sidebar - menu e navegação
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { menuItems, sidebarConfig } from './sidebar-config';

interface SidebarContentProps {
  className?: string;
  onItemClick?: () => void;
  isCollapsed?: boolean;
}

export function SidebarContent({ className, onItemClick, isCollapsed = false }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className={cn("h-full", className)}>
      <div className="space-y-4 py-4">
        {/* Logo/Header */}
        <div className="px-3 py-2">
          <Link href={sidebarConfig.logo.href}>
            <h2 className={`mb-2 px-4 text-lg font-semibold tracking-tight text-blue-600 transition-all duration-300 ${
              isCollapsed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}>
              {!isCollapsed && sidebarConfig.logo.text}
              {isCollapsed && '🏢'}
            </h2>
          </Link>
          <p className={`px-4 text-sm text-muted-foreground transition-all duration-300 ${
            isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
          }`}>
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
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors relative group",
                    isActive 
                      ? "bg-accent text-accent-foreground" 
                      : "transparent",
                    isDisabled 
                      ? "opacity-50 cursor-not-allowed hover:bg-transparent" 
                      : "cursor-pointer"
                  )}
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
                    <p className="text-xs text-muted-foreground mt-1">
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
        <div className={`px-3 pt-4 border-t transition-all duration-300 ${
          isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
        }`}>
          <div className="px-4 py-2">
            <p className="text-xs text-muted-foreground">
              Módulo Orçamentos ativo
            </p>
            <p className="text-xs text-blue-600 font-medium">
              Simulador Financeiro
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}