#!/bin/bash

# 🧪 TESTE DE CONECTIVIDADE BACKEND
# Arquivo: testes/test-backend-connection.sh
# Propósito: Verificar se backend está funcionando corretamente

echo "🔍 TESTANDO CONECTIVIDADE BACKEND..."
echo "=================================="

# 1. Teste básico - Health check
echo "1️⃣ Testando endpoint base..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8000/health || echo "❌ Erro de conexão"

# 2. Teste endpoint de teste base
echo ""
echo "2️⃣ Testando endpoint /api/v1/test/..."
curl -s -X GET "http://localhost:8000/api/v1/test/" -H "Content-Type: application/json" | head -100 || echo "❌ Endpoint não acessível"

# 3. Teste específico de clientes
echo ""
echo "3️⃣ Testando endpoint clientes..."
curl -s -X GET "http://localhost:8000/api/v1/test/clientes?loja_id=550e8400-e29b-41d4-a716-446655440001" -H "Content-Type: application/json" | head -100 || echo "❌ Endpoint clientes não funciona"

# 4. Teste dados iniciais
echo ""
echo "4️⃣ Testando dados iniciais..."
curl -s -X GET "http://localhost:8000/api/v1/test/dados-iniciais" -H "Content-Type: application/json" | head -100 || echo "❌ Dados iniciais indisponíveis"

echo ""
echo "✅ Testes concluídos!"