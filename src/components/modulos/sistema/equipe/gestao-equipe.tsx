import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, UserCog, Search, Filter } from 'lucide-react';
import { useEquipe } from '@/hooks/modulos/sistema/use-equipe';
import { FuncionarioForm } from './funcionario-form';
import { FuncionarioTable } from './funcionario-table';
import type { FuncionarioFormData } from '@/types/sistema';

export function GestaoEquipe() {
  const {
    funcionarios,
    loading,
    estatisticas,
    criarFuncionario,
    atualizarFuncionario,
    alternarStatusFuncionario,
    excluirFuncionario,
    buscarFuncionarios,
    lojas,
    setores
  } = useEquipe();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<any>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [formData, setFormData] = useState<FuncionarioFormData>({
    nome: '',
    email: '',
    telefone: '',
    setor: '',
    lojaId: '',
    salario: 0,
    comissao: 0,
    dataAdmissao: '',
    nivelAcesso: 'USUARIO',
    tipoFuncionario: 'VENDEDOR'
  });

  // Filtrar funcionários baseado na busca
  const funcionariosFiltrados = termoBusca ? buscarFuncionarios(termoBusca) : funcionarios;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let sucesso = false;
    if (editingFuncionario) {
      sucesso = await atualizarFuncionario(editingFuncionario.id, formData);
    } else {
      sucesso = await criarFuncionario(formData);
    }

    if (sucesso) {
      handleCloseDialog();
    }
  };

  const handleEdit = (funcionario: any) => {
    setEditingFuncionario(funcionario);
    setFormData({
      nome: funcionario.nome,
      email: funcionario.email,
      telefone: funcionario.telefone,
      setor: funcionario.setor,
      lojaId: funcionario.lojaId,
      salario: funcionario.salario,
      comissao: funcionario.comissao,
      dataAdmissao: funcionario.dataAdmissao,
      nivelAcesso: funcionario.nivelAcesso,
      tipoFuncionario: funcionario.tipoFuncionario,
      configuracoes: funcionario.configuracoes
    });
    setIsDialogOpen(true);
  };

  const handleNewFuncionario = () => {
    setEditingFuncionario(null);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      setor: '',
      lojaId: '',
      salario: 0,
      comissao: 0,
      dataAdmissao: '',
      nivelAcesso: 'USUARIO',
      tipoFuncionario: 'VENDEDOR'
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingFuncionario(null);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      setor: '',
      lojaId: '',
      salario: 0,
      comissao: 0,
      dataAdmissao: '',
      nivelAcesso: 'USUARIO',
      tipoFuncionario: 'VENDEDOR'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header com Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Equipe</h2>
          <p className="text-gray-600">Gerencie todos os colaboradores da empresa</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewFuncionario} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Novo Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingFuncionario ? 'Editar Colaborador' : 'Novo Colaborador'}
              </DialogTitle>
            </DialogHeader>
            <FuncionarioForm
              formData={formData}
              onFormDataChange={setFormData}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
              isEditing={!!editingFuncionario}
              loading={loading}
              lojas={lojas}
              setores={setores}
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
                placeholder="Buscar por nome, email, tipo ou setor..."
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

      {/* Tabela de Funcionários */}
      <FuncionarioTable
        funcionarios={funcionariosFiltrados}
        onEdit={handleEdit}
        onDelete={excluirFuncionario}
        onToggleStatus={alternarStatusFuncionario}
        loading={loading}
      />
    </div>
  );
}