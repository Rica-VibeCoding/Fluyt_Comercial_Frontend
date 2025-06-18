#!/usr/bin/env python3
"""
Teste completo de import incluindo dependências.
"""

print("🔍 Testando import completo...")

try:
    print("1. Testando import do shared.database...")
    from modules.shared.database import get_supabase_client
    print("✅ Database import OK")
    
    print("2. Testando import do service...")
    from modules.test_endpoints.service import TestService
    print("✅ Service import OK")
    
    print("3. Testando import do main completo...")
    from main import app
    print(f"✅ Main app importado - total routes: {len(app.routes)}")
    
    print("4. Listando rotas que contém 'test':")
    for route in app.routes:
        if hasattr(route, 'path') and 'test' in route.path.lower():
            methods = list(route.methods) if hasattr(route, 'methods') else ['GET']
            print(f"   {route.path} [{', '.join(methods)}]")
    
except Exception as e:
    print(f"❌ ERRO: {e}")
    import traceback
    traceback.print_exc()