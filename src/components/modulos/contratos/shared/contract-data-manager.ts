import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSessao } from '../../../../store/sessao-store';
import { contratoMock, ContratoData } from '../../../../types/contrato';

// Hook para gerenciamento de dados do contrato
export function useContractDataManager() {
  const searchParams = useSearchParams();
  const { 
    cliente, 
    ambientes, 
    valorTotalAmbientes, 
    descontoReal,
    carregarSessaoCliente 
  } = useSessao();
  
  const [contratoData, setContratoData] = useState<ContratoData>(contratoMock);
  const [tentouRecuperar, setTentouRecuperar] = useState(false);

  // Tentar recuperar sessão automaticamente se cliente foi perdido
  useEffect(() => {
    const clienteId = searchParams.get('clienteId');
    
    if (!cliente && clienteId && !tentouRecuperar) {
      console.log('🔄 ContractDataManager - Tentando recuperar sessão perdida para cliente:', clienteId);
      setTentouRecuperar(true);
      carregarSessaoCliente(clienteId);
    }
  }, [cliente, searchParams, carregarSessaoCliente, tentouRecuperar]);

  // Sincronizar dados da sessão com o contrato
  useEffect(() => {
    console.log('🔍 ContractDataManager - Sincronizando dados da sessão:', {
      temCliente: !!cliente,
      clienteNome: cliente?.nome || 'null',
      quantidadeAmbientes: ambientes.length,
      valorTotalAmbientes,
      descontoReal
    });

    if (cliente && ambientes.length > 0) {
      // Usar desconto real da sessão ou valor padrão do mock
      const descontoParaUsar = descontoReal > 0 ? descontoReal / 100 : contratoMock.desconto;
      
      console.log('💰 ContractDataManager - Calculando desconto:', {
        descontoRealSessao: descontoReal,
        descontoUsado: descontoParaUsar,
        origem: descontoReal > 0 ? 'SESSÃO' : 'MOCK (10%)',
        percentualFinal: (descontoParaUsar * 100).toFixed(1) + '%'
      });
      
      setContratoData(prev => ({
        ...prev,
        cliente: {
          nome: cliente.nome,
          cpf: cliente.cpf_cnpj || '',
          endereco: `${cliente.logradouro}, ${cliente.numero} - ${cliente.bairro}, ${cliente.cidade}/${cliente.uf}`,
          telefone: cliente.telefone,
          email: cliente.email
        },
        valor_total: valorTotalAmbientes,
        desconto: descontoParaUsar,
        valor_final: valorTotalAmbientes * (1 - descontoParaUsar),
        ambientes: ambientes.map(ambiente => ({
          nome: ambiente.nome,
          categoria: 'Ambiente',
          descricao: `Ambiente com ${ambiente.acabamentos.length} acabamentos`,
          valor: ambiente.valorTotal
        }))
      }));
    } else {
      // Log quando não há dados suficientes
      console.log('⚠️ ContractDataManager - Dados insuficientes:', {
        temCliente: !!cliente,
        quantidadeAmbientes: ambientes.length,
        valorTotal: valorTotalAmbientes,
        clienteIdURL: searchParams.get('clienteId'),
        tentouRecuperar
      });
    }
  }, [cliente, ambientes, valorTotalAmbientes, descontoReal, searchParams, tentouRecuperar]);

  // Função para atualizar campos do contrato
  const updateField = useCallback((path: string, value: string | number) => {
    setContratoData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  }, []);

  return {
    contratoData,
    setContratoData,
    updateField,
    tentouRecuperar
  };
}