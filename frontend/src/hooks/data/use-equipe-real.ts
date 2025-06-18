/**
 * Hook para Equipe - DADOS REAIS DO SUPABASE
 * Conecta diretamente com backend implementado pelo C.Testa
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { equipeApi, type FuncionarioApi, type FuncionarioFormData } from '@/services/equipe-api';
import type { Funcionario } from '@/types/sistema';

export interface UseEquipeRealReturn {
  // Dados
  funcionarios: Funcionario[];
  loading: boolean;
  error: string | null;

  // Estatísticas
  totalFuncionarios: number;
  funcionariosAtivos: number;
  funcionariosInativos: number;
  funcionariosPorLoja: Record<string, number>;
  funcionariosPorSetor: Record<string, number>;

  // Funções de busca
  obterFuncionarioPorId: (id: string) => Funcionario | undefined;
  obterFuncionariosPorLoja: (lojaId: string) => Funcionario[];
  obterFuncionariosPorSetor: (setorId: string) => Funcionario[];
  buscarFuncionarios: (termo: string) => Funcionario[];

  // Funções CRUD (placeholders até C.Testa implementar)
  criarFuncionario: (dados: FuncionarioFormData) => Promise<boolean>;
  atualizarFuncionario: (id: string, dados: Partial<FuncionarioFormData>) => Promise<boolean>;
  alternarStatusFuncionario: (id: string) => Promise<boolean>;

  // Controle
  recarregarDados: () => Promise<void>;
  filtrarPorLoja: (lojaId: string | null) => void;
  filtrarPorSetor: (setorId: string | null) => void;
}

export function useEquipeReal(): UseEquipeRealReturn {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroLoja, setFiltroLoja] = useState<string | null>(null);
  const [filtroSetor, setFiltroSetor] = useState<string | null>(null);

  // Converter dados da API para formato do frontend
  const converterFuncionarioApi = useCallback((funcionarioApi: FuncionarioApi): Funcionario => ({
    id: funcionarioApi.id,
    nome: funcionarioApi.nome,
    email: funcionarioApi.email,
    telefone: funcionarioApi.telefone,
    setor_id: funcionarioApi.setor_id,
    setor: funcionarioApi.cad_setores?.nome || '',
    loja_id: funcionarioApi.loja_id,
    loja: funcionarioApi.c_lojas?.nome || '',
    salario: funcionarioApi.salario,
    data_admissao: funcionarioApi.data_admissao,
    ativo: funcionarioApi.ativo,
    nivel_acesso: funcionarioApi.nivel_acesso as any,
    perfil: funcionarioApi.perfil as any,
    limite_desconto: funcionarioApi.limite_desconto,
    comissao_percentual_vendedor: funcionarioApi.comissao_percentual_vendedor,
    comissao_percentual_gerente: funcionarioApi.comissao_percentual_gerente,
    override_comissao: funcionarioApi.override_comissao,
    tem_minimo_garantido: funcionarioApi.tem_minimo_garantido,
    valor_minimo_garantido: funcionarioApi.valor_minimo_garantido,
    valor_medicao: funcionarioApi.valor_medicao,
    performance: 0, // Campo calculado para compatibilidade
    createdAt: funcionarioApi.created_at,
    updatedAt: funcionarioApi.updated_at
  }), []);

  // Função para carregar dados reais do Supabase
  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔗 Carregando equipe real do backend...');
      
      const filtros: any = {};
      if (filtroLoja) filtros.loja_id = filtroLoja;
      if (filtroSetor) filtros.setor_id = filtroSetor;
      
      const { funcionarios: funcionariosData } = await equipeApi.listarFuncionarios(filtros);
      
      // Converter dados da API para formato do frontend
      const funcionariosConvertidos = funcionariosData.map(converterFuncionarioApi);
      
      setFuncionarios(funcionariosConvertidos);
      
      console.log('✅ Equipe carregada:', {
        total: funcionariosConvertidos.length,
        filtros: { loja: filtroLoja, setor: filtroSetor }
      });
      
      if (funcionariosConvertidos.length > 0) {
        const msgFiltro = (filtroLoja || filtroSetor) ? ' (com filtros)' : '';
        toast.success(`${funcionariosConvertidos.length} funcionário(s) carregado(s)${msgFiltro}`);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro ao carregar equipe:', err);
      toast.error(`Erro ao carregar equipe: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [filtroLoja, filtroSetor, converterFuncionarioApi]);

  // Carregar dados na inicialização
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Função para recarregar dados
  const recarregarDados = useCallback(async () => {
    await carregarDados();
  }, [carregarDados]);

  // Filtros
  const filtrarPorLoja = useCallback((lojaId: string | null) => {
    setFiltroLoja(lojaId);
  }, []);

  const filtrarPorSetor = useCallback((setorId: string | null) => {
    setFiltroSetor(setorId);
  }, []);

  // Obter funcionário por ID
  const obterFuncionarioPorId = useCallback((id: string): Funcionario | undefined => {
    return funcionarios.find(funcionario => funcionario.id === id);
  }, [funcionarios]);

  // Obter funcionários de uma loja
  const obterFuncionariosPorLoja = useCallback((lojaId: string): Funcionario[] => {
    return funcionarios.filter(funcionario => funcionario.loja_id === lojaId);
  }, [funcionarios]);

  // Obter funcionários de um setor
  const obterFuncionariosPorSetor = useCallback((setorId: string): Funcionario[] => {
    return funcionarios.filter(funcionario => funcionario.setor_id === setorId);
  }, [funcionarios]);

  // Buscar funcionários por termo
  const buscarFuncionarios = useCallback((termo: string): Funcionario[] => {
    if (!termo.trim()) return funcionarios;
    
    const termoBusca = termo.toLowerCase().trim();
    return funcionarios.filter(funcionario =>
      funcionario.nome.toLowerCase().includes(termoBusca) ||
      (funcionario.email && funcionario.email.toLowerCase().includes(termoBusca)) ||
      (funcionario.telefone && funcionario.telefone.includes(termoBusca)) ||
      (funcionario.loja && funcionario.loja.toLowerCase().includes(termoBusca)) ||
      (funcionario.setor && funcionario.setor.toLowerCase().includes(termoBusca))
    );
  }, [funcionarios]);

  // Criar funcionário (API REAL)
  const criarFuncionario = useCallback(async (dados: FuncionarioFormData): Promise<boolean> => {
    try {
      setLoading(true);
      
      console.log('👤 Criando funcionário via API real:', dados);
      const funcionarioCriado = await equipeApi.criarFuncionario(dados);
      
      // Recarregar dados após criação
      await carregarDados();
      
      toast.success(`Funcionário ${funcionarioCriado.nome} criado com sucesso!`);
      return true;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro ao criar funcionário:', error);
      toast.error(`Erro ao criar funcionário: ${errorMessage}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [carregarDados]);

  // Atualizar funcionário (API REAL)
  const atualizarFuncionario = useCallback(async (id: string, dados: Partial<FuncionarioFormData>): Promise<boolean> => {
    try {
      setLoading(true);
      
      console.log('✏️ Atualizando funcionário via API real:', { id, dados });
      const funcionarioAtualizado = await equipeApi.atualizarFuncionario(id, dados);
      
      // Validar se o retorno tem os dados esperados
      if (!funcionarioAtualizado || !funcionarioAtualizado.nome) {
        console.warn('⚠️ Retorno da API não contém dados válidos:', funcionarioAtualizado);
        throw new Error('Dados do funcionário não foram retornados corretamente');
      }
      
      // Recarregar dados após atualização
      await carregarDados();
      
      toast.success(`Funcionário ${funcionarioAtualizado.nome} atualizado com sucesso!`);
      return true;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro ao atualizar funcionário:', error);
      toast.error(`Erro ao atualizar funcionário: ${errorMessage}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [carregarDados]);

  // Alternar status do funcionário (API REAL)
  const alternarStatusFuncionario = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      console.log('🔄 Alternando status via API real:', id);
      const sucesso = await equipeApi.alternarStatusFuncionario(id);
      
      if (sucesso) {
        // Recarregar dados após alteração
        await carregarDados();
        toast.success('Status do funcionário alterado com sucesso!');
        return true;
      } else {
        throw new Error('Falha ao alterar status');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro ao alterar status:', error);
      toast.error(`Erro ao alterar status: ${errorMessage}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [carregarDados]);

  // Calcular estatísticas
  const totalFuncionarios = funcionarios.length;
  const funcionariosAtivos = funcionarios.filter(f => f.ativo).length;
  const funcionariosInativos = funcionarios.filter(f => !f.ativo).length;
  
  // Agrupar por loja
  const funcionariosPorLoja = funcionarios.reduce((acc, funcionario) => {
    const lojaId = funcionario.loja_id;
    acc[lojaId] = (acc[lojaId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Agrupar por setor
  const funcionariosPorSetor = funcionarios.reduce((acc, funcionario) => {
    const setorId = funcionario.setor_id;
    acc[setorId] = (acc[setorId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    // Dados
    funcionarios,
    loading,
    error,

    // Estatísticas
    totalFuncionarios,
    funcionariosAtivos,
    funcionariosInativos,
    funcionariosPorLoja,
    funcionariosPorSetor,

    // Funções de busca
    obterFuncionarioPorId,
    obterFuncionariosPorLoja,
    obterFuncionariosPorSetor,
    buscarFuncionarios,

    // Funções CRUD
    criarFuncionario,
    atualizarFuncionario,
    alternarStatusFuncionario,

    // Controle
    recarregarDados,
    filtrarPorLoja,
    filtrarPorSetor,
  };
}