import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import { Edit, Phone, Mail, MapPin } from 'lucide-react';
import { Cliente } from '../../../types/cliente';
import { ClienteActionsMenu } from './cliente-actions-menu';

interface ClienteTabelaProps {
  clientes: Cliente[];
  isLoading: boolean;
  onEditarCliente: (cliente: Cliente) => void;
  onRemoverCliente: (id: string) => void;
}

export function ClienteTabela({ 
  clientes, 
  isLoading, 
  onEditarCliente, 
  onRemoverCliente 
}: ClienteTabelaProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (clientes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium mb-2">Nenhum cliente encontrado</p>
          <p>Ajuste os filtros ou cadastre um novo cliente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="font-semibold">Cliente</TableHead>
            <TableHead className="font-semibold">Documento</TableHead>
            <TableHead className="font-semibold">Contato</TableHead>
            <TableHead className="font-semibold">Tipo</TableHead>
            <TableHead className="font-semibold">Procedência</TableHead>
            <TableHead className="font-semibold">Vendedor</TableHead>
            <TableHead className="font-semibold text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente) => (
            <TableRow 
              key={cliente.id} 
              className="hover:bg-muted/20 transition-colors cursor-pointer"
              onClick={() => toggleRowExpansion(cliente.id)}
            >
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium text-foreground">{cliente.nome}</div>
                  {expandedRows.has(cliente.id) && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {cliente.logradouro}, {cliente.numero} - {cliente.bairro}
                      </div>
                      <div>{cliente.cidade}/{cliente.uf} - {cliente.cep}</div>
                      {cliente.observacoes && (
                        <div className="text-xs italic">{cliente.observacoes}</div>
                      )}
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  <div className="font-mono text-sm">{cliente.cpf_cnpj}</div>
                  {expandedRows.has(cliente.id) && cliente.rg_ie && (
                    <div className="font-mono text-xs text-muted-foreground">
                      RG/IE: {cliente.rg_ie}
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <Phone className="h-3 w-3" />
                    {cliente.telefone}
                  </div>
                  {expandedRows.has(cliente.id) && cliente.email && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {cliente.email}
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <Badge 
                  variant={cliente.tipo_venda === 'NORMAL' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {cliente.tipo_venda}
                </Badge>
              </TableCell>
              
              <TableCell>
                <span className="text-sm text-muted-foreground">{cliente.procedencia}</span>
              </TableCell>
              
              <TableCell>
                <span className="text-sm font-medium">{cliente.vendedor_nome}</span>
              </TableCell>
              
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditarCliente(cliente)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <ClienteActionsMenu
                    cliente={cliente}
                    onEditar={onEditarCliente}
                    onRemover={onRemoverCliente}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}