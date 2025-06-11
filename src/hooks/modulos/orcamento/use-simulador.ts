/**
 * Hook principal do simulador usando Zustand store
 */

import { useCallback, useEffect } from 'react';
import { FormaPagamento } from '@/types/simulador';
import { useOrcamentoStore } from '@/store/orcamento-store';
import { useFormaPagamentoCalculator } from './use-forma-pagamento-calculator';
import { useValorRedistributor } from './use-valor-redistributor';
import { useDescontoRealCalculator } from './use-desconto-real-calculator';

export const useSimulador = () => {
  const store = useOrcamentoStore();
  
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


  const recalcularSimulacao = useCallback((novosDados: Partial<typeof store.simulacao>) => {
    const updated = { ...store.simulacao, ...novosDados };
    
    // Se valorBruto foi alterado e valorNegociado é 0, inicializar valorNegociado = valorBruto
    if (novosDados.valorBruto !== undefined && updated.valorNegociado === 0) {
      updated.valorNegociado = updated.valorBruto;
    }
    
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
    
    store.setSimulacao(updated);
  }, [store, calcularValorRecebidoForma, calcularTotalFormas, calcularTotalRecebido, calcularDescontoReal]);

  const editarDescontoReal = useCallback((novoDescontoReal: number, shouldLock?: boolean) => {
    const resultado = encontrarValorParaDescontoReal(
      novoDescontoReal,
      store.simulacao.valorBruto,
      store.simulacao.formasPagamento,
      store.simulacao.valorNegociado,
      store.simulacao.descontoReal
    );
    
    // Aplicar o valor encontrado
    const formasRedistribuidas = redistribuirValores(resultado.valorNegociado, store.simulacao.formasPagamento);
    if (!formasRedistribuidas) {
      return; // Erro na redistribuição
    }
    
    const formasComRecebido = formasRedistribuidas.map(forma => ({
      ...forma,
      valorRecebido: calcularValorRecebidoForma(forma)
    }));
    
    const updated = {
      ...store.simulacao,
      valorNegociado: resultado.valorNegociado,
      desconto: store.simulacao.valorBruto > 0 ? ((store.simulacao.valorBruto - resultado.valorNegociado) / store.simulacao.valorBruto) * 100 : 0,
      formasPagamento: formasComRecebido,
      valorRecebidoTotal: calcularTotalRecebido(formasComRecebido),
      descontoReal: resultado.descontoReal,
      valorRestante: resultado.valorNegociado - calcularTotalFormas(formasComRecebido),
      travamentos: {
        ...store.simulacao.travamentos,
        descontoRealFixo: shouldLock ?? store.simulacao.travamentos.descontoRealFixo,
        valorDescontoRealFixo: shouldLock ? novoDescontoReal : store.simulacao.travamentos.valorDescontoRealFixo
      }
    };
    
    store.setSimulacao(updated);
  }, [store, encontrarValorParaDescontoReal, redistribuirValores, calcularValorRecebidoForma, calcularTotalFormas, calcularTotalRecebido]);

  const editarValorNegociado = useCallback((novoValorNegociado: number) => {
    const formasRedistribuidas = redistribuirValores(novoValorNegociado, store.simulacao.formasPagamento);
    if (!formasRedistribuidas) {
      return; // Erro na redistribuição
    }
    
    const formasComRecebido = formasRedistribuidas.map(forma => ({
      ...forma,
      valorRecebido: calcularValorRecebidoForma(forma)
    }));
    
    const updated = {
      ...store.simulacao,
      valorNegociado: novoValorNegociado,
      desconto: store.simulacao.valorBruto > 0 ? ((store.simulacao.valorBruto - novoValorNegociado) / store.simulacao.valorBruto) * 100 : 0,
      formasPagamento: formasComRecebido,
      valorRecebidoTotal: calcularTotalRecebido(formasComRecebido),
      descontoReal: calcularDescontoReal(store.simulacao.valorBruto, calcularTotalRecebido(formasComRecebido)),
      valorRestante: novoValorNegociado - calcularTotalFormas(formasComRecebido)
    };
    
    store.setSimulacao(updated);
  }, [store, redistribuirValores, calcularValorRecebidoForma, calcularTotalFormas, calcularTotalRecebido, calcularDescontoReal]);

  const editarValorBruto = useCallback((novoValorBruto: number) => {
    const novoValorNegociado = novoValorBruto * (1 - store.simulacao.desconto / 100);
    
    const formasRedistribuidas = redistribuirValores(novoValorNegociado, store.simulacao.formasPagamento);
    if (!formasRedistribuidas) {
      store.atualizarSimulacao({ valorBruto: novoValorBruto, valorNegociado: novoValorNegociado });
      return;
    }
    
    const formasComRecebido = formasRedistribuidas.map(forma => ({
      ...forma,
      valorRecebido: calcularValorRecebidoForma(forma)
    }));
    
    const updated = {
      ...store.simulacao,
      valorBruto: novoValorBruto,
      valorNegociado: novoValorNegociado,
      formasPagamento: formasComRecebido,
      valorRecebidoTotal: calcularTotalRecebido(formasComRecebido),
      descontoReal: calcularDescontoReal(novoValorBruto, calcularTotalRecebido(formasComRecebido)),
      valorRestante: novoValorNegociado - calcularTotalFormas(formasComRecebido)
    };
    
    store.setSimulacao(updated);
  }, [store, redistribuirValores, calcularValorRecebidoForma, calcularTotalFormas, calcularTotalRecebido, calcularDescontoReal]);

  const adicionarForma = useCallback((forma: Omit<FormaPagamento, 'id' | 'valorRecebido'>) => {
    // Verificar limite de desconto real
    if (store.simulacao.travamentos.limiteDescontoReal > 0) {
      const novaFormaTemp = {
        ...forma,
        id: 'temp',
        valorRecebido: 0,
        travado: false
      };
      novaFormaTemp.valorRecebido = calcularValorRecebidoForma(novaFormaTemp);
      
      const novoValorRecebidoTotal = store.simulacao.valorRecebidoTotal + novaFormaTemp.valorRecebido;
      const novoDescontoReal = calcularDescontoReal(store.simulacao.valorBruto, novoValorRecebidoTotal);
      
      if (novoDescontoReal > store.simulacao.travamentos.limiteDescontoReal) {
        alert(`Não é possível adicionar esta forma. O desconto real excederia o limite de ${store.simulacao.travamentos.limiteDescontoReal}%`);
        return;
      }
    }
    
    const novaForma: FormaPagamento = {
      ...forma,
      id: Date.now().toString(),
      valorRecebido: calcularValorRecebidoForma({...forma, id: '', valorRecebido: 0, travado: false}),
      travado: false
    };
    
    const novasFormas = [...store.simulacao.formasPagamento, novaForma];
    const updated = { 
      ...store.simulacao, 
      formasPagamento: novasFormas,
      valorRecebidoTotal: calcularTotalRecebido(novasFormas),
      valorRestante: store.simulacao.valorNegociado - calcularTotalFormas(novasFormas)
    };
    
    updated.descontoReal = calcularDescontoReal(updated.valorBruto, updated.valorRecebidoTotal);
    
    store.setSimulacao(updated);
  }, [store, calcularValorRecebidoForma, calcularTotalFormas, calcularTotalRecebido, calcularDescontoReal]);

  const atualizarForma = useCallback((id: string, dadosAtualizados: Omit<FormaPagamento, 'id' | 'valorRecebido'>) => {
    const novasFormas = store.simulacao.formasPagamento.map(forma => {
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
      ...store.simulacao,
      formasPagamento: novasFormas,
      valorRecebidoTotal: calcularTotalRecebido(novasFormas),
      valorRestante: store.simulacao.valorNegociado - calcularTotalFormas(novasFormas)
    };
    
    updated.descontoReal = calcularDescontoReal(updated.valorBruto, updated.valorRecebidoTotal);
    
    store.setSimulacao(updated);
  }, [store, calcularValorRecebidoForma, calcularTotalFormas, calcularTotalRecebido, calcularDescontoReal]);

  const removerForma = useCallback((id: string) => {
    const novasFormas = store.simulacao.formasPagamento.filter(forma => forma.id !== id);
    const updated = {
      ...store.simulacao,
      formasPagamento: novasFormas,
      valorRecebidoTotal: calcularTotalRecebido(novasFormas),
      valorRestante: store.simulacao.valorNegociado - calcularTotalFormas(novasFormas)
    };
    
    updated.descontoReal = calcularDescontoReal(updated.valorBruto, updated.valorRecebidoTotal);
    
    store.setSimulacao(updated);
  }, [store, calcularTotalFormas, calcularTotalRecebido, calcularDescontoReal]);

  return {
    simulacao: store.simulacao,
    loading: store.loading,
    erro: store.erro,
    
    // Ações refatoradas
    recalcularSimulacao,
    adicionarForma,
    atualizarForma,
    removerForma,
    limparFormas: store.limparFormasPagamento,
    alternarTravamento: store.alternarTravamento,
    alternarTravamentoForma: store.alternarTravamentoForma,
    resetarTravamentos: store.resetarTravamentos,
    editarValorNegociado,
    editarValorBruto,
    editarDescontoReal,
    
    // Computados
    podeGerarOrcamento: store.podeGerarOrcamento,
    valorTotalFormas: store.valorTotalFormas,
    descontoAplicado: store.descontoAplicado,
    
    // UI actions
    setLoading: store.setLoading,
    setErro: store.setErro
  };
};