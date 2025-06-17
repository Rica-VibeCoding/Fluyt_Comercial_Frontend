"""
Teste direto da conexão Supabase
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Carregar variáveis de ambiente
load_dotenv()

def test_supabase_connection():
    """Testa conexão direta com Supabase"""
    
    print("🔍 Testando conexão com Supabase...\n")
    
    # Obter credenciais
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    
    print(f"📋 URL: {url}")
    print(f"📋 Key: {key[:20]}...{key[-20:]}\n")
    
    if not url or not key:
        print("❌ Variáveis de ambiente não configuradas!")
        return
    
    try:
        # Criar cliente
        supabase: Client = create_client(url, key)
        print("✅ Cliente Supabase criado com sucesso!\n")
        
        # Testar listagem de clientes
        loja_id = "317c3115-e071-40a6-9bc5-7c3227e0d82c"  # D-Art
        print(f"🔍 Buscando clientes da loja {loja_id}...\n")
        
        response = supabase.table('c_clientes')\
            .select('*')\
            .eq('loja_id', loja_id)\
            .execute()
        
        print(f"✅ Consulta executada com sucesso!")
        print(f"📊 Total de clientes encontrados: {len(response.data)}\n")
        
        for i, cliente in enumerate(response.data[:5], 1):  # Mostrar até 5
            print(f"{i}. {cliente.get('nome', 'Sem nome')}")
            print(f"   ID: {cliente.get('id')}")
            print(f"   CPF/CNPJ: {cliente.get('cpf_cnpj')}")
            print(f"   Telefone: {cliente.get('telefone')}")
            print(f"   Criado em: {cliente.get('created_at')}\n")
            
    except Exception as e:
        print(f"❌ Erro ao conectar com Supabase: {e}")
        print(f"   Tipo do erro: {type(e).__name__}")

if __name__ == "__main__":
    test_supabase_connection()