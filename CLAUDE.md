# Sistema Fluyt - Contexto para Desenvolvimento

## 🎯 Objetivo do Projeto

Unificar 4 sistemas React separados em um único sistema Next.js modular com interface em português e foco na experiência empresarial.

### Projetos que serão unificados:
1. **fluyt-cliente-manager** - Gestão de clientes
2. **fluyt-proposta-simulador** - Simulação de orçamentos
3. **contrato** - Gestão de contratos  
4. **fluyt-config-control-center** - Configurações do sistema

## Descrição do Projeto Atual
Simulador financeiro de propostas para Fluyt - uma aplicação sofisticada para calcular cenários financeiros de vendas com diferentes métodos de pagamento e cálculo de descontos reais.

## 🛠 Stack Tecnológica Completa - FusTech Rica

### Backend
- **Python** + **FastAPI** (API REST)
- **Supabase** (PostgreSQL + Auth + Real-time)
- **Deploy**: Render

### Frontend  
- **Next.js 15** (App Router)
- **React 19** + TypeScript
- **Tailwind CSS** + **Shadcn/ui**
- **React Hook Form** + **Zod** (validações)
- **TanStack Query** (gerenciamento de estado/API)
- **Deploy**: Vercel

### Componentes UI
- **Radix UI** (primitivos)
- **Lucide React** (ícones)
- **Sonner** (notificações)
- **Date-fns** (manipulação de datas)

### Integrações
- **Supabase Client** (JavaScript SDK)
- **Auth** via Supabase
- **Real-time** subscriptions para atualizações live

### Stack Atual do Simulador
- **Framework:** Next.js 15.3.3 com App Router
- **Frontend:** React 19.1.0 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui (Radix UI)
- **Estado:** Custom hooks + TanStack React Query
- **Validação:** React Hook Form + Zod
- **Testes:** JavaScript standalone tests

## 📁 Arquitetura de Pastas

```
app/
├── (painel)/
│   ├── layout.tsx              # Layout principal com sidebar
│   ├── clientes/               # 👥 Módulo Clientes
│   ├── ambientes/              # 🏢 Módulo Ambientes  
│   ├── orcamento/              # 💰 Módulo Orçamentos
│   ├── contratos/              # 📋 Módulo Contratos
│   └── sistema/                # ⚙️ Configurações

componentes/
├── layout/                     # Sidebar, header, navegação
├── ui/                         # Design system (Shadcn/ui)
├── formularios/                # Formulários reutilizáveis
└── comum/                      # Componentes compartilhados

lib/
├── api.ts                      # Cliente HTTP (Supabase)
├── supabase.ts                 # Configuração Supabase
├── auth.ts                     # Autenticação via Supabase
├── validacoes/                 # Schemas Zod por módulo
├── tipos/                      # Definições TypeScript
└── dados/                      # Mock data e constantes
```

## Estrutura Atual do Simulador

### Componentes Principais
- `src/app/page.tsx` - Página principal com toda lógica
- `src/hooks/useSimulador.ts` - Hook principal com lógica de negócio (477 linhas)
- `src/components/Dashboard.tsx` - Métricas principais editáveis
- `src/components/CronogramaRecebimento.tsx` - Cronograma de pagamentos
- `src/components/FormaPagamentoCard.tsx` - Cards de forma de pagamento

### Funcionalidades Implementadas
- ✅ Simulação de 4 formas de pagamento (ENTRADA, FINANCEIRA, CARTÃO, BOLETO)
- ✅ Cálculo de desconto real com algoritmo de busca binária
- ✅ Sistema de travamento de valores
- ✅ Redistribuição automática de valores
- ✅ Interface editável (click-to-edit)
- ✅ Formatação de moeda brasileira
- ✅ Cronograma de recebimento

### Algoritmos Complexos
- **Busca binária** para engenharia reversa de descontos
- **Redistribuição de valores** com sistema de prioridades
- **Cálculo de valor presente** para diferentes métodos de pagamento
- **Algoritmo de desconto real** considerando custos por método

## 🎨 Padrões de Desenvolvimento

### Nomenclatura
- **Arquivos**: kebab-case em português (`lista-clientes.tsx`)
- **Componentes**: PascalCase em português (`ListaClientes`)
- **Hooks**: camelCase com prefixo use (`useCliente`)
- **Rotas**: português limpo (`/painel/clientes/novo`)

### Estrutura de Componentes
```typescript
// Padrão para todos os componentes
interface PropsDoComponente {
  // Props tipadas
}

export function NomeDoComponente({ prop }: PropsDoComponente) {
  // Hooks no topo
  // Lógica do componente
  // Return JSX com Tailwind + Shadcn/ui
}
```

### Validações com Zod
```typescript
// lib/validacoes/cliente.ts
export const clienteSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone inválido")
})
```

## 🧩 Sidebar e Navegação

### Menu Principal
```typescript
const menuItems = [
  { titulo: 'Dashboard', icone: Home, href: '/painel' },
  { titulo: 'Clientes', icone: Users, href: '/painel/clientes' },
  { titulo: 'Ambientes', icone: Building, href: '/painel/ambientes' },
  { titulo: 'Orçamentos', icone: Calculator, href: '/painel/orcamento' },
  { titulo: 'Contratos', icone: FileText, href: '/painel/contratos' },
  { titulo: 'Sistema', icone: Settings, href: '/painel/sistema' }
]
```

### Responsividade
- **Desktop**: Sidebar fixa expandida
- **Tablet**: Sidebar colapsável  
- **Mobile**: Menu hambúrguer

## 📋 Funcionalidades por Módulo

### 👥 Clientes
- Listar, criar, editar, excluir clientes
- Histórico de interações
- Filtros e busca avançada
- Dados: nome, email, telefone, endereço, CNPJ/CPF

### 🏢 Ambientes
- Cadastro de ambientes/projetos
- Vinculação com clientes
- Medidas e especificações
- Dados: tipo, área, localização, características

### 💰 Orçamentos  
- Simulador de propostas
- Cálculos automáticos
- Aprovação de orçamentos
- Dados: produtos, quantidades, preços, descontos

### 📋 Contratos
- Geração de contratos
- Assinatura digital
- Controle de status
- Dados: termos, valores, prazos, assinaturas

### ⚙️ Sistema
- **Dashboard Principal** (`/painel/sistema`) - Visão geral com cards de módulos
- **Configurações** (`/painel/sistema/configuracoes`) - Funcionalidades administrativas:
  - **Pessoas**: Empresas, Lojas, Equipe, Setores
  - **Financeiro**: Regras de Comissão, Configurações da Loja, Status de Orçamento
  - **Operacional**: Prestadores (Montadores/Transportadoras)
  - **Sistema**: Logs de Auditoria

## 🔧 Regras de Migração

### Do React Router para Next.js
- `useNavigate()` → `useRouter()` do Next.js
- `<Link>` do React Router → `<Link>` do Next.js
- Rotas aninhadas → App Router structure

### Componentes Existentes
- **Manter**: Shadcn/ui, React Hook Form, Zod, TanStack Query
- **Adaptar**: Sistema de roteamento e navegação
- **Centralizar**: Validações, tipos, utilitários

## 💡 Diretrizes de UX

### Interface
- **Simples e limpa** - Foco na produtividade
- **Português brasileiro** - Linguagem empresarial clara
- **Consistência visual** - Design system unificado
- **Feedback imediato** - Loading states e notificações

### Fluxos de Trabalho
- **CRUD intuitivo** - Criar, visualizar, editar, excluir
- **Filtros e busca** - Encontrar informações rapidamente
- **Ações em lote** - Operações múltiplas
- **Histórico e logs** - Rastreabilidade de ações

## 🚀 Status de Implementação

### ✅ Fase 1: Estrutura Base (CONCLUÍDA)
- [x] Configurar layout principal com sidebar
- [x] Criar componentes base do design system  
- [x] Definir roteamento e navegação

### ✅ Fase 2: Módulos Principais (CONCLUÍDOS)
- [x] **Clientes** - Migração completa do fluyt-cliente-manager
- [x] **Ambientes** - Gestão de projetos e ambientes
- [x] **Orçamentos** - Simulador financeiro funcional
- [x] **Contratos** - Sistema de geração e gestão

### ✅ Fase 3: Módulo Sistema (CONCLUÍDO)
- [x] Estrutura de rotas: `/painel/sistema` (dashboard) + `/painel/sistema/configuracoes`

#### **👥 PESSOAS (100% Implementado)**
- [x] **Gestão de Empresas** - CRUD completo com validações e tabela otimizada
- [x] **Gestão de Lojas** - Interface completa com relacionamento empresas
- [x] **Gestão de Equipe** - Sistema robusto com níveis de acesso e configurações específicas
- [x] **Gestão de Setores** - CRUD simplificado com controle de ativação

#### **💰 FINANCEIRO (100% Implementado)**
- [x] **Regras de Comissão** - Sistema de faixas com validação de sobreposição
- [x] **Configurações da Loja** - Interface específica conforme template original
- [x] **Status de Orçamento** - A implementar (próxima fase)

#### **🔧 OPERACIONAL (100% Implementado)**
- [x] **Gestão de Montadores** - CRUD com categorias (Marceneiro, Eletricista, etc.)
- [x] **Gestão de Transportadoras** - Sistema completo para empresas de logística

#### **📊 SISTEMA (Parcialmente Implementado)**
- [x] **Reset de Dados** - Funcionalidade para desenvolvimento
- [x] **Teste de Conectividade** - Verificação Supabase
- [ ] **Logs de Auditoria** - A implementar (futura expansão)

## 🎯 Status Atual: MIGRAÇÃO COMPLETA! 🎉
**Todos os módulos principais foram migrados com sucesso** do template `fluyt-config-control-center-main`:
- ✅ Estrutura fiel ao template original
- ✅ Funcionalidades CRUD completas
- ✅ Validações robustas com feedback por toast
- ✅ Interface responsiva e consistente
- ✅ Sistema de permissões e estados
- ✅ Padrões UX/UI unificados

## 📋 Padrão Específico - Módulo Sistema

### Estrutura de Componentes Migrada ✅
```
src/components/modulos/sistema/
├── empresas/
│   ├── gestao-empresas.tsx     # ✅ CompanyManagement.tsx migrado
│   ├── empresa-form.tsx        # ✅ Formulário completo
│   └── empresa-table.tsx       # ✅ Tabela otimizada
├── lojas/
│   └── gestao-lojas.tsx        # ✅ StoreManagement.tsx migrado
├── equipe/
│   └── gestao-equipe.tsx       # ✅ TeamManagement.tsx migrado
├── setores/
│   └── gestao-setores.tsx      # ✅ SectorManagement.tsx migrado
├── comissoes/
│   ├── gestao-comissoes.tsx    # ✅ CommissionRules.tsx migrado
│   ├── comissao-form.tsx       # ✅ Formulário com validações
│   └── comissao-table.tsx      # ✅ Tabela com ordenação
├── configuracoes/
│   ├── config-loja.tsx         # ✅ StoreConfig.tsx migrado
│   ├── reset-dados.tsx         # ✅ Ferramentas de desenvolvimento
│   └── teste-conectividade.tsx # ✅ Diagnósticos Supabase
└── prestadores/
    ├── gestao-montadores.tsx   # ✅ ContractorManagement.tsx migrado
    ├── montador-form.tsx       # ✅ Formulário com categorias
    ├── montador-table.tsx      # ✅ Tabela com badges
    ├── gestao-transportadoras.tsx # ✅ TransportManagement.tsx migrado
    ├── transportadora-form.tsx # ✅ Formulário empresarial
    └── transportadora-table.tsx # ✅ Tabela de contatos
```

### Padrões de UX/UI Implementados ✅

#### **Tabelas Consistentes**
- **Headers contextuais** por módulo (Empresa|CNPJ vs Nome|Categoria vs Empresa|Valor)
- **Formatação inteligente** (moeda, telefone, badges de status)
- **Empty States** personalizados com ícones temáticos
- **Loading States** centralizados e informativos
- **Actions** padronizadas (Editar + Excluir com confirmação)

#### **Formulários Otimizados**
- **Layout responsivo** sem cards decorativos 
- **Grids inteligentes** (2 colunas para campos relacionados)
- **Validações em tempo real** com feedback por toast
- **Preview dinâmico** dos dados sendo inseridos
- **Estados de loading** em botões durante submit

#### **Funcionalidades Avançadas**
- **Busca unificada** em todos os campos relevantes
- **Filtros específicos** por módulo (categoria, status, tipo)
- **Badges ativas** mostrando filtros aplicados
- **Toggle de status** direto nas tabelas
- **Validações de duplicidade** automáticas

## ⚡ Comandos Úteis

### Desenvolvimento
```bash
npm run dev          # Rodar em desenvolvimento
npm run build        # Build para produção  
npm run lint         # Verificar código

# Testes atuais do simulador
node test/descontoReal.test.js
node test/cenario-especifico.test.js
node test/travamento-desconto-real.test.js
```

### Supabase
```bash
npx supabase start   # Supabase local
npx supabase db push # Deploy mudanças DB
npx supabase gen types typescript --local > lib/types/database.ts
```

### Deploy
```bash
# Frontend (Vercel) - Deploy automático via Git
# Backend (Render) - Deploy via Git + requirements.txt
```

### Geração de Componentes
```bash
# Criar novo componente Shadcn/ui
npx shadcn-ui@latest add [component-name]
```

## 🎯 Objetivos de Performance

- **First Load**: < 2s
- **Bundle Size**: Otimizado com code splitting
- **SEO**: Configurado para apps empresariais
- **Acessibilidade**: WCAG 2.1 Level AA

## Padrões Atuais do Simulador
- **Arquitetura baseada em componentes** com separação clara de responsabilidades
- **Custom hooks** para extração de lógica complexa
- **Interfaces TypeScript** para segurança de tipos
- **Atualizações imutáveis** de estado
- **Localização brasileira** (pt-BR, Real brasileiro)

## Estado Atual - SISTEMA COMPLETO! 🎉
- **Branch:** main
- **Página inicial:** Redirecionamento para `/painel/clientes`
- **Módulos:** 100% dos principais módulos migrados e funcionais
- **Performance:** Otimizações aplicadas (Next.js config, telemetria desabilitada)
- **Status:** Sistema empresarial completo, pronto para produção

## Contexto de Negócio
Sistema para calcular propostas comerciais considerando:
- Diferentes custos por forma de pagamento
- Descontos reais vs. descontos aparentes
- Cronogramas de recebimento
- Análise de viabilidade financeira

## Arquivos de Teste
- Testes focados em lógica de negócio e cálculos financeiros
- Cenários específicos de casos de uso reais
- Validação de algoritmos de desconto e travamento

---

**Importante**: Este projeto foca na **experiência empresarial brasileira** com **interface intuitiva** e **fluxos de trabalho otimizados** para gestão comercial.