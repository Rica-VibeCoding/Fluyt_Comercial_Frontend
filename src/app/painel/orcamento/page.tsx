'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useOrcamento } from '@/hooks/data/use-orcamento';
import { useFormasPagamento } from '@/hooks/data/use-formas-pagamento';
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
import { FormaPagamento } from '@/types/orcamento';
import { useCalculadoraNegociacao, CalculadoraNegociacao } from '@/lib/calculadora-negociacao';

export default function OrcamentoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // ✅ SISTEMA SIMPLIFICADO: Usar apenas useSessaoSimples (funcionava)
  const { cliente, ambientes, carregarClienteDaURL } = useSessaoSimples();
  
  // ✅ FORMAS DE PAGAMENTO: Sistema local (UI state)
  const {
    formasPagamento, modalFormasAberto, modalAVistaAberto, modalBoletoAberto,
    modalCartaoAberto, modalFinanceiraAberto, formaEditando,
    adicionarFormaPagamento, editarFormaPagamento, removerFormaPagamento,
    abrirModalFormas, fecharModalFormas, abrirModalEdicao, fecharModalEdicao
  } = useFormasPagamento();
  // ✅ ESTADOS LOCAIS SIMPLES
  const [desconto, setDesconto] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // ✅ CÁLCULOS HÍBRIDOS (manual + calculadora para debug)
  const valorTotal = ambientes.reduce((total, ambiente) => total + ambiente.valor, 0);
  const descontoNumero = parseFloat(desconto) || 0;
  
  // Cálculo manual do valor negociado (garantir que funciona)
  const valorNegociadoManual = valorTotal * (1 - descontoNumero / 100);
  
  // Usar calculadora para valores avançados (com fallback)
  let calculoNegociacao;
  try {
    calculoNegociacao = useCalculadoraNegociacao(valorTotal, descontoNumero, formasPagamento);
  } catch (error) {
    console.error('❌ Erro na calculadora:', error);
    calculoNegociacao = {
      valorNegociado: valorNegociadoManual,
      valorPresenteTotal: 0,
      descontoReal: 0,
      diferenca: 0,
      formasPagamento: [],
      erros: ['Erro na calculadora'],
      alteracoesFeitas: []
    };
  }
  
  // Valores derivados (usar manual como fallback)
  const valorNegociado = calculoNegociacao?.valorNegociado || valorNegociadoManual;
  const valorPresenteTotal = calculoNegociacao?.valorPresenteTotal || 0;
  const descontoReal = calculoNegociacao?.descontoReal || 0;
  const valorTotalFormas = formasPagamento.reduce((total, forma) => total + forma.valor, 0);
  const valorRestante = valorNegociado - valorTotalFormas;
  
  // Debug logs
  console.log('🔍 Debug Orçamento:', {
    valorTotal,
    descontoNumero,
    valorNegociadoManual,
    valorNegociadoCalculadora: calculoNegociacao?.valorNegociado,
    calculoNegociacao
  });

  // ✅ CARREGAMENTO SIMPLES (como funcionava)
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
  
  // ✅ NAVEGAÇÃO SIMPLES 
  const navegarParaContratos = () => {
    if (cliente && ambientes.length > 0 && formasPagamento.length > 0) {
      console.log('✅ Navegando para contratos');
      router.push(`/painel/contratos?clienteId=${cliente?.id}&clienteNome=${encodeURIComponent(cliente?.nome || '')}`);
    }
  };
  
  // ✅ HANDLERS SIMPLES (como funcionavam)
  const handleFormaPagamentoAdicionada = (forma: { tipo: string; valor?: number; detalhes?: any }) => {
    console.log('📥 Forma de pagamento adicionada:', forma);
    
    const tipoMapeado = (() => {
      switch (forma.tipo) {
        case 'À Vista': return 'a-vista';
        case 'Boleto': return 'boleto';
        case 'Cartão': return 'cartao';
        case 'Financeira': return 'financeira';
        default: return 'a-vista';
      }
    })() as 'a-vista' | 'boleto' | 'cartao' | 'financeira';
    
    const novaForma = {
      tipo: tipoMapeado,
      valor: forma.valor || 0,
      valorPresente: forma.detalhes?.valorPresente || forma.valor || 0,
      parcelas: forma.detalhes?.vezes || forma.detalhes?.parcelas?.length || 1,
      dados: forma.detalhes
    };
    
    adicionarFormaPagamento(novaForma);
    fecharModalFormas();
  };

  const handleEditarForma = (forma: FormaPagamento) => {
    console.log('✏️ Editando forma:', forma);
    
    // Usar action do store para abrir modal de edição
    abrirModalEdicao(forma);
  };

  // Handler para atualizar forma existente
  const handleAtualizarForma = (dadosNovos: any, tipo: 'a-vista' | 'boleto' | 'cartao' | 'financeira') => {
    if (!formaEditando) return;

    console.log('📝 Atualizando forma:', { id: formaEditando.id, dadosNovos });
    
    // Criar dados atualizados
    const dadosAtualizados = {
      valor: dadosNovos.valor || 0,
      valorPresente: dadosNovos.valorPresente || dadosNovos.valor || 0,
      parcelas: dadosNovos.vezes || dadosNovos.parcelas?.length || 1,
      dados: dadosNovos
    };
    
    // Atualizar usando action do store
    editarFormaPagamento(formaEditando.id, dadosAtualizados);
    
    // Fechar modal de edição
    fecharModalEdicao();
  };

  const handleRemoverForma = (id: string) => {
    console.log('🟡️ Removendo forma:', id);
    
    // Remover usando action do store
    removerFormaPagamento(id);
  };

  // ✅ HANDLER TRAVAMENTO (novo com calculadora)
  const handleToggleTravamento = (id: string) => {
    console.log('🔒 Togglando travamento da forma:', id);
    
    // Usar calculadora para alterar travamento
    const formasAtualizadas = CalculadoraNegociacao.toggleTravamento(formasPagamento, id);
    
    // Atualizar cada forma individualmente para manter compatibilidade
    const formaAtualizada = formasAtualizadas.find(f => f.id === id);
    if (formaAtualizada) {
      editarFormaPagamento(id, { travada: formaAtualizada.travada });
    }
  };

  // ✅ VALIDAÇÃO SIMPLES
  const obterValoresValidacao = () => ({
    valorMaximo: valorNegociado,
    valorJaAlocado: formaEditando ? 
      (valorTotalFormas - formaEditando.valor) : 
      valorTotalFormas
  });
  
  // ✅ HANDLER DESCONTO SIMPLES  
  const handleDescontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDesconto(e.target.value);
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
              disabled={!(cliente && ambientes.length > 0 && formasPagamento.length > 0)}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              {(cliente && ambientes.length > 0 && formasPagamento.length > 0) ? <CheckCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              {(cliente && ambientes.length > 0 && formasPagamento.length > 0) ? 'Gerar Contrato' : 'Configure Pagamento'}
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
                    R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                      R$ {valorNegociado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Card Desconto Real */}
              <div className="flex">
                <Card className="flex-1">
                  <CardContent className="p-4 h-full flex flex-col justify-between">
                    <h3 className="font-semibold">Desconto Real</h3>
                    <p className={`text-2xl font-bold ${
                      descontoReal > descontoNumero ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {descontoReal.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Card Valor Recebido */}
              <div className="flex">
                <Card className="flex-1">
                  <CardContent className="p-4 h-full flex flex-col justify-between">
                    <h3 className="font-semibold">Valor Recebido</h3>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {valorPresenteTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
            </div>

            {/* Card Plano de Pagamento */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Plano de Pagamento</h3>
                  <div className="text-sm">
                    <span className="text-gray-600">Restante: </span>
                    <span className={`font-bold ${
                      valorRestante >= 0 ? 'text-green-600' : 'text-red-500'
                    }`}>
                      R$ {valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-gray-500"> / R$ {valorNegociado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                
                {/* Indicador de Erros da Calculadora */}
                {calculoNegociacao?.erros?.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="text-red-600 text-sm">
                        <strong>⚠️ Atenção:</strong>
                        <ul className="mt-1 space-y-1">
                          {calculoNegociacao.erros.map((erro, index) => (
                            <li key={index}>• {erro}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Indicador de Alterações Automáticas */}
                {calculoNegociacao?.alteracoesFeitas?.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="text-blue-600 text-sm">
                        <strong>ℹ️ Info:</strong>
                        <ul className="mt-1 space-y-1">
                          {calculoNegociacao.alteracoesFeitas.map((alteracao, index) => (
                            <li key={index}>• {alteracao}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Layout em linha: Desconto + Botão Adicionar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  
                  {/* Campo Desconto - 1/3 da largura */}
                  <div className="flex-shrink-0 w-full sm:w-48">
                    <label className="block text-sm font-medium mb-2">Desconto (%)</label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={desconto}
                        onChange={handleDescontoChange}
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
                      onClick={abrirModalFormas}
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
                      onToggleTravamento={handleToggleTravamento}
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
          onClose={fecharModalFormas}
          onFormaPagamentoAdicionada={handleFormaPagamentoAdicionada}
          {...obterValoresValidacao()}
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
          {...obterValoresValidacao()}
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
          {...obterValoresValidacao()}
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
          {...obterValoresValidacao()}
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
          {...obterValoresValidacao()}
        />
        
      </div>
    </div>
  );
}