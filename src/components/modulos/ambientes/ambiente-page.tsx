'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useClienteSelecionadoRealista } from '../../../hooks/globais/use-cliente-selecionado-realista';
import { useSessao } from '../../../store/sessao-store';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Download, Plus, Upload, User, Home, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAmbientes } from '../../../hooks/modulos/ambientes/use-ambientes';
import { useClientesRealista } from '../../../hooks/modulos/clientes/use-clientes-realista';
import { AmbienteModal } from './ambiente-modal';
import { AmbienteCard } from './ambiente-card';
import { ClienteSelectorUniversal } from '../../shared/cliente-selector-universal';

export function AmbientePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clienteId, cliente: clienteCarregado, isLoading: clienteLoading } = useClienteSelecionadoRealista();
  
  // Verificar se deve forçar troca de cliente
  const forcarTroca = searchParams.get('forcar') === 'true';
  
  // Debug: monitorar mudanças de clienteId
  useEffect(() => {
    console.log('🔍 AmbientePage: clienteId mudou para:', clienteId, { forcarTroca });
  }, [clienteId, forcarTroca]);
  const { clientes } = useClientesRealista();
  const {
    cliente,
    ambientes: ambientesSessao,
    definirCliente,
    definirAmbientes,
    adicionarAmbiente: adicionarAmbienteSessao,
    removerAmbiente: removerAmbienteSessao,
    podeGerarOrcamento,
    limparSessaoCompleta
  } = useSessao();
  
  const {
    ambientes,
    adicionarAmbiente,
    removerAmbiente,
    importarXML,
    isLoading,
    valorTotalGeral
  } = useAmbientes(clienteId || undefined);
  const [modalAberto, setModalAberto] = useState(false);

  // Sincronizar ambientes locais com a sessão
  useEffect(() => {
    if (clienteId && ambientes.length > 0) {
      definirAmbientes(ambientes);
    }
  }, [ambientes, clienteId, definirAmbientes]);

  // Sincronizar cliente carregado com a sessão
  useEffect(() => {
    // LÓGICA INTELIGENTE: Respeitar intenção do usuário
    
    // 1. Se sessão vazia OU forçar troca → Definir cliente da URL
    if (clienteCarregado && !clienteLoading && (!cliente || forcarTroca)) {
      console.log('🔄 AmbientePage: Definindo cliente da URL:', {
        clienteCarregado: clienteCarregado.nome,
        clienteCarregadoId: clienteCarregado.id,
        motivo: !cliente ? 'SESSAO_VAZIA' : 'FORCAR_TROCA',
        forcarTroca
      });
      definirCliente(clienteCarregado);
      
      // Limpar parâmetro forcar da URL após usar
      if (forcarTroca) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('forcar');
        router.replace(newUrl.pathname + newUrl.search, { scroll: false });
      }
    } 
    // 2. Se há cliente diferente na URL mas não forçar → Manter sessão atual
    else if (clienteCarregado && cliente && cliente.id !== clienteCarregado.id && !forcarTroca) {
      console.log('🔄 AmbientePage: Cliente diferente detectado, mantendo sessão atual:', {
        clienteURL: clienteCarregado.nome,
        clienteSessao: cliente.nome,
        acao: 'MANTENDO_SESSAO_ATUAL'
      });
      // Manter cliente da sessão (usuário deve usar "Criar Ambientes" para trocar)
    }
    // 3. Se não há cliente na URL mas há na sessão → Manter sessão
    else if (!clienteCarregado && !clienteLoading && cliente && !clienteId) {
      console.log('🛡️ Protegendo cliente da sessão (sem clienteId na URL):', cliente.nome);
      // Manter o cliente na sessão
    }
  }, [clienteCarregado, clienteLoading, cliente, clienteId, forcarTroca, definirCliente, router]);

  const handleAdicionarAmbiente = (data: any) => {
    adicionarAmbiente(data);
    setModalAberto(false);
  };

  const handleRemoverAmbiente = (id: string) => {
    removerAmbiente(id);
    removerAmbienteSessao(id);
  };

  const handleAvancarParaOrcamento = () => {
    if (podeGerarOrcamento) {
      router.push('/painel/orcamento/simulador');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Section */}
        <Card>
          <CardContent className="p-4 min-h-[80px] flex items-center">
            <div className="flex items-center justify-between w-full">
              {/* Navegação e Cliente - ESQUERDA */}
              <div className="flex items-center gap-4">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => router.push('/painel/clientes')}
                  className="gap-2 h-12 px-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-semibold text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <div className="h-6 w-px bg-gray-300" />
                
                <div className="w-80">
                  <ClienteSelectorUniversal 
                    targetRoute="/painel/ambientes"
                    placeholder="Selecionar cliente..."
                    integraSessao={true}
                  />
                </div>
              </div>

              {/* Botões - DIREITA */}
              <div className="flex items-center gap-3">
                <Button 
                  onClick={importarXML} 
                  disabled={isLoading || !clienteId} 
                  variant="default" 
                  size="sm"
                  className="gap-2 h-12 px-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-semibold text-white"
                >
                  <Upload className="h-4 w-4" />
                  {isLoading ? 'Importando...' : 'Importar XML'}
                </Button>
                
                <Button 
                  onClick={() => setModalAberto(true)} 
                  size="sm" 
                  disabled={!clienteId}
                  variant="default"
                  className="gap-2 h-12 px-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-semibold text-white"
                >
                  <Plus className="h-4 w-4" />
                  Novo Ambiente
                </Button>

                <Button 
                  onClick={handleAvancarParaOrcamento}
                  size="sm" 
                  disabled={!podeGerarOrcamento}
                  variant="default"
                  className="gap-2 h-12 px-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!podeGerarOrcamento ? "Adicione pelo menos um ambiente para continuar" : "Avançar para orçamento"}
                >
                  Orçamento
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
                    onRemover={handleRemoverAmbiente} 
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
          onSubmit={handleAdicionarAmbiente} 
        />
      </div>
    </div>
  );
}