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
}

export function SidebarContent({ className, onItemClick }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className={cn("h-full", className)}>
      <div className="space-y-4 py-4">
        {/* Logo/Header */}
        <div className="px-3 py-2">
          <Link href={sidebarConfig.logo.href}>
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-blue-600">
              {sidebarConfig.logo.text}
            </h2>
          </Link>
          <p className="px-4 text-sm text-muted-foreground">
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
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                    isActive 
                      ? "bg-accent text-accent-foreground" 
                      : "transparent",
                    isDisabled 
                      ? "opacity-50 cursor-not-allowed hover:bg-transparent" 
                      : "cursor-pointer"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <div className="flex-1">
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
                </Link>
              );
            })}
          </div>
        </div>

        {/* Informações do Sistema */}
        <div className="px-3 pt-4 border-t">
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