# 🔄 PLANO DE MIGRAÇÃO - ENDPOINTS /test → /api/v1

**Preparado por**: C2 (Integração)  
**Para**: Fase 3 - Autenticação Real  
**Status**: Plano executável pronto

---

## 🎯 **STRATEGY OVERVIEW**

### **✅ SITUAÇÃO ATUAL**
- Frontend: ApiClient profissional com JWT pronto
- Backend: Sistema auth robusto implementado
- Teste: Endpoints `/test/*` funcionando sem auth
- Meta: Migrar para `/api/v1/*` com auth completa

### **🔄 ESTRATÉGIA: MIGRAÇÃO GRADUAL COM FEATURE FLAGS**
```typescript
// Feature flag para controlar migração
const USE_AUTH_ENDPOINTS = process.env.NEXT_PUBLIC_USE_AUTH === 'true';

// Migração gradual módulo por módulo:
Fase 3.1: Clientes (/test → /api/v1) 
Fase 3.2: Ambientes (quando backend resolver)
Fase 3.3: Orçamentos (quando backend resolver)
```

---

## 📋 **FASE 3.1 - MIGRAÇÃO MÓDULO CLIENTES**

### **🔧 Preparação do Service Layer**

#### **1. Atualizar ClientesApiService**
```typescript
// frontend/src/services/clientes-api.ts

class ClientesApiService {
  private baseUrl: string;
  private testBaseUrl: string;
  private useAuth: boolean;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/${API_VERSION}/clientes`;
    this.testBaseUrl = `${API_BASE_URL}/api/${API_VERSION}/test`;
    this.useAuth = process.env.NEXT_PUBLIC_USE_AUTH === 'true';
  }

  // Método principal que escolhe endpoint baseado em flag
  private getEndpoint(operation: string, id?: string): string {
    if (this.useAuth) {
      // Endpoints autenticados
      return id 
        ? `${this.baseUrl}/${id}` 
        : `${this.baseUrl}`;
    } else {
      // Endpoints de teste (atual)
      if (operation === 'list') return `${this.testBaseUrl}/clientes`;
      if (operation === 'create') return `${this.testBaseUrl}/cliente`;
      if (operation === 'update') return `${this.testBaseUrl}/cliente/${id}`;
      if (operation === 'delete') return `${this.testBaseUrl}/cliente/${id}`;
    }
  }

  // Migração gradual dos métodos:
  async listarClientes(): Promise<Cliente[]> {
    const endpoint = this.getEndpoint('list');
    
    if (this.useAuth) {
      // Versão autenticada (usa apiClient com JWT automático)
      const response = await api.get<{data: Cliente[]}>(endpoint);
      return response.data;
    } else {
      // Versão de teste (mantém código atual)
      const LOJA_TESTE_ID = "550e8400-e29b-41d4-a716-446655440001";
      const response = await fetch(`${endpoint}?loja_id=${LOJA_TESTE_ID}`);
      // ... código atual mantido
    }
  }
}
```

#### **2. Implementar AuthContext React**
```typescript
// frontend/src/contexts/auth-context.tsx

interface AuthContextData {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar token do localStorage na inicialização
  useEffect(() => {
    const savedToken = localStorage.getItem('fluyt_auth_token');
    if (savedToken) {
      api.setAuthToken(savedToken);
      setToken(savedToken);
      // TODO: Validar token e carregar dados do usuário
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      // Chamar endpoint de login do backend
      const response = await api.post<{token: string, user: UserData}>('/auth/login', credentials);
      
      setToken(response.token);
      setUser(response.user);
      api.setAuthToken(response.token);
      
      localStorage.setItem('fluyt_auth_token', response.token);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    api.clearAuthToken();
    localStorage.removeItem('fluyt_auth_token');
  };

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated: !!token,
      login, logout, isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### **3. Proteger Rotas com Auth**
```typescript
// frontend/src/components/auth/ProtectedRoute.tsx

export const ProtectedRoute: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
```

---

## 🔒 **CONFIGURAÇÃO DE FEATURE FLAGS**

### **Variables de Ambiente**
```bash
# frontend/.env.local

# Controle de migração
NEXT_PUBLIC_USE_AUTH=false           # false = endpoints teste, true = endpoints auth
NEXT_PUBLIC_AUTH_MIGRATION_MODE=true # true = permite fallback se auth falhar

# URLs de auth  
NEXT_PUBLIC_LOGIN_URL=/auth/login
NEXT_PUBLIC_LOGOUT_URL=/auth/logout
```

### **Estratégia de Rollback**
```typescript
// Service com fallback automático
async listarClientes(): Promise<Cliente[]> {
  if (this.useAuth) {
    try {
      // Tentar endpoint autenticado
      return await this.listarClientesAuth();
    } catch (error) {
      if (process.env.NEXT_PUBLIC_AUTH_MIGRATION_MODE === 'true') {
        console.warn('Fallback para endpoints de teste:', error);
        return await this.listarClientesTeste();
      }
      throw error;
    }
  }
  
  return await this.listarClientesTeste();
}
```

---

## 🧪 **PLANO DE TESTES DE MIGRAÇÃO**

### **Fase de Testes 1: Desenvolvimento**
```bash
# 1. Testar endpoints teste (situação atual)
NEXT_PUBLIC_USE_AUTH=false npm run dev
# Validar: CRUD completo funciona

# 2. Testar migração para auth
NEXT_PUBLIC_USE_AUTH=true npm run dev  
# Validar: Login funciona, CRUD com RLS funciona

# 3. Testar fallback
NEXT_PUBLIC_USE_AUTH=true
NEXT_PUBLIC_AUTH_MIGRATION_MODE=true
# Simular falha auth, validar fallback para teste
```

### **Cenários de Teste Críticos**
```javascript
// 1. Autenticação e JWT
test('Login com credenciais válidas salva token')
test('Token inválido redireciona para login')
test('Token expirado renovado automaticamente')

// 2. RLS Multi-tenant
test('Usuário loja A não vê clientes loja B')
test('ADMIN_MASTER vê clientes de todas lojas')

// 3. Permissões por perfil
test('VENDEDOR pode criar/editar clientes')
test('MEDIDOR não acessa módulo clientes')

// 4. Fallback e recuperação
test('Se auth falhar, fallback para teste funciona')
test('Migração transparente preserva UX')
```

---

## 📊 **CRONOGRAMA DETALHADO MIGRAÇÃO**

### **Dia 1: Setup Auth Frontend**
```
Manhã (4h):
✅ Implementar AuthContext 
✅ Criar ProtectedRoute
✅ Setup feature flags

Tarde (4h):  
✅ Integrar ApiClient com auth
✅ Criar tela de login básica
✅ Testes unitários auth
```

### **Dia 2: Migração Service Clientes**
```
Manhã (4h):
✅ Atualizar ClientesApiService
✅ Implementar métodos com flag
✅ Configurar fallback automático

Tarde (4h):
✅ Testes integração CRUD
✅ Validar RLS funcionando  
✅ Debug e ajustes finais
```

### **Dia 3: Validação e Polish**
```
Manhã (4h):
✅ Testes end-to-end completos
✅ Validação multi-tenant
✅ Performance e UX

Tarde (4h):
✅ Deploy staging para testes
✅ Documentação atualizada
✅ Preparação rollout produção
```

---

## ⚠️ **RISCOS E MITIGAÇÕES**

### **🔴 Riscos Identificados**

#### **1. Quebra de UX durante migração**
- **Risco**: Usuário perde sessão/dados
- **Mitigação**: Feature flags + fallback automático

#### **2. RLS mal configurado**  
- **Risco**: Usuário vê dados de outras lojas
- **Mitigação**: Testes específicos multi-tenant

#### **3. Performance degradada**
- **Risco**: Auth adiciona latência
- **Mitigação**: Cache de token + interceptors otimizados

#### **4. Complexidade de debug**
- **Risco**: Difícil identificar problemas auth vs API
- **Mitigação**: Logs detalhados + environment separado

### **🟢 Planos de Contingência**

```bash
# Rollback Nível 1: Feature flag
NEXT_PUBLIC_USE_AUTH=false

# Rollback Nível 2: Código
git revert para commit antes da migração

# Rollback Nível 3: Deploy  
Deploy versão anterior via Vercel
```

---

## 🎯 **CRITÉRIOS DE SUCESSO**

### **✅ Fase 3 Bem-sucedida SE:**
1. **Login funciona**: Usuário entra e token JWT válido
2. **CRUD mantido**: Todas operações de cliente funcionam
3. **RLS ativo**: Isolamento por loja comprovado
4. **UX preservada**: Zero quebra de fluxo de usuário
5. **Performance OK**: Latência < 500ms adicional
6. **Rollback pronto**: Pode voltar em < 5 minutos

### **📊 Métricas de Monitoramento**
```javascript
// Dashboard de métricas
- Taxa sucesso login: > 95%
- Latência API auth: < 200ms
- Erros 401/403: < 1% 
- Tempo rollback: < 5min
- User retention: mantida
```

---

## 📞 **COMUNICAÇÃO PARA C1**

### **✅ Status C2 - Migração Preparada**

**Documentação completa**: ✅ Sistema auth mapeado  
**Plano executável**: ✅ Migração passo-a-passo  
**Estratégia rollback**: ✅ Feature flags + fallback  
**Testes preparados**: ✅ Cenários críticos definidos

### **🤝 Necessário de C1 para execução**
1. **Backend estável**: Endpoints /test funcionando
2. **Validação auth**: Endpoints /api/v1/auth operacionais  
3. **RLS configurado**: Multi-tenancy testado
4. **Ambiente staging**: Para testes isolados

### **⏱️ Timeline Pós-Sinal Verde**
- **Setup inicial**: 2-3 horas
- **Implementação**: 2 dias  
- **Validação**: 1 dia
- **Total**: 3-4 dias para migração completa

**Status**: ✅ **Pronto para executar assim que C1 der sinal verde!**

---

**📅 Documento criado**: Dezembro 2025  
**👨‍💻 Responsável**: C2 (Integração)  
**🚀 Status**: Aguardando conclusão C1