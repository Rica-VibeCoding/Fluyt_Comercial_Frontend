#!/usr/bin/env python3
"""
Teste direto de rota para debug do 404.
"""

from fastapi import FastAPI
from fastapi.testclient import TestClient
from main import app

# Cliente de teste
client = TestClient(app)

print("🔍 TESTE DIRETO DAS ROTAS:\n")

# Testar health
print("1. Testando /health:")
response = client.get("/health")
print(f"   Status: {response.status_code}")
print(f"   Body: {response.json()}\n")

# Testar rotas de test
test_routes = [
    "/api/v1/test/",
    "/api/v1/test/clientes?loja_id=test",
    "/test/",
    "/test/clientes"
]

for route in test_routes:
    print(f"2. Testando {route}:")
    response = client.get(route)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   Body: {response.json()}")
    print()

# Debug: verificar se o router está realmente incluído
print("\n🔧 DEBUG - Verificando routers:")
print(f"Total de rotas: {len(app.routes)}")

# Verificar se há algum middleware bloqueando
print("\n🔧 DEBUG - Middlewares:")
for i, middleware in enumerate(app.user_middleware):
    print(f"   {i+1}. {middleware}")