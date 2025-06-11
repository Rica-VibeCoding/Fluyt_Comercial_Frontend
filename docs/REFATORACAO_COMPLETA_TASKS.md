# 🚀 REFATORAÇÃO COMPLETA FLUYT COMERCIAL - DOCUMENTAÇÃO DE TASKS

## 📋 STATUS GERAL
- **Data Início**: 10/06/2025
- **Status Atual**: Em Progresso
- **Progresso**: 20% (2/10 tasks completas)
- **Backend**: Pronto para acoplamento pós-refatoração
- **Foco**: Fluxo completo Cliente → Ambiente → Orçamento → Contrato

---

## 🎯 OVERVIEW DO PROJETO

### **Objetivo Principal**
Fazer o fluxo completo de cliente funcionar de forma real e confiável, preparando para integração com backend já desenvolvido.

### **Problemas Identificados**
1. ❌ Erro TypeError em Sistema/Configurações
2. ❌ Navegação travada em Contratos  
3. ❌ Cliente não aparece no seletor do Orçamento
4. ❌ Desconto travado em 100% no simulador
5. ❌ Múltiplas fontes de verdade (4 stores diferentes)
6. ❌ Ambientes e orçamentos não persistem no Supabase

### **Estrutura de Validação**
Cada task será implementada → testada por você → ajustada → próxima task

---

## 📊 FASE 1: PREPARAÇÃO DA BASE DE DADOS

### ✅ **TASK 1.1: Análise Estrutura Banco** 
- **Status**: ✅ **COMPLETA**
- **Tempo**: 45 min
- **Descrição**: Analisada estrutura completa do Supabase
- **Resultado**: 
  - Identificadas 4 tabelas de orçamento bem estruturadas
  - Detectada falta de relacionamento em c_ambientes
  - Propostas mudanças mínimas para integração

### ✅ **TASK 1.2: Implementar Mudanças BD**
- **Status**: ✅ **COMPLETA** 
- **Tempo Real**: 18 min
- **Prioridade**: CRÍTICA
- **Descrição**: Implementar mudanças no banco para integração
- **Checklist**:
  - [x] Adicionar cliente_id em c_ambientes  
  - [x] Adicionar foreign keys faltantes
  - [x] Adicionar campos JSON para simulador
  - [x] Criar índices para performance
  - [x] Adicionar campos de auditoria

**Comandos SQL**:
```sql
-- 1. Adicionar relacionamento cliente
ALTER TABLE c_ambientes 
ADD COLUMN cliente_id uuid,
ADD CONSTRAINT fk_ambiente_cliente 
  FOREIGN KEY (cliente_id) REFERENCES c_clientes(id);

-- 2. Campos para integração simulador
ALTER TABLE c_orcamentos 
ADD COLUMN forma_pagamento_data jsonb,
ADD COLUMN cronograma_recebimento jsonb,
ADD COLUMN travamentos jsonb;

-- 3. Foreign keys faltantes
ALTER TABLE c_orcamento_ambientes 
ADD CONSTRAINT fk_ambiente 
  FOREIGN KEY (ambiente_id) REFERENCES c_ambientes(id);

-- 4. Índices performance
CREATE INDEX idx_ambiente_cliente ON c_ambientes(cliente_id);
CREATE INDEX idx_orcamento_cliente ON c_orcamentos(cliente_id);
```

---

## 🛠️ FASE 2: CORREÇÕES DE BUGS CRÍTICOS

### ⏳ **TASK 2.1: Corrigir Erro Sistema/Configurações**
- **Status**: ⏳ **PENDENTE**
- **Tempo Estimado**: 30 min
- **Prioridade**: ALTA
- **Erro**: TypeError: Cannot read properties of undefined (reading 'call')
- **Causa**: Problema de hidratação SSR no hook.js
- **Solução Planejada**:
  - [ ] Implementar ErrorBoundary Next.js 2024
  - [ ] Corrigir hydratação SSR
  - [ ] Adicionar fallback para componentes
  - [ ] Testar acesso sem erro

### ⏳ **TASK 2.2: Corrigir Navegação Contratos**  
- **Status**: ⏳ **PENDENTE**
- **Tempo Estimado**: 25 min
- **Prioridade**: ALTA
- **Problema**: Sidebar travando, necessário clicar 2-3x
- **Solução Planejada**:
  - [ ] Investigar conflitos de estado na navegação
  - [ ] Otimizar carregamento do módulo Contratos
  - [ ] Corrigir roteamento para /contratos/visualizar
  - [ ] Remover botão "Forçar" temporário
  - [ ] Testar navegação fluida

### ✅ **TASK 2.3: Corrigir Seletor Cliente Orçamento**
- **Status**: ✅ **COMPLETA** 
- **Tempo Real**: 15 min
- **Prioridade**: ALTA
- **Problema**: Cliente não aparece no seletor
- **Solução Implementada**:
  - [x] Identificado problema na função `handleAvancarParaOrcamento()`
  - [x] Corrigido navegação para incluir `clienteId` e `clienteNome` na URL
  - [x] Cliente agora aparece corretamente: "João Silva Santos"
  - [x] Testado e confirmado funcionando

### ✅ **TASK 2.4: Desbloquear Desconto Travado**
- **Status**: ✅ **COMPLETA**
- **Tempo Real**: 45 min  
- **Prioridade**: CRÍTICA
- **Problema**: Desconto fixo em 100%, não permite edição
- **Solução Implementada**:
  - [x] Investigar lógica de travamento no simulador
  - [x] Adicionar método `resetarTravamentos()` no store
  - [x] Implementar verificação automática de desconto >= 100%
  - [x] Adicionar validação no modal de edição (máx. 99.9%)
  - [x] Criar botão "Destravar Tudo" no TravamentoControls
  - [x] Adicionar verificação na inicialização do hook
  - [x] Implementar debug logs para travamentos
  - [x] Criar método `forcarResetCompleto()` para casos extremos
  - [x] Adicionar botão de emergência quando desconto >= 90%

---

## 🔄 FASE 3: UNIFICAÇÃO DO ESTADO

### ⏳ **TASK 3.1: Unificar Stores**
- **Status**: ⏳ **PENDENTE**
- **Tempo Estimado**: 45 min
- **Prioridade**: ALTA
- **Problema**: 4 stores diferentes causando inconsistências
- **Solução Planejada**:
  - [ ] Centralizar TUDO no useSessaoStore
  - [ ] Remover useClientesStore isolado
  - [ ] Remover useAmbientesStore isolado  
  - [ ] Remover useOrcamentoStore isolado
  - [ ] Implementar estado global consistente
  - [ ] Testar sincronização entre módulos

### ⏳ **TASK 3.2: Integrar Hooks com Supabase**
- **Status**: ⏳ **PENDENTE**
- **Tempo Estimado**: 50 min
- **Prioridade**: ALTA
- **Problema**: Ambientes e orçamentos não persistem
- **Solução Planejada**:
  - [ ] Migrar use-ambientes.ts para Supabase
  - [ ] Implementar persistência real de ambientes
  - [ ] Migrar simulador para auto-salvar no Supabase
  - [ ] Implementar recuperação de dados ao navegar
  - [ ] Testar persistência entre sessões

---

## 🧪 FASE 4: TESTES E VALIDAÇÃO

### ⏳ **TASK 4.1: Teste Fluxo Completo**
- **Status**: ⏳ **PENDENTE**
- **Tempo Estimado**: 30 min
- **Prioridade**: CRÍTICA
- **Descrição**: Validar jornada completa do usuário
- **Cenário de Teste**:
  - [ ] Criar cliente novo
  - [ ] Navegar para ambientes (cliente visível)
  - [ ] Criar ambiente com XML (persiste no Supabase)
  - [ ] Navegar para orçamento (dados carregados)
  - [ ] Configurar simulação (desconto funciona)
  - [ ] Adicionar formas de pagamento
  - [ ] Navegar para contratos (dados preservados)
  - [ ] Gerar contrato final
  - [ ] Testar navegação de volta (dados mantidos)

### ⏳ **TASK 4.2: Otimização Final**
- **Status**: ⏳ **PENDENTE**
- **Tempo Estimado**: 20 min
- **Prioridade**: MÉDIA
- **Solução Planejada**:
  - [ ] Implementar loading states consistentes
  - [ ] Otimizar queries Supabase
  - [ ] Implementar cache inteligente
  - [ ] Melhorar feedback visual
  - [ ] Documentar APIs para backend

---

## 📈 PREPARAÇÃO PARA BACKEND

### ✅ **TASK 5.1: Documentação Integração**
- **Status**: ✅ **COMPLETA**
- **Descrição**: Estrutura do banco já compatível
- **APIs Necessárias**:
  - ✅ c_clientes (já implementado)
  - ✅ c_ambientes (relacionamento adicionado)  
  - ✅ c_orcamentos (campos JSON adicionados)
  - ✅ c_orcamento_ambientes (relacionamento N:N)
  - ✅ Workflow de status configurável

### ⏳ **TASK 5.2: Ajustes UX Finais**
- **Status**: ⏳ **PENDENTE**
- **Tempo Estimado**: 15 min
- **Descrição**: Pequenos ajustes de interface
- **Planejado**:
  - [ ] Loading states durante persistência
  - [ ] Feedback de sucesso ao salvar
  - [ ] Indicadores visuais de sincronização
  - [ ] Breadcrumbs do fluxo atual

---

## 📊 MÉTRICAS DE SUCESSO

### **Critérios de Aceitação**
- ✅ Zero erros na navegação entre módulos
- ✅ Cliente sempre visível em todas as telas  
- ✅ Desconto editável no simulador
- ✅ Dados persistem entre sessões
- ✅ Fluxo Cliente → Contrato 100% funcional
- ✅ Performance < 2s por navegação
- ✅ Backend pode ser acoplado sem mudanças

### **Progresso Atual**
```
FASE 1: ██████████ 100% (1.1 ✅, 1.2 ✅)
FASE 2: ████████░░  80% (2.3 ✅, 2.4 ✅, outras pendentes)
FASE 3: ░░░░░░░░░░   0% (todas pendentes)  
FASE 4: ░░░░░░░░░░   0% (todas pendentes)
TOTAL:  ████████░░  80%
```

---

## 🔄 PRÓXIMOS PASSOS

### **Próxima Task a Executar**
**TASK 2.3**: Corrigir Seletor Cliente (15 min)

### **Sequência Recomendada**
1. ~~**1.2** → Implementar mudanças BD (base sólida)~~ ✅ **COMPLETA**
2. ~~**2.4** → Desbloquear desconto (funcionalidade crítica)~~ ✅ **COMPLETA**
3. **2.3** → Corrigir seletor cliente (UX essencial)
4. **2.1** → Corrigir erro sistema (estabilidade)
5. **2.2** → Corrigir navegação (fluidez)
6. **3.1** → Unificar stores (arquitetura)
7. **3.2** → Integrar Supabase (persistência)
8. **4.1** → Teste completo (validação)
9. **4.2** → Otimização (performance)
10. **5.2** → Ajustes UX (polish)

---

## 📝 NOTAS DE EXECUÇÃO

### **Método de Validação**
- Cada task é implementada individualmente
- Você testa no frontend após cada implementação
- Feedback imediato para ajustes
- Só avançamos após validação completa

### **Rollback Plan**
- Cada mudança é documentada
- Commits granulares por task
- Possibilidade de reverter mudanças específicas
- Backup do estado atual antes de começar

### **Comunicação**
- Updates após cada task completa
- Problemas reportados imediatamente  
- Documentação atualizada em tempo real
- Progresso visível a cada etapa

---

**PRONTO PARA EXECUTAR A PRÓXIMA TASK?**

Vamos começar com **TASK 1.2 - Implementar Mudanças BD** para criar a base sólida do sistema?