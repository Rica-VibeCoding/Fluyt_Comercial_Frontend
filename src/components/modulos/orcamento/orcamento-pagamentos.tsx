'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { ListaFormasPagamento } from './lista-formas-pagamento';
import { FormaPagamento } from '@/lib/sessao-simples';
import { formatarMoeda } from '@/lib/formatters';

interface OrcamentoPagamentosProps {
  descontoPercentual: number;
  valorRestante: number;
  valorNegociado: number;
  formasPagamento: FormaPagamento[];
  onDescontoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdicionarForma: () => void;
  onEditarForma: (forma: FormaPagamento) => void;
  onRemoverForma: (id: string) => void;
  onToggleTravamento: (id: string) => void;
}

export function OrcamentoPagamentos({
  descontoPercentual,
  valorRestante,
  valorNegociado,
  formasPagamento,
  onDescontoChange,
  onAdicionarForma,
  onEditarForma,
  onRemoverForma,
  onToggleTravamento
}: OrcamentoPagamentosProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Plano de Pagamento</h3>
          <div className="text-sm">
            <span className="text-gray-600">Restante: </span>
            <span className={`font-bold ${
              valorRestante <= 0 ? 'text-green-600' : 'text-red-500'
            }`}>
              {formatarMoeda(valorRestante)}
            </span>
            <span className="text-gray-500"> / {formatarMoeda(valorNegociado)}</span>
          </div>
        </div>
        
        {/* Layout em linha: Desconto + Botão Adicionar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          
          {/* Campo Desconto - 1/3 da largura */}
          <div className="flex-shrink-0 w-full sm:w-48">
            <label className="block text-sm font-medium mb-2">Desconto (%)</label>
            <div className="relative">
              <Input
                type="number"
                value={descontoPercentual}
                onChange={onDescontoChange}
                placeholder="0"
                className="pr-8"
                max="100"
                min="0"
                step="0.1"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                %
              </span>
            </div>
          </div>

          {/* Botão Adicionar - ocupa espaço restante */}
          <div className="flex-1 flex flex-col justify-end">
            <Button
              onClick={onAdicionarForma}
              variant="outline"
              className="w-full gap-2 h-10"
            >
              <Plus className="h-4 w-4" />
              Adicionar Forma de Pagamento
            </Button>
          </div>
          
        </div>
        
        {/* Seção: Formas de Pagamento Configuradas */}
        {formasPagamento.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Formas de Pagamento Configuradas:</h4>
            <ListaFormasPagamento
              formas={formasPagamento}
              onEditar={onEditarForma}
              onRemover={onRemoverForma}
              onToggleTravamento={onToggleTravamento}
            />
          </div>
        )}
        
      </CardContent>
    </Card>
  );
}