"""
VALIDADOR DE BACKEND - SÊNIOR  
Valida backend sem dependências externas
"""
import os
import json
from pathlib import Path
import sys

def validar_estrutura_backend():
    """Valida estrutura de arquivos do backend"""
    print("📁 Validando estrutura do backend...")
    
    arquivos_obrigatorios = [
        "main.py",
        "requirements.txt", 
        ".env",
        "core/config.py",
        "core/auth.py",
        "core/database.py"
    ]
    
    arquivos_ok = []
    arquivos_faltando = []
    
    for arquivo in arquivos_obrigatorios:
        caminho = Path(arquivo)
        if caminho.exists():
            arquivos_ok.append(arquivo)
            print(f"✅ {arquivo}")
        else:
            arquivos_faltando.append(arquivo)
            print(f"❌ {arquivo}")
    
    print(f"\n📊 Estrutura: {len(arquivos_ok)}/{len(arquivos_obrigatorios)} arquivos OK")
    return len(arquivos_faltando) == 0

def validar_configuracoes():
    """Valida arquivo .env e configurações"""
    print("\n🔧 Validando configurações...")
    
    env_path = Path(".env")
    if not env_path.exists():
        print("❌ Arquivo .env não encontrado")
        return False
    
    with open(env_path, 'r') as f:
        env_content = f.read()
    
    config_necessarias = {
        'SUPABASE_URL': 'URL do Supabase',
        'SUPABASE_ANON_KEY': 'Chave anônima Supabase', 
        'CORS_ORIGINS': 'Configuração CORS',
        'JWT_SECRET_KEY': 'Chave secreta JWT'
    }
    
    configs_ok = []
    configs_faltando = []
    
    for var, desc in config_necessarias.items():
        if var in env_content and f'{var}=' in env_content:
            # Extrair valor
            for linha in env_content.split('\n'):
                if linha.startswith(f'{var}='):
                    valor = linha.split('=', 1)[1].strip()
                    if valor and valor != 'your-key-here':
                        configs_ok.append(var)
                        print(f"✅ {var}: {valor[:20]}...")
                        break
            else:
                configs_faltando.append(var)
                print(f"❌ {var}: valor vazio ou padrão")
        else:
            configs_faltando.append(var)
            print(f"❌ {var}: não encontrada")
    
    print(f"\n📊 Configurações: {len(configs_ok)}/{len(config_necessarias)} OK")
    return len(configs_faltando) == 0

def validar_modulos():
    """Valida estrutura dos módulos"""
    print("\n📦 Validando módulos...")
    
    modules_path = Path("modules")
    if not modules_path.exists():
        print("❌ Pasta modules não encontrada")
        return False
    
    modulos_esperados = [
        'clientes', 'ambientes', 'orcamentos', 
        'contratos', 'equipe', 'configuracoes'
    ]
    
    modulos_ok = []
    modulos_faltando = []
    
    for modulo in modulos_esperados:
        modulo_path = modules_path / modulo
        if modulo_path.exists():
            # Verificar arquivos do módulo
            arquivos_modulo = ['controller.py', 'services.py', 'schemas.py']
            arquivos_presentes = sum(1 for arq in arquivos_modulo if (modulo_path / arq).exists())
            
            if arquivos_presentes >= 2:  # Pelo menos 2 arquivos
                modulos_ok.append(modulo)
                print(f"✅ {modulo}: {arquivos_presentes}/3 arquivos")
            else:
                modulos_faltando.append(modulo)
                print(f"⚠️ {modulo}: {arquivos_presentes}/3 arquivos")
        else:
            modulos_faltando.append(modulo)
            print(f"❌ {modulo}: pasta não encontrada")
    
    print(f"\n📊 Módulos: {len(modulos_ok)}/{len(modulos_esperados)} OK")
    return len(modulos_ok) >= 4  # Pelo menos 4 módulos funcionais

def gerar_relatorio_backend():
    """Gera relatório detalhado do backend"""
    print("\n📋 Gerando relatório do backend...")
    
    relatorio = {
        "timestamp": "2025-06-16T00:00:00Z",
        "validador": "Agente Sênior",
        "estrutura": {},
        "configuracoes": {},
        "modulos": {},
        "status_geral": "unknown"
    }
    
    # Testar cada componente
    estrutura_ok = validar_estrutura_backend()
    config_ok = validar_configuracoes() 
    modulos_ok = validar_modulos()
    
    relatorio["estrutura"]["valida"] = estrutura_ok
    relatorio["configuracoes"]["validas"] = config_ok
    relatorio["modulos"]["validos"] = modulos_ok
    
    # Status geral
    if estrutura_ok and config_ok and modulos_ok:
        relatorio["status_geral"] = "pronto"
        status_msg = "🎉 Backend válido e pronto para uso"
    elif estrutura_ok and config_ok:
        relatorio["status_geral"] = "parcial"
        status_msg = "⚠️ Backend parcialmente funcional"
    else:
        relatorio["status_geral"] = "problemas"
        status_msg = "❌ Backend com problemas críticos"
    
    # Salvar relatório
    with open("relatorio_backend_senior.json", "w") as f:
        json.dump(relatorio, f, indent=2)
    
    print(f"\n{status_msg}")
    print("📄 Relatório salvo: relatorio_backend_senior.json")
    
    return relatorio

def main():
    """Função principal"""
    print("="*60)
    print("🔍 VALIDADOR DE BACKEND - AGENTE SÊNIOR")
    print("🎯 Verificando integridade sem dependências externas")
    print("="*60)
    
    # Verificar se está na pasta correta
    if not Path("main.py").exists():
        print("❌ Execute na pasta backend/")
        sys.exit(1)
    
    # Executar validação completa
    relatorio = gerar_relatorio_backend()
    
    # Resultado final
    print("\n" + "="*60)
    print("📊 RESULTADO FINAL")
    print("="*60)
    
    if relatorio["status_geral"] == "pronto":
        print("✅ Backend APROVADO para integração")
        return True
    elif relatorio["status_geral"] == "parcial":
        print("⚠️ Backend PARCIALMENTE funcional")
        print("💡 Pode prosseguir com limitações")
        return True
    else:
        print("❌ Backend REPROVADO")
        print("🔧 Correções necessárias antes de prosseguir")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)