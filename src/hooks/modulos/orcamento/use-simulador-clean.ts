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
      
      // Arredondar valores principais
      if (updated.valorBruto !== undefined) {
        updated.valorBruto = Math.round(updated.valorBruto * 100) / 100;
      }
      if (updated.valorNegociado !== undefined) {
        updated.valorNegociado = Math.round(updated.valorNegociado * 100) / 100;
      }
      
      // Recalcular desconto baseado em valorBruto e valorNegociado
      if (updated.valorBruto > 0 && !isNaN(updated.valorNegociado)) {
        const calculoDesconto = ((updated.valorBruto - updated.valorNegociado) / updated.valorBruto) * 100;
        // Arredondar para 1 casa decimal para evitar imprecisões
        updated.desconto = isNaN(calculoDesconto) ? 0 : Math.round(calculoDesconto * 10) / 10;
      } else {
        updated.desconto = 0;
      }

      // Atualizar valores recebidos das formas de pagamento
      const formasComRecebido = updated.formasPagamento.map(forma => ({
        ...forma,
        valorRecebido: Math.round(calcularValorRecebidoForma(forma) * 100) / 100
      }));

      updated.formasPagamento = formasComRecebido;
      updated.valorRecebidoTotal = Math.round(calcularTotalRecebido(formasComRecebido) * 100) / 100;
      updated.descontoReal = Math.round(calcularDescontoReal(updated.valorBruto, updated.valorRecebidoTotal) * 10) / 10;
      updated.valorRestante = Math.round((updated.valorNegociado - calcularTotalFormas(formasComRecebido)) * 100) / 100;

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

  // Redistribuição de valores com prioridades (migrado do original)
  const redistribuirValores = useCallback((diferencaValor: number, formas: FormaPagamento[]): FormaPagamento[] => {
    // Se não há diferença para redistribuir, retornar as formas como estão
    if (Math.abs(diferencaValor) <= 0.01) {
      return [...formas];
    }

    // Se não há formas, não pode redistribuir
    if (formas.length === 0) {
      throw new Error('Não há formas de pagamento para redistribuir os valores.');
    }

    const PRIORIDADE_FORMAS = ['ENTRADA', 'BOLETO', 'FINANCEIRA', 'CARTAO'];
    const formasOrdenadas = [...formas].sort((a, b) => 
      PRIORIDADE_FORMAS.indexOf(a.tipo) - PRIORIDADE_FORMAS.indexOf(b.tipo)
    );

    // Verificar se há pelo menos uma forma não travada
    const formasDisponiveis = formasOrdenadas.filter(f => !f.travado);
    if (formasDisponiveis.length === 0) {
      throw new Error('Todas as formas de pagamento estão travadas. Destrave pelo menos uma para redistribuir.');
    }

    let diferenca = diferencaValor;
    const novasFormas = [...formasOrdenadas];

    // Tentar redistribuir nas formas disponíveis
    for (let i = 0; i < novasFormas.length && Math.abs(diferenca) > 0.01; i++) {
      const forma = novasFormas[i];
      
      if (forma.travado) continue;

      if (diferenca > 0) {
        // Aumentar valor da forma
        forma.valor += diferenca;
        diferenca = 0;
      } else {
        // Diminuir valor da forma
        const reducao = Math.min(forma.valor, Math.abs(diferenca));
        forma.valor = Math.max(0, forma.valor - reducao); // Não permitir valores negativos
        diferenca += reducao;
      }
    }

    // Se ainda há diferença significativa, criar uma nova forma ENTRADA
    if (Math.abs(diferenca) > 0.01) {
      // Se a diferença é positiva, adicionar uma nova forma ENTRADA
      if (diferenca > 0) {
        const novaEntrada: FormaPagamento = {
          id: Date.now().toString(),
          tipo: 'ENTRADA',
          valor: diferenca,
          travado: false,
          valorRecebido: diferenca // ENTRADA = valor direto
        };
        novasFormas.unshift(novaEntrada); // Adicionar no início (prioridade)
      } else {
        // Se a diferença é negativa e não conseguiu redistribuir completamente
        throw new Error(`Não foi possível redistribuir completamente. Diferença restante: R$ ${Math.abs(diferenca).toFixed(2)}`);
      }
    }

    return novasFormas;
  }, []);

  // Busca binária para encontrar valor negociado ideal (migrado do original)
  const encontrarValorNegociadoParaDesconto = useCallback((descontoDesejado: number, formas: FormaPagamento[]): number => {
    const { valorBruto } = simulacao;
    let menor = 0;
    let maior = valorBruto;
    let iteracoes = 0;
    const maxIteracoes = 25;
    const precisao = 0.05; // 0.05% de precisão

    while (iteracoes < maxIteracoes && (maior - menor) > 0.01) {
      iteracoes++;
      const valorTeste = (menor + maior) / 2;
      
      // Simular redistribuição com valor teste
      const diferencaTotal = calcularTotalFormas(formas);
      const diferencaValor = valorTeste - diferencaTotal;
      
      try {
        const formasTestadas = redistribuirValores(diferencaValor, formas);
        const valorRecebidoTeste = calcularTotalRecebido(formasTestadas.map(f => ({
          ...f,
          valorRecebido: calcularValorRecebidoForma(f)
        })));
        
        const descontoCalculado = calcularDescontoReal(valorBruto, valorRecebidoTeste);
        
        if (Math.abs(descontoCalculado - descontoDesejado) <= precisao) {
          return valorTeste;
        }
        
        if (descontoCalculado < descontoDesejado) {
          menor = valorTeste;
        } else {
          maior = valorTeste;
        }
      } catch {
        // Se não conseguir redistribuir, reduzir range
        maior = valorTeste;
      }
    }

    return (menor + maior) / 2;
  }, [simulacao, redistribuirValores, calcularTotalFormas, calcularTotalRecebido, calcularValorRecebidoForma, calcularDescontoReal]);

  // Editar desconto real - implementação correta baseada no código original
  const editarDescontoReal = useCallback((novoDescontoReal: number, shouldLock?: boolean) => {
    
    setSimulacao(prev => {
      // Validação básica
      if (novoDescontoReal < 0 || novoDescontoReal >= 100) {
        alert('Desconto deve estar entre 0% e 99.9%');
        return prev;
      }

      // Validação do limite de desconto
      if (novoDescontoReal > prev.travamentos.limiteDescontoReal) {
        const confirmar = window.confirm(
          `O desconto de ${novoDescontoReal.toFixed(1)}% excede o limite de ${prev.travamentos.limiteDescontoReal}%. Deseja continuar?`
        );
        if (!confirmar) return prev;
      }

      // Função auxiliar para calcular o desconto real dado um valor negociado
      const calcularDescontoRealParaValor = (valorNegociado: number): number => {
        const formasTemp = redistribuirValores(valorNegociado - calcularTotalFormas(prev.formasPagamento), prev.formasPagamento);
        if (!formasTemp || formasTemp.length === 0) return -1; // Indica erro
        
        const valorRecebidoTemp = formasTemp.reduce((acc, forma) => {
          const formaComRecebido = { ...forma, valorRecebido: calcularValorRecebidoForma(forma) };
          return acc + formaComRecebido.valorRecebido;
        }, 0);
        
        return prev.valorBruto > 0 ? ((prev.valorBruto - valorRecebidoTemp) / prev.valorBruto) * 100 : 0;
      };
      
      // Caso sem formas de pagamento - calcular baseado no valor recebido = 0
      if (prev.formasPagamento.length === 0) {
        // Com desconto real, valorRecebido = valorBruto * (1 - descontoReal/100)
        const valorRecebidoDesejado = prev.valorBruto * (1 - novoDescontoReal / 100);
        // Como não há formas, valorRecebido = 0, então o desconto real seria 100%
        // Para atingir o desconto real desejado, precisamos de um valor negociado específico
        const valorNegociadoNecessario = prev.valorBruto * (1 - novoDescontoReal / 100);
        
        return {
          ...prev,
          valorNegociado: valorNegociadoNecessario,
          descontoReal: novoDescontoReal,
          valorRecebidoTotal: 0,
          valorRestante: valorNegociadoNecessario,
          travamentos: {
            ...prev.travamentos,
            descontoRealFixo: shouldLock || false,
            valorDescontoRealFixo: shouldLock ? novoDescontoReal : 0
          }
        };
      }
      
      // Busca binária para encontrar o valor negociado que resulta no desconto real desejado
      let valorMin = 0;
      let valorMax = prev.valorBruto;
      let valorNegociadoOtimo = prev.valorNegociado;
      let melhorDiferenca = Infinity;
      let melhorDesconto = prev.descontoReal;
      
      
      // Máximo de 25 iterações para maior precisão
      for (let i = 0; i < 25; i++) {
        const valorTeste = (valorMin + valorMax) / 2;
        const descontoRealCalculado = calcularDescontoRealParaValor(valorTeste);
        
        if (descontoRealCalculado === -1) {
          // Erro na redistribuição, tentar valor maior
          valorMin = valorTeste;
          continue;
        }
        
        const diferenca = Math.abs(descontoRealCalculado - novoDescontoReal);
        
        // Se encontrou um resultado melhor, guardar
        if (diferenca < melhorDiferenca) {
          melhorDiferenca = diferenca;
          valorNegociadoOtimo = valorTeste;
          melhorDesconto = descontoRealCalculado;
        }
        
        // Se a diferença é muito pequena, parar
        if (diferenca < 0.05) {
          break;
        }
        
        // Detectar se estamos no limite físico
        if (i > 10 && melhorDiferenca > 2) {
          break;
        }
        
        // Ajustar os limites da busca
        if (descontoRealCalculado < novoDescontoReal) {
          // Desconto calculado é menor que o desejado, precisamos diminuir valor negociado
          valorMax = valorTeste;
        } else {
          // Desconto calculado é maior que o desejado, precisamos aumentar valor negociado
          valorMin = valorTeste;
        }
        
        // Verificar se o intervalo ficou muito pequeno
        if (Math.abs(valorMax - valorMin) < 100) {
          break;
        }
      }
      
      // Se a diferença ainda é muito grande, avisar o usuário
      if (melhorDiferenca > 1) {
        const confirmar = window.confirm(`Não foi possível atingir exatamente ${novoDescontoReal}% de desconto real.\nMelhor resultado possível: ${melhorDesconto.toFixed(1)}%\n\nDeseja aplicar mesmo assim?`);
        if (!confirmar) {
          return prev;
        }
      }
      
      // Aplicar o valor negociado ótimo encontrado
      const totalAtualFormas = calcularTotalFormas(prev.formasPagamento);
      const diferencaValor = valorNegociadoOtimo - totalAtualFormas;
      const formasRedistribuidas = redistribuirValores(diferencaValor, prev.formasPagamento);
      
      if (!formasRedistribuidas) {
        alert('Não é possível alterar o desconto real. Todas as formas de pagamento estão travadas.');
        return prev;
      }
      
      const updated = {
        ...prev,
        valorNegociado: Math.round(valorNegociadoOtimo * 100) / 100,
        formasPagamento: formasRedistribuidas.map(forma => ({
          ...forma,
          valorRecebido: Math.round(calcularValorRecebidoForma(forma) * 100) / 100
        })),
        travamentos: {
          ...prev.travamentos,
          descontoRealFixo: shouldLock || false,
          valorDescontoRealFixo: shouldLock ? novoDescontoReal : prev.travamentos.valorDescontoRealFixo
        }
      };
      
      // Recalcular valores derivados baseado no valor recebido (não no valor negociado)
      updated.valorRecebidoTotal = Math.round(updated.formasPagamento.reduce((acc, forma) => acc + forma.valorRecebido, 0) * 100) / 100;
      updated.descontoReal = Math.round((updated.valorBruto > 0 ? ((updated.valorBruto - updated.valorRecebidoTotal) / updated.valorBruto) * 100 : 0) * 10) / 10;
      
      const somaFormas = calcularTotalFormas(updated.formasPagamento);
      updated.valorRestante = Math.round((updated.valorNegociado - somaFormas) * 100) / 100;
      
      return updated;
    });
  }, [redistribuirValores, calcularValorRecebidoForma, calcularTotalFormas, calcularDescontoReal, calcularTotalRecebido]);

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

  // Alternar travamento de forma de pagamento
  const alternarTravamentoForma = useCallback((id: string) => {
    setSimulacao(prev => ({
      ...prev,
      formasPagamento: prev.formasPagamento.map(forma => 
        forma.id === id ? { ...forma, travado: !forma.travado } : forma
      )
    }));
  }, []);

  // Editar forma de pagamento específica
  const editarForma = useCallback((id: string, novosDados: Partial<FormaPagamento>) => {
    setSimulacao(prev => {
      const novasFormas = prev.formasPagamento.map(forma => {
        if (forma.id === id) {
          const formaAtualizada = { ...forma, ...novosDados };
          return {
            ...formaAtualizada,
            valorRecebido: calcularValorRecebidoForma(formaAtualizada)
          };
        }
        return forma;
      });

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

  // Resetar travamentos
  const resetarTravamentos = useCallback(() => {
    setSimulacao(prev => ({
      ...prev,
      travamentos: {
        ...prev.travamentos,
        valorNegociado: false,
        descontoRealFixo: false,
        valorDescontoRealFixo: 0
      },
      formasPagamento: prev.formasPagamento.map(forma => ({
        ...forma,
        travado: false
      }))
    }));
  }, []);

  // Configurar limite de desconto real
  const definirLimiteDescontoReal = useCallback((novoLimite: number) => {
    setSimulacao(prev => ({
      ...prev,
      travamentos: {
        ...prev.travamentos,
        limiteDescontoReal: novoLimite
      }
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
    editarForma,
    alternarTravamentoForma,
    resetarTravamentos,
    definirLimiteDescontoReal,
    loading: false,
    erro: null
  };
};