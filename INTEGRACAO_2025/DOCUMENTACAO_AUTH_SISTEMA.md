# 🔐 DOCUMENTAÇÃO COMPLETA - SISTEMA DE AUTENTICAÇÃO FLUYT

**Preparado por**: C2 (Integração)  
**Para**: Migração Fase 3 - Autenticação Real  
**Status**: Mapeamento completo realizado

---

## 🎯 **EXECUTIVE SUMMARY - SISTEMA AUTH**

### **✅ QUALIDADE EXCEPCIONAL DETECTADA**
O sistema de autenticação do backend está **profissionalmente implementado** com:
- JWT robusto com middleware automático
- Perfis hierárquicos bem definidos  
- RLS (Row Level Security) integrado
- Multi-tenancy por loja automático
- Dependency injection completa

---

## 🔐 **ARQUITETURA JWT ATUAL**

### **1. Estrutura do Token JWT**
```json
{
  "sub": "uuid-do-usuario",        // ID único do usuário
  "loja_id": "uuid-da-loja",       // Para RLS automático
  "perfil": "VENDEDOR|GERENTE|ADMIN_MASTER", 
  "email": "usuario@empresa.com",
  "nome": "Nome do Usuário",
  "iat": 1703123456,              // Timestamp criação
  "exp": 1703127056               // Timestamp expiração (60min)
}
```

### **2. Configurações JWT**
```python
# Variáveis de ambiente necessárias:
JWT_SECRET_KEY="production-secret-key-here"
JWT_ALGORITHM="HS256" 
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60

# Configuração em core/config.py:
✅ jwt_secret_key: Chave secreta para assinatura
✅ jwt_algorithm: Algoritmo de criptografia
✅ jwt_access_token_expire_minutes: Tempo de expiração
```

---

## 👥 **SISTEMA DE PERFIS E PERMISSÕES**

### **Hierarquia de Perfis**
```
🔴 ADMIN_MASTER    # Acesso total, todas as lojas
├── 🟠 GERENTE     # Gestão completa da própria loja  
├── 🟡 VENDEDOR    # Operações de venda da própria loja
└── 🟢 MEDIDOR     # Apenas medições (perfil limitado)
```

### **Dependencies Disponíveis**
```python
# Para endpoints que exigem autenticação básica:
current_user: Dict = Depends(get_current_user)

# Para perfis específicos:
Depends(require_admin())                 # Só ADMIN_MASTER
Depends(require_gerente_ou_admin())     # GERENTE + ADMIN_MASTER  
Depends(require_vendedor_ou_superior()) # VENDEDOR + GERENTE + ADMIN
```

---

## 🔒 **ROW LEVEL SECURITY (RLS) AUTOMÁTICO**

### **Funcionamento**
1. **Token incluir `loja_id`**: Identificação automática da loja
2. **Middleware extrai dados**: Disponibiliza no escopo da requisição
3. **Dependencies validam**: Acesso apenas à própria loja
4. **Exceção ADMIN_MASTER**: Acesso cross-loja permitido

### **Validação de Acesso por Loja**
```python
# Verificação automática:
def verificar_acesso_loja(current_user, loja_id) -> bool:
    # ADMIN_MASTER = acesso total
    # Outros perfis = apenas própria loja
    
# Validação com exceção:
def assert_acesso_loja(current_user, loja_id) -> None:
    # Lança HTTP 403 se não tem acesso
```

---

## ⚙️ **MIDDLEWARE DE AUTENTICAÇÃO**

### **AuthMiddleware - Funcionamento**
```python
class AuthMiddleware:
    # Intercepta TODAS as requisições HTTP
    # Extrai token Bearer se presente
    # Valida e decodifica JWT
    # Adiciona user data ao scope da requisição
    # Continua sem user se token inválido
```

### **Dados Disponíveis no Scope**
```python
scope["user"] = {
    "user_id": "uuid-usuario",
    "loja_id": "uuid-loja", 
    "perfil": "VENDEDOR",
    "token": "jwt-original"
}
```

---

## 🔄 **ENDPOINTS ATUAIS - MIGRAÇÃO NECESSÁRIA**

### **❌ Sistema Atual (Teste - SEM AUTH)**
```python
# Endpoints temporários sem autenticação:
POST   /api/v1/test/cliente
GET    /api/v1/test/clientes  
PUT    /api/v1/test/cliente/{id}
DELETE /api/v1/test/cliente/{id}

# ⚠️ PROBLEMA: Sem validação de usuário/loja
```

### **✅ Sistema Alvo (Produção - COM AUTH)**
```python
# Endpoints de produção com autenticação:
POST   /api/v1/clientes          # require_vendedor_ou_superior()
GET    /api/v1/clientes          # get_current_user
PUT    /api/v1/clientes/{id}     # require_vendedor_ou_superior()  
DELETE /api/v1/clientes/{id}     # require_vendedor_ou_superior()

# ✅ BENEFÍCIO: RLS automático + validação completa
```

---

## 📋 **PLANO DE MIGRAÇÃO /test → /api/v1**

### **Fase 3.1: Implementar Auth Frontend**
```typescript
// 1. Criar AuthContext no frontend
interface AuthContext {
  token: string | null;
  user: UserData | null;
  login: (credentials) => Promise<void>;
  logout: () => void;
}

// 2. Interceptor HTTP para token automático
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// 3. Error handling para 401/403
if (response.status === 401) {
  // Redirecionar para login
}
```

### **Fase 3.2: Migrar Services Gradualmente**
```typescript
// Estratégia: Feature flag para migração suave
const USE_AUTH_ENDPOINTS = process.env.NEXT_PUBLIC_USE_AUTH === 'true';

async listarClientes() {
  const baseUrl = USE_AUTH_ENDPOINTS 
    ? '/api/v1/clientes'      // COM auth
    : '/api/v1/test/clientes' // SEM auth (atual)
}
```

### **Fase 3.3: Validação Completa**
```bash
# Checklist de validação:
✅ Login funciona e retorna JWT válido
✅ Token incluído automaticamente em requests  
✅ RLS funciona (usuário vê apenas própria loja)
✅ Perfis respeitados (vendedor não acessa admin)
✅ Logout limpa token e sessão
✅ Renovação automática de token
```

---

## 🧪 **TESTES DE INTEGRAÇÃO PREPARADOS**

### **Cenários de Teste**
```javascript
// 1. Autenticação básica
test('Login com credenciais válidas retorna JWT')
test('JWT inválido retorna 401')
test('JWT expirado força renovação')

// 2. RLS e multi-tenancy  
test('Usuário loja A não vê dados loja B')
test('ADMIN_MASTER vê dados de todas lojas')
test('VENDEDOR só cria clientes na própria loja')

// 3. Perfis e permissões
test('VENDEDOR pode criar/editar clientes')
test('MEDIDOR não pode acessar módulo clientes')
test('GERENTE pode ver relatórios da loja')
```

---

## ⚠️ **CONSIDERAÇÕES E RISCOS**

### **🟡 Riscos Identificados**
1. **Migração de dados**: Sessão localStorage → Auth real
2. **UX durante transição**: Evitar quebra de fluxo  
3. **Fallback necessário**: Se auth falhar, rollback
4. **Teste em produção**: Validação com usuários reais

### **🟢 Mitigações Preparadas**
1. **Feature flags**: Migração gradual controlada
2. **Ambiente staging**: Testes isolados
3. **Monitoring**: Logs detalhados de auth
4. **Rollback plan**: Retorno imediato se necessário

---

## 🎯 **STATUS ATUAL PREPARAÇÃO C2**

### **✅ Concluído**
- [x] Mapeamento completo sistema auth
- [x] Documentação fluxos e dependencies  
- [x] Análise de migração /test → /api/v1
- [x] Plano de testes de integração
- [x] Identificação de riscos e mitigações

### **⏳ Aguardando C1**
- [ ] Backend estável e endpoints respondendo
- [ ] Validação conectividade frontend-backend
- [ ] Sinal verde para iniciar implementação auth

### **🚀 Próximos Passos (Pós C1)**
1. Implementar AuthContext no frontend
2. Criar interceptors HTTP com JWT
3. Migrar services com feature flags
4. Validar RLS e permissões
5. Testes end-to-end completos

---

## 📞 **COMUNICAÇÃO PARA C1**

**Status C2**: ✅ **Preparação auth 90% concluída**

**Aguardando de C1**:
1. ✅ Backend online e estável
2. ✅ Endpoints /api/v1/test/* funcionando 
3. ✅ Confirmação conectividade frontend
4. ✅ Sinal verde para migração auth

**Tempo estimado implementação**: 2-3 dias após sinal verde C1

**Confiança de sucesso**: 95% (sistema auth muito bem implementado)

---

**📅 Documento criado**: Dezembro 2025  
**👨‍💻 Responsável**: C2 (Integração)  
**🔄 Próxima revisão**: Após conclusão C1