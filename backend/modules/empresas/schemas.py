"""
Schemas Pydantic para o módulo de Empresas.
Define modelos de validação para entrada e saída de dados.
Baseado na estrutura real das tabelas: cad_empresas e c_lojas
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List
import uuid
from datetime import datetime, date


# ===== SCHEMAS DE ENTRADA (REQUEST) =====

class EmpresaCreate(BaseModel):
    """Schema para criação de empresa"""
    nome: str = Field(..., min_length=2, max_length=255, description="Nome da empresa")
    cnpj: str = Field(..., min_length=14, max_length=18, description="CNPJ da empresa")
    email: Optional[str] = Field(None, max_length=255, description="Email da empresa")
    telefone: Optional[str] = Field(None, max_length=20, description="Telefone da empresa")
    endereco: Optional[str] = Field(None, max_length=500, description="Endereço da empresa")
    ativo: bool = Field(default=True, description="Status ativo/inativo")
    
    @validator('cnpj')
    def validar_cnpj(cls, v):
        """Valida formato básico de CNPJ"""
        cnpj_limpo = ''.join(filter(str.isdigit, v))
        if len(cnpj_limpo) != 14:
            raise ValueError("CNPJ deve ter 14 dígitos")
        return v
    
    @validator('email')
    def validar_email(cls, v):
        """Validação básica de email"""
        if v and '@' not in v:
            raise ValueError("Email deve conter @")
        return v


class EmpresaUpdate(BaseModel):
    """Schema para atualização de empresa"""
    nome: Optional[str] = Field(None, min_length=2, max_length=255)
    cnpj: Optional[str] = Field(None, min_length=14, max_length=18)
    email: Optional[str] = Field(None, max_length=255)
    telefone: Optional[str] = Field(None, max_length=20)
    endereco: Optional[str] = Field(None, max_length=500)
    ativo: Optional[bool] = Field(None)


class LojaCreate(BaseModel):
    """Schema para criação de loja"""
    nome: str = Field(..., min_length=2, max_length=255, description="Nome da loja")
    codigo: str = Field(..., min_length=2, max_length=20, description="Código da loja")
    empresa_id: uuid.UUID = Field(..., description="ID da empresa proprietária")
    gerente_id: Optional[uuid.UUID] = Field(None, description="ID do gerente da loja")
    endereco: Optional[str] = Field(None, max_length=500, description="Endereço da loja")
    telefone: Optional[str] = Field(None, max_length=20, description="Telefone da loja")
    email: Optional[str] = Field(None, max_length=255, description="Email da loja")
    data_abertura: Optional[date] = Field(None, description="Data de abertura da loja")
    ativo: bool = Field(default=True, description="Status ativo/inativo")


class LojaUpdate(BaseModel):
    """Schema para atualização de loja"""
    nome: Optional[str] = Field(None, min_length=2, max_length=255)
    codigo: Optional[str] = Field(None, min_length=2, max_length=20)
    gerente_id: Optional[uuid.UUID] = Field(None)
    endereco: Optional[str] = Field(None, max_length=500)
    telefone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    data_abertura: Optional[date] = Field(None)
    ativo: Optional[bool] = Field(None)


# ===== SCHEMAS DE SAÍDA (RESPONSE) =====

class EmpresaResponse(BaseModel):
    """Schema de resposta completo para empresa"""
    id: uuid.UUID
    nome: str
    cnpj: str
    email: Optional[str]
    telefone: Optional[str]
    endereco: Optional[str]
    ativo: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class LojaResponse(BaseModel):
    """Schema de resposta completo para loja"""
    id: uuid.UUID
    nome: str
    codigo: str
    empresa_id: uuid.UUID
    gerente_id: Optional[uuid.UUID]
    endereco: Optional[str]
    telefone: Optional[str]
    email: Optional[str]
    data_abertura: Optional[date]
    ativo: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class EmpresaComLojas(EmpresaResponse):
    """Schema de empresa com suas lojas"""
    lojas: List[LojaResponse] = Field(default_factory=list)
    total_lojas: int = Field(default=0)


class LojaListItem(BaseModel):
    """Schema simplificado para listagem de lojas"""
    id: uuid.UUID
    nome: str
    codigo: str
    empresa_id: uuid.UUID
    empresa_nome: Optional[str]
    gerente_id: Optional[uuid.UUID]
    ativo: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ===== SCHEMAS DE FILTROS =====

class EmpresaFilters(BaseModel):
    """Schema para filtros de busca de empresas"""
    nome: Optional[str] = Field(None, description="Filtro por nome (busca parcial)")
    cnpj: Optional[str] = Field(None, description="Filtro por CNPJ")
    ativo: Optional[bool] = Field(None, description="Filtro por status ativo")


class LojaFilters(BaseModel):
    """Schema para filtros de busca de lojas"""
    nome: Optional[str] = Field(None, description="Filtro por nome (busca parcial)")
    codigo: Optional[str] = Field(None, description="Filtro por código")
    empresa_id: Optional[uuid.UUID] = Field(None, description="Filtro por empresa")
    gerente_id: Optional[uuid.UUID] = Field(None, description="Filtro por gerente")
    ativo: Optional[bool] = Field(None, description="Filtro por status ativo") 