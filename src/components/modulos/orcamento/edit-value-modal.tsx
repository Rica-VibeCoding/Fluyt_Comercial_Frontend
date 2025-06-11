'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Lock, Edit } from 'lucide-react';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

interface EditValueModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  currentValue: number;
  onSave: (newValue: number, shouldLock?: boolean) => void;
  isPercentage?: boolean;
  showLockOption?: boolean;
  isLocked?: boolean;
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
    inputMode: 'numeric',
    maxLength: 17,
  };
}

export const EditValueModal: React.FC<EditValueModalProps> = ({
  isOpen,
  onClose,
  title,
  currentValue,
  onSave,
  isPercentage = false,
  showLockOption = false,
  isLocked = false
}) => {
  const [value, setValue] = useState(currentValue);
  const [shouldLock, setShouldLock] = useState(isLocked);

  useEffect(() => {
    if (isOpen) {
      setValue(currentValue);
      setShouldLock(isLocked);
    }
  }, [isOpen, currentValue, isLocked]);

  // Usar input de moeda se não for percentual
  const currencyInput = useCurrencyInput(value, setValue);

  const handleSave = () => {
    // Verificação de segurança para percentual de desconto
    if (isPercentage && value >= 100) {
      alert('Desconto não pode ser 100% ou maior. Valor máximo: 99.9%');
      setValue(99.9);
      return;
    }
    onSave(value, showLockOption ? shouldLock : undefined);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[70vh] flex flex-col bg-white dark:bg-slate-900">
        <DialogHeader className="border-b border-slate-200 dark:border-slate-700 p-2 pb-1">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              <Edit className="h-3 w-3 text-slate-500" />
            </div>
            <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Editar {title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                <div className="mb-2">
                  <DialogDescription className="text-xs text-slate-500">
                    {isPercentage 
                      ? "Insira o novo valor percentual desejado. Para descontos reais, o sistema redistribuirá automaticamente os valores das formas de pagamento."
                      : "Insira o novo valor monetário desejado. O sistema recalculará automaticamente todos os percentuais relacionados."
                    }
                  </DialogDescription>
                </div>

                <div>
                  <Label className="text-xs font-medium text-slate-700">
                    Valor Atual: {isPercentage ? formatPercentage(currentValue) : formatCurrency(currentValue)}
                  </Label>
                </div>

                <div>
                  <Label className="text-xs font-medium text-slate-700">
                    {isPercentage ? 'Novo Percentual (%) *' : 'Novo Valor (R$) *'}
                  </Label>
                  <Input
                    type={isPercentage ? "number" : "text"}
                    step={isPercentage ? "0.1" : undefined}
                    min={isPercentage ? "0" : undefined}
                    max={isPercentage ? "99.9" : undefined}
                    value={isPercentage ? value : currencyInput.value}
                    onChange={isPercentage ? (e) => {
                      const newValue = Number(e.target.value) || 0;
                      setValue(newValue > 99.9 ? 99.9 : newValue);
                    } : currencyInput.onChange}
                    onFocus={isPercentage ? undefined : currencyInput.onFocus}
                    inputMode={isPercentage ? undefined : "numeric"}
                    maxLength={isPercentage ? undefined : 17}
                    placeholder={isPercentage ? "Digite o novo percentual (máx. 99.9%)" : "Digite o novo valor"}
                    className="h-8 text-sm border-slate-300 focus:border-slate-400"
                  />
                </div>
                
                {showLockOption && (
                  <div className="border-t border-slate-200 pt-2">
                    <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={shouldLock}
                          onCheckedChange={setShouldLock}
                        />
                        <div>
                          <Label className="text-xs font-medium text-slate-700">Travar {title}</Label>
                          <p className="text-xs text-slate-500">
                            {shouldLock 
                              ? `Valor fixo em ${isPercentage ? `${value.toFixed(1)}%` : formatCurrency(value)}`
                              : 'Valor será recalculado automaticamente'
                            }
                          </p>
                        </div>
                      </div>
                      {shouldLock && (
                        <div className="px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-blue-800 dark:text-blue-200 text-xs font-semibold flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          FIXO
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 pt-1">
              <div className="flex justify-end items-center gap-1">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium border border-slate-900 transition-colors"
                >
                  {showLockOption && shouldLock ? 'Confirmar e Travar' : 'Confirmar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
