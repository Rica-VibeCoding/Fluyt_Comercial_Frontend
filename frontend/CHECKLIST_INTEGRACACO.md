# ✅ CHECKLIST DE INTEGRAÇÃO - AGENTE SÊNIOR

## 🎯 VERIFICAÇÕES PRÉ-TESTE

### **Backend (Agente 2)**
- [ ] `cd backend` executado
- [ ] `python startup_verificador.py` rodou com sucesso
- [ ] Todas as ✅ apareceram no verificador
- [ ] `python main.py` inicia sem erros
- [ ] Mensagem "Uvicorn running on http://0.0.0.0:8000" aparece

### **Frontend (Agente 1)**  
- [ ] Arquivo `src/lib/health-check.ts` criado
- [ ] Arquivo `src/lib/config.ts` existe (criado pelo sênior)
- [ ] Componente `src/components/debug/botao-teste-backend.tsx` criado
- [ ] `npm run dev` roda sem erros TypeScript
- [ ] Página principal carrega com botão de teste

## 🔬 TESTES DE CONECTIVIDADE

### **Teste 1: Health Check Básico**
- [ ] Backend responde: `curl http://localhost:8000/health`
- [ ] Frontend consegue: `testBackendConnection()` no console
- [ ] Botão "Testar Health Check" retorna `success: true`

### **Teste 2: CORS Funcionando**
- [ ] Não há erros de CORS no console do browser
- [ ] Headers `Access-Control-Allow-Origin` presentes
- [ ] Request OPTIONS preflight funcionando

### **Teste 3: End-to-End**
- [ ] Frontend → Backend → Response → Frontend (ciclo completo)
- [ ] JSON response parseado corretamente
- [ ] Timestamp de resposta aparecendo

## 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### **Backend não inicia**
```bash
# Verificar porta ocupada
netstat -tulpn | grep :8000

# Matar processo se necessário
pkill -f "python main.py"

# Reinstalar dependências
pip install -r requirements.txt --force-reinstall
```

### **Erro de CORS**
```
❌ Access to fetch at 'http://localhost:8000/health' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solução:** Verificar `CORS_ORIGINS` no `.env` do backend

### **Frontend não conecta**
```typescript
// Debug no console do browser
console.log('🔍 Testando config...');
import { verificarConfiguracoes } from './lib/config';
console.log(verificarConfiguracoes());
```

## 📊 RELATÓRIO ESPERADO DOS JÚNIORES

### **Agente 1 (Frontend)**
```
✅ health-check.ts criado e funcionando
✅ botao-teste-backend.tsx criado
✅ Página principal renderiza
✅ Botão aparece na interface
✅ Console sem erros TypeScript
✅ Teste manual: [SUCCESS/ERROR + detalhes]
```

### **Agente 2 (Backend)**
```
✅ startup_verificador.py executado com sucesso
✅ Backend inicia na porta 8000
✅ /health retorna status 200
✅ /api/v1/docs carrega página
✅ CORS configurado corretamente
✅ Nenhum erro no startup
```

## 🎯 PRÓXIMA RODADA (Após Sucesso)

### **Tasks Nível 2:**
- **Agente 1:** Criar cliente HTTP com interceptors
- **Agente 2:** Validar endpoints de clientes
- **Sênior:** Configurar autenticação JWT

### **Meta da Rodada 2:**
Frontend consegue fazer `GET /api/v1/clientes` e receber dados reais do Supabase.

---

**🤖 AGENTE SÊNIOR:** Configurações críticas preparadas. Sistema pronto para testes dos júniores.