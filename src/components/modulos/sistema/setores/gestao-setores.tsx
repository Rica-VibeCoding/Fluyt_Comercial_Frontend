import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Layers, Search, Filter } from 'lucide-react';
import { useSetores } from '@/hooks/modulos/sistema/use-setores';
import { SetorForm } from './setor-form';
import { SetorTable } from './setor-table';
import type { SetorFormData } from '@/types/sistema';

export function GestaoSetores() {
  const {
    setores,
    loading,
    estatisticas,
    criarSetor,
    atualizarSetor,
    alternarStatusSetor,
    excluirSetor,
    buscarSetores
  } = useSetores();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSetor, setEditingSetor] = useState<any>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [formData, setFormData] = useState<SetorFormData>({
    nome: '',
    descricao: ''
  });

  // Filtrar setores baseado na busca
  const setoresFiltrados = termoBusca ? buscarSetores(termoBusca) : setores;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let sucesso = false;
    if (editingSetor) {
      sucesso = await atualizarSetor(editingSetor.id, formData);
    } else {
      sucesso = await criarSetor(formData);
    }

    if (sucesso) {
      handleCloseDialog();
    }
  };

  const handleEdit = (setor: any) => {
    setEditingSetor(setor);
    setFormData({
      nome: setor.nome,
      descricao: setor.descricao
    });
    setIsDialogOpen(true);
  };

  const handleNewSetor = () => {
    setEditingSetor(null);
    setFormData({
      nome: '',
      descricao: ''
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSetor(null);
    setFormData({
      nome: '',
      descricao: ''
    });
  };

  return (
    <div className="space-y-3">
      {/* Header de Ações - Buscador + Novo Setor na mesma linha */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* Buscador */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar setores por nome ou descrição..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="pl-10 h-10 border-gray-200 focus:border-slate-400 focus:ring-slate-400 bg-white shadow-sm"
          />
        </div>

        {/* Botão Novo Setor */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleNewSetor}
              className="gap-1.5 h-8 px-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-medium text-white text-xs"
            >
              <Layers className="h-3.5 w-3.5" />
              Novo Setor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSetor ? 'Editar Setor' : 'Novo Setor'}
              </DialogTitle>
            </DialogHeader>
            <SetorForm
              formData={formData}
              onFormDataChange={setFormData}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
              isEditing={!!editingSetor}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Setores */}
      <SetorTable
        setores={setoresFiltrados}
        onEdit={handleEdit}
        onDelete={excluirSetor}
        onToggleStatus={alternarStatusSetor}
        loading={loading}
      />
    </div>
  );
}