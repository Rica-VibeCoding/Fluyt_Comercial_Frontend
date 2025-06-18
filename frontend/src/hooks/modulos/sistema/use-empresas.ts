import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { Empresa, EmpresaFormData } from '@/types/sistema';

// Configuração da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

export function useEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);

  // Dados mock temporários (até C.Testa implementar API)
  const empresasMock: Empresa[] = [
    {
      id: '1',
      nome: 'Fluyt Comercial LTDA',
      cnpj: '12.345.678/0001-90',
      email: 'contato@fluyt.com.br',
      telefone: '(11) 3456-7890',
      endereco: 'Av. Paulista, 1000 - São Paulo/SP',
      ativo: true,
      funcionarios: 5,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z'
    },
    {
      id: '2',
      nome: 'Matriz Nacional',
      cnpj: '98.765.432/0001-10',
      email: 'matriz@nacional.com.br',
      telefone: '(11) 9876-5432',
      endereco: 'Rua das Flores, 500 - São Paulo/SP',
      ativo: true,
      funcionarios: 12,
      createdAt: '2024-02-01T09:00:00Z',
      updatedAt: '2024-02-15T16:45:00Z'
    },
    {
      id: '3',
      nome: 'Empresa Teste Inativa',
      cnpj: null,
      email: null,
      telefone: null,
      endereco: null,
      ativo: false,
      funcionarios: 0,
      createdAt: '2024-03-01T08:00:00Z',
      updatedAt: '2024-03-10T10:15:00Z'
    }
  ];

  // Função para simular carregamento
  const carregarEmpresas = useCallback(async () => {
    setLoading(true);
    try {
      console.log('📋 Carregando dados mock de empresas...');
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEmpresas(empresasMock);
      console.log('✅ Empresas mock carregadas:', empresasMock.length);
    } catch (error) {
      console.error('❌ Erro ao carregar empresas mock:', error);
      setEmpresas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar empresas na inicialização
  useEffect(() => {
    carregarEmpresas();
  }, [carregarEmpresas]);

  // Validar CNPJ (implementação simplificada)
  const validarCNPJ = useCallback((cnpj: string): boolean => {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    return cnpjLimpo.length === 14;
  }, []);

  // Validar email
  const validarEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Validar telefone
  const validarTelefone = useCallback((telefone: string): boolean => {
    const telefoneNumeros = telefone.replace(/[^\d]/g, '');
    return telefoneNumeros.length >= 10;
  }, []);

  // Validar dados da empresa
  const validarEmpresa = useCallback((dados: EmpresaFormData): string[] => {
    const erros: string[] = [];

    if (!dados.nome || dados.nome.trim().length < 2) {
      erros.push('Nome da empresa deve ter pelo menos 2 caracteres');
    }

    // CNPJ agora é opcional
    if (dados.cnpj && !validarCNPJ(dados.cnpj)) {
      erros.push('CNPJ inválido');
    }

    // Email agora é opcional
    if (dados.email && !validarEmail(dados.email)) {
      erros.push('Email inválido');
    }

    // Telefone agora é opcional
    if (dados.telefone && !validarTelefone(dados.telefone)) {
      erros.push('Telefone inválido');
    }

    // Endereço agora é opcional
    if (dados.endereco && dados.endereco.trim().length < 5) {
      erros.push('Endereço deve ter pelo menos 5 caracteres');
    }

    return erros;
  }, [validarCNPJ, validarEmail, validarTelefone]);

  // Verificar duplicidade de CNPJ
  const verificarCNPJDuplicado = useCallback((cnpj: string, empresaId?: string): boolean => {
    if (!cnpj) return false;
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    return empresas.some(empresa => 
      empresa.cnpj && 
      empresa.cnpj.replace(/[^\d]/g, '') === cnpjLimpo && 
      empresa.id !== empresaId
    );
  }, [empresas]);

  // Verificar duplicidade de email
  const verificarEmailDuplicado = useCallback((email: string, empresaId?: string): boolean => {
    if (!email) return false;
    return empresas.some(empresa => 
      empresa.email && 
      empresa.email.toLowerCase() === email.toLowerCase() && 
      empresa.id !== empresaId
    );
  }, [empresas]);

  // Criar empresa (mock funcional)
  const criarEmpresa = useCallback(async (dados: EmpresaFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações locais
      const erros = validarEmpresa(dados);
      
      if (dados.cnpj && verificarCNPJDuplicado(dados.cnpj)) {
        erros.push('CNPJ já cadastrado');
      }
      
      if (dados.email && verificarEmailDuplicado(dados.email)) {
        erros.push('Email já cadastrado');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Simular criação com dados mock
      console.log('📝 Criando empresa mock:', dados);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const novaEmpresa: Empresa = {
        id: Date.now().toString(),
        nome: dados.nome,
        cnpj: dados.cnpj || null,
        email: dados.email || null,
        telefone: dados.telefone || null,
        endereco: dados.endereco || null,
        ativo: true,
        funcionarios: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setEmpresas(prev => [...prev, novaEmpresa]);
      toast.success('Empresa criada com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro ao criar empresa:', error);
      toast.error('Erro ao criar empresa');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarEmpresa, verificarCNPJDuplicado, verificarEmailDuplicado]);

  // Atualizar empresa (mock funcional)
  const atualizarEmpresa = useCallback(async (id: string, dados: EmpresaFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações locais
      const erros = validarEmpresa(dados);
      
      if (dados.cnpj && verificarCNPJDuplicado(dados.cnpj, id)) {
        erros.push('CNPJ já cadastrado');
      }
      
      if (dados.email && verificarEmailDuplicado(dados.email, id)) {
        erros.push('Email já cadastrado');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Simular atualização mock
      console.log('✏️ Atualizando empresa mock:', { id, dados });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEmpresas(prev => prev.map(empresa => 
        empresa.id === id 
          ? {
              ...empresa,
              nome: dados.nome,
              cnpj: dados.cnpj || null,
              email: dados.email || null,
              telefone: dados.telefone || null,
              endereco: dados.endereco || null,
              updatedAt: new Date().toISOString()
            }
          : empresa
      ));

      toast.success('Empresa atualizada com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro ao atualizar empresa:', error);
      toast.error('Erro ao atualizar empresa');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarEmpresa, verificarCNPJDuplicado, verificarEmailDuplicado]);

  // Alternar status da empresa (mock funcional)
  const alternarStatusEmpresa = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    
    try {
      const empresa = empresas.find(e => e.id === id);
      const novoStatus = !empresa?.ativo ? 'ativada' : 'desativada';
      
      console.log('🔄 Alterando status da empresa mock:', { id, novoStatus });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEmpresas(prev => prev.map(emp => 
        emp.id === id 
          ? { ...emp, ativo: !emp.ativo, updatedAt: new Date().toISOString() }
          : emp
      ));

      toast.success(`Empresa ${novoStatus} com sucesso!`);

    } catch (error) {
      console.error('❌ Erro ao alterar status da empresa:', error);
      toast.error('Erro ao alterar status da empresa');
    } finally {
      setLoading(false);
    }
  }, [empresas]);

  // Excluir empresa (mock funcional)
  const excluirEmpresa = useCallback(async (id: string): Promise<boolean> => {
    const empresa = empresas.find(e => e.id === id);
    
    if (!empresa) {
      toast.error('Empresa não encontrada');
      return false;
    }

    // Verificar se tem funcionários vinculados
    if (empresa.funcionarios && empresa.funcionarios > 0) {
      toast.error('Não é possível excluir empresa com funcionários vinculados');
      return false;
    }

    setLoading(true);
    
    try {
      console.log('🗑️ Excluindo empresa mock:', { id });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEmpresas(prev => prev.filter(emp => emp.id !== id));
      toast.success('Empresa excluída com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro ao excluir empresa:', error);
      toast.error('Erro ao excluir empresa');
      return false;
    } finally {
      setLoading(false);
    }
  }, [empresas]);

  // Obter empresas ativas
  const obterEmpresasAtivas = useCallback((): Empresa[] => {
    return empresas.filter(empresa => empresa.ativo);
  }, [empresas]);

  // Obter empresa por ID
  const obterEmpresaPorId = useCallback((id: string): Empresa | undefined => {
    return empresas.find(empresa => empresa.id === id);
  }, [empresas]);

  // Buscar empresas
  const buscarEmpresas = useCallback((termo: string): Empresa[] => {
    if (!termo.trim()) return empresas;
    
    const termoBusca = termo.toLowerCase().trim();
    return empresas.filter(empresa =>
      empresa.nome.toLowerCase().includes(termoBusca) ||
      (empresa.cnpj && empresa.cnpj.includes(termoBusca)) ||
      (empresa.email && empresa.email.toLowerCase().includes(termoBusca))
    );
  }, [empresas]);

  // Estatísticas
  const estatisticas = {
    total: empresas.length,
    ativas: empresas.filter(e => e.ativo).length,
    inativas: empresas.filter(e => !e.ativo).length,
    totalFuncionarios: empresas.reduce((total, empresa) => total + (empresa.funcionarios || 0), 0)
  };

  // Recarregar dados mock
  const recarregarDados = useCallback(() => {
    return carregarEmpresas();
  }, [carregarEmpresas]);

  return {
    empresas,
    loading,
    estatisticas,
    criarEmpresa,
    atualizarEmpresa,
    alternarStatusEmpresa,
    excluirEmpresa,
    obterEmpresasAtivas,
    obterEmpresaPorId,
    buscarEmpresas,
    recarregarDados,
    validarCNPJ,
    validarEmail,
    validarTelefone
  };
}