"""
Módulo de conexão com banco de dados Supabase.
"""

import os
from supabase import create_client, Client
from typing import Optional

# Configurações do Supabase - TEMPORÁRIO para testes
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://momwbpxqnvgehotfmvde.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzAxNTIsImV4cCI6MjA2MzM0NjE1Mn0.n90ZweBT-o1ugerZJDZl8gx65WGe1eUrhph6VuSdSCs")

_supabase_client: Optional[Client] = None

def get_supabase_client() -> Client:
    """
    Retorna uma instância do cliente Supabase.
    Cria uma nova instância se não existir.
    """
    global _supabase_client
    
    if _supabase_client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError(
                "Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórias"
            )
        
        print(f"🔗 Conectando ao Supabase: {SUPABASE_URL}")
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Cliente Supabase criado com sucesso!")
    
    return _supabase_client

def reset_supabase_client():
    """
    Reseta o cliente Supabase (útil para testes).
    """
    global _supabase_client
    _supabase_client = None 