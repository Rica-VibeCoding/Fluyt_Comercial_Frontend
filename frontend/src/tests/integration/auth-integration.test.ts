/**
 * TESTES DE INTEGRAÇÃO - AUTENTICAÇÃO E RLS
 * 
 * Bateria completa de testes para validar migração
 * de endpoints /test para /api/v1 com autenticação.
 */

describe('🔐 Integração de Autenticação', () => {
  
  describe('JWT e Login', () => {
    it('deve fazer login com credenciais válidas e receber JWT', async () => {
      const credentials = {
        email: 'vendedor@dartmoveis.com.br',
        password: 'senha123'
      };

      const response = await api.post('/auth/login', credentials);
      
      expect(response.token).toBeDefined();
      expect(response.user).toBeDefined();
      expect(response.user.loja_id).toBeDefined();
      expect(response.user.perfil).toBeOneOf(['VENDEDOR', 'GERENTE', 'ADMIN_MASTER']);
    });

    it('deve rejeitar login com credenciais inválidas', async () => {
      const credentials = {
        email: 'usuario@inexistente.com',
        password: 'senhaerrada'
      };

      await expect(api.post('/auth/login', credentials))
        .rejects.toThrow('Credenciais inválidas');
    });

    it('deve validar token JWT e extrair dados do usuário', async () => {
      // Assumindo token válido já obtido
      const token = 'jwt-token-valido';
      api.setAuthToken(token);

      const response = await api.get('/auth/me');
      
      expect(response.user_id).toBeDefined();
      expect(response.loja_id).toBeDefined();
      expect(response.perfil).toBeDefined();
    });

    it('deve retornar 401 para token inválido ou expirado', async () => {
      api.setAuthToken('token-invalido');

      await expect(api.get('/api/v1/clientes'))
        .rejects.toThrow('Token inválido ou expirado');
    });
  });

  describe('RLS e Multi-Tenancy', () => {
    it('usuário deve ver apenas clientes da própria loja', async () => {
      // Login como usuário da Loja A
      await loginAsUser('vendedor.loja.a@email.com', 'senha123');
      
      const clientes = await api.get('/api/v1/clientes');
      
      // Todos os clientes devem ser da mesma loja
      const lojasUnicas = [...new Set(clientes.map(c => c.loja_id))];
      expect(lojasUnicas).toHaveLength(1);
    });

    it('ADMIN_MASTER deve ver clientes de todas as lojas', async () => {
      await loginAsUser('admin@fluyt.com.br', 'senhaadmin');
      
      const clientes = await api.get('/api/v1/clientes');
      
      // Admin deve ver clientes de múltiplas lojas
      const lojasUnicas = [...new Set(clientes.map(c => c.loja_id))];
      expect(lojasUnicas.length).toBeGreaterThan(1);
    });

    it('usuário não deve conseguir criar cliente em loja diferente', async () => {
      await loginAsUser('vendedor.loja.a@email.com', 'senha123');
      
      const clienteOutraLoja = {
        nome: 'Cliente Teste',
        cpf_cnpj: '12345678901',
        telefone: '11999999999',
        loja_id: 'uuid-loja-b' // Loja diferente!
      };

      await expect(api.post('/api/v1/clientes', clienteOutraLoja))
        .rejects.toThrow('Acesso negado a esta loja');
    });
  });

  describe('Permissões por Perfil', () => {
    it('VENDEDOR deve conseguir criar e editar clientes', async () => {
      await loginAsUser('vendedor@dartmoveis.com.br', 'senha123');
      
      // Criar cliente
      const novoCliente = {
        nome: 'Cliente Vendedor',
        cpf_cnpj: '98765432100',
        telefone: '11888888888'
      };
      
      const criado = await api.post('/api/v1/clientes', novoCliente);
      expect(criado.id).toBeDefined();
      
      // Editar cliente
      const atualizado = await api.put(`/api/v1/clientes/${criado.id}`, {
        nome: 'Cliente Vendedor Editado'
      });
      expect(atualizado.nome).toBe('Cliente Vendedor Editado');
    });

    it('MEDIDOR não deve acessar módulo de clientes', async () => {
      await loginAsUser('medidor@dartmoveis.com.br', 'senha123');
      
      await expect(api.get('/api/v1/clientes'))
        .rejects.toThrow('Acesso negado');
    });

    it('GERENTE deve ter acesso completo aos módulos da loja', async () => {
      await loginAsUser('gerente@dartmoveis.com.br', 'senha123');
      
      // Gerente pode listar
      const clientes = await api.get('/api/v1/clientes');
      expect(Array.isArray(clientes)).toBe(true);
      
      // Gerente pode criar
      const novoCliente = await api.post('/api/v1/clientes', {
        nome: 'Cliente Gerente',
        cpf_cnpj: '11111111111',
        telefone: '11777777777'
      });
      expect(novoCliente.id).toBeDefined();
    });
  });

  describe('Migração de Endpoints', () => {
    it('deve manter funcionalidade com endpoints de teste', async () => {
      // Configurar para usar endpoints de teste
      process.env.NEXT_PUBLIC_USE_AUTH = 'false';
      
      const clientes = await clientesApi.listarClientes();
      expect(Array.isArray(clientes)).toBe(true);
    });

    it('deve funcionar com endpoints autenticados', async () => {
      // Configurar para usar endpoints auth
      process.env.NEXT_PUBLIC_USE_AUTH = 'true';
      await loginAsUser('vendedor@dartmoveis.com.br', 'senha123');
      
      const clientes = await clientesApi.listarClientes();
      expect(Array.isArray(clientes)).toBe(true);
    });

    it('deve fazer fallback se auth falhar e migration mode ativo', async () => {
      process.env.NEXT_PUBLIC_USE_AUTH = 'true';
      process.env.NEXT_PUBLIC_AUTH_MIGRATION_MODE = 'true';
      
      // Token inválido para forçar erro
      api.setAuthToken('token-invalido');
      
      // Deve fazer fallback para endpoints de teste
      const clientes = await clientesApi.listarClientes();
      expect(Array.isArray(clientes)).toBe(true);
    });
  });

  describe('Operações CRUD Autenticadas', () => {
    beforeEach(async () => {
      await loginAsUser('vendedor@dartmoveis.com.br', 'senha123');
    });

    it('deve criar cliente com validações corretas', async () => {
      const novoCliente = {
        nome: 'Cliente CRUD Test',
        cpf_cnpj: '12345678901',
        telefone: '11999999999',
        email: 'teste@email.com',
        endereco: 'Rua Teste, 123',
        cidade: 'São Paulo',
        cep: '01234567'
      };

      const criado = await clientesApi.criarCliente(novoCliente);
      
      expect(criado.id).toBeDefined();
      expect(criado.nome).toBe(novoCliente.nome);
      expect(criado.cpf_cnpj).toBe(novoCliente.cpf_cnpj);
      expect(criado.loja_id).toBeDefined(); // Deve vir do token JWT
    });

    it('deve listar clientes com filtros', async () => {
      const filtros = { nome: 'Cliente' };
      const clientes = await clientesApi.listarClientes(filtros);
      
      expect(Array.isArray(clientes)).toBe(true);
      // Todos devem ter 'Cliente' no nome se filtro funcionou
      clientes.forEach(cliente => {
        expect(cliente.nome.toLowerCase()).toContain('cliente');
      });
    });

    it('deve atualizar cliente existente', async () => {
      // Criar cliente primeiro
      const cliente = await clientesApi.criarCliente({
        nome: 'Cliente Original',
        cpf_cnpj: '98765432100',
        telefone: '11888888888'
      });

      // Atualizar
      const atualizado = await clientesApi.atualizarCliente(cliente.id, {
        nome: 'Cliente Atualizado'
      });

      expect(atualizado.nome).toBe('Cliente Atualizado');
      expect(atualizado.cpf_cnpj).toBe(cliente.cpf_cnpj); // Mantido
    });

    it('deve excluir cliente (soft delete)', async () => {
      // Criar cliente primeiro
      const cliente = await clientesApi.criarCliente({
        nome: 'Cliente Para Excluir',
        cpf_cnpj: '11122233344',
        telefone: '11777777777'
      });

      // Excluir
      await clientesApi.excluirCliente(cliente.id);

      // Verificar se não aparece mais na lista
      const clientes = await clientesApi.listarClientes();
      const clienteExcluido = clientes.find(c => c.id === cliente.id);
      expect(clienteExcluido).toBeUndefined();
    });
  });
});

// Utilitários para testes
async function loginAsUser(email: string, password: string) {
  const response = await api.post('/auth/login', { email, password });
  api.setAuthToken(response.token);
  return response;
}

// Matchers customizados
expect.extend({
  toBeOneOf(received, validOptions) {
    const pass = validOptions.includes(received);
    return {
      message: () => `expected ${received} to be one of ${validOptions.join(', ')}`,
      pass
    };
  }
});