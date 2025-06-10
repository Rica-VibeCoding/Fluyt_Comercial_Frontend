import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Package } from "lucide-react";
import { Badge } from "../../../ui/badge";
import { ContratoData } from "../../../../types/contrato";
import { formatarMoeda } from "../shared/contract-formatters";

interface EnvironmentsListProps {
  contratoData: ContratoData;
}

export function EnvironmentsList({ contratoData }: EnvironmentsListProps) {
  if (contratoData.ambientes.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Nenhum ambiente configurado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-purple-600" />
          Ambientes Contratados ({contratoData.ambientes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {contratoData.ambientes.map((ambiente, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">{ambiente.nome}</h4>
                  <Badge variant="outline" className="text-xs">
                    {ambiente.categoria}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{ambiente.descricao}</p>
              </div>
              
              <div className="text-right ml-4">
                <p className="font-semibold text-green-600">
                  {formatarMoeda(ambiente.valor)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}