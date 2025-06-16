"""
Schemas para autenticação.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class LoginRequest(BaseModel):
    """Schema para requisição de login."""
    email: EmailStr = Field(..., description="Email do usuário")
    password: str = Field(..., min_length=6, description="Senha do usuário")
    

class LoginResponse(BaseModel):
    """Schema para resposta de login."""
    access_token: str = Field(..., description="JWT token de acesso")
    token_type: str = Field(default="bearer", description="Tipo do token")
    expires_in: int = Field(..., description="Tempo de expiração em segundos")
    user: dict = Field(..., description="Dados do usuário logado")
    

class UserInfo(BaseModel):
    """Informações do usuário autenticado."""
    user_id: str = Field(..., description="ID único do usuário")
    email: str = Field(..., description="Email do usuário")
    nome: str = Field(..., description="Nome completo")
    perfil: str = Field(..., description="Perfil do usuário")
    loja_id: str = Field(..., description="ID da loja do usuário")
    created_at: Optional[datetime] = Field(None, description="Data de criação")