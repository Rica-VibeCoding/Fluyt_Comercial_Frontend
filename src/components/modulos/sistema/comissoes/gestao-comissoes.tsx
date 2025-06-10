import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, DollarSign, Search, Filter } from 'lucide-react';
import { useComissoes } from '@/hooks/modulos/sistema/use-comissoes';
import { ComissaoForm } from './comissao-form';
import { ComissaoTable } from './comissao-table';
import type { RegraComissaoFormData } from '@/types/sistema';

export function GestaoComissoes() {
  const {
    regrasComissao,
    loading,
    estatisticas,
    criarRegraComissao,
    atualizarRegraComissao,
    alternarStatusRegra,
    excluirRegraComissao,
    buscarRegras
  } = useComissoes();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRegra, setEditingRegra] = useState<any>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [formData, setFormData] = useState<RegraComissaoFormData>({
    tipo: 'VENDEDOR',
    valorMinimo: 0,
    valorMaximo: null,
    percentual: 0
  });

  // Filtrar regras baseado na busca
  const regrasFiltradas = termoBusca ? buscarRegras(termoBusca) : regrasComissao;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let sucesso = false;
    if (editingRegra) {
      sucesso = await atualizarRegraComissao(editingRegra.id, formData);
    } else {
      sucesso = await criarRegraComissao(formData);
    }

    if (sucesso) {
      handleCloseDialog();
    }
  };

  const handleEdit = (regra: any) => {
    setEditingRegra(regra);
    setFormData({
      tipo: regra.tipo,
      valorMinimo: regra.valorMinimo,
      valorMaximo: regra.valorMaximo,
      percentual: regra.percentual,
      descricao: regra.descricao
    });
    setIsDialogOpen(true);
  };

  const handleNewRegra = () => {
    setEditingRegra(null);
    setFormData({
      tipo: 'VENDEDOR',
      valorMinimo: 0,
      valorMaximo: null,
      percentual: 0
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRegra(null);
    setFormData({
      tipo: 'VENDEDOR',
      valorMinimo: 0,
      valorMaximo: null,
      percentual: 0
    });
  };

  return (
    <div className="space-y-3">
      {/* Header de Ações - Buscador + Nova Regra na mesma linha */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* Buscador */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar regras por tipo, percentual ou descrição..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="pl-10 h-10 border-gray-200 focus:border-slate-400 focus:ring-slate-400 bg-white shadow-sm"
          />
        </div>

        {/* Botão Nova Regra */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleNewRegra} 
              className="gap-1.5 h-8 px-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-medium text-white text-xs"
            >
              <DollarSign className="h-3.5 w-3.5" />
              Nova Regra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRegra ? 'Editar Regra de Comissão' : 'Nova Regra de Comissão'}
              </DialogTitle>
            </DialogHeader>
            <ComissaoForm
              formData={formData}
              onFormDataChange={setFormData}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
              isEditing={!!editingRegra}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Regras */}
      <ComissaoTable
        regras={regrasFiltradas}
        onEdit={handleEdit}
        onDelete={excluirRegraComissao}
        onToggleStatus={alternarStatusRegra}
        loading={loading}
      />
    </div>
  );
}