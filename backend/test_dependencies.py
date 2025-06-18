#!/usr/bin/env python3
"""
Teste de dependências - Verificar se Supabase está instalado
"""

print("🔍 TESTANDO DEPENDÊNCIAS...")

try:
    print("1. Testando import do supabase...")
    from supabase import create_client, Client
    print("✅ Supabase importado com sucesso")
except ImportError as e:
    print(f"❌ ERRO: Supabase não instalado - {e}")
    print("📋 Para instalar: pip install supabase")

try:
    print("\n2. Testando conexão com Supabase...")
    SUPABASE_URL = "https://momwbpxqnvgehotfmvde.supabase.co"
    SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzAxNTIsImV4cCI6MjA2MzM0NjE1Mn0.n90ZweBT-o1ugerZJDZl8gx65WGe1eUrhph6VuSdSCs"
    
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Teste de conexão simples
    response = supabase.table('c_clientes').select('id, nome').limit(1).execute()
    
    if response.data:
        print(f"✅ Conexão Supabase OK - Encontrou cliente: {response.data[0]['nome']}")
    else:
        print("⚠️ Conexão OK mas nenhum cliente encontrado")
        
except Exception as e:
    print(f"❌ ERRO na conexão Supabase: {e}")

try:
    print("\n3. Testando FastAPI...")
    from fastapi import FastAPI
    print("✅ FastAPI disponível")
except ImportError as e:
    print(f"❌ ERRO: FastAPI não disponível - {e}")

print("\n📊 DIAGNÓSTICO COMPLETO!")