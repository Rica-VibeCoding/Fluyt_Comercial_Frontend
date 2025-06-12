/**
 * CALCULATORS COMPARTILHADOS
 * Funções de cálculos financeiros reutilizáveis
 */

// Calcular valor presente (fórmula: PV = FV / (1 + r)^n)
export const calcularValorPresente = (
  valorFuturo: number,
  taxa: number, // taxa percentual (ex: 3.5 para 3.5%)
  periodos: number
): number => {
  if (taxa === 0 || periodos === 0) return valorFuturo;
  
  const taxaDecimal = taxa / 100;
  return valorFuturo / Math.pow(1 + taxaDecimal, periodos);
};

// Calcular desconto percentual
export const calcularDescontoPercentual = (
  valorOriginal: number,
  valorComDesconto: number
): number => {
  if (valorOriginal === 0) return 0;
  return ((valorOriginal - valorComDesconto) / valorOriginal) * 100;
};

// Calcular valor com desconto
export const calcularValorComDesconto = (
  valorOriginal: number,
  percentualDesconto: number
): number => {
  return valorOriginal - (valorOriginal * percentualDesconto / 100);
};

// Calcular parcelas uniformes
export const calcularParcelas = (
  valorTotal: number,
  numeroParcelas: number,
  dataInicial: string
): Array<{ numero: number; valor: number; data: string }> => {
  const valorParcela = valorTotal / numeroParcelas;
  const parcelas = [];
  
  for (let i = 0; i < numeroParcelas; i++) {
    const data = new Date(dataInicial);
    data.setMonth(data.getMonth() + i);
    
    parcelas.push({
      numero: i + 1,
      valor: valorParcela,
      data: data.toISOString().split('T')[0]
    });
  }
  
  return parcelas;
};

// Calcular valor da parcela com juros compostos
export const calcularParcelaComJuros = (
  principal: number,
  taxaMensal: number, // taxa percentual mensal
  numeroParcelas: number
): number => {
  if (taxaMensal === 0) return principal / numeroParcelas;
  
  const taxaDecimal = taxaMensal / 100;
  const fator = Math.pow(1 + taxaDecimal, numeroParcelas);
  
  return (principal * taxaDecimal * fator) / (fator - 1);
};

// Calcular total de juros pagos
export const calcularTotalJuros = (
  valorParcela: number,
  numeroParcelas: number,
  principal: number
): number => {
  return (valorParcela * numeroParcelas) - principal;
};

// Calcular desconto real baseado em valor presente
export const calcularDescontoReal = (
  valorOriginal: number,
  valorPresenteRecebido: number
): number => {
  if (valorOriginal === 0) return 0;
  return ((valorOriginal - valorPresenteRecebido) / valorOriginal) * 100;
};

// Distribuir valor restante entre formas de pagamento (algoritmo simples)
export const distribuirValorRestante = (
  valorRestante: number,
  formas: Array<{ id: string; valor: number; travada?: boolean }>
): Array<{ id: string; valorSugerido: number }> => {
  const formasNaoTravadas = formas.filter(f => !f.travada);
  
  if (formasNaoTravadas.length === 0) {
    return [];
  }
  
  const valorPorForma = valorRestante / formasNaoTravadas.length;
  
  return formasNaoTravadas.map(f => ({
    id: f.id,
    valorSugerido: f.valor + valorPorForma
  }));
};