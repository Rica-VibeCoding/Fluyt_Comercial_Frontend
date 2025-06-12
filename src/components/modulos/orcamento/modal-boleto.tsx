'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface ParcelaBoleto {
  numero: number;
  data: string;
  valor: number;
}

interface ModalBoletoProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (dados: { valor: number; parcelas: ParcelaBoleto[] }) => void;
}

export function ModalBoleto({ isOpen, onClose, onSalvar }: ModalBoletoProps) {
  const [valor, setValor] = useState('');
  const [numeroVezes, setNumeroVezes] = useState('');
  const [dataPrimeira, setDataPrimeira] = useState('');
  const [parcelas, setParcelas] = useState<ParcelaBoleto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Gerar parcelas automaticamente
  useEffect(() => {
    if (numeroVezes && dataPrimeira && valor) {
      const vezes = parseInt(numeroVezes);
      const valorNumerico = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'));
      const valorParcela = valorNumerico / vezes;
      
      if (vezes > 0 && vezes <= 12 && !isNaN(valorNumerico)) {
        const novasParcelas: ParcelaBoleto[] = [];
        const dataBase = new Date(dataPrimeira);
        
        for (let i = 0; i < vezes; i++) {
          const dataParcela = new Date(dataBase);
          dataParcela.setMonth(dataParcela.getMonth() + i);
          
          novasParcelas.push({
            numero: i + 1,
            data: dataParcela.toISOString().split('T')[0],
            valor: valorParcela
          });
        }
        
        setParcelas(novasParcelas);
      }
    } else {
      setParcelas([]);
    }
  }, [numeroVezes, dataPrimeira, valor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const valorNumerico = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'));
      
      onSalvar({
        valor: valorNumerico,
        parcelas: parcelas
      });

      // Reset form
      setValor('');
      setNumeroVezes('');
      setDataPrimeira('');
      setParcelas([]);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar boleto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatarValor = (value: string) => {
    const numero = value.replace(/\D/g, '');
    const valorNumerico = parseInt(numero) / 100;
    
    return valorNumerico.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarValor(e.target.value);
    setValor(valorFormatado);
  };

  const handleDataParcelaChange = (index: number, novaData: string) => {
    const novasParcelas = [...parcelas];
    novasParcelas[index].data = novaData;
    setParcelas(novasParcelas);
  };

  const getDataMinima = () => {
    return new Date().toISOString().split('T')[0];
  };

  const isFormValido = valor && numeroVezes && dataPrimeira && parcelas.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col bg-white dark:bg-slate-900">
        <DialogHeader className="border-b border-slate-200 dark:border-slate-700 p-2 pb-1">
          <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Boleto
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                
                {/* Campo Valor */}
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Valor *
                  </label>
                  <Input
                    type="text"
                    value={valor}
                    onChange={handleValorChange}
                    placeholder="R$ 0,00"
                    className="h-8 text-sm border-slate-300 focus:border-slate-400 dark:border-slate-600 dark:focus:border-slate-500"
                    required
                  />
                </div>

                {/* Grid: Número de Vezes + Data Primeira */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Número de Vezes *
                    </label>
                    <Input
                      type="number"
                      value={numeroVezes}
                      onChange={(e) => setNumeroVezes(e.target.value)}
                      placeholder="1"
                      min="1"
                      max="12"
                      className="h-8 text-sm border-slate-300 focus:border-slate-400 dark:border-slate-600 dark:focus:border-slate-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Data da Primeira *
                    </label>
                    <Input
                      type="date"
                      value={dataPrimeira}
                      onChange={(e) => setDataPrimeira(e.target.value)}
                      min={getDataMinima()}
                      className="h-8 text-sm border-slate-300 focus:border-slate-400 dark:border-slate-600 dark:focus:border-slate-500"
                      required
                    />
                  </div>
                </div>

                {/* Minitabela de Parcelas */}
                {parcelas.length > 0 && (
                  <div className="mt-2">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                      Datas das Parcelas
                    </label>
                    
                    <div className="border border-slate-200 dark:border-slate-600 rounded text-xs">
                      {/* Header da tabela */}
                      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-600 font-medium text-slate-700 dark:text-slate-300">
                        <span>Parcela</span>
                        <span>Data</span>
                        <span>Valor</span>
                      </div>
                      
                      {/* Linhas das parcelas */}
                      <div className="max-h-32 overflow-y-auto">
                        {parcelas.map((parcela, index) => (
                          <div key={index} className="grid grid-cols-3 gap-1 p-1 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                            <span className="text-slate-600 dark:text-slate-400 self-center">
                              {parcela.numero}x
                            </span>
                            <Input
                              type="date"
                              value={parcela.data}
                              onChange={(e) => handleDataParcelaChange(index, e.target.value)}
                              className="h-6 text-xs border-slate-200 focus:border-slate-300 dark:border-slate-600 dark:focus:border-slate-500"
                              min={getDataMinima()}
                            />
                            <span className="text-slate-600 dark:text-slate-400 self-center text-xs">
                              {parcela.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

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
                  disabled={isLoading || !isFormValido}
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