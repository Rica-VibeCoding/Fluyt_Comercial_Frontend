"""
Script para testar conectividade do backend
COPIE EXATAMENTE ESTE CÓDIGO
"""
import requests
import json
from datetime import datetime

def testar_endpoint(url, nome):
    """Testa um endpoint específico"""
    print(f"\n🔍 Testando {nome}...")
    print(f"URL: {url}")

    try:
        response = requests.get(url, timeout=10)

        resultado = {
            "endpoint": nome,
            "url": url,
            "status_code": response.status_code,
            "sucesso": response.status_code == 200,
            "timestamp": datetime.now().isoformat(),
            "response_size": len(response.content)
        }

        if response.status_code == 200:
            print(f"✅ {nome}: OK")
            try:
                data = response.json()
                resultado["tem_json"] = True
                resultado["preview"] = str(data)[:100] + "..." if len(str(data)) > 100 else str(data)
            except:
                resultado["tem_json"] = False
                resultado["preview"] = response.text[:100] + "..." if len(response.text) > 100 else response.text
        else:
            print(f"❌ {nome}: ERRO {response.status_code}")
            resultado["erro"] = response.text[:200]

    except requests.exceptions.ConnectionError:
        resultado = {
            "endpoint": nome,
            "url": url,
            "sucesso": False,
            "erro": "Conexão recusada - backend não está rodando?",
            "timestamp": datetime.now().isoformat()
        }
        print(f"❌ {nome}: CONEXÃO RECUSADA")

    except Exception as e:
        resultado = {
            "endpoint": nome,
            "url": url,
            "sucesso": False,
            "erro": str(e),
            "timestamp": datetime.now().isoformat()
        }
        print(f"❌ {nome}: ERRO - {str(e)}")

    return resultado

def testar_todos_endpoints():
    """Testa todos os endpoints importantes"""

    base_url = "http://localhost:8000"

    endpoints = [
        ("/health", "Health Check"),
        ("/", "Root"),
        ("/api/v1/docs", "API Docs"),
    ]

    print("🚀 Iniciando testes de conectividade do backend...")
    print(f"Base URL: {base_url}")

    resultados = []

    for endpoint, nome in endpoints:
        url = f"{base_url}{endpoint}"
        resultado = testar_endpoint(url, nome)
        resultados.append(resultado)

    # Resumo
    sucessos = sum(1 for r in resultados if r.get("sucesso", False))
    total = len(resultados)

    print(f"\n📊 RESUMO: {sucessos}/{total} endpoints funcionando")

    if sucessos == total:
        print("🎉 Todos os endpoints estão funcionando!")
    else:
        print("⚠️  Alguns endpoints têm problemas")

    return resultados

def salvar_relatorio(resultados):
    """Salva relatório em arquivo"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"relatorio_conectividade_{timestamp}.json"

    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(resultados, f, indent=2, ensure_ascii=False)

    print(f"\n📝 Relatório salvo em: {filename}")
    return filename

if __name__ == "__main__":
    print("=" * 50)
    print("🔧 TESTE DE CONECTIVIDADE BACKEND FLUYT")
    print("=" * 50)

    resultados = testar_todos_endpoints()
    arquivo = salvar_relatorio(resultados)

    print("\n" + "=" * 50)
    print("✅ Teste concluído!")
    print(f"📄 Relatório: {arquivo}")
    print("=" * 50) 