import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { TrendingUp, Users, UserPlus } from 'lucide-react';

interface ClienteHeaderProps {
  totalClientes: number;
  onNovoCliente: () => void;
}

export function ClienteHeader({
  totalClientes,
  onNovoCliente
}: ClienteHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Header principal */}
      <div className="flex items-center justify-end mb-4">
        <Button 
          onClick={onNovoCliente} 
          size="lg" 
          className="gap-3 h-12 px-6 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl font-semibold text-white"
        >
          <UserPlus className="h-5 w-5" />
          Novo Cliente
        </Button>
      </div>

      {/* Cards de estatísticas - Padrão Contratos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="shadow-md border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 h-fit hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <div className="w-5 h-5 bg-blue-50 rounded flex items-center justify-center">
                <Users className="h-3 w-3 text-blue-600" />
              </div>
              Total de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 px-4 pb-4">
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              {totalClientes.toLocaleString('pt-BR')}
            </div>
            <Badge variant="secondary" className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% este mês
            </Badge>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 h-fit hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <div className="w-5 h-5 bg-green-50 rounded flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-green-600" />
              </div>
              Clientes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 px-4 pb-4">
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              {Math.floor(totalClientes * 0.85).toLocaleString('pt-BR')}
            </div>
            <Badge variant="secondary" className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-xs">
              85% do total
            </Badge>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 h-fit hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <div className="w-5 h-5 bg-orange-50 rounded flex items-center justify-center">
                <UserPlus className="h-3 w-3 text-orange-600" />
              </div>
              Novos (30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 px-4 pb-4">
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              {Math.floor(totalClientes * 0.12).toLocaleString('pt-BR')}
            </div>
            <Badge variant="secondary" className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-xs">
              +8 esta semana
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}