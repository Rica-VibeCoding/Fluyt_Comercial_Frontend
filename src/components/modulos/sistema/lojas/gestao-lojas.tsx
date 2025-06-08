import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Store, MapPin, Phone, Users, DollarSign } from 'lucide-react';

interface Loja {
  id: string;
  nome: string;
  codigo: string;
  endereco: string;
  telefone: string;
  gerente: string;
  funcionarios: number;
  vendasMes: number;
  metaMes: number;
  ativa: boolean;
  empresa: string;
  dataAbertura: string;
}

export function GestaoLojas() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLoja, setEditingLoja] = useState<Loja | null>(null);

  // Mock data
  const lojas: Loja[] = [
    {
      id: '1',
      nome: 'Fluyt São Paulo - Centro',
      codigo: 'SP001',
      endereco: 'Av. Paulista, 1000 - Centro, São Paulo/SP',
      telefone: '(11) 98765-4321',
      gerente: 'Maria Silva',
      funcionarios: 15,
      vendasMes: 245000,
      metaMes: 200000,
      ativa: true,
      empresa: 'Fluyt Móveis & Design',
      dataAbertura: '2020-01-15'
    },
    {
      id: '2',
      nome: 'Fluyt Santos - Centro',
      codigo: 'ST001',
      endereco: 'Rua do Comércio, 500 - Centro, Santos/SP',
      telefone: '(13) 3456-7890',
      gerente: 'João Santos',
      funcionarios: 8,
      vendasMes: 128000,
      metaMes: 150000,
      ativa: true,
      empresa: 'Fluyt Filial Santos',
      dataAbertura: '2022-06-10'
    },
    {
      id: '3',
      nome: 'Fluyt ABC - Shopping',
      codigo: 'ABC001',
      endereco: 'Shopping ABC - Santo André/SP',
      telefone: '(11) 2345-6789',
      gerente: 'Ana Costa',
      funcionarios: 12,
      vendasMes: 189000,
      metaMes: 180000,
      ativa: true,
      empresa: 'Fluyt Móveis & Design',
      dataAbertura: '2021-03-20'
    }
  ];

  const handleEdit = (loja: Loja) => {
    setEditingLoja(loja);
    setIsDialogOpen(true);
  };

  const handleNewLoja = () => {
    setEditingLoja(null);
    setIsDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPerformanceColor = (vendas: number, meta: number) => {
    const performance = (vendas / meta) * 100;
    if (performance >= 100) return 'text-green-600 bg-green-100';
    if (performance >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceText = (vendas: number, meta: number) => {
    const performance = (vendas / meta) * 100;
    return `${performance.toFixed(0)}% da meta`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Lojas</h2>
          <p className="text-gray-600">Gerencie todas as lojas e pontos de venda</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewLoja} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Loja
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingLoja ? 'Editar Loja' : 'Nova Loja'}
              </DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <div className="text-center text-gray-500">
                Formulário em desenvolvimento
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {lojas.map((loja) => (
          <Card key={loja.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Store className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">{loja.nome}</div>
                    <div className="text-sm text-gray-500">Código: {loja.codigo}</div>
                  </div>
                </div>
                <Badge 
                  variant={loja.ativa ? "default" : "secondary"}
                  className={loja.ativa ? "bg-green-100 text-green-700" : ""}
                >
                  {loja.ativa ? 'Ativa' : 'Inativa'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{loja.endereco}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{loja.telefone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>Gerente: {loja.gerente}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{loja.funcionarios} funcionários</span>
                </div>
              </div>

              {/* Performance Card */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="text-sm font-medium text-gray-700">Performance do Mês</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Vendas</div>
                    <div className="font-bold text-lg">{formatCurrency(loja.vendasMes)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Meta</div>
                    <div className="font-bold text-lg">{formatCurrency(loja.metaMes)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge 
                    className={getPerformanceColor(loja.vendasMes, loja.metaMes)}
                    variant="secondary"
                  >
                    {getPerformanceText(loja.vendasMes, loja.metaMes)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-xs text-gray-500">
                  {loja.empresa}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(loja)}
                >
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Store className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{lojas.length}</div>
                <div className="text-sm text-gray-600">Lojas Total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Store className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {lojas.filter(loja => loja.ativa).length}
                </div>
                <div className="text-sm text-gray-600">Lojas Ativas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {lojas.reduce((total, loja) => total + loja.funcionarios, 0)}
                </div>
                <div className="text-sm text-gray-600">Funcionários</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency(lojas.reduce((total, loja) => total + loja.vendasMes, 0))}
                </div>
                <div className="text-sm text-gray-600">Vendas do Mês</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}