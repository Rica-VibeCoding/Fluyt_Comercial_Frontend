#!/usr/bin/env python3

import requests
import json

def test_crud_completo():
    """Testar CRUD completo implementado"""
    
    print("🧪 TESTE CRUD COMPLETO - MÓDULO EQUIPE")
    print("=" * 60)
    
    base_url = "http://localhost:8000/api/v1"
    
    # 1. GET - Listar (deve funcionar mesmo com autenticação)
    print("\n1️⃣ TESTE GET - Listar funcionários")
    try:
        response = requests.get(f"{base_url}/equipe")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Total funcionários: {data.get('total', 0)}")
            print(f"   ✅ Ativos: {data.get('ativos', 0)}")
            print(f"   ✅ Por loja: {data.get('por_loja', {})}")
        else:
            error_data = response.json()
            print(f"   ❌ Erro: {error_data.get('detail', 'N/A')}")
    except Exception as e:
        print(f"   ❌ Exceção: {e}")
    
    # 2. GET por ID - Buscar funcionário específico  
    print("\n2️⃣ TESTE GET/{id} - Buscar por ID")
    funcionario_id = "51616a46-597f-4a91-bb29-c9c4075b3249"  # ID do Cleiton
    try:
        response = requests.get(f"{base_url}/equipe/{funcionario_id}")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Funcionário: {data.get('nome', 'N/A')}")
            print(f"   ✅ Email: {data.get('email', 'N/A')}")
            print(f"   ✅ Loja: {data.get('loja_nome', 'N/A')}")
        else:
            error_data = response.json()
            print(f"   ❌ Erro: {error_data.get('detail', 'N/A')}")
    except Exception as e:
        print(f"   ❌ Exceção: {e}")
    
    # 3. POST - Criar funcionário
    print("\n3️⃣ TESTE POST - Criar funcionário")
    novo_funcionario = {
        "nome": "Funcionário Teste CRUD",
        "email": "teste.crud@empresa.com",
        "telefone": "(11) 99999-9999",
        "setor_id": "2faea93f-ed12-476a-8320-48ee7cda5695",  # Setor Vendas
        "loja_id": "317c3115-e071-40a6-9bc5-7c3227e0d82c",   # Loja D-Art
        "perfil": "VENDEDOR",
        "salario": 3000.00,
        "limite_desconto": 0.10,
        "ativo": True
    }
    try:
        response = requests.post(f"{base_url}/equipe", json=novo_funcionario)
        print(f"   Status: {response.status_code}")
        if response.status_code == 201:
            data = response.json()
            novo_id = data.get('id')
            print(f"   ✅ Funcionário criado: {data.get('nome', 'N/A')}")
            print(f"   ✅ ID: {novo_id}")
            print(f"   ✅ Loja: {data.get('loja_nome', 'N/A')}")
            
            # 4. PUT - Atualizar funcionário criado
            print("\n4️⃣ TESTE PUT - Atualizar funcionário")
            atualizacao = {
                "nome": "Funcionário Teste CRUD - ATUALIZADO",
                "salario": 3500.00,
                "limite_desconto": 0.15
            }
            try:
                response = requests.put(f"{base_url}/equipe/{novo_id}", json=atualizacao)
                print(f"   Status: {response.status_code}")
                if response.status_code == 200:
                    data = response.json()
                    print(f"   ✅ Nome atualizado: {data.get('nome', 'N/A')}")
                    print(f"   ✅ Salário atualizado: R$ {data.get('salario', 0)}")
                else:
                    error_data = response.json()
                    print(f"   ❌ Erro: {error_data.get('detail', 'N/A')}")
            except Exception as e:
                print(f"   ❌ Exceção: {e}")
            
            # 5. PATCH - Toggle status
            print("\n5️⃣ TESTE PATCH - Toggle status")
            try:
                response = requests.patch(f"{base_url}/equipe/{novo_id}/toggle-status")
                print(f"   Status: {response.status_code}")
                if response.status_code == 200:
                    data = response.json()
                    print(f"   ✅ {data.get('message', 'N/A')}")
                    print(f"   ✅ Status ativo: {data.get('ativo', 'N/A')}")
                else:
                    error_data = response.json()
                    print(f"   ❌ Erro: {error_data.get('detail', 'N/A')}")
            except Exception as e:
                print(f"   ❌ Exceção: {e}")
            
            # 6. DELETE - Excluir funcionário
            print("\n6️⃣ TESTE DELETE - Excluir funcionário")
            try:
                response = requests.delete(f"{base_url}/equipe/{novo_id}")
                print(f"   Status: {response.status_code}")
                if response.status_code == 200:
                    data = response.json()
                    print(f"   ✅ {data.get('message', 'N/A')}")
                    print(f"   ✅ Tipo: {data.get('tipo', 'N/A')}")
                else:
                    error_data = response.json()
                    print(f"   ❌ Erro: {error_data.get('detail', 'N/A')}")
            except Exception as e:
                print(f"   ❌ Exceção: {e}")
                
        else:
            error_data = response.json()
            print(f"   ❌ Erro na criação: {error_data.get('detail', 'N/A')}")
    except Exception as e:
        print(f"   ❌ Exceção na criação: {e}")
    
    # 7. GET Stats - Estatísticas
    print("\n7️⃣ TESTE STATS - Estatísticas")
    try:
        response = requests.get(f"{base_url}/equipe/stats/dashboard")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            stats = data.get('data', {})
            print(f"   ✅ Total funcionários: {stats.get('total', 0)}")
            print(f"   ✅ Ativos: {stats.get('ativos', 0)}")
            print(f"   ✅ Inativos: {stats.get('inativos', 0)}")
        else:
            error_data = response.json()
            print(f"   ❌ Erro: {error_data.get('detail', 'N/A')}")
    except Exception as e:
        print(f"   ❌ Exceção: {e}")
    
    print("\n" + "=" * 60)
    print("🎯 TESTE CRUD COMPLETO FINALIZADO")

if __name__ == "__main__":
    test_crud_completo() 