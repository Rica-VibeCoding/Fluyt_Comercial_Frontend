# ✅ CHECKLIST DE VALIDAÇÃO - FASE 3 AUTENTICAÇÃO

**Preparado por**: C2 (Integração)  
**Para**: Validação completa da migração auth  
**Status**: Lista executável pronta

---

## 🎯 **OBJETIVOS DA VALIDAÇÃO**

### **✅ Critérios de Sucesso Fase 3**
1. **Autenticação funcional** - Login/logout sem problemas
2. **RLS operacional** - Isolamento por loja garantido  
3. **CRUD mantido** - Todas operações funcionando
4. **UX preservada** - Zero quebra de experiência
5. **Performance aceitável** - Latência < 500ms adicional
6. **Rollback pronto** - Volta funcional em < 5min

---

## 🔐 **SEÇÃO 1: AUTENTICAÇÃO E JWT**

### **1.1 Login e Logout**
```bash
# Teste manual básico
✅ [ ] Abrir /login
✅ [ ] Inserir credenciais válidas (vendedor@dartmoveis.com.br)
✅ [ ] Verificar redirecionamento para dashboard
✅ [ ] Confirmar token salvo no localStorage
✅ [ ] Fazer logout
✅ [ ] Verificar token removido e redirecionamento

# Teste automático
npm test auth-integration.test.ts
✅ [ ] Todos testes de login passando
```

### **1.2 Validação de Token**
```bash
✅ [ ] Token válido permite acesso a /api/v1/clientes
✅ [ ] Token inválido retorna 401
✅ [ ] Token expirado força renovação ou logout
✅ [ ] Headers Authorization enviados automaticamente
✅ [ ] Interceptor funciona em todas requisições
```

### **1.3 Recuperação de Sessão**
```bash
✅ [ ] Refresh página mantém usuário logado
✅ [ ] Token no localStorage carregado na inicialização
✅ [ ] User data recuperado corretamente
✅ [ ] Estado auth consistente entre abas
```

---

## 🏢 **SEÇÃO 2: RLS E MULTI-TENANCY**

### **2.1 Isolamento por Loja**
```bash
# Cenário 1: Usuário Loja A
✅ [ ] Login como vendedor@dartmoveis.com.br
✅ [ ] Listar clientes - verificar só loja A
✅ [ ] Criar cliente - verificar loja_id automática
✅ [ ] Tentar acessar cliente loja B - deve falhar

# Cenário 2: Usuário Loja B  
✅ [ ] Login como vendedor@romanzamoveis.com.br
✅ [ ] Listar clientes - verificar só loja B
✅ [ ] Não ver clientes da loja A
✅ [ ] Criar cliente - loja_id B automática
```

### **2.2 Permissões Admin Master**
```bash
✅ [ ] Login como admin@fluyt.com.br
✅ [ ] Listar clientes - ver todas as lojas
✅ [ ] Verificar múltiplas loja_id nos resultados
✅ [ ] Criar cliente em qualquer loja
✅ [ ] Acessar dados cross-tenant
```

### **2.3 Validação de Acesso**
```bash
✅ [ ] Vendedor não acessa dados de outras lojas
✅ [ ] Gerente só vê dados da própria loja
✅ [ ] MEDIDOR não acessa módulo clientes
✅ [ ] Erro 403 para acessos negados
```

---

## 💼 **SEÇÃO 3: CRUD AUTENTICADO**

### **3.1 Listar Clientes (GET /api/v1/clientes)**
```bash
✅ [ ] Endpoint responde corretamente
✅ [ ] Apenas clientes da loja do usuário
✅ [ ] Filtros funcionando (nome, cidade, etc)
✅ [ ] Paginação operacional
✅ [ ] Ordenação mantida
✅ [ ] Performance < 500ms
```

### **3.2 Criar Cliente (POST /api/v1/clientes)**
```bash
✅ [ ] Validações Pydantic funcionando
✅ [ ] Campo loja_id preenchido automaticamente
✅ [ ] CPF/CNPJ único por loja
✅ [ ] Dados obrigatórios validados
✅ [ ] Resposta com cliente criado
✅ [ ] Cliente aparece na listagem
```

### **3.3 Atualizar Cliente (PUT /api/v1/clientes/{id})**
```bash
✅ [ ] Só atualiza clientes da própria loja
✅ [ ] Campos opcionais funcionam
✅ [ ] Validações aplicadas na atualização
✅ [ ] updated_at atualizado
✅ [ ] Dados consistentes após update
```

### **3.4 Excluir Cliente (DELETE /api/v1/clientes/{id})**
```bash
✅ [ ] Soft delete aplicado (deleted_at)
✅ [ ] Só exclui clientes da própria loja
✅ [ ] Verifica orçamentos associados
✅ [ ] Cliente some da listagem
✅ [ ] Dados mantidos no banco (audit)
```

### **3.5 Busca Específica (GET /api/v1/clientes/buscar/cpf-cnpj)**
```bash
✅ [ ] Busca funciona com auth
✅ [ ] Só retorna da própria loja
✅ [ ] CPF/CNPJ não encontrado = 404
✅ [ ] Validação de formato
```

---

## 🔄 **SEÇÃO 4: MIGRAÇÃO E FEATURE FLAGS**

### **4.1 Endpoints de Teste (Atual)**
```bash
# Com NEXT_PUBLIC_USE_AUTH=false
✅ [ ] POST /api/v1/test/cliente funciona
✅ [ ] GET /api/v1/test/clientes funciona  
✅ [ ] PUT /api/v1/test/cliente/{id} funciona
✅ [ ] DELETE /api/v1/test/cliente/{id} funciona
✅ [ ] Frontend usa endpoints teste
```

### **4.2 Endpoints Autenticados (Alvo)**
```bash
# Com NEXT_PUBLIC_USE_AUTH=true
✅ [ ] Login obrigatório
✅ [ ] POST /api/v1/clientes funciona
✅ [ ] GET /api/v1/clientes funciona
✅ [ ] PUT /api/v1/clientes/{id} funciona
✅ [ ] DELETE /api/v1/clientes/{id} funciona
✅ [ ] Frontend usa endpoints auth
```

### **4.3 Fallback Automático**
```bash
# Com NEXT_PUBLIC_AUTH_MIGRATION_MODE=true
✅ [ ] Auth falha detectada
✅ [ ] Fallback para endpoints teste
✅ [ ] Funcionalidade mantida
✅ [ ] Warning no console
✅ [ ] UX sem quebra
```

---

## 🎨 **SEÇÃO 5: EXPERIÊNCIA DO USUÁRIO**

### **5.1 Fluxo de Login**
```bash
✅ [ ] Tela de login acessível
✅ [ ] Campos validados (email, senha)
✅ [ ] Loading state durante login
✅ [ ] Erro tratado e exibido
✅ [ ] Success redireciona automaticamente
✅ [ ] Mensagem de boas-vindas
```

### **5.2 Tela de Clientes**
```bash
✅ [ ] Lista carrega automaticamente
✅ [ ] Botões CRUD visíveis
✅ [ ] Modal criar cliente funciona
✅ [ ] Modal editar cliente funciona
✅ [ ] Confirmação de exclusão
✅ [ ] Toast notifications funcionam
```

### **5.3 Estados de Loading**
```bash
✅ [ ] Skeleton durante carregamento
✅ [ ] Spinner em operações CRUD
✅ [ ] Disabled state em botões
✅ [ ] Feedback visual adequado
✅ [ ] Timeout tratado
```

### **5.4 Tratamento de Erros**
```bash
✅ [ ] 401 → Redireciona para login
✅ [ ] 403 → Mensagem acesso negado
✅ [ ] 500 → Erro interno tratado
✅ [ ] Network error → Retry/offline
✅ [ ] Validation error → Campo destacado
```

---

## ⚡ **SEÇÃO 6: PERFORMANCE E MONITORAMENTO**

### **6.1 Métricas de Performance**
```bash
✅ [ ] Login < 1s
✅ [ ] Listar clientes < 500ms
✅ [ ] Criar cliente < 300ms
✅ [ ] Atualizar cliente < 300ms
✅ [ ] Bundle size mantido
✅ [ ] First load < 2s
```

### **6.2 Monitoramento Auth**
```bash
✅ [ ] Taxa sucesso login > 95%
✅ [ ] Latência auth < 200ms
✅ [ ] Erros 401/403 < 1%
✅ [ ] Logs detalhados auth
✅ [ ] Métricas RLS funcionando
```

### **6.3 Cache e Otimização**
```bash
✅ [ ] Token cached localStorage
✅ [ ] User data cached context
✅ [ ] API responses cached
✅ [ ] Debounce em filtros
✅ [ ] Pagination eficiente
```

---

## 🔧 **SEÇÃO 7: ROLLBACK E CONTINGÊNCIA**

### **7.1 Planos de Rollback**
```bash
# Nível 1: Feature Flag
✅ [ ] NEXT_PUBLIC_USE_AUTH=false funciona
✅ [ ] Sistema volta para endpoints teste
✅ [ ] Tempo de rollback < 30s

# Nível 2: Deploy Anterior  
✅ [ ] Deploy anterior disponível
✅ [ ] Rollback Vercel < 5min
✅ [ ] Dados preservados

# Nível 3: Fallback Mode
✅ [ ] MIGRATION_MODE ativa automaticamente
✅ [ ] Funcionalidade básica mantida
✅ [ ] Monitoramento de falhas
```

### **7.2 Validação Pós-Rollback**
```bash
✅ [ ] Endpoints teste respondendo
✅ [ ] CRUD básico funcionando  
✅ [ ] Frontend conectado
✅ [ ] Usuários não impactados
✅ [ ] Logs indicam rollback ativo
```

---

## 📊 **SEÇÃO 8: RELATÓRIO FINAL**

### **8.1 Métricas de Sucesso**
```bash
Total de testes: ___/100
Sucessos: ___
Falhas: ___
Performance OK: ___
RLS validado: ___
UX preservada: ___
```

### **8.2 Problemas Identificados**
```
1. ________________________________
   Severidade: Alta/Média/Baixa
   Ação: _____________________________

2. ________________________________
   Severidade: Alta/Média/Baixa  
   Ação: _____________________________

3. ________________________________
   Severidade: Alta/Média/Baixa
   Ação: _____________________________
```

### **8.3 Decisão Final**
```
✅ [ ] APROVADO - Migração bem-sucedida
      Pode ativar NEXT_PUBLIC_USE_AUTH=true

❌ [ ] REPROVADO - Problemas críticos
      Manter endpoints teste até correção

⚠️ [ ] APROVADO COM RESSALVAS
      Ativar com MIGRATION_MODE=true
```

---

## 🎯 **INSTRUÇÕES DE EXECUÇÃO**

### **Para C1 e C2**
1. **Executar juntos** - Validação coordenada
2. **Ambiente staging** - Não impactar desenvolvimento
3. **Documentar problemas** - Lista detalhada
4. **Decisão consensual** - Ambos aprovam migração

### **Timeline Sugerida**
- **Setup**: 30min (preparar ambiente)
- **Execução**: 2-3h (todos os testes)
- **Análise**: 30min (discussão problemas)
- **Decisão**: 15min (go/no-go migração)

### **Critério Go/No-Go**
- **Go**: 90%+ testes passando, sem críticos
- **No-Go**: Qualquer falha crítica RLS/Auth
- **Ressalvas**: 80-90% + migration mode ativo

---

**📅 Checklist criado**: Dezembro 2025  
**👨‍💻 Responsável**: C2 (Integração)  
**🤝 Validação**: C1 + C2 juntos  
**🚀 Status**: Pronto para execução pós-backend estável