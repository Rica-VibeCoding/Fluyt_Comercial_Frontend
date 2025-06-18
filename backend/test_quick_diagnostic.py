#!/usr/bin/env python3
"""
TESTE RÁPIDO: Diagnóstico de conexão Supabase
"""

import os
import sys

def test_env_vars():
    """Teste 1: Verificar variáveis de ambiente"""
    print("🔍 TESTE 1: Variáveis de ambiente")
    print("-" * 40)
    
    vars_needed = ['SUPABASE_URL', 'SUPABASE_ANON_KEY']
    
    for var in vars_needed:
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: {value[:30]}...")
        else:
            print(f"❌ {var}: NÃO DEFINIDA")
    
    return all(os.getenv(var) for var in vars_needed)

def test_supabase_import():
    """Teste 2: Imports do Supabase"""
    print("\n🔍 TESTE 2: Imports")
    print("-" * 40)
    
    try:
        from modules.shared.database import get_supabase_client
        print("✅ Import database.py OK")
        
        try:
            client = get_supabase_client()
            print(f"✅ Cliente criado: {type(client)}")
            return True
        except Exception as e:
            print(f"❌ Erro ao criar cliente: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Erro no import: {e}")
        return False

def test_direct_query():
    """Teste 3: Query direta"""
    print("\n🔍 TESTE 3: Query direta")
    print("-" * 40)
    
    try:
        from modules.shared.database import get_supabase_client
        client = get_supabase_client()
        
        # Tentar query simples
        result = client.table('c_clientes').select('id,nome').limit(1).execute()
        print(f"✅ Query executada: {len(result.data)} registros")
        if result.data:
            print(f"   Primeiro cliente: {result.data[0].get('nome', 'Sem nome')}")
        return True
        
    except Exception as e:
        print(f"❌ Erro na query: {e}")
        return False

def test_service_creation():
    """Teste 4: Criação do TestService"""
    print("\n🔍 TESTE 4: TestService")
    print("-" * 40)
    
    try:
        from modules.test_endpoints.service import TestService
        service = TestService()
        print("✅ TestService criado")
        
        try:
            _ = service.supabase
            print("✅ Propriedade supabase acessada")
            return True
        except Exception as e:
            print(f"❌ Erro ao acessar supabase: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao criar TestService: {e}")
        return False

def main():
    """Executar diagnóstico completo"""
    print("🚀 DIAGNÓSTICO RÁPIDO - CONEXÃO SUPABASE")
    print("=" * 50)
    
    tests = [
        test_env_vars,
        test_supabase_import, 
        test_direct_query,
        test_service_creation
    ]
    
    results = []
    for test in tests:
        result = test()
        results.append(result)
    
    print(f"\n📊 RESULTADO: {sum(results)}/{len(results)} testes passaram")
    
    if all(results):
        print("🎉 CONEXÃO SUPABASE OK!")
    else:
        print("⚠️ Problemas encontrados na conexão")
    
    return all(results)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 