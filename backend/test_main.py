"""
TESTE ISOLADO - VERIFICAR SE PYTHON ESTÁ EXECUTANDO CÓDIGO ATUAL
"""

from fastapi import FastAPI
import time

app = FastAPI(title="TESTE ISOLADO")

@app.get("/")
async def root():
    return {
        "message": "TESTE ISOLADO FUNCIONANDO",
        "timestamp": time.time(),
        "test": "NOVO_ARQUIVO_CRIADO_AGORA"
    }

@app.get("/health")
async def health():
    return {
        "status": "TESTE_HEALTH",
        "arquivo": "test_main.py",
        "timestamp": time.time()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("test_main:app", host="0.0.0.0", port=8001, reload=True)