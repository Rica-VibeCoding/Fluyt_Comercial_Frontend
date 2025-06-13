# Sistema de Cálculo Financeiro para Orçamentos - Status de Implementação

## 📋 Contexto Geral
Sistema de cálculo financeiro que gerencia descontos e formas de pagamento com deflação, permitindo edição bidirecional entre campos interdependentes sem criar loops ou inconsistências.

## 💼 **CASOS DE USO PRÁTICOS** - Valor de Negócio

### 🎯 **Cenários Reais de Aplicação:**

#### **1. Cliente Pede Desconto Durante Negociação**
```typescript
// Situação: Orçamento R$ 50.000, cliente pede 10% desconto
Antes: Calculadora manual → Refazer formas → Recalcular tudo
Agora: Digita 10% → Sistema redistribui → Mostra impacto real instantâneo

Resultado:
- Valor Negociado: R$ 45.000 (aparente)
- Valor Recebido: R$ 42.300 (real, com deflação)  
- Desconto Real: 15,4% (não os 10% aparentes)
- Decisão: Aceitar ou contra-oferecer com base no desconto REAL
```

#### **2. Estratégia: Fixar À Vista, Flexibilizar Resto**
```typescript
// Cenário: Garantir R$ 20.000 à vista, negociar o resto
1. Trava À Vista em R$ 20.000 🔒
2. Aplica desconto 12%
3. Sistema redistribui apenas Boleto/Cartão/Financeira
4. Mantém fluxo de caixa imediato garantido
```

#### **3. Comparação Rápida de Cenários**
```typescript
// Cliente indeciso entre cenários
Cenário A: 8% desconto → Desconto Real: 12,1%
Cenário B: 15% desconto → Desconto Real: 18,9%  
Cenário C: 10% + mais à vista → Desconto Real: 11,8%
// Decisão baseada em dados, não "feeling"
```

### 💰 **Benefícios Quantificáveis:**

#### **Para Negociação:**
- ✅ **Transparência**: Desconto real vs. aparente claramente visível
- ✅ **Velocidade**: Simulações em 2-3 segundos vs. 5-10 minutos
- ✅ **Precisão**: Elimina erros de cálculo manual
- ✅ **Flexibilidade**: Testa múltiplos cenários rapidamente

#### **Para Fluxo de Caixa:**
- ✅ **Previsibilidade**: Valor presente exato para planejamento
- ✅ **Otimização**: Balanceia prazo vs. desconto automaticamente  
- ✅ **Controle**: Evita "surpresas" no recebimento
- ✅ **Estratégia**: Permite decisões baseadas em valor real

#### **Para Produtividade:**
- ✅ **Automação**: Redistribuição sem intervenção manual
- ✅ **Validação**: Impede configurações financeiramente impossíveis
- ✅ **Histórico**: Preserva decisões para análise posterior
- ✅ **Integração**: Funciona com fluxo existente sem disrupção

### 📱 **Interface de Usuário Alvo:**

```typescript
// Layout visual esperado após implementação completa
┌──────────────── PAINEL DE NEGOCIAÇÃO ────────────────┐
│                                                      │
│ 💰 Valor Total: R$ 50.000,00 (readonly)             │
│                                                      │
│ 📊 CONTROLES EDITÁVEIS:                              │
│ ├─ Desconto %: [15.0] % ← Input editável            │
│ ├─ Valor Negociado: R$ [42.500] ← Input editável    │  
│ ├─ Desconto Real: [18.3] % ← Input editável         │
│ └─ Valor Recebido: R$ 40.850 (readonly)             │
│                                                      │
│ 🔄 FORMAS DE PAGAMENTO:                              │
│ ├─ ☑️ À Vista: R$ 15.000 🔒 (travado)               │
│ ├─ ☐ Boleto: R$ 12.750 🔓 (livre) [30d, 1%]        │
│ ├─ ☐ Cartão: R$ 14.750 🔓 (livre) [3m, 3%]         │  
│ └─ ☐ Financeira: R$ 0 🔓 (livre) [12m, 2%]          │
│                                                      │
│ ⚡ Status: ✅ Válido | ⚠️ Diferença: R$ 0           │
└──────────────────────────────────────────────────────┘
```

### ⚙️ **Configurações de Negócio:**

```typescript
// Configurações editáveis pelo usuário
interface ConfiguracaoNegocio {
  limitesDesconto: {
    maximo: 50;           // 50% máximo
    alertaAcimaDe: 25;    // Alerta amarelo acima de 25%
    bloqueioAcimaDe: 50;  // Bloqueio vermelho acima de 50%
  };
  
  taxasDefault: {
    'boleto': { taxa: 0.01, meses: 1 };    // Configurável  
    'cartao': { taxa: 0.03, meses: 3 };    // Configurável
    'financeira': { taxa: 0.02, meses: 12 }; // Configurável
  };
  
  validacoes: {
    valorMinimoForma: 100;     // R$ 1,00 mínimo por forma
    obrigatorioUmaForma: true; // Pelo menos uma forma > 0
    alertarDescontoReal: true; // Destacar quando real > aparente
  };
}
```

### 🔄 **Fluxos de Trabalho Típicos:**

#### **Fluxo 1: Negociação Padrão**
```typescript
1. Cliente solicita orçamento
2. Vendedor insere valor total
3. Cliente pede desconto → Vendedor digita %
4. Sistema mostra impacto real → Decisão informada
5. Ajustes finais → Aprovação → Geração contrato
```

#### **Fluxo 2: Estratégia Mista**
```typescript
1. Análise do perfil do cliente
2. Fixar valor à vista estratégico (trava)
3. Testar diferentes % de desconto
4. Ajustar formas a prazo conforme resposta
5. Otimizar baseado em valor presente
```

#### **Fluxo 3: Comparação Competitiva**
```typescript
1. Cliente tem proposta concorrente
2. Simular cenário equivalente
3. Mostrar vantagem real (valor presente)
4. Contra-propor com dados concretos
5. Evidenciar diferencial financeiro
```

---

## ✅ **IMPLEMENTADO** - Base Sólida Já Funcionando

### 1. Estrutura de Dados ✅
```typescript
// src/types/orcamento.ts - JÁ IMPLEMENTADO
interface FormaPagamento {
  id: string;
  tipo: 'a-vista' | 'boleto' | 'cartao' | 'financeira';
  valor: number;        // Valor Futuro (FV)
  valorPresente: number; // Valor Presente (PV) 
  parcelas?: number;
  dados: any;
  criadaEm: string;
  travada?: boolean;    // Sistema de travamento ✅
}
```

### 2. Calculadora Principal ✅
```typescript
// src/lib/calculadora-negociacao.ts - TOTALMENTE IMPLEMENTADO
export class CalculadoraNegociacao {
  ✅ calcular(estado: EstadoNegociacao): ResultadoCalculado
  ✅ redistribuirProporcional() // Mantém proporções existentes
  ✅ redistribuirPorPrioridade() // À Vista → Boleto → Financeira → Cartão  
  ✅ calcularValorPresente() // Aplica fórmula PV = FV / (1 + taxa)^(meses/12)
  ✅ toggleTravamento() // Sistema de lock/unlock
  ✅ validarEstado() // Validações de negócio
}
```

### 3. Configurações de Taxas ✅
```typescript
// CONFIGURAÇÃO ATUAL - APROVADA
const CONFIGURACAO_FORMAS = {
  'a-vista': { taxa: 0, meses: 0, prioridade: 1 },
  'boleto': { taxa: 0.01, meses: 1, prioridade: 2 },      // 1% a.m., 30 dias
  'cartao': { taxa: 0.03, meses: 3, prioridade: 4 },     // 3% a.m., 3 meses  
  'financeira': { taxa: 0.02, meses: 12, prioridade: 3 }  // 2% a.m., 12 meses
};
```

### 4. Componentes UI Base ✅
```typescript
// src/components/modulos/orcamento/ - ESTRUTURA CRIADA
✅ OrcamentoValores - Display dos valores calculados
✅ OrcamentoPagamentos - Lista de formas + controles
✅ ListaFormasPagamento - Com botões de travamento (Lock/Unlock)
✅ CampoValor - Campo monetário padronizado
✅ ModalPagamentoBase - Base para modais específicos
```

### 5. Validações Implementadas ✅
```typescript
const VALIDACOES_MVP = {
  ✅ descontoMaximo: 50,        // 50% máximo
  ✅ valorMinimoForma: 0,       // Permite R$ 0
  ✅ obrigatorioUmaForma: true  // Pelo menos uma forma > 0
};
```

---

## 🔄 **PRÓXIMOS PASSOS** - Para Completar o Sistema

### 1. Store Zustand Centralizada 🎯
```typescript
// src/stores/orcamento-financeiro-store.ts - CRIAR
interface OrcamentoFinanceiroStore {
  // Estado
  valorTotal: number;
  descontoPercentual: number;
  formasPagamento: FormaPagamento[];
  
  // Selectors (auto-calculados)
  getValorNegociado: () => number;
  getValorRecebido: () => number;
  getDescontoReal: () => number;
  
  // Actions (handlers bidirecionais)
  setDescontoPercentual: (valor: number) => void;
  setDescontoReal: (valor: number) => void;      // 🆕 CRIAR
  setValorNegociado: (valor: number) => void;    // 🆕 CRIAR
  editarFormaPagamento: (id: string, valor: number) => void;
  toggleLockFormaPagamento: (id: string) => void;
}
```

### 2. Campos Editáveis Bidirecionais 🎯
```typescript
// Transformar displays readonly em inputs editáveis:

// Em orcamento-valores.tsx - MODIFICAR
<Input
  value={descontoReal.toFixed(1)}
  onChange={(e) => store.setDescontoReal(parseFloat(e.target.value))}
  suffix="%"
  className="text-2xl font-bold"
/>

<Input  
  value={formatarMoeda(valorNegociado)}
  onChange={(e) => store.setValorNegociado(parseMoeda(e.target.value))}
  className="text-2xl font-bold"
/>
```

### 3. Handlers de Mudança Inteligentes 🎯
```typescript
// src/hooks/use-orcamento-financeiro.ts - CRIAR
export function useOrcamentoFinanceiro() {
  
  // Handler: Desconto % → Redistributi por FV
  const handleDescontoPercentual = (novoDesconto: number) => {
    const valorNegociado = valorTotal * (1 - novoDesconto / 100);
    const resultado = CalculadoraNegociacao.calcular({
      valorTotal, descontoPercentual: novoDesconto, formasPagamento
    });
    updateStore(resultado);
  };

  // Handler: Desconto Real → Redistribui por PV  
  const handleDescontoReal = (novoDescontoReal: number) => {
    const pvAlvo = valorTotal * (1 - novoDescontoReal / 100);
    // Distribui PV alvo entre formas (considerando deflação)
    const formasRedistribuidas = distribuirPorPV(pvAlvo, formasPagamento);
    updateStore({ formasPagamento: formasRedistribuidas });
  };

  // Handler: Valor Negociado → Converte para Desconto %
  const handleValorNegociado = (novoValorNegociado: number) => {
    const novoDesconto = ((valorTotal - novoValorNegociado) / valorTotal) * 100;
    handleDescontoPercentual(novoDesconto); // Reutiliza handler
  };
}
```

### 4. Feedback Visual Refinado 🎯
```typescript
// src/components/ui/campo-editavel.tsx - CRIAR
interface CampoEditavelProps {
  valor: string;
  onChange: (valor: string) => void;
  destacarMudanca?: boolean; // 🆕 Highlight temporário
  loading?: boolean;         // 🆕 Loading state
}

// CSS para highlight temporário
.campo-alterado {
  @apply ring-2 ring-green-300 bg-green-50 transition-all duration-300;
}
```

### 5. Integração com Sistema Atual 🎯
```typescript
// src/app/painel/orcamento/page.tsx - MODIFICAR
import { useCalculadoraNegociacao } from '@/hooks/use-orcamento-financeiro';

export default function OrcamentoPage() {
  const {
    // Estado calculado automaticamente
    valorNegociado, descontoReal, valorRecebido,
    // Handlers bidirecionais
    handleDescontoPercentual,
    handleDescontoReal,  
    handleValorNegociado,
    handleFormaPagamento
  } = useCalculadoraNegociacao(valorTotal, descontoPercentual, formasPagamento);
  
  return (
    <>
      <OrcamentoValores
        valores={{ valorNegociado, descontoReal, valorRecebido }}
        onDescontoRealChange={handleDescontoReal}     // 🆕 Editável
        onValorNegociadoChange={handleValorNegociado} // 🆕 Editável
      />
      <OrcamentoPagamentos
        formas={formasPagamento}
        onFormChange={handleFormaPagamento}
        onDescontoChange={handleDescontoPercentual}
      />
    </>
  );
}
```

---

## ⚙️ **IMPLEMENTAÇÃO TÉCNICA DETALHADA** - Especificação Completa

### 🎯 **Cenários de Negociação Críticos:**

#### **Cenário 1: Cliente Define Valor Final**
```typescript
// Cliente: "Quero fechar por R$ 42.000"
// Fluxo: Usuário edita "Valor Negociado" → Sistema recalcula tudo

Passos do Sistema:
1. descontoPercentual = ((valorTotal - valorNegociado) / valorTotal) * 100
2. Redistribuir formas proporcionalmente com novo valorNegociado  
3. Calcular valorPresenteTotal das formas redistribuídas
4. descontoReal = ((valorTotal - valorPresenteTotal) / valorTotal) * 100
5. Atualizar interface
```

#### **Cenário 2: Controle de Margem Específica**
```typescript
// Vendedor: "Preciso manter 20% de desconto real"
// Fluxo: Usuário edita "Desconto Real" → Sistema calcula valor viável

Passos do Sistema:
1. valorPresenteDesejado = valorTotal * (1 - descontoReal / 100)
2. Calcular valorNegociado que resulte nesse valorPresente (algoritmo iterativo)
3. descontoPercentual = ((valorTotal - valorNegociado) / valorTotal) * 100
4. Redistribuir formas com valorNegociado calculado
5. Atualizar interface
```

### 🛡️ **Sistema Anti-Loop Infinito:**

#### **1. Controle de "Última Edição"**
```typescript
interface EstadoNegociacao {
  valorTotal: number;
  descontoPercentual: number;
  valorNegociado: number;
  descontoReal: number;
  formasPagamento: FormaPagamento[];
  
  // 🔒 Proteções contra loops
  ultimaEdicao: 'valorNegociado' | 'descontoReal' | 'descontoPercentual' | null;
  isCalculating: boolean;
  ultimoCalculo: number; // timestamp para debounce
}
```

#### **2. Fluxo de Proteção**
```typescript
// Sistema de bloqueio inteligente
const handleCampoEdit = (campo: string, valor: number) => {
  if (isCalculating) return; // 🚫 Bloqueia durante cálculo
  
  setEstado(prev => ({
    ...prev,
    ultimaEdicao: campo,
    isCalculating: true,
    [campo]: valor
  }));
  
  // Debounce de 300ms para evitar cálculos excessivos
  debouncedRecalculate(campo, valor);
};

const debouncedRecalculate = debounce((campoEditado: string, valor: number) => {
  // Só recalcula os campos NÃO editados pelo usuário
  const novoEstado = calcularCamposDerivados(campoEditado, valor);
  
  setEstado(prev => ({
    ...prev,
    ...novoEstado,
    isCalculating: false // 🔓 Libera para próxima edição
  }));
}, 300);
```

### 📐 **Fórmulas de Deflação Implementadas:**
```typescript
const CONFIGURACAO_DEFLACAO = {
  'a-vista': { taxa: 0, meses: 0 },           // VP = VF (sem deflação)
  'boleto': { taxa: 0.01, meses: 1 },         // VP = VF / (1 + 0.01)^1
  'cartao': { taxa: 0.03, meses: 3 },         // VP = VF / (1 + 0.03)^3
  'financeira': { taxa: 0.02, meses: 12 }     // VP = VF / (1 + 0.02)^12
};

const calcularValorPresente = (valorFuturo: number, tipo: string): number => {
  const config = CONFIGURACAO_DEFLACAO[tipo];
  if (!config) return valorFuturo;
  
  return valorFuturo / Math.pow(1 + config.taxa, config.meses);
};
```

### 🔄 **Algoritmo Iterativo para Desconto Real:**
```typescript
const calcularValorNegociadoPorDescontoReal = (
  valorTotal: number,
  descontoRealAlvo: number,
  formasPagamento: FormaPagamento[]
): number => {
  const valorPresenteAlvo = valorTotal * (1 - descontoRealAlvo / 100);
  
  // Algoritmo iterativo: busca binária por valor negociado
  let valorMin = 0;
  let valorMax = valorTotal;
  let tentativas = 0;
  const maxTentativas = 20;
  const tolerancia = 10; // R$ 0,10 de tolerância
  
  while (tentativas < maxTentativas && (valorMax - valorMin) > tolerancia) {
    const valorTentativa = (valorMin + valorMax) / 2;
    
    // Redistribui formas com valor tentativa
    const formasRedistribuidas = redistribuirProporcional(valorTentativa, formasPagamento);
    const vpCalculado = calcularValorPresenteTotal(formasRedistribuidas);
    
    if (vpCalculado < valorPresenteAlvo) {
      valorMin = valorTentativa; // Precisa aumentar valor negociado
    } else {
      valorMax = valorTentativa; // Precisa diminuir valor negociado
    }
    
    tentativas++;
  }
  
  return (valorMin + valorMax) / 2;
};
```

### 🧪 **Hook Completo de Implementação:**
```typescript
// src/hooks/use-calculadora-bidirecional.ts - IMPLEMENTAR
export function useCalculadoraBidirecional(
  valorTotal: number,
  formasPagamentoIniciais: FormaPagamento[]
) {
  const [estado, setEstado] = useState<EstadoNegociacao>({
    valorTotal,
    descontoPercentual: 0,
    valorNegociado: valorTotal,
    descontoReal: 0,
    formasPagamento: formasPagamentoIniciais,
    ultimaEdicao: null,
    isCalculating: false,
    ultimoCalculo: 0
  });

  // Handler para Valor Negociado
  const handleValorNegociadoChange = useCallback((novoValor: number) => {
    if (estado.isCalculating) return;
    
    setEstado(prev => ({ ...prev, ultimaEdicao: 'valorNegociado', isCalculating: true }));
    
    // Calcular desconto % e redistribuir formas
    const novoDescontoPercentual = ((valorTotal - novoValor) / valorTotal) * 100;
    const formasRedistribuidas = redistribuirProporcional(novoValor, estado.formasPagamento);
    const novoValorPresente = calcularValorPresenteTotal(formasRedistribuidas);
    const novoDescontoReal = ((valorTotal - novoValorPresente) / valorTotal) * 100;
    
    debouncedUpdate({
      valorNegociado: novoValor,
      descontoPercentual: novoDescontoPercentual,
      descontoReal: novoDescontoReal,
      formasPagamento: formasRedistribuidas,
      isCalculating: false
    });
  }, [estado.isCalculating, valorTotal, estado.formasPagamento]);

  // Handler para Desconto Real
  const handleDescontoRealChange = useCallback((novoDescontoReal: number) => {
    if (estado.isCalculating) return;
    
    setEstado(prev => ({ ...prev, ultimaEdicao: 'descontoReal', isCalculating: true }));
    
    // Algoritmo iterativo para encontrar valor negociado
    const novoValorNegociado = calcularValorNegociadoPorDescontoReal(
      valorTotal, 
      novoDescontoReal, 
      estado.formasPagamento
    );
    const novoDescontoPercentual = ((valorTotal - novoValorNegociado) / valorTotal) * 100;
    const formasRedistribuidas = redistribuirProporcional(novoValorNegociado, estado.formasPagamento);
    
    debouncedUpdate({
      descontoReal: novoDescontoReal,
      valorNegociado: novoValorNegociado,
      descontoPercentual: novoDescontoPercentual,
      formasPagamento: formasRedistribuidas,
      isCalculating: false
    });
  }, [estado.isCalculating, valorTotal, estado.formasPagamento]);

  const debouncedUpdate = useMemo(
    () => debounce((updates: Partial<EstadoNegociacao>) => {
      setEstado(prev => ({ ...prev, ...updates }));
    }, 300),
    []
  );

  // Validações
  const validacoes = useMemo(() => {
    const erros: string[] = [];
    
    if (estado.descontoPercentual > 50) {
      erros.push('Desconto máximo permitido: 50%');
    }
    
    if (estado.valorNegociado < 0) {
      erros.push('Valor negociado não pode ser negativo');
    }
    
    const valorTotalFormas = estado.formasPagamento.reduce((sum, f) => sum + f.valor, 0);
    if (valorTotalFormas === 0) {
      erros.push('Pelo menos uma forma deve ter valor > 0');
    }
    
    return {
      valido: erros.length === 0,
      erros
    };
  }, [estado]);

  return {
    // Estado atual
    ...estado,
    
    // Handlers bidirecionais
    handleValorNegociadoChange,
    handleDescontoRealChange,
    
    // Validações
    validacoes,
    
    // Utilitários
    valorPresenteTotal: calcularValorPresenteTotal(estado.formasPagamento),
    diferencaValores: estado.valorNegociado - estado.formasPagamento.reduce((sum, f) => sum + f.valor, 0)
  };
}
```

### 🔧 **Componente de Interface:**
```typescript
// src/components/modulos/orcamento/campos-negociacao.tsx - CRIAR
interface CamposNegociacaoProps {
  valorTotal: number;
  formasPagamento: FormaPagamento[];
  onFormasChange: (formas: FormaPagamento[]) => void;
}

export function CamposNegociacao({ valorTotal, formasPagamento, onFormasChange }: CamposNegociacaoProps) {
  const {
    descontoPercentual,
    valorNegociado,
    descontoReal,
    valorPresenteTotal,
    handleValorNegociadoChange,
    handleDescontoRealChange,
    isCalculating,
    validacoes
  } = useCalculadoraBidirecional(valorTotal, formasPagamento);

  return (
    <div className="grid grid-cols-2 gap-4">
      
      {/* Campo Valor Negociado - EDITÁVEL */}
      <div>
        <label>Valor Negociado</label>
        <Input
          type="text"
          value={formatarMoeda(valorNegociado)}
          onChange={(e) => handleValorNegociadoChange(parseMoeda(e.target.value))}
          disabled={isCalculating}
          className={`${isCalculating ? 'opacity-50' : ''} ${validacoes.valido ? '' : 'border-red-500'}`}
        />
      </div>

      {/* Campo Desconto Real - EDITÁVEL */}
      <div>
        <label>Desconto Real</label>
        <Input
          type="number"
          value={descontoReal.toFixed(1)}
          onChange={(e) => handleDescontoRealChange(parseFloat(e.target.value) || 0)}
          disabled={isCalculating}
          suffix="%"
          className={`${isCalculating ? 'opacity-50' : ''} ${validacoes.valido ? '' : 'border-red-500'}`}
        />
      </div>

      {/* Campos Readonly para Referência */}
      <div>
        <label>Desconto %</label>
        <div className="text-lg font-semibold text-blue-600">
          {descontoPercentual.toFixed(1)}%
        </div>
      </div>

      <div>
        <label>Valor Recebido (VP)</label>
        <div className="text-lg font-semibold text-green-600">
          {formatarMoeda(valorPresenteTotal)}
        </div>
      </div>

      {/* Validações */}
      {!validacoes.valido && (
        <div className="col-span-2 p-3 bg-red-50 border border-red-200 rounded">
          <ul className="text-red-600 text-sm">
            {validacoes.erros.map((erro, index) => (
              <li key={index}>⚠️ {erro}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Loading State */}
      {isCalculating && (
        <div className="col-span-2 text-center text-gray-500">
          🔄 Recalculando...
        </div>
      )}

    </div>
  );
}
```

### ✅ **Checklist de Implementação:**

**Hook useCalculadoraBidirecional:**
- [ ] Estado com proteções anti-loop
- [ ] Handler para Valor Negociado 
- [ ] Handler para Desconto Real
- [ ] Algoritmo iterativo para convergência
- [ ] Debounce de 300ms
- [ ] Validações integradas

**Componente CamposNegociacao:**
- [ ] Inputs editáveis para valores críticos
- [ ] Displays readonly para valores derivados  
- [ ] Estados de loading durante cálculo
- [ ] Validações visuais inline
- [ ] Feedback de erro contextual

**Testes Unitários:**
- [ ] Cenário 1: Edição Valor Negociado
- [ ] Cenário 2: Edição Desconto Real
- [ ] Proteção anti-loop infinito
- [ ] Validações de limites
- [ ] Convergência do algoritmo iterativo

---

## 🧪 **TESTES ESSENCIAIS** - Próxima Sprint