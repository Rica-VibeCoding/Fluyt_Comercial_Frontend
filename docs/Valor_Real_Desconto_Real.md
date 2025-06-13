# Prompt para Implementação do Sistema de Cálculo de Pagamentos

## Contexto
Preciso implementar um sistema de cálculo financeiro para orçamentos que gerencia descontos e formas de pagamento com deflação. O sistema deve permitir edição bidirecional entre campos interdependentes sem criar loops ou inconsistências.

## Requisitos Técnicos

### Stack
- Frontend: React + TypeScript
- Estado: Zustand (ou Redux Toolkit se preferir)
- Testes: Jest + React Testing Library
- UI: Componentes controlados com Material-UI ou similar

### Estrutura de Dados Principal

```typescript
interface FormaPagamento {
  id: string;
  nome: string;
  valor: number;        // Valor Futuro (FV)
  taxa: number;         // Taxa mensal (ex: 0.03 = 3%)
  meses: number;        // Prazo para deflação
  locked: boolean;      // Se está travada pelo usuário
  prioridade: number;   // 1=À Vista, 2=Boleto, 3=Financeira, 4=Cartão
}

interface EstadoOrcamento {
  valorTotal: number;
  descontoPercentual: number;
  formasPagamento: FormaPagamento[];
}
```

### Valores Derivados (Selectors)
- **Valor Recebido (PV)**: Soma dos valores presentes de todas as formas
- **Valor Negociado (FV)**: Soma dos valores futuros de todas as formas  
- **Desconto Real**: Diferença percentual entre Valor Total e Valor Recebido

## Implementação Necessária

### 1. Store com Zustand

```typescript
// src/stores/orcamentoStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface OrcamentoStore extends EstadoOrcamento {
  // Selectors
  getValorRecebido: () => number;
  getValorNegociado: () => number;
  getDescontoReal: () => number;
  
  // Actions
  setDescontoPercentual: (valor: number) => void;
  setDescontoReal: (valor: number) => void;
  setValorNegociado: (valor: number) => void;
  editarFormaPagamento: (id: string, valor: number) => void;
  toggleLockFormaPagamento: (id: string) => void;
  inicializarFormas: (valorTotal: number) => void;
}
```

### 2. Lógica de Distribuição Greedy

Implementar algoritmo que:
1. Separa formas travadas e livres
2. Calcula valor já comprometido nas travadas
3. Distribui o restante nas livres seguindo prioridade (À Vista → Boleto → Financeira → Cartão)
4. Para distribuição por PV, converte adequadamente usando a fórmula: `PV = FV / (1 + taxa)^(meses/12)`
5. Lança erro se não conseguir atingir o valor alvo

### 3. Handlers de Mudança

**Quando Desconto % muda:**
- Calcula novo Valor Negociado
- Distribui esse valor (FV) entre as formas
- Atualiza o estado

**Quando Desconto Real muda:**
- Calcula PV alvo
- Distribui esse PV entre as formas (considerando deflação)
- Recalcula FVs correspondentes

**Quando Valor Negociado muda:**
- Converte para Desconto % e reutiliza handler acima

**Quando Forma de Pagamento muda manualmente:**
- Atualiza apenas aquela forma
- Recalcula Desconto % baseado na nova soma

### 4. Componentes React

```typescript
// src/components/OrcamentoCalculator.tsx
- Input para Valor Total (readonly)
- Input para Desconto % (editável)
- Display para Valor Negociado (editável)
- Display para Desconto Real (editável) 
- Display para Valor Recebido (readonly)
- Lista de Formas de Pagamento com:
  - Input para valor
  - Checkbox para travar/destravar
  - Indicador visual de PV calculado
```

### 5. Regras de Negócio Importantes

1. **Valores monetários**: Sempre trabalhar com centavos internamente (multiplicar por 100)
2. **Arredondamento**: Usar 2 casas decimais para display
3. **Validações**:
   - Desconto máximo: 50%
   - Valores não podem ser negativos
   - Se todas formas estão travadas e soma não bate, mostrar erro claro
4. **Inicialização**: Ao criar novo orçamento, distribuir valor total proporcionalmente entre formas

### 6. Testes Essenciais

```typescript
// src/__tests__/orcamentoStore.test.ts
describe('OrcamentoStore', () => {
  test('distribuição greedy respeita prioridade');
  test('formas travadas não são alteradas');
  test('conversão PV<->FV mantém taxa correta');
  test('erro quando impossível atingir valor com travas');
  test('edição manual recalcula desconto %');
  test('ciclo completo sem loops infinitos');
});
```

### 7. Estrutura de Arquivos

```
src/
├── stores/
│   └── orcamentoStore.ts
├── components/
│   ├── OrcamentoCalculator.tsx
│   ├── FormaPagamentoItem.tsx
│   └── CampoMonetario.tsx
├── utils/
│   ├── financeiro.ts      // Funções PV/FV
│   └── formatters.ts      // Formatação monetária
├── hooks/
│   └── useOrcamento.ts    // Hook customizado
└── __tests__/
    ├── orcamentoStore.test.ts
    └── financeiro.test.ts
```

## Instruções de Implementação

1. **Comece pelo store**: Implemente primeiro a lógica de estado sem UI
2. **Teste a lógica**: Garanta que distribuição e cálculos funcionam
3. **Adicione UI depois**: Componentes simples e controlados
4. **Use debounce**: 300ms nos inputs para evitar recálculos excessivos
5. **Feedback visual**: Loading states durante recálculos
6. **Mensagens de erro**: Toasts ou inline para validações

## Exemplo de Uso Esperado

```typescript
// Usuário define desconto de 10%
store.setDescontoPercentual(10);
// Sistema distribui R$ 3.100,50 entre as formas
// À Vista recebe maior parte, Cartão menor parte
// Valor Recebido mostra ~R$ 2.950 (com deflação)
// Desconto Real mostra ~14.4%

// Usuário trava À Vista em R$ 1.000
store.toggleLockFormaPagamento('vista');
store.editarFormaPagamento('vista', 1000);

// Usuário muda Desconto Real para 20%
store.setDescontoReal(20);
// Sistema ajusta apenas Boleto, Financeira e Cartão
// À Vista permanece R$ 1.000
```

**Foque em código limpo, testável e sem duplicação de estado. Use TypeScript strict mode.**