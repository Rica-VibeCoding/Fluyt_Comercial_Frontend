/**
 * Configuração do menu lateral do sistema
 */

import { 
  Home, 
  Users, 
  FileText, 
  Settings
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface MenuItem {
  titulo: string;
  icone: LucideIcon;
  href: string;
  descricao: string;
  ativo?: boolean;
}

export const menuItems: MenuItem[] = [
  { 
    titulo: 'Dashboard', 
    icone: Home, 
    href: '/painel',
    descricao: 'Visão geral do sistema',
    ativo: true
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
    icone: Home, 
    href: '/painel/ambientes',
    descricao: 'Projetos e ambientes',
    ativo: true // Módulo migrado
  },
  { 
    titulo: 'Orçamentos', 
    icone: FileText, 
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

export const sidebarConfig = {
  logo: {
    text: '🏢 Sistema Fluyt',
    subtitle: 'Gestão Comercial Integrada',
    href: '/painel/orcamento/simulador'
  },
  layout: {
    width: 'w-64',
    position: 'fixed left-0 top-0 h-screen',
    background: 'bg-gray-50/40',
    border: 'border-r',
    zIndex: 'z-30'
  }
};