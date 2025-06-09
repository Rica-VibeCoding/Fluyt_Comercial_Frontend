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
import { Edit, Trash2, Layers } from 'lucide-react';
import type { Setor } from '@/types/sistema';

interface SetorTableProps {
  setores: Setor[];
  onEdit: (setor: Setor) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  loading?: boolean;
}

export function SetorTable({ 
  setores, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  loading = false 
}: SetorTableProps) {

  if (setores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-gray-200 rounded-lg bg-gray-50">
        <Layers className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum setor cadastrado</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Organize sua equipe criando setores especializados para melhor gestão.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Setor</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Funcionários</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {setores.map((setor) => (
            <TableRow key={setor.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{setor.nome}</div>
                  <div className="text-sm text-muted-foreground">
                    Criado em {new Date(setor.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-md">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {setor.descricao}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-lg">{setor.funcionarios}</span>
                  <span className="text-sm text-muted-foreground">
                    {setor.funcionarios === 1 ? 'funcionário' : 'funcionários'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={setor.ativo}
                    onCheckedChange={() => onToggleStatus(setor.id)}
                  />
                  <Badge variant={setor.ativo ? "default" : "secondary"}>
                    {setor.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(setor)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={setor.funcionarios > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o setor <strong>{setor.nome}</strong>?
                          Esta ação não pode ser desfeita.
                          {setor.funcionarios > 0 && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                              <strong>Atenção:</strong> Este setor possui {setor.funcionarios} funcionário(s) vinculado(s).
                            </div>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(setor.id)}
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
            Carregando setores...
          </div>
        </div>
      )}
    </div>
  );
}