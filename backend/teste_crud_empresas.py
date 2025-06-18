"""
TESTE CRUD EMPRESAS - AGENTE 2
Testa os novos endpoints de CREATE, UPDATE, DELETE para empresas
"""
import requests
import json
from datetime import datetime
import uuid

def testar_crud_empresas():
    """Testa todos os endpoints CRUD de empresas"""
    
    base_url = "http://localhost:8000/api/v1/empresas"
    
    print("🚀 TESTANDO CRUD EMPRESAS - AGENTE 2")
    print("=" * 50)
    
    # Headers básicos (sem auth por enquanto para teste inicial)
    headers = {
        "Content-Type": "application/json"
    }
    
    # ===== TESTE 1: CRIAR EMPRESA =====
    print("\n1️⃣ TESTE CREATE - POST /empresas/")
    
    empresa_teste = {
        "nome": f"Empresa Teste {datetime.now().strftime('%H%M%S')}",
        "cnpj": f"12345678000{datetime.now().strftime('%S')}",
        "email": "teste@empresa.com",
        "telefone": "(11) 99999-9999",
        "endereco": "Rua Teste, 123",
        "ativo": True
    }
    
    try:
        response = requests.post(
            f"{base_url}/", 
            json=empresa_teste,
            headers=headers,
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        
        if response.status_code == 201:
            empresa_criada = response.json()
            empresa_id = empresa_criada.get('id')
            print(f"✅ Empresa criada com sucesso! ID: {empresa_id}")
        else:
            print(f"❌ Erro ao criar empresa: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erro de conexão: {str(e)}")
        return
    
    # ===== TESTE 2: ATUALIZAR EMPRESA =====
    if 'empresa_id' in locals():
        print(f"\n2️⃣ TESTE UPDATE - PUT /empresas/{empresa_id}")
        
        update_data = {
            "nome": f"Empresa Atualizada {datetime.now().strftime('%H%M%S')}",
            "telefone": "(11) 88888-8888"
        }
        
        try:
            response = requests.put(
                f"{base_url}/{empresa_id}",
                json=update_data,
                headers=headers,
                timeout=10
            )
            
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            
            if response.status_code == 200:
                print("✅ Empresa atualizada com sucesso!")
            else:
                print(f"❌ Erro ao atualizar empresa: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Erro de conexão: {str(e)}")
    
    # ===== TESTE 3: ALTERNAR STATUS =====
    if 'empresa_id' in locals():
        print(f"\n3️⃣ TESTE STATUS - PATCH /empresas/{empresa_id}/status")
        
        try:
            response = requests.patch(
                f"{base_url}/{empresa_id}/status?ativo=false",
                headers=headers,
                timeout=10
            )
            
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            
            if response.status_code == 200:
                print("✅ Status alterado com sucesso!")
            else:
                print(f"❌ Erro ao alterar status: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Erro de conexão: {str(e)}")
    
    # ===== TESTE 4: EXCLUIR EMPRESA =====
    if 'empresa_id' in locals():
        print(f"\n4️⃣ TESTE DELETE - DELETE /empresas/{empresa_id}")
        
        try:
            response = requests.delete(
                f"{base_url}/{empresa_id}",
                headers=headers,
                timeout=10
            )
            
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            
            if response.status_code == 200:
                print("✅ Empresa excluída com sucesso!")
            else:
                print(f"❌ Erro ao excluir empresa: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Erro de conexão: {str(e)}")
    
    # ===== TESTE 5: VERIFICAR ENDPOINT DE TESTE =====
    print("\n5️⃣ TESTE CONEXÃO - GET /teste-conexao-real")
    
    try:
        response = requests.get(
            f"{base_url}/teste-conexao-real",
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Conexão OK: {data.get('🟢 STATUS', 'N/A')}")
            print(f"📊 Total empresas: {data.get('📈 ESTATISTICAS', {}).get('total_empresas', 'N/A')}")
        else:
            print(f"❌ Erro na conexão: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erro de conexão: {str(e)}")
    
    print("\n" + "=" * 50)
    print("✅ TESTES CONCLUÍDOS!")
    print("=" * 50)

def salvar_relatorio_teste():
    """Salva relatório do teste"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"relatorio_crud_empresas_{timestamp}.json"
    
    relatorio = {
        "agente": "AGENTE_2_BACKEND",
        "fase": "FASE_1_CRUD_EMPRESAS", 
        "timestamp": timestamp,
        "status": "IMPLEMENTACAO_COMPLETA",
        "endpoints_implementados": [
            "POST /empresas/",
            "PUT /empresas/{empresa_id}",
            "DELETE /empresas/{empresa_id}",
            "PATCH /empresas/{empresa_id}/status"
        ],
        "validacoes_implementadas": [
            "CNPJ único",
            "Dados obrigatórios",
            "Empresa existe",
            "Lojas ativas",
            "Permissões de usuário"
        ],
        "proximos_passos": [
            "Testar endpoints com backend rodando",
            "Validar autenticação",
            "Integrar com frontend",
            "Pedir permissão para Fase 2"
        ]
    }
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(relatorio, f, indent=2, ensure_ascii=False)
    
    print(f"📝 Relatório salvo em: {filename}")
    return filename

if __name__ == "__main__":
    testar_crud_empresas()
    salvar_relatorio_teste() 