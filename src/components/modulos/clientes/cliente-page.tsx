import { useState } from 'react';
import { ClienteHeader } from './cliente-header';
import { ClienteFiltrosModerno } from './cliente-filtros-moderno';
import { ClienteTabela } from './cliente-tabela';
import { ClienteModal } from './cliente-modal';
import { useClientes } from '../../../hooks/modulos/clientes/use-clientes';
import { Cliente } from '../../../types/cliente';

export function ClientePage() {
  const {
    clientes,
    vendedores,
    filtros,
    setFiltros,
    isLoading,
    adicionarCliente,
    atualizarCliente,
    removerCliente,
    totalClientes
  } = useClientes();

  const [modalAberto, setModalAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);

  const handleNovoCliente = () => {
    setClienteEditando(null);
    setModalAberto(true);
  };

  const handleEditarCliente = (cliente: Cliente) => {
    setClienteEditando(cliente);
    setModalAberto(true);
  };

  const handleSalvarCliente = async (dados: any) => {
    if (clienteEditando) {
      await atualizarCliente(clienteEditando.id, dados);
    } else {
      const vendedor = vendedores.find(v => v.id === dados.vendedor_id);
      await adicionarCliente({
        ...dados,
        vendedor_nome: vendedor?.nome || ''
      });
    }
    setModalAberto(false);
    setClienteEditando(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-8">
        <ClienteHeader 
          totalClientes={totalClientes}
          onNovoCliente={handleNovoCliente}
        />
        
        <ClienteFiltrosModerno 
          filtros={filtros}
          onFiltrosChange={setFiltros}
          vendedores={vendedores}
        />
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <ClienteTabela 
            clientes={clientes}
            isLoading={isLoading}
            onEditarCliente={handleEditarCliente}
            onRemoverCliente={removerCliente}
          />
        </div>

        <ClienteModal
          aberto={modalAberto}
          onFechar={() => {
            setModalAberto(false);
            setClienteEditando(null);
          }}
          cliente={clienteEditando}
          vendedores={vendedores}
          onSalvar={handleSalvarCliente}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}