#!/usr/bin/env python3
"""
Debug para listar todas as rotas registradas no FastAPI.
"""

from main import app

print("🔍 LISTANDO TODAS AS ROTAS DO FASTAPI:\n")

routes_found = []
for route in app.routes:
    if hasattr(route, 'path') and hasattr(route, 'methods'):
        routes_found.append({
            'path': route.path,
            'methods': list(route.methods),
            'name': getattr(route, 'name', 'unnamed')
        })

# Ordenar por path
routes_found.sort(key=lambda x: x['path'])

# Imprimir rotas agrupadas
print("📋 ROTAS DE TESTE:")
for route in routes_found:
    if 'test' in route['path']:
        print(f"  {route['path']} {route['methods']}")

print("\n📋 OUTRAS ROTAS:")
for route in routes_found:
    if 'test' not in route['path']:
        print(f"  {route['path']} {route['methods']}")

print(f"\n✅ Total: {len(routes_found)} rotas")