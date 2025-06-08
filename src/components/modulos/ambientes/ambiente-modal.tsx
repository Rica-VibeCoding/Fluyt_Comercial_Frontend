'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { AmbienteFormData, Acabamento } from '../../../types/ambiente';

interface AmbienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AmbienteFormData) => void;
}

export function AmbienteModal({ open, onOpenChange, onSubmit }: AmbienteModalProps) {
  const [nome, setNome] = useState('');
  const [acabamentos, setAcabamentos] = useState<Omit<Acabamento, 'id'>[]>([]);
  const [valorTotal, setValorTotal] = useState(0);

  const adicionarAcabamento = () => {
    setAcabamentos(prev => [...prev, {
      tipo: 'Porta',
      cor: '',
      espessura: '',
      material: '',
      valor: 0
    }]);
  };

  const removerAcabamento = (index: number) => {
    setAcabamentos(prev => prev.filter((_, i) => i !== index));
  };

  const atualizarAcabamento = (index: number, campo: keyof Omit<Acabamento, 'id'>, valor: any) => {
    setAcabamentos(prev => prev.map((acabamento, i) => 
      i === index ? { ...acabamento, [campo]: valor } : acabamento
    ));
  };

  const handleSubmit = () => {
    if (nome && acabamentos.length > 0 && valorTotal > 0) {
      onSubmit({ nome, acabamentos, valorTotal });
      setNome('');
      setAcabamentos([]);
      setValorTotal(0);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Ambiente</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="nome">Nome do Ambiente</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Cozinha, Dormitório, Sala..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Acabamentos</h3>
              <Button onClick={adicionarAcabamento} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Inserir Acabamento
              </Button>
            </div>

            {acabamentos.map((acabamento, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Acabamento {index + 1}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removerAcabamento(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Tipo</Label>
                      <Select
                        value={acabamento.tipo}
                        onValueChange={(value) => atualizarAcabamento(index, 'tipo', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Porta">Porta</SelectItem>
                          <SelectItem value="Caixa">Caixa</SelectItem>
                          <SelectItem value="Painel">Painel</SelectItem>
                          <SelectItem value="Porta de Vidro">Porta de Vidro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Cor</Label>
                      <Input
                        value={acabamento.cor}
                        onChange={(e) => atualizarAcabamento(index, 'cor', e.target.value)}
                        placeholder="Ex: Itapuã, Branco TX..."
                      />
                    </div>

                    <div>
                      <Label>Espessura</Label>
                      <Input
                        value={acabamento.espessura}
                        onChange={(e) => atualizarAcabamento(index, 'espessura', e.target.value)}
                        placeholder="Ex: 15 mm, 18 mm..."
                      />
                    </div>

                    <div>
                      <Label>Material</Label>
                      <Input
                        value={acabamento.material}
                        onChange={(e) => atualizarAcabamento(index, 'material', e.target.value)}
                        placeholder="Ex: MDP, MDF..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {acabamentos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum acabamento adicionado. Clique em "Inserir Acabamento" para começar.
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="valorTotal">Valor Total do Ambiente (R$)</Label>
            <Input
              id="valorTotal"
              type="number"
              value={valorTotal}
              onChange={(e) => setValorTotal(parseFloat(e.target.value) || 0)}
              placeholder="0,00"
            />
          </div>

          {valorTotal > 0 && (
            <div className="text-right">
              <span className="text-lg font-semibold">
                Valor Total: {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!nome || acabamentos.length === 0 || valorTotal === 0}>
            Criar Ambiente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}