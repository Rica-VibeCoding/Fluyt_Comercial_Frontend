/**
 * Store Zustand para gerenciamento de ambientes
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Ambiente } from '@/types/ambiente';

interface AmbientesState {
  // Estado dos dados
  ambientes: Ambiente[];
  ambienteSelecionado: Ambiente | null;
  
  // Estados de UI
  loading: boolean;
  erro: string | null;
  
  // Computados
  valorTotalAmbientes: number;
  ambientesPorCliente: Record<string, Ambiente[]>;
  
  // Ações de dados
  setAmbientes: (ambientes: Ambiente[]) => void;
  adicionarAmbiente: (ambiente: Ambiente) => void;
  atualizarAmbiente: (id: string, dadosAtualizados: Partial<Ambiente>) => void;
  removerAmbiente: (id: string) => void;
  selecionarAmbiente: (ambiente: Ambiente | null) => void;
  
  // Ações de UI
  setLoading: (loading: boolean) => void;
  setErro: (erro: string | null) => void;
  
  // Ações específicas
  obterAmbientesPorCliente: (clienteId: string) => Ambiente[];
  calcularValorTotal: (clienteId?: string) => number;
  limparAmbientesCliente: (clienteId: string) => void;
}

export const useAmbientesStore = create<AmbientesState>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      ambientes: [],
      ambienteSelecionado: null,
      loading: false,
      erro: null,
      valorTotalAmbientes: 0,
      ambientesPorCliente: {},
      
      // Ações de dados
      setAmbientes: (ambientes) => {
        const valorTotal = ambientes.reduce((acc, ambiente) => acc + ambiente.valor_total, 0);
        const porCliente = ambientes.reduce((acc, ambiente) => {
          if (!acc[ambiente.cliente_id]) {
            acc[ambiente.cliente_id] = [];
          }
          acc[ambiente.cliente_id].push(ambiente);
          return acc;
        }, {} as Record<string, Ambiente[]>);
        
        set({ 
          ambientes, 
          valorTotalAmbientes: valorTotal,
          ambientesPorCliente: porCliente
        });
      },
      
      adicionarAmbiente: (ambiente) => set((state) => {
        const novosAmbientes = [...state.ambientes, ambiente];
        const valorTotal = novosAmbientes.reduce((acc, amb) => acc + amb.valor_total, 0);
        const porCliente = { ...state.ambientesPorCliente };
        
        if (!porCliente[ambiente.cliente_id]) {
          porCliente[ambiente.cliente_id] = [];
        }
        porCliente[ambiente.cliente_id].push(ambiente);
        
        return {
          ambientes: novosAmbientes,
          valorTotalAmbientes: valorTotal,
          ambientesPorCliente: porCliente
        };
      }),
      
      atualizarAmbiente: (id, dadosAtualizados) => set((state) => {
        const novosAmbientes = state.ambientes.map(ambiente => 
          ambiente.id === id ? { ...ambiente, ...dadosAtualizados } : ambiente
        );
        const valorTotal = novosAmbientes.reduce((acc, ambiente) => acc + ambiente.valor_total, 0);
        
        // Recalcular ambientes por cliente
        const porCliente = novosAmbientes.reduce((acc, ambiente) => {
          if (!acc[ambiente.cliente_id]) {
            acc[ambiente.cliente_id] = [];
          }
          acc[ambiente.cliente_id].push(ambiente);
          return acc;
        }, {} as Record<string, Ambiente[]>);
        
        return {
          ambientes: novosAmbientes,
          valorTotalAmbientes: valorTotal,
          ambientesPorCliente: porCliente,
          ambienteSelecionado: state.ambienteSelecionado?.id === id 
            ? { ...state.ambienteSelecionado, ...dadosAtualizados }
            : state.ambienteSelecionado
        };
      }),
      
      removerAmbiente: (id) => set((state) => {
        const ambiente = state.ambientes.find(amb => amb.id === id);
        const novosAmbientes = state.ambientes.filter(ambiente => ambiente.id !== id);
        const valorTotal = novosAmbientes.reduce((acc, ambiente) => acc + ambiente.valor_total, 0);
        
        // Recalcular ambientes por cliente
        const porCliente = novosAmbientes.reduce((acc, ambiente) => {
          if (!acc[ambiente.cliente_id]) {
            acc[ambiente.cliente_id] = [];
          }
          acc[ambiente.cliente_id].push(ambiente);
          return acc;
        }, {} as Record<string, Ambiente[]>);
        
        return {
          ambientes: novosAmbientes,
          valorTotalAmbientes: valorTotal,
          ambientesPorCliente: porCliente,
          ambienteSelecionado: state.ambienteSelecionado?.id === id 
            ? null 
            : state.ambienteSelecionado
        };
      }),
      
      selecionarAmbiente: (ambiente) => set({ ambienteSelecionado: ambiente }),
      
      // Ações de UI
      setLoading: (loading) => set({ loading }),
      setErro: (erro) => set({ erro }),
      
      // Ações específicas
      obterAmbientesPorCliente: (clienteId) => {
        const { ambientesPorCliente } = get();
        return ambientesPorCliente[clienteId] || [];
      },
      
      calcularValorTotal: (clienteId) => {
        const { ambientes } = get();
        if (clienteId) {
          return ambientes
            .filter(ambiente => ambiente.cliente_id === clienteId)
            .reduce((acc, ambiente) => acc + ambiente.valor_total, 0);
        }
        return ambientes.reduce((acc, ambiente) => acc + ambiente.valor_total, 0);
      },
      
      limparAmbientesCliente: (clienteId) => set((state) => {
        const novosAmbientes = state.ambientes.filter(ambiente => ambiente.cliente_id !== clienteId);
        const valorTotal = novosAmbientes.reduce((acc, ambiente) => acc + ambiente.valor_total, 0);
        
        const porCliente = { ...state.ambientesPorCliente };
        delete porCliente[clienteId];
        
        return {
          ambientes: novosAmbientes,
          valorTotalAmbientes: valorTotal,
          ambientesPorCliente: porCliente
        };
      })
    }),
    { name: 'ambientes-store' }
  )
);