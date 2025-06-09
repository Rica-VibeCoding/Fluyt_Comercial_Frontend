/**
 * Modal para adicionar/editar formas de pagamento
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormaPagamento } from '@/types/simulador';
import { useCurrencyInput } from '@/hooks/globais/use-currency-input';

type TipoFormaPagamento = 'ENTRADA' | 'FINANCEIRA' | 'CARTAO' | 'BOLETO';

interface NovaFormaState {
  tipo: TipoFormaPagamento;
  valor: number;
  parcelas: number;
  taxaJuros: number;
  deflacao: number;
  jurosAntecipacao: number;
  custoCapital: number;
  dataVencimento: string;
}

interface FormaPagamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editandoForma: FormaPagamento | null;
  novaForma: NovaFormaState;
  setNovaForma: React.Dispatch<React.SetStateAction<NovaFormaState>>;
  onSubmit: () => void;
  onCancel: () => void;
}

export function FormaPagamentoModal({
  open,
  onOpenChange,
  editandoForma,
  novaForma,
  setNovaForma,
  onSubmit,
  onCancel
}: FormaPagamentoModalProps) {
  const valorFormaInput = useCurrencyInput(
    novaForma.valor, 
    (valor) => setNovaForma(prev => ({ ...prev, valor }))
  );

  const renderParcelasInput = () => {
    if (novaForma.tipo === 'ENTRADA') return null;

    const getMinMax = () => {
      switch (novaForma.tipo) {
        case 'FINANCEIRA':
          return { min: 1, max: 24 };
        case 'BOLETO':
          return { min: 1, max: 24 };
        case 'CARTAO':
          return { min: 1, max: 24 };
        default:
          return { min: 1, max: 24 };
      }
    };

    const { min, max } = getMinMax();

    return (
      <div className="space-y-2">
        <Label>Parcelas</Label>
        <Input
          type="number"
          min={min}
          max={max}
          value={novaForma.parcelas || ''}
          onChange={(e) => setNovaForma(prev => ({ 
            ...prev, 
            parcelas: Math.min(max, Math.max(min, Number(e.target.value) || 1))
          }))}
          placeholder={`De ${min} a ${max}`}
        />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editandoForma ? 'Editar' : 'Adicionar'} Forma de Pagamento
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select 
              value={novaForma.tipo} 
              onValueChange={(value: TipoFormaPagamento) => 
                setNovaForma(prev => ({ ...prev, tipo: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ENTRADA">Entrada (À vista)</SelectItem>
                <SelectItem value="FINANCEIRA">Financeira</SelectItem>
                <SelectItem value="CARTAO">Cartão</SelectItem>
                <SelectItem value="BOLETO">Boleto Loja</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input
              type="text"
              {...valorFormaInput}
            />
          </div>

          {renderParcelasInput()}

          {novaForma.tipo === 'FINANCEIRA' && (
            <>
              <div className="space-y-2">
                <Label>Taxa de Juros (% a.m.)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={novaForma.taxaJuros || ''}
                  onChange={(e) => setNovaForma(prev => ({ 
                    ...prev, 
                    taxaJuros: Number(e.target.value) || 0
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Vencimento</Label>
                <Input
                  type="date"
                  value={novaForma.dataVencimento}
                  onChange={(e) => setNovaForma(prev => ({ 
                    ...prev, 
                    dataVencimento: e.target.value
                  }))}
                />
              </div>
            </>
          )}

          {novaForma.tipo === 'CARTAO' && (
            <>
              <div className="space-y-2">
                <Label>Deflação (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={novaForma.deflacao || ''}
                  onChange={(e) => setNovaForma(prev => ({ 
                    ...prev, 
                    deflacao: Number(e.target.value) || 0
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Juros de Antecipação (% por parcela)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={novaForma.jurosAntecipacao || ''}
                  onChange={(e) => setNovaForma(prev => ({ 
                    ...prev, 
                    jurosAntecipacao: Number(e.target.value) || 0
                  }))}
                />
              </div>
            </>
          )}

          {novaForma.tipo === 'BOLETO' && (
            <div className="space-y-2">
              <Label>Custo de Capital (% a.m.)</Label>
              <Input
                type="number"
                step="0.1"
                value={novaForma.custoCapital || ''}
                onChange={(e) => setNovaForma(prev => ({ 
                  ...prev, 
                  custoCapital: Number(e.target.value) || 0
                }))}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={onSubmit}>
              {editandoForma ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { NovaFormaState, TipoFormaPagamento };