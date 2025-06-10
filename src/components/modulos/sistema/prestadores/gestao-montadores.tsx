import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Search, Wrench } from 'lucide-react';
import { useMontadores } from '@/hooks/modulos/sistema/use-montadores';
import { MontadorTable } from './montador-table';
import { MontadorForm } from './montador-form';
import type { MontadorFormData } from '@/types/sistema';

export function GestaoMontadores() {
  const {
    montadores,
    loading,
    criarMontador,
    atualizarMontador,
    excluirMontador,
    alternarStatus,
    buscarMontadores
  } = useMontadores();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMontador, setEditingMontador] = useState<any>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [formData, setFormData] = useState<MontadorFormData>({
    nome: '',
    categoria: 'MARCENEIRO',
    valorFixo: 0,
    telefone: ''
  });

  // Filtrar montadores baseado na busca
  const montadoresFiltrados = termoBusca ? buscarMontadores(termoBusca) : montadores;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let sucesso = false;
    if (editingMontador) {
      sucesso = await atualizarMontador(editingMontador.id, formData);
    } else {
      sucesso = await criarMontador(formData);
    }

    if (sucesso) {
      handleCloseDialog();
    }
  };

  const handleEdit = (montador: any) => {
    setEditingMontador(montador);
    setFormData({
      nome: montador.nome,
      categoria: montador.categoria,
      valorFixo: montador.valorFixo,
      telefone: montador.telefone
    });
    setIsDialogOpen(true);
  };

  const handleNewMontador = () => {
    setEditingMontador(null);
    setFormData({
      nome: '',
      categoria: 'MARCENEIRO',
      valorFixo: 0,
      telefone: ''
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMontador(null);
    setFormData({
      nome: '',
      categoria: 'MARCENEIRO',
      valorFixo: 0,
      telefone: ''
    });
  };

  return (
    <div className="space-y-3">
      {/* Header de Ações - Buscador + Novo Montador na mesma linha */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* Buscador */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar montadores por nome ou categoria..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="pl-10 h-10 border-gray-200 focus:border-slate-400 focus:ring-slate-400 bg-white shadow-sm"
          />
        </div>

        {/* Botão Novo Montador */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleNewMontador}
              className="gap-1.5 h-8 px-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-medium text-white text-xs"
            >
              <Wrench className="h-3.5 w-3.5" />
              Novo Montador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMontador ? 'Editar Montador' : 'Novo Montador'}
              </DialogTitle>
            </DialogHeader>
            <MontadorForm
              formData={formData}
              onFormDataChange={setFormData}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
              isEditing={!!editingMontador}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Montadores */}
      <MontadorTable
        montadores={montadoresFiltrados}
        onEdit={handleEdit}
        onDelete={excluirMontador}
        onToggleStatus={alternarStatus}
        loading={loading}
      />
    </div>
  );
}