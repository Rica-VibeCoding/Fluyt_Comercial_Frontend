"""
Controller (rotas) para o módulo de Clientes.
Define endpoints REST para operações de cliente.
"""

from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List, Optional, Dict, Any
from core.auth import get_current_user, require_vendedor_ou_superior
from core.database import get_database, get_service_database
from supabase import Client
import uuid

from .schemas import (
    ClienteCreate,
    ClienteUpdate,
    ClienteResponse,
    ClienteListItem,
    ClienteFilters
)
from .services import ClienteService

# Router para o módulo de clientes
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
    
    **Retorna:** Estatísticas básicas dos clientes reais.
    """
    try:
        # Buscar estatísticas reais dos clientes
        result_total = db.table('c_clientes').select('*', count='exact').execute()
        
        # Clientes por cidade
        result_cidades = db.table('c_clientes').select('cidade', count='exact').execute()
        
        # Clientes recentes
        result_recentes = db.table('c_clientes').select('id', 'nome', 'cidade', 'created_at').order('created_at', desc=True).limit(3).execute()
        
        # Agrupar cidades
        cidades = {}
        if result_cidades.data:
            for cliente in result_cidades.data:
                cidade = cliente.get('cidade', 'N/A')
                cidades[cidade] = cidades.get(cidade, 0) + 1
        
        return {
            "🟢 STATUS": "CONECTADO AOS DADOS REAIS DO SUPABASE",
            "📊 PROJETO": "momwbpxqnvgehotfmvde",
            "🗄️ TABELA": "c_clientes",
            "📈 ESTATISTICAS": {
                "total_clientes": result_total.count if result_total.count else len(result_total.data),
                "distribuicao_cidades": cidades,
                "clientes_recentes": result_recentes.data if result_recentes.data else []
            },
            "❌ MOCK_DATA": False,
            "⏰ TIMESTAMP": "2025-01-11T19:30:00Z",
            "🔧 DATABASE": "SERVICE_CLIENT_BYPASS_RLS"
        }
        
    except Exception as e:
        return {
            "🔴 STATUS": "ERRO NA CONEXÃO COM SUPABASE",
            "❌ ERRO": str(e),
            "📊 PROJETO": "momwbpxqnvgehotfmvde",
            "🗄️ TABELA": "c_clientes",
            "⏰ TIMESTAMP": "2025-01-11T19:30:00Z"
        }


@router.post("/", 
    response_model=ClienteResponse,
    summary="Criar novo cliente",
    description="Cria um novo cliente na loja com validações de negócio"
)
async def criar_cliente(
    cliente_data: ClienteCreate,
    current_user: Dict[str, Any] = Depends(require_vendedor_ou_superior()),
    db: Client = Depends(get_database)
):
    """
    Cria um novo cliente.
    
    - **Valida CPF/CNPJ** único na loja
    - **Aplica validações** de dados obrigatórios
    - **Registra procedência** para tracking de marketing
    """
    service = ClienteService(db)
    return await service.criar_cliente(cliente_data, current_user)


@router.get("/",
    response_model=List[ClienteListItem],
    summary="Listar clientes",
    description="Lista clientes da loja com filtros e paginação"
)
async def listar_clientes(
    # Filtros opcionais
    nome: Optional[str] = Query(None, description="Filtro por nome (busca parcial)"),
    cpf_cnpj: Optional[str] = Query(None, description="Filtro por CPF/CNPJ"),
    telefone: Optional[str] = Query(None, description="Filtro por telefone"),
    cidade: Optional[str] = Query(None, description="Filtro por cidade"),
    tipo_venda: Optional[str] = Query(None, description="Filtro por tipo de venda (NORMAL/FUTURA)"),
    procedencia_id: Optional[str] = Query(None, description="Filtro por ID da procedência"),
    
    # Paginação
    skip: int = Query(0, ge=0, description="Registros a pular"),
    limit: int = Query(50, ge=1, le=200, description="Limite de registros"),
    
    # Dependências
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_database)
):
    """
    Lista clientes com filtros aplicados.
    
    **RLS aplicado:** Usuário vê apenas clientes da própria loja.
    """
    # Constrói filtros
    filters = ClienteFilters(
        nome=nome,
        cpf_cnpj=cpf_cnpj,
        telefone=telefone,
        cidade=cidade,
        tipo_venda=tipo_venda,
        procedencia_id=procedencia_id
    )
    
    service = ClienteService(db)
    return await service.listar_clientes(filters, current_user, skip, limit)


@router.get("/{cliente_id}",
    response_model=ClienteResponse,
    summary="Obter cliente por ID",
    description="Retorna detalhes completos de um cliente específico"
)
async def obter_cliente(
    cliente_id: uuid.UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_database)
):
    """
    Obtém detalhes de um cliente específico.
    
    **RLS aplicado:** Apenas clientes da mesma loja.
    """
    service = ClienteService(db)
    return await service.obter_cliente(str(cliente_id), current_user)


@router.put("/{cliente_id}",
    response_model=ClienteResponse,
    summary="Atualizar cliente",
    description="Atualiza dados de um cliente existente"
)
async def atualizar_cliente(
    cliente_id: uuid.UUID,
    cliente_data: ClienteUpdate,
    current_user: Dict[str, Any] = Depends(require_vendedor_ou_superior()),
    db: Client = Depends(get_database)
):
    """
    Atualiza um cliente existente.
    
    - **Atualização parcial:** Apenas campos fornecidos são alterados
    - **Mantém validações** de negócio
    """
    service = ClienteService(db)
    return await service.atualizar_cliente(str(cliente_id), cliente_data, current_user)


@router.delete("/{cliente_id}",
    summary="Excluir cliente",
    description="Exclui um cliente (soft delete)"
)
async def excluir_cliente(
    cliente_id: uuid.UUID,
    current_user: Dict[str, Any] = Depends(require_vendedor_ou_superior()),
    db: Client = Depends(get_database)
):
    """
    Exclui um cliente.
    
    **Regras:**
    - Soft delete (marca como excluído)
    - Verifica se tem orçamentos associados
    """
    service = ClienteService(db)
    await service.excluir_cliente(str(cliente_id), current_user)
    return {"message": "Cliente excluído com sucesso"}


@router.get("/buscar/cpf-cnpj",
    response_model=Optional[ClienteResponse],
    summary="Buscar cliente por CPF/CNPJ",
    description="Busca cliente específico por CPF ou CNPJ"
)
async def buscar_cliente_por_cpf_cnpj(
    cpf_cnpj: str = Query(..., description="CPF ou CNPJ para buscar"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_database)
):
    """
    Busca cliente por CPF/CNPJ.
    
    **Útil para:** Verificar se cliente já existe antes de criar novo.
    """
    service = ClienteService(db)
    return await service.buscar_cliente_por_cpf_cnpj(cpf_cnpj, current_user)


@router.post("/validar",
    summary="Validar dados do cliente",
    description="Valida dados do cliente sem criar registro"
)
async def validar_dados_cliente(
    cliente_data: ClienteCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_database)
):
    """
    Valida dados do cliente aplicando regras de negócio.
    
    **Útil para:** Validação em tempo real no frontend.
    """
    service = ClienteService(db)
    return await service.validar_dados_cliente(cliente_data)
