import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Search, Truck } from 'lucide-react';
import { useTransportadoras } from '@/hooks/modulos/sistema/use-transportadoras';
import { TransportadoraTable } from './transportadora-table';
import { TransportadoraForm } from './transportadora-form';
import type { TransportadoraFormData } from '@/types/sistema';

export function GestaoTransportadoras() {
  const {
    transportadoras,
    loading,
    criarTransportadora,
    atualizarTransportadora,
    excluirTransportadora,
    alternarStatus,
    buscarTransportadoras
  } = useTransportadoras();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransportadora, setEditingTransportadora] = useState<any>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [formData, setFormData] = useState<TransportadoraFormData>({
    nomeEmpresa: '',
    valorFixo: 0,
    telefone: '',
    email: ''
  });

  // Filtrar transportadoras baseado na busca
  const transportadorasFiltradas = termoBusca ? buscarTransportadoras(termoBusca) : transportadoras;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let sucesso = false;
    if (editingTransportadora) {
      sucesso = await atualizarTransportadora(editingTransportadora.id, formData);
    } else {
      sucesso = await criarTransportadora(formData);
    }

    if (sucesso) {
      handleCloseDialog();
    }
  };

  const handleEdit = (transportadora: any) => {
    setEditingTransportadora(transportadora);
    setFormData({
      nomeEmpresa: transportadora.nomeEmpresa,
      valorFixo: transportadora.valorFixo,
      telefone: transportadora.telefone,
      email: transportadora.email
    });
    setIsDialogOpen(true);
  };

  const handleNewTransportadora = () => {
    setEditingTransportadora(null);
    setFormData({
      nomeEmpresa: '',
      valorFixo: 0,
      telefone: '',
      email: ''
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTransportadora(null);
    setFormData({
      nomeEmpresa: '',
      valorFixo: 0,
      telefone: '',
      email: ''
    });
  };

  return (
    <div className="space-y-3">
      {/* Header de Ações - Buscador + Nova Transportadora na mesma linha */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* Buscador */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar transportadoras por nome ou email..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="pl-10 h-10 border-gray-200 focus:border-slate-400 focus:ring-slate-400 bg-white shadow-sm"
          />
        </div>

        {/* Botão Nova Transportadora */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleNewTransportadora}
              className="gap-1.5 h-8 px-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-medium text-white text-xs"
            >
              <Truck className="h-3.5 w-3.5" />
              Nova Transportadora
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTransportadora ? 'Editar Transportadora' : 'Nova Transportadora'}
              </DialogTitle>
            </DialogHeader>
            <TransportadoraForm
              formData={formData}
              onFormDataChange={setFormData}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
              isEditing={!!editingTransportadora}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Transportadoras */}
      <TransportadoraTable
        transportadoras={transportadorasFiltradas}
        onEdit={handleEdit}
        onDelete={excluirTransportadora}
        onToggleStatus={alternarStatus}
        loading={loading}
      />
    </div>
  );
}