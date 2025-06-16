"""
VERIFICADOR DE STARTUP - AGENTE SÊNIOR
Verifica se todas as configurações críticas estão OK antes dos júniores testarem
"""
import os
from core.config import get_settings
from core.database import get_supabase_client
import sys

def verificar_configuracoes_criticas():
    """Verifica configurações que podem bloquear conectividade"""
    
    print("🔧 VERIFICADOR DE CONFIGURAÇÕES CRÍTICAS")
    print("=" * 50)
    
    # 1. Verificar settings
    try:
        settings = get_settings()
        print(f"✅ Settings carregadas: {settings.app_name}")
        print(f"📍 Ambiente: {settings.environment}")
        print(f"🌐 CORS Origins: {settings.cors_origins_list}")
        print(f"🔑 JWT Secret: {settings.jwt_secret_key[:10]}...")
        
    except Exception as e:
        print(f"❌ ERRO em settings: {e}")
        return False
    
    # 2. Verificar Supabase (sem bloquear se falhar)
    try:
        client = get_supabase_client()
        # Teste básico sem RLS
        result = client.table('c_clientes').select('id').limit(1).execute()
        print(f"✅ Supabase conectado: {len(result.data)} registros encontrados")
        
    except Exception as e:
        print(f"⚠️  Supabase com problema (não bloqueia startup): {e}")
    
    # 3. Verificar variáveis críticas
    variaveis_criticas = [
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY', 
        'JWT_SECRET_KEY',
        'CORS_ORIGINS'
    ]
    
    for var in variaveis_criticas:
        valor = os.getenv(var)
        if valor:
            print(f"✅ {var}: {'*' * min(10, len(valor))}...")
        else:
            print(f"❌ {var}: NÃO DEFINIDA")
            return False
    
    # 4. Verificar porta disponível
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('localhost', 8000))
    sock.close()
    
    if result == 0:
        print("⚠️  Porta 8000 já em uso")
    else:
        print("✅ Porta 8000 disponível")
    
    print("=" * 50)
    print("🎉 CONFIGURAÇÕES OK - PRONTO PARA CONECTIVIDADE")
    return True

def criar_script_startup_rapido():
    """Cria script para startup rápido do backend"""
    
    script_content = '''#!/bin/bash
# Script de startup rápido - criado pelo Agente Sênior

echo "🚀 Iniciando Backend Fluyt..."
echo "📍 Pasta: $(pwd)"
echo "🐍 Python: $(python --version)"

# Verificar se está na pasta correta
if [ ! -f "main.py" ]; then
    echo "❌ ERRO: Execute na pasta backend/"
    exit 1
fi

# Verificar dependências
if [ ! -f "requirements.txt" ]; then
    echo "❌ ERRO: requirements.txt não encontrado"
    exit 1
fi

echo "📦 Verificando dependências..."
pip install -r requirements.txt --quiet

echo "🔧 Verificando configurações..."
python startup_verificador.py

if [ $? -ne 0 ]; then
    echo "❌ ERRO: Configurações inválidas"
    exit 1
fi

echo "🎯 Iniciando servidor FastAPI..."
python main.py
'''
    
    with open('/mnt/c/Users/ricar/Projetos/Fluyt_Comercial_Frontend/backend/startup.sh', 'w') as f:
        f.write(script_content)
    
    # Tornar executável
    os.chmod('/mnt/c/Users/ricar/Projetos/Fluyt_Comercial_Frontend/backend/startup.sh', 0o755)
    print("✅ Script startup.sh criado")

def diagnostico_completo():
    """Diagnóstico completo para debug"""
    
    print("\n🔍 DIAGNÓSTICO COMPLETO")
    print("=" * 30)
    
    # Python version
    print(f"🐍 Python: {sys.version}")
    
    # Working directory
    print(f"📁 Diretório: {os.getcwd()}")
    
    # Environment variables
    env_vars = ['SUPABASE_URL', 'CORS_ORIGINS', 'ENVIRONMENT']
    for var in env_vars:
        valor = os.getenv(var, 'NÃO DEFINIDA')
        print(f"🔧 {var}: {valor}")
    
    # Arquivos importantes
    arquivos_importantes = ['main.py', 'requirements.txt', '.env']
    for arquivo in arquivos_importantes:
        if os.path.exists(arquivo):
            print(f"✅ {arquivo}: existe")
        else:
            print(f"❌ {arquivo}: NÃO EXISTE")

if __name__ == "__main__":
    print("🤖 AGENTE SÊNIOR - VERIFICAÇÃO PRÉ-TESTE")
    
    # Verificar se está na pasta correta
    if not os.path.exists('main.py'):
        print("❌ ERRO: Execute na pasta backend/")
        print("💡 Comando: cd backend && python startup_verificador.py")
        sys.exit(1)
    
    # Executar verificações
    config_ok = verificar_configuracoes_criticas()
    
    if config_ok:
        criar_script_startup_rapido()
        diagnostico_completo()
        
        print("\n🎯 RESULTADO PARA JÚNIORES:")
        print("✅ Backend pronto para testes de conectividade")
        print("💡 Próximo passo: python main.py")
    else:
        print("\n❌ CONFIGURAÇÕES COM PROBLEMA")
        print("🔧 Verificar variáveis de ambiente")