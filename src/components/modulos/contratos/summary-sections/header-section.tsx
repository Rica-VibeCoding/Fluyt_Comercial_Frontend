import { useRouter } from "next/navigation";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ClienteSelectorUniversal } from "../../../shared/cliente-selector-universal";
import { useSessao } from "../../../../store/sessao-store";
import { contratoMock } from "../../../../types/contrato";

interface HeaderSectionProps {
  onFinalizarContrato: () => void;
}

export function HeaderSection({ onFinalizarContrato }: HeaderSectionProps) {
  const router = useRouter();
  const { podeGerarContrato } = useSessao();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RASCUNHO':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'PRONTO':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ENVIADO':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ASSINADO':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'RASCUNHO':
        return 'Em Edição';
      case 'PRONTO':
        return 'Pronto para Apresentação';
      case 'ENVIADO':
        return 'Enviado para Assinatura';
      case 'ASSINADO':
        return 'Assinado e Finalizado';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border-0 p-4 min-h-[80px] flex items-center mb-4">
      <div className="flex items-center justify-between w-full">
        {/* Navegação e Cliente - ESQUERDA */}
        <div className="flex items-center gap-4">
          <Button 
            variant="default" 
            size="sm"
            onClick={() => router.push('/painel/orcamento/simulador')}
            className="gap-2 h-12 px-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="h-6 w-px bg-gray-300" />
          
          {/* Cliente selecionado ou seletor */}
          <div className="w-80">
            <ClienteSelectorUniversal 
              targetRoute="/painel/contratos"
              placeholder="Selecionar cliente..."
              integraSessao={true}
            />
          </div>
        </div>

        {/* Status e botões - DIREITA */}
        <div className="flex items-center gap-3">
          <Badge className={`${getStatusColor(contratoMock.status)} px-3 py-2 text-sm font-medium border h-12 flex items-center`}>
            {getStatusText(contratoMock.status)}
          </Badge>
          <Button 
            size="lg" 
            onClick={() => router.push('/painel/contratos/visualizar')} 
            disabled={!podeGerarContrato()}
            className="gap-3 h-12 px-6 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              !podeGerarContrato() 
                ? "Complete o orçamento com formas de pagamento para finalizar" 
                : "Finalizar contrato"
            }
          >
            Finalizar
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}