import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { User, Phone, Mail, MapPin } from "lucide-react";
import { EditableField } from "../editable-field";
import { ContratoData } from "../../../../types/contrato";
import { formatarTelefone, formatarCPFCNPJ } from "../shared/contract-formatters";

interface ClientDataCardProps {
  contratoData: ContratoData;
  updateField: (path: string, value: string | number) => void;
}

export function ClientDataCard({ contratoData, updateField }: ClientDataCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Dados do Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Nome Completo</label>
            <EditableField
              value={contratoData.cliente.nome}
              onSave={(value) => updateField('cliente.nome', value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">CPF/CNPJ</label>
            <EditableField
              value={formatarCPFCNPJ(contratoData.cliente.cpf)}
              onSave={(value) => updateField('cliente.cpf', value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Endereço Completo
          </label>
          <EditableField
            value={contratoData.cliente.endereco}
            onSave={(value) => updateField('cliente.endereco', value)}
            multiline
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Telefone
            </label>
            <EditableField
              value={formatarTelefone(contratoData.cliente.telefone)}
              onSave={(value) => updateField('cliente.telefone', value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-mail
            </label>
            <EditableField
              value={contratoData.cliente.email}
              onSave={(value) => updateField('cliente.email', value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}