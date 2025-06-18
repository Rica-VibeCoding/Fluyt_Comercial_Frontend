/**
 * Service para API de Empresas - Dados Reais do Supabase
 * Baseado no template bem-sucedido de clientes-api.ts
 */

import { API_BASE_URL } from '@/lib/config';

export interface EmpresaApi {
  id: string;
  nome: string;
  cnpj?: string | null;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  ativo: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Loja {
  id: string;
  nome: string;
  codigo?: string | null;
  empresa_id: string;
  gerente_id?: string | null;
  endereco?: string | null;
  telefone?: string | null;
  email?: string | null;
  data_abertura?: string | null;
  ativo: boolean;
  created_at: string;
  updated_at?: string;
  cad_empresas?: {
    nome: string;
  };
}

export interface EmpresasApiResponse {
  success: boolean;
  message: string;
  data: {
    empresas: EmpresaApi[];
    lojas: Loja[];
    total_empresas: number;
    total_lojas: number;
    estatisticas?: {
      media_lojas_por_empresa: number;
      empresa_com_mais_lojas: string;
    };
  };
  fonte: string;
  projeto: string;
  tabelas: string[];
  mock: boolean;
  timestamp: string;
}

export class EmpresasApiService {
  private testBaseUrl = `${API_BASE_URL}/api/v1`;

  /**
   * LISTAR EMPRESAS E LOJAS (DADOS REAIS)
   * Conecta com endpoint de teste que retorna dados reais do Supabase
   */
  async listarEmpresasELojas(): Promise<{ empresas: EmpresaApi[]; lojas: Loja[] }> {
    console.log('🌐 Fazendo requisição para dados REAIS de empresas:', `${this.testBaseUrl}/test/empresas`);
    
    try {
      const response = await fetch(`${this.testBaseUrl}/test/empresas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Status da resposta:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result: EmpresasApiResponse = await response.json();
      console.log('📋 Resposta da API de empresas:', result);
      console.log('📊 Dados detalhados das empresas:', result.data?.empresas);
      console.log('📊 Dados detalhados das lojas:', result.data?.lojas);

      // Retornar dados reais do Supabase
      if (result.success && result.data) {
        console.log('🎯 Dados reais encontrados:', {
          empresas: result.data.empresas?.length || 0,
          lojas: result.data.lojas?.length || 0,
          fonte: result.fonte
        });

        return {
          empresas: result.data.empresas || [],
          lojas: result.data.lojas || []
        };
      }

      return { empresas: [], lojas: [] };

    } catch (error) {
      console.error('❌ Erro ao buscar empresas:', error);
      throw error;
    }
  }

  /**
   * OBTER EMPRESA POR ID
   * Busca empresa específica nas empresas carregadas
   */
  async obterEmpresaPorId(empresaId: string): Promise<EmpresaApi | null> {
    try {
      const { empresas } = await this.listarEmpresasELojas();
      const empresa = empresas.find(emp => emp.id === empresaId);
      
      console.log(`🔍 Buscando empresa ${empresaId}:`, empresa ? 'encontrada' : 'não encontrada');
      return empresa || null;
      
    } catch (error) {
      console.error('❌ Erro ao obter empresa por ID:', error);
      throw error;
    }
  }

  /**
   * LISTAR LOJAS POR EMPRESA
   * Filtra lojas de uma empresa específica
   */
  async listarLojasPorEmpresa(empresaId: string): Promise<Loja[]> {
    try {
      const { lojas } = await this.listarEmpresasELojas();
      const lojasEmpresa = lojas.filter(loja => loja.empresa_id === empresaId);
      
      console.log(`🏪 Lojas da empresa ${empresaId}:`, lojasEmpresa.length);
      return lojasEmpresa;
      
    } catch (error) {
      console.error('❌ Erro ao listar lojas por empresa:', error);
      throw error;
    }
  }

  /**
   * OBTER LOJA POR ID
   * Busca loja específica nas lojas carregadas
   */
  async obterLojaPorId(lojaId: string): Promise<Loja | null> {
    try {
      const { lojas } = await this.listarEmpresasELojas();
      const loja = lojas.find(lj => lj.id === lojaId);
      
      console.log(`🔍 Buscando loja ${lojaId}:`, loja ? 'encontrada' : 'não encontrada');
      return loja || null;
      
    } catch (error) {
      console.error('❌ Erro ao obter loja por ID:', error);
      throw error;
    }
  }

  /**
   * ESTATÍSTICAS RÁPIDAS
   * Calcula estatísticas básicas dos dados carregados
   */
  async obterEstatisticas(): Promise<{
    totalEmpresas: number;
    totalLojas: number;
    empresasAtivas: number;
    lojasAtivas: number;
    mediaLojasPorEmpresa: number;
  }> {
    try {
      const { empresas, lojas } = await this.listarEmpresasELojas();
      
      const estatisticas = {
        totalEmpresas: empresas.length,
        totalLojas: lojas.length,
        empresasAtivas: empresas.filter(emp => emp.ativo).length,
        lojasAtivas: lojas.filter(loja => loja.ativo).length,
        mediaLojasPorEmpresa: empresas.length > 0 ? lojas.length / empresas.length : 0
      };
      
      console.log('📊 Estatísticas calculadas:', estatisticas);
      return estatisticas;
      
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      throw error;
    }
  }

  /**
   * CRIAR EMPRESA (POST)
   * Cria nova empresa no backend
   */
  async criarEmpresa(dados: Partial<EmpresaApi>): Promise<EmpresaApi> {
    console.log('📝 Criando nova empresa:', dados);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/empresas/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erro HTTP: ${response.status}`);
      }

      const novaEmpresa = await response.json();
      console.log('✅ Empresa criada com sucesso:', novaEmpresa);
      return novaEmpresa;
      
    } catch (error) {
      console.error('❌ Erro ao criar empresa:', error);
      throw error;
    }
  }

  /**
   * ATUALIZAR EMPRESA (PUT)
   * Atualiza empresa existente
   */
  async atualizarEmpresa(id: string, dados: Partial<EmpresaApi>): Promise<EmpresaApi> {
    console.log(`📝 Atualizando empresa ${id}:`, dados);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/empresas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erro HTTP: ${response.status}`);
      }

      const empresaAtualizada = await response.json();
      console.log('✅ Empresa atualizada com sucesso:', empresaAtualizada);
      return empresaAtualizada;
      
    } catch (error) {
      console.error('❌ Erro ao atualizar empresa:', error);
      throw error;
    }
  }

  /**
   * EXCLUIR EMPRESA (DELETE)
   * Remove empresa do sistema
   */
  async excluirEmpresa(id: string): Promise<void> {
    console.log(`🗑️ Excluindo empresa ${id}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/empresas/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erro HTTP: ${response.status}`);
      }

      console.log('✅ Empresa excluída com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao excluir empresa:', error);
      throw error;
    }
  }

  /**
   * ALTERNAR STATUS EMPRESA (PATCH)
   * Ativa ou desativa empresa
   */
  async alternarStatusEmpresa(id: string, ativo: boolean): Promise<EmpresaApi> {
    console.log(`🔄 Alterando status da empresa ${id} para:`, ativo ? 'ativo' : 'inativo');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/empresas/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ativo }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erro HTTP: ${response.status}`);
      }

      const empresaAtualizada = await response.json();
      console.log('✅ Status alterado com sucesso:', empresaAtualizada);
      return empresaAtualizada;
      
    } catch (error) {
      console.error('❌ Erro ao alterar status:', error);
      throw error;
    }
  }
}

// Instância singleton para uso global
export const empresasApi = new EmpresasApiService();