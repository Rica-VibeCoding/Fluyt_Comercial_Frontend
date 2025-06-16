# 🛡️ ESTRATÉGIA DE PRESERVAÇÃO DE CÓDIGO

## 🎯 OBJETIVO
Evitar perda de código durante refatoração do módulo de orçamento.

## 📁 ESTRUTURA ATUAL DE ARQUIVOS

### ✅ PÁGINAS PRESERVADAS
```
src/app/painel/orcamento/simulador/
├── page.tsx              # ← SISTEMA ULTRA SIMPLES (funcionando)
├── page-complexo.tsx     # ← BACKUP do sistema anterior  
└── page-minimal.tsx      # ← TESTE PROGRESSIVO (novo)
```

### ✅ MÓDULOS PRESERVADOS
```
src/components/modulos/orcamento/
├── ambiente-section.tsx           # ← MANTIDO
├── components/                    # ← MANTIDO
│   ├── desconto-input.tsx
│   ├── input-section-modular.tsx
│   └── valor-bruto-input.tsx
├── cronograma-recebimento.tsx     # ← MANTIDO
├── dashboard-orcamento.tsx        # ← MANTIDO
├── edit-value-modal.tsx           # ← MANTIDO
├── forma-pagamento-card.tsx       # ← MANTIDO
├── forma-pagamento-modal.tsx      # ← MANTIDO
├── formas-pagamento-section.tsx   # ← MANTIDO
├── input-section.tsx              # ← MANTIDO
├── simulador-header.tsx           # ← MANTIDO
└── travamento-controls.tsx        # ← MANTIDO
```

**Total: 1.891 linhas de código PRESERVADAS**

## 🚀 ESTRATÉGIA DE DESENVOLVIMENTO

### FASE 1: VALIDAÇÃO DE DADOS ✅
- ✅ `page-minimal.tsx` - Teste com header e etapas
- ✅ Card cliente funcional
- ✅ Barra de progresso visual

### FASE 2: PRÓXIMOS PASSOS
- [ ] Adicionar card de ambientes
- [ ] Adicionar card de valor total
- [ ] Validar todos os dados vindo da sessão

### FASE 3: LÓGICA NUMÉRICA
- [ ] Implementar cálculos básicos
- [ ] Reaproveitar algoritmos do código atual
- [ ] Manter apenas o que funciona

## 🔒 GARANTIAS DE SEGURANÇA

### ✅ NUNCA SERÁ PERDIDO:
1. **Algoritmos complexos** (busca binária, redistribuição)
2. **Lógica de negócio** (desconto real, valor recebido)
3. **Componentes funcionais** (cards de pagamento, cronograma)
4. **Sistema atual funcionando** (`page.tsx`)

### ✅ ESTRATÉGIA PROGRESSIVA:
1. **Manter** tudo funcionando
2. **Criar** em paralelo (não substituir)
3. **Testar** cada etapa isoladamente
4. **Migrar** apenas quando validado

## 🎯 LÓGICA NUMÉRICA PLANEJADA

```typescript
// FÓRMULAS PRESERVADAS
Valor Bruto = soma dos ambientes
Desconto (%) = aplicado pelo usuário 
Valor Negociado = Bruto - Desconto (%)
Valor Recebido = valor deflacionado das taxas
Desconto Real = Valor Bruto vs Valor Recebido 
Valor Restante = Valor Negociado - soma das Formas

// PRIORIDADES DE REDISTRIBUIÇÃO
1. À Vista / Dinheiro (Entrada)
2. Financeira / Banco
3. Cartão de Crédito
4. Boleto da Loja
```

## 🔄 VERSIONAMENTO IMPLÍCITO

```
page.tsx          → Versão ULTRA SIMPLES (atual)
page-complexo.tsx → Versão anterior (backup)
page-minimal.tsx  → Versão progressiva (teste)
```

## ⚠️ PONTOS DE ATENÇÃO

1. **Contexto futuro**: Documentar TUDO para próximos chats
2. **Algoritmos**: Extrair para lib separada se necessário
3. **Testes**: Validar cada componente antes de avançar
4. **Backup**: Git commits frequentes

## 📋 NEXT STEPS

1. ✅ Testar `page-minimal.tsx`
2. [ ] Adicionar card ambientes
3. [ ] Adicionar card valor total
4. [ ] Implementar lógica numérica
5. [ ] Migrar gradualmente

---

**COMPROMISSO**: Zero perda de código. Máxima preservação.