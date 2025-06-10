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
      <Card className="shadow-md border-0 bg-white">
        <CardContent className="text-center py-8">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Nenhum ambiente configurado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border-0 bg-white">
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="flex items-center gap-2 text-base text-gray-900">
          <div className="w-6 h-6 bg-orange-50 rounded-md flex items-center justify-center">
            <Package className="h-3 w-3 text-orange-600" />
          </div>
          Ambientes Contratados
          <Badge variant="outline" className="ml-auto text-xs border-gray-200 text-gray-600">
            {contratoData.ambientes.length} {contratoData.ambientes.length === 1 ? 'ambiente' : 'ambientes'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4">
        <div className="space-y-2">
          {contratoData.ambientes.map((ambiente, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-medium text-gray-900 text-sm truncate">{ambiente.nome}</h4>
                  <Badge variant="outline" className="text-xs px-2 py-0 flex-shrink-0 border-gray-200 text-gray-600">
                    {ambiente.categoria}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{ambiente.descricao}</p>
              </div>
              <div className="ml-4 text-right flex-shrink-0">
                <span className="text-sm font-semibold text-green-600">
                  {formatarMoeda(ambiente.valor)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}