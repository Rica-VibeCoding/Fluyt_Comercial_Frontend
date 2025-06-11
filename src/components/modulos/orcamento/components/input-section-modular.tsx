'use client';

import React from 'react';
import { Button } from '../../../ui/button';
import { RefreshCw } from 'lucide-react';
import { DescontoInput } from './desconto-input';
import { ValorBrutoInput } from './valor-bruto-input';

interface InputSectionModularProps {
  valorBruto: number;
  desconto: number;
  valorNegociado: number;
  onValorBrutoChange: (valor: number) => void;
  onDescontoChange: (desconto: number) => void;
  onAtualizarSimulacao: () => void;
  valorVemDosAmbientes?: boolean;
  valorTotalAmbientes?: number;
}

export const InputSectionModular: React.FC<InputSectionModularProps> = ({
  valorBruto,
  desconto,
  valorNegociado,
  onValorBrutoChange,
  onDescontoChange,
  onAtualizarSimulacao,
  valorVemDosAmbientes = false,
  valorTotalAmbientes = 0
}) => {
  return (
    <section className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <div className="grid grid-cols-3 gap-4">
        {/* Valor Bruto */}
        <ValorBrutoInput
          value={valorBruto}
          onChange={onValorBrutoChange}
          disabled={valorVemDosAmbientes}
          isAutoCalculated={valorVemDosAmbientes}
        />

        {/* Desconto */}
        <DescontoInput
          value={desconto}
          onChange={onDescontoChange}
        />

        {/* Botão Atualizar */}
        <div className="space-y-2">
          <div className="h-6"></div>
          <Button 
            onClick={onAtualizarSimulacao}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
        <div className="grid grid-cols-3 gap-4">
          <div>Valor Bruto: R$ {valorBruto.toFixed(2)}</div>
          <div>Desconto: {isNaN(desconto) ? 'NaN' : desconto.toFixed(1)}%</div>
          <div>Valor Negociado: R$ {valorNegociado.toFixed(2)}</div>
        </div>
      </div>
    </section>
  );
};