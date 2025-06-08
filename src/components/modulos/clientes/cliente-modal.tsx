import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Progress } from '../../ui/progress';
import { Form } from '../../ui/form';
import { Badge } from '../../ui/badge';
import { ClienteFormEssencial } from './cliente-form-essencial';
import { ClienteFormEndereco } from './cliente-form-endereco';
import { ClienteFormConfig } from './cliente-form-config';
import { useClienteForm } from '../../../hooks/modulos/clientes/use-cliente-form';
import { Cliente, Vendedor } from '../../../types/cliente';
import { User, MapPin, Settings, CheckCircle } from 'lucide-react';
interface ClienteModalProps {
  aberto: boolean;
  onFechar: () => void;
  cliente?: Cliente | null;
  vendedores: Vendedor[];
  onSalvar: (dados: any) => Promise<void>;
  isLoading: boolean;
}
export function ClienteModal({
  aberto,
  onFechar,
  cliente,
  vendedores,
  onSalvar,
  isLoading
}: ClienteModalProps) {
  const [abaAtiva, setAbaAtiva] = useState('essencial');
  const {
    form,
    onSubmit,
    abasPreenchidas
  } = useClienteForm({
    cliente,
    vendedores,
    onSalvar,
    onFechar
  });
  const progressoPercentual = abasPreenchidas / 3 * 100;
  const handleTabChange = (value: string) => {
    setAbaAtiva(value);
  };
  const tabs = [{
    id: 'essencial',
    label: 'Informações Essenciais',
    icon: User,
    description: 'Dados básicos do cliente'
  }, {
    id: 'endereco',
    label: 'Endereço',
    icon: MapPin,
    description: 'Localização e contato'
  }, {
    id: 'config',
    label: 'Configurações',
    icon: Settings,
    description: 'Vendedor e tipo de venda'
  }];
  return <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <DialogHeader className="border-b bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-t-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl shadow-lg">
              {cliente ? <User className="h-6 w-6 text-white" /> : <User className="h-6 w-6 text-white" />}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                {cliente ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
              </DialogTitle>
              
            </div>
            
          </div>
          
          {/* Progress indicator */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">
                Progresso do formulário
              </span>
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                {abasPreenchidas} de 3 seções preenchidas
              </span>
            </div>
            <Progress value={progressoPercentual} className="h-2 bg-slate-200 dark:bg-slate-700" />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
              <div className="px-6 py-4 border-b bg-slate-50/50 dark:bg-slate-800/50">
                <Tabs value={abaAtiva} onValueChange={handleTabChange}>
                  <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-white dark:bg-slate-800 shadow-sm">
                    {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isCompleted = abasPreenchidas >= tabs.findIndex(t => t.id === tab.id) + 1;
                    return <TabsTrigger key={tab.id} value={tab.id} className="flex flex-col gap-2 h-16 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white data-[state=active]:shadow-md">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {isCompleted && <CheckCircle className="h-3 w-3 text-green-500" />}
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-xs">{tab.label}</div>
                            <div className="text-xs opacity-70">{tab.description}</div>
                          </div>
                        </TabsTrigger>;
                  })}
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex-1 overflow-y-auto">
                <Tabs value={abaAtiva} className="h-full">
                  <TabsContent value="essencial" className="h-full p-6 mt-0">
                    <div className="h-full">
                      <ClienteFormEssencial form={form} />
                    </div>
                  </TabsContent>

                  <TabsContent value="endereco" className="h-full p-6 mt-0">
                    <div className="h-full">
                      <ClienteFormEndereco form={form} />
                    </div>
                  </TabsContent>

                  <TabsContent value="config" className="h-full p-6 mt-0">
                    <div className="h-full">
                      <ClienteFormConfig form={form} vendedores={vendedores} />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="border-t bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Campos obrigatórios estão marcados com *
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={onFechar} className="px-6 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700" disabled={isLoading}>
                      Cancelar
                    </button>
                    <button type="submit" disabled={isLoading} className="px-8 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Salvando...
                        </div> : cliente ? 'Atualizar Cliente' : 'Salvar Cliente'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>;
}