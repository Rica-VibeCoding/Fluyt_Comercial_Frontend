'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { RefreshCw } from 'lucide-react';

interface InputSectionProps {
  valorBruto: number;
  desconto: number;
  valorNegociado: number;
  onValorBrutoChange: (valor: number) => void;
  onDescontoChange: (desconto: number) => void;
  onAtualizarSimulacao: () => void;
  valorVemDosAmbientes?: boolean;
  valorTotalAmbientes?: number;
}

function useCurrencyInput(initialValue: number, onChange: (value: number) => void) {
  const [display, setDisplay] = useState(
    initialValue > 0
      ? initialValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : ''
  );
  const [raw, setRaw] = useState(
    initialValue > 0 ? String(Math.round(initialValue * 100)) : ''
  );

  useEffect(() => {
    if (initialValue > 0) {
      const centavos = Math.round(initialValue * 100);
      setRaw(String(centavos));
      setDisplay((centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    } else {
      setRaw('');
      setDisplay('');
    }
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNums = e.target.value.replace(/\D/g, '');
    setRaw(onlyNums);
    const valor = onlyNums ? parseInt(onlyNums, 10) : 0;
    const valorFloat = valor / 100;
    setDisplay(
      valorFloat.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    );
    onChange(valorFloat);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!raw) setDisplay('');
  };

  return {
    value: display,
    onChange: handleChange,
    onFocus: handleFocus,
    inputMode: 'numeric' as const,
    maxLength: 17,
  };
}

export const InputSection: React.FC<InputSectionProps> = ({
  valorBruto,
  desconto,
  valorNegociado,
  onValorBrutoChange,
  onDescontoChange,
  onAtualizarSimulacao,
  valorVemDosAmbientes = false,
  valorTotalAmbientes = 0
}) => {
  const valorBrutoInput = useCurrencyInput(valorBruto, onValorBrutoChange);
  return <section className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="valorBruto">
            Valor dos Ambientes (R$)
            {valorVemDosAmbientes && (
              <span className="text-sm text-green-600 font-normal ml-2">
                • Calculado automaticamente
              </span>
            )}
          </Label>
          <Input 
            id="valorBruto" 
            type="text" 
            {...valorBrutoInput}
            disabled={valorVemDosAmbientes}
            className={valorVemDosAmbientes ? 'bg-green-50 border-green-200' : ''}
          />
          {valorVemDosAmbientes && (
            <p className="text-xs text-green-600">
              Valor sincronizado com os ambientes selecionados
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="desconto">Desconto (%)</Label>
          <Input 
            id="desconto" 
            type="number" 
            min="0" 
            max="100" 
            step="0.1"
            value={isNaN(desconto) ? '' : desconto.toFixed(1)} 
            onChange={e => {
              const value = e.target.value;
              if (value === '') {
                onDescontoChange(0);
              } else {
                const numValue = Number(value);
                if (!isNaN(numValue)) {
                  onDescontoChange(numValue);
                }
              }
            }} 
          />
        </div>
        
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
    </section>;
};