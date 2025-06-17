"""
Main.py corrigido - Com endpoints de teste garantidos
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import time

# Core imports
from core.config import get_settings
from core.exceptions import register_exception_handlers

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Iniciando Fluyt Comercial API...")
    yield
    logger.info("🛑 Finalizando Fluyt Comercial API...")

# App
settings = get_settings()
app = FastAPI(
    title="Fluyt Comercial API",
    version=settings.api_version,
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Fluyt Comercial API",
        "version": settings.api_version,
        "environment": settings.environment,
        "timestamp": time.time()
    }

# Root
@app.get("/")
async def root():
    return {
        "message": "Fluyt Comercial API",
        "version": settings.api_version,
        "endpoints": {
            "health": "/health",
            "test": "/api/v1/test/",
            "docs": "/docs"
        }
    }

# ===== ENDPOINTS DE TESTE DIRETOS =====
# Implementação direta sem importar módulo externo

@app.get("/api/v1/test/")
async def test_root():
    return {
        "aviso": "⚠️ ENDPOINTS TEMPORÁRIOS SEM AUTENTICAÇÃO",
        "objetivo": "Testar funcionalidades completas do sistema",
        "remover_apos": "Validação completa",
        "endpoints_disponiveis": [
            "GET /api/v1/test/ - Este endpoint",
            "GET /api/v1/test/clientes - Listar clientes por loja",
            "GET /api/v1/test/dados-iniciais - Buscar dados iniciais"
        ]
    }

@app.get("/api/v1/test/clientes")
async def test_listar_clientes(loja_id: str = None):
    # Mock de clientes para teste
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
        },
        "errors": None
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
            ],
            "configuracoes": {
                "moeda": "BRL",
                "timezone": "America/Sao_Paulo"
            }
        },
        "errors": None
    }

# Debug endpoint
@app.get("/debug-routes")
async def debug_routes():
    routes_info = []
    for route in app.routes:
        if hasattr(route, 'path'):
            routes_info.append({
                "path": route.path,
                "methods": list(route.methods) if hasattr(route, 'methods') else ["GET"],
                "name": getattr(route, 'name', 'unknown')
            })
    return {
        "total_routes": len(routes_info),
        "routes": sorted(routes_info, key=lambda x: x['path'])
    }

# Handlers de exceção
register_exception_handlers(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main_fixed:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
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

# 1. Request ID para rastreamento
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# 2. Logging de requisições
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.info(f"🔵 REQUEST: {request.method} {request.url.path}")
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"🟢 RESPONSE: {response.status_code} - {process_time:.3f}s")
    response.headers["X-Process-Time"] = str(process_time)
    return response

# 3. Middleware de autenticação
app.add_middleware(AuthMiddleware)

# 4. Compressão GZIP
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
        "service": "Fluyt Comercial API - FIXED VERSION",
        "version": settings.api_version,
        "environment": settings.environment,
        "timestamp": time.time(),
        "debug_routes": len(app.routes)
    }

@app.get("/", tags=["Sistema"])
async def root():
    return {
        "message": "Fluyt Comercial API - FIXED VERSION",
        "version": settings.api_version,
        "docs": f"/api/{settings.api_version}/docs" if not settings.is_production else None,
        "health": "/health"
    }

# ===== ENDPOINTS DE TESTE - REGISTRADOS DIRETAMENTE =====

if settings.is_development:
    logger.info("🔧 REGISTRANDO ENDPOINTS DE TESTE DIRETAMENTE...")
    
    # Import direto dos endpoints de teste
    try:
        from modules.test_endpoints.routes import router as test_router
        
        # Registrar router sem prefix para testar
        app.include_router(test_router, prefix="", tags=["TESTE_DIRETO"])
        
        logger.warning(f"✅ ENDPOINTS DE TESTE REGISTRADOS! Total rotas: {len(app.routes)}")
        
        # Listar todas as rotas para debug
        for route in app.routes:
            if hasattr(route, 'path') and '/test' in route.path:
                logger.info(f"📍 Rota teste registrada: {route.path}")
                
    except Exception as e:
        logger.error(f"❌ ERRO AO REGISTRAR ENDPOINTS DE TESTE: {e}")
        import traceback
        traceback.print_exc()

# ===== CONFIGURAÇÃO FINAL =====
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main_fixed:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )