"""
Main.py com Supabase REAL - Conecta com dados verdadeiros
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import time
import os
from supabase import create_client, Client

# App básico
app = FastAPI(title="Fluyt Supabase API", version="1.0.0")

# CORS simples
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuração Supabase
SUPABASE_URL = "https://momwbpxqnvgehotfmvde.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzAxNTIsImV4cCI6MjA2MzM0NjE1Mn0.n90ZweBT-o1ugerZJDZl8gx65WGe1eUrhph6VuSdSCs"

# Cliente Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Health básico
@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": time.time(), "database": "supabase_connected"}

# Root básico
@app.get("/")
async def root():
    return {"message": "Fluyt Supabase API funcionando!", "endpoints": ["/health", "/api/v1/test/"]}

# ENDPOINTS DE TESTE - COM SUPABASE REAL
@app.get("/api/v1/test/")
async def test_root():
    return {
        "success": True,
        "message": "Endpoint de teste com Supabase REAL funcionando!",
        "database": "Connected to Supabase",
        "endpoints": [
            "/api/v1/test/",
            "/api/v1/test/clientes",
            "/api/v1/test/dados-iniciais"
        ]
    }

@app.get("/api/v1/test/clientes")
async def test_clientes_real(loja_id: str = Query(None)):
    try:
        # Buscar clientes reais do Supabase
        query = supabase.table('c_clientes').select('*')
        
        # Filtrar por loja se especificado
        if loja_id:
            query = query.eq('loja_id', loja_id)
        
        # Executar query
        response = query.execute()
        
        # Formatar resposta
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
            "message": f"Clientes REAIS da loja {loja_id or 'todas'} carregados do Supabase",
            "data": {
                "clientes": clientes,
                "total": len(clientes)
            },
            "errors": None
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": "Erro ao carregar clientes do Supabase",
            "data": {"clientes": [], "total": 0},
            "errors": [str(e)]
        }

@app.get("/api/v1/test/dados-iniciais")
async def test_dados_iniciais_real():
    try:
        # Buscar lojas reais
        lojas_response = supabase.table('c_lojas').select('id, nome').execute()
        
        # Buscar equipe real (se existir)
        equipe_response = supabase.table('c_equipe').select('id, nome').limit(10).execute()
        
        return {
            "success": True,
            "message": "Dados iniciais REAIS carregados do Supabase",
            "data": {
                "lojas": [{"id": loja["id"], "nome": loja["nome"]} for loja in lojas_response.data],
                "equipe": [{"id": membro["id"], "nome": membro["nome"]} for membro in equipe_response.data] if equipe_response.data else [],
                "configuracoes": {
                    "database": "Supabase Real",
                    "url": SUPABASE_URL,
                    "connected": True
                }
            },
            "errors": None
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": "Erro ao carregar dados iniciais do Supabase",
            "data": {
                "lojas": [{"id": "317c3115-e071-40a6-9bc5-7c3227e0d82c", "nome": "Loja Padrão"}],
                "equipe": [],
                "configuracoes": {"database": "Fallback", "error": str(e)}
            },
            "errors": [str(e)]
        }

# Para rodar diretamente
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)