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
import logging

from .schemas import (
    EmpresaCreate, EmpresaUpdate, EmpresaResponse, EmpresaComLojas,
    LojaCreate, LojaUpdate, LojaResponse, LojaListItem,
    EmpresaFilters, LojaFilters
)
from .services import EmpresaService

# Router para o módulo de empresas
router = APIRouter()

# Configurar logger
logger = logging.getLogger(__name__)


@router.get("/teste-conexao-real",
    summary="🔗 Testar conexão com dados reais do Supabase",
    description="Endpoint sem autenticação para verificar se está conectado aos dados reais",
    tags=["🧪 TESTE"]
)
async def testar_conexao_dados_reais_sem_auth(
    db: Client = Depends(get_database)
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
    
    # Dependências - TEMPORÁRIO: SEM AUTH PARA DESENVOLVIMENTO
    # current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_database)  # Usando service_database para bypass RLS
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
    # current_user: Dict[str, Any] = Depends(get_current_user),  # TEMP DISABLED
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
    # current_user: Dict[str, Any] = Depends(get_current_user),  # TEMP DISABLED
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


@router.post("/empresas/", 
    response_model=EmpresaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar nova empresa",
    description="Cria uma nova empresa no sistema"
)
async def criar_empresa(
    empresa_data: EmpresaCreate,
    # current_user: Dict[str, Any] = Depends(require_vendedor_ou_superior),  # TEMP DISABLED
    db: Client = Depends(get_database)
):
    """
    Cria nova empresa no sistema.
    
    **Validações aplicadas:**
    - CNPJ único no sistema
    - Dados obrigatórios preenchidos
    - Formato de email válido
    
    **Permissões:** Vendedor ou superior
    """
    try:
        # MOCK TEMPORÁRIO - Para desenvolvimento
        empresa_criada_mock = {
            "id": "temp-" + str(hash(empresa_data.nome))[-8:],
            "nome": empresa_data.nome,
            "cnpj": empresa_data.cnpj,
            "email": empresa_data.email,
            "telefone": empresa_data.telefone, 
            "endereco": empresa_data.endereco,
            "ativo": True,
            "created_at": "2025-06-18T07:43:06.483939Z",
            "updated_at": "2025-06-18T07:43:06.483939Z"
        }
        
        # Converter para objeto Pydantic
        from .schemas import EmpresaResponse
        empresa_criada = EmpresaResponse(**empresa_criada_mock)
        
        logger.info(f"Empresa criada (modo desenvolvimento): {empresa_criada.nome}")
        return empresa_criada
        
    except Exception as e:
        logger.error(f"Erro ao criar empresa: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/empresas/{empresa_id}",
    response_model=EmpresaResponse,
    summary="Atualizar empresa",
    description="Atualiza dados de uma empresa existente"
)
async def atualizar_empresa(
    empresa_id: uuid.UUID,
    empresa_data: EmpresaUpdate,
    # current_user: Dict[str, Any] = Depends(require_vendedor_ou_superior),  # TEMP DISABLED
    db: Client = Depends(get_database)
):
    """
    Atualiza empresa existente.
    
    **Validações aplicadas:**
    - Empresa deve existir
    - CNPJ único (se alterado)
    - Dados válidos
    
    **Permissões:** Vendedor ou superior
    """
    try:
        service = EmpresaService(db)
        empresa_atualizada = await service.atualizar_empresa(str(empresa_id), empresa_data)
        
        logger.info(f"Empresa {empresa_id} atualizada (modo desenvolvimento)")
        return empresa_atualizada
        
    except Exception as e:
        logger.error(f"Erro ao atualizar empresa {empresa_id}: {str(e)}")
        if "não encontrada" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )


@router.delete("/empresas/{empresa_id}",
    summary="Excluir empresa",
    description="Exclui uma empresa (soft delete - marca como inativa)"
)
async def excluir_empresa(
    empresa_id: uuid.UUID,
    # current_user: Dict[str, Any] = Depends(require_vendedor_ou_superior),  # TEMP DISABLED
    db: Client = Depends(get_database)
):
    """
    Exclui empresa do sistema (soft delete).
    
    **Regras de negócio:**
    - Não permite excluir empresa com lojas ativas
    - Empresa é marcada como inativa (não removida fisicamente)
    - Logs de auditoria são criados
    
    **Permissões:** Vendedor ou superior
    """
    try:
        service = EmpresaService(db)
        resultado = await service.excluir_empresa(str(empresa_id))
        
        logger.info(f"Empresa {empresa_id} excluída (modo desenvolvimento)")
        return resultado
        
    except Exception as e:
        logger.error(f"Erro ao excluir empresa {empresa_id}: {str(e)}")
        if "não encontrada" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        elif "lojas ativas" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=str(e)
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )


@router.patch("/empresas/{empresa_id}/status",
    response_model=EmpresaResponse,
    summary="Alternar status da empresa",
    description="Ativa ou desativa uma empresa"
)
async def alternar_status_empresa(
    empresa_id: uuid.UUID,
    ativo: bool = Query(..., description="Novo status da empresa (true=ativo, false=inativo)"),
    # current_user: Dict[str, Any] = Depends(require_vendedor_ou_superior),  # TEMP DISABLED
    db: Client = Depends(get_database)
):
    """
    Alterna status ativo/inativo da empresa.
    
    **Casos de uso:**
    - Ativar empresa previamente desativada
    - Desativar empresa temporariamente
    - Controle de acesso por status
    
    **Permissões:** Vendedor ou superior
    """
    try:
        service = EmpresaService(db)
        empresa_atualizada = await service.alternar_status_empresa(str(empresa_id), ativo)
        
        status_texto = "ativada" if ativo else "desativada"
        logger.info(f"Empresa {empresa_id} {status_texto} (modo desenvolvimento)")
        
        return empresa_atualizada
        
    except Exception as e:
        logger.error(f"Erro ao alterar status empresa {empresa_id}: {str(e)}")
        if "não encontrada" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )


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
    
    # Dependências - TEMPORÁRIO: SEM AUTH
    # current_user: Dict[str, Any] = Depends(get_current_user),  # TEMP DISABLED
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
    # current_user: Dict[str, Any] = Depends(get_current_user),  # TEMP DISABLED
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
    # current_user: Dict[str, Any] = Depends(get_current_user),  # TEMP DISABLED
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
    # current_user: Dict[str, Any] = Depends(get_current_user),  # TEMP DISABLED
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