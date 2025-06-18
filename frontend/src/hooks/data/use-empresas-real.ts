/**
 * Hook UNIFICADO para Empresas e Lojas - DADOS REAIS DO SUPABASE
 * Agente 1 - Arquitetura unificada: API real + CRUD completo + sincronização
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { empresasApi, type EmpresaApi, type Loja } from '@/services/empresas-api';
import type { Empresa, EmpresaFormData } from '@/types/sistema';

export interface UseEmpresasRealReturn {
  // Dados
  empresas: Empresa[];
  lojas: Loja[];
  loading: boolean;
  error: string | null;

  // Estatísticas
  totalEmpresas: number;
  totalLojas: number;
  empresasAtivas: number;
  lojasAtivas: number;

  // Funções de Leitura
  recarregarDados: () => Promise<void>;
  obterEmpresaPorId: (id: string) => Empresa | undefined;
  obterLojaPorId: (id: string) => Loja | undefined;
  obterLojasPorEmpresa: (empresaId: string) => Loja[];
  buscarEmpresas: (termo: string) => Empresa[];
  buscarLojas: (termo: string) => Loja[];

  // 🔧 CRUD Functions (preparado para Agente 3)
  criarEmpresa: (dados: EmpresaFormData) => Promise<boolean>;
  atualizarEmpresa: (id: string, dados: EmpresaFormData) => Promise<boolean>;
  excluirEmpresa: (id: string) => Promise<boolean>;
  alternarStatusEmpresa: (id: string) => Promise<void>;
}

export function useEmpresasReal(): UseEmpresasRealReturn {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar dados reais do Supabase
  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔗 Carregando empresas e lojas reais...');
      
      const { empresas: empresasData, lojas: lojasData } = await empresasApi.listarEmpresasELojas();
      
      // Converter dados da API para formato do frontend
      const empresasConvertidas: Empresa[] = empresasData.map(emp => ({
        id: emp.id,
        nome: emp.nome,
        cnpj: emp.cnpj,
        email: emp.email,
        telefone: emp.telefone,
        endereco: emp.endereco,
        ativo: emp.ativo,
        funcionarios: 0, // Será calculado pelo backend futuramente
        createdAt: emp.created_at,
        updatedAt: emp.updated_at
      }));
      
      setEmpresas(empresasConvertidas);
      setLojas(lojasData);
      
      console.log('✅ Dados carregados:', {
        empresas: empresasData.length,
        lojas: lojasData.length
      });
      
      if (empresasData.length > 0) {
        toast.success(`${empresasData.length} empresa(s) e ${lojasData.length} loja(s) carregadas`);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro ao carregar dados:', err);
      toast.error(`Erro ao carregar dados: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar dados na inicialização
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Função para recarregar dados
  const recarregarDados = useCallback(async () => {
    await carregarDados();
  }, [carregarDados]);

  // Obter empresa por ID
  const obterEmpresaPorId = useCallback((id: string): Empresa | undefined => {
    return empresas.find(empresa => empresa.id === id);
  }, [empresas]);

  // Obter loja por ID
  const obterLojaPorId = useCallback((id: string): Loja | undefined => {
    return lojas.find(loja => loja.id === id);
  }, [lojas]);

  // Obter lojas de uma empresa
  const obterLojasPorEmpresa = useCallback((empresaId: string): Loja[] => {
    return lojas.filter(loja => loja.empresa_id === empresaId);
  }, [lojas]);

  // Buscar empresas por termo
  const buscarEmpresas = useCallback((termo: string): Empresa[] => {
    if (!termo.trim()) return empresas;
    
    const termoBusca = termo.toLowerCase().trim();
    return empresas.filter(empresa =>
      empresa.nome.toLowerCase().includes(termoBusca) ||
      (empresa.cnpj && empresa.cnpj.includes(termoBusca)) ||
      (empresa.email && empresa.email.toLowerCase().includes(termoBusca))
    );
  }, [empresas]);

  // Buscar lojas por termo
  const buscarLojas = useCallback((termo: string): Loja[] => {
    if (!termo.trim()) return lojas;
    
    const termoBusca = termo.toLowerCase().trim();
    return lojas.filter(loja =>
      loja.nome.toLowerCase().includes(termoBusca) ||
      (loja.codigo && loja.codigo.toLowerCase().includes(termoBusca)) ||
      (loja.email && loja.email.toLowerCase().includes(termoBusca))
    );
  }, [lojas]);

  // 🔧 CRUD Functions - Implementação Real (Agente 3)
  const criarEmpresa = useCallback(async (dados: EmpresaFormData): Promise<boolean> => {
    try {
      console.log('🎨 [AGENTE 3] Criando empresa via API real:', dados);
      
      // Converter dados do formulário para formato da API
      const dadosApi: Partial<EmpresaApi> = {
        nome: dados.nome,
        cnpj: dados.cnpj || null,
        email: dados.email || null,
        telefone: dados.telefone || null,
        endereco: dados.endereco || null,
        ativo: dados.ativo ?? true
      };
      
      await empresasApi.criarEmpresa(dadosApi);
      
      toast.success('Empresa criada com sucesso!');
      
      // Recarregar dados após criar
      await recarregarDados();
      
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar empresa';
      console.error('❌ Erro ao criar empresa:', error);
      toast.error(message);
      return false;
    }
  }, [recarregarDados]);

  const atualizarEmpresa = useCallback(async (id: string, dados: EmpresaFormData): Promise<boolean> => {
    try {
      console.log('🎨 [AGENTE 3] Atualizando empresa via API real:', { id, dados });
      
      // Converter dados do formulário para formato da API
      const dadosApi: Partial<EmpresaApi> = {
        nome: dados.nome,
        cnpj: dados.cnpj || null,
        email: dados.email || null,
        telefone: dados.telefone || null,
        endereco: dados.endereco || null,
        ativo: dados.ativo ?? true
      };
      
      await empresasApi.atualizarEmpresa(id, dadosApi);
      
      toast.success('Empresa atualizada com sucesso!');
      
      // Recarregar dados após atualizar
      await recarregarDados();
      
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar empresa';
      console.error('❌ Erro ao atualizar empresa:', error);
      toast.error(message);
      return false;
    }
  }, [recarregarDados]);

  const excluirEmpresa = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('🎨 [AGENTE 3] Excluindo empresa via API real:', id);
      
      await empresasApi.excluirEmpresa(id);
      
      toast.success('Empresa excluída com sucesso!');
      
      // Recarregar dados após excluir
      await recarregarDados();
      
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir empresa';
      console.error('❌ Erro ao excluir empresa:', error);
      toast.error(message);
      return false;
    }
  }, [recarregarDados]);

  const alternarStatusEmpresa = useCallback(async (id: string): Promise<void> => {
    try {
      console.log('🎨 [AGENTE 3] Alternando status da empresa via API real:', id);
      
      // Buscar empresa atual para obter status
      const empresa = empresas.find(e => e.id === id);
      if (!empresa) {
        throw new Error('Empresa não encontrada');
      }
      
      await empresasApi.alternarStatusEmpresa(id, !empresa.ativo);
      
      toast.success(`Empresa ${!empresa.ativo ? 'ativada' : 'desativada'} com sucesso!`);
      
      // Recarregar dados após alterar status
      await recarregarDados();
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao alterar status';
      console.error('❌ Erro ao alterar status:', error);
      toast.error(message);
    }
  }, [empresas, recarregarDados]);

  // Calcular estatísticas
  const totalEmpresas = empresas.length;
  const totalLojas = lojas.length;
  const empresasAtivas = empresas.filter(empresa => empresa.ativo).length;
  const lojasAtivas = lojas.filter(loja => loja.ativo).length;

  return {
    // Dados
    empresas,
    lojas,
    loading,
    error,

    // Estatísticas
    totalEmpresas,
    totalLojas,
    empresasAtivas,
    lojasAtivas,

    // Funções de Leitura
    recarregarDados,
    obterEmpresaPorId,
    obterLojaPorId,
    obterLojasPorEmpresa,
    buscarEmpresas,
    buscarLojas,

    // 🔧 CRUD Functions - Implementação Real
    criarEmpresa,
    atualizarEmpresa,
    excluirEmpresa,
    alternarStatusEmpresa,
  };
}