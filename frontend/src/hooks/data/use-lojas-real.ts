/**
 * Hook para Lojas - DADOS REAIS DO SUPABASE
 * Conecta diretamente com backend implementado pelo C.Testa
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { lojasApi, type LojaApi, type LojaFormData } from '@/services/lojas-api';
import type { Loja } from '@/types/sistema';

export interface UseLojasRealReturn {
  // Dados
  lojas: Loja[];
  loading: boolean;
  error: string | null;

  // Estatísticas
  totalLojas: number;
  lojasAtivas: number;
  lojasInativas: number;
  lojasPorEmpresa: Record<string, number>;

  // Funções de busca
  obterLojaPorId: (id: string) => Loja | undefined;
  obterLojasPorEmpresa: (empresaId: string) => Loja[];
  buscarLojas: (termo: string) => Loja[];

  // Funções CRUD
  criarLoja: (dados: LojaFormData) => Promise<boolean>;
  atualizarLoja: (id: string, dados: Partial<LojaFormData>) => Promise<boolean>;
  desativarLoja: (id: string) => Promise<boolean>;
  validarCodigo: (codigo: string, lojaId?: string) => Promise<boolean>;

  // Controle
  recarregarDados: () => Promise<void>;
  filtrarPorEmpresa: (empresaId: string | null) => void;
}

export function useLojasReal(): UseLojasRealReturn {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEmpresa, setFiltroEmpresa] = useState<string | null>(null);

  // Converter dados da API para formato do frontend
  const converterLojaApi = useCallback((lojaApi: LojaApi): Loja => ({
    id: lojaApi.id,
    nome: lojaApi.nome,
    codigo: lojaApi.codigo,
    empresaId: lojaApi.empresa_id,
    gerenteId: lojaApi.gerente_id,
    endereco: lojaApi.endereco,
    telefone: lojaApi.telefone,
    email: lojaApi.email,
    dataAbertura: lojaApi.data_abertura,
    ativo: lojaApi.ativo,
    createdAt: lojaApi.created_at,
    updatedAt: lojaApi.updated_at,
    // Dados relacionados
    empresa: lojaApi.cad_empresas?.nome || '',
    funcionarios: 0 // Será implementado futuramente
  }), []);

  // Função para carregar dados reais do Supabase
  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔗 Carregando lojas reais do backend...');
      
      const filtros = filtroEmpresa ? { empresa_id: filtroEmpresa } : undefined;
      const { lojas: lojasData } = await lojasApi.listarLojas(filtros);
      
      // Converter dados da API para formato do frontend
      const lojasConvertidas = lojasData.map(converterLojaApi);
      
      setLojas(lojasConvertidas);
      
      console.log('✅ Lojas carregadas:', {
        total: lojasConvertidas.length,
        filtro: filtroEmpresa ? `empresa ${filtroEmpresa}` : 'todas'
      });
      
      if (lojasConvertidas.length > 0) {
        const msgFiltro = filtroEmpresa ? ` (filtradas por empresa)` : '';
        toast.success(`${lojasConvertidas.length} loja(s) carregada(s)${msgFiltro}`);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro ao carregar lojas:', err);
      toast.error(`Erro ao carregar lojas: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [filtroEmpresa, converterLojaApi]);

  // Carregar dados na inicialização
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Função para recarregar dados
  const recarregarDados = useCallback(async () => {
    await carregarDados();
  }, [carregarDados]);

  // Filtrar por empresa
  const filtrarPorEmpresa = useCallback((empresaId: string | null) => {
    setFiltroEmpresa(empresaId);
  }, []);

  // Obter loja por ID
  const obterLojaPorId = useCallback((id: string): Loja | undefined => {
    return lojas.find(loja => loja.id === id);
  }, [lojas]);

  // Obter lojas de uma empresa
  const obterLojasPorEmpresa = useCallback((empresaId: string): Loja[] => {
    return lojas.filter(loja => loja.empresaId === empresaId);
  }, [lojas]);

  // Buscar lojas por termo
  const buscarLojas = useCallback((termo: string): Loja[] => {
    if (!termo.trim()) return lojas;
    
    const termoBusca = termo.toLowerCase().trim();
    return lojas.filter(loja =>
      loja.nome.toLowerCase().includes(termoBusca) ||
      (loja.codigo && loja.codigo.toLowerCase().includes(termoBusca)) ||
      (loja.email && loja.email.toLowerCase().includes(termoBusca)) ||
      (loja.empresa && loja.empresa.toLowerCase().includes(termoBusca))
    );
  }, [lojas]);

  // Criar loja (aguardando implementação C.Testa)
  const criarLoja = useCallback(async (dados: LojaFormData): Promise<boolean> => {
    try {
      setLoading(true);
      
      console.log('🏪 [PLACEHOLDER] Criando nova loja:', dados);
      // TODO: Aguardando C.Testa implementar endpoint POST /api/v1/lojas
      toast.error('Criação de lojas será implementada pelo C.Testa');
      return false;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro ao criar loja:', error);
      toast.error(`Erro ao criar loja: ${errorMessage}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar loja (aguardando implementação C.Testa)
  const atualizarLoja = useCallback(async (id: string, dados: Partial<LojaFormData>): Promise<boolean> => {
    try {
      setLoading(true);
      
      console.log('✏️ [PLACEHOLDER] Atualizando loja:', { id, dados });
      // TODO: Aguardando C.Testa implementar endpoint PUT /api/v1/lojas/{id}
      toast.error('Edição de lojas será implementada pelo C.Testa');
      return false;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro ao atualizar loja:', error);
      toast.error(`Erro ao atualizar loja: ${errorMessage}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Desativar loja (aguardando implementação C.Testa)
  const desativarLoja = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      console.log('🗑️ [PLACEHOLDER] Desativando loja:', id);
      // TODO: Aguardando C.Testa implementar endpoint DELETE /api/v1/lojas/{id}
      toast.error('Exclusão de lojas será implementada pelo C.Testa');
      return false;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro ao desativar loja:', error);
      toast.error(`Erro ao desativar loja: ${errorMessage}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Validar código (aguardando implementação C.Testa)
  const validarCodigo = useCallback(async (codigo: string, lojaId?: string): Promise<boolean> => {
    try {
      console.log('🔍 [PLACEHOLDER] Validando código da loja:', { codigo, lojaId });
      // TODO: Aguardando C.Testa implementar endpoint GET /api/v1/lojas/validar/codigo/{codigo}
      return true; // Temporariamente aceitar qualquer código
    } catch (error) {
      console.error('❌ Erro ao validar código:', error);
      return false;
    }
  }, []);

  // Calcular estatísticas
  const totalLojas = lojas.length;
  const lojasAtivas = lojas.filter(loja => loja.ativo).length;
  const lojasInativas = lojas.filter(loja => !loja.ativo).length;
  
  // Agrupar lojas por empresa
  const lojasPorEmpresa = lojas.reduce((acc, loja) => {
    const empresaId = loja.empresaId;
    acc[empresaId] = (acc[empresaId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    // Dados
    lojas,
    loading,
    error,

    // Estatísticas
    totalLojas,
    lojasAtivas,
    lojasInativas,
    lojasPorEmpresa,

    // Funções de busca
    obterLojaPorId,
    obterLojasPorEmpresa,
    buscarLojas,

    // Funções CRUD
    criarLoja,
    atualizarLoja,
    desativarLoja,
    validarCodigo,

    // Controle
    recarregarDados,
    filtrarPorEmpresa,
  };
}