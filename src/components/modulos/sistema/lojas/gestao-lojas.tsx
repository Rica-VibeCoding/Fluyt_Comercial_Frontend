import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Plus, Edit, Trash2, Building2, MapPin, Phone, Mail } from 'lucide-react';
import { useEmpresas } from '@/hooks/modulos/sistema/use-empresas';
import { useLojas } from '@/hooks/modulos/sistema/use-lojas';
import type { LojaFormData } from '@/types/sistema';

export function GestaoLojas() {
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
      <div className="flex flex-col items-center justify-center py-12 border border-gray-200 rounded-lg bg-gray-50">
        <Building2 className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa ativa encontrada</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Cadastre e ative uma empresa primeiro para poder criar lojas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Lojas</h2>
          <p className="text-gray-600">Controle todas as unidades da empresa</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewLoja} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Nova Loja
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingLoja ? 'Editar Loja' : 'Nova Loja'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="empresaId">Empresa *</Label>
                <Select
                  value={formData.empresaId}
                  onValueChange={handleEmpresaChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresasAtivas.length === 0 ? (
                      <SelectItem value="" disabled>
                        Nenhuma empresa ativa encontrada
                      </SelectItem>
                    ) : (
                      empresasAtivas.map((empresa) => (
                        <SelectItem key={empresa.id} value={empresa.id}>
                          {empresa.nome}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  * Apenas empresas ativas da tabela de empresas são exibidas
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome da Loja *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome da loja"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                    placeholder="Código da loja"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="endereco">Endereço Completo *</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                  placeholder="Endereço completo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="loja@empresa.com.br"
                  required
                />
              </div>
              <div>
                <Label htmlFor="gerente">Gerente *</Label>
                <Input
                  id="gerente"
                  value={formData.gerente}
                  onChange={(e) => setFormData(prev => ({ ...prev, gerente: e.target.value }))}
                  placeholder="Nome do gerente"
                  required
                />
              </div>
              <div>
                <Label htmlFor="metaMes">Meta Mensal (R$) *</Label>
                <Input
                  id="metaMes"
                  type="number"
                  value={formData.metaMes}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaMes: Number(e.target.value) }))}
                  placeholder="100000"
                  min="0"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || empresasAtivas.length === 0}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {editingLoja ? 'Salvando...' : 'Criando...'}
                    </div>
                  ) : (
                    editingLoja ? 'Atualizar' : 'Cadastrar'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loja</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Colaboradores</TableHead>
              <TableHead>Meta/Vendas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lojas.map((loja) => (
              <TableRow key={loja.id}>
                <TableCell>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Building2 className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">{loja.nome}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {loja.endereco}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Código: {loja.codigo}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{loja.empresa}</span>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {loja.telefone}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {loja.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Gerente: {loja.gerente}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{loja.funcionarios}</span>
                    <span className="text-xs text-muted-foreground">pessoas</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Meta:</span> {formatCurrency(loja.metaMes)}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Vendas:</span> {formatCurrency(loja.vendasMes)}
                    </div>
                    <div className="text-xs">
                      <Badge 
                        variant="secondary"
                        className={
                          loja.vendasMes >= loja.metaMes 
                            ? "bg-green-100 text-green-700" 
                            : loja.vendasMes >= loja.metaMes * 0.8 
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }
                      >
                        {Math.round((loja.vendasMes / loja.metaMes) * 100)}% da meta
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={loja.ativa}
                      onCheckedChange={() => alternarStatusLoja(loja.id)}
                    />
                    <Badge variant={loja.ativa ? "default" : "secondary"}>
                      {loja.ativa ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(loja)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={loja.funcionarios > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a loja <strong>{loja.nome}</strong>?
                            Esta ação não pode ser desfeita.
                            {loja.funcionarios > 0 && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                                <strong>Atenção:</strong> Esta loja possui {loja.funcionarios} funcionário(s) vinculado(s).
                              </div>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => excluirLoja(loja.id)}
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
              Carregando lojas...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}