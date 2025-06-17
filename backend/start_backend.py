#!/usr/bin/env python3
"""
SCRIPT FORÇADO PARA INICIAR BACKEND COM ENDPOINTS DE TESTE
Resolve problema de cache/ambiente Windows
"""

import sys
import os
import shutil

# Limpar cache Python completamente
def limpar_cache():
    print("🧹 Limpando cache Python...")
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    for root, dirs, files in os.walk(current_dir):
        # Remover arquivos .pyc
        for file in files:
            if file.endswith('.pyc'):
                try:
                    os.remove(os.path.join(root, file))
                except:
                    pass
        
        # Remover diretórios __pycache__
        if '__pycache__' in dirs:
            try:
                shutil.rmtree(os.path.join(root, '__pycache__'))
            except:
                pass

# Forçar reimport de módulos
def forcar_reimport():
    print("🔄 Forçando reimport de módulos...")
    modules_to_remove = []
    for module_name in sys.modules:
        if module_name.startswith('modules.') or module_name.startswith('core.'):
            modules_to_remove.append(module_name)
    
    for module_name in modules_to_remove:
        del sys.modules[module_name]

if __name__ == "__main__":
    print("🚀 INICIANDO BACKEND FORÇADO...")
    
    # Limpar cache
    limpar_cache()
    
    # Forçar reimport
    forcar_reimport()
    
    # Importar e executar main
    print("📦 Importando main...")
    
    # Adicionar diretório atual ao path
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    
    # Importar main
    import main
    
    print("✅ Backend iniciado via script forçado!")