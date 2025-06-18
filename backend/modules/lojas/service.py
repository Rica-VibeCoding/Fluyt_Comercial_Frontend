from typing import List, Optional, Dict, Any
from uuid import UUID
import logging
from datetime import datetime

from .repository import LojaRepository
from .schemas import LojaCreate, LojaUpdate, LojaResponse, LojaFilters, LojaComRelacionamentos
from modules.shared.database import get_supabase_client

logger = logging.getLogger(__name__)

class LojaService:
    """Service para lógica de negócio das lojas"""
    
    def __init__(self):
        self.repository = LojaRepository()
        # Inicializar cliente Supabase para validações de empresa
        self.supabase = get_supabase_client()
    
    async def create_loja(self, loja_data: LojaCreate) -> LojaResponse:
        """Criar nova loja com validações"""
        try:
            # Validar se empresa existe
            empresa_result = self.supabase.table('cad_empresas').select('id, nome, ativo').eq('id', str(loja_data.empresa_id)).execute()
            if not empresa_result.data:
                raise ValueError(f"Empresa {loja_data.empresa_id} não encontrada")
            
            empresa = empresa_result.data[0]
            if not empresa['ativo']:
                raise ValueError("Não é possível criar loja para empresa inativa")
            
            # Validar código único
            codigo_exists = await self.repository.check_codigo_exists(loja_data.codigo)
            if codigo_exists:
                raise ValueError(f"Código '{loja_data.codigo}' já está em uso")
            
            # Criar loja
            loja = await self.repository.create(loja_data)
            
            logger.info(f"Loja criada: {loja.nome} (Código: {loja.codigo}) para empresa {empresa['nome']}")
            return loja
            
        except ValueError as e:
            logger.warning(f"Validação falhou ao criar loja: {str(e)}")
            raise e
        except Exception as e:
            logger.error(f"Erro no service ao criar loja: {str(e)}")
            raise Exception(f"Erro interno ao criar loja: {str(e)}")
    
    async def get_loja_by_id(self, loja_id: UUID) -> Optional[LojaResponse]:
        """Buscar loja por ID"""
        try:
            return await self.repository.get_by_id(loja_id)
        except Exception as e:
            logger.error(f"Erro no service ao buscar loja {loja_id}: {str(e)}")
            raise Exception(f"Erro interno ao buscar loja: {str(e)}")
    
    async def get_loja_by_codigo(self, codigo: str) -> Optional[LojaResponse]:
        """Buscar loja por código"""
        try:
            return await self.repository.get_by_codigo(codigo)
        except Exception as e:
            logger.error(f"Erro no service ao buscar loja por código {codigo}: {str(e)}")
            raise Exception(f"Erro interno ao buscar loja: {str(e)}")
    
    async def get_loja_com_relacionamentos(self, loja_id: UUID) -> Optional[LojaComRelacionamentos]:
        """Buscar loja com dados relacionados carregados"""
        try:
            loja = await self.repository.get_by_id(loja_id)
            if not loja:
                return None
            
            # Carregar empresa
            empresa_result = self.supabase.table('cad_empresas').select('id, nome').eq('id', str(loja.empresa_id)).execute()
            empresa = empresa_result.data[0] if empresa_result.data else None
            
            # Montar resposta com relacionamentos
            loja_dict = loja.model_dump()
            loja_dict["empresa"] = {"id": empresa['id'], "nome": empresa['nome']} if empresa else None
            loja_dict["gerente"] = None  # TODO: Implementar quando módulo equipe estiver pronto
            
            return LojaComRelacionamentos(**loja_dict)
            
        except Exception as e:
            logger.error(f"Erro no service ao buscar loja com relacionamentos {loja_id}: {str(e)}")
            raise Exception(f"Erro interno ao buscar loja: {str(e)}")
    
    async def list_lojas(self, filters: LojaFilters) -> tuple[List[LojaResponse], int]:
        """Listar lojas com filtros"""
        try:
            return await self.repository.list_all(filters)
        except Exception as e:
            logger.error(f"Erro no service ao listar lojas: {str(e)}")
            raise Exception(f"Erro interno ao listar lojas: {str(e)}")
    
    async def list_lojas_by_empresa(self, empresa_id: UUID) -> List[LojaResponse]:
        """Listar lojas de uma empresa"""
        try:
            # Validar se empresa existe
            empresa_result = self.supabase.table('cad_empresas').select('id').eq('id', str(empresa_id)).execute()
            if not empresa_result.data:
                raise ValueError(f"Empresa {empresa_id} não encontrada")
            
            return await self.repository.list_by_empresa(empresa_id)
            
        except ValueError as e:
            logger.warning(f"Validação falhou ao listar lojas da empresa: {str(e)}")
            raise e
        except Exception as e:
            logger.error(f"Erro no service ao listar lojas da empresa {empresa_id}: {str(e)}")
            raise Exception(f"Erro interno ao listar lojas: {str(e)}")
    
    async def update_loja(self, loja_id: UUID, loja_data: LojaUpdate) -> Optional[LojaResponse]:
        """Atualizar loja com validações"""
        try:
            # Verificar se loja existe
            loja_atual = await self.repository.get_by_id(loja_id)
            if not loja_atual:
                raise ValueError(f"Loja {loja_id} não encontrada")
            
            # Validar empresa se foi alterada
            if loja_data.empresa_id and loja_data.empresa_id != loja_atual.empresa_id:
                empresa_result = self.supabase.table('cad_empresas').select('id, ativo').eq('id', str(loja_data.empresa_id)).execute()
                if not empresa_result.data:
                    raise ValueError(f"Empresa {loja_data.empresa_id} não encontrada")
                empresa = empresa_result.data[0]
                if not empresa['ativo']:
                    raise ValueError("Não é possível vincular loja a empresa inativa")
            
            # Validar código único se foi alterado
            if loja_data.codigo and loja_data.codigo != loja_atual.codigo:
                codigo_exists = await self.repository.check_codigo_exists(loja_data.codigo, loja_id)
                if codigo_exists:
                    raise ValueError(f"Código '{loja_data.codigo}' já está em uso")
            
            # Atualizar loja
            loja_atualizada = await self.repository.update(loja_id, loja_data)
            
            if loja_atualizada:
                logger.info(f"Loja atualizada: {loja_atualizada.nome} (ID: {loja_id})")
            
            return loja_atualizada
            
        except ValueError as e:
            logger.warning(f"Validação falhou ao atualizar loja: {str(e)}")
            raise e
        except Exception as e:
            logger.error(f"Erro no service ao atualizar loja {loja_id}: {str(e)}")
            raise Exception(f"Erro interno ao atualizar loja: {str(e)}")
    
    async def delete_loja(self, loja_id: UUID) -> bool:
        """Deletar loja (soft delete)"""
        try:
            # Verificar se loja existe
            loja = await self.repository.get_by_id(loja_id)
            if not loja:
                raise ValueError(f"Loja {loja_id} não encontrada")
            
            # TODO: Verificar se há orçamentos/contratos vinculados
            # Por enquanto, apenas desativar
            
            success = await self.repository.delete(loja_id)
            
            if success:
                logger.info(f"Loja desativada: {loja.nome} (ID: {loja_id})")
            
            return success
            
        except ValueError as e:
            logger.warning(f"Validação falhou ao deletar loja: {str(e)}")
            raise e
        except Exception as e:
            logger.error(f"Erro no service ao deletar loja {loja_id}: {str(e)}")
            raise Exception(f"Erro interno ao deletar loja: {str(e)}")
    
    async def get_dashboard_stats(self) -> Dict[str, Any]:
        """Obter estatísticas para dashboard"""
        try:
            stats = await self.repository.get_stats()
            
            # Adicionar informações calculadas
            stats["percentual_ativas"] = (
                (stats["lojas_ativas"] / stats["total_lojas"] * 100) 
                if stats["total_lojas"] > 0 else 0
            )
            
            return stats
            
        except Exception as e:
            logger.error(f"Erro no service ao obter stats: {str(e)}")
            raise Exception(f"Erro interno ao obter estatísticas: {str(e)}")
    
    async def validate_loja_access(self, loja_id: UUID, user_empresa_id: Optional[UUID] = None) -> bool:
        """Validar se usuário tem acesso à loja (para futuro controle de acesso)"""
        try:
            loja = await self.repository.get_by_id(loja_id)
            if not loja:
                return False
            
            # Por enquanto, todos têm acesso
            # TODO: Implementar controle de acesso baseado em empresa do usuário
            return True
            
        except Exception as e:
            logger.error(f"Erro ao validar acesso à loja {loja_id}: {str(e)}")
            return False 