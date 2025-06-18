/**
 * Service para API de Equipe - Dados Reais do Supabase
 * Conecta com endpoints implementados pelo C.Testa
 */

import { API_BASE_URL } from '@/lib/config';

export interface FuncionarioApi {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  setor_id: string;
  loja_id: string;
  salario?: number | null;
  data_admissao?: string | null;
  ativo: boolean;
  nivel_acesso: string;
  perfil: string;
  limite_desconto?: number | null;
  comissao_percentual_vendedor?: number | null;
  comissao_percentual_gerente?: number | null;
  override_comissao?: number | null;
  tem_minimo_garantido: boolean;
  valor_minimo_garantido?: number | null;
  valor_medicao?: number | null;
  created_at: string;
  updated_at?: string;
  // Relacionamentos
  cad_setores?: {
    nome: string;
  };
  c_lojas?: {
    nome: string;
  };
}

export interface EquipeApiResponse {
  success: boolean;
  message: string;
  data: {
    funcionarios: FuncionarioApi[];
    total_funcionarios: number;
    estatisticas?: {
      por_loja: Record<string, number>;
      por_setor: Record<string, number>;
      ativos: number;
      inativos: number;
    };
  };
  fonte: string;
  projeto: string;
  tabelas: string[];
  mock: boolean;
  timestamp: string;
}

export interface FuncionarioFormData {
  nome: string;
  email?: string;
  telefone?: string;
  setor_id: string;
  loja_id: string;
  salario?: number;
  data_admissao?: string;
  nivel_acesso: string;
  perfil: string;
  limite_desconto?: number;
  comissao_percentual_vendedor?: number;
  comissao_percentual_gerente?: number;
  override_comissao?: number;
  tem_minimo_garantido?: boolean;
  valor_minimo_garantido?: number;
  valor_medicao?: number;
}

export class EquipeApiService {
  private baseUrl = `${API_BASE_URL}/api/v1`;

  /**
   * LISTAR TODOS OS FUNCIONÁRIOS (DADOS REAIS)
   * Conecta com endpoint de teste implementado pelo C.Testa
   */
  async listarFuncionarios(filtros?: {
    loja_id?: string;
    setor_id?: string;
    ativo?: boolean;
  }): Promise<{ funcionarios: FuncionarioApi[]; total: number }> {
    console.log('👥 Fazendo requisição para dados REAIS de equipe:', `${this.baseUrl}/test/equipe`);
    
    try {
      // Usando endpoint de teste do C.Testa
      const response = await fetch(`${this.baseUrl}/test/equipe`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Status da resposta (equipe):', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result: EquipeApiResponse = await response.json();
      console.log('📋 Resposta da API de equipe:', result);

      if (result.success && result.data) {
        const funcionariosOriginais = result.data.funcionarios || [];
        
        console.log('🎯 DIAGNÓSTICO DETALHADO DE FUNCIONÁRIOS:');
        console.log('📊 Total recebido do backend:', funcionariosOriginais.length);
        console.log('📝 Lista completa:', funcionariosOriginais.map(f => ({
          id: f.id,
          nome: f.nome,
          ativo: f.ativo,
          loja_id: f.loja_id,
          setor_id: f.setor_id
        })));
        
        // Aplicar filtros localmente se necessário
        let funcionariosFiltrados = funcionariosOriginais;
        
        if (filtros?.loja_id) {
          const antes = funcionariosFiltrados.length;
          funcionariosFiltrados = funcionariosFiltrados.filter(f => f.loja_id === filtros.loja_id);
          console.log(`🔍 Filtro por loja ${filtros.loja_id}: ${antes} → ${funcionariosFiltrados.length}`);
        }
        
        if (filtros?.setor_id) {
          const antes = funcionariosFiltrados.length;
          funcionariosFiltrados = funcionariosFiltrados.filter(f => f.setor_id === filtros.setor_id);
          console.log(`🔍 Filtro por setor ${filtros.setor_id}: ${antes} → ${funcionariosFiltrados.length}`);
        }
        
        if (filtros?.ativo !== undefined) {
          const antes = funcionariosFiltrados.length;
          funcionariosFiltrados = funcionariosFiltrados.filter(f => f.ativo === filtros.ativo);
          console.log(`🔍 Filtro por ativo ${filtros.ativo}: ${antes} → ${funcionariosFiltrados.length}`);
        }

        console.log('✅ RESULTADO FINAL:', funcionariosFiltrados.length, 'funcionários');

        return {
          funcionarios: funcionariosFiltrados,
          total: result.data.total_funcionarios || funcionariosOriginais.length
        };
      }

      return { funcionarios: [], total: 0 };

    } catch (error) {
      console.error('❌ Erro ao buscar equipe:', error);
      throw error;
    }
  }

  /**
   * OBTER FUNCIONÁRIO POR ID
   */
  async obterFuncionarioPorId(funcionarioId: string): Promise<FuncionarioApi | null> {
    try {
      const { funcionarios } = await this.listarFuncionarios();
      const funcionario = funcionarios.find(f => f.id === funcionarioId);
      
      console.log(`🔍 Funcionário ${funcionarioId}:`, funcionario ? 'encontrado' : 'não encontrado');
      return funcionario || null;
      
    } catch (error) {
      console.error('❌ Erro ao obter funcionário por ID:', error);
      throw error;
    }
  }

  /**
   * CRIAR NOVO FUNCIONÁRIO (TEMPORÁRIO - DESENVOLVIMENTO)
   * NOTA: Endpoint de teste não persiste no Supabase - implementação temporária para desenvolvimento
   */
  async criarFuncionario(dados: FuncionarioFormData): Promise<FuncionarioApi> {
    console.log('👤 [DESENVOLVIMENTO] Criando funcionário via endpoint de teste:', dados);
    
    try {
      // Tentar endpoint de teste primeiro
      const response = await fetch(`${this.baseUrl}/test/equipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados)
      });

      console.log('📡 Status da criação (TESTE):', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      console.log('✅ Funcionário criado (TESTE):', result);
      console.log('⚠️ [AVISO] Dados podem não persistir no Supabase real');
      console.log('⚠️ [AVISO] Aguardando C.Testa implementar POST /api/v1/equipe');
      
      // Validar estrutura da resposta
      if (!result.success) {
        throw new Error(result.message || 'Erro na resposta da API');
      }
      
      if (!result.data || !result.data.funcionario) {
        throw new Error('Dados do funcionário não retornados pela API');
      }
      
      return result.data.funcionario;
      
    } catch (error) {
      console.error('❌ Erro ao criar funcionário:', error);
      throw error;
    }
  }

  /**
   * ATUALIZAR FUNCIONÁRIO (TEMPORÁRIO - DESENVOLVIMENTO)  
   * NOTA: Endpoint de teste não persiste no Supabase - implementação temporária para desenvolvimento
   */
  async atualizarFuncionario(funcionarioId: string, dados: Partial<FuncionarioFormData>): Promise<FuncionarioApi> {
    console.log('✏️ [DESENVOLVIMENTO] Atualizando funcionário diretamente no Supabase:', { funcionarioId, dados });
    
    try {
      // Para desenvolvimento: simular retorno imediatamente sem chamada real
      // O endpoint de teste não persiste dados reais
      console.log('⚠️ [AVISO] Endpoint de teste não persiste no Supabase real');
      console.log('⚠️ [AVISO] Aguardando C.Testa implementar PUT /api/v1/equipe/{id}');
      
      // Buscar dados atuais para simular retorno
      const funcionarioAtual = await this.obterFuncionarioPorId(funcionarioId);
      
      if (!funcionarioAtual) {
        throw new Error('Funcionário não encontrado');
      }
      
      // Simular funcionário atualizado (frontend apenas)
      const funcionarioAtualizado: FuncionarioApi = {
        ...funcionarioAtual,
        ...dados,
        updated_at: new Date().toISOString()
      };
      
      console.log('🔄 [SIMULADO] Funcionário atualizado (apenas frontend):', funcionarioAtualizado);
      
      return funcionarioAtualizado;
      
    } catch (error) {
      console.error('❌ Erro ao atualizar funcionário:', error);
      throw error;
    }
  }

  /**
   * ALTERNAR STATUS DO FUNCIONÁRIO (TEMPORÁRIO - TESTE)
   * Usando endpoint de teste até C.Testa implementar PATCH /api/v1/equipe/{id}/toggle-status
   */
  async alternarStatusFuncionario(funcionarioId: string): Promise<boolean> {
    console.log('🔄 Alternando status via API de teste (temporário):', funcionarioId);
    
    try {
      const response = await fetch(`${this.baseUrl}/test/equipe/${funcionarioId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('📡 Status da alteração (TESTE):', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      console.log('✅ Status alterado (TESTE):', result);
      
      return result.success !== false;
      
    } catch (error) {
      console.error('❌ Erro ao alterar status:', error);
      throw error;
    }
  }

  /**
   * EXCLUIR FUNCIONÁRIO (TEMPORÁRIO - TESTE)
   * Usando endpoint de teste até C.Testa implementar DELETE /api/v1/equipe/{id}
   */
  async excluirFuncionario(funcionarioId: string): Promise<boolean> {
    console.log('🗑️ Excluindo funcionário via API de teste (temporário):', funcionarioId);
    
    try {
      const response = await fetch(`${this.baseUrl}/test/equipe/${funcionarioId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('📡 Status da exclusão (TESTE):', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      console.log('✅ Funcionário excluído (TESTE):', result);
      
      return result.success !== false;
      
    } catch (error) {
      console.error('❌ Erro ao excluir funcionário:', error);
      throw error;
    }
  }

  /**
   * OBTER ESTATÍSTICAS
   */
  async obterEstatisticas(): Promise<{
    total: number;
    ativos: number;
    inativos: number;
    porLoja: Record<string, number>;
    porSetor: Record<string, number>;
  }> {
    try {
      const { funcionarios } = await this.listarFuncionarios();
      
      const estatisticas = {
        total: funcionarios.length,
        ativos: funcionarios.filter(f => f.ativo).length,
        inativos: funcionarios.filter(f => !f.ativo).length,
        porLoja: {} as Record<string, number>,
        porSetor: {} as Record<string, number>
      };

      // Agrupar por loja
      funcionarios.forEach(f => {
        const lojaId = f.loja_id;
        estatisticas.porLoja[lojaId] = (estatisticas.porLoja[lojaId] || 0) + 1;
      });

      // Agrupar por setor
      funcionarios.forEach(f => {
        const setorId = f.setor_id;
        estatisticas.porSetor[setorId] = (estatisticas.porSetor[setorId] || 0) + 1;
      });

      console.log('📊 Estatísticas calculadas:', estatisticas);
      return estatisticas;
      
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      throw error;
    }
  }
}

// Instância singleton para uso global
export const equipeApi = new EquipeApiService();