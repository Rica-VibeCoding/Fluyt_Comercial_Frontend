"""
SETUP AUTOMÁTICO DO BACKEND - SÊNIOR
Corrige todos os problemas que o Agente 2 deveria ter resolvido
"""
import subprocess
import sys
import os
from pathlib import Path

def verificar_python():
    """Verifica instalação Python"""
    print("🐍 Verificando Python...")
    
    try:
        version = sys.version_info
        print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
        
        if version.major < 3 or (version.major == 3 and version.minor < 8):
            print("❌ Python 3.8+ necessário")
            return False
            
        return True
    except Exception as e:
        print(f"❌ Erro ao verificar Python: {e}")
        return False

def instalar_dependencias():
    """Instala dependências automaticamente"""
    print("📦 Instalando dependências...")
    
    requirements_file = Path("requirements.txt")
    if not requirements_file.exists():
        print("❌ requirements.txt não encontrado")
        return False
    
    try:
        # Tentar diferentes comandos pip
        commands = [
            [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"],
            ["pip3", "install", "-r", "requirements.txt"],
            ["pip", "install", "-r", "requirements.txt"]
        ]
        
        for cmd in commands:
            try:
                print(f"🔧 Tentando: {' '.join(cmd)}")
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
                
                if result.returncode == 0:
                    print("✅ Dependências instaladas com sucesso")
                    return True
                else:
                    print(f"⚠️ Comando falhou: {result.stderr}")
                    
            except FileNotFoundError:
                print(f"⚠️ Comando não encontrado: {cmd[0]}")
                continue
            except subprocess.TimeoutExpired:
                print("⚠️ Timeout na instalação")
                continue
        
        print("❌ Não foi possível instalar dependências automaticamente")
        return False
        
    except Exception as e:
        print(f"❌ Erro na instalação: {e}")
        return False

def verificar_dependencias_criticas():
    """Verifica se dependências críticas estão disponíveis"""
    print("🔍 Verificando dependências críticas...")
    
    deps_criticas = [
        'fastapi',
        'uvicorn', 
        'pydantic',
        'pydantic_settings',
        'supabase',
        'requests'
    ]
    
    deps_ok = []
    deps_fail = []
    
    for dep in deps_criticas:
        try:
            __import__(dep)
            deps_ok.append(dep)
            print(f"✅ {dep}")
        except ImportError:
            deps_fail.append(dep)
            print(f"❌ {dep}")
    
    print(f"\n📊 Resultado: {len(deps_ok)}/{len(deps_criticas)} dependências OK")
    
    if deps_fail:
        print(f"⚠️ Dependências em falta: {', '.join(deps_fail)}")
        return False
    
    return True

def testar_configuracoes():
    """Testa configurações sem importar módulos pesados"""
    print("🔧 Testando configurações...")
    
    # Verificar .env
    env_file = Path(".env")
    if not env_file.exists():
        print("❌ Arquivo .env não encontrado")
        return False
    
    print("✅ Arquivo .env encontrado")
    
    # Verificar variáveis críticas
    with open(env_file, 'r') as f:
        env_content = f.read()
    
    vars_criticas = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'CORS_ORIGINS']
    for var in vars_criticas:
        if var in env_content:
            print(f"✅ {var} configurada")
        else:
            print(f"❌ {var} não encontrada")
            return False
    
    return True

def tentar_iniciar_backend():
    """Tenta iniciar backend para validação"""
    print("🚀 Testando startup do backend...")
    
    main_file = Path("main.py")
    if not main_file.exists():
        print("❌ main.py não encontrado")
        return False
    
    try:
        # Teste básico de import
        cmd = [sys.executable, "-c", "import main; print('✅ Import OK')"]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ Backend pode ser importado")
            return True
        else:
            print(f"❌ Erro no import: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao testar backend: {e}")
        return False

def main():
    """Execução principal do setup"""
    print("="*60)
    print("🔧 SETUP AUTOMÁTICO DO BACKEND FLUYT")
    print("🤖 Executado pelo Agente Sênior")
    print("="*60)
    
    # Verificar se está na pasta correta
    if not Path("main.py").exists():
        print("❌ Execute na pasta backend/")
        print("💡 Comando: cd backend && python3 backend_setup.py")
        sys.exit(1)
    
    # Execução sequencial
    etapas = [
        ("Verificar Python", verificar_python),
        ("Instalar Dependências", instalar_dependencias),
        ("Verificar Dependências", verificar_dependencias_criticas),
        ("Testar Configurações", testar_configuracoes),
        ("Testar Backend", tentar_iniciar_backend)
    ]
    
    resultados = {}
    
    for nome, funcao in etapas:
        print(f"\n{'='*20} {nome} {'='*20}")
        resultado = funcao()
        resultados[nome] = resultado
        
        if not resultado:
            print(f"\n❌ FALHA EM: {nome}")
            print("🛑 Interrompendo setup")
            break
    
    # Resumo final
    print("\n" + "="*60)
    print("📊 RESUMO DO SETUP")
    print("="*60)
    
    for nome, resultado in resultados.items():
        status = "✅" if resultado else "❌"
        print(f"{status} {nome}")
    
    if all(resultados.values()):
        print("\n🎉 BACKEND PRONTO PARA USO!")
        print("💡 Próximo passo: python3 main.py")
        return True
    else:
        print("\n⚠️ BACKEND COM PROBLEMAS")
        print("🔧 Corrija os erros antes de continuar")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)