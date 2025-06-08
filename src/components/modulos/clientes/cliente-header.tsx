import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card } from '../../ui/card';
import { Plus, TrendingUp, Users, UserPlus } from 'lucide-react';
interface ClienteHeaderProps {
  totalClientes: number;
  onNovoCliente: () => void;
}
export function ClienteHeader({
  totalClientes,
  onNovoCliente
}: ClienteHeaderProps) {
  return <div className="space-y-4">
      {/* Header principal */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl shadow-sm">
              <Users className="h-8 w-8 text-white" />
            </div>
            Gestão de Clientes
          </h1>
          
        </div>
        
        <Button onClick={onNovoCliente} size="lg" className="gap-3 h-12 px-6 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl font-semibold text-white">
          <UserPlus className="h-5 w-5" />
          Novo Cliente
        </Button>
      </div>

      {/* Cards de estatísticas - mais discretos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Total de Clientes
              </p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {totalClientes.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="p-2 bg-slate-500 rounded-lg shadow-sm opacity-80">
              <Users className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary" className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% este mês
            </Badge>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Clientes Ativos
              </p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {Math.floor(totalClientes * 0.85).toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="p-2 bg-slate-500 rounded-lg shadow-sm opacity-80">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary" className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-xs">
              85% do total
            </Badge>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Novos (30 dias)
              </p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {Math.floor(totalClientes * 0.12).toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="p-2 bg-slate-500 rounded-lg shadow-sm opacity-80">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary" className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-xs">
              +8 esta semana
            </Badge>
          </div>
        </Card>
      </div>
    </div>;
}