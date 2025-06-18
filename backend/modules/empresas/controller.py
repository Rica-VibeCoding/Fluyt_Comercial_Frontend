"""
Controller (rotas) para o módulo de Empresas e Lojas.
Define endpoints REST para operações de empresas e lojas.
"""

from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List, Optional, Dict, Any
from core.auth import get_current_user, require_vendedor_ou_superior
from core.database import get_database, get_service_database
from supabase import Client
import uuid

from .schemas import (
    EmpresaCreate, EmpresaUpdate, EmpresaResponse, EmpresaComLojas,
    LojaCreate, LojaUpdate, LojaResponse, LojaListItem,
    EmpresaFilters, LojaFilters
)
from .services import EmpresaService

# Router para o módulo de empresas
router = APIRouter()


@router.get("/teste-conexao-real",
    summary="🔗 Testar conexão com dados reais do Supabase",
    description="Endpoint sem autenticação para verificar se está conectado aos dados reais",
    tags=["🧪 TESTE"]
)
async def testar_conexao_dados_reais_sem_auth(
    db: Client = Depends(get_service_database)
):
    """
    Testa a conexão com dados reais do Supabase SEM AUTENTICAÇÃO.
    Usa service_database que bypassa RLS.
    
    **Retorna:** Estatísticas básicas das empresas e lojas reais.
    """
    try:
        # Buscar estatísticas reais das empresas
        result_empresas = db.table('cad_empresas').select('*', count='exact').execute()
        
        # Buscar estatísticas reais das lojas
        result_lojas = db.table('c_lojas').select('*', count='exact').execute()
        
        # Empresas recentes
        result_empresas_recentes = db.table('cad_empresas').select('id', 'nome', 'cnpj', 'created_at').order('created_at', desc=True).limit(3).execute()
        
        # Lojas recentes com nome da empresa
        result_lojas_recentes = db.table('c_lojas').select('id', 'nome', 'codigo', 'cad_empresas(nome)', 'created_at').order('created_at', desc=True).limit(3).execute()
        
        return {
            "🟢 STATUS": "CONECTADO AOS DADOS REAIS DO SUPABASE",
            "📊 PROJETO": "momwbpxqnvgehotfmvde",
            "🗄️ TABELAS": ["cad_empresas", "c_lojas"],
            "📈 ESTATISTICAS": {
                "total_empresas": result_empresas.count if result_empresas.count else len(result_empresas.data),
                "total_lojas": result_lojas.count if result_lojas.count else len(result_lojas.data),
                "empresas_recentes": result_empresas_recentes.data if result_empresas_recentes.data else [],
                "lojas_recentes": result_lojas_recentes.data if result_lojas_recentes.data else []
            },
            "❌ MOCK_DATA": False,
            "⏰ TIMESTAMP": "2025-01-17T20:45:00Z",
            "🔧 DATABASE": "SERVICE_CLIENT_BYPASS_RLS"
        }
        
    except Exception as e:
        return {
            "🔴 STATUS": "ERRO NA CONEXÃO COM SUPABASE",
            "❌ ERRO": str(e),
            "📊 PROJETO": "momwbpxqnvgehotfmvde",
            "🗄️ TABELAS": ["cad_empresas", "c_lojas"],
            "⏰ TIMESTAMP": "2025-01-17T20:45:00Z"
        }


# ===== ENDPOINTS DE EMPRESAS =====

@router.get("/empresas/",
    response_model=List[EmpresaResponse],
    summary="Listar empresas",
    description="Lista empresas com filtros e paginação"
)
async def listar_empresas(
    # Filtros opcionais
    nome: Optional[str] = Query(None, description="Filtro por nome (busca parcial)"),
    cnpj: Optional[str] = Query(None, description="Filtro por CNPJ"),
    ativo: Optional[bool] = Query(None, description="Filtro por status ativo"),
    
    # Paginação
    skip: int = Query(0, ge=0, description="Registros a pular"),
    limit: int = Query(50, ge=1, le=200, description="Limite de registros"),
    
    # Dependências
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_database)
):
    """
    Lista empresas com filtros aplicados.
    
    **Filtros disponíveis:**
    - Nome (busca parcial)
    - CNPJ (busca exata)
    - Status ativo/inativo
    """
    # Constrói filtros
    filters = EmpresaFilters(
        nome=nome,
        cnpj=cnpj,
        ativo=ativo
    )
    
    service = EmpresaService(db)
    return await service.listar_empresas(filters, skip, limit)


@router.get("/empresas/{empresa_id}",
    response_model=EmpresaResponse,
    summary="Obter empresa por ID",
    description="Retorna detalhes completos de uma empresa específica"
)
async def obter_empresa(
    empresa_id: uuid.UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_database)
):
    """
    Obtém detalhes de uma empresa específica.
    """
    service = EmpresaService(db)
    return await service.obter_empresa(str(empresa_id))


@router.get("/empresas/{empresa_id}/com-lojas",
    response_model=EmpresaComLojas,
    summary="Obter empresa com suas lojas",
    description="Retorna empresa com todas suas lojas associadas"
)
async def obter_empresa_com_lojas(
    empresa_id: uuid.UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_database)
):
    """
    Obtém empresa com todas suas lojas.
    
    **Útil para:**
    - Visão geral da empresa
    - Relatórios de estrutura organizacional
    """
    service = EmpresaService(db)
    return await service.obter_empresa_com_lojas(str(empresa_id))


# ===== ENDPOINTS DE LOJAS =====

@router.get("/lojas/",
    response_model=List[LojaListItem],
    summary="Listar lojas",
    description="Lista lojas com filtros e paginação, incluindo nome da empresa"
)
async def listar_lojas(
    # Filtros opcionais
    nome: Optional[str] = Query(None, description="Filtro por nome (busca parcial)"),
    codigo: Optional[str] = Query(None, description="Filtro por código"),
    empresa_id: Optional[uuid.UUID] = Query(None, description="Filtro por empresa"),
    gerente_id: Optional[uuid.UUID] = Query(None, description="Filtro por gerente"),
    ativo: Optional[bool] = Query(None, description="Filtro por status ativo"),
    
    # Paginação
    skip: int = Query(0, ge=0, description="Registros a pular"),
    limit: int = Query(50, ge=1, le=200, description="Limite de registros"),
    
    # Dependências
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_database)
):
    """
    Lista lojas com filtros aplicados.
    
    **Inclui nome da empresa** via JOIN para facilitar visualização.
    """
    # Constrói filtros
    filters = LojaFilters(
        nome=nome,
        codigo=codigo,
        empresa_id=empresa_id,
        gerente_id=gerente_id,
        ativo=ativo
    )
    
    service = EmpresaService(db)
    return await service.listar_lojas(filters, skip, limit)


@router.get("/empresas/{empresa_id}/lojas",
    response_model=List[LojaResponse],
    summary="Listar lojas de uma empresa",
    description="Lista todas as lojas de uma empresa específica"
)
async def listar_lojas_por_empresa(
    empresa_id: uuid.UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_database)
):
    """
    Lista todas as lojas de uma empresa.
    
    **Útil para:**
    - Gestão de rede de lojas
    - Relatórios por empresa
    """
    service = EmpresaService(db)
    return await service.listar_lojas_por_empresa(str(empresa_id))


# ===== ENDPOINTS DE ESTATÍSTICAS =====

@router.get("/estatisticas",
    summary="Estatísticas gerais",
    description="Retorna estatísticas gerais de empresas e lojas"
)
async def obter_estatisticas_empresas(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_database)
):
    """
    Obtém estatísticas gerais do sistema.
    
    **Inclui:**
    - Total de empresas ativas
    - Total de lojas ativas
    - Média de lojas por empresa
    - Empresa com mais lojas
    """
    service = EmpresaService(db)
    return await service.obter_estatisticas_empresas()


# ===== ENDPOINTS DE VALIDAÇÃO =====

@router.post("/empresas/validar",
    summary="Validar dados da empresa",
    description="Valida dados da empresa sem criar registro"
)
async def validar_dados_empresa(
    empresa_data: EmpresaCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_database)
):
    """
    Valida dados de empresa antes da criação.
    
    **Validações:**
    - CNPJ único
    - Formato dos dados
    - Regras de negócio
    """
    service = EmpresaService(db)
    return await service.validar_dados_empresa(empresa_data) 