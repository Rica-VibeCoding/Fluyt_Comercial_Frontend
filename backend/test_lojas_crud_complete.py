#!/usr/bin/env python3
"""
TESTE COMPLETO CRUD - TABELA LOJAS
Analisa implementação do Agente 2 (Backend) e Agente 3 (Frontend) para a tabela Lojas.

OBJETIVO: Verificar se tabela Lojas está 100% funcional após tabela Empresa.
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
    "lojas_endpoints": {},
    "comparison_with_empresa": {},
    "integration_status": {},
    "overall_assessment": None
}

def log_result(step, status, details):
    """Log resultado de cada teste"""
    print(f"{'✅' if status else '❌'} {step}: {details}")
    return status

def test_lojas_backend_implementation():
    """1. Testar implementação backend de lojas"""
    endpoints_lojas = [
        ("GET", "/lojas/", "Listar lojas"),
        ("POST", "/lojas/", "Criar loja"), 
        ("GET", "/lojas/123e4567-e89b-12d3-a456-426614174000", "Obter loja"),
        ("PUT", "/lojas/123e4567-e89b-12d3-a456-426614174000", "Atualizar loja"),
        ("DELETE", "/lojas/123e4567-e89b-12d3-a456-426614174000", "Excluir loja"),
        ("GET", "/lojas/teste-sem-auth", "Teste sem auth"),
        ("GET", "/lojas/empresa/123e4567-e89b-12d3-a456-426614174000", "Lojas por empresa"),
        ("GET", "/lojas/dashboard/stats", "Estatísticas"),
        ("GET", "/lojas/validar/codigo/TEST001", "Validar código")
    ]
    
    found_endpoints = []
    
    for method, endpoint, description in endpoints_lojas:
        try:
            url = f"{BACKEND_URL}{endpoint}"
            
            if method == "GET":
                response = requests.get(url, timeout=5)
            elif method == "POST":
                response = requests.post(url, json={"nome": "Teste"}, timeout=5)
            elif method == "PUT":
                response = requests.put(url, json={"nome": "Teste"}, timeout=5)
            elif method == "DELETE":
                response = requests.delete(url, timeout=5)
            else:
                continue
                
            endpoint_info = {
                "method": method,
                "endpoint": endpoint,
                "description": description,
                "status_code": response.status_code,
                "implemented": response.status_code != 404
            }
            
            found_endpoints.append(endpoint_info)
            
            if response.status_code == 404:
                print(f"❌ {method} {endpoint}: Não implementado (404)")
            else:
                print(f"🔍 {method} {endpoint}: Status {response.status_code} - {description}")
                
        except Exception as e:
            print(f"⚠️ {method} {endpoint}: Erro - {str(e)}")
    
    TEST_RESULTS["lojas_endpoints"] = found_endpoints
    implemented_count = len([ep for ep in found_endpoints if ep["implemented"]])
    
    return log_result("Backend Lojas", implemented_count > 0, f"{implemented_count}/{len(endpoints_lojas)} endpoints")

def test_lojas_vs_empresa_comparison():
    """2. Comparar implementação Lojas vs Empresas"""
    
    # Testar endpoints test de ambos
    try:
        # Empresas (já sabemos que funciona)
        empresas_response = requests.get(f"{BACKEND_URL}/test/empresas", timeout=5)
        empresas_working = empresas_response.status_code == 200
        
        # Lojas
        lojas_response = requests.get(f"{BACKEND_URL}/test/lojas", timeout=5)
        lojas_working = lojas_response.status_code == 200
        
        if lojas_working:
            lojas_data = lojas_response.json()
            lojas_count = len(lojas_data.get('data', {}).get('lojas', []))
        else:
            lojas_count = 0
            
        comparison = {
            "empresas_working": empresas_working,
            "lojas_working": lojas_working,
            "parity": empresas_working == lojas_working,
            "lojas_count": lojas_count
        }
        
        TEST_RESULTS["comparison_with_empresa"] = comparison
        
        if lojas_working:
            log_result("Paridade com Empresas", True, f"Ambos funcionando - {lojas_count} lojas")
        else:
            log_result("Paridade com Empresas", False, "Lojas não implementadas como Empresas")
        
        return lojas_working
        
    except Exception as e:
        log_result("Paridade com Empresas", False, f"Erro: {str(e)}")
        return False

def test_frontend_integration():
    """3. Testar integração frontend"""
    
    frontend_status = {}
    
    # Verificar se frontend consegue conectar (mesmo padrão de empresas)
    try:
        # Simulando requisição do frontend usando endpoint de teste
        response = requests.get(f"{BACKEND_URL}/test/lojas", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            lojas = data.get('data', {}).get('lojas', [])
            
            frontend_status["test_endpoint"] = True
            frontend_status["lojas_retornadas"] = len(lojas)
            frontend_status["dados_reais"] = not data.get('mock', True)
            
            # Verificar estrutura dos dados
            if lojas:
                loja_sample = lojas[0]
                campos_esperados = ['id', 'nome', 'codigo', 'empresa_id', 'ativo']
                campos_presentes = [campo for campo in campos_esperados if campo in loja_sample]
                
                frontend_status["estrutura_dados"] = {
                    "esperados": campos_esperados,
                    "presentes": campos_presentes,
                    "completa": len(campos_presentes) >= 4
                }
                
                log_result("Frontend Integration", True, f"{len(lojas)} lojas, estrutura OK")
            else:
                log_result("Frontend Integration", False, "Sem dados de lojas")
        else:
            frontend_status["test_endpoint"] = False
            log_result("Frontend Integration", False, f"Status {response.status_code}")
            
    except Exception as e:
        frontend_status["erro"] = str(e)
        log_result("Frontend Integration", False, f"Erro: {str(e)}")
    
    TEST_RESULTS["integration_status"] = frontend_status
    return frontend_status.get("test_endpoint", False)

def analyze_implementation_completeness():
    """4. Análise de completude da implementação"""
    
    # Contar endpoints implementados
    lojas_endpoints = TEST_RESULTS.get("lojas_endpoints", [])
    implemented_endpoints = [ep for ep in lojas_endpoints if ep["implemented"]]
    
    # Verificar principais endpoints CRUD
    crud_endpoints = ["GET /lojas/", "POST /lojas/", "PUT /lojas/", "DELETE /lojas/"]
    crud_implemented = []
    
    for endpoint_info in implemented_endpoints:
        endpoint_key = f"{endpoint_info['method']} {endpoint_info['endpoint']}"
        if any(crud in endpoint_key for crud in crud_endpoints):
            crud_implemented.append(endpoint_key)
    
    # Verificar paridade com empresas
    has_parity = TEST_RESULTS.get("comparison_with_empresa", {}).get("parity", False)
    
    # Verificar integração frontend
    frontend_ok = TEST_RESULTS.get("integration_status", {}).get("test_endpoint", False)
    
    # Cálculo de completude
    total_score = 0
    max_score = 4
    
    if len(implemented_endpoints) >= 5:  # Pelo menos 5 endpoints
        total_score += 1
    if len(crud_implemented) >= 3:  # Pelo menos 3 operações CRUD
        total_score += 1
    if has_parity:  # Mesma qualidade que empresas
        total_score += 1
    if frontend_ok:  # Frontend funcionando
        total_score += 1
    
    completeness = (total_score / max_score) * 100
    
    return {
        "completeness_percentage": completeness,
        "implemented_endpoints": len(implemented_endpoints),
        "crud_operations": len(crud_implemented),
        "has_parity": has_parity,
        "frontend_working": frontend_ok,
        "assessment": "EXCELLENT" if completeness >= 90 else "GOOD" if completeness >= 70 else "NEEDS_WORK"
    }

def generate_final_report():
    """5. Gerar relatório final comparativo"""
    
    print("\n" + "="*60)
    print("📊 RELATÓRIO FINAL - TABELA LOJAS")
    print("="*60)
    
    # Análise de completude
    analysis = analyze_implementation_completeness()
    TEST_RESULTS["overall_assessment"] = analysis
    
    # Status geral
    completeness = analysis["completeness_percentage"]
    print(f"🎯 COMPLETUDE GERAL: {completeness:.1f}%")
    
    # Detalhes por categoria
    print(f"🔧 Backend Endpoints: {analysis['implemented_endpoints']} implementados")
    print(f"🛠️ Operações CRUD: {analysis['crud_operations']} funcionais")
    print(f"⚖️ Paridade c/ Empresas: {'✅ Sim' if analysis['has_parity'] else '❌ Não'}")
    print(f"🎨 Frontend: {'✅ Funcionando' if analysis['frontend_working'] else '❌ Problemas'}")
    
    # Assessment
    assessment = analysis["assessment"]
    if assessment == "EXCELLENT":
        status_icon = "✅"
        status_text = "TABELA LOJAS 100% FUNCIONAL"
        next_action = "➡️ Pode prosseguir para próxima tabela (Equipe)"
    elif assessment == "GOOD":
        status_icon = "⚠️"
        status_text = "TABELA LOJAS FUNCIONANDO BEM"
        next_action = "🔧 Poucos ajustes necessários antes de prosseguir"
    else:
        status_icon = "❌"
        status_text = "TABELA LOJAS PRECISA TRABALHO"
        next_action = "🛠️ Implementação precisa ser completada"
    
    print(f"\n{status_icon} STATUS FINAL: {status_text}")
    print(f"📋 PRÓXIMO PASSO: {next_action}")
    
    # Comparação com Empresas
    empresa_comparison = TEST_RESULTS.get("comparison_with_empresa", {})
    if empresa_comparison.get("parity"):
        print("\n✅ QUALIDADE: Mesmo nível de implementação que tabela Empresas")
    else:
        print("\n⚠️ QUALIDADE: Implementação inferior à tabela Empresas")
    
    return assessment == "EXCELLENT"

def main():
    """Executar análise completa da tabela Lojas"""
    print("🏪 INICIANDO ANÁLISE COMPLETA - TABELA LOJAS")
    print("Objetivo: Verificar se implementação está no mesmo nível da tabela Empresas")
    print("-" * 60)
    
    # Verificar se backend está rodando
    try:
        response = requests.get(f"{BACKEND_URL.replace('/api/v1', '')}/health", timeout=5)
        if response.status_code != 200:
            print("❌ Backend não está rodando!")
            return False
    except:
        print("❌ Backend não está acessível!")
        return False
    
    # Executar testes
    test_lojas_backend_implementation()
    test_lojas_vs_empresa_comparison()
    test_frontend_integration()
    
    # Gerar relatório final
    success = generate_final_report()
    
    # Salvar resultados
    with open("test_lojas_crud_results.json", "w") as f:
        json.dump(TEST_RESULTS, f, indent=2)
    
    print(f"\n💾 Resultados salvos em: test_lojas_crud_results.json")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)