/**
 * Hook de dados para formas de pagamento
 * 
 * EQUIPE B (Claude Code) - ETAPA 9
 * Hook especializado para gerenciamento das formas de pagamento
 */

import { useOrcamentoStore } from '@/store/orcamento-store';
import { FormaPagamento } from '@/types/orcamento';

export const useFormasPagamento = () => {
  const store = useOrcamentoStore();
  
  // Proteger contra erros de hidratação
  if (typeof window === 'undefined') {
    return {
      formasPagamento: [],
      adicionarFormaPagamento: () => {},
      editarFormaPagamento: () => {},
      removerFormaPagamento: () => {},
      toggleTravamentoForma: () => {},
      valorTotalFormas: 0,
      valorPresenteTotal: 0
    };
  }
  
  return {
    // Estados
    formasPagamento: store.formasPagamento,
    valorTotalFormas: store.valorTotalFormas,
    valorPresenteTotal: store.valorPresenteTotal,
    
    // Ações
    adicionarFormaPagamento: store.adicionarFormaPagamento,
    editarFormaPagamento: store.editarFormaPagamento,
    removerFormaPagamento: store.removerFormaPagamento,
    toggleTravamentoForma: store.toggleTravamentoForma,
    
    // Estados dos modais
    modalFormasAberto: store.modalFormasAberto,
    modalAVistaAberto: store.modalAVistaAberto,
    modalBoletoAberto: store.modalBoletoAberto,
    modalCartaoAberto: store.modalCartaoAberto,
    modalFinanceiraAberto: store.modalFinanceiraAberto,
    formaEditando: store.formaEditando,
    
    // Ações dos modais
    abrirModalFormas: store.abrirModalFormas,
    fecharModalFormas: store.fecharModalFormas,
    abrirModalEdicao: store.abrirModalEdicao,
    fecharModalEdicao: store.fecharModalEdicao
  };
};