import { Button } from "../../../ui/button";
import { ArrowRight, FileText } from "lucide-react";
import { ContratoData } from "../../../../types/contrato";
import { formatarMoeda } from "../shared/contract-formatters";
import { useContractValidation } from "../shared/contract-validations";

interface ActionBarProps {
  contratoData: ContratoData;
  onAvancar: () => void;
}

export function ActionBar({ contratoData, onAvancar }: ActionBarProps) {
  const { contratoValido } = useContractValidation();

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Resumo rápido */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total de Ambientes</p>
            <p className="font-bold text-lg">{contratoData.ambientes.length}</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Valor Total</p>
            <p className="font-bold text-lg text-gray-900">
              {formatarMoeda(contratoData.valor_total)}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Valor Final</p>
            <p className="font-bold text-lg text-green-600">
              {formatarMoeda(contratoData.valor_final)}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Economia</p>
            <p className="font-bold text-lg text-blue-600">
              {formatarMoeda(contratoData.valor_total - contratoData.valor_final)}
            </p>
          </div>
        </div>

        {/* Botão de ação */}
        <Button 
          onClick={onAvancar}
          disabled={!contratoValido}
          size="lg"
          className="gap-2 bg-green-600 hover:bg-green-700 lg:w-auto w-full"
        >
          <FileText className="h-5 w-5" />
          Avançar para Assinatura
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}