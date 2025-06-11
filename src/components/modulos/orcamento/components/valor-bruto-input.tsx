'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';

interface ValorBrutoInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
  isAutoCalculated?: boolean;
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

export const ValorBrutoInput: React.FC<ValorBrutoInputProps> = ({
  value,
  onChange,
  disabled = false,
  label = "Valor dos Ambientes (R$)",
  isAutoCalculated = false
}) => {
  const currencyInput = useCurrencyInput(value, onChange);

  return (
    <div className="space-y-2">
      <Label htmlFor="valor-bruto-input">
        {label}
        {isAutoCalculated && (
          <span className="text-sm text-green-600 font-normal ml-2">
            • Calculado automaticamente
          </span>
        )}
      </Label>
      <Input
        id="valor-bruto-input"
        type="text"
        {...currencyInput}
        disabled={disabled}
        className={isAutoCalculated ? 'bg-green-50 border-green-200' : ''}
      />
      {isAutoCalculated && (
        <p className="text-xs text-green-600">
          Valor sincronizado com os ambientes selecionados
        </p>
      )}
    </div>
  );
};