#!/usr/bin/env python3
"""
Script para criar usuário diretamente no Supabase.
"""
import httpx
import asyncio
import json

# Configurações
SUPABASE_URL = "https://momwbpxqnvgehotfmvde.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc3MDE1MiwiZXhwIjoyMDYzMzQ2MTUyfQ.NyRBsnWlhUmZUQFykINlaMgm9dHGkzx2nqhCYjaNiFA"

# Dados do usuário
USER_EMAIL = "ricardo.nilton@hotmail.com"
USER_PASSWORD = "1478953"


async def create_user():
    """Criar usuário no Supabase."""
    print("🚀 Criando usuário no Supabase...")
    
    # 1. Criar usuário no Auth
    auth_url = f"{SUPABASE_URL}/auth/v1/admin/users"
    
    async with httpx.AsyncClient() as client:
        try:
            # Criar usuário via Admin API
            response = await client.post(
                auth_url,
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "email": USER_EMAIL,
                    "password": USER_PASSWORD,
                    "email_confirm": True,
                    "user_metadata": {
                        "nome": "Ricardo Nilton"
                    }
                }
            )
            
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                user_data = response.json()
                user_id = user_data.get("id")
                print(f"✅ Usuário criado com sucesso! ID: {user_id}")
                
                # 2. Criar registro na tabela usuarios
                await create_user_profile(client, user_id)
                
                return user_id
            else:
                print(f"❌ Erro ao criar usuário: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Erro: {str(e)}")
            return None


async def create_user_profile(client, user_id):
    """Criar perfil do usuário na tabela usuarios."""
    print(f"\n📝 Criando perfil do usuário...")
    
    # Primeiro, criar tabela se não existir
    create_table_url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        email VARCHAR(255) UNIQUE NOT NULL,
        nome VARCHAR(255) NOT NULL,
        perfil VARCHAR(50) DEFAULT 'USER',
        loja_id UUID,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );
    """
    
    # Inserir dados do usuário
    insert_url = f"{SUPABASE_URL}/rest/v1/usuarios"
    
    response = await client.post(
        insert_url,
        headers={
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        },
        json={
            "user_id": user_id,
            "email": USER_EMAIL,
            "nome": "Ricardo Nilton",
            "perfil": "SUPER_ADMIN"
        }
    )
    
    if response.status_code in [200, 201]:
        print("✅ Perfil do usuário criado com sucesso!")
    else:
        print(f"⚠️ Aviso ao criar perfil: {response.text}")


async def test_login():
    """Testar login com as credenciais."""
    print(f"\n🔐 Testando login...")
    
    auth_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            auth_url,
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Content-Type": "application/json"
            },
            json={
                "email": USER_EMAIL,
                "password": USER_PASSWORD
            }
        )
        
        if response.status_code == 200:
            print("✅ Login funcionando!")
            data = response.json()
            print(f"   Token: {data.get('access_token', '')[:50]}...")
        else:
            print(f"❌ Erro no login: {response.text}")


async def main():
    """Executar criação e teste."""
    user_id = await create_user()
    
    if user_id:
        await asyncio.sleep(2)  # Aguardar propagação
        await test_login()
    
    print("\n✨ Processo concluído!")


if __name__ == "__main__":
    asyncio.run(main())