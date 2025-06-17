#!/usr/bin/env python3
"""
Teste de import dos endpoints para debug.
"""

print("🔍 Testando imports...")

try:
    print("1. Testando import do router de teste...")
    from modules.test_endpoints.routes import router as test_router
    print(f"✅ Router importado com sucesso! Rotas: {len(test_router.routes)}")
    
    print("2. Listando rotas do test_router:")
    for i, route in enumerate(test_router.routes):
        print(f"   {i+1}. {route.path} [{', '.join(route.methods) if hasattr(route, 'methods') else 'GET'}]")
    
    print("3. Testando import das settings...")
    from core.config import get_settings
    settings = get_settings()
    print(f"✅ Settings carregadas - Environment: {settings.environment}, Is Dev: {settings.is_development}")
    
except Exception as e:
    print(f"❌ ERRO NO IMPORT: {e}")
    import traceback
    traceback.print_exc()