import { useState, useCallback, useMemo, useEffect } from 'react';
import { Cliente, FiltrosCliente, Vendedor } from '../../../types/cliente';
import { useToast } from '../../globais/use-toast';
import { clientesApi, vendedoresMock } from '../../../services/clientes-api';

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores] = useState<Vendedor[]>(vendedoresMock);
  const [filtros, setFiltros] = useState<FiltrosCliente>({});
  const [isLoading, setIsLoading] = useState(false);
  const [totalClientes, setTotalClientes] = useState(0);
  const { toast } = useToast();

  // Função para carregar clientes da API com useCallback
  const carregarClientes = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('🔗 Carregando clientes da API...', filtros);
      const clientesCarregados = await clientesApi.listarClientes(filtros, 0, 50);
      console.log('📋 Dados brutos recebidos:', clientesCarregados);
      
      if (clientesCarregados && clientesCarregados.length > 0) {
        console.log('🔍 Primeiro cliente recebido:');
        console.log('   Nome:', clientesCarregados[0].nome);
        console.log('   CPF/CNPJ:', clientesCarregados[0].cpf_cnpj);
        console.log('   Telefone:', clientesCarregados[0].telefone);
        console.log('   ID:', clientesCarregados[0].id);
      }
      
      setClientes(clientesCarregados || []); // Garantir array vazio se null
      setTotalClientes(clientesCarregados?.length || 0);
      console.log('✅ Clientes carregados com sucesso:', clientesCarregados?.length || 0);
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error);
      toast({
        title: "Erro ao carregar clientes",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      
      // Em caso de erro, manter array vazio
      setClientes([]);
      setTotalClientes(0);
    } finally {
      setIsLoading(false);
    }
  }, [filtros, toast]);

  // Carregar clientes da API ao inicializar e quando filtros mudarem
  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  // Os filtros agora são aplicados na API, então retornamos os clientes diretamente
  const filteredClientes = useMemo(() => {
    return clientes;
  }, [clientes]);

  const adicionarCliente = useCallback(async (novoCliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      console.log('🔗 Criando cliente na API...', novoCliente.nome);
      const clienteCriado = await clientesApi.criarCliente(novoCliente);
      
      // Recarregar lista após criar
      await carregarClientes();
      
      toast({
        title: "Cliente cadastrado com sucesso!",
        description: `Cliente ${clienteCriado.nome} foi adicionado à sua base de dados.`,
      });
      
      console.log('✅ Cliente criado com sucesso:', clienteCriado.id);
      return clienteCriado;
    } catch (error) {
      console.error('❌ Erro ao criar cliente:', error);
      toast({
        title: "Erro ao cadastrar cliente",
        description: error instanceof Error ? error.message : "Verifique os dados e tente novamente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast, carregarClientes]);

  const atualizarCliente = useCallback(async (id: string, dadosAtualizados: Partial<Cliente>) => {
    setIsLoading(true);
    try {
      console.log('🔗 Atualizando cliente na API...', id);
      const clienteAtualizado = await clientesApi.atualizarCliente(id, dadosAtualizados);
      
      // Recarregar lista após atualizar
      await carregarClientes();
      
      toast({
        title: "Cliente atualizado com sucesso!",
        description: `Alterações do cliente ${clienteAtualizado.nome} foram salvas.`,
      });
      
      console.log('✅ Cliente atualizado com sucesso:', id);
    } catch (error) {
      console.error('❌ Erro ao atualizar cliente:', error);
      toast({
        title: "Erro ao atualizar cliente",
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast, carregarClientes]);

  const removerCliente = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      console.log('🔗 Removendo cliente da API...', id);
      await clientesApi.excluirCliente(id);
      
      // Recarregar lista após remover
      await carregarClientes();
      
      toast({
        title: "Cliente removido",
        description: "O cliente foi removido da base de dados.",
      });
      
      console.log('✅ Cliente removido com sucesso:', id);
    } catch (error) {
      console.error('❌ Erro ao remover cliente:', error);
      toast({
        title: "Erro ao remover cliente",
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast, carregarClientes]);

  return {
    clientes: filteredClientes,
    vendedores,
    filtros,
    setFiltros,
    isLoading,
    adicionarCliente,
    atualizarCliente,
    removerCliente,
    totalClientes,
    recarregarClientes: carregarClientes
  };
}