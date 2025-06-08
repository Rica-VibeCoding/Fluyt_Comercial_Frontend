import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Users, Mail, Phone, MapPin, UserCog, Star } from 'lucide-react';

interface Funcionario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  setor: string;
  loja: string;
  salario: number;
  comissao: number;
  dataAdmissao: string;
  ativo: boolean;
  nivelAcesso: 'USUARIO' | 'SUPERVISOR' | 'GERENTE' | 'ADMIN';
  performance: number;
}

export function GestaoEquipe() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);

  // Mock data
  const funcionarios: Funcionario[] = [
    {
      id: '1',
      nome: 'Maria Silva',
      email: 'maria.silva@fluyt.com.br',
      telefone: '(11) 98765-4321',
      cargo: 'Gerente de Loja',
      setor: 'Vendas',
      loja: 'Fluyt São Paulo - Centro',
      salario: 8500,
      comissao: 2.5,
      dataAdmissao: '2020-03-15',
      ativo: true,
      nivelAcesso: 'GERENTE',
      performance: 95
    },
    {
      id: '2',
      nome: 'João Santos',
      email: 'joao.santos@fluyt.com.br',
      telefone: '(13) 3456-7890',
      cargo: 'Consultor de Vendas',
      setor: 'Vendas',
      loja: 'Fluyt Santos - Centro',
      salario: 3500,
      comissao: 3.0,
      dataAdmissao: '2021-07-10',
      ativo: true,
      nivelAcesso: 'USUARIO',
      performance: 88
    },
    {
      id: '3',
      nome: 'Ana Costa',
      email: 'ana.costa@fluyt.com.br',
      telefone: '(11) 2345-6789',
      cargo: 'Supervisora de Vendas',
      setor: 'Vendas',
      loja: 'Fluyt ABC - Shopping',
      salario: 5500,
      comissao: 2.0,
      dataAdmissao: '2020-11-22',
      ativo: true,
      nivelAcesso: 'SUPERVISOR',
      performance: 92
    },
    {
      id: '4',
      nome: 'Carlos Oliveira',
      email: 'carlos.oliveira@fluyt.com.br',
      telefone: '(11) 98888-7777',
      cargo: 'Designer de Interiores',
      setor: 'Design',
      loja: 'Fluyt São Paulo - Centro',
      salario: 4500,
      comissao: 1.5,
      dataAdmissao: '2022-01-15',
      ativo: true,
      nivelAcesso: 'USUARIO',
      performance: 90
    },
    {
      id: '5',
      nome: 'Fernanda Lima',
      email: 'fernanda.lima@fluyt.com.br',
      telefone: '(11) 97777-6666',
      cargo: 'Assistente Administrativo',
      setor: 'Administrativo',
      loja: 'Fluyt São Paulo - Centro',
      salario: 2800,
      comissao: 0,
      dataAdmissao: '2023-03-10',
      ativo: true,
      nivelAcesso: 'USUARIO',
      performance: 85
    }
  ];

  const handleEdit = (funcionario: Funcionario) => {
    setEditingFuncionario(funcionario);
    setIsDialogOpen(true);
  };

  const handleNewFuncionario = () => {
    setEditingFuncionario(null);
    setIsDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getNivelAcessoBadge = (nivel: string) => {
    const colors = {
      'ADMIN': 'bg-red-100 text-red-700',
      'GERENTE': 'bg-purple-100 text-purple-700',
      'SUPERVISOR': 'bg-blue-100 text-blue-700',
      'USUARIO': 'bg-gray-100 text-gray-700'
    };
    return colors[nivel as keyof typeof colors] || colors.USUARIO;
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600';
    if (performance >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Equipe</h2>
          <p className="text-gray-600">Gerencie todos os funcionários e colaboradores</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewFuncionario} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {funcionarios.map((funcionario) => (
          <Card key={funcionario.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                    {getInitials(funcionario.nome)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-bold text-lg">{funcionario.nome}</div>
                  <div className="text-sm text-gray-500">{funcionario.cargo}</div>
                </div>
                <Badge 
                  variant="secondary"
                  className={getNivelAcessoBadge(funcionario.nivelAcesso)}
                >
                  {funcionario.nivelAcesso}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{funcionario.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{funcionario.telefone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{funcionario.loja}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <UserCog className="h-4 w-4 text-gray-400" />
                  <span>{funcionario.setor}</span>
                </div>
              </div>

              {/* Performance e Salário */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Performance</span>
                  <div className="flex items-center gap-1">
                    <Star className={`h-4 w-4 ${getPerformanceColor(funcionario.performance)}`} />
                    <span className={`font-medium ${getPerformanceColor(funcionario.performance)}`}>
                      {funcionario.performance}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Salário</span>
                  <span className="font-medium">{formatCurrency(funcionario.salario)}</span>
                </div>
                {funcionario.comissao > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Comissão</span>
                    <span className="font-medium">{funcionario.comissao}%</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${funcionario.ativo ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm">{funcionario.ativo ? 'Ativo' : 'Inativo'}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(funcionario)}
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
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{funcionarios.length}</div>
                <div className="text-sm text-gray-600">Total de Funcionários</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCog className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {funcionarios.filter(f => f.ativo).length}
                </div>
                <div className="text-sm text-gray-600">Funcionários Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(funcionarios.reduce((total, f) => total + f.performance, 0) / funcionarios.length)}%
                </div>
                <div className="text-sm text-gray-600">Performance Média</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {new Set(funcionarios.map(f => f.setor)).size}
                </div>
                <div className="text-sm text-gray-600">Setores Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}