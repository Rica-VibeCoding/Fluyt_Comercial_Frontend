"""
Main.py UNIVERSAL - Funciona com Supabase real OU fallback para mock
SEMPRE FUNCIONA - Empresário pode usar sem se preocupar com dependências
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import time
import json

# App básico
app = FastAPI(title="Fluyt Universal API", version="1.0.0")

# CORS simples
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Variável global para controlar tipo de dados
USANDO_SUPABASE = False
supabase = None
STATUS_CONEXAO = "Inicializando..."

def inicializar_supabase():
    """Tenta conectar com Supabase. Se falhar, usa mock."""
    global USANDO_SUPABASE, supabase, STATUS_CONEXAO
    
    try:
        # Configuração Supabase
        SUPABASE_URL = "https://momwbpxqnvgehotfmvde.supabase.co"
        SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzAxNTIsImV4cCI6MjA2MzM0NjE1Mn0.n90ZweBT-o1ugerZJDZl8gx65WGe1eUrhph6VuSdSCs"
        
        print("🔄 Tentando conectar com Supabase...")
        
        # Importar supabase
        from supabase import create_client, Client
        
        # Criar cliente
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Teste de conexão
        response = supabase.table('c_clientes').select('id').limit(1).execute()
        
        if response.data:
            USANDO_SUPABASE = True
            STATUS_CONEXAO = f"✅ Conectado com Supabase - {len(response.data)} clientes encontrados"
            print(STATUS_CONEXAO)
        else:
            raise Exception("Nenhum dados encontrado")
            
    except Exception as e:
        USANDO_SUPABASE = False
        STATUS_CONEXAO = f"⚠️ Usando dados mock - Erro Supabase: {str(e)[:100]}"
        print(STATUS_CONEXAO)

# Inicializar na startup
inicializar_supabase()

# Health básico
@app.get("/health")
async def health():
    return {
        "status": "healthy", 
        "timestamp": time.time(),
        "database": "supabase" if USANDO_SUPABASE else "mock",
        "connection_status": STATUS_CONEXAO
    }

# Root básico
@app.get("/")
async def root():
    return {
        "message": "Fluyt Universal API funcionando!",
        "database_mode": "Supabase Real" if USANDO_SUPABASE else "Dados Mock",
        "status": STATUS_CONEXAO,
        "endpoints": ["/health", "/api/v1/test/"]
    }

@app.get("/api/v1/test/")
async def test_root():
    return {
        "success": True,
        "message": f"Endpoint funcionando com {'Supabase REAL' if USANDO_SUPABASE else 'dados MOCK'}!",
        "database_mode": "supabase" if USANDO_SUPABASE else "mock",
        "connection_status": STATUS_CONEXAO,
        "endpoints": [
            "/api/v1/test/",
            "/api/v1/test/clientes",
            "/api/v1/test/dados-iniciais"
        ]
    }

@app.get("/api/v1/test/clientes")
async def test_clientes_universal(loja_id: str = Query(None)):
    global supabase, USANDO_SUPABASE
    
    if USANDO_SUPABASE:
        # DADOS REAIS DO SUPABASE
        try:
            query = supabase.table('c_clientes').select('*')
            
            if loja_id:
                query = query.eq('loja_id', loja_id)
            
            response = query.execute()
            
            clientes = []
            for cliente in response.data:
                clientes.append({
                    "id": cliente["id"],
                    "nome": cliente["nome"],
                    "cpf_cnpj": cliente["cpf_cnpj"],
                    "telefone": cliente["telefone"],
                    "email": cliente.get("email", ""),
                    "endereco": cliente.get("endereco", ""),
                    "cidade": cliente.get("cidade", ""),
                    "loja_id": cliente["loja_id"],
                    "tipo_venda": cliente.get("tipo_venda", "NORMAL")
                })
            
            return {
                "success": True,
                "message": f"✅ DADOS REAIS: {len(clientes)} clientes do Supabase (loja: {loja_id or 'todas'})",
                "data": {
                    "clientes": clientes,
                    "total": len(clientes)
                },
                "database_mode": "supabase_real",
                "errors": None
            }
            
        except Exception as e:
            # Se der erro, volta para mock
            USANDO_SUPABASE = False
            return await test_clientes_universal(loja_id)  # Chama novamente em modo mock
    
    else:
        # DADOS MOCK
        return {
            "success": True,
            "message": f"⚠️ DADOS MOCK: Clientes de exemplo (loja: {loja_id or 'todas'})",
            "data": {
                "clientes": [
                    {
                        "id": "mock-1",
                        "nome": "🔧 Cliente Teste 1 (MOCK)",
                        "cpf_cnpj": "12345678901",
                        "telefone": "11999999999",
                        "email": "mock1@teste.com",
                        "endereco": "Endereço Mock 1",
                        "cidade": "São Paulo",
                        "loja_id": loja_id or "default",
                        "tipo_venda": "NORMAL"
                    },
                    {
                        "id": "mock-2",
                        "nome": "🔧 Cliente Teste 2 (MOCK)",
                        "cpf_cnpj": "98765432101",
                        "telefone": "11888888888",
                        "email": "mock2@teste.com",
                        "endereco": "Endereço Mock 2",
                        "cidade": "São Paulo",
                        "loja_id": loja_id or "default",
                        "tipo_venda": "NORMAL"
                    }
                ],
                "total": 2
            },
            "database_mode": "mock_fallback",
            "errors": None
        }

@app.get("/api/v1/test/dados-iniciais")
async def test_dados_iniciais_universal():
    global supabase, USANDO_SUPABASE
    
    if USANDO_SUPABASE:
        try:
            # Dados reais
            lojas_response = supabase.table('c_lojas').select('id, nome').execute()
            
            return {
                "success": True,
                "message": "✅ DADOS REAIS: Dados iniciais do Supabase",
                "data": {
                    "lojas": [{"id": loja["id"], "nome": loja["nome"]} for loja in lojas_response.data],
                    "equipe": [{"id": "supabase-user-1", "nome": "Usuário Real"}],
                    "configuracoes": {
                        "database": "Supabase Real",
                        "connected": True,
                        "status": STATUS_CONEXAO
                    }
                },
                "database_mode": "supabase_real",
                "errors": None
            }
            
        except Exception as e:
            USANDO_SUPABASE = False
            return await test_dados_iniciais_universal()  # Retry em modo mock
    
    else:
        # Dados mock
        return {
            "success": True,
            "message": "⚠️ DADOS MOCK: Dados de exemplo",
            "data": {
                "lojas": [
                    {"id": "317c3115-e071-40a6-9bc5-7c3227e0d82c", "nome": "🔧 Loja Teste (MOCK)"}
                ],
                "equipe": [
                    {"id": "mock-user-1", "nome": "🔧 Vendedor Mock"}
                ],
                "configuracoes": {
                    "database": "Mock Fallback",
                    "connected": False,
                    "status": STATUS_CONEXAO
                }
            },
            "database_mode": "mock_fallback",
            "errors": None
        }

# Debug endpoint
@app.get("/debug")
async def debug_info():
    return {
        "usando_supabase": USANDO_SUPABASE,
        "status_conexao": STATUS_CONEXAO,
        "supabase_disponivel": supabase is not None,
        "timestamp": time.time()
    }

# Para rodar diretamente
if __name__ == "__main__":
    import uvicorn
    print("🚀 Iniciando Fluyt Universal API...")
    print(f"📊 Status: {STATUS_CONEXAO}")
    uvicorn.run(app, host="0.0.0.0", port=8000)