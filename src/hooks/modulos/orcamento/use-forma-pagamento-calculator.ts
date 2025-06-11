/**
 * Hook para cálculos específicos de formas de pagamento
 */

import { useCallback } from 'react';
import { FormaPagamento } from '@/types/simulador';

export function useFormaPagamentoCalculator() {
  const calcularValorRecebidoForma = useCallback((forma: FormaPagamento): number => {
    switch (forma.tipo) {
      case 'ENTRADA':
        return forma.valor;
      
      case 'FINANCEIRA': {
        if (!forma.parcelas || !forma.taxaJuros) return forma.valor;
        const i = forma.taxaJuros / 100;
        const parcelas = forma.parcelas;
        const valorPresente = forma.valor / Math.pow(1 + i, parcelas);
        return valorPresente;
      }
      
      case 'CARTAO': {
        if (!forma.deflacao || !forma.jurosAntecipacao || !forma.parcelas) return forma.valor;
        const fatorDeflacao = 1 - (forma.deflacao / 100);
        const fatorJuros = 1 - (forma.jurosAntecipacao / 100 * forma.parcelas);
        const valorRecebido = forma.valor * fatorDeflacao * fatorJuros;
        return valorRecebido;
      }
      
      case 'BOLETO': {
        if (!forma.parcelas || !forma.custoCapital) return forma.valor;
        const ic = forma.custoCapital / 100;
        const valorPresenteBoleto = forma.valor / Math.pow(1 + ic, forma.parcelas);
        return valorPresenteBoleto;
      }
      
      default:
        return forma.valor;
    }
  }, []);

  const calcularTotalFormas = useCallback((formas: FormaPagamento[]): number => {
    return formas.reduce((acc, forma) => acc + forma.valor, 0);
  }, []);

  const calcularTotalRecebido = useCallback((formas: FormaPagamento[]): number => {
    return formas.reduce((acc, forma) => acc + forma.valorRecebido, 0);
  }, []);

  const calcularDescontoReal = useCallback((valorBruto: number, valorRecebidoTotal: number): number => {
    // Se não há valor bruto ou valor recebido, desconto é 0
    if (valorBruto <= 0 || valorRecebidoTotal <= 0) {
      return 0;
    }
    
    const resultado = ((valorBruto - valorRecebidoTotal) / valorBruto) * 100;
    
    // Garantir que sempre retorna um número válido
    if (isNaN(resultado) || !isFinite(resultado)) {
      return 0;
    }
    
    return resultado;
  }, []);

  return {
    calcularValorRecebidoForma,
    calcularTotalFormas,
    calcularTotalRecebido,
    calcularDescontoReal
  };
}