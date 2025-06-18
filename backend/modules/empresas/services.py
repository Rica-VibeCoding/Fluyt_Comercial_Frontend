"""
Service layer para empresas e lojas - lógica de negócio e validações.
Responsabilidade: Orquestração, validações, regras de negócio.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from .repository import EmpresaRepository
from .schemas import (
    EmpresaCreate, EmpresaUpdate, EmpresaResponse, EmpresaComLojas,
    LojaCreate, LojaUpdate, LojaResponse, LojaListItem,
    EmpresaFilters, LojaFilters
)

# Configurar logger
logger = logging.getLogger(__name__)


class EmpresaService:
    """
    Service layer para empresas e lojas - lógica de negócio
    
    Responsabilidade: Validações, regras de negócio, orquestração
    """
    
    def __init__(self, supabase_client):
        self.repository = EmpresaRepository(supabase_client)
    
    # ===== OPERAÇÕES DE EMPRESAS =====
    
    async def listar_empresas(self, filters: Optional[EmpresaFilters] = None, skip: int = 0, limit: int = 50) -> List[EmpresaResponse]:
        """
        Lista empresas com filtros aplicados
        
        Args:
            filters: Filtros opcionais
            skip: Paginação - registros a pular
            limit: Paginação - limite de registros
            
        Returns:
            List[EmpresaResponse]: Lista de empresas
        """
        try:
            # Buscar empresas
            empresas_data = await self.repository.listar_empresas(filters, skip, limit)
            
            # Converter para EmpresaResponse
            empresas = []
            for empresa_data in empresas_data:
                empresa = EmpresaResponse(**empresa_data)
                empresas.append(empresa)
            
            logger.debug(f"Listadas {len(empresas)} empresas")
            return empresas
            
        except Exception as e:
            logger.error(f"Erro ao listar empresas: {str(e)}")
            raise Exception(f"Erro ao listar empresas: {str(e)}")
    
    async def obter_empresa(self, empresa_id: str) -> EmpresaResponse:
        """
        Obtém empresa por ID
        
        Args:
            empresa_id: ID da empresa
            
        Returns:
            EmpresaResponse: Empresa encontrada
        """
        try:
            # Buscar empresa
            empresa_data = await self.repository.obter_empresa(empresa_id)
            
            if not empresa_data:
                raise Exception("Empresa não encontrada")
            
            # Retornar como EmpresaResponse
            return EmpresaResponse(**empresa_data)
            
        except Exception as e:
            logger.error(f"Erro ao obter empresa {empresa_id}: {str(e)}")
            raise Exception(f"Erro ao obter empresa: {str(e)}")
    
    async def obter_empresa_com_lojas(self, empresa_id: str) -> EmpresaComLojas:
        """
        Obtém empresa com todas suas lojas
        
        Args:
            empresa_id: ID da empresa
            
        Returns:
            EmpresaComLojas: Empresa com lojas
        """
        try:
            # Buscar empresa com lojas
            empresa_data = await self.repository.obter_empresa_com_lojas(empresa_id)
            
            if not empresa_data:
                raise Exception("Empresa não encontrada")
            
            # Converter lojas para LojaResponse
            lojas = []
            for loja_data in empresa_data.get('lojas', []):
                loja = LojaResponse(**loja_data)
                lojas.append(loja)
            
            # Criar EmpresaComLojas
            empresa_com_lojas = EmpresaComLojas(
                id=empresa_data['id'],
                nome=empresa_data['nome'],
                cnpj=empresa_data['cnpj'],
                email=empresa_data.get('email'),
                telefone=empresa_data.get('telefone'),
                endereco=empresa_data.get('endereco'),
                ativo=empresa_data['ativo'],
                created_at=empresa_data['created_at'],
                updated_at=empresa_data['updated_at'],
                lojas=lojas,
                total_lojas=len(lojas)
            )
            
            logger.debug(f"Empresa {empresa_id} carregada com {len(lojas)} lojas")
            return empresa_com_lojas
            
        except Exception as e:
            logger.error(f"Erro ao obter empresa com lojas {empresa_id}: {str(e)}")
            raise Exception(f"Erro ao obter empresa com lojas: {str(e)}")
    
    async def criar_empresa(self, empresa_data: EmpresaCreate) -> EmpresaResponse:
        """
        Cria nova empresa
        
        Args:
            empresa_data: Dados da empresa a ser criada
            
        Returns:
            EmpresaResponse: Empresa criada
        """
        try:
            # Validar CNPJ único
            cnpj_duplicado = await self.repository.verificar_cnpj_duplicado(empresa_data.cnpj)
            if cnpj_duplicado:
                raise Exception(f"CNPJ {empresa_data.cnpj} já está cadastrado no sistema")
            
            # Converter para dict
            empresa_dict = empresa_data.dict()
            
            # Criar empresa
            empresa_criada = await self.repository.criar_empresa(empresa_dict)
            
            logger.info(f"Empresa '{empresa_criada['nome']}' criada com sucesso")
            return EmpresaResponse(**empresa_criada)
            
        except Exception as e:
            logger.error(f"Erro ao criar empresa: {str(e)}")
            raise Exception(f"Erro ao criar empresa: {str(e)}")
    
    async def atualizar_empresa(self, empresa_id: str, empresa_data: EmpresaUpdate) -> EmpresaResponse:
        """
        Atualiza empresa existente
        
        Args:
            empresa_id: ID da empresa
            empresa_data: Dados para atualização
            
        Returns:
            EmpresaResponse: Empresa atualizada
        """
        try:
            # Verificar se empresa existe
            empresa_existente = await self.repository.obter_empresa(empresa_id)
            if not empresa_existente:
                raise Exception("Empresa não encontrada")
            
            # Validar CNPJ único (se sendo alterado)
            if empresa_data.cnpj and empresa_data.cnpj != empresa_existente.get('cnpj'):
                cnpj_duplicado = await self.repository.verificar_cnpj_duplicado(
                    empresa_data.cnpj, 
                    empresa_id
                )
                if cnpj_duplicado:
                    raise Exception(f"CNPJ {empresa_data.cnpj} já está cadastrado no sistema")
            
            # Converter para dict (apenas campos não None)
            empresa_dict = empresa_data.dict(exclude_none=True)
            
            # Atualizar empresa
            empresa_atualizada = await self.repository.atualizar_empresa(empresa_id, empresa_dict)
            
            logger.info(f"Empresa '{empresa_atualizada['nome']}' atualizada com sucesso")
            return EmpresaResponse(**empresa_atualizada)
            
        except Exception as e:
            logger.error(f"Erro ao atualizar empresa {empresa_id}: {str(e)}")
            raise Exception(f"Erro ao atualizar empresa: {str(e)}")
    
    async def excluir_empresa(self, empresa_id: str) -> Dict[str, Any]:
        """
        Exclui empresa (soft delete)
        
        Args:
            empresa_id: ID da empresa
            
        Returns:
            Dict: Resultado da operação
        """
        try:
            # Verificar se empresa existe
            empresa_existente = await self.repository.obter_empresa(empresa_id)
            if not empresa_existente:
                raise Exception("Empresa não encontrada")
            
            # Excluir empresa (soft delete)
            sucesso = await self.repository.excluir_empresa(empresa_id)
            
            if sucesso:
                logger.info(f"Empresa '{empresa_existente['nome']}' excluída com sucesso")
                return {
                    "sucesso": True,
                    "mensagem": f"Empresa '{empresa_existente['nome']}' foi desativada",
                    "empresa_id": empresa_id
                }
            else:
                raise Exception("Falha ao excluir empresa")
                
        except Exception as e:
            logger.error(f"Erro ao excluir empresa {empresa_id}: {str(e)}")
            raise Exception(f"Erro ao excluir empresa: {str(e)}")
    
    async def alternar_status_empresa(self, empresa_id: str, ativo: bool) -> EmpresaResponse:
        """
        Alterna status ativo/inativo da empresa
        
        Args:
            empresa_id: ID da empresa
            ativo: Novo status
            
        Returns:
            EmpresaResponse: Empresa com status atualizado
        """
        try:
            # Verificar se empresa existe
            empresa_existente = await self.repository.obter_empresa(empresa_id)
            if not empresa_existente:
                raise Exception("Empresa não encontrada")
            
            # Alterar status
            empresa_atualizada = await self.repository.alternar_status_empresa(empresa_id, ativo)
            
            status_texto = "ativada" if ativo else "desativada"
            logger.info(f"Empresa '{empresa_atualizada['nome']}' {status_texto}")
            
            return EmpresaResponse(**empresa_atualizada)
            
        except Exception as e:
            logger.error(f"Erro ao alterar status empresa {empresa_id}: {str(e)}")
            raise Exception(f"Erro ao alterar status empresa: {str(e)}")
    
    # ===== OPERAÇÕES DE LOJAS =====
    
    async def listar_lojas(self, filters: Optional[LojaFilters] = None, skip: int = 0, limit: int = 50) -> List[LojaListItem]:
        """
        Lista lojas com filtros aplicados
        
        Args:
            filters: Filtros opcionais
            skip: Paginação - registros a pular
            limit: Paginação - limite de registros
            
        Returns:
            List[LojaListItem]: Lista de lojas
        """
        try:
            # Buscar lojas
            lojas_data = await self.repository.listar_lojas(filters, skip, limit)
            
            # Converter para LojaListItem
            lojas = []
            for loja_data in lojas_data:
                # Extrair nome da empresa do JOIN
                empresa_nome = None
                if 'cad_empresas' in loja_data and loja_data['cad_empresas']:
                    empresa_nome = loja_data['cad_empresas']['nome']
                
                loja_item = LojaListItem(
                    id=loja_data['id'],
                    nome=loja_data['nome'],
                    codigo=loja_data['codigo'],
                    empresa_id=loja_data['empresa_id'],
                    empresa_nome=empresa_nome,
                    gerente_id=loja_data.get('gerente_id'),
                    ativo=loja_data['ativo'],
                    created_at=loja_data['created_at']
                )
                lojas.append(loja_item)
            
            logger.debug(f"Listadas {len(lojas)} lojas")
            return lojas
            
        except Exception as e:
            logger.error(f"Erro ao listar lojas: {str(e)}")
            raise Exception(f"Erro ao listar lojas: {str(e)}")
    
    async def listar_lojas_por_empresa(self, empresa_id: str) -> List[LojaResponse]:
        """
        Lista lojas de uma empresa específica
        
        Args:
            empresa_id: ID da empresa
            
        Returns:
            List[LojaResponse]: Lista de lojas da empresa
        """
        try:
            # Buscar lojas da empresa
            lojas_data = await self.repository.listar_lojas_por_empresa(empresa_id)
            
            # Converter para LojaResponse
            lojas = []
            for loja_data in lojas_data:
                loja = LojaResponse(**loja_data)
                lojas.append(loja)
            
            logger.debug(f"Listadas {len(lojas)} lojas da empresa {empresa_id}")
            return lojas
            
        except Exception as e:
            logger.error(f"Erro ao listar lojas da empresa {empresa_id}: {str(e)}")
            raise Exception(f"Erro ao listar lojas da empresa: {str(e)}")
    
    # ===== OPERAÇÕES DE ESTATÍSTICAS =====
    
    async def obter_estatisticas_empresas(self) -> Dict[str, Any]:
        """
        Obtém estatísticas gerais das empresas
        
        Returns:
            Dict com estatísticas
        """
        try:
            # Buscar todas as empresas ativas
            empresas_ativas = await self.repository.listar_empresas(
                EmpresaFilters(ativo=True), 
                skip=0, 
                limit=1000
            )
            
            # Buscar todas as lojas ativas
            lojas_ativas = await self.repository.listar_lojas(
                LojaFilters(ativo=True), 
                skip=0, 
                limit=1000
            )
            
            # Calcular estatísticas
            total_empresas = len(empresas_ativas)
            total_lojas = len(lojas_ativas)
            media_lojas_por_empresa = round(total_lojas / total_empresas, 2) if total_empresas > 0 else 0
            
            # Empresas com mais lojas
            empresas_com_lojas = {}
            for loja in lojas_ativas:
                empresa_id = loja['empresa_id']
                if empresa_id not in empresas_com_lojas:
                    empresas_com_lojas[empresa_id] = 0
                empresas_com_lojas[empresa_id] += 1
            
            empresa_com_mais_lojas = max(empresas_com_lojas.values()) if empresas_com_lojas else 0
            
            estatisticas = {
                "total_empresas_ativas": total_empresas,
                "total_lojas_ativas": total_lojas,
                "media_lojas_por_empresa": media_lojas_por_empresa,
                "empresa_com_mais_lojas": empresa_com_mais_lojas,
                "timestamp": datetime.now().isoformat()
            }
            
            logger.debug(f"Estatísticas calculadas: {estatisticas}")
            return estatisticas
            
        except Exception as e:
            logger.error(f"Erro ao calcular estatísticas: {str(e)}")
            raise Exception(f"Erro ao calcular estatísticas: {str(e)}")
    
    # ===== VALIDAÇÕES =====
    
    async def validar_dados_empresa(self, empresa_data: EmpresaCreate) -> Dict[str, Any]:
        """
        Valida dados de empresa antes da criação/atualização
        
        Args:
            empresa_data: Dados da empresa
            
        Returns:
            Dict com resultado da validação
        """
        try:
            validacao = {
                "valido": True,
                "erros": []
            }
            
            # Validar CNPJ único (implementar se necessário)
            # cnpj_existe = await self.repository.verificar_cnpj_existente(empresa_data.cnpj)
            # if cnpj_existe:
            #     validacao["valido"] = False
            #     validacao["erros"].append("CNPJ já cadastrado")
            
            return validacao
            
        except Exception as e:
            logger.error(f"Erro na validação: {str(e)}")
            return {
                "valido": False,
                "erros": [f"Erro na validação: {str(e)}"]
            } 