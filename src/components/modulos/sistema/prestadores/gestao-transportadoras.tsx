import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Truck, RefreshCw } from 'lucide-react';
import { useTransportadoras } from '@/hooks/modulos/sistema/use-transportadoras';
import { TransportadoraTable } from './transportadora-table';
import { TransportadoraForm } from './transportadora-form';
import type { Transportadora, TransportadoraFormData } from '@/types/sistema';

export function GestaoTransportadoras() {
  const {
    transportadoras,
    loading,
    estatisticas,
    criarTransportadora,
    atualizarTransportadora,
    excluirTransportadora,
    alternarStatus,
    buscarTransportadoras,
    filtrarPorStatus,
    resetarDados
  } = useTransportadoras();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [transportadoraEditando, setTransportadoraEditando] = useState<Transportadora | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('all');

  const formDataInicial: TransportadoraFormData = {
    nomeEmpresa: '',
    valorFixo: 0,
    telefone: '',
    email: ''
  };

  const [formData, setFormData] = useState<TransportadoraFormData>(formDataInicial);

  // Filtrar transportadoras
  const transportadorasFiltered = useMemo(() => {
    let result = busca ? buscarTransportadoras(busca) : transportadoras;

    if (filtroStatus !== 'all') {
      const isActive = filtroStatus === 'active';
      result = filtrarPorStatus(isActive);
      
      // Aplicar busca nos resultados filtrados
      if (busca) {
        const termoBusca = busca.toLowerCase().trim();
        result = result.filter(transportadora =>
          transportadora.nomeEmpresa.toLowerCase().includes(termoBusca) ||
          transportadora.email.toLowerCase().includes(termoBusca) ||
          transportadora.telefone.includes(termoBusca)
        );
      }
    }

    return result;
  }, [transportadoras, busca, filtroStatus, buscarTransportadoras, filtrarPorStatus]);

  const handleCreate = () => {
    setTransportadoraEditando(null);
    setFormData(formDataInicial);
    setDialogOpen(true);
  };

  const handleEdit = (transportadora: Transportadora) => {
    setTransportadoraEditando(transportadora);
    setFormData({
      nomeEmpresa: transportadora.nomeEmpresa,
      valorFixo: transportadora.valorFixo,
      telefone: transportadora.telefone,
      email: transportadora.email
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = transportadoraEditando
      ? await atualizarTransportadora(transportadoraEditando.id, formData)
      : await criarTransportadora(formData);

    if (success) {
      setDialogOpen(false);
      setTransportadoraEditando(null);
      setFormData(formDataInicial);
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setTransportadoraEditando(null);
    setFormData(formDataInicial);
  };

  const clearFilters = () => {
    setBusca('');
    setFiltroStatus('all');
  };

  const hasActiveFilters = busca || filtroStatus !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Gestão de Transportadoras</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Gerencie as empresas responsáveis pela entrega e logística
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
                Nova Transportadora
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
                  placeholder="Buscar por empresa, email ou telefone..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="inactive">Inativas</SelectItem>
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
              {filtroStatus !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Status: {filtroStatus === 'active' ? 'Ativas' : 'Inativas'}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <TransportadoraTable
            transportadoras={transportadorasFiltered}
            onEdit={handleEdit}
            onDelete={excluirTransportadora}
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
              {transportadoraEditando ? 'Editar Transportadora' : 'Nova Transportadora'}
            </DialogTitle>
          </DialogHeader>
          <TransportadoraForm
            formData={formData}
            onFormDataChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEditing={!!transportadoraEditando}
            loading={loading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}