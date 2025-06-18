# Pydantic models for equipe - DADOS REAIS SUPABASE
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import date
from decimal import Decimal

# Enums baseados nos dados reais
PerfilType = Literal["VENDEDOR", "GERENTE", "ADMINISTRADOR", "MEDIDOR"]
NivelAcessoType = Literal["USUARIO", "GERENTE", "ADMINISTRADOR"]

class EquipeBase(BaseModel):
    nome: str = Field(..., min_length=1, max_length=100, description="Nome completo do funcionário")
    email: Optional[EmailStr] = Field(None, description="Email do funcionário")
    telefone: Optional[str] = Field(None, max_length=20, description="Telefone com formatação")
    setor_id: str = Field(..., description="UUID do setor")
    loja_id: str = Field(..., description="UUID da loja")
    salario: Optional[Decimal] = Field(None, ge=0, description="Salário base")
    data_admissao: Optional[date] = Field(None, description="Data de admissão")
    ativo: bool = Field(True, description="Se funcionário está ativo")
    nivel_acesso: NivelAcessoType = Field("USUARIO", description="Nível de acesso no sistema")
    perfil: PerfilType = Field("VENDEDOR", description="Perfil/função do funcionário")
    
    # Campos específicos de vendas/comissão
    limite_desconto: Optional[Decimal] = Field(None, ge=0, le=1, description="Limite de desconto (0-1)")
    comissao_percentual_vendedor: Optional[Decimal] = Field(None, ge=0, le=1, description="% comissão vendedor")
    comissao_percentual_gerente: Optional[Decimal] = Field(None, ge=0, le=1, description="% comissão gerente")
    override_comissao: Optional[Decimal] = Field(None, ge=0, description="Override de comissão")
    tem_minimo_garantido: bool = Field(False, description="Se tem mínimo garantido")
    valor_minimo_garantido: Optional[Decimal] = Field(None, ge=0, description="Valor mínimo garantido")
    valor_medicao: Optional[Decimal] = Field(None, ge=0, description="Valor por medição")

class EquipeCreate(EquipeBase):
    """Schema para criação de funcionário"""
    pass

class EquipeUpdate(BaseModel):
    """Schema para atualização (todos campos opcionais)"""
    nome: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    telefone: Optional[str] = Field(None, max_length=20)
    setor_id: Optional[str] = None
    loja_id: Optional[str] = None
    salario: Optional[Decimal] = Field(None, ge=0)
    data_admissao: Optional[date] = None
    ativo: Optional[bool] = None
    nivel_acesso: Optional[NivelAcessoType] = None
    perfil: Optional[PerfilType] = None
    limite_desconto: Optional[Decimal] = Field(None, ge=0, le=1)
    comissao_percentual_vendedor: Optional[Decimal] = Field(None, ge=0, le=1)
    comissao_percentual_gerente: Optional[Decimal] = Field(None, ge=0, le=1)
    override_comissao: Optional[Decimal] = Field(None, ge=0)
    tem_minimo_garantido: Optional[bool] = None
    valor_minimo_garantido: Optional[Decimal] = Field(None, ge=0)
    valor_medicao: Optional[Decimal] = Field(None, ge=0)

class EquipeResponse(EquipeBase):
    """Schema para resposta (inclui campos do banco)"""
    id: str = Field(..., description="UUID do funcionário")
    created_at: Optional[str] = Field(None, description="Data de criação")
    updated_at: Optional[str] = Field(None, description="Data de atualização")
    
    # Relacionamentos (para joins)
    setor_nome: Optional[str] = Field(None, description="Nome do setor")
    loja_nome: Optional[str] = Field(None, description="Nome da loja")
    
    class Config:
        from_attributes = True

class EquipeListResponse(BaseModel):
    """Schema para listagem com metadados"""
    funcionarios: list[EquipeResponse]
    total: int
    ativos: int
    inativos: int
    por_loja: dict[str, int]
    por_setor: dict[str, int]

class EquipeStatusToggleResponse(BaseModel):
    """Schema para resposta de toggle de status"""
    id: str
    nome: str
    ativo: bool
    message: str
