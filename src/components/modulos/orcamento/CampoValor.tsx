import React from 'react';
import { Input } from '@/components/ui/input';

interface CampoValorProps {
  valor: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  valorMaximo?: number;
  valorJaAlocado?: number;
  erroValidacao?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Campo valor padronizado para modais de pagamento
 * Inclui label, formatação, validação e feedback visual
 */
export function CampoValor({
  valor,
  onChange,
  valorMaximo = 0,
  valorJaAlocado = 0,
  erroValidacao,
  disabled = false,
  required = true
}: CampoValorProps) {
  
  const valorRestante = valorMaximo - valorJaAlocado;
  const mostrarDisponivel = valorMaximo > 0;

  return (
    <div>
      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
        Valor {required && '*'} {mostrarDisponivel && (
          <span className="text-gray-500">
            (Disponível: R$ {valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
          </span>
        )}
      </label>
      <Input
        type="text"
        value={valor}
        onChange={onChange}
        placeholder="R$ 0,00"
        className={`h-8 text-sm border-slate-300 focus:border-slate-400 dark:border-slate-600 dark:focus:border-slate-500 ${
          erroValidacao ? 'border-red-500 focus:border-red-500' : ''
        }`}
        disabled={disabled}
        required={required}
      />
      {erroValidacao && (
        <p className="text-xs text-red-500 mt-1">{erroValidacao}</p>
      )}
    </div>
  );
} 