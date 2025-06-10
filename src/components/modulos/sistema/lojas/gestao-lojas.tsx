'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Building2, MapPin, Phone, Mail, Search, Filter, Store } from 'lucide-react';
import { useEmpresas } from '@/hooks/modulos/sistema/use-empresas';
import { useLojas } from '@/hooks/modulos/sistema/use-lojas';
import type { LojaFormData } from '@/types/sistema';
import { LojaTable } from './loja-table';

export default function GestaoLojas() {
  const { obterEmpresasAtivas } = useEmpresas();
  const {
    lojas,
    loading,
    criarLoja,
    atualizarLoja,
    alternarStatusLoja,
    excluirLoja,
    gerarProximoCodigo
  } = useLojas();

  const empresasAtivas = obterEmpresasAtivas();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLoja, setEditingLoja] = useState<any>(null);
  const [formData, setFormData] = useState<LojaFormData>({
    nome: '',
    codigo: '',
    endereco: '',
    telefone: '',
    email: '',
    gerente: '',
    empresaId: '',
    metaMes: 100000
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let sucesso = false;
    if (editingLoja) {
      sucesso = await atualizarLoja(editingLoja.id, formData);
    } else {
      sucesso = await criarLoja(formData);
    }

    if (sucesso) {
      handleCloseDialog();
    }
  };

  const handleEdit = (loja: any) => {
    setEditingLoja(loja);
    setFormData({
      nome: loja.nome,
      codigo: loja.codigo,
      endereco: loja.endereco,
      telefone: loja.telefone,
      email: loja.email,
      gerente: loja.gerente,
      empresaId: loja.empresaId,
      metaMes: loja.metaMes
    });
    setIsDialogOpen(true);
  };

  const handleNewLoja = () => {
    setEditingLoja(null);
    setFormData({
      nome: '',
      codigo: '',
      endereco: '',
      telefone: '',
      email: '',
      gerente: '',
      empresaId: '',
      metaMes: 100000
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLoja(null);
    setFormData({
      nome: '',
      codigo: '',
      endereco: '',
      telefone: '',
      email: '',
      gerente: '',
      empresaId: '',
      metaMes: 100000
    });
  };

  const handleEmpresaChange = (empresaId: string) => {
    setFormData(prev => ({
      ...prev,
      empresaId,
      codigo: empresaId ? gerarProximoCodigo(empresaId) : ''
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (empresasAtivas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-0 rounded-lg bg-white shadow-md">
        <Building2 className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa ativa encontrada</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Cadastre e ative uma empresa primeiro para poder criar lojas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header de Ações - Buscador + Nova Loja na mesma linha */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* Buscador */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar lojas por nome, endereço ou cidade..."
            className="pl-10 h-10 border-gray-200 focus:border-slate-400 focus:ring-slate-400 bg-white shadow-sm"
          />
        </div>

        {/* Botão Nova Loja */}
        <Button 
          onClick={handleNewLoja}
          className="gap-1.5 h-8 px-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-medium text-white text-xs"
        >
          <Store className="h-3.5 w-3.5" />
          Nova Loja
        </Button>
      </div>

      {/* Tabela */}
      <LojaTable lojas={lojas} />

      {/* Dialog de formulário */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingLoja ? 'Editar Loja' : 'Nova Loja'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="empresaId">Empresa *</Label>
                <Select value={formData.empresaId} onValueChange={handleEmpresaChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresasAtivas.map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  readOnly
                  className="bg-gray-50"
                  placeholder="Será gerado automaticamente"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="nome">Nome da Loja *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="endereco">Endereço *</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="gerente">Gerente</Label>
                <Input
                  id="gerente"
                  value={formData.gerente}
                  onChange={(e) => setFormData(prev => ({ ...prev, gerente: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="metaMes">Meta Mensal</Label>
                <Input
                  id="metaMes"
                  type="number"
                  value={formData.metaMes}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaMes: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : editingLoja ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}