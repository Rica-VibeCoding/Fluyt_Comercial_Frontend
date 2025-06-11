/**
 * Hook do simulador baseado no código original funcionando
 * Simplificado para resolver os problemas de cálculo
 */

import { useState, useCallback } from 'react';
import { FormaPagamento } from '@/types/simulador';

interface Simulacao {
  valorBruto: number;
  desconto: number;
  valorNegociado: number;
  formasPagamento: FormaPagamento[];
  valorRecebidoTotal: number;
  descontoReal: number;
  valorRestante: number;
  travamentos: {
    valorNegociado: boolean;
    descontoReal: boolean;
    limiteDescontoReal: number;
    descontoRealFixo: boolean;
    valorDescontoRealFixo: number;
  };
}

export const useSimuladorClean = () => {
  const [simulacao, setSimulacao] = useState<Simulacao>({
    valorBruto: 0,
    desconto: 0,
    valorNegociado: 0,
    formasPagamento: [],
    valorRecebidoTotal: 0,
    descontoReal: 0,
    valorRestante: 0,
    travamentos: {
      valorNegociado: false,
      descontoReal: false,
      limiteDescontoReal: 25,
      descontoRealFixo: false,
      valorDescontoRealFixo: 0
    }
  });

  // Funções de cálculo simples
  const calcularValorRecebidoForma = useCallback((forma: FormaPagamento): number => {
    switch (forma.tipo) {
      case 'ENTRADA':
        return forma.valor;
      case 'FINANCEIRA': {
        if (!forma.parcelas || !forma.taxaJuros) return forma.valor;
        const i = forma.taxaJuros / 100;
        return forma.valor / Math.pow(1 + i, forma.parcelas);
      }
      case 'CARTAO': {
        if (!forma.deflacao || !forma.jurosAntecipacao || !forma.parcelas) return forma.valor;
        const fatorDeflacao = 1 - (forma.deflacao / 100);
        const fatorJuros = 1 - (forma.jurosAntecipacao / 100 * forma.parcelas);
        return forma.valor * fatorDeflacao * fatorJuros;
      }
      case 'BOLETO': {
        if (!forma.parcelas || !forma.custoCapital) return forma.valor;
        const ic = forma.custoCapital / 100;
        return forma.valor / Math.pow(1 + ic, forma.parcelas);
      }
      default:
        return forma.valor;
    }
  }, []);

  const calcularDescontoReal = useCallback((valorBruto: number, valorRecebidoTotal: number): number => {
    if (valorBruto <= 0) return 0;
    return ((valorBruto - valorRecebidoTotal) / valorBruto) * 100;
  }, []);

  const calcularTotalRecebido = useCallback((formas: FormaPagamento[]): number => {
    return formas.reduce((acc, forma) => acc + forma.valorRecebido, 0);
  }, []);

  const calcularTotalFormas = useCallback((formas: FormaPagamento[]): number => {
    return formas.reduce((acc, forma) => acc + forma.valor, 0);
  }, []);

  // Função principal de recálculo
  const recalcularSimulacao = useCallback((novosDados: Partial<Simulacao>) => {
    setSimulacao(prev => {
      const updated = { ...prev, ...novosDados };
      
      // Recalcular desconto baseado em valorBruto e valorNegociado
      if (updated.valorBruto > 0 && !isNaN(updated.valorNegociado)) {
        const calculoDesconto = ((updated.valorBruto - updated.valorNegociado) / updated.valorBruto) * 100;
        // Arredondar para 2 casas decimais para evitar imprecisões
        updated.desconto = isNaN(calculoDesconto) ? 0 : Math.round(calculoDesconto * 100) / 100;
      } else {
        updated.desconto = 0;
      }

      // Atualizar valores recebidos das formas de pagamento
      const formasComRecebido = updated.formasPagamento.map(forma => ({
        ...forma,
        valorRecebido: calcularValorRecebidoForma(forma)
      }));

      updated.formasPagamento = formasComRecebido;
      updated.valorRecebidoTotal = calcularTotalRecebido(formasComRecebido);
      updated.descontoReal = calcularDescontoReal(updated.valorBruto, updated.valorRecebidoTotal);
      updated.valorRestante = updated.valorNegociado - calcularTotalFormas(formasComRecebido);

      return updated;
    });
  }, [calcularValorRecebidoForma, calcularDescontoReal, calcularTotalRecebido, calcularTotalFormas]);

  // Editar valor bruto (vem dos ambientes)
  const editarValorBruto = useCallback((novoValorBruto: number) => {
    if (isNaN(novoValorBruto) || novoValorBruto < 0) {
      novoValorBruto = 0;
    }
    
    // Se valorNegociado ainda é 0 ou igual ao valorBruto anterior, inicializar com o novo valor
    const novoValorNegociado = (simulacao.valorNegociado === 0 || simulacao.valorNegociado === simulacao.valorBruto) 
      ? novoValorBruto 
      : simulacao.valorNegociado;
    
    recalcularSimulacao({ 
      valorBruto: novoValorBruto, 
      valorNegociado: novoValorNegociado 
    });
  }, [recalcularSimulacao, simulacao.valorBruto, simulacao.valorNegociado]);

  // Editar valor negociado
  const editarValorNegociado = useCallback((novoValorNegociado: number) => {
    // Arredondar para 2 casas decimais para evitar problemas de precisão
    const valorArredondado = Math.round(novoValorNegociado * 100) / 100;
    recalcularSimulacao({ valorNegociado: valorArredondado });
  }, [recalcularSimulacao]);

  // Editar desconto real (implementação simples)
  const editarDescontoReal = useCallback((novoDescontoReal: number, shouldLock?: boolean) => {
    // Calcular novo valor negociado baseado no desconto desejado
    const novoValorNegociado = simulacao.valorBruto * (1 - novoDescontoReal / 100);
    
    setSimulacao(prev => ({
      ...prev,
      valorNegociado: novoValorNegociado,
      desconto: ((prev.valorBruto - novoValorNegociado) / prev.valorBruto) * 100,
      descontoReal: novoDescontoReal,
      travamentos: {
        ...prev.travamentos,
        descontoRealFixo: shouldLock || false,
        valorDescontoRealFixo: shouldLock ? novoDescontoReal : 0
      }
    }));
  }, [simulacao.valorBruto]);

  // Adicionar forma de pagamento
  const adicionarForma = useCallback((forma: Omit<FormaPagamento, 'id' | 'valorRecebido'>) => {
    const novaForma: FormaPagamento = {
      ...forma,
      id: Date.now().toString(),
      valorRecebido: calcularValorRecebidoForma({...forma, id: '', valorRecebido: 0, travado: false}),
      travado: false
    };

    setSimulacao(prev => {
      const novasFormas = [...prev.formasPagamento, novaForma];
      const valorRecebidoTotal = calcularTotalRecebido(novasFormas);
      const descontoReal = calcularDescontoReal(prev.valorBruto, valorRecebidoTotal);
      const valorRestante = prev.valorNegociado - calcularTotalFormas(novasFormas);

      return {
        ...prev,
        formasPagamento: novasFormas,
        valorRecebidoTotal,
        descontoReal,
        valorRestante
      };
    });
  }, [calcularValorRecebidoForma, calcularTotalRecebido, calcularDescontoReal, calcularTotalFormas]);

  // Remover forma de pagamento
  const removerForma = useCallback((id: string) => {
    setSimulacao(prev => {
      const novasFormas = prev.formasPagamento.filter(forma => forma.id !== id);
      const valorRecebidoTotal = calcularTotalRecebido(novasFormas);
      const descontoReal = calcularDescontoReal(prev.valorBruto, valorRecebidoTotal);
      const valorRestante = prev.valorNegociado - calcularTotalFormas(novasFormas);

      return {
        ...prev,
        formasPagamento: novasFormas,
        valorRecebidoTotal,
        descontoReal,
        valorRestante
      };
    });
  }, [calcularTotalRecebido, calcularDescontoReal, calcularTotalFormas]);

  // Limpar formas de pagamento
  const limparFormas = useCallback(() => {
    setSimulacao(prev => ({
      ...prev,
      formasPagamento: [],
      valorRecebidoTotal: 0,
      descontoReal: 0,
      valorRestante: prev.valorNegociado
    }));
  }, []);

  return {
    simulacao,
    recalcularSimulacao,
    editarValorBruto,
    editarValorNegociado,
    editarDescontoReal,
    adicionarForma,
    removerForma,
    limparFormas,
    loading: false,
    erro: null
  };
};