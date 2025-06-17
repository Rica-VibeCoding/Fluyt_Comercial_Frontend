"""
VERSÃO GARANTIDA FUNCIONANDO - MAIN.PY COM FIX DO DUPLO PREFIX
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import logging
import time
import uuid

# Core imports
from core.config import get_settings
from core.auth import AuthMiddleware
from core.exceptions import register_exception_handlers

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuração da aplicação FastAPI
settings = get_settings()

app = FastAPI(
    title="Fluyt Comercial API",
    description="API REST completa para gerenciamento comercial",
    version=settings.api_version,
    openapi_url=f"/api/{settings.api_version}/openapi.json" if not settings.is_production else None,
    docs_url=f"/api/{settings.api_version}/docs" if not settings.is_production else None,
    redoc_url=f"/api/{settings.api_version}/redoc" if not settings.is_production else None,
)

# ===== MIDDLEWARES =====

# 1. Request ID
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# 2. Logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.info(f"🔵 REQUEST: {request.method} {request.url.path}")
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"🟢 RESPONSE: {response.status_code} - {process_time:.3f}s")
    response.headers["X-Process-Time"] = str(process_time)
    return response

# 3. Autenticação
app.add_middleware(AuthMiddleware)

# 4. GZIP
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 5. CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Process-Time"]
)

# ===== HANDLERS DE EXCEÇÃO =====
register_exception_handlers(app)

# ===== ENDPOINTS BÁSICOS =====

@app.get("/health", tags=["Sistema"])
async def health_check():
    return {
        "status": "healthy",
        "service": "Fluyt Comercial API - WORKING VERSION",
        "version": settings.api_version,
        "environment": settings.environment,
        "timestamp": time.time(),
        "total_routes": len(app.routes)
    }

@app.get("/", tags=["Sistema"])
async def root():
    return {
        "message": "Fluyt Comercial API - WORKING VERSION",
        "version": settings.api_version,
        "docs": f"/api/{settings.api_version}/docs" if not settings.is_production else None,
        "health": "/health"
    }

# ===== REGISTRO DE ROUTERS =====

prefix = f"/api/{settings.api_version}"

try:
    # ⚠️ ENDPOINTS DE TESTE - CORREÇÃO DO DUPLO PREFIX
    if settings.is_development:
        logger.info("🔧 Carregando endpoints de teste...")
        
        from modules.test_endpoints.routes import router as test_router
        
        # FIX: Usar prefix correto /api/v1/test (sem duplo prefix)
        app.include_router(test_router, prefix=f"{prefix}/test", tags=["🧪 TESTE"])
        
        logger.warning("✅ ENDPOINTS DE TESTE CARREGADOS COM SUCESSO!")
        logger.info(f"📊 Total de rotas após registro: {len(app.routes)}")
        
        # Log das rotas de teste registradas
        for route in app.routes:
            if hasattr(route, 'path') and '/test' in route.path:
                logger.info(f"📍 Rota registrada: {route.path}")

except Exception as e:
    logger.error(f"❌ Erro ao carregar endpoints de teste: {e}")
    import traceback
    traceback.print_exc()

# ===== CONFIGURAÇÃO FINAL =====
if __name__ == "__main__":
    import uvicorn
    
    logger.info("🚀 Iniciando Fluyt Comercial API - WORKING VERSION")
    
    uvicorn.run(
        "main_working:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Desabilitar reload para evitar problemas
        log_level="info"
    )