/**
 * Service para API de Lojas - Dados Reais do Supabase
 * Conecta com endpoints implementados pelo C.Testa
 */

import { API_BASE_URL } from '@/lib/config';

export interface LojaApi {
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
  // Relacionamentos
  cad_empresas?: {
    nome: string;
  };
}

export interface EmpresaSimples {
  id: string;
  nome: string;
}

export interface LojasApiResponse {
  success: boolean;
  message: string;
  data: {
    lojas: LojaApi[];
    empresas?: EmpresaSimples[];
    total_lojas: number;
    estatisticas?: {
      lojas_ativas: number;
      lojas_inativas: number;
      lojas_por_empresa: Record<string, number>;
    };
  };
  fonte: string;
  projeto: string;
  tabelas: string[];
  mock: boolean;
  timestamp: string;
}

export interface LojaFormData {
  nome: string;
  codigo?: string;
  empresa_id: string;
  gerente_id?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  data_abertura?: string;
}

export class LojasApiService {
  private baseUrl = `${API_BASE_URL}/api/v1`;

  /**
   * LISTAR TODAS AS LOJAS (DADOS REAIS)
   * Conecta com endpoint implementado pelo C.Testa
   */
  async listarLojas(filtros?: {
    empresa_id?: string;
    ativo?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ lojas: LojaApi[]; total: number }> {
    console.log('🏪 Fazendo requisição para dados REAIS de lojas:', `${this.baseUrl}/test/lojas`);
    
    try {
      // Por enquanto, aguardar C.Testa implementar endpoint de teste para lojas
      // Usar mesmo padrão que empresas: /test/lojas
      const response = await fetch(`${this.baseUrl}/test/lojas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Status da resposta (lojas):', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result: LojasApiResponse = await response.json();
      console.log('📋 Resposta da API de lojas:', result);

      if (result.success && result.data) {
        console.log('🎯 Dados reais de lojas encontrados:', {
          lojas: result.data.lojas?.length || 0,
          fonte: result.fonte
        });

        return {
          lojas: result.data.lojas || [],
          total: result.data.total_lojas || 0
        };
      }

      return { lojas: [], total: 0 };

    } catch (error) {
      console.error('❌ Erro ao buscar lojas:', error);
      throw error;
    }
  }

  /**
   * OBTER LOJA POR ID
   */
  async obterLojaPorId(lojaId: string): Promise<LojaApi | null> {
    try {
      const response = await fetch(`${this.baseUrl}/lojas/${lojaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log(`🔍 Loja ${lojaId}:`, result.success ? 'encontrada' : 'não encontrada');
      
      return result.success ? result.data : null;
      
    } catch (error) {
      console.error('❌ Erro ao obter loja por ID:', error);
      throw error;
    }
  }

  /**
   * OBTER DETALHES DA LOJA COM RELACIONAMENTOS
   */
  async obterDetalhesLoja(lojaId: string): Promise<LojaApi | null> {
    try {
      const response = await fetch(`${this.baseUrl}/lojas/${lojaId}/detalhes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result.success ? result.data : null;
      
    } catch (error) {
      console.error('❌ Erro ao obter detalhes da loja:', error);
      throw error;
    }
  }

  /**
   * LISTAR LOJAS POR EMPRESA
   */
  async listarLojasPorEmpresa(empresaId: string): Promise<LojaApi[]> {
    try {
      const response = await fetch(`${this.baseUrl}/lojas/empresa/${empresaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log(`🏪 Lojas da empresa ${empresaId}:`, result.data?.length || 0);
      
      return result.success ? result.data : [];
      
    } catch (error) {
      console.error('❌ Erro ao listar lojas por empresa:', error);
      throw error;
    }
  }

  /**
   * CRIAR NOVA LOJA
   */
  async criarLoja(dados: LojaFormData): Promise<LojaApi> {
    try {
      const response = await fetch(`${this.baseUrl}/lojas/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao criar loja');
      }

      console.log('✅ Loja criada com sucesso:', result.data);
      return result.data;
      
    } catch (error) {
      console.error('❌ Erro ao criar loja:', error);
      throw error;
    }
  }

  /**
   * ATUALIZAR LOJA
   */
  async atualizarLoja(lojaId: string, dados: Partial<LojaFormData>): Promise<LojaApi> {
    try {
      const response = await fetch(`${this.baseUrl}/lojas/${lojaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao atualizar loja');
      }

      console.log('✅ Loja atualizada com sucesso:', result.data);
      return result.data;
      
    } catch (error) {
      console.error('❌ Erro ao atualizar loja:', error);
      throw error;
    }
  }

  /**
   * DESATIVAR LOJA (SOFT DELETE)
   */
  async desativarLoja(lojaId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/lojas/${lojaId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('🗑️ Loja desativada:', result.success);
      
      return result.success;
      
    } catch (error) {
      console.error('❌ Erro ao desativar loja:', error);
      throw error;
    }
  }

  /**
   * VALIDAR CÓDIGO DA LOJA
   */
  async validarCodigo(codigo: string, lojaId?: string): Promise<boolean> {
    try {
      const params = new URLSearchParams();
      if (lojaId) params.append('exclude_id', lojaId);

      const response = await fetch(`${this.baseUrl}/lojas/validar/codigo/${codigo}${params.toString() ? `?${params.toString()}` : ''}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result.success && result.data?.disponivel;
      
    } catch (error) {
      console.error('❌ Erro ao validar código:', error);
      return false;
    }
  }

  /**
   * OBTER ESTATÍSTICAS DO DASHBOARD
   */
  async obterEstatisticas(): Promise<{
    totalLojas: number;
    lojasAtivas: number;
    lojasInativas: number;
    lojasPorEmpresa: Record<string, number>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/lojas/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const stats = result.data;
        return {
          totalLojas: stats.total_lojas || 0,
          lojasAtivas: stats.lojas_ativas || 0,
          lojasInativas: stats.lojas_inativas || 0,
          lojasPorEmpresa: stats.lojas_por_empresa || {}
        };
      }

      return {
        totalLojas: 0,
        lojasAtivas: 0,
        lojasInativas: 0,
        lojasPorEmpresa: {}
      };
      
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      throw error;
    }
  }
}

// Instância singleton para uso global
export const lojasApi = new LojasApiService();