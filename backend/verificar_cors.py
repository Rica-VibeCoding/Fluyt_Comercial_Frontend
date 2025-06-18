"""
Verificar se CORS está configurado corretamente
"""
import requests

def verificar_cors():
    """Testa se CORS permite requisições do frontend"""

    url = "http://localhost:8000/health"
    headers = {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
    }

    print("🔍 Testando CORS...")
    print(f"URL: {url}")
    print(f"Origin: {headers['Origin']}")

    try:
        # Teste OPTIONS (preflight)
        response = requests.options(url, headers=headers)

        print(f"\n📋 Resposta OPTIONS:")
        print(f"Status: {response.status_code}")

        cors_headers = {}
        for header, value in response.headers.items():
            if 'access-control' in header.lower():
                cors_headers[header] = value
                print(f"  {header}: {value}")

        # Teste GET normal
        response_get = requests.get(url, headers={'Origin': 'http://localhost:3000'})
        print(f"\n📋 Resposta GET:")
        print(f"Status: {response_get.status_code}")

        if response_get.status_code == 200:
            print("✅ GET funcionando")
        else:
            print(f"❌ GET com problema: {response_get.status_code}")

        return {
            "cors_configurado": len(cors_headers) > 0,
            "cors_headers": cors_headers,
            "get_funcionando": response_get.status_code == 200
        }

    except Exception as e:
        print(f"❌ Erro ao testar CORS: {e}")
        return {"erro": str(e)}

if __name__ == "__main__":
    resultado = verificar_cors()
    print(f"\n📊 Resultado CORS: {resultado}") 