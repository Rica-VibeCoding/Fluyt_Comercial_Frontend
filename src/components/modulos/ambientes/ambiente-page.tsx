'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useClienteSelecionado } from '../../../hooks/globais/use-cliente-selecionado';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Download, Plus, Upload, User, Home } from 'lucide-react';
import { useAmbientes } from '../../../hooks/modulos/ambientes/use-ambientes';
import { AmbienteModal } from './ambiente-modal';
import { AmbienteCard } from './ambiente-card';
import { ClienteSelectorUniversal } from '../../shared/cliente-selector-universal';

export function AmbientePage() {
  const router = useRouter();
  const { clienteId } = useClienteSelecionado();
  const {
    ambientes,
    adicionarAmbiente,
    removerAmbiente,
    importarXML,
    isLoading,
    valorTotalGeral
  } = useAmbientes(clienteId || undefined);
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md border-0 p-4">
          <div className="flex items-center justify-between">
            {/* Cliente selecionado ou seletor - ESQUERDA */}
            <div className="w-80">
              <ClienteSelectorUniversal 
                targetRoute="/painel/ambientes"
                placeholder="Selecionar cliente..."
              />
            </div>

            {/* Botões - DIREITA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button 
                onClick={importarXML} 
                disabled={isLoading || !clienteId} 
                variant="outline" 
                size="lg"
                className="gap-2 h-12 px-4"
              >
                <Upload className="h-4 w-4" />
                {isLoading ? 'Importando...' : 'Importar XML'}
              </Button>
              
              <Button 
                onClick={() => setModalAberto(true)} 
                size="sm" 
                disabled={!clienteId}
                className="gap-2 h-12 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                Novo Ambiente
              </Button>

              <Button 
                onClick={() => router.push('/painel/orcamento/simulador')} 
                size="sm" 
                className="gap-2 h-12 px-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-semibold text-white"
              >
                Avançar para Orçamento
              </Button>
            </div>
          </div>
        </div>

        {/* Resumo compacto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-md border-0 bg-white">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-sm text-muted-foreground">Total de Ambientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 px-4 pb-4">
              <div className="text-2xl font-bold">{ambientes.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0 bg-white">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-sm text-muted-foreground">Valor Total Geral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 px-4 pb-4">
              <div className="text-2xl font-bold text-primary tabular-nums">
                {valorTotalGeral.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0 bg-white">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-sm text-muted-foreground">Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 px-4 pb-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full h-8" 
                disabled={ambientes.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Ambientes */}
        {clienteId && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Ambientes Cadastrados</h2>
              <span className="text-xs text-muted-foreground">
                Clique para expandir e ver detalhes
              </span>
            </div>
            
            {ambientes.length === 0 ? (
              <Card className="shadow-md border-0 bg-white">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="text-lg font-medium text-muted-foreground">Nenhum ambiente cadastrado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0 px-4 pb-4">
                  <div className="text-center text-muted-foreground">
                    <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Comece importando um XML ou criando um ambiente manualmente</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-background border border-border/40 rounded-lg overflow-hidden shadow-sm">
                {ambientes.map((ambiente) => (
                  <AmbienteCard 
                    key={ambiente.id} 
                    ambiente={ambiente} 
                    onRemover={removerAmbiente} 
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        <AmbienteModal 
          open={modalAberto} 
          onOpenChange={setModalAberto} 
          onSubmit={adicionarAmbiente} 
        />
      </div>
    </div>
  );
}