import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Wrench, RefreshCw } from 'lucide-react';
import { useMontadores } from '@/hooks/modulos/sistema/use-montadores';
import { MontadorTable } from './montador-table';
import { MontadorForm } from './montador-form';
import type { Montador, MontadorFormData } from '@/types/sistema';

export function GestaoMontadores() {
  const {
    montadores,
    loading,
    estatisticas,
    criarMontador,
    atualizarMontador,
    excluirMontador,
    alternarStatus,
    buscarMontadores,
    filtrarPorCategoria,
    filtrarPorStatus,
    resetarDados
  } = useMontadores();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [montadorEditando, setMontadorEditando] = useState<Montador | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('all');
  const [filtroStatus, setFiltroStatus] = useState<string>('all');

  const formDataInicial: MontadorFormData = {
    nome: '',
    categoria: 'MARCENEIRO',
    valorFixo: 0,
    telefone: ''
  };

  const [formData, setFormData] = useState<MontadorFormData>(formDataInicial);

  // Filtrar montadores
  const montadoresFiltered = useMemo(() => {
    let result = busca ? buscarMontadores(busca) : montadores;

    if (filtroCategoria !== 'all') {
      result = filtrarPorCategoria(filtroCategoria);
    }

    if (filtroStatus !== 'all') {
      const isActive = filtroStatus === 'active';
      result = filtrarPorStatus(isActive);
    }

    // Aplicar busca nos resultados filtrados
    if (busca && (filtroCategoria !== 'all' || filtroStatus !== 'all')) {
      const termoBusca = busca.toLowerCase().trim();
      result = result.filter(montador =>
        montador.nome.toLowerCase().includes(termoBusca) ||
        montador.categoria.toLowerCase().includes(termoBusca) ||
        montador.telefone.includes(termoBusca)
      );
    }

    return result;
  }, [montadores, busca, filtroCategoria, filtroStatus, buscarMontadores, filtrarPorCategoria, filtrarPorStatus]);

  const handleCreate = () => {
    setMontadorEditando(null);
    setFormData(formDataInicial);
    setDialogOpen(true);
  };

  const handleEdit = (montador: Montador) => {
    setMontadorEditando(montador);
    setFormData({
      nome: montador.nome,
      categoria: montador.categoria,
      valorFixo: montador.valorFixo,
      telefone: montador.telefone
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = montadorEditando
      ? await atualizarMontador(montadorEditando.id, formData)
      : await criarMontador(formData);

    if (success) {
      setDialogOpen(false);
      setMontadorEditando(null);
      setFormData(formDataInicial);
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setMontadorEditando(null);
    setFormData(formDataInicial);
  };

  const clearFilters = () => {
    setBusca('');
    setFiltroCategoria('all');
    setFiltroStatus('all');
  };

  const hasActiveFilters = busca || filtroCategoria !== 'all' || filtroStatus !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wrench className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Gestão de Montadores</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Gerencie os profissionais responsáveis pela montagem e instalação
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetarDados}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Montador
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>


      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, categoria ou telefone..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="MARCENEIRO">Marceneiro</SelectItem>
                  <SelectItem value="ELETRICISTA">Eletricista</SelectItem>
                  <SelectItem value="ENCANADOR">Encanador</SelectItem>
                  <SelectItem value="GESSEIRO">Gesseiro</SelectItem>
                  <SelectItem value="PINTOR">Pintor</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Filtros ativos */}
          {hasActiveFilters && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {busca && (
                <Badge variant="secondary" className="gap-1">
                  Busca: {busca}
                </Badge>
              )}
              {filtroCategoria !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Categoria: {filtroCategoria}
                </Badge>
              )}
              {filtroStatus !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Status: {filtroStatus === 'active' ? 'Ativos' : 'Inativos'}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <MontadorTable
            montadores={montadoresFiltered}
            onEdit={handleEdit}
            onDelete={excluirMontador}
            onToggleStatus={alternarStatus}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Dialog do Formulário */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {montadorEditando ? 'Editar Montador' : 'Novo Montador'}
            </DialogTitle>
          </DialogHeader>
          <MontadorForm
            formData={formData}
            onFormDataChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEditing={!!montadorEditando}
            loading={loading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}