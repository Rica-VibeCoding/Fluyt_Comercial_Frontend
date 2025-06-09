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
import { Edit, Trash2, Wrench, Phone } from 'lucide-react';
import type { Montador } from '@/types/sistema';

interface MontadorTableProps {
  montadores: Montador[];
  onEdit: (montador: Montador) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  loading?: boolean;
}

export function MontadorTable({ 
  montadores, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  loading = false 
}: MontadorTableProps) {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCategoriaBadge = (categoria: string) => {
    const variants = {
      'MARCENEIRO': 'default',
      'ELETRICISTA': 'secondary',
      'ENCANADOR': 'outline',
      'GESSEIRO': 'destructive',
      'PINTOR': 'default',
      'OUTRO': 'secondary'
    } as const;
    return variants[categoria as keyof typeof variants] || 'default';
  };

  const getCategoriaColor = (categoria: string) => {
    const colors = {
      'MARCENEIRO': 'text-blue-600',
      'ELETRICISTA': 'text-yellow-600',
      'ENCANADOR': 'text-cyan-600',
      'GESSEIRO': 'text-gray-600',
      'PINTOR': 'text-green-600',
      'OUTRO': 'text-purple-600'
    };
    return colors[categoria as keyof typeof colors] || 'text-gray-600';
  };

  // Agrupar por categoria e ordenar
  const montadoresOrdenados = montadores
    .sort((a, b) => {
      if (a.categoria !== b.categoria) {
        return a.categoria.localeCompare(b.categoria);
      }
      return a.nome.localeCompare(b.nome);
    });

  if (montadores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-gray-200 rounded-lg bg-gray-50">
        <Wrench className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum montador cadastrado</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Cadastre montadores para realizar os serviços de instalação e montagem.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome/Empresa</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Valor Fixo</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {montadoresOrdenados.map((montador) => (
            <TableRow key={montador.id}>
              <TableCell>
                <div className="font-medium text-sm">{montador.nome}</div>
              </TableCell>
              <TableCell>
                <Badge variant={getCategoriaBadge(montador.categoria)} className="text-xs">
                  <Wrench className={`h-3 w-3 mr-1 ${getCategoriaColor(montador.categoria)}`} />
                  {montador.categoria}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="font-medium">{formatCurrency(montador.valorFixo)}</div>
                <div className="text-xs text-gray-500">por serviço</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <span className="text-sm">{montador.telefone}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={montador.ativo}
                    onCheckedChange={() => onToggleStatus(montador.id)}
                  />
                  <Badge variant={montador.ativo ? "default" : "secondary"}>
                    {montador.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(montador)}
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
                          Tem certeza que deseja excluir o montador <strong>{montador.nome}</strong>?
                          Esta ação não pode ser desfeita e pode afetar serviços já agendados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(montador.id)}
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
            Carregando montadores...
          </div>
        </div>
      )}
    </div>
  );
}