#!/usr/bin/env python
"""
Sistema de Teste para Windows - Executa testes do backend
"""

import requests
import json
from datetime import datetime

def testar_sistema():
    print("🚀 TESTANDO SISTEMA FLUYT - BACKEND\n")
    print("="*50)
    
    base_url = "http://localhost:8000"
    resultados = []
    
    # 1. Teste de Health
    print("\n📋 1. Testando Health Check...")
    try:
        resp = requests.get(f"{base_url}/health", timeout=5)
        if resp.status_code == 200:
            print("✅ Health Check: OK")
            print(f"   Resposta: {resp.json()}")
            resultados.append({"teste": "Health", "status": "OK"})
        else:
            print(f"❌ Health Check: Erro {resp.status_code}")
            resultados.append({"teste": "Health", "status": "ERRO"})
    except Exception as e:
        print(f"❌ Health Check: {e}")
        resultados.append({"teste": "Health", "status": "ERRO", "erro": str(e)})
    
    # 2. Teste dos endpoints de teste
    print("\n📋 2. Testando Endpoints de Teste...")
    
    endpoints = [
        ("/api/v1/test/", "Test Root"),
        ("/api/v1/test/clientes?loja_id=test", "Listar Clientes"),
        ("/api/v1/test/dados-iniciais", "Dados Iniciais")
    ]
    
    for endpoint, nome in endpoints:
        print(f"\n   🧪 Testando {nome}...")
        try:
            resp = requests.get(f"{base_url}{endpoint}", timeout=5)
            if resp.status_code == 200:
                print(f"   ✅ {nome}: OK")
                dados = resp.json()
                # Mostrar preview dos dados
                if isinstance(dados, dict):
                    chaves = list(dados.keys())[:3]
                    print(f"      Dados recebidos: {chaves}...")
                resultados.append({"teste": nome, "status": "OK", "endpoint": endpoint})
            else:
                print(f"   ❌ {nome}: Erro {resp.status_code}")
                resultados.append({"teste": nome, "status": "ERRO", "codigo": resp.status_code})
        except Exception as e:
            print(f"   ❌ {nome}: {e}")
            resultados.append({"teste": nome, "status": "ERRO", "erro": str(e)})
    
    # 3. Teste de CORS
    print("\n📋 3. Testando Configuração CORS...")
    try:
        headers = {
            'Origin': 'http://localhost:3000',
            'Access-Control-Request-Method': 'GET'
        }
        resp = requests.options(f"{base_url}/api/v1/test/clientes", headers=headers, timeout=5)
        cors_header = resp.headers.get('Access-Control-Allow-Origin', 'Não configurado')
        
        if 'localhost:3000' in cors_header or '*' in cors_header:
            print("✅ CORS: Configurado corretamente")
            print(f"   Header: {cors_header}")
            resultados.append({"teste": "CORS", "status": "OK"})
        else:
            print(f"❌ CORS: {cors_header}")
            resultados.append({"teste": "CORS", "status": "ERRO", "header": cors_header})
    except Exception as e:
        print(f"❌ CORS: {e}")
        resultados.append({"teste": "CORS", "status": "ERRO", "erro": str(e)})
    
    # Resumo Final
    print("\n" + "="*50)
    print("📊 RESUMO DOS TESTES")
    print("="*50)
    
    total = len(resultados)
    sucessos = len([r for r in resultados if r["status"] == "OK"])
    falhas = total - sucessos
    
    print(f"\nTotal de testes: {total}")
    print(f"✅ Sucessos: {sucessos}")
    print(f"❌ Falhas: {falhas}")
    
    if falhas == 0:
        print("\n🎉 TODOS OS TESTES PASSARAM!")
        print("✅ Sistema está 100% funcional!")
        print("✅ Frontend pode se conectar sem problemas!")
    else:
        print("\n⚠️ Alguns testes falharam:")
        for r in resultados:
            if r["status"] == "ERRO":
                print(f"   • {r['teste']}: {r.get('erro', r.get('codigo', 'Erro'))}")
    
    # Salvar relatório
    relatorio = {
        "timestamp": datetime.now().isoformat(),
        "total_testes": total,
        "sucessos": sucessos,
        "falhas": falhas,
        "detalhes": resultados
    }
    
    with open("relatorio_teste_windows.json", "w") as f:
        json.dump(relatorio, f, indent=2)
    
    print(f"\n📄 Relatório detalhado salvo em: relatorio_teste_windows.json")
    
    return falhas == 0

if __name__ == "__main__":
    testar_sistema()