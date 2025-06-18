"""
API DE TESTE STANDALONE - PORTA 8001
Funciona independente do main.py principal
C2 pode usar imediatamente para continuar desenvolvimento
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criar app standalone
app = FastAPI(
    title="Fluyt Test API - Standalone",
    description="API de teste para desenvolvimento - funciona independente",
    version="1.0.0"
)

# CORS para frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Fluyt Test API Standalone - FUNCIONANDO!",
        "version": "1.0.0",
        "endpoints_test": "/test/*",
        "porta": 8001
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy", 
        "service": "Fluyt Test API Standalone",
        "rotas": len(app.routes),
        "porta": 8001
    }

# Importar endpoints de teste
logger.info("🔧 Carregando endpoints de teste...")

try:
    from modules.test_endpoints.routes import router as test_router
    
    # Registrar router de teste
    app.include_router(test_router, prefix="", tags=["Teste"])
    
    logger.info(f"✅ Endpoints de teste carregados! Total rotas: {len(app.routes)}")
    
    # Log das rotas
    for route in app.routes:
        if hasattr(route, 'path') and '/test' in route.path:
            logger.info(f"📍 Endpoint disponível: {route.path}")
            
except Exception as e:
    logger.error(f"❌ Erro ao carregar endpoints: {e}")
    
    # Criar endpoints mock básicos se falhar
    @app.get("/test/clientes")
    async def mock_clientes(loja_id: str):
        return {
            "success": True,
            "message": "Mock de clientes funcionando",
            "data": {
                "clientes": [
                    {
                        "id": "mock-1",
                        "nome": "Cliente Mock 1",
                        "email": "mock1@teste.com",
                        "telefone": "(11) 99999-9999"
                    }
                ]
            }
        }
    
    @app.post("/test/cliente")
    async def mock_criar_cliente(cliente_data: dict):
        return {
            "success": True,
            "message": "Cliente mock criado",
            "data": {
                "cliente": {
                    "id": "mock-novo",
                    "nome": cliente_data.get("nome", "Novo Cliente"),
                    "created_at": "2025-06-17T03:30:00Z"
                }
            }
        }
    
    logger.info("📝 Endpoints mock criados como fallback")

if __name__ == "__main__":
    import uvicorn
    
    logger.info("🚀 Iniciando API de Teste Standalone na porta 8001...")
    logger.info("🔗 Frontend deve usar: http://172.19.112.1:8001")
    
    uvicorn.run(
        "api_test_standalone:app",
        host="0.0.0.0", 
        port=8001,
        reload=False,
        log_level="info"
    )