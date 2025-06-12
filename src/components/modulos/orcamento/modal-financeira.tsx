'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { formatarMoeda, parseValorMoeda, formatarPercentual } from '@/lib/formatters';
import { validarValorDisponivel, validarNumeroParcelas } from '@/lib/validators';
import { PAGAMENTO_CONFIG, getTaxaPadrao, getLimitesParcelas, getPlaceholderTaxa } from '@/lib/pagamento-config';
import { calcularValorPresenteFinanceira, gerarCronogramaParcelas } from '@/lib/calculators';
import { ModalPagamentoBase } from './ModalPagamentoBase';
import { CampoValor } from './CampoValor';

interface ParcelaFinanceira {
  numero: number;
  data: string;
  valor: number;
}

interface ModalFinanceiraProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (dados: { valor: number; vezes: number; percentual: number; parcelas: ParcelaFinanceira[]; valorPresente: number }) => void;
  dadosIniciais?: {
    valor?: number;
    vezes?: number;
    percentual?: number;
    parcelas?: ParcelaFinanceira[];
  };
  valorMaximo?: number;
  valorJaAlocado?: number;
}

export function ModalFinanceira({ isOpen, onClose, onSalvar, dadosIniciais, valorMaximo = 0, valorJaAlocado = 0 }: ModalFinanceiraProps) {
  const [valor, setValor] = useState('');
  const [numeroVezes, setNumeroVezes] = useState('');
  const [dataPrimeira, setDataPrimeira] = useState('');
  const [percentual, setPercentual] = useState(getTaxaPadrao('financeira').toString().replace('.', ',')); // Percentual padrão configurável
  const [parcelas, setParcelas] = useState<ParcelaFinanceira[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
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
      
      if (dadosIniciais.vezes) {
        setNumeroVezes(dadosIniciais.vezes.toString());
      }
      
      if (dadosIniciais.percentual) {
        setPercentual(dadosIniciais.percentual.toString().replace('.', ','));
      }
      
      if (dadosIniciais.parcelas && dadosIniciais.parcelas.length > 0) {
        // Definir data da primeira parcela
        const primeiraParcela = dadosIniciais.parcelas[0];
        if (primeiraParcela.data) {
          const dataFormatada = new Date(primeiraParcela.data).toISOString().split('T')[0];
          setDataPrimeira(dataFormatada);
        }
        
        // Carregar todas as parcelas
        setParcelas(dadosIniciais.parcelas);
      }
    } else if (isOpen) {
      // Limpar campos se for nova forma
      setValor('');
      setNumeroVezes('');
      setDataPrimeira('');
      setPercentual('1.8');
      setParcelas([]);
    }
  }, [isOpen, dadosIniciais]);

  // Gerar parcelas automaticamente usando função centralizada
  useEffect(() => {
    if (numeroVezes && dataPrimeira && valor) {
      const vezes = parseInt(numeroVezes);
      const valorNumerico = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'));
      
      const limites = getLimitesParcelas('financeira');
      if (vezes >= limites.min && vezes <= limites.max && !isNaN(valorNumerico)) {
        const cronograma = gerarCronogramaParcelas(valorNumerico, vezes, dataPrimeira);
        setParcelas(cronograma);
      }
    } else {
      setParcelas([]);
    }
  }, [numeroVezes, dataPrimeira, valor]);

  // Usar função centralizada para calcular valor presente
  const calcularValorPresente = () => {
    const valorTotal = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'));
    const vezes = parseInt(numeroVezes);
    const taxaMensal = parseFloat(percentual.replace(',', '.'));
    
    return calcularValorPresenteFinanceira(valorTotal, vezes, taxaMensal);
  };

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
    setSalvando(true);

    try {
      const vezesNumerico = parseInt(numeroVezes);
      const percentualNumerico = parseFloat(percentual.replace(',', '.'));
      const valorPresente = calcularValorPresente();
      
      // Chama onSalvar imediatamente
      onSalvar({
        valor: valorNumerico,
        vezes: vezesNumerico,
        percentual: percentualNumerico,
        parcelas: parcelas,
        valorPresente: valorPresente
      });

      // Aguarda 1.5 segundos para feedback visual
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Reset form
      setValor('');
      setNumeroVezes('');
      setDataPrimeira('');
      setPercentual('1.8');
      setParcelas([]);
      setErroValidacao('');
      setSalvando(false);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar financeira:', error);
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
    
    // Validar em tempo real
    const valorNumerico = parseFloat(valorFormatado.replace(/[^\d,]/g, '').replace(',', '.'));
    const valorRestante = valorMaximo - valorJaAlocado;
    
    if (valorNumerico > valorRestante) {
      setErroValidacao(`Valor excede o disponível: R$ ${valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    } else {
      setErroValidacao('');
    }
  };

  const formatarPercentual = (value: string) => {
    // Permite apenas números e vírgula/ponto
    const numero = value.replace(/[^\d,.]/, '').replace('.', ',');
    
    // Limita a 2 casas decimais
    const partes = numero.split(',');
    if (partes[1] && partes[1].length > 2) {
      partes[1] = partes[1].substring(0, 2);
    }
    
    return partes.join(',');
  };

  const handlePercentualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentualFormatado = formatarPercentual(e.target.value);
    setPercentual(percentualFormatado);
  };

  const getDataMinima = () => {
    return new Date().toISOString().split('T')[0];
  };



  const isFormValido = valor && numeroVezes && dataPrimeira && percentual && parcelas.length > 0 && !erroValidacao;

  return (
    <ModalPagamentoBase
      isOpen={isOpen}
      onClose={onClose}
      titulo="Financeira"
      isLoading={isLoading}
      salvando={salvando}
      erroValidacao={erroValidacao}
      onSubmit={handleSubmit}
      isFormValido={isFormValido}
    >
      
      {/* Campo Valor usando componente reutilizável */}
      <CampoValor
        valor={valor}
        onChange={handleValorChange}
        valorMaximo={valorMaximo}
        valorJaAlocado={valorJaAlocado}
        erroValidacao={erroValidacao}
        disabled={salvando}
      />

      {/* Grid: Número de Vezes + Data Primeira + Percentual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
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
            max={getLimitesParcelas('financeira').max.toString()}
            className="h-8 text-sm border-slate-300 focus:border-slate-400 dark:border-slate-600 dark:focus:border-slate-500"
            disabled={salvando}
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
            disabled={salvando}
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Percentual (%) *
          </label>
          <Input
            type="text"
            value={percentual}
            onChange={handlePercentualChange}
            placeholder={getPlaceholderTaxa('financeira')}
            className="h-8 text-sm border-slate-300 focus:border-slate-400 dark:border-slate-600 dark:focus:border-slate-500"
            disabled={salvando}
            required
          />
        </div>
      </div>

      {/* Preview com Valor Presente */}
      {valor && numeroVezes && percentual && (
        <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
            <strong>Resumo:</strong>
          </p>
          <div className="text-xs space-y-0.5">
            <p>Valor: <strong>{valor}</strong></p>
            <p>Parcelas: <strong>{numeroVezes}x</strong></p>
            <p>Percentual: <strong>{percentual}% a.m.</strong></p>
            <div className="pt-1 border-t border-slate-200 dark:border-slate-600 mt-1">
              <p className="text-green-700 dark:text-green-400">
                Valor Presente: <strong>
                  {calcularValorPresente().toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </strong>
              </p>
            </div>
          </div>
        </div>
      )}
      
    </ModalPagamentoBase>
  );
}