"""
Repository para operações de empresas e lojas com Supabase.
Responsabilidade: Acesso a dados, queries, conversões.
"""

import logging
from typing import List, Dict, Any, Optional
from supabase import Client
from .schemas import EmpresaFilters, LojaFilters
from datetime import datetime

# Configurar logger
logger = logging.getLogger(__name__)


class EmpresaRepository:
    """
    Repository para operações de empresas com Supabase - APENAS DADOS REAIS
    
    Responsabilidade: Acesso a dados, queries diretas no Supabase
    Lógica de negócio: EmpresaService
    """
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
    
    # ===== OPERAÇÕES DE EMPRESAS =====
    
    async def listar_empresas(self, filters: Optional[EmpresaFilters] = None, skip: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
        """Lista empresas com filtros aplicados"""
        try:
            query = (
                self.supabase
                .table('cad_empresas')
                .select('*')
            )
            
            # Aplicar filtros se fornecidos
            if filters:
                if filters.nome:
                    query = query.ilike('nome', f'%{filters.nome}%')
                
                if filters.cnpj:
                    query = query.eq('cnpj', filters.cnpj)
                
                if filters.ativo is not None:
                    query = query.eq('ativo', filters.ativo)
            
            # Executar query com paginação
            result = (
                query
                .order('created_at', desc=True)
                .range(skip, skip + limit - 1)
                .execute()
            )
            
            logger.debug(f"Listadas {len(result.data)} empresas")
            return result.data
            
        except Exception as e:
            logger.error(f"Erro ao listar empresas: {str(e)}")
            raise Exception(f"Erro ao listar empresas: {str(e)}")
    
    async def obter_empresa(self, empresa_id: str) -> Optional[Dict[str, Any]]:
        """Obtém empresa por ID"""
        try:
            result = (
                self.supabase
                .table('cad_empresas')
                .select('*')
                .eq('id', empresa_id)
                .execute()
            )
            
            if result.data:
                logger.debug(f"Empresa {empresa_id} encontrada")
                return result.data[0]
            else:
                logger.warning(f"Empresa {empresa_id} não encontrada")
                return None
                
        except Exception as e:
            logger.error(f"Erro ao obter empresa {empresa_id}: {str(e)}")
            raise Exception(f"Erro ao obter empresa: {str(e)}")
    
    # ===== OPERAÇÕES DE LOJAS =====
    
    async def listar_lojas(self, filters: Optional[LojaFilters] = None, skip: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
        """Lista lojas com filtros aplicados, incluindo nome da empresa"""
        try:
            query = (
                self.supabase
                .table('c_lojas')
                .select('*, cad_empresas(nome)')
            )
            
            # Aplicar filtros se fornecidos
            if filters:
                if filters.nome:
                    query = query.ilike('nome', f'%{filters.nome}%')
                
                if filters.codigo:
                    query = query.ilike('codigo', f'%{filters.codigo}%')
                
                if filters.empresa_id:
                    query = query.eq('empresa_id', str(filters.empresa_id))
                
                if filters.ativo is not None:
                    query = query.eq('ativo', filters.ativo)
            
            result = (
                query
                .order('created_at', desc=True)
                .range(skip, skip + limit - 1)
                .execute()
            )
            
            logger.debug(f"Listadas {len(result.data)} lojas")
            return result.data
            
        except Exception as e:
            logger.error(f"Erro ao listar lojas: {str(e)}")
            raise Exception(f"Erro ao listar lojas: {str(e)}")
    
    async def listar_lojas_por_empresa(self, empresa_id: str) -> List[Dict[str, Any]]:
        """Lista todas as lojas de uma empresa específica"""
        try:
            result = (
                self.supabase
                .table('c_lojas')
                .select('*')
                .eq('empresa_id', empresa_id)
                .order('nome')
                .execute()
            )
            
            logger.debug(f"Encontradas {len(result.data)} lojas para empresa {empresa_id}")
            return result.data
            
        except Exception as e:
            logger.error(f"Erro ao listar lojas da empresa {empresa_id}: {str(e)}")
            raise Exception(f"Erro ao listar lojas da empresa: {str(e)}")
    
    async def obter_empresa_com_lojas(self, empresa_id: str) -> Optional[Dict[str, Any]]:
        """Obtém empresa com todas suas lojas"""
        try:
            # Buscar empresa
            empresa = await self.obter_empresa(empresa_id)
            if not empresa:
                return None
            
            # Buscar lojas da empresa
            lojas = await self.listar_lojas_por_empresa(empresa_id)
            
            # Combinar dados
            empresa['lojas'] = lojas
            empresa['total_lojas'] = len(lojas)
            
            return empresa
            
        except Exception as e:
            logger.error(f"Erro ao obter empresa com lojas {empresa_id}: {str(e)}")
            raise Exception(f"Erro ao obter empresa com lojas: {str(e)}")

    # ===== OPERAÇÕES DE ESCRITA =====
    
    async def criar_empresa(self, empresa_data: Dict[str, Any]) -> Dict[str, Any]:
        """Cria nova empresa no banco"""
        try:
            # Preparar dados para inserção
            dados_insercao = {
                'nome': empresa_data['nome'],
                'cnpj': empresa_data['cnpj'],
                'email': empresa_data.get('email'),
                'telefone': empresa_data.get('telefone'),
                'endereco': empresa_data.get('endereco'),
                'ativo': empresa_data.get('ativo', True),
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            # Inserir empresa
            result = (
                self.supabase
                .table('cad_empresas')
                .insert(dados_insercao)
                .execute()
            )
            
            if result.data:
                logger.info(f"Empresa criada com sucesso: {result.data[0]['id']}")
                return result.data[0]
            else:
                raise Exception("Falha ao criar empresa - nenhum dado retornado")
                
        except Exception as e:
            logger.error(f"Erro ao criar empresa: {str(e)}")
            raise Exception(f"Erro ao criar empresa: {str(e)}")
    
    async def atualizar_empresa(self, empresa_id: str, empresa_data: Dict[str, Any]) -> Dict[str, Any]:
        """Atualiza empresa existente"""
        try:
            # Preparar dados para atualização (apenas campos não None)
            dados_atualizacao = {
                'updated_at': datetime.utcnow().isoformat()
            }
            
            # Adicionar apenas campos fornecidos
            for campo in ['nome', 'cnpj', 'email', 'telefone', 'endereco', 'ativo']:
                if campo in empresa_data and empresa_data[campo] is not None:
                    dados_atualizacao[campo] = empresa_data[campo]
            
            # Atualizar empresa
            result = (
                self.supabase
                .table('cad_empresas')
                .update(dados_atualizacao)
                .eq('id', empresa_id)
                .execute()
            )
            
            if result.data:
                logger.info(f"Empresa {empresa_id} atualizada com sucesso")
                return result.data[0]
            else:
                raise Exception("Empresa não encontrada para atualização")
                
        except Exception as e:
            logger.error(f"Erro ao atualizar empresa {empresa_id}: {str(e)}")
            raise Exception(f"Erro ao atualizar empresa: {str(e)}")
    
    async def excluir_empresa(self, empresa_id: str) -> bool:
        """Exclui empresa (soft delete)"""
        try:
            # Verificar se empresa tem lojas ativas
            lojas = await self.listar_lojas_por_empresa(empresa_id)
            lojas_ativas = [loja for loja in lojas if loja.get('ativo', True)]
            
            if lojas_ativas:
                raise Exception(f"Não é possível excluir empresa com {len(lojas_ativas)} lojas ativas")
            
            # Fazer soft delete (marcar como inativo)
            result = (
                self.supabase
                .table('cad_empresas')
                .update({
                    'ativo': False,
                    'updated_at': datetime.utcnow().isoformat()
                })
                .eq('id', empresa_id)
                .execute()
            )
            
            if result.data:
                logger.info(f"Empresa {empresa_id} marcada como inativa")
                return True
            else:
                raise Exception("Empresa não encontrada para exclusão")
                
        except Exception as e:
            logger.error(f"Erro ao excluir empresa {empresa_id}: {str(e)}")
            raise Exception(f"Erro ao excluir empresa: {str(e)}")
    
    async def alternar_status_empresa(self, empresa_id: str, ativo: bool) -> Dict[str, Any]:
        """Alterna status ativo/inativo da empresa"""
        try:
            result = (
                self.supabase
                .table('cad_empresas')
                .update({
                    'ativo': ativo,
                    'updated_at': datetime.utcnow().isoformat()
                })
                .eq('id', empresa_id)
                .execute()
            )
            
            if result.data:
                status_texto = "ativada" if ativo else "desativada"
                logger.info(f"Empresa {empresa_id} {status_texto}")
                return result.data[0]
            else:
                raise Exception("Empresa não encontrada")
                
        except Exception as e:
            logger.error(f"Erro ao alterar status empresa {empresa_id}: {str(e)}")
            raise Exception(f"Erro ao alterar status empresa: {str(e)}")
    
    async def verificar_cnpj_duplicado(self, cnpj: str, empresa_id: Optional[str] = None) -> bool:
        """Verifica se CNPJ já existe (para validação de unicidade)"""
        try:
            query = (
                self.supabase
                .table('cad_empresas')
                .select('id')
                .eq('cnpj', cnpj)
            )
            
            # Se estiver atualizando, excluir a própria empresa da verificação
            if empresa_id:
                query = query.neq('id', empresa_id)
            
            result = query.execute()
            
            existe_duplicado = len(result.data) > 0
            if existe_duplicado:
                logger.warning(f"CNPJ {cnpj} já existe no sistema")
            
            return existe_duplicado
            
        except Exception as e:
            logger.error(f"Erro ao verificar CNPJ duplicado: {str(e)}")
            return False  # Em caso de erro, permitir operação
