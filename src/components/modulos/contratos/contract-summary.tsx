'use client';

import { useRouter } from "next/navigation";
import { useContractDataManager } from "./shared/contract-data-manager";

// Seções modulares
import { HeaderSection } from "./summary-sections/header-section";
import { ValidationAlerts } from "./summary-sections/validation-alerts";
import { ClientDataCard } from "./summary-sections/client-data-card";
import { StoreDataCard } from "./summary-sections/store-data-card";
import { FinancialSummary } from "./summary-sections/financial-summary";
import { EnvironmentsList } from "./summary-sections/environments-list";
import { ActionBar } from "./summary-sections/action-bar";

const ContractSummary = () => {
  const router = useRouter();
  const { contratoData, updateField } = useContractDataManager();

  const handleFinalizarContrato = () => {
    console.log('🎯 Finalizando contrato:', contratoData);
    // TODO: Implementar lógica de finalização
  };

  const handleAvancar = () => {
    console.log('➡️ Avançando para próxima etapa');
    router.push('/painel/contratos/visualizar');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header com navegação e ações principais */}
        <HeaderSection onFinalizarContrato={handleFinalizarContrato} />

        {/* Alertas de validação */}
        <ValidationAlerts />

        {/* Conteúdo principal em grade responsiva */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Dados do Cliente */}
          <ClientDataCard 
            contratoData={contratoData} 
            updateField={updateField} 
          />

          {/* Dados da Loja */}
          <StoreDataCard 
            contratoData={contratoData} 
            updateField={updateField} 
          />
        </div>

        {/* Resumo Financeiro */}
        <div className="mb-6">
          <FinancialSummary 
            contratoData={contratoData} 
            updateField={updateField} 
          />
        </div>

        {/* Lista de Ambientes */}
        <div className="mb-6">
          <EnvironmentsList contratoData={contratoData} />
        </div>

        {/* Barra de ação sticky */}
        <ActionBar 
          contratoData={contratoData} 
          onAvancar={handleAvancar} 
        />
      </div>
    </div>
  );
};

export default ContractSummary;