'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';

interface DescontoInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
}

export const DescontoInput: React.FC<DescontoInputProps> = ({
  value,
  onChange,
  disabled = false,
  label = "Desconto (%)"
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);

  // Sincronizar o valor interno com o valor externo
  useEffect(() => {
    if (!isFocused) {
      if (isNaN(value) || value === 0) {
        setInputValue('');
      } else {
        setInputValue(value.toString());
      }
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Permitir string vazia
    if (newValue === '') {
      onChange(0);
      return;
    }

    // Validar se é um número
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      onChange(numValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    // Ao perder o foco, validar e corrigir o valor
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || inputValue === '') {
      setInputValue('');
      onChange(0);
    } else {
      const clampedValue = Math.max(0, Math.min(100, numValue));
      setInputValue(clampedValue.toString());
      onChange(clampedValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="desconto-input">{label}</Label>
      <Input
        id="desconto-input"
        type="number"
        min="0"
        max="100"
        step="0.1"
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder="0"
        className="w-full"
      />
      <div className="text-xs text-gray-500">
        Valor entre 0% e 100%
      </div>
    </div>
  );
};