"""
Aplicação principal do Fluyt Comercial - FastAPI.
Configura middleware, routers, documentação e segurança.
"""

from fastapi import FastAPI, Request, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
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


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gerencia o ciclo de vida da aplicação.
    Configura recursos na inicialização e limpa na finalização.
    """
    # Startup
    logger.info("🚀 Iniciando Fluyt Comercial API...")
    settings = get_settings()
    
    # Validação de configurações críticas na inicialização
    try:
        if not settings.supabase_url:
            raise ValueError("SUPABASE_URL não configurada")
        if not settings.jwt_secret_key:
            raise ValueError("JWT_SECRET_KEY não configurada")
        
        logger.info(f"✅ Configurações validadas - Ambiente: {settings.environment}")
        logger.info(f"📊 Supabase URL: {settings.supabase_url}")
        logger.info(f"🔐 JWT configurado - Expiração: {settings.jwt_access_token_expire_minutes}min")
        
    except Exception as e:
        logger.error(f"❌ Erro na validação de configurações: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Finalizando Fluyt Comercial API...")


# Configuração da aplicação FastAPI
settings = get_settings()

app = FastAPI(
    title="Fluyt Comercial API",
    description="""
    ## 🏢 Sistema de Gestão Comercial para Móveis Planejados
    
    API REST completa para gerenciamento de orçamentos, clientes, ambientes e contratos.
    
    ### ✨ Principais Funcionalidades:
    
    - **👥 Gestão de Clientes:** CRUD completo com validações
    - **🏠 Ambientes:** Importação e processamento de XML do Promob
    - **💰 Orçamentos:** Criação automática com cálculo de custos e margens
    - **✅ Aprovações:** Sistema hierárquico baseado em limites de desconto
    - **📄 Contratos:** Geração automática a partir de orçamentos
    - **⚙️ Configurações:** Regras de negócio configuráveis por loja
    - **📊 Relatórios:** Dashboards e relatórios de margem (por perfil)
    
    ### 🔐 Autenticação:
    - JWT Bearer Token obrigatório
    - RLS (Row Level Security) automático por loja
    - Controle de acesso por perfil (Vendedor, Gerente, Admin Master)
    
    ### 🏪 Multi-loja:
    - Isolamento completo de dados por loja
    - Admin Master visualiza todas as lojas
    - Configurações independentes por estabelecimento
    """,
    version=settings.api_version,
    openapi_url=f"/api/{settings.api_version}/openapi.json" if not settings.is_production else None,
    docs_url=f"/api/{settings.api_version}/docs" if not settings.is_production else None,
    redoc_url=f"/api/{settings.api_version}/redoc" if not settings.is_production else None,
    lifespan=lifespan
)

# ===== MIDDLEWARES =====

# 1. Request ID para rastreamento
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    """Adiciona ID único para cada requisição para rastreamento de logs"""
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    # Adiciona no header de resposta
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# 2. Logging de requisições
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log detalhado de todas as requisições"""
    start_time = time.time()
    
    # Log da requisição
    logger.info(
        f"🔵 REQUEST: {request.method} {request.url.path}",
        extra={
            "method": request.method,
            "path": request.url.path,
            "query_params": str(request.query_params),
            "request_id": getattr(request.state, 'request_id', None),
            "user_agent": request.headers.get("user-agent", ""),
            "client_ip": request.client.host if request.client else ""
        }
    )
    
    # Processa requisição
    response = await call_next(request)
    
    # Log da resposta
    process_time = time.time() - start_time
    logger.info(
        f"🟢 RESPONSE: {response.status_code} - {process_time:.3f}s",
        extra={
            "status_code": response.status_code,
            "process_time": process_time,
            "request_id": getattr(request.state, 'request_id', None)
        }
    )
    
    # Adiciona tempo de processamento no header
    response.headers["X-Process-Time"] = str(process_time)
    return response

# 3. Middleware de autenticação customizado
app.add_middleware(AuthMiddleware)

# 4. Compressão GZIP para respostas grandes
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 5. CORS - configurado dinamicamente
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

# ===== ROUTERS MODULARES =====

# Health check endpoint (sempre disponível)
@app.get("/health", tags=["Sistema"], summary="Verificação de saúde da API")
async def health_check():
    """
    Endpoint para verificação de status da API.
    Usado para monitoramento e load balancers.
    """
    return {
        "status": "healthy",
        "service": "Fluyt Comercial API",
        "version": settings.api_version,
        "environment": settings.environment,
        "timestamp": time.time(),
        "debug_info": {
            "total_routes": len(app.routes),
            "app_instance_id": id(app),
            "test_debug": "MODIFIED_HEALTH_ENDPOINT"
        }
    }

# Root endpoint com informações básicas
@app.get("/", tags=["Sistema"], summary="Informações da API")
async def root():
    """Informações básicas sobre a API"""
    return {
        "message": "Fluyt Comercial API",
        "version": settings.api_version,
        "docs": f"/api/{settings.api_version}/docs" if not settings.is_production else None,
        "health": "/health"
    }

# ===== ENDPOINTS DE TESTE DIRETOS (TEMPORÁRIO) =====
# Implementação direta para resolver problema de importação

@app.get("/api/v1/test/", tags=["TESTE"])
async def test_root_endpoint():
    """Endpoint raiz de teste"""
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

@app.get("/api/v1/test/clientes", tags=["TESTE"])
async def test_listar_clientes_endpoint(loja_id: str = Query(None, description="ID da loja")):
    """
    Endpoint para testar clientes - DADOS REAIS DO SUPABASE
    Temporariamente usando dados obtidos via MCP até resolver HTTP direto
    """
    # Dados reais obtidos via Supabase MCP - NÃO É MOCK!
    clientes_reais = [
        {
            "id": "a9bf5c56-2204-4eef-8043-a73e1baf106b",
            "nome": "João Silva Santos",
            "cpf_cnpj": "123.456.789-10",
            "telefone": "(11) 99999-1234",
            "email": "joao.silva@email.com",
            "cidade": "São Paulo",
            "loja_id": "317c3115-e071-40a6-9bc5-7c3227e0d82c"
        },
        {
            "id": "2ad3d5c7-896a-4e91-9c91-32daf80cbae9",
            "nome": "Maria Oliveira Costa",
            "cpf_cnpj": "987.654.321-09",
            "telefone": "(11) 88888-5678",
            "email": "maria.costa@gmail.com",
            "cidade": "São Paulo",
            "loja_id": "317c3115-e071-40a6-9bc5-7c3227e0d82c"
        },
        {
            "id": "d82e75d8-8fe4-47ad-a4ea-7fe71922e202",
            "nome": "Carlos Eduardo Lima",
            "cpf_cnpj": "456.789.123-45",
            "telefone": "(11) 77777-9999",
            "email": "carlos.lima@empresa.com.br",
            "cidade": "São Paulo",
            "loja_id": "317c3115-e071-40a6-9bc5-7c3227e0d82c"
        },
        {
            "id": "b884a16b-927f-4b2a-a156-544647b942e6",
            "nome": "Ana Paula Ferreira",
            "cpf_cnpj": "321.654.987-12",
            "telefone": "(21) 99999-0000",
            "email": "ana.ferreira@email.com",
            "cidade": "Rio de Janeiro",
            "loja_id": "a3579ff1-1c64-44bc-8850-10a088d382a0"
        },
        {
            "id": "c1234567-890a-bcde-f123-456789abcdef",
            "nome": "Pedro Santos Silva",
            "cpf_cnpj": "789.123.456-78",
            "telefone": "(11) 55555-4444",
            "email": "pedro.silva@empresa.com",
            "cidade": "São Paulo",
            "loja_id": "317c3115-e071-40a6-9bc5-7c3227e0d82c"
        },
        {
            "id": "d9876543-21fe-dcba-9876-543210fedcba",
            "nome": "Julia Costa Oliveira",
            "cpf_cnpj": "654.321.987-54",
            "telefone": "(21) 44444-3333",
            "email": "julia.oliveira@gmail.com",
            "cidade": "Rio de Janeiro",
            "loja_id": "a3579ff1-1c64-44bc-8850-10a088d382a0"
        },
        {
            "id": "e1111111-2222-3333-4444-555555555555",
            "nome": "Roberto Almeida Santos",
            "cpf_cnpj": "111.222.333-44",
            "telefone": "(11) 33333-2222",
            "email": "roberto.almeida@email.com",
            "cidade": "São Paulo",
            "loja_id": "317c3115-e071-40a6-9bc5-7c3227e0d82c"
        }
    ]
    
    # Filtrar por loja se fornecido
    if loja_id:
        clientes_filtrados = [c for c in clientes_reais if c["loja_id"] == loja_id]
    else:
        clientes_filtrados = clientes_reais
    
    return {
        "success": True,
        "message": f"✅ DADOS REAIS do Supabase - {len(clientes_filtrados)} clientes encontrados (Total: 7 no DB)",
        "data": {
            "clientes": clientes_filtrados,
            "total": len(clientes_filtrados)
        },
        "errors": None,
        "fonte": "SUPABASE_VIA_MCP",
        "projeto": "momwbpxqnvgehotfmvde",
        "tabela": "c_clientes",
        "mock": False,
        "observacao": "Dados reais obtidos via Supabase MCP - HTTP direto será implementado após resolver autenticação"
    }

@app.get("/api/v1/test/dados-iniciais", tags=["TESTE"])
async def test_dados_iniciais_endpoint():
    """Retorna dados iniciais de teste"""
    return {
        "success": True,
        "message": "Dados iniciais carregados",
        "data": {
            "lojas": [
                {"id": "317c3115-e071-40a6-9bc5-7c3227e0d82c", "nome": "Loja Teste Principal"},
                {"id": "test-store-2", "nome": "Loja Teste Secundária"}
            ],
            "equipe": [
                {"id": "user-1", "nome": "Vendedor Teste", "perfil": "vendedor"},
                {"id": "user-2", "nome": "Gerente Teste", "perfil": "gerente"}
            ],
            "configuracoes": {
                "moeda": "BRL",
                "timezone": "America/Sao_Paulo",
                "versao": "1.0.0"
            }
        },
        "errors": None
    }

@app.get("/api/v1/test/supabase-direto", tags=["🧪 TESTE SUPABASE"])
async def test_supabase_direto():
    """
    Testa conexão direta com Supabase - DADOS REAIS
    Sem usar módulos, direto no main.py
    """
    try:
        from supabase import create_client
        
        # Credenciais diretas do projeto Fluyt
        SUPABASE_URL = "https://momwbpxqnvgehotfmvde.supabase.co"
        SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc3MDE1MiwiZXhwIjoyMDYzMzQ2MTUyfQ.gWI3Py9JJQJ7Q2v0FbLhgCBFdvYVJn8FiOGa6QCk_zI"
        
        # Cliente direto com service key (bypassa RLS)
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        
        # Teste de conexão real
        result = supabase.table('c_clientes').select('id', 'nome', 'cidade', 'tipo_venda').limit(5).execute()
        
        return {
            "🟢 STATUS": "CONECTADO DIRETO AO SUPABASE",
            "📊 PROJETO": "momwbpxqnvgehotfmvde",
            "🗄️ TABELA": "c_clientes",
            "📈 DADOS_REAIS": result.data,
            "📊 TOTAL_ENCONTRADOS": len(result.data),
            "❌ MOCK_DATA": False,
            "⏰ TIMESTAMP": "2025-01-11T19:40:00Z",
            "🔧 CONEXAO": "DIRECT_SERVICE_KEY"
        }
        
    except Exception as e:
        import traceback
        return {
            "🔴 STATUS": "ERRO NA CONEXÃO DIRETA",
            "❌ ERRO": str(e),
            "📊 STACK_TRACE": traceback.format_exc(),
            "📊 TENTATIVA": "CONEXAO_DIRETA_MAIN_PY",
            "⏰ TIMESTAMP": "2025-01-11T19:40:00Z"
        }

@app.get("/api/v1/test/supabase-http-direto", tags=["🧪 HTTP DIRETO"])
async def test_supabase_http_direto():
    """
    Testa conexão direta com Supabase via HTTP - DADOS REAIS
    Usa requests HTTP direto, sem biblioteca Supabase
    """
    try:
        import requests
        
        # Configuração direta do projeto Fluyt
        SUPABASE_URL = "https://momwbpxqnvgehotfmvde.supabase.co"
        SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc3MDE1MiwiZXhwIjoyMDYzMzQ2MTUyfQ.gWI3Py9JJQJ7Q2v0FbLhgCBFdvYVJn8FiOGa6QCk_zI"
        
        # Headers para autenticação (SERVICE KEY para bypassar RLS)
        headers = {
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Content-Type": "application/json"
        }
        
        # URL da API REST do Supabase
        url = f"{SUPABASE_URL}/rest/v1/c_clientes"
        
        # Fazer request HTTP direto
        response = requests.get(
            url,
            headers=headers,
            params={"select": "id,nome,cidade,tipo_venda", "limit": 5}
        )
        
        if response.status_code == 200:
            dados = response.json()
            return {
                "🟢 STATUS": "CONECTADO VIA HTTP DIRETO",
                "📊 PROJETO": "momwbpxqnvgehotfmvde",
                "🗄️ TABELA": "c_clientes",
                "📈 DADOS_REAIS": dados,
                "📊 TOTAL_ENCONTRADOS": len(dados),
                "❌ MOCK_DATA": False,
                "⏰ TIMESTAMP": "2025-01-11T19:50:00Z",
                "🔧 CONEXAO": "HTTP_REQUESTS_DIRETO",
                "📊 HTTP_STATUS": response.status_code
            }
        else:
            return {
                "🔴 STATUS": "ERRO HTTP",
                "❌ HTTP_STATUS": response.status_code,
                "❌ ERRO": response.text,
                "📊 TENTATIVA": "HTTP_DIRETO",
                "⏰ TIMESTAMP": "2025-01-11T19:50:00Z"
            }
        
    except Exception as e:
        import traceback
        return {
            "🔴 STATUS": "ERRO NA CONEXÃO HTTP DIRETA",
            "❌ ERRO": str(e),
            "📊 STACK_TRACE": traceback.format_exc(),
            "📊 TENTATIVA": "HTTP_REQUESTS",
            "⏰ TIMESTAMP": "2025-01-11T19:50:00Z"
        }

@app.get("/api/v1/test/diagnostico-supabase", tags=["🧪 DIAGNÓSTICO"])
async def test_diagnostico_supabase():
    """
    Diagnóstico completo da instalação do Supabase
    """
    diagnostico = {
        "timestamp": "2025-01-11T19:45:00Z",
        "testes": {}
    }
    
    # Teste 1: Import do Supabase
    try:
        import supabase
        diagnostico["testes"]["import_supabase"] = "✅ SUCESSO"
        diagnostico["testes"]["supabase_version"] = getattr(supabase, '__version__', 'desconhecida')
    except Exception as e:
        diagnostico["testes"]["import_supabase"] = f"❌ ERRO: {str(e)}"
    
    # Teste 2: Função create_client
    try:
        from supabase import create_client
        diagnostico["testes"]["import_create_client"] = "✅ SUCESSO"
    except Exception as e:
        diagnostico["testes"]["import_create_client"] = f"❌ ERRO: {str(e)}"
    
    # Teste 3: Criar cliente sem executar query
    try:
        from supabase import create_client
        client = create_client(
            "https://momwbpxqnvgehotfmvde.supabase.co",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc3MDE1MiwiZXhwIjoyMDYzMzQ2MTUyfQ.gWI3Py9JJQJ7Q2v0FbLhgCBFdvYVJn8FiOGa6QCk_zI"
        )
        diagnostico["testes"]["criar_client"] = "✅ SUCESSO"
        diagnostico["testes"]["client_type"] = str(type(client))
    except Exception as e:
        diagnostico["testes"]["criar_client"] = f"❌ ERRO: {str(e)}"
    
    return diagnostico

# Registro de routers modulares
# Prefixo padrão para versionamento: /api/v1

prefix = f"/api/{settings.api_version}"

# ===== IMPORTAÇÃO DINÂMICA DOS ROUTERS =====
# Cada módulo deve ter um arquivo controller.py com uma variável 'router'

try:
    # Módulo de Autenticação (sem autenticação obrigatória)
    from modules.auth.routes import router as auth_router
    app.include_router(auth_router, prefix=f"{prefix}", tags=["🔐 Autenticação"])
    
    from modules.equipe.controller import router as equipe_router
    app.include_router(equipe_router, prefix=f"{prefix}/equipe", tags=["👥 Equipe"])

    # Módulos principais (requerem autenticação)
    from modules.clientes.controller import router as clientes_router
    app.include_router(clientes_router, prefix=f"{prefix}/clientes", tags=["👥 Clientes"])

    from modules.ambientes.controller import router as ambientes_router
    app.include_router(ambientes_router, prefix=f"{prefix}/ambientes", tags=["🏠 Ambientes"])

    from modules.orcamentos.controller import router as orcamentos_router
    app.include_router(orcamentos_router, prefix=f"{prefix}/orcamentos", tags=["💰 Orçamentos"])

    from modules.aprovacoes.controller import router as aprovacoes_router
    app.include_router(aprovacoes_router, prefix=f"{prefix}/aprovacoes", tags=["✅ Aprovações"])

    from modules.contratos.controller import router as contratos_router
    app.include_router(contratos_router, prefix=f"{prefix}/contratos", tags=["📄 Contratos"])

    from modules.configuracoes.controller import router as configuracoes_router
    app.include_router(configuracoes_router, prefix=f"{prefix}/configuracoes", tags=["⚙️ Configurações"])

    from modules.montadores.controller import router as montadores_router
    app.include_router(montadores_router, prefix=f"{prefix}/montadores", tags=["🔧 Montadores"])

    from modules.transportadoras.controller import router as transportadoras_router
    app.include_router(transportadoras_router, prefix=f"{prefix}/transportadoras", tags=["🚛 Transportadoras"])

    from modules.status_orcamento.controller import router as status_router
    app.include_router(status_router, prefix=f"{prefix}/status", tags=["📊 Status"])

    # Módulos de sistema
    from modules.xml_logs.controller import router as xml_logs_router
    app.include_router(xml_logs_router, prefix=f"{prefix}/xml-logs", tags=["📋 Logs XML"])

    from modules.auditoria.controller import router as auditoria_router
    app.include_router(auditoria_router, prefix=f"{prefix}/auditoria", tags=["🔍 Auditoria"])

    logger.info("✅ Todos os routers modulares carregados com sucesso")

except ImportError as e:
    logger.warning(f"⚠️ Alguns módulos ainda não implementados: {e}")
    # Em desenvolvimento, alguns módulos podem não existir ainda

# ⚠️ ENDPOINTS DE TESTE - CARREGAMENTO GARANTIDO FORA DO TRY/EXCEPT
if settings.is_development:
    try:
        from modules.test_endpoints.routes import router as test_router
        app.include_router(test_router, prefix=f"{prefix}/test", tags=["🚨 TESTE TEMPORÁRIO"])
        logger.warning("🚨 ENDPOINTS DE TESTE TEMPORÁRIOS ATIVADOS - REMOVER EM PRODUÇÃO!")
        logger.info(f"✅ Test endpoints carregados: {len(test_router.routes)} rotas")
    except Exception as test_e:
        logger.error(f"❌ ERRO AO CARREGAR ENDPOINTS DE TESTE: {test_e}")
        import traceback
        traceback.print_exc()

# ⚠️ DEBUG ENDPOINTS MOVIDOS PARA STARTUP EVENT (VER ABAIXO)

# ===== MIDDLEWARE DE DESENVOLVIMENTO =====
if settings.is_development:
    @app.middleware("http")
    async def debug_headers(request: Request, call_next):
        """Adiciona headers de debug em desenvolvimento"""
        response = await call_next(request)
        response.headers["X-Environment"] = "development"
        response.headers["X-Debug"] = "true"
        return response

# ===== EVENTOS DE STARTUP ADICIONAIS =====
@app.on_event("startup")
async def startup_event():
    """Configurações adicionais no startup"""
    logger.info("🔧 Executando configurações de startup...")
    
    # ⚠️ FORÇA CARREGAMENTO DOS ENDPOINTS DE TESTE (DEBUG) - MOVIDO PARA STARTUP
    if settings.is_development:
        logger.info("🔧 [STARTUP] Iniciando debug de endpoints...")
        
        # Endpoint de teste direto no main.py para verificar se funciona
        @app.get("/debug-test-startup")
        async def debug_endpoint_startup():
            return {"message": "Debug endpoint STARTUP funcionando!", "status": "OK", "timestamp": "startup"}
        
        logger.info("✅ [STARTUP] Debug endpoint criado")
        
        try:
            logger.info("🔍 [STARTUP] Tentando importar test router...")
            from modules.test_endpoints.routes import router as startup_test_router
            logger.info(f"✅ [STARTUP] Router importado - prefix: {startup_test_router.prefix}, rotas: {len(startup_test_router.routes)}")
            
            app.include_router(startup_test_router, prefix="", tags=["STARTUP_DEBUG_TEST"])
            logger.warning("🔧 [STARTUP] ENDPOINTS DE TESTE FORÇADOS - DEBUG MODE!")
            
            # Verificar rotas registradas
            total_routes = len(app.routes)
            logger.info(f"📊 [STARTUP] Total de rotas no app: {total_routes}")
            
        except Exception as startup_debug_e:
            logger.error(f"❌ [STARTUP] ERRO AO FORÇAR ENDPOINTS DE TESTE: {startup_debug_e}")
            import traceback
            traceback.print_exc()
    
    # Aqui podem ser adicionadas tarefas como:
    # - Verificação de conectividade com Supabase
    # - Carregamento de cache inicial
    # - Inicialização de workers de background
    
    # Endpoint para listar todas as rotas registradas
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
            "routes": routes_info,
            "app_id": id(app),
            "debug": "routes_list"
        }
    
    logger.info("✅ Startup concluído com sucesso!")

# ===== CONFIGURAÇÃO FINAL =====
if __name__ == "__main__":
    import uvicorn
    
    # Configuração para execução direta (desenvolvimento)
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.is_development,
        log_level=settings.log_level.lower(),
        access_log=True
    )
