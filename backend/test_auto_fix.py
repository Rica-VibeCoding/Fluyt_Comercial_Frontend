#!/usr/bin/env python3
"""
Sistema Automatizado de Teste e Correção - Fluyt Backend
Detecta problemas, aplica correções e valida funcionamento.
"""

import subprocess
import time
import json
import sys
import os
import requests
from datetime import datetime

class TestadorAutomatico:
    def __init__(self):
        self.backend_url = "http://localhost:8000"
        self.frontend_url = "http://localhost:3000"
        self.problemas = []
        self.correcoes_aplicadas = []
        self.servidor_processo = None
        
    def log(self, mensagem, tipo="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        simbolo = {"INFO": "📋", "SUCESSO": "✅", "ERRO": "❌", "AVISO": "⚠️", "ACAO": "🔧"}
        print(f"[{timestamp}] {simbolo.get(tipo, '📌')} {mensagem}")
        
    def verificar_backend_rodando(self):
        """Verifica se o backend está respondendo"""
        self.log("Verificando se backend está rodando...")
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=2)
            if response.status_code == 200:
                self.log("Backend está rodando!", "SUCESSO")
                return True
        except:
            pass
        
        self.log("Backend não está rodando", "ERRO")
        self.problemas.append("Backend offline")
        return False
    
    def iniciar_backend(self):
        """Tenta iniciar o backend automaticamente"""
        self.log("Tentando iniciar backend...", "ACAO")
        
        # Verificar se estamos no diretório correto
        if not os.path.exists("main.py"):
            self.log("Arquivo main.py não encontrado no diretório atual", "ERRO")
            return False
            
        try:
            # Comando para Windows com venv
            if os.path.exists("venv/Scripts/python.exe"):
                cmd = ["venv/Scripts/python.exe", "main.py"]
            else:
                cmd = ["python", "main.py"]
                
            self.servidor_processo = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Aguardar servidor iniciar
            self.log("Aguardando servidor iniciar (10 segundos)...")
            time.sleep(10)
            
            if self.verificar_backend_rodando():
                self.correcoes_aplicadas.append("Backend iniciado automaticamente")
                return True
            else:
                self.log("Backend iniciou mas não está respondendo", "ERRO")
                return False
                
        except Exception as e:
            self.log(f"Erro ao iniciar backend: {e}", "ERRO")
            return False
    
    def testar_endpoints(self):
        """Testa todos os endpoints críticos"""
        self.log("Testando endpoints...", "INFO")
        
        endpoints_teste = [
            ("/health", "GET", None, "Health Check"),
            ("/api/v1/test/", "GET", None, "Test Root"),
            ("/api/v1/test/clientes?loja_id=test", "GET", None, "Listar Clientes"),
            ("/api/v1/test/dados-iniciais", "GET", None, "Dados Iniciais"),
        ]
        
        resultados = []
        
        for endpoint, metodo, dados, descricao in endpoints_teste:
            try:
                url = f"{self.backend_url}{endpoint}"
                self.log(f"Testando: {descricao} ({metodo} {endpoint})")
                
                if metodo == "GET":
                    response = requests.get(url, timeout=5)
                elif metodo == "POST":
                    response = requests.post(url, json=dados, timeout=5)
                
                if response.status_code == 200:
                    self.log(f"  ✅ {descricao}: OK", "SUCESSO")
                    resultados.append({"endpoint": endpoint, "status": "OK", "code": 200})
                else:
                    self.log(f"  ❌ {descricao}: Erro {response.status_code}", "ERRO")
                    resultados.append({"endpoint": endpoint, "status": "ERRO", "code": response.status_code})
                    self.problemas.append(f"Endpoint {endpoint} retornou {response.status_code}")
                    
            except requests.exceptions.ConnectionError:
                self.log(f"  ❌ {descricao}: Conexão recusada", "ERRO")
                resultados.append({"endpoint": endpoint, "status": "CONEXAO_RECUSADA"})
                self.problemas.append(f"Endpoint {endpoint} - conexão recusada")
            except Exception as e:
                self.log(f"  ❌ {descricao}: {str(e)}", "ERRO")
                resultados.append({"endpoint": endpoint, "status": "ERRO", "error": str(e)})
                self.problemas.append(f"Endpoint {endpoint} - {str(e)}")
        
        return resultados
    
    def verificar_cors(self):
        """Verifica configuração CORS"""
        self.log("Verificando configuração CORS...", "INFO")
        
        try:
            # Simular requisição do frontend
            headers = {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'content-type'
            }
            
            response = requests.options(
                f"{self.backend_url}/api/v1/test/clientes",
                headers=headers,
                timeout=5
            )
            
            cors_headers = response.headers.get('Access-Control-Allow-Origin', '')
            
            if 'localhost:3000' in cors_headers or '*' in cors_headers:
                self.log("CORS configurado corretamente", "SUCESSO")
                return True
            else:
                self.log(f"CORS não permite localhost:3000. Header atual: {cors_headers}", "ERRO")
                self.problemas.append("CORS não configurado para localhost:3000")
                return False
                
        except Exception as e:
            self.log(f"Erro ao verificar CORS: {e}", "ERRO")
            return False
    
    def aplicar_correcoes(self):
        """Aplica correções automáticas para problemas encontrados"""
        self.log("Analisando problemas e aplicando correções...", "ACAO")
        
        if "Backend offline" in self.problemas:
            self.log("Problema detectado: Backend offline", "AVISO")
            if self.iniciar_backend():
                self.log("Backend iniciado com sucesso!", "SUCESSO")
            else:
                self.log("Não foi possível iniciar o backend automaticamente", "ERRO")
                self.log("Por favor, inicie manualmente com: ./venv/Scripts/python.exe main.py", "AVISO")
                return False
        
        # Aqui podemos adicionar mais correções automáticas
        # - Ajustar CORS no .env
        # - Corrigir rotas
        # - etc.
        
        return True
    
    def gerar_relatorio(self):
        """Gera relatório final dos testes"""
        self.log("\n" + "="*60, "INFO")
        self.log("RELATÓRIO FINAL DE TESTES", "INFO")
        self.log("="*60, "INFO")
        
        if not self.problemas:
            self.log("✅ TODOS OS TESTES PASSARAM!", "SUCESSO")
            self.log("Sistema está funcionando corretamente!", "SUCESSO")
        else:
            self.log(f"❌ {len(self.problemas)} PROBLEMAS ENCONTRADOS:", "ERRO")
            for problema in self.problemas:
                self.log(f"  • {problema}", "ERRO")
        
        if self.correcoes_aplicadas:
            self.log(f"\n🔧 {len(self.correcoes_aplicadas)} CORREÇÕES APLICADAS:", "INFO")
            for correcao in self.correcoes_aplicadas:
                self.log(f"  • {correcao}", "SUCESSO")
        
        self.log("\n" + "="*60, "INFO")
        
        # Salvar relatório em arquivo
        relatorio = {
            "timestamp": datetime.now().isoformat(),
            "problemas": self.problemas,
            "correcoes": self.correcoes_aplicadas,
            "status": "SUCESSO" if not self.problemas else "FALHA"
        }
        
        with open("relatorio_teste_auto.json", "w", encoding="utf-8") as f:
            json.dump(relatorio, f, indent=2, ensure_ascii=False)
        
        self.log("Relatório salvo em: relatorio_teste_auto.json", "INFO")
    
    def executar_ciclo_completo(self):
        """Executa o ciclo completo de teste e correção"""
        self.log("🚀 INICIANDO CICLO DE TESTE E CORREÇÃO AUTOMATIZADA", "INFO")
        self.log("="*60, "INFO")
        
        # 1. Verificar backend
        if not self.verificar_backend_rodando():
            self.aplicar_correcoes()
        
        # 2. Testar endpoints
        if self.verificar_backend_rodando():
            self.testar_endpoints()
            
        # 3. Verificar CORS
        if self.verificar_backend_rodando():
            self.verificar_cors()
        
        # 4. Gerar relatório
        self.gerar_relatorio()
        
        return len(self.problemas) == 0

def main():
    testador = TestadorAutomatico()
    sucesso = testador.executar_ciclo_completo()
    
    if sucesso:
        sys.exit(0)  # Sucesso
    else:
        sys.exit(1)  # Falha

if __name__ == "__main__":
    main()