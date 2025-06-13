/**
 * Hook ULTRA SIMPLES para sessão
 * Máxima simplicidade, zero complexidade
 */

import { useState, useCallback, useEffect } from 'react';
import { sessaoSimples, type SessaoSimples, type ClienteSimples, type AmbienteSimples } from '@/lib/sessao-simples';

export function useSessaoSimples() {
  const [sessao, setSessao] = useState<SessaoSimples>(() => {
    // Evitar erro SSR - retornar estado vazio no servidor
    if (typeof window === 'undefined') {
      return { cliente: null, ambientes: [], valorTotal: 0, formasPagamento: [] };
    }
    return sessaoSimples.carregar();
  });

  // Atualizar estado quando localStorage mudar (entre componentes)
  useEffect(() => {
    const handleStorageChange = () => {
      setSessao(sessaoSimples.carregar());
    };

    // Escutar mudanças no localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Escutar mudanças customizadas (mesmo componente)
    window.addEventListener('sessaoSimples-changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sessaoSimples-changed', handleStorageChange);
    };
  }, []);
  
  // Atualizar estado quando sessão mudar
  const atualizarSessao = useCallback(() => {
    setSessao(sessaoSimples.carregar());
  }, []);
  
  // Definir cliente
  const definirCliente = useCallback((cliente: ClienteSimples) => {
    const novaSessao = sessaoSimples.definirCliente(cliente);
    setSessao(novaSessao);
  }, []);
  
  // Definir cliente com contexto (para navegação)
  const definirClienteComContexto = useCallback((cliente: ClienteSimples, preservarAmbientes: boolean = true) => {
    const novaSessao = sessaoSimples.definirClienteComContexto(cliente, preservarAmbientes);
    setSessao(novaSessao);
  }, []);
  
  // Definir ambientes
  const definirAmbientes = useCallback((ambientes: AmbienteSimples[]) => {
    const novaSessao = sessaoSimples.definirAmbientes(ambientes);
    setSessao(novaSessao);
  }, []);
  
  // Limpar tudo
  const limparSessao = useCallback(() => {
    const novaSessao = sessaoSimples.limpar();
    setSessao(novaSessao);
  }, []);
  
  // Carregar cliente da URL (preservando contexto de navegação)
  const carregarClienteDaURL = useCallback((clienteId: string, clienteNome: string) => {
    const sessaoAtual = sessaoSimples.carregar();
    
    // Se não tem cliente ou é diferente, definir novo PRESERVANDO ambientes (navegação)
    if (!sessaoAtual.cliente || sessaoAtual.cliente.id !== clienteId) {
      setSessao(sessaoSimples.definirClienteComContexto({ id: clienteId, nome: clienteNome }, true));
    }
  }, []);
  
  // Debug
  const debug = useCallback(() => {
    sessaoSimples.debug();
  }, []);
  
  return {
    // Estado
    cliente: sessao.cliente,
    ambientes: sessao.ambientes,
    valorTotal: sessao.valorTotal,
    
    // Validações
    temCliente: !!sessao.cliente,
    temAmbientes: sessao.ambientes.length > 0,
    podeGerarOrcamento: sessaoSimples.podeGerarOrcamento(),
    
    // Ações
    definirCliente,
    definirClienteComContexto,
    definirAmbientes,
    limparSessao,
    carregarClienteDaURL,
    atualizarSessao,
    debug
  };
}