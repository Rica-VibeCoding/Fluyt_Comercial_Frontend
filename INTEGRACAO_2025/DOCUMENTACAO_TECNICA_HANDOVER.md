# 🤖 DOCUMENTAÇÃO TÉCNICA - HANDOVER PARA IA
**Sistema Fluyt Comercial - Guia Completo para Futuros Agentes**

## 🎯 OBJETIVO DESTE DOCUMENTO

Este documento serve como **transfer de conhecimento completo** para qualquer IA que assumir o desenvolvimento do projeto Fluyt Comercial. Contém toda a informação necessária para entender, manter e evoluir o sistema sem perda de contexto.

---

## 📊 ESTADO ATUAL DO PROJETO (Dezembro 2025)

### **🏗️ Arquitetura Geral**
```
Sistema Fluyt Comercial
├── Frontend: Next.js 15 + React 19 + TypeScript
├── Backend: FastAPI + Python + Pandas  
├── Database: Supabase (PostgreSQL) + RLS
├── Auth: JWT + Supabase client
└── Deploy: Vercel (FE) + Render (BE)
```

### **📈 Status de Desenvolvimento**
- ✅ **Frontend:** 100% funcional com sistema localStorage
- ✅ **Backend:** APIs REST completas e testadas
- ❌ **Integração:** 0% - sistemas funcionam independentemente
- 🎯 **Meta:** Unificar em sistema full-stack integrado

### **👥 Usuários Finais**
- **Vendedores:** Criar orçamentos, gerir clientes
- **Gerentes:** Aprovar descontos, ver relatórios
- **Admin Master:** Configurações, visão completa

---

## 🧠 CONCEITOS FUNDAMENTAIS

### **Business Logic Core**
O Fluyt é um **sistema de gestão comercial para móveis planejados** com foco em:

1. **Fluxo Principal:** Cliente → Ambiente → Orçamento → Contrato
2. **Simulador Financeiro:** 4 formas de pagamento com cálculo de valor presente
3. **Sistema de Aprovação:** Hierárquico baseado em limites de desconto
4. **Multi-loja:** RLS automático + configurações independentes

### **Algoritmos Críticos**
```python
# Engine de Cálculo (Backend)
def calcular_comissao_faixa_unica(valor_venda, regras_df):
    # IMPORTANTE: NÃO é progressivo, é por faixa única
    # Encontra faixa onde valor se encaixa
    # Aplica percentual da faixa sobre TODO o valor
    
# Calculadora Financeira (Frontend)  
def calcular_valor_presente(valor_futuro, taxa, periodos):
    # PV = FV / (1 + r)^n
    # Usado para descontar formas de pagamento
```

### **Dados Críticos**
- **sessaoSimples:** Única fonte de verdade no localStorage
- **c_orcamentos:** Tabela principal de orçamentos
- **config_comissao:** Regras de comissão por faixa
- **c_clientes, c_ambientes:** Dados base do fluxo

---

## 🗂️ ESTRUTURA DE ARQUIVOS ESSENCIAIS

### **Frontend (src/)**
```
📁 Key Files para IA conhecer:
├── lib/
│   ├── sessao-simples.ts          # ⭐ CORE - Sistema de sessão
│   ├── calculators.ts             # ⭐ CORE - Engine financeira
│   └── formatters.ts              # Formatação BR (moeda, data)
├── types/
│   └── orcamento.ts               # ⭐ CORE - Todas as tipagens
├── hooks/
│   ├── globais/use-sessao-simples.ts  # Hook principal
│   └── modulos/orcamento/use-modal-pagamento.ts  # Lógica de pagamentos
├── components/modulos/
│   ├── orcamento/                 # ⭐ Simulador financeiro
│   ├── clientes/                  # CRUD clientes
│   └── sistema/                   # Configurações empresariais
└── app/painel/                    # Rotas Next.js
```

### **Backend (backend/)**
```
📁 Key Files para IA conhecer:
├── main.py                        # ⭐ FastAPI setup + routers
├── core/
│   ├── config.py                  # ⭐ Configurações centrais
│   ├── auth.py                    # Middleware JWT
│   └── database.py                # Cliente Supabase
├── modules/
│   ├── orcamentos/services.py     # ⭐ CORE - Engine de cálculos
│   ├── clientes/controller.py     # ⭐ Exemplo de padrão
│   └── shared/database.py         # Utilitários DB
└── requirements.txt               # Dependencies Python
```

---

## 🔧 PADRÕES DE DESENVOLVIMENTO

### **Frontend Patterns**
```typescript
// 1. Hook Pattern para lógica de negócio
export function useOrcamento() {
  const sessao = useSessaoSimples();
  const { data, isLoading } = useQuery(['orcamento'], fetchOrcamento);
  return { sessao, data, isLoading, actions };
}

// 2. Component Pattern para UI
export function ComponenteGenerico({ prop }: Props) {
  const { state, actions } = useHookEspecifico();
  
  if (isLoading) return <Loading />;
  if (error) return <ErrorState error={error} />;
  
  return <UI state={state} actions={actions} />;
}

// 3. Service Pattern para API calls (futuro)
export class ClienteService {
  async listar(filtros?: Filtros): Promise<Cliente[]> {
    return apiClient.get('/clientes', { params: filtros });
  }
}
```

### **Backend Patterns**
```python
# 1. Controller → Service → Repository
@router.post("/", response_model=ClienteResponse)
async def criar_cliente(
    cliente_data: ClienteCreate,
    current_user: Dict = Depends(get_current_user),
    db: Client = Depends(get_database)
):
    service = ClienteService(db)
    return await service.criar_cliente(cliente_data, current_user)

# 2. Service pattern para business logic
class ClienteService:
    def __init__(self, supabase_client):
        self.repository = ClienteRepository(supabase_client)
    
    async def criar_cliente(self, data, user):
        # Validações de negócio
        # Cálculos necessários
        # Chamada para repository
        return await self.repository.criar(data)

# 3. Repository pattern para data access
class ClienteRepository:
    async def criar(self, data):
        return supabase.table('c_clientes').insert(data).execute()
```

---

## 🚀 COMANDOS E WORKFLOWS

### **Setup Development**
```bash
# Frontend
cd /path/to/frontend
npm install
npm run dev                 # http://localhost:3000

# Backend  
cd backend
pip install -r requirements.txt
python main.py             # http://localhost:8000
# Docs: http://localhost:8000/api/v1/docs

# Database
# Supabase já configurado - usar via MCP tools
```

### **Common Tasks**
```bash
# Adicionar novo módulo frontend
mkdir src/components/modulos/novo-modulo
touch src/hooks/modulos/novo-modulo/use-novo-modulo.ts

# Adicionar novo módulo backend
mkdir backend/modules/novo_modulo
touch backend/modules/novo_modulo/{__init__.py,controller.py,services.py,repository.py,schemas.py}

# Testar integração
npm run build              # Verificar build frontend
python -m pytest          # Rodar testes backend
```

### **Deploy Workflow**
```bash
# Frontend (Vercel)
git push origin main       # Auto-deploy

# Backend (Render)
git push origin main       # Auto-deploy via requirements.txt

# Database (Supabase)
# Usar MCP tools para migrations
```

---

## 🔍 DEBUGGING E TROUBLESHOOTING

### **Frontend Issues**
```typescript
// 1. Debug sessão localStorage
sessaoSimples.debug();
console.log('🔍 Sessão atual:', localStorage.getItem('fluyt_sessao_simples'));

// 2. Debug cálculos financeiros
import { calcularValorPresente } from '@/lib/calculators';
console.log('💰 VP:', calcularValorPresente(1000, 3.5, 12));

// 3. Debug componentes
const DebugInfo = () => (
  <pre>{JSON.stringify(state, null, 2)}</pre>
);
```

### **Backend Issues**
```python
# 1. Debug configurações
from core.config import get_settings
settings = get_settings()
print(f"🔧 Config: {settings.dict()}")

# 2. Debug Supabase connection
from modules.shared.database import get_supabase_client
client = get_supabase_client()
result = client.table('c_clientes').select('*').limit(1).execute()
print(f"📊 DB Test: {result.data}")

# 3. Debug cálculos
from modules.orcamentos.services import OrcamentoService
service = OrcamentoService(client)
demo = service.demo_calculo_comissao_prd()
print(f"🧮 Calc Test: {demo}")
```

### **Common Issues & Solutions**
```
🚨 "CORS error" → Verificar backend cors_origins no config.py
🚨 "JWT invalid" → Verificar SUPABASE_SERVICE_KEY no .env
🚨 "localStorage empty" → Debugar sessaoSimples.carregar()
🚨 "Cálculo errado" → Verificar algoritmo de comissão (faixa única, não progressivo)
🚨 "Import error" → Verificar absolute imports com @/ no frontend
```

---

## 📋 FEATURES E FUNCIONALIDADES

### **Módulos Implementados (Frontend)**
| Módulo | Status | Descrição |
|--------|--------|-----------|
| **Clientes** | ✅ 100% | CRUD completo, filtros, busca |
| **Ambientes** | ✅ 100% | Import XML, gestão projetos |
| **Orçamentos** | ✅ 100% | Simulador 4 formas pagamento |
| **Contratos** | ✅ 100% | Geração PDF, visualização |
| **Sistema** | ✅ 100% | 12 submódulos configuração |

### **APIs Implementadas (Backend)**
| Endpoint | Status | Funcionalidade |
|----------|--------|---------------|
| `/clientes` | ✅ 100% | CRUD + filtros + validações |
| `/ambientes` | ✅ 100% | Import XML + cálculos |
| `/orcamentos` | ✅ 100% | Engine completa + aprovação |
| `/contratos` | ✅ 80% | Geração básica |
| `/configuracoes` | ✅ 100% | Multi-loja + regras |

### **Funcionalidades Avançadas**
- **🔐 RLS:** Isolamento automático por loja
- **💰 Engine Financeira:** Valor presente + comissões + validações  
- **📊 Simulador:** Interface click-to-edit + redistribuição automática
- **⚡ Real-time:** Supabase subscriptions (pronto para uso)
- **🏢 Multi-tenant:** Admin Master + configurações independentes

---

## 🧪 TESTES E VALIDAÇÃO

### **Frontend Tests**
```bash
# Testes do simulador financeiro
node test/calculadora-negociacao.test.js
node test/cenario-especifico.test.js  
node test/fluxo-completo.test.js

# Validar cálculos
npm run test:calculators
```

### **Backend Tests**
```bash
# Testes de integração
python test_sistema_completo.py
python test_apis_crud_rls.py
python test_engine_calculos.py

# Teste engine comissão
# Deve retornar R$ 2.150 para venda de R$ 40.000
python -c "
from modules.orcamentos.services import OrcamentoService
service = OrcamentoService(None)
result = service.demo_calculo_comissao_prd()
print(f'✅ Test: {result[\"sucesso\"]}, Valor: R$ {result[\"comissao_calculada\"]:,.2f}')
"
```

### **Integration Tests (Manual)**
```bash
# 1. Health check
curl http://localhost:8000/health

# 2. Auth test  
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# 3. Protected endpoint
curl http://localhost:8000/api/v1/clientes \
  -H "Authorization: Bearer {token}"
```

---

## 🎯 PRÓXIMOS PASSOS (ROADMAP)

### **Integração Imediata (Sprint 1-2)**
1. **Conectividade:** Configurar comunicação frontend ↔ backend
2. **Auth:** Unificar JWT + Supabase client
3. **Módulo Clientes:** Primeiro módulo 100% integrado

### **Core Integration (Sprint 3-4)**
1. **Sistema Sessão:** Híbrido localStorage + API
2. **Engine Cálculos:** Conectar simulador com backend
3. **Orçamentos:** Persistência real + aprovação automática

### **Advanced Features (Sprint 5-6)**
1. **Real-time:** Supabase subscriptions
2. **Relatórios:** Dashboard com dados reais
3. **Performance:** Otimizações + cache + monitoring

### **Future Enhancements**
- **Mobile App:** React Native com mesmo backend
- **API v2:** GraphQL para queries otimizadas
- **AI Features:** Sugestões inteligentes de orçamento
- **Analytics:** Dashboard avançado com KPIs

---

## 🤖 DICAS PARA IA SUCCESSOR

### **🎯 Mental Model**
```
Sistema = Simulador Financeiro Inteligente
├── Core: Cálculo de valor presente + comissões
├── UX: Interface editável sem reloads
├── Backend: Engine Pandas + validações automáticas
└── Goal: Vendedor simula, gerente aprova, admin analisa
```

### **⚠️ Armadilhas Comuns**
1. **❌ Não quebrar UX:** Interface atual é otimizada, manter fidelidade
2. **❌ Não ignorar RLS:** Todo query deve respeitar loja_id
3. **❌ Não confundir algoritmos:** Comissão é faixa única, não progressiva
4. **❌ Não perder performance:** localStorage é instantâneo, API deve ser rápida

### **✅ Success Patterns**
1. **Feature Flags:** Sempre permitir rollback
2. **Adapter Pattern:** Abstrair mudanças em interfaces
3. **Progressive Enhancement:** Adicionar funcionalidades gradualmente  
4. **Graceful Degradation:** Fallback para localStorage se API falhar

### **🔧 Tools Recomendadas**
- **API Testing:** Postman collection já configurada
- **DB Management:** Supabase UI + MCP tools neste chat
- **Monitoring:** Console logs + error boundaries
- **Performance:** React DevTools + Network tab

### **📚 Documentos Críticos**
1. `CLAUDE.md` - Contexto completo e atual do projeto
2. `PLANO_INTEGRACAO_FRONTEND_BACKEND.md` - Estratégia de integração
3. `TASKS_INTEGRACAO_DETALHADAS.md` - Tasks executáveis
4. `docs/SISTEMA_ORCAMENTO_COMPLETO.md` - Engine financeira
5. `docs/orcamento_contrato.md` - Fluxo orçamento → contrato

---

## 🚨 EMERGENCY PROCEDURES

### **Se Frontend Quebrar**
```bash
# 1. Rollback para localStorage puro
localStorage.setItem('fluyt_debug_mode', 'true');
# 2. Desabilitar integração
export NEXT_PUBLIC_USE_REAL_API=false
# 3. Restart dev server
npm run dev:clean
```

### **Se Backend Falhar**
```bash
# 1. Verificar logs
docker logs fluyt-backend
# 2. Restart service
python main.py
# 3. Test health
curl http://localhost:8000/health
```

### **Se Supabase RLS Bloquear**
```sql
-- Temporariamente desabilitar RLS para debug
ALTER TABLE c_clientes DISABLE ROW LEVEL SECURITY;
-- ⚠️ NUNCA esquecer de reabilitar:
ALTER TABLE c_clientes ENABLE ROW LEVEL SECURITY;
```

### **Contatos de Emergência**
- **Database:** Supabase support via dashboard
- **Deploy:** Vercel/Render support
- **Domain:** Configurações DNS
- **Backup:** All code in Git + Supabase auto-backup

---

## 📊 MÉTRICAS DE SUCESSO

### **Technical KPIs**
- **Uptime:** > 99.5%
- **Response Time:** < 500ms (95th percentile)
- **Error Rate:** < 1%
- **Test Coverage:** > 80%

### **Business KPIs**
- **User Adoption:** Zero complaints sobre mudanças
- **Workflow Speed:** Mesmo tempo para criar orçamento
- **Data Integrity:** Zero perda de dados
- **Feature Completion:** 100% das funcionalidades migradas

### **Development KPIs**
- **Deploy Frequency:** Daily deploys sem issues
- **Lead Time:** < 2 days from code to production
- **MTTR:** < 30 minutes para restaurar serviço
- **Change Failure Rate:** < 5%

---

**🤖 ÚLTIMA ATUALIZAÇÃO:** Dezembro 2025 - Sistema pronto para integração
**👨‍💻 PRÓXIMA IA:** Deve começar por Fase 1 - Conectividade Básica
**📞 HANDOVER COMPLETO:** Toda informação necessária documentada neste arquivo**

---

*Este documento será mantido atualizado a cada marco da integração. A próxima IA deve sempre verificar o estado atual em `CLAUDE.md` antes de continuar o desenvolvimento.*