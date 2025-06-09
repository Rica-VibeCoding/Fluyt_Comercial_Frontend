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
      {/* Cabeçalho com botão principal */}
      <div className="flex justify-end">
        <Button 
          onClick={handleNewLoja}
          className="gap-1.5 h-8 px-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl font-semibold text-white text-xs"
        >
          <Store className="h-3.5 w-3.5" />
              Nova Loja
            </Button>
      </div>

      {/* Card de busca e filtros */}
      <Card className="shadow-md border-0 bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, endereço ou cidade..."
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

      {/* Tabela */}
      <LojaTable lojas={lojas} />
    </div>
  );
}