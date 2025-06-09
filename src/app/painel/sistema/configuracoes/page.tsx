"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, DollarSign, Settings as SettingsIcon, FileText, Building2, Store, UserCog, Layers } from 'lucide-react';
import Link from 'next/link';
import { GestaoEmpresas, GestaoLojas, GestaoEquipe, GestaoSetores, GestaoComissoes, ConfigLoja } from '@/components/modulos/sistema';
import { ResetDados } from '@/components/modulos/sistema/configuracoes/reset-dados';
import { TesteConectividade } from '@/components/modulos/sistema/configuracoes/teste-conectividade';

export default function ConfiguracoesPage() {
  const [activeSection, setActiveSection] = useState('pessoas');
  const userProfile = 'ADMIN_MASTER'; // Seria obtido do contexto de auth

  const sections = [{
    id: 'pessoas',
    label: 'Pessoas',
    icon: Users,
    description: 'Gestão de empresas, lojas, equipe e setores',
    items: [{
      id: 'empresas',
      label: 'Empresas',
      icon: Building2
    }, {
      id: 'lojas',
      label: 'Lojas',
      icon: Store
    }, {
      id: 'equipe',
      label: 'Equipe',
      icon: UserCog
    }, {
      id: 'setores',
      label: 'Setores',
      icon: Layers
    }]
  }, {
    id: 'financeiro',
    label: 'Financeiro',
    icon: DollarSign,
    description: 'Configurações críticas do sistema',
    adminOnly: true,
    items: [{
      id: 'comissoes',
      label: 'Regras de Comissão'
    }, {
      id: 'config-loja',
      label: 'Configurações da Loja'
    }, {
      id: 'status',
      label: 'Status de Orçamento'
    }]
  }, {
    id: 'operacional',
    label: 'Operacional',
    icon: SettingsIcon,
    description: 'Prestadores de serviços',
    items: [{
      id: 'montadores',
      label: 'Montadores'
    }, {
      id: 'transportadoras',
      label: 'Transportadoras'
    }]
  }, {
    id: 'sistema',
    label: 'Sistema',
    icon: FileText,
    description: 'Auditoria e logs',
    items: [{
      id: 'auditoria',
      label: 'Auditoria'
    }, {
      id: 'dados',
      label: 'Gerenciar Dados'
    }, {
      id: 'conectividade',
      label: 'Teste Supabase'
    }]
  }];

  const renderContent = (sectionId: string, itemId: string) => {
    const key = `${sectionId}-${itemId}`;
    switch (key) {
      case 'pessoas-empresas':
        return <GestaoEmpresas />;
      case 'pessoas-lojas':
        return <GestaoLojas />;
      case 'pessoas-equipe':
        return <GestaoEquipe />;
      case 'pessoas-setores':
        return <GestaoSetores />;
      case 'financeiro-comissoes':
        return <GestaoComissoes />;
      case 'financeiro-config-loja':
        return <ConfigLoja />;
      case 'financeiro-status':
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <div className="text-lg font-medium mb-2">Status de Orçamento</div>
                <p>Funcionalidade em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        );
      case 'operacional-montadores':
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <div className="text-lg font-medium mb-2">Gestão de Montadores</div>
                <p>Funcionalidade em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        );
      case 'operacional-transportadoras':
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <div className="text-lg font-medium mb-2">Gestão de Transportadoras</div>
                <p>Funcionalidade em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        );
      case 'sistema-auditoria':
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <div className="text-lg font-medium mb-2">Logs de Auditoria</div>
                <p>Funcionalidade em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        );
      case 'sistema-dados':
        return <ResetDados />;
      case 'sistema-conectividade':
        return <TesteConectividade />;
      default:
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <div className="text-lg font-medium mb-2">
                  {sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} - {itemId.charAt(0).toUpperCase() + itemId.slice(1)}
                </div>
                <p>Funcionalidade em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header moderno inspirado no original */}
      <div className="bg-white border-b">
              <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center gap-4">
          <Link href="/painel/sistema">
            <Button variant="ghost" size="sm" className="gap-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl font-semibold text-white">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <SettingsIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Configurações do Sistema</h1>
              <p className="text-slate-600 mt-1">Gerencie todos os aspectos da sua aplicação</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-4">
        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          {/* Navegação principal com estilo modernizado */}
          <div className="bg-white rounded-lg border shadow-sm">
            <TabsList className="grid w-full grid-cols-4 h-14 bg-transparent">
              {sections.map(section => {
                const Icon = section.icon;
                const isDisabled = section.adminOnly && userProfile !== 'ADMIN_MASTER';
                return (
                  <TabsTrigger 
                    key={section.id} 
                    value={section.id} 
                    disabled={isDisabled} 
                    className="flex items-center gap-3 h-12 px-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{section.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {sections.map(section => (
            <TabsContent key={section.id} value={section.id} className="space-y-6">
              {/* Card de informação da seção */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <section.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold text-slate-800">{section.label}</h2>
                        {section.adminOnly && (
                          <Badge variant="destructive" className="text-xs">
                            Admin Only
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-600 mt-1">{section.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sub-navegação */}
              <Tabs defaultValue={section.items[0]?.id} className="space-y-4">
                <div className="bg-white rounded-lg border shadow-sm">
                  <TabsList className="grid w-full h-12 bg-transparent" style={{ gridTemplateColumns: `repeat(${section.items.length}, 1fr)` }}>
                    {section.items.map(item => (
                      <TabsTrigger 
                        key={item.id} 
                        value={item.id} 
                        className="flex items-center gap-2 h-10 px-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span className="font-medium text-sm">{item.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {section.items.map(item => (
                  <TabsContent key={item.id} value={item.id}>
                    {renderContent(section.id, item.id)}
                  </TabsContent>
                ))}
              </Tabs>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}