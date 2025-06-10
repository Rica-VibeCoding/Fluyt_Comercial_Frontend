
import { Layout } from "@/components/Layout";

const Index = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo ao sistema Fluyt da D-Art
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Clientes Ativos
            </h3>
            <p className="text-3xl font-bold text-primary">47</p>
            <p className="text-sm text-muted-foreground mt-1">
              +12% em relação ao mês anterior
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Orçamentos
            </h3>
            <p className="text-3xl font-bold text-primary">23</p>
            <p className="text-sm text-muted-foreground mt-1">
              8 aguardando aprovação
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Contratos
            </h3>
            <p className="text-3xl font-bold text-primary">15</p>
            <p className="text-sm text-muted-foreground mt-1">
              12 em andamento
            </p>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Atividades Recentes
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <p className="text-sm text-foreground">
                Novo orçamento criado para Cliente ABC
              </p>
              <span className="text-xs text-muted-foreground ml-auto">
                2 horas atrás
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <p className="text-sm text-foreground">
                Contrato assinado - Projeto Residencial XYZ
              </p>
              <span className="text-xs text-muted-foreground ml-auto">
                5 horas atrás
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
