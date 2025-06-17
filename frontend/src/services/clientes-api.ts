/**
 * SERVIÇO HTTP PARA CLIENTES - CONEXÃO COM BACKEND REAL
 * 
 * Este serviço substitui os dados mock e conecta diretamente
 * com a API FastAPI do backend que já está implementada.
 * 
 * FUNCIONALIDADES:
 * - CRUD completo de clientes
 * - Filtros e busca
 * - Validação de dados
 * - Tratamento de erros
 */

import { Cliente, FiltrosCliente, Vendedor } from '../types/cliente';

// Configuração da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

class ClientesApiService {
  private baseUrl: string;
  private testBaseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/${API_VERSION}/clientes`;
    this.testBaseUrl = `${API_BASE_URL}/api/${API_VERSION}`; // Sem /test no final
  }

  /**
   * LISTAR CLIENTES com filtros (VERSÃO DE TESTE)
   * Conecta com: GET /api/v1/test/clientes
   */
  async listarClientes(filtros: FiltrosCliente = {}, skip = 0, limit = 50): Promise<Cliente[]> {
    // Para teste, usando loja D-Art real do Supabase
    const LOJA_TESTE_ID = "317c3115-e071-40a6-9bc5-7c3227e0d82c";
    
    console.log('🌐 Fazendo requisição para:', `${this.testBaseUrl}/test/clientes?loja_id=${LOJA_TESTE_ID}`);
    
    // Usar endpoint padrão de teste
    const response = await fetch(`${this.testBaseUrl}/test/clientes?loja_id=${LOJA_TESTE_ID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Status da resposta:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Sem detalhes do erro');
      console.error('❌ Erro na resposta:', errorText);
      throw new Error(`Erro ao listar clientes: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('📋 Resposta da API de clientes:', result);
    console.log('📊 Dados detalhados dos clientes:', result.data?.clientes);
    
    // O endpoint de teste retorna formato padrão
    if (result.success && result.data && result.data.clientes) {
      return result.data.clientes;
    }
    
    return [];
  }

  /**
   * CRIAR CLIENTE (VERSÃO DE TESTE)
   * Conecta com: POST /api/v1/test/cliente
   */
  async criarCliente(clienteData: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>): Promise<Cliente> {
    // Para teste, usando loja D-Art real do Supabase
    const LOJA_TESTE_ID = "317c3115-e071-40a6-9bc5-7c3227e0d82c";
    
    const response = await fetch(`${this.testBaseUrl}/test/cliente`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: clienteData.nome,
        cpf_cnpj: clienteData.cpf_cnpj,
        telefone: clienteData.telefone,
        email: clienteData.email || '',
        endereco: `${clienteData.logradouro || ''}, ${clienteData.numero || ''}`,
        cidade: clienteData.cidade || '',
        cep: clienteData.cep || '',
        loja_id: LOJA_TESTE_ID,
        tipo_venda: clienteData.tipo_venda || 'NORMAL',
        observacoes: clienteData.observacoes || '',
        logradouro: clienteData.logradouro || '',
        numero: clienteData.numero || '',
        complemento: clienteData.complemento || '',
        bairro: clienteData.bairro || '',
        uf: clienteData.uf || 'SP'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erro ao criar cliente: ${response.status}`);
    }

    const result = await response.json();
    console.log('✨ Cliente criado via API:', result);
    
    // O endpoint de teste retorna um formato diferente
    if (result.success && result.data && result.data.cliente) {
      // Mapear campos faltantes para compatibilidade com frontend
      const clienteCriado = result.data.cliente;
      return {
        ...clienteCriado,
        vendedor_nome: clienteCriado.vendedor_nome || 'Não definido',
        procedencia: clienteData.procedencia || 'Direto',
        rg_ie: clienteData.rg_ie || '',
        logradouro: clienteData.logradouro || '',
        numero: clienteData.numero || '',
        complemento: clienteData.complemento || '',
        bairro: clienteData.bairro || '',
        uf: clienteData.uf || 'SP'
      };
    }
    
    throw new Error('Formato de resposta inválido da API');
  }

  /**
   * ATUALIZAR CLIENTE (VERSÃO DE TESTE)
   * Conecta com: PUT /api/v1/test/cliente/{id}
   */
  async atualizarCliente(id: string, clienteData: Partial<Cliente>): Promise<Cliente> {
    const response = await fetch(`${this.testBaseUrl}/test/cliente/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: clienteData.nome,
        cpf_cnpj: clienteData.cpf_cnpj,
        telefone: clienteData.telefone,
        email: clienteData.email,
        endereco: `${clienteData.logradouro || ''}, ${clienteData.numero || ''}`,
        cidade: clienteData.cidade,
        cep: clienteData.cep,
        tipo_venda: clienteData.tipo_venda,
        observacoes: clienteData.observacoes,
        logradouro: clienteData.logradouro || '',
        numero: clienteData.numero || '',
        complemento: clienteData.complemento || '',
        bairro: clienteData.bairro || '',
        uf: clienteData.uf || 'SP'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erro ao atualizar cliente: ${response.status}`);
    }

    const result = await response.json();
    console.log('✨ Cliente atualizado via API:', result);
    
    if (result.success && result.data && result.data.cliente) {
      const clienteAtualizado = result.data.cliente;
      return {
        ...clienteAtualizado,
        vendedor_nome: clienteAtualizado.vendedor_nome || 'Não definido',
        procedencia: clienteData.procedencia || clienteAtualizado.procedencia || 'Direto',
        rg_ie: clienteData.rg_ie || clienteAtualizado.rg_ie || '',
        logradouro: clienteData.logradouro || '',
        numero: clienteData.numero || '',
        complemento: clienteData.complemento || '',
        bairro: clienteData.bairro || '',
        uf: clienteData.uf || 'SP'
      };
    }
    
    throw new Error('Formato de resposta inválido da API');
  }

  /**
   * EXCLUIR CLIENTE (VERSÃO DE TESTE)
   * Conecta com: DELETE /api/v1/test/cliente/{id}
   */
  async excluirCliente(id: string): Promise<void> {
    const response = await fetch(`${this.testBaseUrl}/test/cliente/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erro ao excluir cliente: ${response.status}`);
    }

    const result = await response.json();
    console.log('🗑️ Cliente excluído via API:', result);
    
    if (!result.success) {
      throw new Error(result.message || 'Erro ao excluir cliente');
    }
  }

  /**
   * BUSCAR CLIENTE POR CPF/CNPJ
   * Conecta com: GET /api/v1/clientes/buscar/cpf-cnpj
   */
  async buscarPorCpfCnpj(cpfCnpj: string): Promise<Cliente | null> {
    const params = new URLSearchParams({ cpf_cnpj: cpfCnpj });
    
    const response = await fetch(`${this.baseUrl}/buscar/cpf-cnpj?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Adicionar Authorization quando auth estiver pronto
      },
    });

    if (response.status === 404) {
      return null; // Cliente não encontrado
    }

    if (!response.ok) {
      throw new Error(`Erro ao buscar cliente: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * VALIDAR DADOS DO CLIENTE
   * Conecta com: POST /api/v1/clientes/validar
   */
  async validarDados(clienteData: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>): Promise<{ valido: boolean; erros: string[] }> {
    const response = await fetch(`${this.baseUrl}/validar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Adicionar Authorization quando auth estiver pronto
      },
      body: JSON.stringify(clienteData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        valido: false,
        erros: [errorData.detail || 'Erro de validação']
      };
    }

    const result = await response.json();
    return {
      valido: true,
      erros: []
    };
  }
}

// Instância singleton do serviço
export const clientesApi = new ClientesApiService();

// Mock de vendedores (TODO: Implementar API de vendedores/equipe)
export const vendedoresMock: Vendedor[] = [
  { id: 'v1', nome: 'Ana Costa', perfil: 'VENDEDOR' },
  { id: 'v2', nome: 'Carlos Mendes', perfil: 'VENDEDOR' },
  { id: 'v3', nome: 'Pedro Santos', perfil: 'GERENTE' },
  { id: 'v4', nome: 'Marina Silva', perfil: 'VENDEDOR' }
];