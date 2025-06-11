/**
 * Modal para adicionar/editar formas de pagamento
 * Permite configurar diferentes tipos: entrada, financeira, cartão, boleto
 * Cada tipo tem campos específicos e validações próprias
 */

'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard } from 'lucide-react';
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
      <div>
        <Label className="text-xs font-medium text-slate-700">Parcelas</Label>
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
          className="h-8 text-sm border-slate-300 focus:border-slate-400"
        />
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col bg-white dark:bg-slate-900">
        <DialogHeader className="border-b border-slate-200 dark:border-slate-700 p-2 pb-1">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              <CreditCard className="h-3 w-3 text-slate-500" />
            </div>
            <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {editandoForma ? 'Editar' : 'Adicionar'} Forma de Pagamento
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                <div>
                  <Label className="text-xs font-medium text-slate-700">Forma de Pagamento *</Label>
                  <Select 
                    value={novaForma.tipo} 
                    onValueChange={(value: TipoFormaPagamento) => 
                      setNovaForma(prev => ({ ...prev, tipo: value }))
                    }
                  >
                    <SelectTrigger className="h-8 text-sm border-slate-300 focus:border-slate-400">
                      <SelectValue placeholder="Selecione a forma de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENTRADA">À Vista / Dinheiro (Entrada)</SelectItem>
                      <SelectItem value="FINANCEIRA">Financeira / Banco</SelectItem>
                      <SelectItem value="CARTAO">Cartão de Crédito</SelectItem>
                      <SelectItem value="BOLETO">Boleto da Loja</SelectItem>
                    </SelectContent>
                  </Select>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  <div>
                    <Label className="text-xs font-medium text-slate-700">Valor (R$) *</Label>
                    <Input
                      type="text"
                      className="h-8 text-sm border-slate-300 focus:border-slate-400"
                      {...valorFormaInput}
                    />
                  </div>

                  {renderParcelasInput()}
                </div>

                {novaForma.tipo === 'FINANCEIRA' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    <div>
                      <Label className="text-xs font-medium text-slate-700">Taxa de Juros do Banco (% ao mês)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={novaForma.taxaJuros || ''}
                        onChange={(e) => setNovaForma(prev => ({ 
                          ...prev, 
                          taxaJuros: Number(e.target.value) || 0
                        }))}
                        placeholder="Ex: 1.5"
                        className="h-8 text-sm border-slate-300 focus:border-slate-400"
                      />

                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-700">Data do Primeiro Vencimento</Label>
                      <Input
                        type="date"
                        value={novaForma.dataVencimento}
                        onChange={(e) => setNovaForma(prev => ({ 
                          ...prev, 
                          dataVencimento: e.target.value
                        }))}
                        className="h-8 text-sm border-slate-300 focus:border-slate-400"
                      />

                    </div>
                  </div>
                )}

                {novaForma.tipo === 'CARTAO' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    <div>
                      <Label className="text-xs font-medium text-slate-700">Taxa da Operadora (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={novaForma.deflacao || ''}
                        onChange={(e) => setNovaForma(prev => ({ 
                          ...prev, 
                          deflacao: Number(e.target.value) || 0
                        }))}
                        placeholder="Ex: 3.5"
                        className="h-8 text-sm border-slate-300 focus:border-slate-400"
                      />

                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-700">Taxa de Antecipação (% por parcela)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={novaForma.jurosAntecipacao || ''}
                        onChange={(e) => setNovaForma(prev => ({ 
                          ...prev, 
                          jurosAntecipacao: Number(e.target.value) || 0
                        }))}
                        placeholder="Ex: 2.5"
                        className="h-8 text-sm border-slate-300 focus:border-slate-400"
                      />

                    </div>
                  </div>
                )}

                {novaForma.tipo === 'BOLETO' && (
                  <div>
                    <Label className="text-xs font-medium text-slate-700">Custo de Capital (% ao mês)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={novaForma.custoCapital || ''}
                      onChange={(e) => setNovaForma(prev => ({ 
                        ...prev, 
                        custoCapital: Number(e.target.value) || 0
                      }))}
                      placeholder="Ex: 1.0"
                      className="h-8 text-sm border-slate-300 focus:border-slate-400"
                    />

                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 pt-1">
              <div className="flex justify-end items-center gap-1">
                <button 
                  type="button" 
                  onClick={onCancel}
                  className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium border border-slate-900 transition-colors"
                >
                  {editandoForma ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { NovaFormaState, TipoFormaPagamento };