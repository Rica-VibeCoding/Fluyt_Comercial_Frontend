/**
 * Hook principal do simulador refatorado com componentes especializados
 */

import { useState, useCallback } from 'react';
import { FormaPagamento, Simulacao, TravamentoConfig } from '@/types/simulador';
import { useFormaPagamentoCalculator } from './use-forma-pagamento-calculator';
import { useValorRedistributor } from './use-valor-redistributor';
import { useDescontoRealCalculator } from './use-desconto-real-calculator';

export const useSimulador = () => {
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

  const { 
    calcularValorRecebidoForma, 
    calcularTotalFormas, 
    calcularTotalRecebido, 
    calcularDescontoReal 
  } = useFormaPagamentoCalculator();

  const { redistribuirValores } = useValorRedistributor();

  const { encontrarValorParaDescontoReal } = useDescontoRealCalculator({
    redistribuirValores,
    calcularValorRecebidoForma
  });

  const recalcularSimulacao = useCallback((novosDados: Partial<Simulacao>) => {
    setSimulacao(prev => {
      const updated = { ...prev, ...novosDados };
      
      // Recalcular valores derivados
      updated.desconto = updated.valorBruto > 0 ? ((updated.valorBruto - updated.valorNegociado) / updated.valorBruto) * 100 : 0;
      
      // Atualizar valor recebido de todas as formas
      const formasComRecebido = updated.formasPagamento.map(forma => ({
        ...forma,
        valorRecebido: calcularValorRecebidoForma(forma)
      }));
      
      updated.formasPagamento = formasComRecebido;
      updated.valorRecebidoTotal = calcularTotalRecebido(formasComRecebido);
      updated.descontoReal = calcularDescontoReal(updated.valorBruto, updated.valorRecebidoTotal);
      
      const somaFormas = calcularTotalFormas(formasComRecebido);
      updated.valorRestante = updated.valorNegociado - somaFormas;
      
      return updated;
    });
  }, [calcularValorRecebidoForma, calcularTotalFormas, calcularTotalRecebido, calcularDescontoReal]);

  const editarDescontoReal = useCallback((novoDescontoReal: number, shouldLock?: boolean) => {
    setSimulacao(prev => {
      const resultado = encontrarValorParaDescontoReal(
        novoDescontoReal,
        prev.valorBruto,
        prev.formasPagamento,
        prev.valorNegociado,
        prev.descontoReal
      );
      
      // Aplicar o valor encontrado
      const formasRedistribuidas = redistribuirValores(resultado.valorNegociado, prev.formasPagamento);
      if (!formasRedistribuidas) {
        return prev; // Erro na redistribuição
      }
      
      const formasComRecebido = formasRedistribuidas.map(forma => ({
        ...forma,
        valorRecebido: calcularValorRecebidoForma(forma)
      }));
      
      const updated = {
        ...prev,
        valorNegociado: resultado.valorNegociado,
        desconto: prev.valorBruto > 0 ? ((prev.valorBruto - resultado.valorNegociado) / prev.valorBruto) * 100 : 0,
        formasPagamento: formasComRecebido,
        valorRecebidoTotal: calcularTotalRecebido(formasComRecebido),
        descontoReal: resultado.descontoReal,
        valorRestante: resultado.valorNegociado - calcularTotalFormas(formasComRecebido),
        travamentos: {
          ...prev.travamentos,
          descontoRealFixo: shouldLock ?? prev.travamentos.descontoRealFixo,
          valorDescontoRealFixo: shouldLock ? novoDescontoReal : prev.travamentos.valorDescontoRealFixo
        }
      };
      
      return updated;
    });
  }, [encontrarValorParaDescontoReal, redistribuirValores, calcularValorRecebidoForma, calcularTotalFormas, calcularTotalRecebido]);

  const editarValorNegociado = useCallback((novoValorNegociado: number) => {
    setSimulacao(prev => {
      const formasRedistribuidas = redistribuirValores(novoValorNegociado, prev.formasPagamento);
      if (!formasRedistribuidas) {
        return prev; // Erro na redistribuição
      }
      
      const formasComRecebido = formasRedistribuidas.map(forma => ({
        ...forma,
        valorRecebido: calcularValorRecebidoForma(forma)
      }));
      
      const updated = {
        ...prev,
        valorNegociado: novoValorNegociado,
        desconto: prev.valorBruto > 0 ? ((prev.valorBruto - novoValorNegociado) / prev.valorBruto) * 100 : 0,
        formasPagamento: formasComRecebido,
        valorRecebidoTotal: calcularTotalRecebido(formasComRecebido),
        descontoReal: calcularDescontoReal(prev.valorBruto, calcularTotalRecebido(formasComRecebido)),
        valorRestante: novoValorNegociado - calcularTotalFormas(formasComRecebido)
      };
      
      return updated;
    });
  }, [redistribuirValores, calcularValorRecebidoForma, calcularTotalFormas, calcularTotalRecebido, calcularDescontoReal]);

  const editarValorBruto = useCallback((novoValorBruto: number) => {
    setSimulacao(prev => {
      const novoValorNegociado = novoValorBruto * (1 - prev.desconto / 100);
      
      const formasRedistribuidas = redistribuirValores(novoValorNegociado, prev.formasPagamento);
      if (!formasRedistribuidas) {
        return { ...prev, valorBruto: novoValorBruto, valorNegociado: novoValorNegociado };
      }
      
      const formasComRecebido = formasRedistribuidas.map(forma => ({
        ...forma,
        valorRecebido: calcularValorRecebidoForma(forma)
      }));
      
      const updated = {
        ...prev,
        valorBruto: novoValorBruto,
        valorNegociado: novoValorNegociado,
        formasPagamento: formasComRecebido,
        valorRecebidoTotal: calcularTotalRecebido(formasComRecebido),
        descontoReal: calcularDescontoReal(novoValorBruto, calcularTotalRecebido(formasComRecebido)),
        valorRestante: novoValorNegociado - calcularTotalFormas(formasComRecebido)
      };
      
      return updated;
    });
  }, [redistribuirValores, calcularValorRecebidoForma, calcularTotalFormas, calcularTotalRecebido, calcularDescontoReal]);

  const adicionarForma = useCallback((forma: Omit<FormaPagamento, 'id' | 'valorRecebido'>) => {
    setSimulacao(prev => {
      // Verificar limite de desconto real
      if (prev.travamentos.limiteDescontoReal > 0) {
        const novaFormaTemp = {
          ...forma,
          id: 'temp',
          valorRecebido: 0,
          travado: false
        };
        novaFormaTemp.valorRecebido = calcularValorRecebidoForma(novaFormaTemp);
        
        const novoValorRecebidoTotal = prev.valorRecebidoTotal + novaFormaTemp.valorRecebido;
        const novoDescontoReal = calcularDescontoReal(prev.valorBruto, novoValorRecebidoTotal);
        
        if (novoDescontoReal > prev.travamentos.limiteDescontoReal) {
          alert(`Não é possível adicionar esta forma. O desconto real excederia o limite de ${prev.travamentos.limiteDescontoReal}%`);
          return prev;
        }
      }
      
      const novaForma: FormaPagamento = {
        ...forma,
        id: Date.now().toString(),
        valorRecebido: 0,
        travado: false
      };
      
      novaForma.valorRecebido = calcularValorRecebidoForma(novaForma);
      
      const novasFormas = [...prev.formasPagamento, novaForma];
      const updated = { 
        ...prev, 
        formasPagamento: novasFormas,
        valorRecebidoTotal: calcularTotalRecebido(novasFormas),
        valorRestante: prev.valorNegociado - calcularTotalFormas(novasFormas)
      };
      
      updated.descontoReal = calcularDescontoReal(updated.valorBruto, updated.valorRecebidoTotal);
      
      return updated;
    });
  }, [calcularValorRecebidoForma, calcularTotalFormas, calcularTotalRecebido, calcularDescontoReal]);

  const atualizarForma = useCallback((id: string, dadosAtualizados: Omit<FormaPagamento, 'id' | 'valorRecebido'>) => {
    setSimulacao(prev => {
      const novasFormas = prev.formasPagamento.map(forma => {
        if (forma.id === id) {
          // Se a forma está travada, não permite alterar o valor
          if (forma.travado && dadosAtualizados.valor !== forma.valor) {
            return forma;
          }
          
          const formaAtualizada = { ...forma, ...dadosAtualizados };
          formaAtualizada.valorRecebido = calcularValorRecebidoForma(formaAtualizada);
          return formaAtualizada;
        }
        return forma;
      });
      
      const updated = {
        ...prev,
        formasPagamento: novasFormas,
        valorRecebidoTotal: calcularTotalRecebido(novasFormas),
        valorRestante: prev.valorNegociado - calcularTotalFormas(novasFormas)
      };
      
      updated.descontoReal = calcularDescontoReal(updated.valorBruto, updated.valorRecebidoTotal);
      
      return updated;
    });
  }, [calcularValorRecebidoForma, calcularTotalFormas, calcularTotalRecebido, calcularDescontoReal]);

  const removerForma = useCallback((id: string) => {
    setSimulacao(prev => {
      const novasFormas = prev.formasPagamento.filter(forma => forma.id !== id);
      const updated = {
        ...prev,
        formasPagamento: novasFormas,
        valorRecebidoTotal: calcularTotalRecebido(novasFormas),
        valorRestante: prev.valorNegociado - calcularTotalFormas(novasFormas)
      };
      
      updated.descontoReal = calcularDescontoReal(updated.valorBruto, updated.valorRecebidoTotal);
      
      return updated;
    });
  }, [calcularTotalFormas, calcularTotalRecebido, calcularDescontoReal]);

  const limparFormas = useCallback(() => {
    setSimulacao(prev => ({
      ...prev,
      formasPagamento: [],
      valorRecebidoTotal: 0,
      descontoReal: 0,
      valorRestante: prev.valorNegociado
    }));
  }, []);

  const alternarTravamento = useCallback((campo: keyof TravamentoConfig, valor?: boolean) => {
    setSimulacao(prev => ({
      ...prev,
      travamentos: {
        ...prev.travamentos,
        [campo]: valor !== undefined ? valor : !prev.travamentos[campo]
      }
    }));
  }, []);

  const alternarTravamentoForma = useCallback((id: string) => {
    setSimulacao(prev => ({
      ...prev,
      formasPagamento: prev.formasPagamento.map(forma => 
        forma.id === id ? { ...forma, travado: !forma.travado } : forma
      )
    }));
  }, []);

  return {
    simulacao,
    recalcularSimulacao,
    adicionarForma,
    atualizarForma,
    removerForma,
    limparFormas,
    alternarTravamento,
    alternarTravamentoForma,
    editarValorNegociado,
    editarValorBruto,
    editarDescontoReal
  };
};