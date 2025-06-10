import { Alert, AlertDescription } from "../../../ui/alert";
import { AlertCircle, User, Building, Calculator } from "lucide-react";
import { useContractValidation } from "../shared/contract-validations";

export function ValidationAlerts() {
  const { erros, temErros } = useContractValidation();

  if (!temErros) return null;

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'cliente':
        return <User className="h-4 w-4" />;
      case 'ambiente':
        return <Building className="h-4 w-4" />;
      case 'orcamento':
        return <Calculator className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getVariant = (tipo: string) => {
    return tipo === 'cliente' ? 'destructive' : 'default';
  };

  return (
    <div className="space-y-4 mb-6">
      {erros.map((erro, index) => (
        <Alert key={index} variant={getVariant(erro.tipo)}>
          {getIcon(erro.tipo)}
          <AlertDescription>
            {erro.mensagem}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}