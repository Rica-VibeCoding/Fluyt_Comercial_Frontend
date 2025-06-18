"""
Verificar se a loja existe no Supabase
"""
from supabase import create_client, Client

def test_loja_exists():
    """Verifica se a loja D-Art existe"""
    
    # Credenciais hardcoded para teste rápido
    url = "https://momwbpxqnvgehotfmvde.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzAxNTIsImV4cCI6MjA2MzM0NjE1Mn0.n90ZweBT-o1ugerZJDZl8gx65WGe1eUrhph6VuSdSCs"
    
    try:
        # Criar cliente
        supabase: Client = create_client(url, key)
        print("✅ Cliente Supabase criado\n")
        
        # ID da loja que estamos usando
        loja_id = "317c3115-e071-40a6-9bc5-7c3227e0d82c"
        
        # 1. Verificar se a loja existe
        print(f"🔍 Verificando se a loja {loja_id} existe...")
        loja_response = supabase.table('c_lojas').select('*').eq('id', loja_id).execute()
        
        if loja_response.data:
            loja = loja_response.data[0]
            print(f"✅ Loja encontrada: {loja.get('nome', 'Sem nome')}")
            print(f"   Empresa ID: {loja.get('empresa_id')}")
            print(f"   Ativa: {loja.get('ativo')}\n")
        else:
            print(f"❌ Loja {loja_id} NÃO encontrada!\n")
            
            # Listar todas as lojas disponíveis
            print("📋 Lojas disponíveis no banco:")
            todas_lojas = supabase.table('c_lojas').select('id, nome, ativo').execute()
            for i, loja in enumerate(todas_lojas.data, 1):
                print(f"{i}. {loja['nome']} (ID: {loja['id']}) - Ativa: {loja['ativo']}")
            return
        
        # 2. Verificar clientes da loja
        print(f"🔍 Buscando clientes da loja...")
        clientes = supabase.table('c_clientes').select('*').eq('loja_id', loja_id).execute()
        print(f"📊 Total de clientes: {len(clientes.data)}\n")
        
        if clientes.data:
            for i, cliente in enumerate(clientes.data[:3], 1):
                print(f"{i}. {cliente.get('nome', 'Sem nome')}")
                print(f"   CPF/CNPJ: {cliente.get('cpf_cnpj')}")
                print(f"   Telefone: {cliente.get('telefone')}\n")
        
        # 3. Verificar equipe/vendedores
        print(f"🔍 Buscando equipe da loja...")
        equipe = supabase.table('c_equipe').select('*').eq('loja_id', loja_id).execute()
        print(f"📊 Total de membros da equipe: {len(equipe.data)}\n")
        
        if equipe.data:
            for i, membro in enumerate(equipe.data[:3], 1):
                print(f"{i}. {membro.get('nome', 'Sem nome')}")
                print(f"   Perfil: {membro.get('perfil')}")
                print(f"   Email: {membro.get('email')}\n")
                
    except Exception as e:
        print(f"❌ Erro: {e}")
        print(f"   Tipo: {type(e).__name__}")

if __name__ == "__main__":
    test_loja_exists()