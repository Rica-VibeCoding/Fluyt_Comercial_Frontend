# Repository para Equipe - DADOS REAIS SUPABASE
from modules.shared.database import get_supabase_client
from .schemas import EquipeCreate, EquipeUpdate, EquipeResponse
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class EquipeRepository:
    def __init__(self):
        self.supabase = get_supabase_client()
        self.table_name = "cad_equipe"
    
    async def list_all(self, filters: Optional[Dict[str, Any]] = None) -> List[EquipeResponse]:
        """Listar todos os funcionários com relacionamentos"""
        try:
            logger.info(f"🔍 Buscando funcionários na tabela {self.table_name}")
            
            # Query com joins para relacionamentos
            query = self.supabase.table(self.table_name).select("""
                *,
                cad_setores!setor_id(nome),
                c_lojas!loja_id(nome)
            """)
            
            # Aplicar filtros se fornecidos
            if filters:
                if "loja_id" in filters:
                    query = query.eq("loja_id", filters["loja_id"])
                if "setor_id" in filters:
                    query = query.eq("setor_id", filters["setor_id"])
                if "ativo" in filters:
                    query = query.eq("ativo", filters["ativo"])
                if "perfil" in filters:
                    query = query.eq("perfil", filters["perfil"])
            
            # Ordenar por nome
            query = query.order("nome")
            
            response = query.execute()
            
            if not response.data:
                logger.warning("⚠️ Nenhum funcionário encontrado")
                return []
            
            # Converter dados para schema de resposta
            funcionarios = []
            for item in response.data:
                funcionario_data = dict(item)
                
                # Extrair nomes dos relacionamentos
                if funcionario_data.get("cad_setores"):
                    funcionario_data["setor_nome"] = funcionario_data["cad_setores"]["nome"]
                if funcionario_data.get("c_lojas"):
                    funcionario_data["loja_nome"] = funcionario_data["c_lojas"]["nome"]
                
                # Remover objetos de relacionamento para evitar conflito
                funcionario_data.pop("cad_setores", None)
                funcionario_data.pop("c_lojas", None)
                
                funcionarios.append(EquipeResponse(**funcionario_data))
            
            logger.info(f"✅ {len(funcionarios)} funcionários carregados com sucesso")
            return funcionarios
            
        except Exception as e:
            logger.error(f"❌ Erro ao listar funcionários: {e}")
            raise Exception(f"Erro ao buscar funcionários: {str(e)}")
    
    async def get_by_id(self, funcionario_id: str) -> Optional[EquipeResponse]:
        """Buscar funcionário por ID"""
        try:
            logger.info(f"🔍 Buscando funcionário ID: {funcionario_id}")
            
            response = self.supabase.table(self.table_name).select("""
                *,
                cad_setores!setor_id(nome),
                c_lojas!loja_id(nome)
            """).eq("id", funcionario_id).execute()
            
            if not response.data:
                logger.warning(f"⚠️ Funcionário {funcionario_id} não encontrado")
                return None
            
            funcionario_data = dict(response.data[0])
            
            # Extrair nomes dos relacionamentos
            if funcionario_data.get("cad_setores"):
                funcionario_data["setor_nome"] = funcionario_data["cad_setores"]["nome"]
            if funcionario_data.get("c_lojas"):
                funcionario_data["loja_nome"] = funcionario_data["c_lojas"]["nome"]
            
            # Remover objetos de relacionamento
            funcionario_data.pop("cad_setores", None)
            funcionario_data.pop("c_lojas", None)
            
            logger.info(f"✅ Funcionário {funcionario_data['nome']} encontrado")
            return EquipeResponse(**funcionario_data)
            
        except Exception as e:
            logger.error(f"❌ Erro ao buscar funcionário {funcionario_id}: {e}")
            raise Exception(f"Erro ao buscar funcionário: {str(e)}")
    
    async def create(self, funcionario_data: EquipeCreate) -> EquipeResponse:
        """Criar novo funcionário"""
        try:
            logger.info(f"➕ Criando funcionário: {funcionario_data.nome}")
            
            # Converter para dict e preparar dados
            data = funcionario_data.model_dump()
            data["created_at"] = datetime.utcnow().isoformat()
            data["updated_at"] = datetime.utcnow().isoformat()
            
            # Converter Decimal para float para compatibilidade JSON
            for key, value in data.items():
                if hasattr(value, '__float__'):
                    data[key] = float(value)
            
            response = self.supabase.table(self.table_name).insert(data).execute()
            
            if not response.data:
                raise Exception("Falha na inserção - dados não retornados")
            
            funcionario_criado = response.data[0]
            logger.info(f"✅ Funcionário {funcionario_criado['nome']} criado com ID: {funcionario_criado['id']}")
            
            # Buscar com relacionamentos para retorno completo
            return await self.get_by_id(funcionario_criado["id"])
            
        except Exception as e:
            logger.error(f"❌ Erro ao criar funcionário: {e}")
            raise Exception(f"Erro ao criar funcionário: {str(e)}")
    
    async def update(self, funcionario_id: str, funcionario_data: EquipeUpdate) -> Optional[EquipeResponse]:
        """Atualizar funcionário existente"""
        try:
            logger.info(f"✏️ Atualizando funcionário ID: {funcionario_id}")
            
            # Converter para dict e remover campos None
            data = {k: v for k, v in funcionario_data.model_dump().items() if v is not None}
            
            if not data:
                raise Exception("Nenhum dado fornecido para atualização")
            
            data["updated_at"] = datetime.utcnow().isoformat()
            
            # Converter Decimal para float
            for key, value in data.items():
                if hasattr(value, '__float__'):
                    data[key] = float(value)
            
            response = self.supabase.table(self.table_name).update(data).eq("id", funcionario_id).execute()
            
            if not response.data:
                logger.warning(f"⚠️ Funcionário {funcionario_id} não encontrado para atualização")
                return None
            
            funcionario_atualizado = response.data[0]
            logger.info(f"✅ Funcionário {funcionario_atualizado['nome']} atualizado com sucesso")
            
            # Buscar com relacionamentos para retorno completo
            return await self.get_by_id(funcionario_id)
            
        except Exception as e:
            logger.error(f"❌ Erro ao atualizar funcionário {funcionario_id}: {e}")
            raise Exception(f"Erro ao atualizar funcionário: {str(e)}")
    
    async def delete(self, funcionario_id: str) -> bool:
        """Excluir funcionário (soft delete - marcar como inativo)"""
        try:
            logger.info(f"🗑️ Excluindo funcionário ID: {funcionario_id}")
            
            # Soft delete - apenas marcar como inativo
            data = {
                "ativo": False,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            response = self.supabase.table(self.table_name).update(data).eq("id", funcionario_id).execute()
            
            if not response.data:
                logger.warning(f"⚠️ Funcionário {funcionario_id} não encontrado para exclusão")
                return False
            
            funcionario_excluido = response.data[0]
            logger.info(f"✅ Funcionário {funcionario_excluido['nome']} marcado como inativo")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro ao excluir funcionário {funcionario_id}: {e}")
            raise Exception(f"Erro ao excluir funcionário: {str(e)}")
    
    async def toggle_status(self, funcionario_id: str) -> Optional[EquipeResponse]:
        """Alternar status ativo/inativo do funcionário"""
        try:
            logger.info(f"🔄 Alternando status do funcionário ID: {funcionario_id}")
            
            # Buscar status atual
            funcionario_atual = await self.get_by_id(funcionario_id)
            if not funcionario_atual:
                return None
            
            novo_status = not funcionario_atual.ativo
            
            # Atualizar status
            data = {
                "ativo": novo_status,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            response = self.supabase.table(self.table_name).update(data).eq("id", funcionario_id).execute()
            
            if not response.data:
                return None
            
            logger.info(f"✅ Status do funcionário {funcionario_atual.nome} alterado para: {'ATIVO' if novo_status else 'INATIVO'}")
            
            # Retornar dados atualizados
            return await self.get_by_id(funcionario_id)
            
        except Exception as e:
            logger.error(f"❌ Erro ao alternar status do funcionário {funcionario_id}: {e}")
            raise Exception(f"Erro ao alternar status: {str(e)}")
    
    async def get_stats(self) -> Dict[str, Any]:
        """Obter estatísticas da equipe"""
        try:
            logger.info("📊 Calculando estatísticas da equipe")
            
            funcionarios = await self.list_all()
            
            total = len(funcionarios)
            ativos = len([f for f in funcionarios if f.ativo])
            inativos = total - ativos
            
            # Estatísticas por loja
            por_loja = {}
            for f in funcionarios:
                loja = f.loja_nome or "Sem loja"
                por_loja[loja] = por_loja.get(loja, 0) + 1
            
            # Estatísticas por setor
            por_setor = {}
            for f in funcionarios:
                setor = f.setor_nome or "Sem setor"
                por_setor[setor] = por_setor.get(setor, 0) + 1
            
            stats = {
                "total": total,
                "ativos": ativos,
                "inativos": inativos,
                "por_loja": por_loja,
                "por_setor": por_setor,
                "ultima_atualizacao": datetime.utcnow().isoformat()
            }
            
            logger.info(f"✅ Estatísticas calculadas: {total} funcionários total")
            return stats
            
        except Exception as e:
            logger.error(f"❌ Erro ao calcular estatísticas: {e}")
            raise Exception(f"Erro ao calcular estatísticas: {str(e)}")

# Função legacy para compatibilidade
async def repo_list_equipe():
    """Função legacy para compatibilidade com controller antigo"""
    try:
        repository = EquipeRepository()
        funcionarios = await repository.list_all()
        return [funcionario.model_dump() for funcionario in funcionarios]
    except Exception as e:
        logger.error(f"❌ Erro na função legacy repo_list_equipe: {e}")
    return []
