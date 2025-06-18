"""
Serviço de autenticação para Fluyt Comercial.
Implementa login simples com JWT via Supabase.
"""

import os
import jwt
import httpx
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status

from core.config import settings
from core.exceptions import ValidationException, ExternalServiceException
from .schemas import LoginRequest, LoginResponse, UserInfo


class AuthService:
    """Serviço de autenticação com Supabase."""
    
    def __init__(self):
        self.supabase_url = settings.supabase_url
        self.supabase_service_key = settings.supabase_service_key
        self.jwt_secret = settings.jwt_secret_key
        self.jwt_algorithm = "HS256"
        self.jwt_expiration_minutes = settings.jwt_access_token_expire_minutes
    
    async def login(self, request: LoginRequest) -> LoginResponse:
        """
        Autentica usuário e retorna JWT token.
        
        Args:
            request: Dados de login (email/senha)
            
        Returns:
            LoginResponse com token JWT e dados do usuário
            
        Raises:
            ValidationException: Credenciais inválidas
            ExternalServiceException: Erro no Supabase
        """
        try:
            # Autenticar com Supabase via API REST
            auth_url = f"{self.supabase_url}/auth/v1/token?grant_type=password"
            
            async with httpx.AsyncClient() as client:
                auth_response = await client.post(
                    auth_url,
                    headers={
                        "apikey": self.supabase_service_key,
                        "Content-Type": "application/json"
                    },
                    json={
                        "email": request.email,
                        "password": request.password
                    }
                )
                
                if auth_response.status_code != 200:
                    raise ValidationException("Email ou senha inválidos")
                
                auth_data = auth_response.json()
                user = auth_data.get("user")
                
                if not user:
                    raise ValidationException("Email ou senha inválidos")
            
            # Buscar dados completos do usuário na tabela de usuários
            user_data = await self._get_user_profile(user["id"])
            
            # Gerar JWT token
            token_data = {
                "user_id": user["id"],
                "email": user["email"],
                "loja_id": user_data.get("loja_id"),
                "perfil": user_data.get("perfil", "USER"),
                "exp": datetime.utcnow() + timedelta(minutes=self.jwt_expiration_minutes)
            }
            
            access_token = jwt.encode(token_data, self.jwt_secret, algorithm=self.jwt_algorithm)
            
            return LoginResponse(
                access_token=access_token,
                token_type="bearer",
                expires_in=self.jwt_expiration_minutes * 60,
                user={
                    "user_id": user["id"],
                    "email": user["email"],
                    "nome": user_data.get("nome", user["email"]),
                    "perfil": user_data.get("perfil", "USER"),
                    "loja_id": user_data.get("loja_id")
                }
            )
            
        except Exception as e:
            if isinstance(e, ValidationException):
                raise
            
            # Log do erro para debugging
            print(f"Erro no login: {str(e)}")
            raise ExternalServiceException("Supabase", f"Erro na autenticação: {str(e)}")
    
    async def _get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """
        Busca dados completos do usuário na tabela de perfis.
        
        Args:
            user_id: ID do usuário
            
        Returns:
            Dados do perfil do usuário
        """
        try:
            # Buscar na tabela de usuários/perfis via API REST do Supabase
            profile_url = f"{self.supabase_url}/rest/v1/usuarios"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    profile_url,
                    headers={
                        "apikey": self.supabase_service_key,
                        "Authorization": f"Bearer {self.supabase_service_key}",
                        "Content-Type": "application/json"
                    },
                    params={"user_id": f"eq.{user_id}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data and len(data) > 0:
                        return data[0]
            
            # Se não encontrar, retornar dados básicos
            return {
                "nome": "Usuário",
                "perfil": "USER",
                "loja_id": None
            }
            
        except Exception as e:
            print(f"Erro ao buscar perfil: {str(e)}")
            return {
                "nome": "Usuário",
                "perfil": "USER", 
                "loja_id": None
            }
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verifica e decodifica token JWT.
        
        Args:
            token: Token JWT
            
        Returns:
            Dados do token decodificado ou None se inválido
        """
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expirado"
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
    
    async def get_current_user(self, token: str) -> UserInfo:
        """
        Obtém informações do usuário atual baseado no token.
        
        Args:
            token: Token JWT
            
        Returns:
            Informações do usuário
        """
        payload = self.verify_token(token)
        
        return UserInfo(
            user_id=payload["user_id"],
            email=payload["email"],
            nome=payload.get("nome", payload["email"]),
            perfil=payload.get("perfil", "USER"),
            loja_id=payload.get("loja_id")
        )


# Instância global do serviço
auth_service = AuthService()