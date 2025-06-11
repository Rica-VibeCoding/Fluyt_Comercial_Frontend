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
            <Label>Forma de Pagamento</Label>
            <Select 
              value={novaForma.tipo} 
              onValueChange={(value: TipoFormaPagamento) => 
                setNovaForma(prev => ({ ...prev, tipo: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ENTRADA">💰 À Vista / Dinheiro (Entrada)</SelectItem>
                <SelectItem value="FINANCEIRA">🏦 Financeira / Banco</SelectItem>
                <SelectItem value="CARTAO">💳 Cartão de Crédito</SelectItem>
                <SelectItem value="BOLETO">📄 Boleto da Loja</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {novaForma.tipo === 'ENTRADA' && 'Pagamento imediato - menor risco, melhor para o fluxo de caixa'}
              {novaForma.tipo === 'FINANCEIRA' && 'Financiamento bancário - cliente assume juros externos'}
              {novaForma.tipo === 'CARTAO' && 'Pagamento com cartão - descontos da operadora aplicados'}
              {novaForma.tipo === 'BOLETO' && 'Boleto parcelado da loja - maior prazo, custo de capital próprio'}
            </p>
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
                <Label>Taxa de Juros do Banco (% ao mês)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={novaForma.taxaJuros || ''}
                  onChange={(e) => setNovaForma(prev => ({ 
                    ...prev, 
                    taxaJuros: Number(e.target.value) || 0
                  }))}
                  placeholder="Ex: 1.5 (1,5% ao mês)"
                />
                <p className="text-xs text-muted-foreground">
                  Taxa cobrada pela instituição financeira (cliente arca com os juros)
                </p>
              </div>
              <div className="space-y-2">
                <Label>Data do Primeiro Vencimento</Label>
                <Input
                  type="date"
                  value={novaForma.dataVencimento}
                  onChange={(e) => setNovaForma(prev => ({ 
                    ...prev, 
                    dataVencimento: e.target.value
                  }))}
                />
                <p className="text-xs text-muted-foreground">
                  Quando a primeira parcela vence (banco faz o repasse)
                </p>
              </div>
            </>
          )}

          {novaForma.tipo === 'CARTAO' && (
            <>
              <div className="space-y-2">
                <Label>Taxa da Operadora (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={novaForma.deflacao || ''}
                  onChange={(e) => setNovaForma(prev => ({ 
                    ...prev, 
                    deflacao: Number(e.target.value) || 0
                  }))}
                  placeholder="Ex: 3.5 (3,5% por transação)"
                />
                <p className="text-xs text-muted-foreground">
                  Taxa cobrada pela operadora do cartão (Visa, Master, etc)
                </p>
              </div>
              <div className="space-y-2">
                <Label>Taxa de Antecipação (% por parcela)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={novaForma.jurosAntecipacao || ''}
                  onChange={(e) => setNovaForma(prev => ({ 
                    ...prev, 
                    jurosAntecipacao: Number(e.target.value) || 0
                  }))}
                  placeholder="Ex: 2.5 (2,5% por parcela antecipada)"
                />
                <p className="text-xs text-muted-foreground">
                  Custo para antecipar as parcelas do cartão (se aplicável)
                </p>
              </div>
            </>
          )}

          {novaForma.tipo === 'BOLETO' && (
            <div className="space-y-2">
              <Label>Custo de Capital (% ao mês)</Label>
              <Input
                type="number"
                step="0.1"
                value={novaForma.custoCapital || ''}
                onChange={(e) => setNovaForma(prev => ({ 
                  ...prev, 
                  custoCapital: Number(e.target.value) || 0
                }))}
                placeholder="Ex: 1.0 (1% ao mês)"
              />
              <p className="text-xs text-muted-foreground">
                Custo mensal do dinheiro da empresa (taxa Selic + spread)
              </p>
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