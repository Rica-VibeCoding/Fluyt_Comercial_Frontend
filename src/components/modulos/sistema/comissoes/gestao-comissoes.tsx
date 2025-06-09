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
    <div className="space-y-6">
      {/* Header com Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Regras de Comissão</h2>
          <p className="text-gray-600">Configure faixas de comissão por tipo e valor de vendas</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewRegra} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
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

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por tipo, percentual ou descrição..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

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