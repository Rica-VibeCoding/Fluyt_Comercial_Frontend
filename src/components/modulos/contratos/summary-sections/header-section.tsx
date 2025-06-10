import { useRouter } from "next/navigation";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { ArrowLeft, FileText } from "lucide-react";
import { ClienteSelectorUniversal } from "../../../shared/cliente-selector-universal";
import { useSessao } from "../../../../store/sessao-store";
import { useContractValidation } from "../shared/contract-validations";

interface HeaderSectionProps {
  onFinalizarContrato: () => void;
}

export function HeaderSection({ onFinalizarContrato }: HeaderSectionProps) {
  const router = useRouter();
  const { cliente } = useSessao();
  const { contratoValido } = useContractValidation();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/painel/orcamento')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Orçamento
        </Button>
        
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h1 className="text-2xl font-bold">Resumo do Contrato</h1>
          {cliente && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Cliente: {cliente.nome}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ClienteSelectorUniversal targetRoute="/painel/contratos" />
        
        <Button 
          onClick={onFinalizarContrato}
          disabled={!contratoValido}
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          <FileText className="h-4 w-4" />
          Finalizar Contrato
        </Button>
      </div>
    </div>
  );
}