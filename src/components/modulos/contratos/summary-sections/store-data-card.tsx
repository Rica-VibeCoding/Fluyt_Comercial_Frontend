import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Building, User, Mail, Phone } from "lucide-react";
import { EditableField } from "../editable-field";
import { ContratoData } from "../../../../types/contrato";
import { formatarTelefone } from "../shared/contract-formatters";

interface StoreDataCardProps {
  contratoData: ContratoData;
  updateField: (path: string, value: string | number) => void;
}

export function StoreDataCard({ contratoData, updateField }: StoreDataCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-orange-600" />
          Dados da Loja
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Nome da Empresa</label>
            <EditableField
              value={contratoData.loja.nome}
              onSave={(value) => updateField('loja.nome', value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">CNPJ</label>
            <EditableField
              value={contratoData.loja.cnpj}
              onSave={(value) => updateField('loja.cnpj', value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Building className="h-4 w-4" />
            Endereço da Loja
          </label>
          <EditableField
            value={contratoData.loja.endereco}
            onSave={(value) => updateField('loja.endereco', value)}
            multiline
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Telefone da Loja
            </label>
            <EditableField
              value={formatarTelefone(contratoData.loja.telefone)}
              onSave={(value) => updateField('loja.telefone', value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-mail da Loja
            </label>
            <EditableField
              value={contratoData.loja.email}
              onSave={(value) => updateField('loja.email', value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Vendedor Responsável
            </label>
            <EditableField
              value={contratoData.vendedor}
              onSave={(value) => updateField('vendedor', value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Gerente Responsável
            </label>
            <EditableField
              value={contratoData.gerente}
              onSave={(value) => updateField('gerente', value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}