import { useMemo } from 'react';
import { useSessao } from '../../../../store/sessao-store';

// Hook para validações específicas do contrato
export function useContractValidation() {
  const { cliente, ambientes, podeGerarOrcamento, podeGerarContrato } = useSessao();

  const validacoes = useMemo(() => {
    const erros: Array<{ tipo: 'cliente' | 'ambiente' | 'orcamento'; mensagem: string }> = [];

    // Validação de cliente
    if (!cliente) {
      erros.push({
        tipo: 'cliente',
        mensagem: 'Nenhum cliente selecionado. Selecione um cliente para continuar.'
      });
    }

    // Validação de ambientes
    if (ambientes.length === 0) {
      erros.push({
        tipo: 'ambiente',
        mensagem: 'Nenhum ambiente configurado. Configure pelo menos um ambiente para gerar o contrato.'
      });
    }

    // Validação de orçamento
    if (!podeGerarOrcamento) {
      erros.push({
        tipo: 'orcamento',
        mensagem: 'Orçamento incompleto. Finalize a configuração do orçamento antes de gerar o contrato.'
      });
    }

    return {
      erros,
      temErros: erros.length > 0,
      clienteValido: !!cliente,
      ambientesValidos: ambientes.length > 0,
      orcamentoValido: podeGerarOrcamento,
      contratoValido: podeGerarContrato && !!cliente && ambientes.length > 0
    };
  }, [cliente, ambientes, podeGerarOrcamento, podeGerarContrato]);

  return validacoes;
}