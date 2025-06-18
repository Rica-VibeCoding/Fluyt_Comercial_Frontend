from typing import List, Optional, Dict, Any
from uuid import UUID
import logging
from datetime import datetime

from modules.shared.database import get_supabase_client
from .schemas import LojaCreate, LojaUpdate, LojaResponse, LojaFilters

logger = logging.getLogger(__name__)

class LojaRepository:
    """Repository para operações de lojas no Supabase"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
        self.table_name = "c_lojas"
    
    async def create(self, loja_data: LojaCreate) -> LojaResponse:
        """Criar nova loja"""
        try:
            # Preparar dados para inserção
            insert_data = {
                "nome": loja_data.nome,
                "codigo": loja_data.codigo,
                "empresa_id": str(loja_data.empresa_id),
                "gerente_id": str(loja_data.gerente_id) if loja_data.gerente_id else None,
                "endereco": loja_data.endereco,
                "telefone": loja_data.telefone,
                "email": loja_data.email,
                "data_abertura": loja_data.data_abertura.isoformat() if loja_data.data_abertura else None,
                "ativo": loja_data.ativo,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Inserir no Supabase
            response = self.supabase.table(self.table_name).insert(insert_data).execute()
            
            if not response.data:
                raise Exception("Erro ao criar loja no Supabase")
            
            loja_criada = response.data[0]
            logger.info(f"Loja criada com sucesso: {loja_criada['nome']} (ID: {loja_criada['id']})")
            
            return LojaResponse(**loja_criada)
            
        except Exception as e:
            logger.error(f"Erro ao criar loja: {str(e)}")
            raise Exception(f"Erro ao criar loja: {str(e)}")
    
    async def get_by_id(self, loja_id: UUID) -> Optional[LojaResponse]:
        """Buscar loja por ID"""
        try:
            response = self.supabase.table(self.table_name).select("*").eq("id", str(loja_id)).execute()
            
            if not response.data:
                return None
            
            return LojaResponse(**response.data[0])
            
        except Exception as e:
            logger.error(f"Erro ao buscar loja {loja_id}: {str(e)}")
            raise Exception(f"Erro ao buscar loja: {str(e)}")
    
    async def get_by_codigo(self, codigo: str) -> Optional[LojaResponse]:
        """Buscar loja por código"""
        try:
            response = self.supabase.table(self.table_name).select("*").eq("codigo", codigo).execute()
            
            if not response.data:
                return None
            
            return LojaResponse(**response.data[0])
            
        except Exception as e:
            logger.error(f"Erro ao buscar loja por código {codigo}: {str(e)}")
            raise Exception(f"Erro ao buscar loja por código: {str(e)}")
    
    async def list_all(self, filters: LojaFilters) -> tuple[List[LojaResponse], int]:
        """Listar lojas com filtros e paginação"""
        try:
            # Construir query base
            query = self.supabase.table(self.table_name).select("*", count="exact")
            
            # Aplicar filtros
            if filters.nome:
                query = query.ilike("nome", f"%{filters.nome}%")
            
            if filters.codigo:
                query = query.eq("codigo", filters.codigo)
            
            if filters.empresa_id:
                query = query.eq("empresa_id", str(filters.empresa_id))
            
            if filters.ativo is not None:
                query = query.eq("ativo", filters.ativo)
            
            # Aplicar ordenação
            query = query.order("nome", desc=False)
            
            # Aplicar paginação
            offset = (filters.page - 1) * filters.per_page
            query = query.range(offset, offset + filters.per_page - 1)
            
            # Executar query
            response = query.execute()
            
            lojas = [LojaResponse(**loja) for loja in response.data]
            total = response.count or 0
            
            logger.info(f"Listagem de lojas: {len(lojas)} encontradas de {total} total")
            
            return lojas, total
            
        except Exception as e:
            logger.error(f"Erro ao listar lojas: {str(e)}")
            raise Exception(f"Erro ao listar lojas: {str(e)}")
    
    async def list_by_empresa(self, empresa_id: UUID) -> List[LojaResponse]:
        """Listar lojas de uma empresa específica"""
        try:
            response = (
                self.supabase.table(self.table_name)
                .select("*")
                .eq("empresa_id", str(empresa_id))
                .eq("ativo", True)
                .order("nome")
                .execute()
            )
            
            lojas = [LojaResponse(**loja) for loja in response.data]
            logger.info(f"Lojas da empresa {empresa_id}: {len(lojas)} encontradas")
            
            return lojas
            
        except Exception as e:
            logger.error(f"Erro ao listar lojas da empresa {empresa_id}: {str(e)}")
            raise Exception(f"Erro ao listar lojas da empresa: {str(e)}")
    
    async def update(self, loja_id: UUID, loja_data: LojaUpdate) -> Optional[LojaResponse]:
        """Atualizar loja"""
        try:
            # Preparar dados para atualização (apenas campos não nulos)
            update_data = {}
            
            if loja_data.nome is not None:
                update_data["nome"] = loja_data.nome
            if loja_data.codigo is not None:
                update_data["codigo"] = loja_data.codigo
            if loja_data.empresa_id is not None:
                update_data["empresa_id"] = str(loja_data.empresa_id)
            if loja_data.gerente_id is not None:
                update_data["gerente_id"] = str(loja_data.gerente_id)
            if loja_data.endereco is not None:
                update_data["endereco"] = loja_data.endereco
            if loja_data.telefone is not None:
                update_data["telefone"] = loja_data.telefone
            if loja_data.email is not None:
                update_data["email"] = loja_data.email
            if loja_data.data_abertura is not None:
                update_data["data_abertura"] = loja_data.data_abertura.isoformat()
            if loja_data.ativo is not None:
                update_data["ativo"] = loja_data.ativo
            
            # Sempre atualizar timestamp
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
            # Atualizar no Supabase
            response = (
                self.supabase.table(self.table_name)
                .update(update_data)
                .eq("id", str(loja_id))
                .execute()
            )
            
            if not response.data:
                return None
            
            loja_atualizada = response.data[0]
            logger.info(f"Loja atualizada: {loja_atualizada['nome']} (ID: {loja_id})")
            
            return LojaResponse(**loja_atualizada)
            
        except Exception as e:
            logger.error(f"Erro ao atualizar loja {loja_id}: {str(e)}")
            raise Exception(f"Erro ao atualizar loja: {str(e)}")
    
    async def delete(self, loja_id: UUID) -> bool:
        """Deletar loja (soft delete - marcar como inativo)"""
        try:
            response = (
                self.supabase.table(self.table_name)
                .update({
                    "ativo": False,
                    "updated_at": datetime.utcnow().isoformat()
                })
                .eq("id", str(loja_id))
                .execute()
            )
            
            if not response.data:
                return False
            
            logger.info(f"Loja desativada: ID {loja_id}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao deletar loja {loja_id}: {str(e)}")
            raise Exception(f"Erro ao deletar loja: {str(e)}")
    
    async def check_codigo_exists(self, codigo: str, exclude_id: Optional[UUID] = None) -> bool:
        """Verificar se código já existe"""
        try:
            query = self.supabase.table(self.table_name).select("id").eq("codigo", codigo)
            
            if exclude_id:
                query = query.neq("id", str(exclude_id))
            
            response = query.execute()
            
            return len(response.data) > 0
            
        except Exception as e:
            logger.error(f"Erro ao verificar código {codigo}: {str(e)}")
            raise Exception(f"Erro ao verificar código: {str(e)}")
    
    async def get_stats(self) -> Dict[str, Any]:
        """Obter estatísticas das lojas"""
        try:
            # Total de lojas
            total_response = self.supabase.table(self.table_name).select("id", count="exact").execute()
            total = total_response.count or 0
            
            # Lojas ativas
            ativas_response = (
                self.supabase.table(self.table_name)
                .select("id", count="exact")
                .eq("ativo", True)
                .execute()
            )
            ativas = ativas_response.count or 0
            
            # Lojas por empresa
            por_empresa_response = (
                self.supabase.table(self.table_name)
                .select("empresa_id", count="exact")
                .eq("ativo", True)
                .execute()
            )
            
            stats = {
                "total_lojas": total,
                "lojas_ativas": ativas,
                "lojas_inativas": total - ativas,
                "ultima_atualizacao": datetime.utcnow().isoformat()
            }
            
            logger.info(f"Stats de lojas: {stats}")
            return stats
            
        except Exception as e:
            logger.error(f"Erro ao obter stats de lojas: {str(e)}")
            raise Exception(f"Erro ao obter estatísticas: {str(e)}") 