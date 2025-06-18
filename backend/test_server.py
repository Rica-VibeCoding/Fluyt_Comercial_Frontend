#!/usr/bin/env python3
"""
Servidor de teste temporário para validar os endpoints.
Usado para debug dos erros 404 no sistema Fluyt.
"""

import uvicorn
import sys
import os

# Adiciona o diretório atual ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🚀 Iniciando servidor de teste na porta 8001...")
    print("📍 Endpoints de teste estarão em: http://localhost:8001/api/v1/test/")
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8001,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        print(f"❌ Erro ao iniciar servidor: {e}")
        import traceback
        traceback.print_exc()