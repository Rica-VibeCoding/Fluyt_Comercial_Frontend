from fastapi import APIRouter, HTTPException, Depends, Query, Path
from typing import List, Optional
from uuid import UUID
import logging
import time

from .service import LojaService
from .schemas import (
    LojaCreate, LojaUpdate, LojaResponse, LojaFilters, 
    LojaListItem, LojaComRelacionamentos
)

logger = logging.getLogger(__name__)

# Router para endpoints de lojas
router = APIRouter(prefix="/lojas", tags=["Lojas"])

# === ENDPOINT TEMPORÁRIO PARA TESTE (SEM AUTH) ===

@router.get("/teste-simples", tags=["🧪 TESTE SIMPLES"])
async def teste_simples():
    """Endpoint super simples para debug"""
    return {"status": "OK", "message": "Endpoint funcionando", "timestamp": time.time()}

@router.get("/teste-sem-auth", response_model=dict, tags=["🧪 TESTE SEM AUTH"])
async def teste_lojas_sem_auth():
    """ENDPOINT TEMPORÁRIO - Testar lojas sem autenticação"""
    try:
        import requests
        
        # Testar via HTTP direto (bypass Supabase client)
        url = "https://momwbpxqnvgehotfmvde.supabase.co/rest/v1/c_lojas"
        headers = {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzAxNTIsImV4cCI6MjA2MzM0NjE1Mn0.n90ZweBT-o1ugerZJDZl8gx65WGe1eUrhph6VuSdSCs",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzAxNTIsImV4cCI6MjA2MzM0NjE1Mn0.n90ZweBT-o1ugerZJDZl8gx65WGe1eUrhph6VuSdSCs",
            "Content-Type": "application/json"
        }
        
        response = requests.get(url, headers=headers, params={"select": "id,nome,codigo,ativo"})
        
        if response.status_code == 200:
            data = response.json()
            return {
                "success": True,
                "message": "Teste HTTP DIRETO de lojas SEM autenticação",
                "data": {
                    "total_lojas": len(data),
                    "lojas": data
                },
                "fonte": "http_direto",
                "auth": "DISABLED",
                "timestamp": time.time()
            }
        else:
            return {
                "success": False,
                "error": f"HTTP {response.status_code}: {response.text}",
                "message": "Erro HTTP direto"
            }
            
    except Exception as e:
        logger.error(f"Erro no teste sem auth: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": "Erro no teste sem auth"
        }

# Dependency injection
def get_loja_service() -> LojaService:
    return LojaService()

# === ENDPOINTS PRINCIPAIS ===

@router.post("/", response_model=LojaResponse, status_code=201)
async def criar_loja(
    loja_data: LojaCreate,
    service: LojaService = Depends(get_loja_service)
):
    """Criar nova loja"""
    try:
        logger.info(f"Criando loja: {loja_data.nome} (Código: {loja_data.codigo})")
        loja = await service.create_loja(loja_data)
        return loja
    except ValueError as e:
        logger.warning(f"Erro de validação ao criar loja: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro interno ao criar loja: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/", response_model=dict)
async def listar_lojas(
    nome: Optional[str] = Query(None, description="Filtro por nome"),
    codigo: Optional[str] = Query(None, description="Filtro por código"),
    empresa_id: Optional[UUID] = Query(None, description="Filtro por empresa"),
    ativo: Optional[bool] = Query(None, description="Filtro por status ativo"),
    page: int = Query(1, ge=1, description="Número da página"),
    per_page: int = Query(20, ge=1, le=100, description="Itens por página"),
    service: LojaService = Depends(get_loja_service)
):
    """Listar lojas com filtros e paginação"""
    try:
        filters = LojaFilters(
            nome=nome,
            codigo=codigo,
            empresa_id=empresa_id,
            ativo=ativo,
            page=page,
            per_page=per_page
        )
        
        lojas, total = await service.list_lojas(filters)
        
        return {
            "success": True,
            "message": f"{len(lojas)} loja(s) encontrada(s)",
            "data": {
                "lojas": [LojaListItem(**loja.model_dump()) for loja in lojas],
                "total_lojas": total,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": total,
                    "pages": (total + per_page - 1) // per_page
                }
            },
            "fonte": "supabase",
            "projeto": "fluyt_comercial",
            "tabelas": ["c_lojas"],
            "mock": False,
            "timestamp": time.time()
        }
    except Exception as e:
        logger.error(f"Erro ao listar lojas: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/{loja_id}", response_model=LojaResponse)
async def obter_loja(
    loja_id: UUID = Path(..., description="ID da loja"),
    service: LojaService = Depends(get_loja_service)
):
    """Obter loja por ID"""
    try:
        loja = await service.get_loja_by_id(loja_id)
        if not loja:
            raise HTTPException(status_code=404, detail="Loja não encontrada")
        return loja
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter loja {loja_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/{loja_id}/detalhes", response_model=LojaComRelacionamentos)
async def obter_loja_detalhes(
    loja_id: UUID = Path(..., description="ID da loja"),
    service: LojaService = Depends(get_loja_service)
):
    """Obter loja com dados relacionados (empresa, gerente)"""
    try:
        loja = await service.get_loja_com_relacionamentos(loja_id)
        if not loja:
            raise HTTPException(status_code=404, detail="Loja não encontrada")
        return loja
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter detalhes da loja {loja_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.put("/{loja_id}", response_model=LojaResponse)
async def atualizar_loja(
    loja_id: UUID = Path(..., description="ID da loja"),
    loja_data: LojaUpdate = ...,
    service: LojaService = Depends(get_loja_service)
):
    """Atualizar loja"""
    try:
        logger.info(f"Atualizando loja {loja_id}")
        loja = await service.update_loja(loja_id, loja_data)
        if not loja:
            raise HTTPException(status_code=404, detail="Loja não encontrada")
        return loja
    except ValueError as e:
        logger.warning(f"Erro de validação ao atualizar loja: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro interno ao atualizar loja {loja_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.delete("/{loja_id}", status_code=204)
async def deletar_loja(
    loja_id: UUID = Path(..., description="ID da loja"),
    service: LojaService = Depends(get_loja_service)
):
    """Deletar loja (soft delete)"""
    try:
        logger.info(f"Deletando loja {loja_id}")
        success = await service.delete_loja(loja_id)
        if not success:
            raise HTTPException(status_code=404, detail="Loja não encontrada")
    except ValueError as e:
        logger.warning(f"Erro de validação ao deletar loja: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro interno ao deletar loja {loja_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

# === ENDPOINTS ESPECÍFICOS ===

@router.get("/codigo/{codigo}", response_model=LojaResponse)
async def obter_loja_por_codigo(
    codigo: str = Path(..., description="Código da loja"),
    service: LojaService = Depends(get_loja_service)
):
    """Obter loja por código"""
    try:
        loja = await service.get_loja_by_codigo(codigo)
        if not loja:
            raise HTTPException(status_code=404, detail="Loja não encontrada")
        return loja
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter loja por código {codigo}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@router.get("/empresa/{empresa_id}", response_model=List[LojaListItem])
async def listar_lojas_por_empresa(
    empresa_id: UUID = Path(..., description="ID da empresa"),
    service: LojaService = Depends(get_loja_service)
):
    """Listar lojas de uma empresa específica"""
    try:
        lojas = await service.list_lojas_by_empresa(empresa_id)
        return [LojaListItem(**loja.model_dump()) for loja in lojas]
    except ValueError as e:
        logger.warning(f"Erro de validação ao listar lojas da empresa: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao listar lojas da empresa {empresa_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

# === ENDPOINTS DE DASHBOARD/STATS ===

@router.get("/dashboard/stats", response_model=dict)
async def obter_stats_dashboard(
    service: LojaService = Depends(get_loja_service)
):
    """Obter estatísticas das lojas para dashboard"""
    try:
        stats = await service.get_dashboard_stats()
        return stats
    except Exception as e:
        logger.error(f"Erro ao obter stats do dashboard: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

# === ENDPOINTS DE VALIDAÇÃO ===

@router.get("/validar/codigo/{codigo}", response_model=dict)
async def validar_codigo_disponivel(
    codigo: str = Path(..., description="Código a ser validado"),
    exclude_id: Optional[UUID] = Query(None, description="ID da loja a excluir da validação"),
    service: LojaService = Depends(get_loja_service)
):
    """Validar se código está disponível"""
    try:
        exists = await service.repository.check_codigo_exists(codigo, exclude_id)
        return {
            "codigo": codigo,
            "disponivel": not exists,
            "em_uso": exists
        }
    except Exception as e:
        logger.error(f"Erro ao validar código {codigo}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor") 