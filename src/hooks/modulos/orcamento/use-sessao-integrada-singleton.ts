import { useCallback, useMemo, useEffect, useState } from 'react';
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

// SINGLETON: Estado global compartilhado
class SessaoGlobal {
  private static instance: SessaoGlobal;
  private sessao: SessaoIntegrada = sessaoInicial;
  private listeners: Set<(sessao: SessaoIntegrada) => void> = new Set();
  private storageKey = 'fluyt_sessao_integrada';

  static getInstance(): SessaoGlobal {
    if (!SessaoGlobal.instance) {
      SessaoGlobal.instance = new SessaoGlobal();
    }
    return SessaoGlobal.instance;
  }

  constructor() {
    // LOCALSTORAGE DESABILITADO: Sempre iniciar com sessão limpa
    console.log('🆕 SessaoGlobal inicializada com sessão limpa (localStorage desabilitado)');
    
    // Limpar qualquer dado antigo do localStorage que possa estar interferindo
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.storageKey);
        console.log('🗑️ localStorage antigo removido:', this.storageKey);
      } catch (error) {
        console.warn('⚠️ Erro ao limpar localStorage antigo:', error);
      }
    }
  }

  private carregarDoLocalStorage() {
    // DESABILITADO: Não carregar do localStorage
    console.log('🚫 carregarDoLocalStorage desabilitado');
  }

  private salvarNoLocalStorage() {
    // DESABILITADO: Não salvar no localStorage
    console.log('🚫 salvarNoLocalStorage desabilitado');
  }

  private notificarListeners() {
    this.listeners.forEach(listener => listener(this.sessao));
  }

  getSessao(): SessaoIntegrada {
    return { ...this.sessao };
  }

  definirCliente(cliente: Cliente | null) {
    console.log('🔄 SessaoGlobal.definirCliente:', {
      anterior: this.sessao.cliente?.nome || 'null',
      novo: cliente?.nome || 'null'
    });

    this.sessao = {
      ...this.sessao,
      cliente,
      // Limpar ambientes se cliente mudou
      ambientes: cliente?.id !== this.sessao.cliente?.id ? [] : this.sessao.ambientes,
      valorTotalAmbientes: cliente?.id !== this.sessao.cliente?.id ? 0 : this.sessao.valorTotalAmbientes,
      ultimaAtualizacao: new Date().toISOString()
    };

    // this.salvarNoLocalStorage(); // DESABILITADO
    this.notificarListeners();
  }

  definirAmbientes(ambientes: Ambiente[]) {
    // Verificar se os ambientes realmente mudaram
    const ambientesIguais = this.sessao.ambientes.length === ambientes.length && 
      this.sessao.ambientes.every((amb, index) => amb.id === ambientes[index]?.id);
    
    if (ambientesIguais) {
      return; // Não fazer nada se os ambientes são iguais
    }
    
    const valorTotal = ambientes.reduce((total, ambiente) => total + ambiente.valorTotal, 0);
    
    this.sessao = {
      ...this.sessao,
      ambientes,
      valorTotalAmbientes: valorTotal,
      ultimaAtualizacao: new Date().toISOString()
    };

    // this.salvarNoLocalStorage(); // DESABILITADO
    this.notificarListeners();
  }

  adicionarAmbiente(ambiente: Ambiente) {
    const novosAmbientes = [...this.sessao.ambientes, ambiente];
    this.definirAmbientes(novosAmbientes);
  }

  removerAmbiente(ambienteId: string) {
    const novosAmbientes = this.sessao.ambientes.filter(amb => amb.id !== ambienteId);
    this.definirAmbientes(novosAmbientes);
  }

  limparSessao() {
    console.log('🧹 SessaoGlobal.limparSessao');
    this.sessao = { ...sessaoInicial };
    
    // DESABILITADO: Não mexer no localStorage
    // if (typeof window !== 'undefined') {
    //   localStorage.removeItem(this.storageKey);
    // }
    
    this.notificarListeners();
  }

  subscribe(listener: (sessao: SessaoIntegrada) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

/**
 * Hook singleton para gerenciar dados integrados entre as sessões
 * Cliente → Ambientes → Orçamento → Contratos
 */
export function useSessaoIntegradaSingleton() {
  const sessaoGlobal = SessaoGlobal.getInstance();
  const [sessao, setSessao] = useState<SessaoIntegrada>(sessaoGlobal.getSessao());
  
  // Identificador único para debug
  const hookId = useMemo(() => Math.random().toString(36).substr(2, 9), []);

  // Subscrever às mudanças
  useEffect(() => {
    const unsubscribe = sessaoGlobal.subscribe((novaSessao) => {
      console.log(`🔄 useSessaoSingleton[${hookId}] atualizada:`, {
        cliente: novaSessao.cliente?.nome || 'null',
        clienteId: novaSessao.cliente?.id || 'null'
      });
      setSessao(novaSessao);
    });

    return unsubscribe;
  }, [hookId]);

  // Funções de gerenciamento
  const definirCliente = useCallback((cliente: Cliente | null) => {
    sessaoGlobal.definirCliente(cliente);
  }, []);

  const definirAmbientes = useCallback((ambientes: Ambiente[]) => {
    sessaoGlobal.definirAmbientes(ambientes);
  }, []);

  const adicionarAmbiente = useCallback((ambiente: Ambiente) => {
    sessaoGlobal.adicionarAmbiente(ambiente);
  }, []);

  const removerAmbiente = useCallback((ambienteId: string) => {
    sessaoGlobal.removerAmbiente(ambienteId);
  }, []);

  const limparSessaoCompleta = useCallback(() => {
    sessaoGlobal.limparSessao();
  }, []);

  // Funções de validação
  const podeGerarOrcamento = useMemo(() => {
    return !!(sessao.cliente && sessao.ambientes.length > 0 && sessao.valorTotalAmbientes > 0);
  }, [sessao.cliente, sessao.ambientes.length, sessao.valorTotalAmbientes]);

  const podeGerarContrato = useMemo(() => {
    return podeGerarOrcamento;
  }, [podeGerarOrcamento]);

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
  console.log(`🔄 useSessaoSingleton[${hookId}] estado atual:`, {
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