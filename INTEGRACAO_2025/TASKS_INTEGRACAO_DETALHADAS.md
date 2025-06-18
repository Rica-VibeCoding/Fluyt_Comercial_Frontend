# 📋 TASKS DE INTEGRAÇÃO FRONTEND-BACKEND
**Sistema Fluyt Comercial - Tasks Executáveis**

## 🎯 ESTRUTURA DE TASKS

### **Legenda de Prioridades**
- 🔴 **P0 - CRÍTICA:** Bloqueia desenvolvimento posterior
- 🟠 **P1 - ALTA:** Essencial para funcionalidade core
- 🟡 **P2 - MÉDIA:** Melhoria importante
- 🟢 **P3 - BAIXA:** Enhancement futuro

### **Status de Tasks**
- ✅ **Concluída**
- 🔄 **Em Progresso**
- ⏳ **Aguardando**
- ❌ **Bloqueada**
- 📝 **Planejada**

---

## 🥇 FASE 1: FUNDAÇÃO DE CONECTIVIDADE

### **T1.1 - Configuração de Ambiente** 🔴 P0
**Estimativa:** 4h | **Responsável:** Dev Frontend + DevOps

#### **Subtasks:**
- [ ] **T1.1.1** - Unificar `.env` files entre frontend e backend
  - Criar `.env.example` padronizado
  - Documentar todas as variáveis obrigatórias
  - Validar variáveis no startup de ambos sistemas

- [ ] **T1.1.2** - Configurar CORS no backend
  ```python
  # backend/core/config.py
  cors_origins: str = "http://localhost:3000,https://fluyt-frontend.vercel.app"
  ```

- [ ] **T1.1.3** - Criar health check endpoint
  ```typescript
  // Testar: GET /health
  // Resposta esperada: {"status": "healthy", "timestamp": "..."}
  ```

**Critério de Aceitação:** Frontend consegue fazer GET /health e receber resposta 200

---

### **T1.2 - Cliente HTTP Base** 🔴 P0
**Estimativa:** 6h | **Responsável:** Dev Frontend

#### **Subtasks:**
- [ ] **T1.2.1** - Criar `lib/api-client.ts`
  ```typescript
  // Estrutura base
  class ApiClient {
    private baseURL: string;
    private authToken: string | null;
    
    async get<T>(endpoint: string): Promise<T>
    async post<T>(endpoint: string, data: any): Promise<T>
    async put<T>(endpoint: string, data: any): Promise<T>
    async delete<T>(endpoint: string): Promise<T>
  }
  ```

- [ ] **T1.2.2** - Implementar interceptors
  ```typescript
  // Auto-inject JWT token
  // Auto-handle 401 (redirect to login)
  // Auto-handle 500 (show error toast)
  // Request/Response logging
  ```

- [ ] **T1.2.3** - Criar error handling unificado
  ```typescript
  // types/api.ts
  interface ApiError {
    message: string;
    code: string;
    details?: any;
  }
  
  // hooks/use-api-error.ts
  export function useApiError() {
    const showError = (error: ApiError) => {
      toast.error(error.message);
    };
    return { showError };
  }
  ```

**Critério de Aceitação:** Cliente HTTP funcional com interceptors e error handling

---

### **T1.3 - Autenticação Unificada** 🔴 P0
**Estimativa:** 8h | **Responsável:** Dev Frontend + Dev Backend

#### **Subtasks:**
- [ ] **T1.3.1** - Integrar JWT do backend com Supabase
  ```typescript
  // hooks/use-auth.ts
  export function useAuth() {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    
    const login = async (email: string, password: string) => {
      // Chamar POST /api/v1/auth/login
      // Receber JWT token
      // Armazenar no localStorage
      // Configurar Supabase client com JWT
    };
    
    return { user, login, logout, isAuthenticated };
  }
  ```

- [ ] **T1.3.2** - Middleware de auth no backend
  ```python
  # Verificar se middleware AuthMiddleware está funcionando
  # Testar endpoints protegidos
  # Validar JWT decode e user context
  ```

- [ ] **T1.3.3** - Manter compatibilidade atual
  ```typescript
  // Não quebrar sistema atual de auth
  // Feature flag para alternar entre sistemas
  const useNewAuth = process.env.NEXT_PUBLIC_USE_NEW_AUTH === 'true';
  ```

**Critério de Aceitação:** Login via backend retorna JWT válido e permite acesso a endpoints protegidos

---

## 🥈 FASE 2: MÓDULOS CRÍTICOS

### **T2.1 - Módulo Clientes (API Real)** 🟠 P1
**Estimativa:** 12h | **Responsável:** Dev Frontend

#### **Subtasks:**
- [ ] **T2.1.1** - Criar service layer para clientes
  ```typescript
  // services/cliente.service.ts
  export class ClienteService {
    private api: ApiClient;
    
    async listarClientes(filtros?: ClienteFiltros): Promise<Cliente[]>
    async obterCliente(id: string): Promise<Cliente>
    async criarCliente(dados: ClienteCreate): Promise<Cliente>
    async atualizarCliente(id: string, dados: ClienteUpdate): Promise<Cliente>
    async excluirCliente(id: string): Promise<void>
  }
  ```

- [ ] **T2.1.2** - Atualizar hook `use-clientes.ts`
  ```typescript
  // Substituir dados mock por chamadas reais
  // Manter interface atual (zero breaking changes)
  // Adicionar loading states e error handling
  const { data: clientes, isLoading, error } = useQuery({
    queryKey: ['clientes', filtros],
    queryFn: () => clienteService.listarClientes(filtros)
  });
  ```

- [ ] **T2.1.3** - Migrar componentes de UI
  ```typescript
  // components/modulos/clientes/cliente-page.tsx
  // Manter UX idêntica
  // Adicionar feedback visual (loading, success, error)
  // Implementar optimistic updates
  ```

**Critério de Aceitação:** CRUD de clientes funcionando 100% via API com UX mantida

---

### **T2.2 - Módulo Ambientes** 🟠 P1
**Estimativa:** 10h | **Responsável:** Dev Frontend + Dev Backend

#### **Subtasks:**
- [ ] **T2.2.1** - Integrar importação XML
  ```typescript
  // Upload de arquivo XML via multipart/form-data
  // Chamar POST /api/v1/ambientes/importar-xml
  // Processar resposta com ambientes extraídos
  const uploadXML = async (file: File) => {
    const formData = new FormData();
    formData.append('arquivo', file);
    return api.post('/ambientes/importar-xml', formData);
  };
  ```

- [ ] **T2.2.2** - Conectar cálculos de valor
  ```typescript
  // Usar valores calculados pelo backend
  // Manter interface de ambientes atual
  // Adicionar validações server-side
  ```

- [ ] **T2.2.3** - Relacionamento cliente-ambiente
  ```typescript
  // Persistir relacionamentos no database
  // Sincronizar com sessaoSimples
  // Implementar cache inteligente
  ```

**Critério de Aceitação:** Importação XML e gestão de ambientes funcionando via API

---

### **T2.3 - Sistema de Sessão Híbrido** 🟠 P1
**Estimativa:** 14h | **Responsável:** Dev Frontend

#### **Subtasks:**
- [ ] **T2.3.1** - Adapter pattern para sessão
  ```typescript
  // lib/sessao-adapter.ts
  interface SessaoAdapter {
    carregar(): Promise<SessaoOrcamento>;
    salvar(sessao: SessaoOrcamento): Promise<void>;
    limpar(): Promise<void>;
  }
  
  class SessaoLocalAdapter implements SessaoAdapter {
    // Implementação atual com localStorage
  }
  
  class SessaoAPIAdapter implements SessaoAdapter {
    // Nova implementação com backend
  }
  ```

- [ ] **T2.3.2** - Sincronização inteligente
  ```typescript
  // Estratégia de conflict resolution
  // Cache local + sync com servidor
  // Offline support básico
  const useSessaoHibrida = () => {
    const [sessaoLocal, setSessaoLocal] = useState();
    const [sessaoRemota, setSessaoRemota] = useState();
    
    // Sync logic aqui
    const sync = async () => {
      // Merge local + remote
      // Resolve conflicts
      // Update both stores
    };
  };
  ```

- [ ] **T2.3.3** - Migration path
  ```typescript
  // Migrar dados existentes do localStorage para API
  // Manter compatibilidade durante transição
  // Feature flag para rollback
  ```

**Critério de Aceitação:** Sistema híbrido funcional com sync automático e conflict resolution

---

## 🥉 FASE 3: ORÇAMENTOS INTELIGENTES

### **T3.1 - Engine de Cálculos Integrada** 🟡 P2
**Estimativa:** 16h | **Responsável:** Dev Frontend + Dev Backend

#### **Subtasks:**
- [ ] **T3.1.1** - Conectar calculadora frontend
  ```typescript
  // Substituir cálculos locais por API calls
  // POST /api/v1/orcamentos/calcular
  const calcularOrcamento = async (dados: DadosOrcamento) => {
    return api.post('/orcamentos/calcular', {
      cliente_id: dados.clienteId,
      ambiente_ids: dados.ambienteIds,
      desconto_percentual: dados.desconto,
      custos_adicionais: dados.custosAdicionais
    });
  };
  ```

- [ ] **T3.1.2** - Validações real-time
  ```typescript
  // Validar desconto em tempo real
  // Chamar GET /api/v1/orcamentos/validar-desconto
  // Mostrar se precisa aprovação
  const validarDesconto = useDebouncedCallback(async (desconto: number) => {
    const resultado = await api.get(`/orcamentos/validar-desconto?percentual=${desconto}`);
    setNecessitaAprovacao(resultado.necessita_aprovacao);
  }, 500);
  ```

- [ ] **T3.1.3** - Comissões e margens
  ```typescript
  // Integrar engine Pandas do backend
  // Mostrar cálculos detalhados (apenas para admin)
  // Cache de configurações por loja
  ```

**Critério de Aceitação:** Cálculos de orçamento via backend com validações real-time

---

### **T3.2 - Simulador Financeiro** 🟡 P2
**Estimativa:** 12h | **Responsável:** Dev Frontend

#### **Subtasks:**
- [ ] **T3.2.1** - Formas de pagamento persistidas
  ```typescript
  // Salvar formas de pagamento via API
  // POST /api/v1/orcamentos/{id}/formas-pagamento
  // Manter UX atual do simulador
  ```

- [ ] **T3.2.2** - Cálculos de valor presente via API
  ```typescript
  // Usar algoritmos do backend para VP
  // Integrar com engine de cálculos
  // Manter interface editável atual
  ```

- [ ] **T3.2.3** - Sistema de aprovação
  ```typescript
  // Implementar workflow de aprovação
  // Notificações via Supabase real-time
  // Estados: NEGOCIACAO, AGUARDANDO_APROVACAO, APROVADO
  ```

**Critério de Aceitação:** Simulador funcionando com persistência e aprovação automática

---

### **T3.3 - Persistência de Orçamentos** 🟡 P2
**Estimativa:** 10h | **Responsável:** Dev Frontend

#### **Subtasks:**
- [ ] **T3.3.1** - CRUD de orçamentos
  ```typescript
  // Implementar operações completas
  // POST /api/v1/orcamentos (criar)
  // GET /api/v1/orcamentos/{id} (carregar)
  // PUT /api/v1/orcamentos/{id} (atualizar)
  // DELETE /api/v1/orcamentos/{id} (excluir)
  ```

- [ ] **T3.3.2** - Versionamento
  ```typescript
  // Histórico de alterações
  // Snapshots de configuração
  // Auditoria de mudanças
  ```

- [ ] **T3.3.3** - Lista de orçamentos
  ```typescript
  // Página de listagem com filtros
  // Paginação server-side
  // Busca por cliente, valor, status
  ```

**Critério de Aceitação:** Orçamentos persistidos com histórico e busca funcional

---

## 🏅 FASE 4: RECURSOS AVANÇADOS

### **T4.1 - Real-time e Colaboração** 🟢 P3
**Estimativa:** 8h | **Responsável:** Dev Frontend

#### **Subtasks:**
- [ ] **T4.1.1** - Supabase subscriptions
  ```typescript
  // Real-time updates para orçamentos
  // Notificações de aprovação
  // Sync multi-usuário
  const useRealtimeOrcamento = (orcamentoId: string) => {
    useEffect(() => {
      const subscription = supabase
        .channel(`orcamento_${orcamentoId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'c_orcamentos',
          filter: `id=eq.${orcamentoId}`
        }, handleChange)
        .subscribe();
      
      return () => subscription.unsubscribe();
    }, [orcamentoId]);
  };
  ```

- [ ] **T4.1.2** - Notificações push
  ```typescript
  // Toast notifications para mudanças
  // Badge counts para pendências
  // Sistema de alertas
  ```

**Critério de Aceitação:** Updates em tempo real funcionando entre usuários

---

### **T4.2 - Relatórios e Analytics** 🟢 P3
**Estimativa:** 12h | **Responsável:** Dev Frontend + Dev Backend

#### **Subtasks:**
- [ ] **T4.2.1** - Módulo contratos integrado
- [ ] **T4.2.2** - Relatórios de margem via API
- [ ] **T4.2.3** - Dashboard com métricas reais

**Critério de Aceitação:** Relatórios funcionais com dados do backend

---

### **T4.3 - Sistema Completo** 🟢 P3
**Estimativa:** 10h | **Responsável:** Dev Full-Stack

#### **Subtasks:**
- [ ] **T4.3.1** - Módulo Sistema integrado
- [ ] **T4.3.2** - Configurações enterprise
- [ ] **T4.3.3** - Auditoria completa

**Critério de Aceitação:** Sistema 100% integrado e funcional

---

## 📊 TRACKING E MÉTRICAS

### **Kanban de Tasks**
```
📝 BACKLOG     | 🔄 EM PROGRESSO | ✅ CONCLUÍDO    | 🚀 DEPLOY
T1.1 - Env     | T1.2 - HTTP     | T1.1.1 - .env  | T1.0 - Base
T1.3 - Auth    | T2.1 - Clientes |                 |
T2.2 - Ambien  |                  |                 |
...            |                  |                 |
```

### **Métricas de Progresso**
- **Fase 1:** 3 tasks = 18h estimadas
- **Fase 2:** 3 tasks = 36h estimadas  
- **Fase 3:** 3 tasks = 38h estimadas
- **Fase 4:** 3 tasks = 30h estimadas
- **TOTAL:** 12 tasks = 122h = ~15 dias úteis

### **Dependencies Graph**
```
T1.1 (Env) → T1.2 (HTTP) → T1.3 (Auth)
     ↓
T2.1 (Clientes) → T2.2 (Ambientes) → T2.3 (Sessão)
     ↓
T3.1 (Engine) → T3.2 (Simulador) → T3.3 (Persistência)
     ↓
T4.1 (Real-time) → T4.2 (Reports) → T4.3 (Complete)
```

---

## 🚨 TASK CRÍTICAS (IMEDIATAS)

### **Sprint 1 (Próximos 5 dias)**
1. **T1.1** - Configuração de Ambiente (Dia 1)
2. **T1.2** - Cliente HTTP Base (Dia 2-3)
3. **T1.3** - Autenticação Unificada (Dia 4-5)

### **Sprint 2 (Dias 6-10)**
1. **T2.1** - Módulo Clientes Real (Dia 6-8)
2. **T2.2** - Módulo Ambientes (Dia 9-10)

### **Sprint 3 (Dias 11-15)**
1. **T2.3** - Sistema Sessão Híbrido (Dia 11-13)
2. **T3.1** - Engine Cálculos (Dia 14-15)

**🎯 Meta:** Ter sistema base funcionando em 15 dias

---

## 🔧 FERRAMENTAS DE DESENVOLVIMENTO

### **Task Management**
- **Kanban:** GitHub Projects ou Linear
- **Time Tracking:** Toggl ou RescueTime
- **Code Review:** GitHub Pull Requests
- **QA:** Checklist por task + testes automatizados

### **Testing Strategy**
```typescript
// Para cada task, implementar:
// 1. Unit tests (Jest)
// 2. Integration tests (API calls)
// 3. E2E tests (Playwright) para fluxos críticos
// 4. Manual QA checklist
```

### **Documentation**
- Cada task deve atualizar documentação relevante
- README.md com setup instructions
- API documentation auto-gerada
- Deployment guide atualizado

---

**📋 PRÓXIMA AÇÃO:** Iniciar T1.1 - Configuração de Ambiente
**⏰ ETA:** Sistema básico funcionando em 2 semanas
**🎯 META:** Integração completa em 1 mês