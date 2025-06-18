from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# === SCHEMAS DE ENTRADA ===

class LojaCreate(BaseModel):
    """Schema para criação de loja"""
    nome: str = Field(..., min_length=1, max_length=100, description="Nome da loja")
    codigo: str = Field(..., min_length=1, max_length=20, description="Código único da loja")
    empresa_id: UUID = Field(..., description="ID da empresa proprietária")
    gerente_id: Optional[UUID] = Field(None, description="ID do gerente responsável")
    endereco: Optional[str] = Field(None, max_length=500, description="Endereço completo")
    telefone: Optional[str] = Field(None, max_length=20, description="Telefone de contato")
    email: Optional[str] = Field(None, max_length=100, description="Email de contato")
    data_abertura: Optional[datetime] = Field(None, description="Data de abertura da loja")
    ativo: bool = Field(True, description="Status ativo/inativo")

class LojaUpdate(BaseModel):
    """Schema para atualização de loja"""
    nome: Optional[str] = Field(None, min_length=1, max_length=100)
    codigo: Optional[str] = Field(None, min_length=1, max_length=20)
    empresa_id: Optional[UUID] = None
    gerente_id: Optional[UUID] = None
    endereco: Optional[str] = Field(None, max_length=500)
    telefone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=100)
    data_abertura: Optional[datetime] = None
    ativo: Optional[bool] = None

# === SCHEMAS DE SAÍDA ===

class LojaResponse(BaseModel):
    """Schema completo de resposta da loja"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    nome: str
    codigo: str
    empresa_id: UUID
    gerente_id: Optional[UUID]
    endereco: Optional[str]
    telefone: Optional[str]
    email: Optional[str]
    data_abertura: Optional[datetime]
    ativo: bool
    created_at: datetime
    updated_at: datetime

class LojaListItem(BaseModel):
    """Schema simplificado para listagem de lojas"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    nome: str
    codigo: str
    empresa_id: UUID
    ativo: bool
    telefone: Optional[str]
    email: Optional[str]

# === SCHEMAS DE FILTROS ===

class LojaFilters(BaseModel):
    """Filtros para busca de lojas"""
    nome: Optional[str] = Field(None, description="Filtro por nome (busca parcial)")
    codigo: Optional[str] = Field(None, description="Filtro por código")
    empresa_id: Optional[UUID] = Field(None, description="Filtro por empresa")
    ativo: Optional[bool] = Field(None, description="Filtro por status ativo")
    
    # Paginação
    page: int = Field(1, ge=1, description="Número da página")
    per_page: int = Field(20, ge=1, le=100, description="Itens por página")

# === SCHEMAS DE RELACIONAMENTO ===

class EmpresaSimples(BaseModel):
    """Schema simples da empresa para relacionamento"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    nome: str

class GerenteSimples(BaseModel):
    """Schema simples do gerente para relacionamento"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    nome: str

class LojaComRelacionamentos(LojaResponse):
    """Loja com dados relacionados carregados"""
    empresa: Optional[EmpresaSimples] = None
    gerente: Optional[GerenteSimples] = None 