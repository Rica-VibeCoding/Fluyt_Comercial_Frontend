# 🏢 Sistema Fluyt - Gestão Comercial

> **Projeto Principal**: Simulador Financeiro de Orçamentos empresarial em Next.js 15

## 🎯 Contexto Essencial

**Sistema unificado** consolidando 4 aplicações React separadas em uma plataforma Next.js modular com interface em português para gestão comercial empresarial.

## 🛠 Stack Core

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** + **Shadcn/ui** (Radix UI primitives)
- **TanStack Query** + **React Hook Form** + **Zod**
- **Interface**: 100% português brasileiro

## 📁 Estrutura Essencial

```
src/
├── app/painel/                 # Next.js App Router
│   ├── orcamento/simulador/    # 💰 ATIVO - Simulador principal
│   ├── clientes/               # 👥 Estrutura básica
│   ├── ambientes/              # 🏢 Estrutura básica  
│   ├── contratos/              # 📋 Estrutura básica
│   └── sistema/                # ⚙️ Configurações
├── components/
│   ├── layout/sidebar.tsx      # Navegação principal
│   ├── modulos/orcamento/      # Componentes do simulador
│   └── ui/                     # Design system
├── hooks/modulos/orcamento/
│   └── use-simulador.ts        # 🧠 CORE - Lógica principal (477 linhas)
└── types/simulador.ts          # Tipagens principais
```

## 🧮 Módulo Principal: Simulador de Orçamentos

### Componentes Críticos
- `src/app/painel/orcamento/simulador/page.tsx` - Página principal (423 linhas)
- `src/hooks/modulos/orcamento/use-simulador.ts` - Lógica core (477 linhas)
- `src/components/modulos/orcamento/dashboard-orcamento.tsx` - Interface principal

### Funcionalidades Ativas
- **4 Formas de Pagamento**: ENTRADA, FINANCEIRA, CARTÃO, BOLETO
- **Cálculos Financeiros**: Valor presente, juros compostos, deflação
- **Sistema de Travamento**: Locks em valores específicos
- **Redistribuição Inteligente**: Algoritmo com prioridades
- **Interface Editável**: Click-to-edit nos valores principais

### Algoritmos Principais
```typescript
// Prioridade para redistribuição
const PRIORIDADE_FORMAS = ['ENTRADA', 'BOLETO', 'FINANCEIRA', 'CARTAO'];

// Cálculos por tipo de pagamento
- FINANCEIRA: VP = valor / (1 + taxa)^parcelas
- CARTAO: VR = valor * (1 - deflação) * (1 - juros * parcelas)
- BOLETO: VP = valor / (1 + custoCapital)^parcelas
```

## 📊 Status dos Módulos

| Módulo | Status | Descrição |
|--------|--------|-----------|
| 💰 Orçamentos | ✅ **ATIVO** | Simulador completo e funcional |
| 👥 Clientes | 🟡 Estrutura | Páginas básicas criadas |
| 🏢 Ambientes | 🟡 Estrutura | Páginas básicas criadas |
| 📋 Contratos | 🟡 Estrutura | Páginas básicas criadas |
| ⚙️ Sistema | 🟡 Estrutura | Páginas básicas criadas |

## 🎨 Convenções Importantes

### Nomenclatura
- **Arquivos**: `kebab-case` em português
- **Componentes**: `PascalCase` em português  
- **Hooks**: `camelCase` com prefixo `use`
- **URLs**: `/painel/modulo/funcionalidade`

### Padrões de Código
- **Hooks customizados** para lógica de negócio
- **Tipagem TypeScript** obrigatória
- **Formatação brasileira** (moeda R$, datas, números)
- **Responsividade** desktop-first

## 🔧 Contexto de Migração

### Origem
- **4 sistemas React separados** sendo consolidados
- **Pasta `src/migracao/`** contém código original
- **React Router → Next.js App Router**

### Foco Atual
- **Simulador de orçamentos** é o módulo prioritário e funcional
- **Demais módulos** têm estrutura básica preparada
- **Interface unificada** com sidebar de navegação

## 🚀 Para Desenvolvimento

### Arquivos Chave para Modificações
- `src/app/painel/orcamento/simulador/page.tsx` - Interface principal
- `src/hooks/modulos/orcamento/use-simulador.ts` - Lógica de negócio
- `src/components/layout/sidebar.tsx` - Navegação
- `src/types/simulador.ts` - Tipagens

### Scripts Disponíveis
```bash
npm run dev    # Desenvolvimento
npm run build  # Build produção  
npm run start  # Produção local
```

---
**Objetivo**: Sistema empresarial de gestão comercial com foco em simulação financeira de propostas. Interface profissional em português brasileiro.
