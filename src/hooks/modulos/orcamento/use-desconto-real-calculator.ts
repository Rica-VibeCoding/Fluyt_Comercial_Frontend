/**
 * Hook para cálculos de desconto real e busca binária
 */

import { useCallback } from 'react';
import { FormaPagamento } from '@/types/simulador';

interface DescontoRealCalculatorDeps {
  redistribuirValores: (novoValorNegociado: number, formasAtuais: FormaPagamento[]) => FormaPagamento[] | null;
  calcularValorRecebidoForma: (forma: FormaPagamento) => number;
}

export function useDescontoRealCalculator({ 
  redistribuirValores, 
  calcularValorRecebidoForma 
}: DescontoRealCalculatorDeps) {
  
  const calcularDescontoRealParaValor = useCallback((
    valorNegociado: number, 
    valorBruto: number, 
    formasPagamento: FormaPagamento[]
  ): number => {
    const formasTemp = redistribuirValores(valorNegociado, formasPagamento);
    if (!formasTemp) return -1; // Indica erro
    
    const valorRecebidoTemp = formasTemp.reduce((acc, forma) => {
      const formaComRecebido = { ...forma, valorRecebido: calcularValorRecebidoForma(forma) };
      return acc + formaComRecebido.valorRecebido;
    }, 0);
    
    return valorBruto > 0 ? ((valorBruto - valorRecebidoTemp) / valorBruto) * 100 : 0;
  }, [redistribuirValores, calcularValorRecebidoForma]);

  const encontrarValorParaDescontoReal = useCallback((
    descontoRealDesejado: number,
    valorBruto: number,
    formasPagamento: FormaPagamento[],
    valorNegociadoAtual: number,
    descontoRealAtual: number
  ) => {
    // Busca binária para encontrar o valor negociado que resulta no desconto real desejado
    let valorMin = 0;
    let valorMax = valorBruto;
    let valorNegociadoOtimo = valorNegociadoAtual;
    let melhorDiferenca = Infinity;
    let melhorDesconto = descontoRealAtual;
    
    // Máximo de 25 iterações para maior precisão
    for (let i = 0; i < 25; i++) {
      const valorTeste = (valorMin + valorMax) / 2;
      const descontoRealCalculado = calcularDescontoRealParaValor(valorTeste, valorBruto, formasPagamento);
      
      if (descontoRealCalculado === -1) {
        // Erro na redistribuição, tentar valor maior
        valorMin = valorTeste;
        continue;
      }
      
      const diferenca = Math.abs(descontoRealCalculado - descontoRealDesejado);
      
      // Se encontrou um resultado melhor, guardar
      if (diferenca < melhorDiferenca) {
        melhorDiferenca = diferenca;
        valorNegociadoOtimo = valorTeste;
        melhorDesconto = descontoRealCalculado;
      }
      
      // Critério de parada: diferença menor que 0.01%
      if (diferenca < 0.01) {
        break;
      }
      
      // Ajustar os limites da busca
      if (descontoRealCalculado < descontoRealDesejado) {
        valorMax = valorTeste;
      } else {
        valorMin = valorTeste;
      }
    }
    
    return {
      valorNegociado: valorNegociadoOtimo,
      descontoReal: melhorDesconto,
      diferencaFinal: melhorDiferenca
    };
  }, [calcularDescontoRealParaValor]);

  return {
    calcularDescontoRealParaValor,
    encontrarValorParaDescontoReal
  };
}