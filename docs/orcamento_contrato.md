# 🔄 FLUXO ORÇAMENTO → CONTRATO - Análise e Refatoração

## 🎯 Contexto e Objetivo

Este documento mapeia o fluxo completo de dados do módulo **Orçamento** para o módulo **Contrato**, identificando problemas, bugs e propondo soluções técnicas para garantir transmissão correta de dados.

**Meta:** Última refatoração antes da integração com backend/banco de dados.

---

## 📊 ESTADO ATUAL DO FLUXO

### ✅ **O que está Funcionando**

#### **1. Navegação Básica**
```typescript
// src/app/painel/orcamento/page.tsx (linhas 180-185)
const navegarParaContratos = () => {
  if (cliente && ambientes.length > 0 && formasPagamento.length > 0) {
    console.log('✅ Navegando para contratos');
    router.push(`/painel/contratos?clienteId=${cliente?.id}&clienteNome=${encodeURIComponent(cliente?.nome || '')}`);
  }
};
```

#### **2. Botão "Gerar Contrato"**
- ✅ Validação de requisitos (cliente + ambientes + formas de pagamento)
- ✅ Estados visuais dinâmicos (enabled/disabled)
- ✅ Acessibilidade completa (aria-labels, screen readers)
- ✅ Feedback claro sobre status dos requisitos

#### **3. Dados Básicos Disponíveis**
- ✅ Cliente básico (id, nome)
- ✅ Ambientes com valores calculados
- ✅ Valor total dos ambientes
- ✅ Formas de pagamento detalhadas
- ✅ Cronograma de pagamentos consolidado

---

## 🚨 PROBLEMAS IDENTIFICADOS

### **PROBLEMA 1: Mismatch de Tipos de Cliente** 🔴

#### **Situação Atual:**
```typescript
// Orçamento usa: src/types/orcamento.ts
interface Cliente {
  id: string;
  nome: string;
}

// Contrato espera: src/types/contrato.ts  
interface Cliente {
  nome: string;
  cpf: string;      // ❌ FALTANDO
  endereco: string; // ❌ FALTANDO
  telefone: string; // ❌ FALTANDO
  email: string;    // ❌ FALTANDO
}
```

#### **Bug no Mapeamento:**
```typescript
// src/components/modulos/contratos/shared/contract-data-manager.ts (linhas 69-75)
cliente: {
  nome: cliente.nome,
  cpf: cliente.cpf_cnpj || '',          // ❌ cpf_cnpj não existe
  endereco: `${cliente.logradouro}, ${cliente.numero} - ${cliente.bairro}, ${cliente.cidade}/${cliente.uf}`, // ❌ Propriedades inexistentes
  telefone: cliente.telefone,           // ❌ telefone não existe
  email: cliente.email                  // ❌ email não existe
}
```

### **PROBLEMA 2: Inconsistência de Stores** 🔴

#### **Conflito de Sistemas:**
```typescript
// Orçamento usa:
import { useSessaoSimples } from '@/hooks/globais/use-sessao-simples';

// Contrato usa:
import { useSessao } from '@/store/sessao-store';
```

#### **Resultado:**
- Dados salvos em `sessaoSimples` (localStorage)
- Contrato tenta ler de `sessao-store` (Zustand)
- **Perda de dados** na transição

### **PROBLEMA 3: Formas de Pagamento Perdidas** 🔴

#### **Dados Disponíveis no Orçamento:**
```typescript
interface FormaPagamento {
  id: string;
  tipo: 'a-vista' | 'boleto' | 'cartao' | 'financeira';
  valor: number;
  valorPresente: number;
  parcelas?: number;
  dados: any; // Dados específicos editáveis
  criadaEm: string;
  travada?: boolean;
}
```

#### **Dados Usados no Contrato:**
```typescript
// APENAS:
condicoes: string; // ❌ String simples, perde todo o detalhe
```

### **PROBLEMA 4: Mismatch de Tipos de Ambiente** 🔴

#### **Orçamento:**
```typescript
interface Ambiente {
  id: string;
  nome: string;
  valor: number;
}
```

#### **Contrato Tenta Acessar:**
```typescript
// contract-data-manager.ts (linha 82)
descricao: `Ambiente com ${ambiente.acabamentos.length} acabamentos`, // ❌ acabamentos não existe
valor: ambiente.valorTotal  // ❌ valorTotal vs valor
```

### **PROBLEMA 5: Valores Calculados Perdidos** 🔴

#### **Dados Financeiros Avançados Não Transferidos:**
- ❌ `valorNegociado` (valor com desconto aplicado)
- ❌ `descontoReal` (desconto efetivo calculado)
- ❌ `valorPresenteTotal` (soma dos valores presentes)
- ❌ Cronograma detalhado de pagamentos
- ❌ Configurações de travamento de valores

---

## 💡 MAPEAMENTO DE DADOS NECESSÁRIO

### **Dados Fonte (Orçamento)**
| Dado | Localização | Status |
|------|-------------|---------|
| Cliente básico | `sessaoSimples.cliente` | ✅ Disponível |
| Ambientes | `sessaoSimples.ambientes` | ✅ Disponível |
| Formas de pagamento | `useFormasPagamento()` | ✅ Disponível |
| Valores calculados | `useCalculadoraNegociacao()` | ✅ Disponível |
| Cronograma consolidado | `TabelaPagamentosConsolidada` | ✅ Disponível |

### **Dados Destino (Contrato)**
| Dado | Interface | Status Atual |
|------|-----------|--------------|
| Cliente completo | `ContratoData.cliente` | ❌ Incompleto |
| Valor total | `ContratoData.valor_total` | ✅ OK |
| Valor final | `ContratoData.valor_final` | ❌ Calculado incorreto |
| Desconto | `ContratoData.desconto` | ⚠️ Conversão necessária |
| Cronograma | `ContratoData.condicoes` | ❌ String simples |

---

## 🔧 SOLUÇÕES PROPOSTAS

### **SOLUÇÃO 1: Unificar Sistemas de Estado** 🎯

#### **Estratégia:**
Migrar contratos para usar `useSessaoSimples` ou expandir `sessaoSimples` para incluir dados de contrato.

```typescript
// Opção A: Contrato usa sessaoSimples
const { cliente, ambientes, formasPagamento } = useSessaoSimples();

// Opção B: Expandir sessaoSimples para incluir contrato
interface SessaoSimples {
  cliente: Cliente | null;
  ambientes: Ambiente[];
  valorTotal: number;
  formasPagamento: FormaPagamento[];
  // ✅ ADICIONAR:
  contrato?: ContratoData;
}
```

### **SOLUÇÃO 2: Expandir Interface de Cliente** 🎯

#### **Criar Cliente Unificado:**
```typescript
// src/types/cliente-unificado.ts
interface ClienteCompleto {
  // Dados básicos (já disponíveis)
  id: string;
  nome: string;
  
  // Dados complementares (carregar quando necessário)
  cpf_cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: {
    logradouro?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
  };
}
```

#### **Hook para Dados Completos:**
```typescript
// src/hooks/use-cliente-completo.ts
export function useClienteCompleto(clienteId: string) {
  const [clienteCompleto, setClienteCompleto] = useState<ClienteCompleto | null>(null);
  
  useEffect(() => {
    // Carregar dados completos do cliente quando necessário
    carregarDadosCompletos(clienteId).then(setClienteCompleto);
  }, [clienteId]);
  
  return { clienteCompleto, carregando: !clienteCompleto };
}
```

### **SOLUÇÃO 3: Preservar Formas de Pagamento** 🎯

#### **Expandir Interface de Contrato:**
```typescript
// src/types/contrato.ts - EXPANDIR
interface ContratoData {
  // ... campos existentes
  
  // ✅ ADICIONAR:
  formasPagamento: FormaPagamento[];
  cronogramaPagamentos: CronogramaItem[];
  dadosFinanceiros: {
    valorNegociado: number;
    valorPresenteTotal: number;
    descontoReal: number;
    taxaDesconto: number;
  };
}

interface CronogramaItem {
  numero: number;
  tipo: string;
  valor: number;
  valorPresente: number;
  data: string;
  observacoes?: string;
}
```

### **SOLUÇÃO 4: Mapeador de Dados Inteligente** 🎯

#### **Criar Serviço de Mapeamento:**
```typescript
// src/services/orcamento-contrato-mapper.ts
export class OrcamentoContratoMapper {
  
  static mapearParaContrato(
    cliente: Cliente,
    ambientes: Ambiente[],
    formasPagamento: FormaPagamento[],
    calculosFinanceiros: ResultadoCalculado
  ): ContratoData {
    
    // Carregar dados completos do cliente se necessário
    const clienteCompleto = this.expandirDadosCliente(cliente);
    
    // Gerar cronograma detalhado
    const cronograma = this.gerarCronogramaDetalhado(formasPagamento);
    
    // Gerar condições de pagamento
    const condicoesPagamento = this.gerarCondicoesPagamento(formasPagamento);
    
    return {
      numero: this.gerarNumeroContrato(),
      cliente: clienteCompleto,
      ambientes: this.mapearAmbientes(ambientes),
      valor_total: calculosFinanceiros.valorTotal,
      desconto: calculosFinanceiros.descontoPercentual / 100,
      valor_final: calculosFinanceiros.valorNegociado,
      prazo_entrega: "30 dias úteis",
      condicoes: condicoesPagamento,
      vendedor: "Sistema",
      gerente: "Sistema",
      loja: this.obterDadosLoja(),
      data_criacao: new Date().toISOString(),
      status: 'RASCUNHO',
      
      // ✅ Dados expandidos
      formasPagamento,
      cronogramaPagamentos: cronograma,
      dadosFinanceiros: {
        valorNegociado: calculosFinanceiros.valorNegociado,
        valorPresenteTotal: calculosFinanceiros.valorPresenteTotal,
        descontoReal: calculosFinanceiros.descontoReal,
        taxaDesconto: calculosFinanceiros.descontoPercentual
      }
    };
  }
  
  private static gerarCondicoesPagamento(formas: FormaPagamento[]): string {
    return formas.map(forma => {
      switch (forma.tipo) {
        case 'a-vista':
          return `À Vista: ${this.formatarMoeda(forma.valor)} na assinatura`;
        case 'boleto':
          return `Boleto: ${forma.parcelas}x de ${this.formatarMoeda(forma.valor / forma.parcelas!)}`;
        case 'cartao':
          return `Cartão: ${forma.dados.vezes}x de ${this.formatarMoeda(forma.valor / forma.dados.vezes)}`;
        case 'financeira':
          return `Financeira: ${forma.dados.parcelas}x (taxa ${forma.dados.percentual}% a.m.)`;
        default:
          return '';
      }
    }).filter(Boolean).join('; ');
  }
}
```

---

## 📋 TASKS TÉCNICAS PARA IMPLEMENTAÇÃO

### **FASE 1: Correção de Bugs Críticos** 🚨

#### **Task 1.1: Corrigir Mismatch de Cliente**
```typescript
// Prioridade: CRÍTICA
// Tempo estimado: 2h

1. Criar interface ClienteCompleto unificada
2. Implementar hook useClienteCompleto
3. Corrigir mapeamento em contract-data-manager.ts
4. Testar carregamento de dados completos
```

#### **Task 1.2: Unificar Sistema de Estado**
```typescript
// Prioridade: CRÍTICA  
// Tempo estimado: 3h

1. Migrar contratos para useSessaoSimples
2. Remover dependência de sessao-store nos contratos
3. Atualizar todos os componentes de contrato
4. Testar fluxo completo orçamento → contrato
```

#### **Task 1.3: Corrigir Mapeamento de Ambientes**
```typescript
// Prioridade: ALTA
// Tempo estimado: 1h

1. Corrigir acesso a propriedades inexistentes
2. Mapear corretamente valor vs valorTotal  
3. Implementar descrição baseada em dados reais
4. Testar exibição de ambientes no contrato
```

### **FASE 2: Preservação de Dados Avançados** ⚡

#### **Task 2.1: Expandir Interface de Contrato**
```typescript
// Prioridade: ALTA
// Tempo estimado: 2h

1. Adicionar formasPagamento ao ContratoData
2. Criar interface CronogramaItem
3. Adicionar dadosFinanceiros
4. Atualizar mock e validações
```

#### **Task 2.2: Implementar Mapeador Inteligente**
```typescript
// Prioridade: ALTA
// Tempo estimado: 4h

1. Criar OrcamentoContratoMapper
2. Implementar geração de cronograma detalhado
3. Criar gerador de condições de pagamento
4. Integrar com componentes de contrato
```

#### **Task 2.3: Preservar Dados Editáveis**
```typescript
// Prioridade: MÉDIA
// Tempo estimado: 3h

1. Transferir dados específicos de cada modal
2. Preservar configurações de travamento
3. Manter cronograma editável (especial boleto)
4. Implementar sincronização bidirecional
```

### **FASE 3: Melhorias e Validações** 🔧

#### **Task 3.1: Validações Robustas**
```typescript
// Prioridade: MÉDIA
// Tempo estimado: 2h

1. Validar dados completos antes da transferência
2. Implementar fallbacks para dados faltantes
3. Criar alertas para dados incompletos
4. Testar cenários de erro
```

#### **Task 3.2: Interface Melhorada**
```typescript
// Prioridade: BAIXA
// Tempo estimado: 3h

1. Exibir cronograma detalhado no contrato
2. Mostrar breakdown dos cálculos financeiros
3. Implementar edição inline de condições
4. Melhorar feedback visual
```

---

## 🧪 CENÁRIOS DE TESTE

### **Teste 1: Fluxo Básico Funcionando**
```typescript
DADO: Cliente com ambientes e 1 forma de pagamento à vista
QUANDO: Usuário clica "Gerar Contrato"
ENTÃO: 
  - Navega para /painel/contratos
  - Cliente aparece corretamente
  - Valor total está correto
  - Forma de pagamento está preservada
```

### **Teste 2: Múltiplas Formas de Pagamento**
```typescript
DADO: Cliente com 4 formas de pagamento diferentes
QUANDO: Usuário gera contrato
ENTÃO:
  - Cronograma completo está visível
  - Valores presentes estão corretos
  - Condições estão formatadas corretamente
  - Dados editáveis (boleto) estão preservados
```

### **Teste 3: Valores Calculados Avançados**
```typescript
DADO: Orçamento com desconto real aplicado e valores travados
QUANDO: Usuário gera contrato
ENTÃO:
  - Desconto real está preservado
  - Valor negociado está correto
  - Configurações de travamento estão mantidas
  - Cálculos financeiros estão disponíveis
```

### **Teste 4: Dados Incompletos**
```typescript
DADO: Cliente sem dados completos (CPF, endereço, etc.)
QUANDO: Usuário tenta gerar contrato
ENTÃO:
  - Sistema solicita dados faltantes
  - Ou usa fallbacks apropriados
  - Contrato é gerado sem erros
  - Campos faltantes são claramente marcados
```

---

## 📈 MÉTRICAS DE SUCESSO

### **Critérios de Aceitação:**

1. **✅ Transferência Completa de Dados**
   - 100% dos dados financeiros preservados
   - Cronograma detalhado mantido
   - Configurações editáveis funcionais

2. **✅ Robustez**
   - Zero erros JavaScript no console
   - Fallbacks para dados faltantes
   - Validações apropriadas

3. **✅ UX Consistente**
   - Navegação fluida orçamento → contrato
   - Feedback claro sobre status
   - Dados visíveis e editáveis

4. **✅ Preparação para Backend**
   - Estrutura de dados compatível com API
   - Serialização/deserialização funcional
   - Tipos TypeScript completos

---

## 🎯 RESUMO EXECUTIVO

### **Estado Atual:** 🔴 CRÍTICO
- Navegação funciona, mas **perda significativa de dados**
- Múltiplos bugs de mapeamento
- Inconsistência entre sistemas de estado

### **Ação Necessária:** 🚨 REFATORAÇÃO URGENTE
- **Fase 1** (Crítica): Corrigir bugs de mapeamento - **6h**
- **Fase 2** (Alta): Preservar dados avançados - **9h**  
- **Fase 3** (Média): Melhorias e validações - **5h**

### **Total Estimado:** ⏱️ **20 horas**

### **Resultado Esperado:** ✅
Sistema robusto com transferência completa de dados, pronto para integração com backend e produção.

---

**Status:** 🔴 Necessita refatoração urgente  
**Próxima Ação:** Implementar Fase 1 - Correção de bugs críticos  
**Responsável:** Equipe de desenvolvimento  
**Deadline:** Antes da integração com backend