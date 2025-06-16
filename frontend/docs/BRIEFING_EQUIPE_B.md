# 🔄 BRIEFING EQUIPE B - CLAUDE CODE

## 🎯 **SUA MISSÃO - GERENCIAMENTO DE DADOS**

**Você é a Equipe B (Claude Code)** - Responsável por **DADOS & ESTADO**

---

## 📊 **CONTEXTO ATUAL**

### ✅ **Equipe A (Claude Sonnet 4) - JÁ FEZ:**
- ✅ Refatoração estrutural (5 etapas concluídas)
- ✅ Criados: utilitários, hooks, componentes base
- ✅ Sistema funcionando 100% - **NÃO MEXER**

### 🎯 **SUA RESPONSABILIDADE:**
- 🔄 Migração `sessaoSimples` → `Zustand`
- 📊 Gerenciamento de estado centralizado
- 🚀 Preparação para Supabase
- ⚡ Otimização de performance

---

## 🚨 **REGRAS CRÍTICAS**

### ❌ **NÃO TOCAR:**
- `/src/components/modulos/orcamento/` - **ÁREA DA EQUIPE A**
- `/src/lib/` (formatters, validators, calculators) - **ÁREA DA EQUIPE A**
- `/src/hooks/modulos/orcamento/` - **ÁREA DA EQUIPE A**

### ✅ **SUA ÁREA:**
- `/src/stores/` - Criar stores Zustand
- `/src/hooks/data/` - Hooks de dados
- `page.tsx` - Apenas lógica de estado
- Integração com Supabase

---

## 📋 **SUAS ETAPAS ESPECÍFICAS**

### 🔄 **ETAPA 9 - Migração Zustand** (⏱️ 120 min)
**🎯 Objetivo:** Substituir `sessaoSimples` por Zustand

**📝 Tarefas:**
1. Criar `/src/stores/orcamento-store.ts`
2. Migrar estado de `page.tsx` para store
3. Criar hooks: `useOrcamento()`, `useFormasPagamento()`
4. Atualizar `page.tsx` para usar store
5. Testar funcionamento

**📁 Arquivos a modificar:**
- `src/app/orcamento/page.tsx` (apenas estado)
- Criar: `src/stores/orcamento-store.ts`
- Criar: `src/hooks/data/use-orcamento.ts`

### 🏪 **ETAPA 10 - Store de Orçamento** (⏱️ 90 min)
**🎯 Objetivo:** Store específico para orçamento

**📝 Tarefas:**
1. Store para ambientes, valores, formas pagamento
2. Actions: adicionar, remover, calcular
3. Computed: totais, validações
4. Persistência local (localStorage)

### 🚀 **ETAPA 11 - Integração Supabase** (⏱️ 150 min)
**🎯 Objetivo:** Conectar com backend

**📝 Tarefas:**
1. Setup Supabase client
2. Schemas para orçamento
3. Sync store ↔ Supabase
4. Hooks de sincronização

### ⚡ **ETAPA 13 - Performance** (⏱️ 75 min)
**🎯 Objetivo:** Otimizar re-renders

**📝 Tarefas:**
1. Memoização de selectors
2. Dividir stores grandes
3. Lazy loading de dados
4. Cache inteligente

### 🔄 **ETAPA 14 - Integração Final** (⏱️ 90 min)
**🎯 Objetivo:** Conectar com trabalho da Equipe A

**📝 Tarefas:**
1. Integrar stores com componentes da Equipe A
2. Testes de integração
3. Validação completa
4. Deploy conjunto

---

## 🔄 **INTERFACE COM EQUIPE A**

### 📊 **Dados que você gerencia:**
```typescript
interface OrcamentoStore {
  // Dados principais
  ambientes: Ambiente[];
  formasPagamento: FormaPagamento[];
  totais: {
    valorTotal: number;
    valorPago: number;
    valorRestante: number;
  };
  
  // Actions
  adicionarAmbiente: (ambiente: Ambiente) => void;
  adicionarFormaPagamento: (forma: FormaPagamento) => void;
  calcularTotais: () => void;
}
```

### 🎯 **Componentes da Equipe A usarão:**
```typescript
// Hooks que você deve criar
const { ambientes, totais } = useOrcamento();
const { adicionarFormaPagamento } = useFormasPagamento();
```

---

## 📅 **CRONOGRAMA**

### 📅 **SEMANA 1:**
- Etapa 9: Migração Zustand

### 📅 **SEMANA 2:**
- Etapa 10: Store de Orçamento  
- Etapa 11: Supabase (início)

### 📅 **SEMANA 3:**
- Etapa 11: Supabase (conclusão)
- Etapa 13: Performance
- Etapa 14: Integração final

---

## 🚨 **PONTOS DE ATENÇÃO**

### ⚠️ **Cuidados:**
1. **NÃO modificar** componentes da Equipe A
2. **NÃO alterar** interfaces dos modais existentes
3. **MANTER** compatibilidade com hooks existentes
4. **COORDENAR** antes de mudanças grandes

### 🔄 **Sincronização:**
- Avisar antes de modificar `page.tsx`
- Compartilhar tipos TypeScript novos
- Testar integração frequentemente

### 📝 **Documentação:**
- Documentar cada store criado
- Explicar fluxo de dados
- Manter changelog atualizado

---

## 🎯 **RESULTADO ESPERADO**

### ✅ **Ao final você terá:**
- 🏪 Store Zustand funcionando
- 📊 Estado centralizado e reativo
- 🚀 Integração Supabase completa
- ⚡ Performance otimizada
- 🔄 Sistema integrado com Equipe A

### 📈 **Benefícios:**
- Gerenciamento de estado profissional
- Preparação para escala
- Integração backend robusta
- Performance superior

---

## 📞 **COMUNICAÇÃO**

### 🔄 **Coordenação:**
- Avisar mudanças em `page.tsx`
- Compartilhar novos tipos
- Sincronizar antes de deploy

### 📝 **Documentação:**
- Atualizar `docs/REFATORACAO_ORÇAMENTO.md`
- Seção "Equipe B" com seu progresso
- Manter log de mudanças

---

## ✅ **ACEITA A MISSÃO?**

**🎯 Confirme se entendeu:**
1. ✅ Área de atuação definida
2. ✅ Cronograma claro
3. ✅ Interface com Equipe A
4. ✅ Resultado esperado

**🚀 Pronto para começar a Etapa 9?** 