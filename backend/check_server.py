#!/usr/bin/env python3
"""
Verifica QUAL servidor está realmente rodando
"""

import requests
import json

def verificar_servidor():
    print("🔍 VERIFICANDO QUAL SERVIDOR ESTÁ ATIVO...\n")
    
    try:
        # Testar root
        print("1. Testando endpoint root...")
        response = requests.get("http://localhost:8000/", timeout=3)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ TÍTULO: {data.get('message', 'N/A')}")
            print(f"📊 STATUS: {json.dumps(data, indent=2)}")
        
        # Testar health
        print("\n2. Testando health...")
        response = requests.get("http://localhost:8000/health", timeout=3)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SERVICE: {data.get('service', 'N/A')}")
            print(f"📊 DEBUG: {data.get('debug_info', 'N/A')}")
        
        # Testar test endpoint
        print("\n3. Testando test endpoint...")
        response = requests.get("http://localhost:8000/api/v1/test/", timeout=3)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ MESSAGE: {data.get('message', 'N/A')}")
            print(f"📊 DATABASE: {data.get('database_mode', 'N/A')}")
        
        # Testar clientes com ID específico
        print("\n4. Testando clientes endpoint...")
        response = requests.get("http://localhost:8000/api/v1/test/clientes?loja_id=317c3115-e071-40a6-9bc5-7c3227e0d82c", timeout=3)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ MESSAGE: {data.get('message', 'N/A')}")
            if data.get('data', {}).get('clientes'):
                primeiro_cliente = data['data']['clientes'][0]
                print(f"👤 PRIMEIRO CLIENTE: {primeiro_cliente.get('nome', 'N/A')}")
                print(f"📱 CPF/CNPJ: {primeiro_cliente.get('cpf_cnpj', 'N/A')}")
                
                # Detectar se é mock ou real
                if "Teste" in primeiro_cliente.get('nome', '') or primeiro_cliente.get('cpf_cnpj') == '12345678901':
                    print("🚨 ALERTA: DADOS MOCK DETECTADOS!")
                else:
                    print("✅ DADOS REAIS DETECTADOS!")
            
    except requests.exceptions.ConnectionError:
        print("❌ SERVIDOR NÃO ESTÁ RESPONDENDO")
    except Exception as e:
        print(f"❌ ERRO: {e}")

if __name__ == "__main__":
    verificar_servidor()