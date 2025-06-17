#!/usr/bin/env python
"""
Debug real - Lista todas as rotas registradas via HTTP
"""

import requests

def listar_rotas_via_http():
    print("🔍 VERIFICANDO ROTAS REGISTRADAS NO SERVIDOR\n")
    
    # Tentar acessar endpoint de debug se existir
    base_url = "http://localhost:8000"
    
    # Primeiro, confirmar que o servidor está rodando
    try:
        resp = requests.get(f"{base_url}/health")
        print(f"✅ Servidor está rodando: {resp.status_code}")
    except:
        print("❌ Servidor não está acessível!")
        return
    
    # Testar alguns endpoints conhecidos
    print("\n📋 TESTANDO ENDPOINTS CONHECIDOS:")
    
    endpoints_para_testar = [
        # Sistema
        ("/", "Root"),
        ("/health", "Health"),
        ("/debug-routes", "Debug Routes"),
        
        # API v1
        ("/api/v1/", "API Root"),
        ("/api/v1/test/", "Test Root"),
        ("/api/v1/test/clientes", "Test Clientes"),
        
        # Possíveis variações
        ("/test/", "Test Direct"),
        ("/api/test/", "API Test Direct"),
    ]
    
    for endpoint, nome in endpoints_para_testar:
        try:
            resp = requests.get(f"{base_url}{endpoint}", timeout=2)
            if resp.status_code == 200:
                print(f"✅ {nome:20} [{endpoint}] - OK")
            elif resp.status_code == 404:
                print(f"❌ {nome:20} [{endpoint}] - 404 Not Found")
            else:
                print(f"⚠️  {nome:20} [{endpoint}] - Status {resp.status_code}")
        except Exception as e:
            print(f"❌ {nome:20} [{endpoint}] - Erro: {e}")
    
    # Tentar acessar o endpoint de debug se existir
    print("\n📋 TENTANDO ENDPOINT DE DEBUG:")
    try:
        resp = requests.get(f"{base_url}/debug-routes")
        if resp.status_code == 200:
            dados = resp.json()
            print(f"\n✅ TOTAL DE ROTAS REGISTRADAS: {dados.get('total_routes', '?')}")
            print("\n📍 ROTAS ENCONTRADAS:")
            for rota in dados.get('routes', []):
                print(f"   {rota['path']:40} {rota['methods']}")
    except:
        print("❌ Endpoint /debug-routes não disponível")

if __name__ == "__main__":
    listar_rotas_via_http()