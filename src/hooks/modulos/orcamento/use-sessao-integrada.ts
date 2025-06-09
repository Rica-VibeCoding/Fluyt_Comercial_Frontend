import { useCallback, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/globais/use-local-storage';
import { Cliente } from '@/types/cliente';
import { Ambiente } from '@/types/ambiente';

interface SessaoIntegrada {
  cliente: Cliente | null;
  ambientes: Ambiente[];
  valorTotalAmbientes: number;
  ultimaAtualizacao: string;
}

const sessaoInicial: SessaoIntegrada = {
  cliente: null,
  ambientes: [],
  valorTotalAmbientes: 0,
  ultimaAtualizacao: new Date().toISOString()
};

/**
 * Hook para gerenciar dados integrados entre as sessões
 * Cliente → Ambientes → Orçamento → Contratos
 */
export function useSessaoIntegrada() {
  const [sessao, setSessao, limparSessao] = useLocalStorage<SessaoIntegrada>(
    'fluyt_sessao_integrada',
    sessaoInicial
  );
  
  // Identificador único para debug
  const hookId = useMemo(() => Math.random().toString(36).substr(2, 9), []);

  // Função para definir cliente selecionado
  const definirCliente = useCallback((cliente: Cliente | null) => {
    // Rastrear quem está chamando esta função
    const stack = new Error().stack;
    const caller = stack?.split('\n').slice(1, 4).map(line => line.trim()).join(' -> ') || 'unknown';
    
    console.log(`🔄 SessaoIntegrada[${hookId}].definirCliente:`, {
      novoCliente: cliente?.nome || 'null',
      novoClienteId: cliente?.id || 'null'
    });
    
    setSessao(prev => {
      // Debug: mudança de cliente
      if (prev.cliente && cliente && prev.cliente.id !== cliente.id) {
        console.log('🔄 Mudança de cliente detectada:', {
          anterior: prev.cliente?.nome,
          novo: cliente?.nome
        });
      }
      
      console.log('📥 Estado anterior da sessão:', {
        cliente: prev.cliente?.nome || 'null',
        clienteId: prev.cliente?.id || 'null'
      });
      
      const novoEstado = {
        ...prev,
        cliente,
        // Limpar ambientes se cliente mudou
        ambientes: cliente?.id !== prev.cliente?.id ? [] : prev.ambientes,
        valorTotalAmbientes: cliente?.id !== prev.cliente?.id ? 0 : prev.valorTotalAmbientes,
        ultimaAtualizacao: new Date().toISOString()
      };
      
      console.log('📤 Novo estado da sessão:', {
        cliente: novoEstado.cliente?.nome || 'null',
        clienteId: novoEstado.cliente?.id || 'null',
        ambientes: novoEstado.ambientes.length
      });
      
      return novoEstado;
    });
  }, [setSessao]);

  // Função para definir ambientes
  const definirAmbientes = useCallback((ambientes: Ambiente[]) => {
    setSessao(prev => {
      // Verificar se os ambientes realmente mudaram para evitar loops
      const ambientesIguais = prev.ambientes.length === ambientes.length && 
        prev.ambientes.every((amb, index) => amb.id === ambientes[index]?.id);
      
      if (ambientesIguais) {
        return prev; // Não fazer nada se os ambientes são iguais
      }
      
      const valorTotal = ambientes.reduce((total, ambiente) => total + ambiente.valorTotal, 0);
      
      return {
        ...prev,
        ambientes,
        valorTotalAmbientes: valorTotal,
        ultimaAtualizacao: new Date().toISOString()
      };
    });
  }, [setSessao]);

  // Função para adicionar um ambiente
  const adicionarAmbiente = useCallback((ambiente: Ambiente) => {
    setSessao(prev => {
      const novosAmbientes = [...prev.ambientes, ambiente];
      const valorTotal = novosAmbientes.reduce((total, amb) => total + amb.valorTotal, 0);
      
      return {
        ...prev,
        ambientes: novosAmbientes,
        valorTotalAmbientes: valorTotal,
        ultimaAtualizacao: new Date().toISOString()
      };
    });
  }, [setSessao]);

  // Função para remover um ambiente
  const removerAmbiente = useCallback((ambienteId: string) => {
    setSessao(prev => {
      const novosAmbientes = prev.ambientes.filter(amb => amb.id !== ambienteId);
      const valorTotal = novosAmbientes.reduce((total, amb) => total + amb.valorTotal, 0);
      
      return {
        ...prev,
        ambientes: novosAmbientes,
        valorTotalAmbientes: valorTotal,
        ultimaAtualizacao: new Date().toISOString()
      };
    });
  }, [setSessao]);

  // Função para verificar se há dados válidos para orçamento
  const podeGerarOrcamento = useMemo(() => {
    return !!(sessao.cliente && sessao.ambientes.length > 0 && sessao.valorTotalAmbientes > 0);
  }, [sessao.cliente, sessao.ambientes.length, sessao.valorTotalAmbientes]);

  // Função para verificar se há dados válidos para contrato
  const podeGerarContrato = useMemo(() => {
    return podeGerarOrcamento; // Mesmas condições por enquanto
  }, [podeGerarOrcamento]);

  // Função para limpar toda a sessão
  const limparSessaoCompleta = useCallback(() => {
    limparSessao();
  }, [limparSessao]);

  // Função para obter resumo da sessão
  const obterResumo = () => {
    return {
      temCliente: !!sessao.cliente,
      quantidadeAmbientes: sessao.ambientes.length,
      valorTotal: sessao.valorTotalAmbientes,
      podeAvancar: podeGerarOrcamento
    };
  };

  // Debug: monitorar estado da sessão
  console.log(`🔄 useSessaoIntegrada[${hookId}] estado atual:`, {
    cliente: sessao.cliente?.nome || 'null',
    clienteId: sessao.cliente?.id || 'null',
    ambientes: sessao.ambientes.length
  });

  return {
    // Dados da sessão
    cliente: sessao.cliente,
    ambientes: sessao.ambientes,
    valorTotalAmbientes: sessao.valorTotalAmbientes,
    ultimaAtualizacao: sessao.ultimaAtualizacao,
    
    // Funções de gerenciamento
    definirCliente,
    definirAmbientes,
    adicionarAmbiente,
    removerAmbiente,
    
    // Funções de validação
    podeGerarOrcamento,
    podeGerarContrato,
    
    // Funções utilitárias
    obterResumo,
    limparSessaoCompleta
  };
}