'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSimulador } from '@/hooks';
import { useSessaoStore } from '@/store';
import { 
  InputSection, 
  Dashboard, 
  SimuladorHeader, 
  FormaPagamentoModal, 
  FormasPagamentoSection, 
  CronogramaRecebimento, 
  AmbienteSection,
  type NovaFormaState,
  type TipoFormaPagamento
} from '@/components/modulos/orcamento';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';
import { FormaPagamento } from '@/types/simulador';
import { Alert, AlertDescription } from '@/components/ui/alert';



export default function SimuladorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    simulacao, 
    recalcularSimulacao, 
    adicionarForma, 
    removerForma, 
    limparFormas, 
    atualizarForma,
    alternarTravamentoForma,
    editarValorNegociado,
    editarValorBruto,
    editarDescontoReal
  } = useSimulador();
  
  const {
    cliente,
    ambientes,
    valorTotalAmbientes,
    podeGerarOrcamento,
    definirOrcamento
  } = useSessaoStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoForma, setEditandoForma] = useState<FormaPagamento | null>(null);
  const [novaForma, setNovaForma] = useState<NovaFormaState>({
    tipo: 'ENTRADA',
    valor: 0,
    parcelas: 1,
    taxaJuros: 2.5,
    deflacao: 5,
    jurosAntecipacao: 1.99,
    custoCapital: 1.5,
    dataVencimento: ''
  });

  const resetForm = () => {
    setNovaForma({
      tipo: 'ENTRADA',
      valor: 0,
      parcelas: 1,
      taxaJuros: 2.5,
      deflacao: 5,
      jurosAntecipacao: 1.99,
      custoCapital: 1.5,
      dataVencimento: ''
    });
    setEditandoForma(null);
  };

  const handleEditarForma = (forma: FormaPagamento) => {
    setEditandoForma(forma);
    setNovaForma({
      tipo: forma.tipo,
      valor: forma.valor,
      parcelas: forma.parcelas || 1,
      taxaJuros: forma.taxaJuros || 2.5,
      deflacao: forma.deflacao || 5,
      jurosAntecipacao: forma.jurosAntecipacao || 1.99,
      custoCapital: forma.custoCapital || 1.5,
      dataVencimento: forma.dataVencimento || ''
    });
    setModalOpen(true);
  };

  const handleSubmitForma = () => {
    console.log('Submitting forma:', novaForma);
    
    if (novaForma.valor <= 0) {
      alert('Valor deve ser maior que zero');
      return;
    }

    if (novaForma.tipo === 'FINANCEIRA' && !novaForma.dataVencimento) {
      alert('Data de vencimento é obrigatória para financeiras');
      return;
    }

    const forma: Omit<FormaPagamento, 'id' | 'valorRecebido'> = {
      tipo: novaForma.tipo,
      valor: novaForma.valor,
      ...(novaForma.tipo === 'FINANCEIRA' && {
        parcelas: novaForma.parcelas,
        taxaJuros: novaForma.taxaJuros,
        dataVencimento: novaForma.dataVencimento
      }),
      ...(novaForma.tipo === 'CARTAO' && {
        parcelas: novaForma.parcelas,
        deflacao: novaForma.deflacao,
        jurosAntecipacao: novaForma.jurosAntecipacao
      }),
      ...(novaForma.tipo === 'BOLETO' && {
        parcelas: novaForma.parcelas,
        custoCapital: novaForma.custoCapital
      })
    };

    if (editandoForma) {
      atualizarForma(editandoForma.id, forma);
    } else {
      adicionarForma(forma);
    }
    
    setModalOpen(false);
    resetForm();
  };

  const handleOpenModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleCancelModal = () => {
    setModalOpen(false);
    resetForm();
  };

  // Sincronizar valor bruto com total dos ambientes quando há dados da sessão
  useEffect(() => {
    if (valorTotalAmbientes > 0 && simulacao.valorBruto !== valorTotalAmbientes) {
      console.log('Sincronizando valor bruto dos ambientes:', valorTotalAmbientes);
      recalcularSimulacao({ valorBruto: valorTotalAmbientes });
    }
  }, [valorTotalAmbientes, recalcularSimulacao, simulacao.valorBruto]);

  // Sincronizar estado do orçamento com a store
  useEffect(() => {
    definirOrcamento(simulacao.valorNegociado, simulacao.formasPagamento.length, simulacao.descontoReal);
  }, [simulacao.valorNegociado, simulacao.formasPagamento.length, simulacao.descontoReal, definirOrcamento]);

  // Função para navegar preservando parâmetros do cliente
  const navegarParaContratos = () => {
    const clienteId = searchParams.get('clienteId');
    const clienteNome = searchParams.get('clienteNome');
    
    let url = '/painel/contratos';
    const params = new URLSearchParams();
    
    if (clienteId) {
      params.set('clienteId', clienteId);
    }
    if (clienteNome) {
      params.set('clienteNome', clienteNome);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    console.log('🚀 Navegando para contratos com parâmetros:', url);
    router.push(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Section */}
        <SimuladorHeader
          onAvancarParaContratos={navegarParaContratos}
          podeAvancar={podeGerarOrcamento()}
          formasPagamento={simulacao.formasPagamento.length}
          motivoDesabilitado={
            !podeGerarOrcamento() 
              ? "Adicione ambientes para continuar" 
              : simulacao.formasPagamento.length === 0 
                ? "Adicione pelo menos uma forma de pagamento" 
                : undefined
          }
        />

        {/* Alertas de Estado da Sessão */}
        {!cliente && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhum cliente selecionado. Selecione um cliente para continuar.
            </AlertDescription>
          </Alert>
        )}
        
        {cliente && ambientes.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Cliente {cliente.nome} selecionado, mas nenhum ambiente foi adicionado. 
              <Button 
                variant="link" 
                className="p-0 h-auto ml-1 underline"
                onClick={() => router.push('/painel/ambientes')}
              >
                Clique aqui para adicionar ambientes.
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {cliente && ambientes.length > 0 && simulacao.formasPagamento.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Cliente e ambientes configurados! Para avançar aos contratos, adicione pelo menos uma forma de pagamento.
            </AlertDescription>
          </Alert>
        )}

        {/* Seção de Ambientes */}
        <AmbienteSection 
          ambientes={ambientes}
          valorTotal={valorTotalAmbientes}
          clienteNome={cliente?.nome}
        />

        {/* Input Section */}
        <InputSection
          valorBruto={simulacao.valorBruto}
          desconto={simulacao.desconto}
          valorNegociado={simulacao.valorNegociado}
          onValorBrutoChange={(valor) => recalcularSimulacao({ valorBruto: valor })}
          onDescontoChange={(desconto) => recalcularSimulacao({ desconto })}
          onAtualizarSimulacao={() => editarValorNegociado(simulacao.valorNegociado)}
          valorVemDosAmbientes={valorTotalAmbientes > 0}
          valorTotalAmbientes={valorTotalAmbientes}
        />

        {/* Dashboard com capacidade de edição */}
        <Dashboard
          valorBruto={simulacao.valorBruto}
          valorNegociado={simulacao.valorNegociado}
          descontoReal={simulacao.descontoReal}
          valorRecebidoTotal={simulacao.valorRecebidoTotal}
          valorRestante={simulacao.valorRestante}
          onEditValorNegociado={editarValorNegociado}
          onEditDescontoReal={editarDescontoReal}
          isDescontoRealLocked={simulacao.travamentos.descontoRealFixo}
        />

        {/* Formas de Pagamento */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <FormasPagamentoSection
            formasPagamento={simulacao.formasPagamento}
            onEditarForma={handleEditarForma}
            onRemoverForma={removerForma}
            onLimparFormas={limparFormas}
            onAlternarTravamento={alternarTravamentoForma}
            onOpenModal={handleOpenModal}
          />
          
          <FormaPagamentoModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            editandoForma={editandoForma}
            novaForma={novaForma}
            setNovaForma={setNovaForma}
            onSubmit={handleSubmitForma}
            onCancel={handleCancelModal}
          />
        </Dialog>

        {/* Cronograma de Recebimento */}
        <CronogramaRecebimento formasPagamento={simulacao.formasPagamento} />
      </div>
    </div>
  );
}