import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Funcionario, FuncionarioFormData } from '@/types/sistema';
import { useLocalStorage } from '@/hooks/globais/use-local-storage';
import { useEmpresas } from './use-empresas';
import { useLojas } from './use-lojas';
import { useSetores } from './use-setores';

// Mock data para desenvolvimento - compatível com Supabase
const mockFuncionarios: Funcionario[] = [
  {
    id: '1',
    nome: 'Cleiton',
    email: 'cleiton@dart.com.br',
    telefone: '(11) 99999-1001',
    setor_id: 'setor-vendas',
    setor: 'Vendas',
    loja_id: '1',
    loja: 'D-Art',
    salario: 3500.00,
    data_admissao: '2024-01-15',
    ativo: true,
    nivel_acesso: 'USUARIO',
    perfil: 'VENDEDOR',
    limite_desconto: 0.12,
    comissao_percentual_vendedor: 0.035,
    comissao_percentual_gerente: null,
    override_comissao: null,
    tem_minimo_garantido: false,
    valor_minimo_garantido: null,
    valor_medicao: null,
    performance: 95,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    nome: 'Tom',
    email: 'tom@dart.com.br',
    telefone: '(11) 99999-1002',
    setor_id: 'setor-vendas',
    setor: 'Vendas',
    loja_id: '2',
    loja: 'Romanza',
    salario: 5500.00,
    data_admissao: '2023-06-10',
    ativo: true,
    nivel_acesso: 'GERENTE',
    perfil: 'GERENTE',
    limite_desconto: 0.20,
    comissao_percentual_vendedor: null,
    comissao_percentual_gerente: 0.02,
    override_comissao: null,
    tem_minimo_garantido: true,
    valor_minimo_garantido: 3000.00,
    valor_medicao: null,
    performance: 88,
    createdAt: '2023-06-10T10:00:00Z'
  }
];

export function useEquipe() {
  const [funcionarios, setFuncionarios, clearFuncionarios] = useLocalStorage<Funcionario[]>('fluyt_funcionarios', mockFuncionarios);
  const [loading, setLoading] = useState(false);
  
  // Hooks para relacionamentos
  const { obterEmpresasAtivas } = useEmpresas();
  const { obterLojasAtivas } = useLojas();
  const { obterSetoresAtivos } = useSetores();

  // Validar dados do funcionário
  const validarFuncionario = useCallback((dados: FuncionarioFormData): string[] => {
    const erros: string[] = [];

    if (!dados.nome || dados.nome.trim().length < 2) {
      erros.push('Nome deve ter pelo menos 2 caracteres');
    }

    // Email agora é opcional
    if (dados.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
      erros.push('Email inválido');
    }

    // Telefone agora é opcional
    if (dados.telefone && dados.telefone.replace(/[^\d]/g, '').length < 10) {
      erros.push('Telefone inválido');
    }

    if (!dados.setor_id) {
      erros.push('Setor é obrigatório');
    }

    if (!dados.loja_id) {
      erros.push('Loja é obrigatória');
    }

    if (!dados.nivel_acesso) {
      erros.push('Nível de acesso é obrigatório');
    }

    if (!dados.perfil) {
      erros.push('Perfil é obrigatório');
    }

    // Salário agora é opcional
    if (dados.salario && dados.salario < 0) {
      erros.push('Salário deve ser um valor positivo');
    }

    // Data de admissão agora é opcional
    if (dados.data_admissao && isNaN(Date.parse(dados.data_admissao))) {
      erros.push('Data de admissão inválida');
    }

    // Validações específicas por perfil
    if (dados.perfil === 'MEDIDOR' && (!dados.valor_medicao || dados.valor_medicao <= 0)) {
      erros.push('Valor por medição é obrigatório para medidores');
    }

    if (dados.perfil === 'VENDEDOR' && dados.limite_desconto && (dados.limite_desconto < 0 || dados.limite_desconto > 1)) {
      erros.push('Limite de desconto deve estar entre 0% e 100%');
    }

    if (dados.perfil === 'GERENTE' && dados.tem_minimo_garantido && (!dados.valor_minimo_garantido || dados.valor_minimo_garantido <= 0)) {
      erros.push('Valor mínimo garantido é obrigatório quando habilitado');
    }

    return erros;
  }, []);

  // Verificar duplicidade de email
  const verificarEmailDuplicado = useCallback((email: string, funcionarioId?: string): boolean => {
    if (!email) return false;
    return funcionarios.some(funcionario => 
      funcionario.email && 
      funcionario.email.toLowerCase() === email.toLowerCase() && 
      funcionario.id !== funcionarioId
    );
  }, [funcionarios]);

  // Criar funcionário
  const criarFuncionario = useCallback(async (dados: FuncionarioFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações
      const erros = validarFuncionario(dados);
      
      if (dados.email && verificarEmailDuplicado(dados.email)) {
        erros.push('Email já cadastrado');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Buscar nome da loja e setor
      const lojas = obterLojasAtivas();
      const setores = obterSetoresAtivos();
      const loja = lojas.find(l => l.id === dados.loja_id);
      const setor = setores.find(s => s.id === dados.setor_id);

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const novoFuncionario: Funcionario = {
        id: Date.now().toString(),
        nome: dados.nome,
        email: dados.email || null,
        telefone: dados.telefone || null,
        setor_id: dados.setor_id,
        setor: setor?.nome || '',
        loja_id: dados.loja_id,
        loja: loja?.nome || '',
        salario: dados.salario || null,
        data_admissao: dados.data_admissao || null,
        ativo: true,
        nivel_acesso: dados.nivel_acesso,
        perfil: dados.perfil,
        limite_desconto: dados.limite_desconto || null,
        comissao_percentual_vendedor: dados.comissao_percentual_vendedor || null,
        comissao_percentual_gerente: dados.comissao_percentual_gerente || null,
        override_comissao: dados.override_comissao || null,
        tem_minimo_garantido: dados.tem_minimo_garantido || false,
        valor_minimo_garantido: dados.valor_minimo_garantido || null,
        valor_medicao: dados.valor_medicao || null,
        performance: 0,
        createdAt: new Date().toISOString()
      };

      setFuncionarios(prev => [...prev, novoFuncionario]);
      toast.success('Funcionário criado com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao criar funcionário');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarFuncionario, verificarEmailDuplicado, obterLojasAtivas]);

  // Atualizar funcionário
  const atualizarFuncionario = useCallback(async (id: string, dados: FuncionarioFormData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validações
      const erros = validarFuncionario(dados);
      
      if (dados.email && verificarEmailDuplicado(dados.email, id)) {
        erros.push('Email já cadastrado');
      }

      if (erros.length > 0) {
        erros.forEach(erro => toast.error(erro));
        return false;
      }

      // Buscar nome da loja e setor
      const lojas = obterLojasAtivas();
      const setores = obterSetoresAtivos();
      const loja = lojas.find(l => l.id === dados.loja_id);
      const setor = setores.find(s => s.id === dados.setor_id);

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setFuncionarios(prev => prev.map(funcionario => 
        funcionario.id === id 
          ? { 
              ...funcionario,
              nome: dados.nome,
              email: dados.email || null,
              telefone: dados.telefone || null,
              setor_id: dados.setor_id,
              setor: setor?.nome || '',
              loja_id: dados.loja_id,
              loja: loja?.nome || '',
              salario: dados.salario || null,
              data_admissao: dados.data_admissao || null,
              nivel_acesso: dados.nivel_acesso,
              perfil: dados.perfil,
              limite_desconto: dados.limite_desconto || null,
              comissao_percentual_vendedor: dados.comissao_percentual_vendedor || null,
              comissao_percentual_gerente: dados.comissao_percentual_gerente || null,
              override_comissao: dados.override_comissao || null,
              tem_minimo_garantido: dados.tem_minimo_garantido || false,
              valor_minimo_garantido: dados.valor_minimo_garantido || null,
              valor_medicao: dados.valor_medicao || null,
              updatedAt: new Date().toISOString() 
            }
          : funcionario
      ));

      toast.success('Funcionário atualizado com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao atualizar funcionário');
      return false;
    } finally {
      setLoading(false);
    }
  }, [validarFuncionario, verificarEmailDuplicado, obterLojasAtivas]);

  // Alternar status do funcionário
  const alternarStatusFuncionario = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setFuncionarios(prev => prev.map(funcionario => 
        funcionario.id === id 
          ? { ...funcionario, ativo: !funcionario.ativo, updatedAt: new Date().toISOString() }
          : funcionario
      ));

      const funcionario = funcionarios.find(f => f.id === id);
      const novoStatus = !funcionario?.ativo ? 'ativado' : 'desativado';
      toast.success(`Funcionário ${novoStatus} com sucesso!`);

    } catch (error) {
      toast.error('Erro ao alterar status do funcionário');
    } finally {
      setLoading(false);
    }
  }, [funcionarios]);

  // Excluir funcionário
  const excluirFuncionario = useCallback(async (id: string): Promise<boolean> => {
    const funcionario = funcionarios.find(f => f.id === id);
    
    if (!funcionario) {
      toast.error('Funcionário não encontrado');
      return false;
    }

    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setFuncionarios(prev => prev.filter(f => f.id !== id));
      toast.success('Funcionário excluído com sucesso!');
      return true;

    } catch (error) {
      toast.error('Erro ao excluir funcionário');
      return false;
    } finally {
      setLoading(false);
    }
  }, [funcionarios]);

  // Obter funcionários ativos
  const obterFuncionariosAtivos = useCallback((): Funcionario[] => {
    return funcionarios.filter(funcionario => funcionario.ativo);
  }, [funcionarios]);

  // Obter funcionário por ID
  const obterFuncionarioPorId = useCallback((id: string): Funcionario | undefined => {
    return funcionarios.find(funcionario => funcionario.id === id);
  }, [funcionarios]);

  // Buscar funcionários
  const buscarFuncionarios = useCallback((termo: string): Funcionario[] => {
    if (!termo.trim()) return funcionarios;
    
    const termoBusca = termo.toLowerCase().trim();
    return funcionarios.filter(funcionario =>
      funcionario.nome.toLowerCase().includes(termoBusca) ||
      (funcionario.email && funcionario.email.toLowerCase().includes(termoBusca)) ||
      (funcionario.setor && funcionario.setor.toLowerCase().includes(termoBusca)) ||
      funcionario.perfil.toLowerCase().includes(termoBusca)
    );
  }, [funcionarios]);

  // Estatísticas
  const estatisticas = {
    total: funcionarios.length,
    ativos: funcionarios.filter(f => f.ativo).length,
    inativos: funcionarios.filter(f => !f.ativo).length,
    vendedores: funcionarios.filter(f => f.perfil === 'VENDEDOR').length,
    gerentes: funcionarios.filter(f => f.perfil === 'GERENTE').length,
    medidores: funcionarios.filter(f => f.perfil === 'MEDIDOR').length,
    admins: funcionarios.filter(f => f.perfil === 'ADMIN_MASTER').length
  };

  // Resetar dados para mock inicial
  const resetarDados = useCallback(() => {
    clearFuncionarios();
    toast.success('Dados resetados para configuração inicial!');
  }, [clearFuncionarios]);

  return {
    funcionarios,
    loading,
    estatisticas,
    criarFuncionario,
    atualizarFuncionario,
    alternarStatusFuncionario,
    excluirFuncionario,
    obterFuncionariosAtivos,
    obterFuncionarioPorId,
    buscarFuncionarios,
    resetarDados,
    // Dados para relacionamentos
    empresas: obterEmpresasAtivas(),
    lojas: obterLojasAtivas(),
    setores: obterSetoresAtivos()
  };
}