import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Cliente } from '@/types/cliente';
import { Ambiente } from '@/types/ambiente';

interface SessaoState {
  // Estado da sessão
  cliente: Cliente | null;
  ambientes: Ambiente[];
  valorTotalAmbientes: number;
  ultimaAtualizacao: string;
  
  // Ações para gerenciar cliente
  definirCliente: (cliente: Cliente | null) => void;
  limparCliente: () => void;
  
  // Ações para gerenciar ambientes
  definirAmbientes: (ambientes: Ambiente[]) => void;
  adicionarAmbiente: (ambiente: Ambiente) => void;
  removerAmbiente: (ambienteId: string) => void;
  
  // Ações para gerenciar sessão
  limparSessaoCompleta: () => void;
  
  // Getters computados
  podeGerarOrcamento: () => boolean;
  podeGerarContrato: () => boolean;
  obterResumo: () => {
    temCliente: boolean;
    quantidadeAmbientes: number;
    valorTotal: number;
    podeAvancar: boolean;
  };
}

export const useSessaoStore = create<SessaoState>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      cliente: null,
      ambientes: [],
      valorTotalAmbientes: 0,
      ultimaAtualizacao: new Date().toISOString(),

      // === AÇÕES PARA CLIENTE ===
      definirCliente: (cliente) => {
        console.log('🔄 SessaoStore.definirCliente:', {
          anterior: get().cliente?.nome || 'null',
          novo: cliente?.nome || 'null'
        });

        set((state) => {
          const clienteMudou = cliente?.id !== state.cliente?.id;
          
          return {
            cliente,
            // Limpar ambientes se cliente mudou
            ambientes: clienteMudou ? [] : state.ambientes,
            valorTotalAmbientes: clienteMudou ? 0 : state.valorTotalAmbientes,
            ultimaAtualizacao: new Date().toISOString()
          };
        }, false, 'definirCliente');
      },

      limparCliente: () => {
        console.log('🧹 SessaoStore.limparCliente');
        set({
          cliente: null,
          ambientes: [],
          valorTotalAmbientes: 0,
          ultimaAtualizacao: new Date().toISOString()
        }, false, 'limparCliente');
      },

      // === AÇÕES PARA AMBIENTES ===
      definirAmbientes: (ambientes) => {
        const state = get();
        
        // Verificar se os ambientes realmente mudaram
        const ambientesIguais = state.ambientes.length === ambientes.length && 
          state.ambientes.every((amb, index) => amb.id === ambientes[index]?.id);
        
        if (ambientesIguais) {
          return; // Não fazer nada se os ambientes são iguais
        }
        
        const valorTotal = ambientes.reduce((total, ambiente) => total + ambiente.valorTotal, 0);
        
        console.log('📋 SessaoStore.definirAmbientes:', {
          quantidade: ambientes.length,
          valorTotal
        });
        
        set({
          ambientes,
          valorTotalAmbientes: valorTotal,
          ultimaAtualizacao: new Date().toISOString()
        }, false, 'definirAmbientes');
      },

      adicionarAmbiente: (ambiente) => {
        console.log('➕ SessaoStore.adicionarAmbiente:', ambiente.nome);
        
        set((state) => {
          const novosAmbientes = [...state.ambientes, ambiente];
          const valorTotal = novosAmbientes.reduce((total, amb) => total + amb.valorTotal, 0);
          
          return {
            ambientes: novosAmbientes,
            valorTotalAmbientes: valorTotal,
            ultimaAtualizacao: new Date().toISOString()
          };
        }, false, 'adicionarAmbiente');
      },

      removerAmbiente: (ambienteId) => {
        console.log('➖ SessaoStore.removerAmbiente:', ambienteId);
        
        set((state) => {
          const novosAmbientes = state.ambientes.filter(amb => amb.id !== ambienteId);
          const valorTotal = novosAmbientes.reduce((total, amb) => total + amb.valorTotal, 0);
          
          return {
            ambientes: novosAmbientes,
            valorTotalAmbientes: valorTotal,
            ultimaAtualizacao: new Date().toISOString()
          };
        }, false, 'removerAmbiente');
      },

      // === AÇÕES PARA SESSÃO ===
      limparSessaoCompleta: () => {
        console.log('🧹 SessaoStore.limparSessaoCompleta');
        set({
          cliente: null,
          ambientes: [],
          valorTotalAmbientes: 0,
          ultimaAtualizacao: new Date().toISOString()
        }, false, 'limparSessaoCompleta');
      },

      // === GETTERS COMPUTADOS ===
      podeGerarOrcamento: () => {
        const state = get();
        return !!(state.cliente && state.ambientes.length > 0 && state.valorTotalAmbientes > 0);
      },

      podeGerarContrato: () => {
        return get().podeGerarOrcamento();
      },

      obterResumo: () => {
        const state = get();
        return {
          temCliente: !!state.cliente,
          quantidadeAmbientes: state.ambientes.length,
          valorTotal: state.valorTotalAmbientes,
          podeAvancar: state.podeGerarOrcamento()
        };
      }
    }),
    {
      name: 'sessao-store', // nome para dev tools
    }
  )
);

// Hook personalizado para facilitar o uso
export const useSessao = () => {
  const store = useSessaoStore();
  
  // Debug: monitorar estado
  console.log('🔄 useSessao estado:', {
    cliente: store.cliente?.nome || 'null',
    clienteId: store.cliente?.id || 'null',
    ambientes: store.ambientes.length
  });
  
  return store;
};