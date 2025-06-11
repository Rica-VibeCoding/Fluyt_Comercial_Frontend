/**
 * Store Zustand para gerenciamento de orçamentos
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { FormaPagamento, Simulacao, TravamentoConfig } from '@/types/simulador';

interface OrcamentoState {
  // Estado da simulação
  simulacao: Simulacao;
  
  // Estados de UI
  loading: boolean;
  erro: string | null;
  modalAberto: boolean;
  editandoForma: FormaPagamento | null;
  
  // Ações da simulação
  setSimulacao: (simulacao: Simulacao) => void;
  atualizarSimulacao: (dadosAtualizados: Partial<Simulacao>) => void;
  resetarSimulacao: () => void;
  
  // Ações de formas de pagamento
  adicionarFormaPagamento: (forma: Omit<FormaPagamento, 'id' | 'valorRecebido'>) => void;
  atualizarFormaPagamento: (id: string, dadosAtualizados: Partial<FormaPagamento>) => void;
  removerFormaPagamento: (id: string) => void;
  limparFormasPagamento: () => void;
  alternarTravamentoForma: (id: string) => void;
  
  // Ações de travamento
  alternarTravamento: (campo: keyof TravamentoConfig, valor?: boolean) => void;
  resetarTravamentos: () => void;
  
  // Ações de valores
  definirValorBruto: (valor: number) => void;
  definirValorNegociado: (valor: number) => void;
  definirDescontoReal: (desconto: number) => void;
  
  // Ações de UI
  setLoading: (loading: boolean) => void;
  setErro: (erro: string | null) => void;
  abrirModal: () => void;
  fecharModal: () => void;
  setEditandoForma: (forma: FormaPagamento | null) => void;
  
  // Computados
  podeGerarOrcamento: () => boolean;
  valorTotalFormas: () => number;
  descontoAplicado: () => number;
}

const simulacaoInicial: Simulacao = {
  valorBruto: 0,
  desconto: 0,
  valorNegociado: 0,
  formasPagamento: [],
  valorRecebidoTotal: 0,
  descontoReal: 0,
  valorRestante: 0,
  travamentos: {
    valorNegociado: false,
    descontoReal: false,
    limiteDescontoReal: 25,
    descontoRealFixo: false,
    valorDescontoRealFixo: 0
  }
};

export const useOrcamentoStore = create<OrcamentoState>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      simulacao: simulacaoInicial,
      loading: false,
      erro: null,
      modalAberto: false,
      editandoForma: null,
      
      // Ações da simulação
      setSimulacao: (simulacao) => set({ simulacao }),
      
      atualizarSimulacao: (dadosAtualizados) => set((state) => ({
        simulacao: { ...state.simulacao, ...dadosAtualizados }
      })),
      
      resetarSimulacao: () => set({ simulacao: simulacaoInicial }),
      
      // Ações de formas de pagamento
      adicionarFormaPagamento: (forma) => set((state) => {
        const novaForma: FormaPagamento = {
          ...forma,
          id: Date.now().toString(),
          valorRecebido: 0,
          travado: false
        };
        
        const novasFormas = [...state.simulacao.formasPagamento, novaForma];
        
        return {
          simulacao: {
            ...state.simulacao,
            formasPagamento: novasFormas
          }
        };
      }),
      
      atualizarFormaPagamento: (id, dadosAtualizados) => set((state) => ({
        simulacao: {
          ...state.simulacao,
          formasPagamento: state.simulacao.formasPagamento.map(forma =>
            forma.id === id ? { ...forma, ...dadosAtualizados } : forma
          )
        }
      })),
      
      removerFormaPagamento: (id) => set((state) => ({
        simulacao: {
          ...state.simulacao,
          formasPagamento: state.simulacao.formasPagamento.filter(forma => forma.id !== id)
        }
      })),
      
      limparFormasPagamento: () => set((state) => ({
        simulacao: {
          ...state.simulacao,
          formasPagamento: [],
          valorRecebidoTotal: 0,
          descontoReal: 0,
          valorRestante: state.simulacao.valorNegociado
        }
      })),
      
      alternarTravamentoForma: (id) => set((state) => ({
        simulacao: {
          ...state.simulacao,
          formasPagamento: state.simulacao.formasPagamento.map(forma =>
            forma.id === id ? { ...forma, travado: !forma.travado } : forma
          )
        }
      })),
      
      // Ações de travamento
      alternarTravamento: (campo, valor) => set((state) => ({
        simulacao: {
          ...state.simulacao,
          travamentos: {
            ...state.simulacao.travamentos,
            [campo]: valor !== undefined ? valor : !state.simulacao.travamentos[campo]
          }
        }
      })),
      
      // Método para destravar todos os travamentos
      resetarTravamentos: () => set((state) => ({
        simulacao: {
          ...state.simulacao,
          travamentos: {
            ...state.simulacao.travamentos,
            descontoRealFixo: false,
            valorDescontoRealFixo: 0,
            valorNegociado: false
          }
        }
      })),

      
      // Ações de valores
      definirValorBruto: (valor) => set((state) => ({
        simulacao: {
          ...state.simulacao,
          valorBruto: valor
        }
      })),
      
      definirValorNegociado: (valor) => set((state) => ({
        simulacao: {
          ...state.simulacao,
          valorNegociado: valor,
          desconto: state.simulacao.valorBruto > 0 
            ? ((state.simulacao.valorBruto - valor) / state.simulacao.valorBruto) * 100 
            : 0
        }
      })),
      
      definirDescontoReal: (desconto) => set((state) => ({
        simulacao: {
          ...state.simulacao,
          descontoReal: desconto
        }
      })),
      
      // Ações de UI
      setLoading: (loading) => set({ loading }),
      setErro: (erro) => set({ erro }),
      abrirModal: () => set({ modalAberto: true }),
      fecharModal: () => set({ modalAberto: false, editandoForma: null }),
      setEditandoForma: (forma) => set({ editandoForma: forma }),
      
      // Computados
      podeGerarOrcamento: () => {
        const { simulacao } = get();
        return simulacao.valorBruto > 0 && simulacao.formasPagamento.length > 0;
      },
      
      valorTotalFormas: () => {
        const { simulacao } = get();
        return simulacao.formasPagamento.reduce((acc, forma) => acc + forma.valor, 0);
      },
      
      descontoAplicado: () => {
        const { simulacao } = get();
        return simulacao.valorBruto > 0 
          ? ((simulacao.valorBruto - simulacao.valorNegociado) / simulacao.valorBruto) * 100 
          : 0;
      }
    }),
    { name: 'orcamento-store' }
  )
);