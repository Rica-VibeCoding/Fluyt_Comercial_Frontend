"""
Rotas de autenticação para Fluyt Comercial.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

from .schemas import LoginRequest, LoginResponse, UserInfo
from .service import auth_service
from core.exceptions import ValidationException, ExternalServiceException

# Router para autenticação
router = APIRouter(prefix="/auth", tags=["Autenticação"])

# Esquema de segurança Bearer
security = HTTPBearer()


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Endpoint de login - autentica usuário e retorna JWT token.
    
    Args:
        request: Dados de login (email e senha)
        
    Returns:
        LoginResponse: Token JWT e dados do usuário
        
    Raises:
        HTTPException: 400 para credenciais inválidas, 502 para erro do Supabase
    """
    try:
        return await auth_service.login(request)
    
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message
        )
    
    except ExternalServiceException as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=e.message
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno no servidor"
        )


@router.get("/me", response_model=UserInfo)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Obtém informações do usuário atual.
    
    Args:
        credentials: Token Bearer do cabeçalho Authorization
        
    Returns:
        UserInfo: Informações do usuário autenticado
        
    Raises:
        HTTPException: 401 para token inválido/expirado
    """
    try:
        token = credentials.credentials
        return await auth_service.get_current_user(token)
    
    except HTTPException:
        # Re-propagar exceções HTTP do auth_service
        raise
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno no servidor"
        )


@router.post("/logout")
async def logout():
    """
    Endpoint de logout - por enquanto apenas confirma o logout.
    
    Note: Em um JWT stateless, o logout é feito no cliente removendo o token.
    Para invalidação real seria necessário uma blacklist de tokens.
    
    Returns:
        Mensagem de confirmação
    """
    return {"message": "Logout realizado com sucesso"}


@router.get("/verify")
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verifica se o token JWT é válido.
    
    Args:
        credentials: Token Bearer do cabeçalho Authorization
        
    Returns:
        Status de validade do token
        
    Raises:
        HTTPException: 401 para token inválido/expirado
    """
    try:
        token = credentials.credentials
        payload = auth_service.verify_token(token)
        
        return {
            "valid": True,
            "user_id": payload.get("user_id"),
            "email": payload.get("email"),
            "expires_at": payload.get("exp")
        }
    
    except HTTPException:
        # Re-propagar exceções HTTP do auth_service
        raise
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno no servidor"
        )


# Dependency para obter usuário atual em outros endpoints
async def get_current_user_dependency(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UserInfo:
    """
    Dependency para obter usuário atual em outros endpoints.
    
    Args:
        credentials: Token Bearer do cabeçalho Authorization
        
    Returns:
        UserInfo: Informações do usuário autenticado
        
    Raises:
        HTTPException: 401 para token inválido/expirado
    """
    token = credentials.credentials
    return await auth_service.get_current_user(token)