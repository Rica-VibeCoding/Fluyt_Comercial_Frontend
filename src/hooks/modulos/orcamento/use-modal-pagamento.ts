/**
 * HOOK CUSTOMIZADO - MODAL PAGAMENTO
 * Consolida toda a lógica comum dos modais de pagamento
 */

import { useState, useEffect, useCallback } from 'react';
import { formatarMoeda, parseValorMoeda, formatarDataInput, obterDataAtualInput } from '@/lib/formatters';
import { validarValorDisponivel, validarDataFutura, validarNumeroParcelas, validarTaxa } from '@/lib/validators';
import { getTaxaPadrao, getLimitesParcelas } from '@/lib/pagamento-config';

// Tipos para o hook
export interface DadosIniciais {
  valor?: number;
  data?: string;
  parcelas?: number;
  taxa?: number;
  vezes?: number;
  percentual?: number;
}

export interface UseModalPagamentoProps {
  isOpen: boolean;
  tipo: 'a-vista' | 'boleto' | 'cartao' | 'financeira';
  valorMaximo: number;
  valorJaAlocado: number;
  dadosIniciais?: DadosIniciais;
}

export interface UseModalPagamentoReturn {
  // Estados básicos
  valor: string;
  setValor: (valor: string) => void;
  numeroVezes: string;
  setNumeroVezes: (vezes: string) => void;
  data: string;
  setData: (data: string) => void;
  taxa: string;
  setTaxa: (taxa: string) => void;
  
  // Estados de controle
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  salvando: boolean;
  setSalvando: (salvando: boolean) => void;
  erroValidacao: string;
  setErroValidacao: (erro: string) => void;
  
  // Funções utilitárias
  limparCampos: () => void;
  resetarErro: () => void;
  validarFormulario: () => boolean;
  getValorNumerico: () => number;
  getNumeroVezesNumerico: () => number;
  getTaxaNumerica: () => number;
  
  // Configurações do tipo
  limitesConfig: { min: number; max: number };
  taxaPadraoConfig: number;
  
  // Estados computados
  isFormValido: boolean;
  valorRestante: number;
}

export const useModalPagamento = ({
  isOpen,
  tipo,
  valorMaximo,
  valorJaAlocado,
  dadosIniciais
}: UseModalPagamentoProps): UseModalPagamentoReturn => {
  
  // Estados básicos do formulário
  const [valor, setValor] = useState('');
  const [numeroVezes, setNumeroVezes] = useState('');
  const [data, setData] = useState('');
  const [taxa, setTaxa] = useState('');
  
  // Estados de controle
  const [isLoading, setIsLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroValidacao, setErroValidacao] = useState('');
  
  // Configurações baseadas no tipo (converter tipo para config)
  const tipoConfig = tipo === 'a-vista' ? 'aVista' as const : tipo;
  const limitesConfig = getLimitesParcelas(tipoConfig);
  const taxaPadraoConfig = tipo === 'cartao' || tipo === 'financeira' ? getTaxaPadrao(tipo) : 0;
  
  // Estados computados
  const valorRestante = valorMaximo - valorJaAlocado;
  const isFormValido = Boolean(valor && !erroValidacao && (tipo === 'a-vista' || numeroVezes));
  
  // Inicializar valores padrão baseados no tipo
  useEffect(() => {
    if (tipo === 'cartao' || tipo === 'financeira') {
      setTaxa(taxaPadraoConfig.toString().replace('.', ','));
    }
    if (tipo === 'a-vista') {
      setNumeroVezes('1');
    }
  }, [tipo, taxaPadraoConfig]);
  
  // Carregar dados iniciais quando modal abrir
  useEffect(() => {
    if (isOpen && dadosIniciais) {
      if (dadosIniciais.valor) {
        setValor(formatarMoeda(dadosIniciais.valor));
      }
      if (dadosIniciais.data) {
        setData(formatarDataInput(dadosIniciais.data));
      }
      if (dadosIniciais.parcelas || dadosIniciais.vezes) {
        setNumeroVezes((dadosIniciais.parcelas || dadosIniciais.vezes || 1).toString());
      }
      if (dadosIniciais.taxa || dadosIniciais.percentual) {
        const taxaValue = dadosIniciais.taxa || dadosIniciais.percentual || 0;
        setTaxa(taxaValue.toString().replace('.', ','));
      }
    } else if (isOpen) {
      limparCampos();
    }
  }, [isOpen, dadosIniciais]);
  
  // Função para limpar todos os campos
  const limparCampos = useCallback(() => {
    setValor('');
    setNumeroVezes(tipo === 'a-vista' ? '1' : '');
    // Para À Vista, inicializar com data atual. Outros tipos ficam vazios.
    setData(tipo === 'a-vista' ? obterDataAtualInput() : '');
    if (tipo === 'cartao' || tipo === 'financeira') {
      setTaxa(taxaPadraoConfig.toString().replace('.', ','));
    } else {
      setTaxa('');
    }
    setErroValidacao('');
  }, [tipo, taxaPadraoConfig]);
  
  // Função para resetar apenas erro
  const resetarErro = useCallback(() => {
    setErroValidacao('');
  }, []);
  
  // Funções para obter valores numéricos
  const getValorNumerico = useCallback(() => {
    return parseValorMoeda(valor);
  }, [valor]);
  
  const getNumeroVezesNumerico = useCallback(() => {
    return parseInt(numeroVezes) || 1;
  }, [numeroVezes]);
  
  const getTaxaNumerica = useCallback(() => {
    return parseFloat(taxa.replace(',', '.')) || 0;
  }, [taxa]);
  
  // Função de validação completa
  const validarFormulario = useCallback(() => {
    const valorNum = getValorNumerico();
    const vezesNum = getNumeroVezesNumerico();
    const taxaNum = getTaxaNumerica();
    
    // Validar valor
    const validacaoValor = validarValorDisponivel(valorNum, valorMaximo, valorJaAlocado);
    if (!validacaoValor.isValid) {
      setErroValidacao(validacaoValor.message || '');
      return false;
    }
    
    // Validar parcelas (exceto à vista)
    if (tipo !== 'a-vista') {
      const validacaoParcelas = validarNumeroParcelas(vezesNum, tipo);
      if (!validacaoParcelas.isValid) {
        setErroValidacao(validacaoParcelas.message || '');
        return false;
      }
    }
    
    // Validar taxa (para cartão e financeira)
    if (tipo === 'cartao' || tipo === 'financeira') {
      const validacaoTaxa = validarTaxa(taxaNum);
      if (!validacaoTaxa.isValid) {
        setErroValidacao(validacaoTaxa.message || '');
        return false;
      }
    }
    
    // Validar data (se fornecida)
    if (data) {
      const validacaoData = validarDataFutura(data);
      if (!validacaoData.isValid) {
        setErroValidacao(validacaoData.message || '');
        return false;
      }
    }
    
    setErroValidacao('');
    return true;
  }, [valor, numeroVezes, taxa, data, tipo, valorMaximo, valorJaAlocado, getValorNumerico, getNumeroVezesNumerico, getTaxaNumerica]);
  
  return {
    // Estados básicos
    valor,
    setValor,
    numeroVezes,
    setNumeroVezes,
    data,
    setData,
    taxa,
    setTaxa,
    
    // Estados de controle
    isLoading,
    setIsLoading,
    salvando,
    setSalvando,
    erroValidacao,
    setErroValidacao,
    
    // Funções utilitárias
    limparCampos,
    resetarErro,
    validarFormulario,
    getValorNumerico,
    getNumeroVezesNumerico,
    getTaxaNumerica,
    
    // Configurações do tipo
    limitesConfig,
    taxaPadraoConfig,
    
    // Estados computados
    isFormValido,
    valorRestante,
  };
};