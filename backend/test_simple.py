"""
TESTE ULTRA SIMPLES - APENAS ENDPOINTS DE TESTE
"""

from fastapi import FastAPI
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criar app mínima
app = FastAPI(title="TESTE SIMPLES")

@app.get("/")
async def root():
    return {"message": "TESTE SIMPLES FUNCIONANDO", "timestamp": "2025-06-17"}

@app.get("/health")
async def health():
    return {"status": "TESTE_SIMPLES_OK", "rotas": len(app.routes)}

# Importar e registrar endpoints de teste DIRETAMENTE
logger.info("🔧 Importando endpoints de teste...")

try:
    # Import com path absoluto
    import sys
    import os
    sys.path.append(os.path.dirname(__file__))
    
    from modules.test_endpoints.routes import router as test_router
    
    # Registrar sem prefix
    app.include_router(test_router, prefix="", tags=["TESTE_SIMPLES"])
    
    logger.info(f"✅ Endpoints registrados! Total: {len(app.routes)}")
    
    # Listar rotas
    for route in app.routes:
        if hasattr(route, 'path'):
            logger.info(f"📍 Rota: {route.path}")
    
except Exception as e:
    logger.error(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Iniciando servidor na porta 8000...")
    uvicorn.run("test_simple:app", host="0.0.0.0", port=8000, reload=False)