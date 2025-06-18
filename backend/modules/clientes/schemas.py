"""
Schemas Pydantic para o módulo de Clientes.
Define modelos de validação para entrada e saída de dados.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional
from enum import Enum
import uuid
from datetime import datetime


class TipoVenda(str, Enum):
    """Tipos de venda disponíveis"""
    NORMAL = "NORMAL"
    FUTURA = "FUTURA"


# ===== SCHEMAS DE ENTRADA (REQUEST) =====

class ClienteCreate(BaseModel):
    """Schema para criação de cliente"""
    nome: str = Field(..., min_length=2, max_length=255, description="Nome completo do cliente")
    cpf_cnpj: str = Field(..., min_length=11, max_length=18, description="CPF ou CNPJ do cliente")
    telefone: str = Field(..., min_length=10, max_length=20, description="Telefone de contato")
    email: Optional[str] = Field(None, max_length=255, description="Email do cliente")
    endereco: Optional[str] = Field(None, min_length=5, max_length=500, description="Endereço completo (legado)")
    logradouro: Optional[str] = Field(None, max_length=255, description="Logradouro")
    numero: Optional[str] = Field(None, max_length=20, description="Número")
    complemento: Optional[str] = Field(None, max_length=100, description="Complemento")
    bairro: Optional[str] = Field(None, max_length=100, description="Bairro")
    cidade: str = Field(..., min_length=2, max_length=100, description="Cidade")
    uf: Optional[str] = Field(None, max_length=2, description="Estado (UF)")
    cep: str = Field(..., min_length=8, max_length=10, description="CEP")
    rg_ie: Optional[str] = Field(None, max_length=20, description="RG ou Inscrição Estadual")
    tipo_venda: TipoVenda = Field(default=TipoVenda.NORMAL, description="Tipo de venda")
    procedencia_id: Optional[str] = Field(None, description="ID da procedência/origem do cliente")
    vendedor_id: Optional[str] = Field(None, description="ID do vendedor responsável")
    observacoes: Optional[str] = Field(None, max_length=1000, description="Observações gerais")
    
    @validator('cpf_cnpj')
    def validar_cpf_cnpj(cls, v):
        """Valida formato básico de CPF/CNPJ"""
        # Remove caracteres especiais
        cpf_cnpj_limpo = ''.join(filter(str.isdigit, v))
        
        if len(cpf_cnpj_limpo) == 11:
            # CPF
            return v  # Manter formatação original
        elif len(cpf_cnpj_limpo) == 14:
            # CNPJ
            return v  # Manter formatação original
        else:
            raise ValueError("CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos")
    
    @validator('email')
    def validar_email(cls, v):
        """Validação básica de email"""
        if v and '@' not in v:
            raise ValueError("Email deve conter @")
        return v


class ClienteUpdate(BaseModel):
    """Schema para atualização de cliente"""
    nome: Optional[str] = Field(None, min_length=2, max_length=255)
    telefone: Optional[str] = Field(None, min_length=10, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    endereco: Optional[str] = Field(None, min_length=5, max_length=500)
    logradouro: Optional[str] = Field(None, max_length=255)
    numero: Optional[str] = Field(None, max_length=20)
    complemento: Optional[str] = Field(None, max_length=100)
    bairro: Optional[str] = Field(None, max_length=100)
    cidade: Optional[str] = Field(None, min_length=2, max_length=100)
    uf: Optional[str] = Field(None, max_length=2)
    cep: Optional[str] = Field(None, min_length=8, max_length=10)
    rg_ie: Optional[str] = Field(None, max_length=20)
    tipo_venda: Optional[TipoVenda] = Field(None)
    procedencia_id: Optional[str] = Field(None)
    vendedor_id: Optional[str] = Field(None)
    observacoes: Optional[str] = Field(None, max_length=1000)


# ===== SCHEMAS DE SAÍDA (RESPONSE) =====

class ClienteResponse(BaseModel):
    """Schema de resposta completo para cliente"""
    id: uuid.UUID
    nome: str
    cpf_cnpj: str
    telefone: str
    email: Optional[str]
    endereco: Optional[str]
    logradouro: Optional[str]
    numero: Optional[str]
    complemento: Optional[str]
    bairro: Optional[str]
    cidade: str
    uf: Optional[str]
    cep: str
    rg_ie: Optional[str]
    tipo_venda: TipoVenda
    procedencia_id: Optional[uuid.UUID]
    vendedor_id: Optional[uuid.UUID]
    observacoes: Optional[str]
    loja_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ClienteListItem(BaseModel):
    """Schema simplificado para listagem de clientes"""
    id: uuid.UUID
    nome: str
    telefone: str
    email: Optional[str]
    cidade: str
    tipo_venda: TipoVenda
    procedencia_id: Optional[uuid.UUID]
    created_at: datetime
    
    class Config:
        from_attributes = True


class ClienteFilters(BaseModel):
    """Schema para filtros de busca de clientes"""
    nome: Optional[str] = Field(None, description="Filtro por nome (busca parcial)")
    cpf_cnpj: Optional[str] = Field(None, description="Filtro por CPF/CNPJ")
    telefone: Optional[str] = Field(None, description="Filtro por telefone")
    cidade: Optional[str] = Field(None, description="Filtro por cidade")
    tipo_venda: Optional[TipoVenda] = Field(None, description="Filtro por tipo de venda")
    procedencia_id: Optional[str] = Field(None, description="Filtro por ID da procedência")
