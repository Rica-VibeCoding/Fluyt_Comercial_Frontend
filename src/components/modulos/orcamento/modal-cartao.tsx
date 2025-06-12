'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface ModalCartaoProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (dados: { valor: number; vezes: number; taxa: number; valorPresente: number; desconto: number }) => void;
}

export function ModalCartao({ isOpen, onClose, onSalvar }: ModalCartaoProps) {
  const [valor, setValor] = useState('');
  const [numeroVezes, setNumeroVezes] = useState('');
  const [taxa, setTaxa] = useState('3.5'); // Taxa padrão provisória
  const [isLoading, setIsLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSalvando(true);

    try {
      const valorNumerico = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'));
      const vezesNumerico = parseInt(numeroVezes);
      const taxaNumerico = parseFloat(taxa.replace(',', '.'));
      
      // Calcula valor presente e envia dados completos
      const { valorPresente, desconto } = calcularValorPresente();
      
      // Chama onSalvar imediatamente
      onSalvar({
        valor: valorNumerico,
        vezes: vezesNumerico,
        taxa: taxaNumerico,
        valorPresente: valorPresente,
        desconto: desconto
      });

      // Aguarda 1.5 segundos para feedback visual
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Reset form
      setValor('');
      setNumeroVezes('');
      setTaxa('3.5');
      setSalvando(false);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar cartão:', error);
      setSalvando(false);
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

  const formatarTaxa = (value: string) => {
    // Permite apenas números e vírgula/ponto
    const numero = value.replace(/[^\d,.]/, '').replace('.', ',');
    
    // Limita a 2 casas decimais
    const partes = numero.split(',');
    if (partes[1] && partes[1].length > 2) {
      partes[1] = partes[1].substring(0, 2);
    }
    
    return partes.join(',');
  };

  const handleTaxaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const taxaFormatada = formatarTaxa(e.target.value);
    setTaxa(taxaFormatada);
  };

  // Função para calcular valor presente com antecipação
  const calcularValorPresente = () => {
    const valorTotal = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'));
    const parcelas = parseInt(numeroVezes);
    const taxaMensal = parseFloat(taxa.replace(',', '.')) / 100; // Converte % para decimal
    
    const valorParcela = valorTotal / parcelas;
    let valorPresenteTotal = 0;
    
    // Calcula PV = FV / (1 + r)^n para cada parcela
    for (let n = 1; n <= parcelas; n++) {
      const valorPresente = valorParcela / Math.pow(1 + taxaMensal, n);
      valorPresenteTotal += valorPresente;
    }
    
    const desconto = valorTotal - valorPresenteTotal;
    
    return {
      valorPresente: valorPresenteTotal,
      desconto: desconto,
      valorParcela: valorParcela
    };
  };

  const isFormValido = valor && numeroVezes && taxa;

  // Classe CSS para feedback visual durante salvamento
  const getFormClass = () => {
    if (salvando) return "bg-green-50 dark:bg-green-900/20 transition-colors duration-200";
    return "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col bg-white dark:bg-slate-900">
        <DialogHeader className="border-b border-slate-200 dark:border-slate-700 p-2 pb-1">
          <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Cartão de Crédito
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className={`flex-1 overflow-y-auto p-2 ${getFormClass()}`}>
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
                    disabled={salvando}
                    required
                  />
                </div>

                {/* Grid: Número de Vezes + Taxa */}
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
                      max="24"
                      className="h-8 text-sm border-slate-300 focus:border-slate-400 dark:border-slate-600 dark:focus:border-slate-500"
                      disabled={salvando}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Taxa Financeira (%) *
                    </label>
                    <Input
                      type="text"
                      value={taxa}
                      onChange={handleTaxaChange}
                      placeholder="3,5"
                      className="h-8 text-sm border-slate-300 focus:border-slate-400 dark:border-slate-600 dark:focus:border-slate-500"
                      disabled={salvando}
                      required
                    />
                  </div>
                </div>


                {/* Preview dos dados (se preenchido) */}
                {valor && numeroVezes && taxa && (() => {
                  const { valorPresente, desconto, valorParcela } = calcularValorPresente();
                  
                  return (
                    <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        <strong>Resumo:</strong>
                      </p>
                      <div className="text-xs space-y-0.5">
                        <p>Valor: <strong>{valor}</strong></p>
                        <p>Parcelas: <strong>{numeroVezes}x</strong></p>
                        <p>Valor por parcela: <strong>
                          {valorParcela.toLocaleString('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          })}
                        </strong></p>
                        <p>Taxa: <strong>{taxa}% a.m.</strong></p>
                        <div className="pt-1 border-t border-slate-200 dark:border-slate-600 mt-1">
                          <p className="text-green-700 dark:text-green-400">
                            Valor Presente: <strong>
                              {valorPresente.toLocaleString('pt-BR', { 
                                style: 'currency', 
                                currency: 'BRL' 
                              })}
                            </strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

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
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}