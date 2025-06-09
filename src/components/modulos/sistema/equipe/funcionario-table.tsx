import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Edit, Trash2, UserCog, Store, Star } from 'lucide-react';
import type { Funcionario } from '@/types/sistema';

interface FuncionarioTableProps {
  funcionarios: Funcionario[];
  onEdit: (funcionario: Funcionario) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  loading?: boolean;
}

export function FuncionarioTable({ 
  funcionarios, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  loading = false 
}: FuncionarioTableProps) {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTipoFuncionarioBadge = (tipo: string) => {
    const variants = {
      'ADMIN_MASTER': 'destructive',
      'GERENTE': 'default',
      'VENDEDOR': 'secondary',
      'MEDIDOR': 'outline'
    } as const;
    return variants[tipo as keyof typeof variants] || 'secondary';
  };

  const getNivelAcessoBadge = (nivel: string) => {
    const variants = {
      'ADMIN': 'destructive',
      'GERENTE': 'default',
      'SUPERVISOR': 'secondary',
      'USUARIO': 'outline'
    } as const;
    return variants[nivel as keyof typeof variants] || 'outline';
  };

  if (funcionarios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-gray-200 rounded-lg bg-gray-50">
        <UserCog className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum funcionário cadastrado</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Comece adicionando funcionários para gerenciar sua equipe.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Funcionário</TableHead>
            <TableHead>Tipo/Nível</TableHead>
            <TableHead>Loja/Setor</TableHead>
            <TableHead>Financeiro</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {funcionarios.map((funcionario) => (
            <TableRow key={funcionario.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{funcionario.nome}</div>
                  <div className="text-sm text-muted-foreground">{funcionario.email}</div>
                  <div className="text-sm text-muted-foreground">{funcionario.telefone}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex gap-1">
                    <Badge variant={getTipoFuncionarioBadge(funcionario.tipoFuncionario)} className="text-xs">
                      {funcionario.tipoFuncionario}
                    </Badge>
                    <Badge variant={getNivelAcessoBadge(funcionario.nivelAcesso)} className="text-xs">
                      {funcionario.nivelAcesso}
                    </Badge>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="flex items-center gap-1 mb-1">
                    <Store className="h-3 w-3 text-gray-400" />
                    <span className="font-medium">{funcionario.loja}</span>
                  </div>
                  <div className="text-muted-foreground">{funcionario.setor}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">{formatCurrency(funcionario.salario)}</div>
                  {funcionario.comissao > 0 && (
                    <div className="text-muted-foreground">Comissão: {funcionario.comissao}%</div>
                  )}
                  {funcionario.configuracoes?.valorMedicao && (
                    <div className="text-green-600">Medição: {formatCurrency(funcionario.configuracoes.valorMedicao)}</div>
                  )}
                  {funcionario.performance !== undefined && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs">{funcionario.performance}%</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={funcionario.ativo}
                    onCheckedChange={() => onToggleStatus(funcionario.id)}
                  />
                  <Badge variant={funcionario.ativo ? "default" : "secondary"}>
                    {funcionario.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(funcionario)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o funcionário <strong>{funcionario.nome}</strong>?
                          Esta ação não pode ser desfeita e removerá todos os dados associados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(funcionario.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            Carregando funcionários...
          </div>
        </div>
      )}
    </div>
  );
}