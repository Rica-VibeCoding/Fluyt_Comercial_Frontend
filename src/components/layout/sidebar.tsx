'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { 
  Home, 
  Users, 
  Building2, 
  Calculator, 
  FileText, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

const menuItems = [
  { 
    titulo: 'Dashboard', 
    icone: Home, 
    href: '/painel',
    descricao: 'Visão geral do sistema'
  },
  { 
    titulo: 'Clientes', 
    icone: Users, 
    href: '/painel/clientes',
    descricao: 'Gestão de clientes',
    ativo: true // Módulo migrado
  },
  { 
    titulo: 'Ambientes', 
    icone: Building2, 
    href: '/painel/ambientes',
    descricao: 'Projetos e ambientes',
    ativo: true // Módulo migrado
  },
  { 
    titulo: 'Orçamentos', 
    icone: Calculator, 
    href: '/painel/orcamento',
    descricao: 'Simulador de propostas',
    ativo: true // Módulo atual
  },
  { 
    titulo: 'Contratos', 
    icone: FileText, 
    href: '/painel/contratos',
    descricao: 'Gestão de contratos',
    ativo: true // Módulo migrado
  },
  { 
    titulo: 'Sistema', 
    icone: Settings, 
    href: '/painel/sistema',
    descricao: 'Configurações',
    ativo: true // Módulo migrado
  }
];

interface SidebarContentProps {
  className?: string;
  onItemClick?: () => void;
}

function SidebarContent({ className, onItemClick }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className={cn("pb-12 min-h-screen", className)}>
      <div className="space-y-4 py-4">
        {/* Logo/Header */}
        <div className="px-3 py-2">
          <Link href="/painel/orcamento/simulador">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-blue-600">
              🏢 Sistema Fluyt
            </h2>
          </Link>
          <p className="px-4 text-sm text-muted-foreground">
            Gestão Comercial Integrada
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

export function Sidebar() {
  return (
    <>
      {/* Sidebar Desktop */}
      <div className="hidden border-r bg-gray-50/40 md:block">
        <SidebarContent className="w-64" />
      </div>

      {/* Sidebar Mobile */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-40"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent onItemClick={() => {}} />
        </SheetContent>
      </Sheet>
    </>
  );
}