'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface ModalAVistaProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (dados: { valor: number; data: string }) => void;
  dadosIniciais?: {
    valor?: number;
    data?: string;
  };
  valorMaximo?: number;
  valorJaAlocado?: number;
}

export function ModalAVista({ isOpen, onClose, onSalvar, dadosIniciais, valorMaximo = 0, valorJaAlocado = 0 }: ModalAVistaProps) {
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [erroValidacao, setErroValidacao] = useState('');

  // Carregar dados iniciais quando modal abrir para edição
  useEffect(() => {
    if (isOpen && dadosIniciais) {
      if (dadosIniciais.valor) {
        const valorFormatado = dadosIniciais.valor.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
        setValor(valorFormatado);
      }
      
      if (dadosIniciais.data) {
        // Converter data para formato do input (YYYY-MM-DD)
        const dataFormatada = new Date(dadosIniciais.data).toISOString().split('T')[0];
        setData(dataFormatada);
      }
    } else if (isOpen) {
      // Limpar campos se for nova forma
      setValor('');
      setData('');
    }
  }, [isOpen, dadosIniciais]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const valorNumerico = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'));
    const valorRestante = valorMaximo - valorJaAlocado;
    
    // Validação final
    if (valorNumerico > valorRestante) {
      setErroValidacao(`Valor excede o disponível: R$ ${valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      return;
    }
    
    setIsLoading(true);

    try {
      onSalvar({
        valor: valorNumerico,
        data: data
      });

      // Reset form
      setValor('');
      setData('');
      setErroValidacao('');
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatarValor = (value: string) => {
    // Remove tudo que não é dígito
    const numero = value.replace(/\D/g, '');
    
    // Converte para número e formata
    const valorNumerico = parseInt(numero) / 100;
    
    return valorNumerico.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarValor(e.target.value);
    setValor(valorFormatado);
    
    // Validar em tempo real
    const valorNumerico = parseFloat(valorFormatado.replace(/[^\d,]/g, '').replace(',', '.'));
    const valorRestante = valorMaximo - valorJaAlocado;
    
    if (valorNumerico > valorRestante) {
      setErroValidacao(`Valor excede o disponível: R$ ${valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    } else {
      setErroValidacao('');
    }
  };

  const getDataMinima = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col bg-white dark:bg-slate-900">
        <DialogHeader className="border-b border-slate-200 dark:border-slate-700 p-2 pb-1">
          <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            À Vista
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                
                {/* Campo Valor */}
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Valor * {valorMaximo > 0 && (
                      <span className="text-gray-500">
                        (Disponível: R$ {(valorMaximo - valorJaAlocado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                      </span>
                    )}
                  </label>
                  <Input
                    type="text"
                    value={valor}
                    onChange={handleValorChange}
                    placeholder="R$ 0,00"
                    className={`h-8 text-sm border-slate-300 focus:border-slate-400 dark:border-slate-600 dark:focus:border-slate-500 ${
                      erroValidacao ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    required
                  />
                  {erroValidacao && (
                    <p className="text-xs text-red-500 mt-1">{erroValidacao}</p>
                  )}
                </div>

                {/* Campo Data */}
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Data de Recebimento *
                  </label>
                  <Input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    min={getDataMinima()}
                    className="h-8 text-sm border-slate-300 focus:border-slate-400 dark:border-slate-600 dark:focus:border-slate-500"
                    required
                  />
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 pt-1">
              <div className="flex justify-end items-center gap-1">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isLoading || !valor || !data || !!erroValidacao}
                  className="px-4 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium border border-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  {isLoading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}