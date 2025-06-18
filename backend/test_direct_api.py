"""
Teste direto da API de clientes
"""
import requests
import json

def test_clientes_api():
    """Testa o endpoint de clientes diretamente"""
    
    # URL da API
    base_url = "http://localhost:8000"
    loja_id = "317c3115-e071-40a6-9bc5-7c3227e0d82c"  # D-Art real
    
    print("🔍 Testando API de clientes...\n")
    
    try:
        # Fazer requisição
        response = requests.get(
            f"{base_url}/api/v1/test/clientes",
            params={"loja_id": loja_id}
        )
        
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ Resposta da API:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
            if data.get('success') and data.get('data', {}).get('clientes'):
                clientes = data['data']['clientes']
                print(f"\n📋 Total de clientes: {len(clientes)}")
                
                for i, cliente in enumerate(clientes, 1):
                    print(f"\n{i}. {cliente.get('nome', 'Sem nome')}")
                    print(f"   ID: {cliente.get('id', 'N/A')}")
                    print(f"   CPF/CNPJ: {cliente.get('cpf_cnpj', 'N/A')}")
                    print(f"   Telefone: {cliente.get('telefone', 'N/A')}")
                    print(f"   Cidade: {cliente.get('cidade', 'N/A')}")
                    print(f"   Criado em: {cliente.get('created_at', 'N/A')}")
        else:
            print(f"❌ Erro: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Erro: Não foi possível conectar ao servidor")
        print("💡 Certifique-se de que o backend está rodando em http://localhost:8000")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == "__main__":
    test_clientes_api()