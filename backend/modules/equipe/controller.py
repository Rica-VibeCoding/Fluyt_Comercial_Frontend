# FastAPI Controller para Equipe - CRUD COMPLETO
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse
from .schemas import (
    EquipeCreate, EquipeUpdate, EquipeResponse, 
    EquipeListResponse, EquipeStatusToggleResponse
)
from .repository import EquipeRepository
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

# ✅ CORREÇÃO: Removido prefix para evitar duplicação (/api/v1/equipe/equipe/)
router = APIRouter(tags=['👥 Equipe'])

# Dependency para repository
async def get_equipe_repository() -> EquipeRepository:
    return EquipeRepository()

@router.get('/', response_model=EquipeListResponse, summary="Listar funcionários")
async def listar_funcionarios(
    loja_id: Optional[str] = Query(None, description="Filtrar por loja"),
    setor_id: Optional[str] = Query(None, description="Filtrar por setor"),
    ativo: Optional[bool] = Query(None, description="Filtrar por status ativo"),
    perfil: Optional[str] = Query(None, description="Filtrar por perfil"),
    repository: EquipeRepository = Depends(get_equipe_repository)
):
    """
    Listar todos os funcionários com filtros opcionais
    
    - **loja_id**: UUID da loja para filtrar
    - **setor_id**: UUID do setor para filtrar  
    - **ativo**: true/false para funcionários ativos/inativos
    - **perfil**: VENDEDOR, GERENTE, etc.
    """
    try:
        logger.info(f"📋 Listando funcionários com filtros: loja={loja_id}, setor={setor_id}, ativo={ativo}, perfil={perfil}")
        
        # Preparar filtros
        filters = {}
        if loja_id:
            filters["loja_id"] = loja_id
        if setor_id:
            filters["setor_id"] = setor_id
        if ativo is not None:
            filters["ativo"] = ativo
        if perfil:
            filters["perfil"] = perfil
        
        # Buscar funcionários
        funcionarios = await repository.list_all(filters)
        
        # Calcular estatísticas
        total = len(funcionarios)
        ativos = len([f for f in funcionarios if f.ativo])
        inativos = total - ativos
        
        # Agrupar por loja
        por_loja = {}
        for f in funcionarios:
            loja = f.loja_nome or "Sem loja"
            por_loja[loja] = por_loja.get(loja, 0) + 1
        
        # Agrupar por setor
        por_setor = {}
        for f in funcionarios:
            setor = f.setor_nome or "Sem setor"
            por_setor[setor] = por_setor.get(setor, 0) + 1
        
        response = EquipeListResponse(
            funcionarios=funcionarios,
            total=total,
            ativos=ativos,
            inativos=inativos,
            por_loja=por_loja,
            por_setor=por_setor
        )
        
        logger.info(f"✅ {total} funcionários listados com sucesso")
        return response
        
    except Exception as e:
        logger.error(f"❌ Erro ao listar funcionários: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar funcionários: {str(e)}"
        )

@router.get('/{funcionario_id}', response_model=EquipeResponse, summary="Buscar funcionário por ID")
async def obter_funcionario(
    funcionario_id: str,
    repository: EquipeRepository = Depends(get_equipe_repository)
):
    """
    Buscar um funcionário específico por ID
    
    - **funcionario_id**: UUID do funcionário
    """
    try:
        logger.info(f"🔍 Buscando funcionário ID: {funcionario_id}")
        
        funcionario = await repository.get_by_id(funcionario_id)
        
        if not funcionario:
            logger.warning(f"⚠️ Funcionário {funcionario_id} não encontrado")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Funcionário com ID {funcionario_id} não encontrado"
            )
        
        logger.info(f"✅ Funcionário {funcionario.nome} encontrado")
        return funcionario
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao buscar funcionário {funcionario_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar funcionário: {str(e)}"
        )

@router.post('/', response_model=EquipeResponse, status_code=status.HTTP_201_CREATED, summary="Criar funcionário")
async def criar_funcionario(
    funcionario_data: EquipeCreate,
    repository: EquipeRepository = Depends(get_equipe_repository)
):
    """
    Criar um novo funcionário
    
    - **nome**: Nome completo (obrigatório)
    - **email**: Email válido (opcional)
    - **setor_id**: UUID do setor (obrigatório)
    - **loja_id**: UUID da loja (obrigatório)
    - **perfil**: VENDEDOR, GERENTE, etc. (padrão: VENDEDOR)
    - **ativo**: Status ativo (padrão: true)
    - Todos os demais campos são opcionais
    """
    try:
        logger.info(f"➕ Criando funcionário: {funcionario_data.nome}")
        
        funcionario_criado = await repository.create(funcionario_data)
        
        logger.info(f"✅ Funcionário {funcionario_criado.nome} criado com sucesso - ID: {funcionario_criado.id}")
        return funcionario_criado
        
    except Exception as e:
        logger.error(f"❌ Erro ao criar funcionário: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar funcionário: {str(e)}"
        )

@router.put('/{funcionario_id}', response_model=EquipeResponse, summary="Atualizar funcionário")
async def atualizar_funcionario(
    funcionario_id: str,
    funcionario_data: EquipeUpdate,
    repository: EquipeRepository = Depends(get_equipe_repository)
):
    """
    Atualizar um funcionário existente
    
    - **funcionario_id**: UUID do funcionário
    - Todos os campos são opcionais - apenas os fornecidos serão atualizados
    """
    try:
        logger.info(f"✏️ Atualizando funcionário ID: {funcionario_id}")
        
        funcionario_atualizado = await repository.update(funcionario_id, funcionario_data)
        
        if not funcionario_atualizado:
            logger.warning(f"⚠️ Funcionário {funcionario_id} não encontrado para atualização")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Funcionário com ID {funcionario_id} não encontrado"
            )
        
        logger.info(f"✅ Funcionário {funcionario_atualizado.nome} atualizado com sucesso")
        return funcionario_atualizado
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao atualizar funcionário {funcionario_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar funcionário: {str(e)}"
        )

@router.delete('/{funcionario_id}', summary="Excluir funcionário (soft delete)")
async def excluir_funcionario(
    funcionario_id: str,
    repository: EquipeRepository = Depends(get_equipe_repository)
):
    """
    Excluir funcionário (soft delete - marca como inativo)
    
    - **funcionario_id**: UUID do funcionário
    """
    try:
        logger.info(f"🗑️ Excluindo funcionário ID: {funcionario_id}")
        
        sucesso = await repository.delete(funcionario_id)
        
        if not sucesso:
            logger.warning(f"⚠️ Funcionário {funcionario_id} não encontrado para exclusão")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Funcionário com ID {funcionario_id} não encontrado"
            )
        
        logger.info(f"✅ Funcionário {funcionario_id} excluído com sucesso")
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "Funcionário excluído com sucesso",
                "funcionario_id": funcionario_id,
                "tipo": "soft_delete"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao excluir funcionário {funcionario_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir funcionário: {str(e)}"
        )

@router.patch('/{funcionario_id}/toggle-status', response_model=EquipeStatusToggleResponse, summary="Alternar status ativo/inativo")
async def alternar_status_funcionario(
    funcionario_id: str,
    repository: EquipeRepository = Depends(get_equipe_repository)
):
    """
    Alternar status ativo/inativo do funcionário
    
    - **funcionario_id**: UUID do funcionário
    """
    try:
        logger.info(f"🔄 Alternando status do funcionário ID: {funcionario_id}")
        
        funcionario_atualizado = await repository.toggle_status(funcionario_id)
        
        if not funcionario_atualizado:
            logger.warning(f"⚠️ Funcionário {funcionario_id} não encontrado")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Funcionário com ID {funcionario_id} não encontrado"
            )
        
        status_texto = "ATIVO" if funcionario_atualizado.ativo else "INATIVO"
        message = f"Funcionário {funcionario_atualizado.nome} agora está {status_texto}"
        
        logger.info(f"✅ {message}")
        
        return EquipeStatusToggleResponse(
            id=funcionario_atualizado.id,
            nome=funcionario_atualizado.nome,
            ativo=funcionario_atualizado.ativo,
            message=message
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao alternar status do funcionário {funcionario_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao alternar status: {str(e)}"
        )

@router.get('/stats/dashboard', summary="Estatísticas da equipe")
async def obter_estatisticas(
    repository: EquipeRepository = Depends(get_equipe_repository)
):
    """
    Obter estatísticas completas da equipe para dashboard
    
    Retorna:
    - Total de funcionários
    - Funcionários ativos/inativos
    - Distribuição por loja
    - Distribuição por setor
    """
    try:
        logger.info("📊 Obtendo estatísticas da equipe")
        
        stats = await repository.get_stats()
        
        logger.info(f"✅ Estatísticas calculadas: {stats['total']} funcionários")
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "data": stats,
                "message": "Estatísticas da equipe calculadas com sucesso"
            }
        )
        
    except Exception as e:
        logger.error(f"❌ Erro ao calcular estatísticas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao calcular estatísticas: {str(e)}"
        )
