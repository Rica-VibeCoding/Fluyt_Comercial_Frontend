'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Edit3, Check, X, Calculator } from 'lucide-react';

interface EditablePercentFieldProps {
  value: number;
  onChange: (value: number) => void;
  isCalculating?: boolean;
  disabled?: boolean;
  placeholder?: string;
  tooltip?: string;
  className?: string;
  maxValue?: number;
}

export function EditablePercentField({
  value,
  onChange,
  isCalculating = false,
  disabled = false,
  placeholder = "0%",
  tooltip = "Clique para editar",
  className,
  maxValue = 50
}: EditablePercentFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Formatar valor para exibição
  const formatPercent = (val: number): string => {
    return `${val.toFixed(1)}%`;
  };

  // Converter string para número
  const parsePercent = (str: string): number => {
    const cleaned = str.replace(/[^\d,.-]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.max(0, Math.min(maxValue, parsed));
  };

  // Validar valor
  const validateValue = (val: number): string => {
    if (val < 0) return 'Valor não pode ser negativo';
    if (val > maxValue) return `Valor máximo permitido: ${maxValue}%`;
    return '';
  };

  // Iniciar edição
  const handleStartEdit = () => {
    if (disabled || isCalculating) return;
    setInputValue(value.toString());
    setIsEditing(true);
    setValidationError('');
  };

  // Salvar edição
  const handleSave = () => {
    const newValue = parsePercent(inputValue);
    const error = validateValue(newValue);
    
    if (error) {
      setValidationError(error);
      return;
    }

    onChange(newValue);
    setIsEditing(false);
    setValidationError('');
  };

  // Cancelar edição
  const handleCancel = () => {
    setIsEditing(false);
    setInputValue('');
    setValidationError('');
  };

  // Auto-focus quando entrar em modo edição
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handlers de teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Validação em tempo real
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const parsed = parsePercent(newValue);
    const error = validateValue(parsed);
    setValidationError(error);
  };

  if (isEditing) {
    return (
      <div className={cn("relative inline-flex flex-col gap-1", className)}>
        <div className="inline-flex items-center gap-2">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className={cn(
                "px-3 py-2 border-2 rounded-lg bg-white text-lg font-semibold",
                "focus:outline-none focus:ring-2 transition-all duration-200 shadow-lg",
                validationError 
                  ? "border-red-500 focus:ring-red-300 focus:border-red-600" 
                  : "border-blue-500 focus:ring-blue-300 focus:border-blue-600"
              )}
              placeholder={placeholder}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              %
            </span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              disabled={!!validationError}
              className={cn(
                "p-1 rounded transition-colors",
                validationError
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-green-600 hover:bg-green-50"
              )}
              title="Salvar (Enter)"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Cancelar (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Erro de validação */}
        {validationError && (
          <span className="text-xs text-red-600 ml-3">
            {validationError}
          </span>
        )}
        
        {/* Dica de limite */}
        {!validationError && (
          <span className="text-xs text-gray-500 ml-3">
            Máximo: {maxValue}%
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-2 group cursor-pointer transition-all duration-200",
        {
          "opacity-50 cursor-not-allowed": disabled || isCalculating,
          "hover:bg-blue-50 hover:shadow-sm rounded-lg px-2 py-1": !disabled && !isCalculating
        },
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleStartEdit}
      title={disabled ? "Campo não editável" : tooltip}
    >
      <span className={cn(
        "text-lg font-semibold transition-colors duration-200",
        {
          "text-blue-600": !disabled && !isCalculating,
          "text-gray-500": disabled,
          "text-yellow-600": isCalculating
        }
      )}>
        {formatPercent(value)}
      </span>

      {isCalculating ? (
        <Calculator className="h-4 w-4 text-yellow-600 animate-pulse" />
      ) : (
        <Edit3 className={cn(
          "h-4 w-4 transition-all duration-200",
          {
            "text-blue-400 opacity-0 group-hover:opacity-100": !disabled,
            "text-gray-400 opacity-50": disabled
          }
        )} />
      )}

      {/* Tooltip */}
      {isHovered && !disabled && !isCalculating && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 
                        bg-gray-800 text-white text-xs px-2 py-1 rounded 
                        opacity-0 animate-in fade-in duration-200 whitespace-nowrap">
          {tooltip}
        </div>
      )}
    </div>
  );
}