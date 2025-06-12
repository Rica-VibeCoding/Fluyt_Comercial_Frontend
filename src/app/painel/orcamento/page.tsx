'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSessaoSimples } from '@/hooks/globais/use-sessao-simples';
import { useSessao } from '@/store/sessao-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { ModalFormasPagamento } from '@/components/modulos/orcamento/modal-formas-pagamento';
import { ListaFormasPagamento } from '@/components/modulos/orcamento/lista-formas-pagamento';
import { ModalAVista } from '@/components/modulos/orcamento/modal-a-vista';
import { ModalBoleto } from '@/components/modulos/orcamento/modal-boleto';
import { ModalCartao } from '@/components/modulos/orcamento/modal-cartao';
import { ModalFinanceira } from '@/components/modulos/orcamento/modal-financeira';
import { sessaoSimples, FormaPagamento } from '@/lib/sessao-simples';

export default function OrcamentoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { cliente, ambientes, carregarClienteDaURL } = useSessaoSimples();
  const sessaoStore = useSessao();
  const [desconto, setDesconto] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [modalFormasAberto, setModalFormasAberto] = useState(false);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [modalAVistaAberto, setModalAVistaAberto] = useState(false);
  const [modalBoletoAberto, setModalBoletoAberto] = useState(false);
  const [modalCartaoAberto, setModalCartaoAberto] = useState(false);
  const [modalFinanceiraAberto, setModalFinanceiraAberto] = useState(false);
  const [formaEditando, setFormaEditando] = useState<FormaPagamento | null>(null);
  
  // Carregar formas de pagamento do localStorage na inicialização
  useEffect(() => {
    const formasCarregadas = sessaoSimples.obterFormasPagamento();
    setFormasPagamento(formasCarregadas);
  }, []);

  useEffect(() => {
    const clienteId = searchParams.get('clienteId');
    const clienteNome = searchParams.get('clienteNome');
    
    console.log('🔍 Parâmetros da URL:', { clienteId, clienteNome });
    
    if (clienteId && clienteNome) {
      console.log('📥 Carregando cliente da URL...');
      carregarClienteDaURL(clienteId, decodeURIComponent(clienteNome));
    }
    
    setIsLoaded(true);
  }, [searchParams, carregarClienteDaURL]);
  
  // Função para sincronizar dados do sistema simples para o Zustand
  const sincronizarParaZustand = () => {
    if (!cliente || ambientes.length === 0) return false;
    
    console.log('🔄 Sincronizando dados: sessaoSimples → sessaoStore');
    
    // 1. Definir cliente no Zustand
    sessaoStore.definirCliente({
      id: cliente.id,
      nome: cliente.nome,
      cpf_cnpj: '', // Será preenchido futuramente
      telefone: '', // Será preenchido futuramente
      tipo_venda: 'NORMAL' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    // 2. Converter e definir ambientes no Zustand
    const ambientesConvertidos = ambientes.map(amb => ({
      id: amb.id,
      nome: amb.nome,
      acabamentos: [], // Será preenchido futuramente
      valorTotal: amb.valor,
      clienteId: cliente.id
    }));
    
    sessaoStore.definirAmbientes(ambientesConvertidos);
    
    // 3. Definir orçamento se tiver formas de pagamento
    if (formasPagamento.length > 0) {
      const valorTotal = ambientes.reduce((total, amb) => total + amb.valor, 0);
      const descontoNumero = parseFloat(desconto) || 0;
      const valorNegociado = valorTotal - (valorTotal * descontoNumero / 100);
      
      sessaoStore.definirOrcamento(valorNegociado, formasPagamento.length, descontoNumero);
    }
    
    return true;
  };
  
  // Função para navegar para contratos
  const navegarParaContratos = () => {
    if (sincronizarParaZustand()) {
      console.log('✅ Dados sincronizados - navegando para contratos');
      router.push(`/painel/contratos?clienteId=${cliente?.id}&clienteNome=${encodeURIComponent(cliente?.nome || '')}`);
    }
  };
  
  // Handlers para formas de pagamento
  const handleFormaPagamentoAdicionada = (forma: { tipo: string; valor?: number; detalhes?: any }) => {
    console.log('📥 Forma de pagamento adicionada:', forma);
    
    // Converter dados para interface FormaPagamento com mapeamento correto de tipos
    const tipoMapeado = (() => {
      switch (forma.tipo) {
        case 'À Vista':
          return 'a-vista';
        case 'Boleto':
          return 'boleto';
        case 'Cartão':
          return 'cartao';
        case 'Financeira':
          return 'financeira';
        default:
          console.warn('Tipo não reconhecido:', forma.tipo);
          return 'a-vista'; // fallback
      }
    })() as 'a-vista' | 'boleto' | 'cartao' | 'financeira';
    
    const novaForma: FormaPagamento = {
      id: `forma_${Date.now()}`,
      tipo: tipoMapeado,
      valor: forma.valor || 0,
      valorPresente: forma.detalhes?.valorPresente || forma.valor || 0,
      parcelas: forma.detalhes?.vezes || forma.detalhes?.parcelas?.length || 1,
      dados: forma.detalhes,
      criadaEm: new Date().toISOString()
    };
    
    // Salvar no sistema de sessão
    sessaoSimples.adicionarFormaPagamento(novaForma);
    
    // Atualizar estado local
    setFormasPagamento(prev => [...prev, novaForma]);
    setModalFormasAberto(false);
  };

  const handleEditarForma = (forma: FormaPagamento) => {
    console.log('✏️ Editando forma:', forma);
    
    // Armazenar qual forma está sendo editada
    setFormaEditando(forma);
    
    // Fechar modal principal se estiver aberto
    setModalFormasAberto(false);
    
    // Abrir modal específico baseado no tipo
    switch (forma.tipo) {
      case 'a-vista':
        setModalAVistaAberto(true);
        break;
      case 'boleto':
        setModalBoletoAberto(true);
        break;
      case 'cartao':
        setModalCartaoAberto(true);
        break;
      case 'financeira':
        setModalFinanceiraAberto(true);
        break;
      default:
        console.warn('Tipo de forma de pagamento não reconhecido:', forma.tipo);
    }
  };

  const handleRemoverForma = (id: string) => {
    console.log('🗑️ Removendo forma:', id);
    
    // Remover do sistema de sessão
    sessaoSimples.removerFormaPagamento(id);
    
    // Atualizar estado local
    setFormasPagamento(prev => prev.filter(f => f.id !== id));
  };

  // Handler para atualizar forma existente
  const handleAtualizarForma = (dadosNovos: any, tipo: 'a-vista' | 'boleto' | 'cartao' | 'financeira') => {
    if (!formaEditando) return;

    console.log('📝 Atualizando forma:', { id: formaEditando.id, dadosNovos });
    
    // Criar nova forma atualizada
    const formaAtualizada: FormaPagamento = {
      ...formaEditando,
      valor: dadosNovos.valor || 0,
      valorPresente: dadosNovos.valorPresente || dadosNovos.valor || 0,
      parcelas: dadosNovos.vezes || dadosNovos.parcelas?.length || 1,
      dados: dadosNovos,
      criadaEm: formaEditando.criadaEm // Manter data de criação original
    };
    
    // Atualizar no sistema de sessão
    sessaoSimples.editarFormaPagamento(formaEditando.id, formaAtualizada);
    
    // Atualizar estado local
    setFormasPagamento(prev => 
      prev.map(f => f.id === formaEditando.id ? formaAtualizada : f)
    );
    
    // Fechar modal e limpar edição
    setFormaEditando(null);
  };

  // Função para fechar modais de edição
  const fecharModalEdicao = () => {
    setModalAVistaAberto(false);
    setModalBoletoAberto(false);
    setModalCartaoAberto(false);
    setModalFinanceiraAberto(false);
    setFormaEditando(null);
  };

  // Validações
  const podeGerarContrato = () => {
    return !!(cliente && ambientes.length > 0 && formasPagamento.length > 0);
  };
  
  // Evitar hidration mismatch - mostrar loading até carregar
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header de Navegação */}
        <div className="bg-white border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/painel">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </Link>
              
              <p className="text-lg font-semibold">{cliente ? cliente.nome : 'Sem cliente'}</p>
            </div>
            
            {/* Botão Gerar Contrato */}
            <Button
              onClick={navegarParaContratos}
              disabled={!podeGerarContrato()}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              {podeGerarContrato() ? <CheckCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              {podeGerarContrato() ? 'Gerar Contrato' : 'Configure Pagamento'}
            </Button>
          </div>
        </div>
        
        {/* Layout: 1/3 esquerda + 2/3 direita - com alinhamento superior */}
        <div className="grid grid-cols-3 gap-6">
          
          {/* Coluna esquerda (1/3) - Valor Total + Ambientes */}
          <div className="col-span-1 flex flex-col">
            
            {/* Card Valor Total - altura dinâmica igual aos cards da direita */}
            <div className="flex-none h-[88px] mb-6">
              <Card className="h-full">
                <CardContent className="p-4 h-full flex flex-col justify-between">
                  <h3 className="font-semibold">Valor Total</h3>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {ambientes.reduce((total, ambiente) => total + ambiente.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Card Ambientes */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Ambientes</h3>
                
                <div className="flex justify-between border-b-2 pb-2 mb-2 font-semibold text-sm">
                  <span>Nome</span>
                  <span>Valor</span>
                </div>
                
                <div className="space-y-1">
                  {ambientes.length > 0 ? ambientes.map((ambiente) => (
                    <div key={ambiente.id} className="flex justify-between py-1 border-b">
                      <span className="font-medium">{ambiente.nome}</span>
                      <span className="text-green-600">
                        R$ {ambiente.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-center py-4">Nenhum ambiente</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
          </div>

          {/* Coluna direita (2/3) - 3 Cards superiores + Plano de Pagamento */}
          <div className="col-span-2 flex flex-col">
            
            {/* 3 Cards superiores - altura fixa igual ao Valor Total */}
            <div className="flex-none grid grid-cols-3 gap-4 h-[88px] mb-6">
              
              {/* Card Valor Negociado */}
              <div className="flex">
                <Card className="flex-1">
                  <CardContent className="p-4 h-full flex flex-col justify-between">
                    <h3 className="font-semibold">Valor Negociado</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {(() => {
                        const valorTotal = ambientes.reduce((total, ambiente) => total + ambiente.valor, 0);
                        const descontoNumero = parseFloat(desconto) || 0;
                        const valorNegociado = valorTotal - (valorTotal * descontoNumero / 100);
                        return `R$ ${valorNegociado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                      })()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Card Desconto Real */}
              <div className="flex">
                <Card className="flex-1">
                  <CardContent className="p-4 h-full flex flex-col justify-between">
                    <h3 className="font-semibold">Desconto Real</h3>
                    <p className="text-2xl text-gray-400">Calculando...</p>
                  </CardContent>
                </Card>
              </div>

              {/* Card Valor Recebido */}
              <div className="flex">
                <Card className="flex-1">
                  <CardContent className="p-4 h-full flex flex-col justify-between">
                    <h3 className="font-semibold">Valor Recebido</h3>
                    <p className="text-2xl text-gray-400">Calculando...</p>
                  </CardContent>
                </Card>
              </div>
              
            </div>

            {/* Card Plano de Pagamento */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Plano de Pagamento</h3>
                
                {/* Layout em linha: Desconto + Botão Adicionar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  
                  {/* Campo Desconto - 1/3 da largura */}
                  <div className="flex-shrink-0 w-full sm:w-48">
                    <label className="block text-sm font-medium mb-2">Desconto (%)</label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={desconto}
                        onChange={(e) => setDesconto(e.target.value)}
                        placeholder="0"
                        className="pr-8"
                        max="100"
                        min="0"
                        step="0.1"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Botão Adicionar - ocupa espaço restante */}
                  <div className="flex-1 flex flex-col justify-end">
                    <Button
                      onClick={() => setModalFormasAberto(true)}
                      variant="outline"
                      className="w-full gap-2 h-10"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar Forma de Pagamento
                    </Button>
                  </div>
                  
                </div>
                
                {/* Seção: Formas de Pagamento Configuradas */}
                {formasPagamento.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Formas de Pagamento Configuradas:</h4>
                    <ListaFormasPagamento
                      formas={formasPagamento}
                      onEditar={handleEditarForma}
                      onRemover={handleRemoverForma}
                    />
                  </div>
                )}
                
              </CardContent>
            </Card>
            
          </div>
          
        </div>
        
        {/* Modal de Formas de Pagamento */}
        <ModalFormasPagamento
          isOpen={modalFormasAberto}
          onClose={() => setModalFormasAberto(false)}
          onFormaPagamentoAdicionada={handleFormaPagamentoAdicionada}
        />

        {/* Modais específicos para edição */}
        <ModalAVista
          isOpen={modalAVistaAberto}
          onClose={fecharModalEdicao}
          onSalvar={(dados) => {
            console.log('📝 Editando À Vista:', dados);
            handleAtualizarForma(dados, 'a-vista');
          }}
          dadosIniciais={formaEditando?.tipo === 'a-vista' ? {
            valor: formaEditando.valor,
            data: formaEditando.dados?.data
          } : undefined}
        />

        <ModalBoleto
          isOpen={modalBoletoAberto}
          onClose={fecharModalEdicao}
          onSalvar={(dados) => {
            console.log('📝 Editando Boleto:', dados);
            handleAtualizarForma(dados, 'boleto');
          }}
          dadosIniciais={formaEditando?.tipo === 'boleto' ? {
            valor: formaEditando.valor,
            parcelas: formaEditando.dados?.parcelas
          } : undefined}
        />

        <ModalCartao
          isOpen={modalCartaoAberto}
          onClose={fecharModalEdicao}
          onSalvar={(dados) => {
            console.log('📝 Editando Cartão:', dados);
            handleAtualizarForma(dados, 'cartao');
          }}
          dadosIniciais={formaEditando?.tipo === 'cartao' ? {
            valor: formaEditando.valor,
            vezes: formaEditando.parcelas,
            taxa: formaEditando.dados?.taxa
          } : undefined}
        />

        <ModalFinanceira
          isOpen={modalFinanceiraAberto}
          onClose={fecharModalEdicao}
          onSalvar={(dados) => {
            console.log('📝 Editando Financeira:', dados);
            handleAtualizarForma(dados, 'financeira');
          }}
          dadosIniciais={formaEditando?.tipo === 'financeira' ? {
            valor: formaEditando.valor,
            vezes: formaEditando.parcelas,
            percentual: formaEditando.dados?.percentual,
            parcelas: formaEditando.dados?.parcelas
          } : undefined}
        />
        
      </div>
    </div>
  );
}