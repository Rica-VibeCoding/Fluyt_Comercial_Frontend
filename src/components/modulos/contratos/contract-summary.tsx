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
import { DebugPersistenciaCompacto } from "../../shared/debug-persistencia";

const ContractSummary = () => {
  const router = useRouter();
  const { contratoData, updateField, updateStatus } = useContractDataManager();

  const handleFinalizarContrato = () => {
    console.log('🎯 Finalizando contrato:', contratoData);
    // TODO: Implementar lógica de finalização
  };

  const handleAvancar = () => {
    console.log('➡️ Avançando para próxima etapa');
    router.push('/painel/contratos/visualizar');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header com navegação e ações principais */}
        <HeaderSection 
          onFinalizarContrato={handleFinalizarContrato} 
          contratoData={contratoData}
          updateStatus={updateStatus}
        />

        {/* Alertas de validação */}
        <ValidationAlerts />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          
          {/* Dados do Cliente */}
          <div className="xl:col-span-1">
            <ClientDataCard 
              contratoData={contratoData} 
              updateField={updateField} 
            />
          </div>

          {/* Dados da Loja */}
          <div className="xl:col-span-1">
            <StoreDataCard 
              contratoData={contratoData} 
              updateField={updateField} 
            />
          </div>

          {/* Resumo Financeiro */}
          <div className="xl:col-span-2">
            <FinancialSummary 
              contratoData={contratoData} 
              updateField={updateField} 
            />
          </div>
        </div>

        {/* Ambientes Section */}
        <EnvironmentsList contratoData={contratoData} />

        {/* Action Bar */}
        <ActionBar 
          contratoData={contratoData} 
          onAvancar={handleAvancar} 
        />
        
        {/* Debug temporário - só para desenvolvimento */}
        <DebugPersistenciaCompacto />
      </div>
    </div>
  );
};

export default ContractSummary;