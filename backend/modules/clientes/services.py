"""
Service layer para clientes - lógica de negócio e validações.
Responsabilidade: Orquestração, validações, regras de negócio.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from .repository import ClienteRepository
from .schemas import ClienteCreate, ClienteUpdate, ClienteResponse, ClienteListItem, ClienteFilters

# Configurar logger
logger = logging.getLogger(__name__)


class ClienteService:
    """
    Service layer para clientes - lógica de negócio
    
    Responsabilidade: Validações, regras de negócio, orquestração
    """
    
    def __init__(self, supabase_client):
        self.repository = ClienteRepository(supabase_client)
    
    async def criar_cliente(self, cliente_data: ClienteCreate, current_user: Dict[str, Any]) -> ClienteResponse:
        """
        Cria um novo cliente com validações de negócio
        
        Args:
            cliente_data: Dados do cliente
            current_user: Usuário logado (contém loja_id)
            
        Returns:
            ClienteResponse: Cliente criado
        """
        try:
            loja_id = current_user['loja_id']
            
            logger.info(f"Criando cliente {cliente_data.nome} na loja {loja_id}")
            
            # Validar se CPF/CNPJ já existe na loja
            cpf_cnpj_existe = await self.repository.verificar_cpf_cnpj_existente(
                cliente_data.cpf_cnpj, 
                loja_id
            )
            
            if cpf_cnpj_existe:
                raise Exception(f"CPF/CNPJ {cliente_data.cpf_cnpj} já está cadastrado nesta loja")
            
            # Preparar dados para inserção
            dados_cliente = {
                'nome': cliente_data.nome,
                'cpf_cnpj': cliente_data.cpf_cnpj,
                'telefone': cliente_data.telefone,
                'email': cliente_data.email,
                'endereco': cliente_data.endereco,
                'logradouro': cliente_data.logradouro,
                'numero': cliente_data.numero,
                'complemento': cliente_data.complemento,
                'bairro': cliente_data.bairro,
                'cidade': cliente_data.cidade,
                'uf': cliente_data.uf,
                'cep': cliente_data.cep,
                'rg_ie': cliente_data.rg_ie,
                'tipo_venda': cliente_data.tipo_venda.value,
                'procedencia_id': cliente_data.procedencia_id,
                'vendedor_id': cliente_data.vendedor_id,
                'observacoes': cliente_data.observacoes
            }
            
            # Criar cliente
            cliente_criado = await self.repository.criar_cliente(dados_cliente, loja_id)
            
            logger.info(f"Cliente {cliente_data.nome} criado com sucesso: ID {cliente_criado['id']}")
            
            # Retornar como ClienteResponse
            return ClienteResponse(**cliente_criado)
            
        except Exception as e:
            logger.error(f"Erro ao criar cliente: {str(e)}")
            raise Exception(f"Erro ao criar cliente: {str(e)}")
    
    async def listar_clientes(self, filters: Optional[ClienteFilters], current_user: Dict[str, Any], skip: int = 0, limit: int = 50) -> List[ClienteListItem]:
        """
        Lista clientes com filtros aplicados
        
        Args:
            filters: Filtros opcionais
            current_user: Usuário logado
            skip: Paginação - registros a pular
            limit: Paginação - limite de registros
            
        Returns:
            List[ClienteListItem]: Lista de clientes
        """
        try:
            loja_id = current_user['loja_id']
            
            # Buscar clientes
            clientes_data = await self.repository.listar_clientes(loja_id, filters, skip, limit)
            
            # Converter para ClienteListItem
            clientes = []
            for cliente_data in clientes_data:
                cliente_item = ClienteListItem(
                    id=cliente_data['id'],
                    nome=cliente_data['nome'],
                    telefone=cliente_data['telefone'],
                    email=cliente_data.get('email'),
                    cidade=cliente_data['cidade'],
                    tipo_venda=cliente_data['tipo_venda'],
                    procedencia_id=cliente_data.get('procedencia_id'),
                    created_at=cliente_data['created_at']
                )
                clientes.append(cliente_item)
            
            logger.debug(f"Listados {len(clientes)} clientes da loja {loja_id}")
            return clientes
            
        except Exception as e:
            logger.error(f"Erro ao listar clientes: {str(e)}")
            raise Exception(f"Erro ao listar clientes: {str(e)}")
    
    async def obter_cliente(self, cliente_id: str, current_user: Dict[str, Any]) -> ClienteResponse:
        """
        Obtém cliente por ID
        
        Args:
            cliente_id: ID do cliente
            current_user: Usuário logado
            
        Returns:
            ClienteResponse: Cliente encontrado
        """
        try:
            loja_id = current_user['loja_id']
            
            # Buscar cliente
            cliente_data = await self.repository.obter_cliente(cliente_id, loja_id)
            
            if not cliente_data:
                raise Exception("Cliente não encontrado")
            
            # Retornar como ClienteResponse
            return ClienteResponse(**cliente_data)
            
        except Exception as e:
            logger.error(f"Erro ao obter cliente {cliente_id}: {str(e)}")
            raise Exception(f"Erro ao obter cliente: {str(e)}")
    
    async def atualizar_cliente(self, cliente_id: str, cliente_data: ClienteUpdate, current_user: Dict[str, Any]) -> ClienteResponse:
        """
        Atualiza cliente existente
        
        Args:
            cliente_id: ID do cliente
            cliente_data: Dados de atualização
            current_user: Usuário logado
            
        Returns:
            ClienteResponse: Cliente atualizado
        """
        try:
            loja_id = current_user['loja_id']
            
            # Verificar se cliente existe
            cliente_atual = await self.repository.obter_cliente(cliente_id, loja_id)
            if not cliente_atual:
                raise Exception("Cliente não encontrado")
            
            # Preparar dados de atualização (apenas campos fornecidos)
            dados_atualizacao = {}
            
            if cliente_data.nome is not None:
                dados_atualizacao['nome'] = cliente_data.nome
            
            if cliente_data.telefone is not None:
                dados_atualizacao['telefone'] = cliente_data.telefone
            
            if cliente_data.email is not None:
                dados_atualizacao['email'] = cliente_data.email
            
            if cliente_data.endereco is not None:
                dados_atualizacao['endereco'] = cliente_data.endereco
                
            if cliente_data.logradouro is not None:
                dados_atualizacao['logradouro'] = cliente_data.logradouro
                
            if cliente_data.numero is not None:
                dados_atualizacao['numero'] = cliente_data.numero
                
            if cliente_data.complemento is not None:
                dados_atualizacao['complemento'] = cliente_data.complemento
                
            if cliente_data.bairro is not None:
                dados_atualizacao['bairro'] = cliente_data.bairro
            
            if cliente_data.cidade is not None:
                dados_atualizacao['cidade'] = cliente_data.cidade
                
            if cliente_data.uf is not None:
                dados_atualizacao['uf'] = cliente_data.uf
            
            if cliente_data.cep is not None:
                dados_atualizacao['cep'] = cliente_data.cep
                
            if cliente_data.rg_ie is not None:
                dados_atualizacao['rg_ie'] = cliente_data.rg_ie
            
            if cliente_data.tipo_venda is not None:
                dados_atualizacao['tipo_venda'] = cliente_data.tipo_venda.value
            
            if cliente_data.procedencia_id is not None:
                dados_atualizacao['procedencia_id'] = cliente_data.procedencia_id
                
            if cliente_data.vendedor_id is not None:
                dados_atualizacao['vendedor_id'] = cliente_data.vendedor_id
            
            if cliente_data.observacoes is not None:
                dados_atualizacao['observacoes'] = cliente_data.observacoes
            
            # Atualizar apenas se há dados para atualizar
            if dados_atualizacao:
                cliente_atualizado = await self.repository.atualizar_cliente(
                    cliente_id, 
                    dados_atualizacao, 
                    loja_id
                )
                
                logger.info(f"Cliente {cliente_id} atualizado com sucesso")
                return ClienteResponse(**cliente_atualizado)
            else:
                # Sem alterações, retornar cliente atual
                return ClienteResponse(**cliente_atual)
            
        except Exception as e:
            logger.error(f"Erro ao atualizar cliente {cliente_id}: {str(e)}")
            raise Exception(f"Erro ao atualizar cliente: {str(e)}")
    
    async def excluir_cliente(self, cliente_id: str, current_user: Dict[str, Any]) -> bool:
        """
        Exclui cliente com validações de negócio
        
        Args:
            cliente_id: ID do cliente
            current_user: Usuário logado
            
        Returns:
            bool: True se excluído com sucesso
        """
        try:
            loja_id = current_user['loja_id']
            
            # Verificar se cliente existe
            cliente_atual = await self.repository.obter_cliente(cliente_id, loja_id)
            if not cliente_atual:
                raise Exception("Cliente não encontrado")
            
            # TODO: Verificar se cliente tem orçamentos/contratos associados
            # Se sim, apenas marcar como inativo ou bloquear exclusão
            
            # Excluir cliente
            sucesso = await self.repository.excluir_cliente(cliente_id, loja_id)
            
            if sucesso:
                logger.info(f"Cliente {cliente_id} ({cliente_atual['nome']}) excluído com sucesso")
            
            return sucesso
            
        except Exception as e:
            logger.error(f"Erro ao excluir cliente {cliente_id}: {str(e)}")
            raise Exception(f"Erro ao excluir cliente: {str(e)}")
    
    async def buscar_cliente_por_cpf_cnpj(self, cpf_cnpj: str, current_user: Dict[str, Any]) -> Optional[ClienteResponse]:
        """
        Busca cliente por CPF/CNPJ
        
        Args:
            cpf_cnpj: CPF ou CNPJ para buscar
            current_user: Usuário logado
            
        Returns:
            ClienteResponse: Cliente encontrado ou None
        """
        try:
            loja_id = current_user['loja_id']
            
            # Buscar cliente
            cliente_data = await self.repository.buscar_cliente_por_cpf_cnpj(cpf_cnpj, loja_id)
            
            if cliente_data:
                return ClienteResponse(**cliente_data)
            else:
                return None
                
        except Exception as e:
            logger.error(f"Erro ao buscar cliente por CPF/CNPJ {cpf_cnpj}: {str(e)}")
            raise Exception(f"Erro ao buscar cliente: {str(e)}")
    
    async def validar_dados_cliente(self, cliente_data: ClienteCreate) -> Dict[str, Any]:
        """
        Valida dados do cliente aplicando regras de negócio
        
        Args:
            cliente_data: Dados do cliente para validar
            
        Returns:
            Dict com resultado da validação
        """
        try:
            erros = []
            avisos = []
            
            # Validação de CPF/CNPJ
            cpf_cnpj_limpo = ''.join(filter(str.isdigit, cliente_data.cpf_cnpj))
            if len(cpf_cnpj_limpo) not in [11, 14]:
                erros.append("CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos")
            
            # Validação de email
            if cliente_data.email and '@' not in cliente_data.email:
                erros.append("Email inválido")
            
            # Validação de CEP
            cep_limpo = ''.join(filter(str.isdigit, cliente_data.cep))
            if len(cep_limpo) != 8:
                erros.append("CEP deve ter 8 dígitos")
            
            # Validação de telefone
            telefone_limpo = ''.join(filter(str.isdigit, cliente_data.telefone))
            if len(telefone_limpo) < 10:
                avisos.append("Telefone parece estar incompleto")
            
            return {
                "valido": len(erros) == 0,
                "erros": erros,
                "avisos": avisos
            }
            
        except Exception as e:
            logger.error(f"Erro ao validar dados do cliente: {str(e)}")
            return {
                "valido": False,
                "erros": [f"Erro interno na validação: {str(e)}"],
                "avisos": []
            }
