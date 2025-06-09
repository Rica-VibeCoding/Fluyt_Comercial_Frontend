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
import { Edit, Trash2, Truck, Phone, Mail } from 'lucide-react';
import type { Transportadora } from '@/types/sistema';

interface TransportadoraTableProps {
  transportadoras: Transportadora[];
  onEdit: (transportadora: Transportadora) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  loading?: boolean;
}

export function TransportadoraTable({ 
  transportadoras, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  loading = false 
}: TransportadoraTableProps) {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Ordenar por nome da empresa
  const transportadorasOrdenadas = transportadoras
    .sort((a, b) => a.nomeEmpresa.localeCompare(b.nomeEmpresa));

  if (transportadoras.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-gray-200 rounded-lg bg-gray-50">
        <Truck className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma transportadora cadastrada</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Cadastre transportadoras para realizar os serviços de entrega e logística.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Valor Fixo</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transportadorasOrdenadas.map((transportadora) => (
            <TableRow key={transportadora.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <div className="font-medium text-sm">{transportadora.nomeEmpresa}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{formatCurrency(transportadora.valorFixo)}</div>
                <div className="text-xs text-gray-500">por entrega</div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span className="text-sm">{transportadora.telefone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-gray-400" />
                    <span className="text-sm">{transportadora.email}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={transportadora.ativo}
                    onCheckedChange={() => onToggleStatus(transportadora.id)}
                  />
                  <Badge variant={transportadora.ativo ? "default" : "secondary"}>
                    {transportadora.ativo ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(transportadora)}
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
                          Tem certeza que deseja excluir a transportadora <strong>{transportadora.nomeEmpresa}</strong>?
                          Esta ação não pode ser desfeita e pode afetar entregas já agendadas.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(transportadora.id)}
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
            Carregando transportadoras...
          </div>
        </div>
      )}
    </div>
  );
}