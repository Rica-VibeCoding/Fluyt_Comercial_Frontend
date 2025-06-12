/**
 * FORMATTERS COMPARTILHADOS
 * Funções de formatação reutilizáveis em todo o sistema
 */

// Formatar valor em moeda brasileira
export const formatarMoeda = (valor: number): string => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

// Formatar valor de input para moeda (para campos de entrada)
export const formatarValorInput = (value: string): string => {
  const numero = value.replace(/\D/g, '');
  const valorNumerico = parseInt(numero) / 100;
  return valorNumerico.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

// Formatar percentual
export const formatarPercentual = (valor: number, casasDecimais: number = 1): string => {
  return `${valor.toFixed(casasDecimais)}%`;
};

// Formatar taxa de input (para campos de entrada)
export const formatarTaxaInput = (value: string): string => {
  // Permite apenas números e vírgula/ponto
  const numero = value.replace(/[^\d,.]/, '').replace('.', ',');
  
  // Limita a 2 casas decimais
  const partes = numero.split(',');
  if (partes[1] && partes[1].length > 2) {
    partes[1] = partes[1].substring(0, 2);
  }
  
  return partes.join(',');
};

// Formatar data para padrão brasileiro
export const formatarData = (data: string | Date): string => {
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  return dataObj.toLocaleDateString('pt-BR');
};

// Formatar data para input (YYYY-MM-DD)
export const formatarDataInput = (data: string | Date): string => {
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  return dataObj.toISOString().split('T')[0];
};

// Converter valor formatado para número
export const parseValorMoeda = (valorFormatado: string): number => {
  return parseFloat(valorFormatado.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
};

// Converter taxa formatada para número
export const parseTaxa = (taxaFormatada: string): number => {
  return parseFloat(taxaFormatada.replace(',', '.')) || 0;
};