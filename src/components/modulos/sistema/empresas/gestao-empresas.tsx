import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Building2, Search, Filter } from 'lucide-react';
import { useEmpresas } from '@/hooks/modulos/sistema/use-empresas';
import { EmpresaForm } from './empresa-form';
import { EmpresaTable } from './empresa-table';
import type { EmpresaFormData } from '@/types/sistema';

export function GestaoEmpresas() {
  const {
    empresas,
    loading,
    estatisticas,
    criarEmpresa,
    atualizarEmpresa,
    alternarStatusEmpresa,
    excluirEmpresa,
    buscarEmpresas
  } = useEmpresas();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<any>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [formData, setFormData] = useState<EmpresaFormData>({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: ''
  });

  // Filtrar empresas baseado na busca
  const empresasFiltradas = termoBusca ? buscarEmpresas(termoBusca) : empresas;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let sucesso = false;
    if (editingEmpresa) {
      sucesso = await atualizarEmpresa(editingEmpresa.id, formData);
    } else {
      sucesso = await criarEmpresa(formData);
    }

    if (sucesso) {
      handleCloseDialog();
    }
  };

  const handleEdit = (empresa: any) => {
    setEditingEmpresa(empresa);
    setFormData({
      nome: empresa.nome,
      cnpj: empresa.cnpj,
      email: empresa.email,
      telefone: empresa.telefone,
      endereco: empresa.endereco
    });
    setIsDialogOpen(true);
  };

  const handleNewEmpresa = () => {
    setEditingEmpresa(null);
    setFormData({
      nome: '',
      cnpj: '',
      email: '',
      telefone: '',
      endereco: ''
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEmpresa(null);
    setFormData({
      nome: '',
      cnpj: '',
      email: '',
      telefone: '',
      endereco: ''
    });
  };

  return (
    <div className="space-y-3">
      {/* Ações */}
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleNewEmpresa}
              className="gap-1.5 h-8 px-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl font-semibold text-white text-xs"
            >
              <Building2 className="h-3.5 w-3.5" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEmpresa ? 'Editar Empresa' : 'Nova Empresa'}
              </DialogTitle>
            </DialogHeader>
            <EmpresaForm
              formData={formData}
              onFormDataChange={setFormData}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
              isEditing={!!editingEmpresa}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros e Busca */}
      <Card className="shadow-md border-0 bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar empresas por nome, CNPJ ou email..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2 bg-white hover:bg-gray-50 border-slate-300 text-slate-700 hover:text-slate-800 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl font-semibold">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>


      {/* Tabela de Empresas */}
      <EmpresaTable
        empresas={empresasFiltradas}
        onEdit={handleEdit}
        onDelete={excluirEmpresa}
        onToggleStatus={alternarStatusEmpresa}
        loading={loading}
      />
    </div>
  );
}