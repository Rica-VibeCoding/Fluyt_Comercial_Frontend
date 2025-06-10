import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Calculator, Clock, Package } from "lucide-react";
import { Badge } from "../../../ui/badge";
import { EditableField } from "../editable-field";
import { ContratoData } from "../../../../types/contrato";
import { formatarMoeda, formatarPercentual } from "../shared/contract-formatters";

interface FinancialSummaryProps {
  contratoData: ContratoData;
  updateField: (path: string, value: string | number) => void;
}

export function FinancialSummary({ contratoData, updateField }: FinancialSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-green-600" />
          Resumo Financeiro
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Valores principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Valor Total</p>
            <p className="text-xl font-bold text-gray-900">
              {formatarMoeda(contratoData.valor_total)}
            </p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Desconto</p>
            <p className="text-xl font-bold text-blue-600">
              {formatarPercentual(contratoData.desconto)}
            </p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Valor Final</p>
            <p className="text-xl font-bold text-green-600">
              {formatarMoeda(contratoData.valor_final)}
            </p>
          </div>
        </div>

        {/* Prazo de entrega */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Prazo de Entrega (dias)
          </label>
          <EditableField
            value={contratoData.prazo_entrega}
            onSave={(value) => updateField('prazo_entrega', Number(value))}
          />
        </div>

        {/* Estatísticas dos ambientes */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-purple-500" />
            <span className="font-medium">Estatísticas dos Ambientes</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <Badge variant="outline" className="w-full justify-center">
                {contratoData.ambientes.length} Ambientes
              </Badge>
            </div>
            
            <div className="text-center">
              <Badge variant="secondary" className="w-full justify-center">
                Ticket Médio: {formatarMoeda(contratoData.valor_total / contratoData.ambientes.length)}
              </Badge>
            </div>
            
            <div className="text-center">
              <Badge variant="outline" className="w-full justify-center text-green-600">
                Economia: {formatarMoeda(contratoData.valor_total - contratoData.valor_final)}
              </Badge>
            </div>
            
            <div className="text-center">
              <Badge variant="secondary" className="w-full justify-center text-orange-600">
                {contratoData.prazo_entrega} dias úteis
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}