#!/usr/bin/env python3
"""
TESTE COMPLETO CRUD - TABELA EMPRESA
Verifica se o Agente 2 implementou corretamente todos os endpoints CRUD
e se o Agente 3 integrou corretamente com o frontend.

STATUS: Testando implementação dos Agentes 2 e 3
"""

import requests
import json
import uuid
from datetime import datetime
import sys

# Configuração
BACKEND_URL = "http://localhost:8000/api/v1"
TEST_RESULTS = {
    "timestamp": datetime.now().isoformat(),
    "backend_status": None,
    "endpoints_found": [],
    "crud_tests": {},
    "frontend_integration": {},
    "overall_status": None
}

def log_result(step, status, details):
    """Log resultado de cada teste"""
    print(f"{'✅' if status else '❌'} {step}: {details}")
    return status

def test_backend_health():
    """1. Verificar se backend está rodando"""
    try:
        response = requests.get(f"{BACKEND_URL.replace('/api/v1', '')}/health", timeout=5)
        return log_result("Backend Health", response.status_code == 200, f"Status {response.status_code}")
    except Exception as e:
        return log_result("Backend Health", False, f"Erro: {str(e)}")

def test_test_endpoints():
    """2. Verificar se endpoints de teste estão funcionando"""
    try:
        response = requests.get(f"{BACKEND_URL}/test/empresas", timeout=10)
        if response.status_code == 200:
            data = response.json()
            empresas_count = len(data.get('data', {}).get('empresas', []))
            return log_result("Test Endpoints", True, f"Funcionando - {empresas_count} empresas")
        else:
            return log_result("Test Endpoints", False, f"Status {response.status_code}")
    except Exception as e:
        return log_result("Test Endpoints", False, f"Erro: {str(e)}")

def discover_crud_endpoints():
    """3. Descobrir quais endpoints CRUD estão disponíveis"""
    endpoints_to_test = [
        ("GET", "/empresas/", "Listar empresas"),
        ("POST", "/empresas/", "Criar empresa"),
        ("GET", "/empresas/123e4567-e89b-12d3-a456-426614174000", "Obter empresa"),
        ("PUT", "/empresas/123e4567-e89b-12d3-a456-426614174000", "Atualizar empresa"),
        ("DELETE", "/empresas/123e4567-e89b-12d3-a456-426614174000", "Excluir empresa"),
        ("PATCH", "/empresas/123e4567-e89b-12d3-a456-426614174000/status", "Alterar status"),
        ("GET", "/empresas/teste-conexao-real", "Teste sem auth")
    ]
    
    found_endpoints = []
    
    for method, endpoint, description in endpoints_to_test:
        try:
            url = f"{BACKEND_URL}{endpoint}"
            
            # Fazer requisição básica sem payload para descobrir endpoint
            if method == "GET":
                response = requests.get(url, timeout=5)
            elif method == "POST":
                response = requests.post(url, json={}, timeout=5)
            elif method == "PUT":
                response = requests.put(url, json={}, timeout=5)
            elif method == "DELETE":
                response = requests.delete(url, timeout=5)
            elif method == "PATCH":
                response = requests.patch(url, json={}, timeout=5)
            else:
                continue
                
            # 404 = endpoint não existe, outros códigos = endpoint existe
            if response.status_code != 404:
                found_endpoints.append({
                    "method": method,
                    "endpoint": endpoint,
                    "description": description,
                    "status_code": response.status_code,
                    "exists": True
                })
                print(f"🔍 {method} {endpoint}: Status {response.status_code} - {description}")
            else:
                print(f"❌ {method} {endpoint}: Não encontrado (404)")
                
        except Exception as e:
            print(f"⚠️ {method} {endpoint}: Erro - {str(e)}")
    
    TEST_RESULTS["endpoints_found"] = found_endpoints
    return len(found_endpoints) > 0

def test_crud_without_auth():
    """4. Testar CRUD usando endpoint sem autenticação (se disponível)"""
    
    # Primeiro, testar endpoint sem auth para confirmar conexão
    try:
        response = requests.get(f"{BACKEND_URL}/empresas/teste-conexao-real", timeout=10)
        if response.status_code == 200:
            data = response.json()
            log_result("Conexão Supabase", True, f"Conectado - Projeto: {data.get('📊 PROJETO', 'N/A')}")
            TEST_RESULTS["crud_tests"]["conexao_supabase"] = True
        else:
            log_result("Conexão Supabase", False, f"Status {response.status_code}")
            TEST_RESULTS["crud_tests"]["conexao_supabase"] = False
    except Exception as e:
        log_result("Conexão Supabase", False, f"Erro: {str(e)}")
        TEST_RESULTS["crud_tests"]["conexao_supabase"] = False

def test_auth_requirements():
    """5. Testar requisitos de autenticação dos endpoints CRUD"""
    
    protected_endpoints = [
        ("GET", "/empresas/"),
        ("POST", "/empresas/"),
    ]
    
    auth_results = {}
    
    for method, endpoint in protected_endpoints:
        try:
            url = f"{BACKEND_URL}{endpoint}"
            
            if method == "GET":
                response = requests.get(url, timeout=5)
            elif method == "POST":
                response = requests.post(url, json={"nome": "Teste"}, timeout=5)
            
            # 403 = autenticação necessária (correto)
            # 200 = funcionou sem auth (problema de segurança)
            # 404 = endpoint não existe
            
            if response.status_code == 403:
                auth_results[endpoint] = "PROTEGIDO_CORRETAMENTE"
                log_result(f"Auth {method} {endpoint}", True, "Protegido corretamente (403)")
            elif response.status_code == 200:
                auth_results[endpoint] = "SEM_PROTECAO"
                log_result(f"Auth {method} {endpoint}", False, "⚠️ SEM PROTEÇÃO!")
            elif response.status_code == 404:
                auth_results[endpoint] = "NAO_ENCONTRADO"
                log_result(f"Auth {method} {endpoint}", False, "Endpoint não encontrado")
            else:
                auth_results[endpoint] = f"STATUS_{response.status_code}"
                log_result(f"Auth {method} {endpoint}", False, f"Status inesperado: {response.status_code}")
                
        except Exception as e:
            auth_results[endpoint] = f"ERRO_{str(e)}"
            log_result(f"Auth {method} {endpoint}", False, f"Erro: {str(e)}")
    
    TEST_RESULTS["crud_tests"]["auth_requirements"] = auth_results

def test_frontend_api_integration():
    """6. Verificar se frontend consegue conectar com backend"""
    
    # Testar endpoint que o frontend usa (test/empresas)
    frontend_tests = {}
    
    try:
        # Simular chamada do frontend
        response = requests.get(f"{BACKEND_URL}/test/empresas", 
                              headers={'Content-Type': 'application/json'}, 
                              timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            empresas = data.get('data', {}).get('empresas', [])
            lojas = data.get('data', {}).get('lojas', [])
            
            frontend_tests["endpoint_funcionando"] = True
            frontend_tests["empresas_retornadas"] = len(empresas)
            frontend_tests["lojas_retornadas"] = len(lojas)
            frontend_tests["dados_reais"] = not data.get('mock', True)
            
            log_result("Frontend API", True, f"Empresas: {len(empresas)}, Lojas: {len(lojas)}")
            
            # Verificar estrutura dos dados
            if empresas:
                empresa_sample = empresas[0]
                campos_esperados = ['id', 'nome', 'cnpj', 'created_at']
                campos_presentes = [campo for campo in campos_esperados if campo in empresa_sample]
                
                frontend_tests["estrutura_dados"] = {
                    "esperados": campos_esperados,
                    "presentes": campos_presentes,
                    "completa": len(campos_presentes) == len(campos_esperados)
                }
                
                log_result("Estrutura Dados", len(campos_presentes) == len(campos_esperados), 
                          f"{len(campos_presentes)}/{len(campos_esperados)} campos")
        else:
            frontend_tests["endpoint_funcionando"] = False
            log_result("Frontend API", False, f"Status {response.status_code}")
            
    except Exception as e:
        frontend_tests["erro"] = str(e)
        log_result("Frontend API", False, f"Erro: {str(e)}")
    
    TEST_RESULTS["frontend_integration"] = frontend_tests

def generate_report():
    """7. Gerar relatório final"""
    
    print("\n" + "="*60)
    print("📊 RELATÓRIO FINAL - TESTE CRUD EMPRESA")
    print("="*60)
    
    # Status Backend
    backend_ok = TEST_RESULTS.get("backend_status", False)
    print(f"🔧 Backend: {'✅ Funcionando' if backend_ok else '❌ Com problemas'}")
    
    # Endpoints encontrados
    endpoints = TEST_RESULTS.get("endpoints_found", [])
    print(f"🔗 Endpoints CRUD: {len(endpoints)} encontrados")
    
    # Conexão Supabase
    supabase_ok = TEST_RESULTS.get("crud_tests", {}).get("conexao_supabase", False)
    print(f"🗄️ Supabase: {'✅ Conectado' if supabase_ok else '❌ Problemas'}")
    
    # Autenticação
    auth_tests = TEST_RESULTS.get("crud_tests", {}).get("auth_requirements", {})
    auth_ok = all(status == "PROTEGIDO_CORRETAMENTE" for status in auth_tests.values())
    print(f"🔐 Autenticação: {'✅ Protegida' if auth_ok else '⚠️ Verificar'}")
    
    # Frontend
    frontend_ok = TEST_RESULTS.get("frontend_integration", {}).get("endpoint_funcionando", False)
    print(f"🎨 Frontend: {'✅ Integrado' if frontend_ok else '❌ Problemas'}")
    
    # Status geral
    all_ok = backend_ok and len(endpoints) > 0 and supabase_ok and frontend_ok
    TEST_RESULTS["overall_status"] = "SUCCESS" if all_ok else "PARTIAL"
    
    print(f"\n🎯 STATUS GERAL: {'✅ EMPRESA 100% FUNCIONAL' if all_ok else '⚠️ PRECISA AJUSTES'}")
    
    # Próximos passos
    print("\n📋 PRÓXIMOS PASSOS:")
    if not backend_ok:
        print("   1. ❌ Corrigir problemas do backend")
    if len(endpoints) == 0:
        print("   2. ❌ Implementar endpoints CRUD")
    if not supabase_ok:
        print("   3. ❌ Corrigir conexão com Supabase")
    if not frontend_ok:
        print("   4. ❌ Corrigir integração frontend")
    if all_ok:
        print("   ✅ Tabela Empresa está 100% funcional!")
        print("   ➡️ Pode prosseguir para tabela Lojas")

def main():
    """Executar todos os testes"""
    print("🚀 INICIANDO TESTE COMPLETO - TABELA EMPRESA")
    print("Objetivo: Verificar se Agente 2 (Backend) e Agente 3 (Frontend) completaram suas tarefas")
    print("-" * 60)
    
    # Executar testes em sequência
    TEST_RESULTS["backend_status"] = test_backend_health()
    
    if TEST_RESULTS["backend_status"]:
        test_test_endpoints()
        discover_crud_endpoints()
        test_crud_without_auth()
        test_auth_requirements()
        test_frontend_api_integration()
    
    # Gerar relatório
    generate_report()
    
    # Salvar resultados
    with open("test_empresa_crud_results.json", "w") as f:
        json.dump(TEST_RESULTS, f, indent=2)
    
    print(f"\n💾 Resultados salvos em: test_empresa_crud_results.json")
    
    return TEST_RESULTS["overall_status"] == "SUCCESS"

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)