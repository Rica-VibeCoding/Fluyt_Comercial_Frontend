/**
 * Hook para redistribuição de valores entre formas de pagamento
 */

import { useCallback, useMemo } from 'react';
import { FormaPagamento } from '@/types/simulador';

export function useValorRedistributor() {
  // Prioridade para redistribuição de valores
  const PRIORIDADE_FORMAS = useMemo(() => ['ENTRADA', 'BOLETO', 'FINANCEIRA', 'CARTAO'], []);

  const redistribuirValores = useCallback((novoValorNegociado: number, formasAtuais: FormaPagamento[]) => {
    const somaAtual = formasAtuais.reduce((acc, forma) => acc + forma.valor, 0);
    const diferenca = novoValorNegociado - somaAtual;
    
    if (Math.abs(diferenca) < 0.01) {
      return formasAtuais; // Não há diferença significativa
    }
    
    // Separar formas travadas e não travadas
    const formasTravadas = formasAtuais.filter(forma => forma.travado);
    const formasNaoTravadas = formasAtuais.filter(forma => !forma.travado);
    
    // Se todas estão travadas, não podemos redistribuir
    if (formasNaoTravadas.length === 0) {
      return null; // Indica erro
    }
    
    // Ordenar formas não travadas por prioridade
    const formasOrdenadas = formasNaoTravadas.sort((a, b) => {
      const prioridadeA = PRIORIDADE_FORMAS.indexOf(a.tipo);
      const prioridadeB = PRIORIDADE_FORMAS.indexOf(b.tipo);
      return prioridadeA - prioridadeB;
    });
    
    // Redistribuir a diferença: apenas a primeira forma na ordem de prioridade absorve toda a diferença
    const novasFormas = [...formasAtuais];
    
    // Verificar se todas as formas não travadas têm valor zero
    const somaFormasNaoTravadas = formasOrdenadas.reduce((acc, forma) => acc + forma.valor, 0);
    
    if (somaFormasNaoTravadas === 0 && diferenca > 0) {
      // Distribuir uniformemente se todas têm valor zero
      const valorPorForma = diferenca / formasOrdenadas.length;
      formasOrdenadas.forEach(forma => {
        const index = novasFormas.findIndex(f => f.id === forma.id);
        if (index !== -1) {
          novasFormas[index] = { ...novasFormas[index], valor: valorPorForma };
        }
      });
    } else {
      // Usar sistema de prioridade: primeira forma absorve toda a diferença
      const formaPrioritaria = formasOrdenadas[0];
      const index = novasFormas.findIndex(f => f.id === formaPrioritaria.id);
      
      if (index !== -1) {
        const novoValor = Math.max(0, novasFormas[index].valor + diferenca);
        novasFormas[index] = { ...novasFormas[index], valor: novoValor };
      }
    }
    
    return novasFormas;
  }, [PRIORIDADE_FORMAS]);

  return {
    redistribuirValores,
    PRIORIDADE_FORMAS
  };
}