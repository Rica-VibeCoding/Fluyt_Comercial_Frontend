/**
 * Hook ULTRA SIMPLES para sessão
 * Máxima simplicidade, zero complexidade
 */

import { useState, useCallback } from 'react';
import { sessaoSimples, type SessaoSimples, type ClienteSimples, type AmbienteSimples } from '@/lib/sessao-simples';

export function useSessaoSimples() {
  const [sessao, setSessao] = useState<SessaoSimples>(() => sessaoSimples.carregar());
  
  // Atualizar estado quando sessão mudar
  const atualizarSessao = useCallback(() => {
    setSessao(sessaoSimples.carregar());
  }, []);
  
  // Definir cliente
  const definirCliente = useCallback((cliente: ClienteSimples) => {
    const novaSessao = sessaoSimples.definirCliente(cliente);
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
  
  // Carregar cliente da URL
  const carregarClienteDaURL = useCallback((clienteId: string, clienteNome: string) => {
    const sessaoAtual = sessaoSimples.carregar();
    
    // Se não tem cliente ou é diferente, definir novo
    if (!sessaoAtual.cliente || sessaoAtual.cliente.id !== clienteId) {
      setSessao(sessaoSimples.definirCliente({ id: clienteId, nome: clienteNome }));
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
    definirAmbientes,
    limparSessao,
    carregarClienteDaURL,
    atualizarSessao,
    debug
  };
}