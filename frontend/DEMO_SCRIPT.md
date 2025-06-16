# 🎯 Demo Script - Client Presentation

## 📋 Complete Workflow Demonstration
*Esta demonstração mostra o fluxo completo: Cliente → Ambientes → Orçamento → Contratos*

### 🎬 **CENÁRIO DA DEMONSTRAÇÃO**
**Cliente:** João Silva Santos  
**Projeto:** Móveis planejados para apartamento (Cozinha + Dormitório + Banheiro)  
**Valor:** R$ 35.000 com 10% de desconto = R$ 31.500

---

## 🚀 **PASSO 1: Módulo Clientes**
**URL:** `/painel/clientes`

### ✅ O que mostrar:
1. **Interface profissional** com tabela de clientes
2. **Busca e filtros** funcionais
3. **Cadastro completo** - clicar em "Novo Cliente"
4. **Dados do cliente demo:**
   - Nome: João Silva Santos
   - CPF: 123.456.789-00
   - Telefone: (11) 99999-9999
   - Email: joao.silva@email.com
   - Endereço completo

### 💡 **Pontos a destacar:**
- "Veja como é simples cadastrar um novo cliente"
- "Todos os dados são validados em tempo real"
- "Interface intuitiva com feedback imediato"

---

## 🏢 **PASSO 2: Módulo Ambientes** 
**URL:** `/painel/ambientes`

### ✅ O que mostrar:
1. **Seletor de cliente** - escolher "João Silva Santos"
2. **Adicionar 3 ambientes:**
   - **Cozinha Planejada** - R$ 15.000
   - **Dormitório Master** - R$ 12.000  
   - **Banheiro Social** - R$ 8.000
3. **Cards visuais** com valores e descrições
4. **Total automático** sendo calculado

### 💡 **Pontos a destacar:**
- "O sistema já sabe qual cliente estamos atendendo"
- "Cada ambiente pode ter acabamentos específicos"
- "Valores são calculados automaticamente"

---

## 💰 **PASSO 3: Simulador de Orçamento**
**URL:** `/painel/orcamento/simulador`

### ✅ O que mostrar:
1. **Dados carregados automaticamente** (cliente + ambientes)
2. **Dashboard editável** com valores
3. **4 formas de pagamento configuradas:**
   - Entrada: R$ 10.000
   - Financeira: R$ 8.000  
   - Cartão: R$ 8.000
   - Boleto: R$ 5.500
4. **Desconto real calculado** automaticamente
5. **Cronograma de recebimento** detalhado

### 💡 **Pontos a destacar:**
- "Algoritmo proprietário calcula o desconto real"
- "Múltiplas formas de pagamento em um só orçamento"
- "Cliente visualiza exatamente quando receberemos"

---

## 📋 **PASSO 4: Resumo do Contrato**
**URL:** `/painel/contratos`

### ✅ O que mostrar:
1. **Validação automática** - alertas verdes de "tudo pronto"
2. **Resumo completo:**
   - Dados do cliente (editáveis)
   - Dados da loja
   - Resumo financeiro
   - Lista de ambientes
3. **Status do contrato** - "Em Edição" → "Pronto"
4. **Botão "Finalizar"** habilitado

### 💡 **Pontos a destacar:**
- "Sistema valida tudo automaticamente"
- "Últimos ajustes podem ser feitos aqui"
- "Status visual mostra andamento do processo"

---

## 📄 **PASSO 5: Contrato Final** 
**URL:** `/painel/contratos/visualizar`

### ✅ O que mostrar:
1. **Documento profissional** formatado
2. **Todas as seções legais:**
   - Cabeçalho com dados da empresa
   - Partes contratantes
   - Objeto do contrato (ambientes)
   - Condições gerais
   - Área de assinaturas
3. **Geração de PDF** funcionando
4. **Processo de assinatura digital:**
   - Clicar em "Assinatura Digital"
   - Status muda para "Enviado"
   - Após 3 segundos: "Assinado" ✅

### 💡 **Pontos a destacar:**
- "Documento profissional pronto para apresentar"
- "PDF gerado instantaneamente"
- "Assinatura digital integrada"
- "Fluxo completo finalizado!"

---

## 🎯 **MENSAGEM FINAL PARA O CLIENTE**

> **"Em menos de 5 minutos, transformamos uma necessidade do cliente em um contrato profissional completo, com validações automáticas, cálculos precisos e documentação legal. Esse é o poder da nossa solução!"**

---

## ⚠️ **CHECKLIST PRÉ-DEMO**

### Antes da apresentação, verificar:
- [ ] Servidor rodando sem erros: `npm run dev`
- [ ] Dados de teste carregados corretamente
- [ ] PDF generation funcionando
- [ ] Navegação entre módulos fluida
- [ ] Responsividade em diferentes telas
- [ ] Todas as validações ativas

### Dados de backup (se necessário):
```javascript
// Cliente de teste
const clienteDemo = {
  nome: "João Silva Santos",
  cpf: "123.456.789-00", 
  telefone: "(11) 99999-9999",
  email: "joao.silva@email.com",
  endereco: "Rua das Flores, 123, Centro - São Paulo/SP"
}

// Ambientes de teste
const ambientesDemo = [
  { nome: "Cozinha Planejada", valor: 15000 },
  { nome: "Dormitório Master", valor: 12000 },
  { nome: "Banheiro Social", valor: 8000 }
]
```

---

## 🚨 **PLANO B - Se algo der errado:**

1. **PDF não gera:** Mostrar preview do contrato e explicar funcionalidade
2. **Dados não carregam:** Usar mock data e explicar integração
3. **Navegação falha:** Demonstrar módulos individualmente
4. **Sistema lento:** Focar na arquitetura e explicar benefícios

---

**🎯 OBJETIVO:** Demonstrar que criamos uma solução completa, profissional e integrada que simplifica todo o processo comercial da empresa.