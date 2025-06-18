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
import { useEmpresasReal } from '@/hooks/data/use-empresas-real';
import { useLojasReal } from '@/hooks/data/use-lojas-real';
import type { LojaFormData } from '@/types/sistema';
import { LojaTable } from './loja-table';
import { toast } from 'sonner';

export default function GestaoLojas() {
  const { empresas } = useEmpresasReal();
  const empresasAtivas = empresas.filter(emp => emp.ativo);
  const {
    lojas,
    loading,
    criarLoja,
    atualizarLoja,
    desativarLoja,
    buscarLojas
  } = useLojasReal(); // USANDO DADOS REAIS AGORA
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLoja, setEditingLoja] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    endereco: '',
    telefone: '',
    email: '',
    gerente_id: '',
    empresa_id: '', // Formato da API real
    data_abertura: '' // Formato da API real
  });
  const [termoBusca, setTermoBusca] = useState('');

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
      codigo: loja.codigo || '',
      endereco: loja.endereco || '',
      telefone: loja.telefone || '',
      email: loja.email || '',
      gerente_id: loja.gerente_id || '',
      empresa_id: loja.empresa_id,
      data_abertura: loja.data_abertura || ''
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
      gerente_id: '',
      empresa_id: '',
      data_abertura: ''
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
      gerente_id: '',
      empresa_id: '',
      data_abertura: ''
    });
  };

  const handleEmpresaChange = (empresaId: string) => {
    setFormData(prev => ({
      ...prev,
      empresa_id: empresaId,
      codigo: empresaId ? `LJ${Date.now().toString().slice(-4)}` : '' // Código temporário simples
    }));
  };

  // Filtrar lojas baseado na busca
  const lojasFiltradas = termoBusca ? buscarLojas(termoBusca) : lojas;

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
            placeholder="Buscar lojas por nome, código, endereço ou empresa..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
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
      <LojaTable 
        lojas={lojasFiltradas} 
        onEdit={handleEdit}
        onDelete={desativarLoja}
        loading={loading}
      />

      {/* Dialog de formulário */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl h-[70vh] flex flex-col bg-white dark:bg-slate-900">
          <DialogHeader className="border-b border-slate-200 dark:border-slate-700 p-2 pb-1">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <Store className="h-3 w-3 text-slate-500" />
              </div>
              <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {editingLoja ? 'Editar Loja' : 'Nova Loja'}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <form onSubmit={handleSubmit} className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    <div>
                      <Label htmlFor="empresa_id" className="text-xs font-medium text-slate-700">Empresa *</Label>
                      <Select value={formData.empresa_id} onValueChange={handleEmpresaChange}>
                        <SelectTrigger className="h-8 text-sm border-slate-300 focus:border-slate-400">
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
                      <Label htmlFor="codigo" className="text-xs font-medium text-slate-700">Código</Label>
                      <Input
                        id="codigo"
                        value={formData.codigo}
                        readOnly
                        className="h-8 text-sm bg-slate-50 border-slate-300"
                        placeholder="Será gerado automaticamente"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="nome" className="text-xs font-medium text-slate-700">Nome da Loja *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        className="h-8 text-sm border-slate-300 focus:border-slate-400"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="endereco" className="text-xs font-medium text-slate-700">Endereço</Label>
                      <Input
                        id="endereco"
                        value={formData.endereco}
                        onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                        className="h-8 text-sm border-slate-300 focus:border-slate-400"
                        placeholder="Endereço completo da loja"
                      />
                    </div>

                    <div>
                      <Label htmlFor="telefone" className="text-xs font-medium text-slate-700">Telefone</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                        className="h-8 text-sm border-slate-300 focus:border-slate-400"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-xs font-medium text-slate-700">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="h-8 text-sm border-slate-300 focus:border-slate-400"
                      />
                    </div>

                    <div>
                      <Label htmlFor="gerente_id" className="text-xs font-medium text-slate-700">Gerente *</Label>
                      <Select value={formData.gerente_id} onValueChange={(value) => setFormData(prev => ({ ...prev, gerente_id: value }))}>
                        <SelectTrigger className="h-8 text-sm border-slate-300 focus:border-slate-400">
                          <SelectValue placeholder="Selecione o gerente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gerente-1">Cleiton</SelectItem>
                          <SelectItem value="gerente-2">Tom</SelectItem>
                          <SelectItem value="gerente-3">Ricardo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="data_abertura" className="text-xs font-medium text-slate-700">Data de Abertura</Label>
                      <Input
                        id="data_abertura"
                        type="date"
                        value={formData.data_abertura}
                        onChange={(e) => setFormData(prev => ({ ...prev, data_abertura: e.target.value }))}
                        className="h-8 text-sm border-slate-300 focus:border-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 pt-1">
                <div className="flex justify-end items-center gap-1">
                  <button 
                    type="button" 
                    onClick={handleCloseDialog}
                    className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="px-4 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium border border-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                        Salvando...
                      </div>
                    ) : editingLoja ? 'Atualizar Loja' : 'Salvar Loja'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}