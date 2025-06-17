"""
Main.py LIMPO - Apenas endpoints essenciais para teste
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import time

# App básico
app = FastAPI(title="Fluyt Test API", version="1.0.0")

# CORS simples
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health básico
@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": time.time()}

# Root básico
@app.get("/")
async def root():
    return {"message": "Fluyt Test API funcionando!", "endpoints": ["/health", "/api/v1/test/"]}

# ENDPOINTS DE TESTE - IMPLEMENTAÇÃO DIRETA
@app.get("/api/v1/test/")
async def test_root():
    return {
        "success": True,
        "message": "Endpoint de teste funcionando!",
        "endpoints": [
            "/api/v1/test/",
            "/api/v1/test/clientes",
            "/api/v1/test/dados-iniciais"
        ]
    }

@app.get("/api/v1/test/clientes")
async def test_clientes(loja_id: str = Query(None)):
    return {
        "success": True,
        "message": f"Clientes da loja {loja_id or 'todas'}",
        "data": {
            "clientes": [
                {
                    "id": "1",
                    "nome": "Cliente Teste 1",
                    "cpf_cnpj": "12345678901",
                    "telefone": "11999999999",
                    "loja_id": loja_id or "default"
                },
                {
                    "id": "2", 
                    "nome": "Cliente Teste 2",
                    "cpf_cnpj": "98765432101",
                    "telefone": "11888888888",
                    "loja_id": loja_id or "default"
                }
            ],
            "total": 2
        }
    }

@app.get("/api/v1/test/dados-iniciais")
async def test_dados_iniciais():
    return {
        "success": True,
        "message": "Dados iniciais carregados",
        "data": {
            "lojas": [
                {"id": "317c3115-e071-40a6-9bc5-7c3227e0d82c", "nome": "Loja Teste"}
            ],
            "equipe": [
                {"id": "user-1", "nome": "Vendedor Teste"}
            ]
        }
    }

# Para rodar diretamente
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)