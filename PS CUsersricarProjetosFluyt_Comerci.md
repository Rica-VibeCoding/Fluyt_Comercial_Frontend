
PS C:\Users\ricar\Projetos\Fluyt_Comercial\backend> ./venv/Scripts/uvicorn.exe main:app --host
>>   "0.0.0.0" --port 8000 --reload
No linha:2 caractere:15
+   "0.0.0.0" --port 8000 --reload
+               ~~~~
Token 'port' inesperado na expressão ou instrução.
No linha:2 caractere:3
+   "0.0.0.0" --port 8000 --reload
+   ~~~~~~~~~
O operador '--' funciona apenas em variáveis ou propriedades.
    + CategoryInfo          : ParserError: (:) [], ParentContainsErrorRecordE  
   xception
    + FullyQualifiedErrorId : UnexpectedToken

PS C:\Users\ricar\Projetos\Fluyt_Comercial\backend> ./venv/Scripts/uvicorn.exe main:app --host
>>   localhost --port 8000 --reload
Error: Option '--host' requires an argument.
localhost : O termo 'localhost' não é reconhecido como nome de cmdlet, 
função, arquivo de script ou programa operável. Verifique a grafia do nome     
ou, se um caminho tiver sido incluído, veja se o caminho está correto e tente  
novamente.
No linha:2 caractere:3
+   localhost --port 8000 --reload
+   ~~~~~~~~~
    + CategoryInfo          : ObjectNotFound: (localhost:String) [], CommandN  
   otFoundException
    + FullyQualifiedErrorId : CommandNotFoundException

PS C:\Users\ricar\Projetos\Fluyt_Comercial\backend>   ./venv/Scripts/python.exe
 main.py
2025-06-17 01:46:22,241 - __main__ - WARNING - ⚠️ Alguns módulos ainda não impllementados: email-validator is not installed, run `pip install pydantic[email]` 
2025-06-17 01:46:22,450 - __main__ - WARNING - 🚨 ENDPOINTS DE TESTE TEMPORÁRIOS ATIVADOS - REMOVER EM PRODUÇÃO!
2025-06-17 01:46:22,451 - __main__ - INFO - ✅ Test endpoints carregados: 13 rotas
C:\Users\ricar\Projetos\Fluyt_Comercial\backend\main.py:352: DeprecationWarning:
        on_event is deprecated, use lifespan event handlers instead.

        Read more about it in the
        [FastAPI docs for Lifespan Events](https://fastapi.tiangolo.com/advanced/events/).

  @app.on_event("startup")
INFO:     Will watch for changes in these directories: ['C:\\Users\\ricar\\Projetos\\Fluyt_Comercial\\backend']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [14032] using WatchFiles
2025-06-17 01:46:23,037 - __mp_main__ - WARNING - ⚠️ Alguns módulos ainda não iimplementados: email-validator is not installed, run `pip install pydantic[email]`
2025-06-17 01:46:23,262 - __mp_main__ - WARNING - 🚨 ENDPOINTS DE TESTE TEMPORÁRIOS ATIVADOS - REMOVER EM PRODUÇÃO!
2025-06-17 01:46:23,262 - __mp_main__ - INFO - ✅ Test endpoints carregados: 13 rotas
2025-06-17 01:46:23,320 - main - WARNING - ⚠️ Alguns módulos ainda não implemenntados: email-validator is not installed, run `pip install pydantic[email]`     
2025-06-17 01:46:23,329 - main - WARNING - 🚨 ENDPOINTS DE TESTE TEMPORÁRIOS ATIVADOS - REMOVER EM PRODUÇÃO!
2025-06-17 01:46:23,329 - main - INFO - ✅ Test endpoints carregados: 13 rotas 
INFO:     Started server process [47692]
INFO:     Waiting for application startup.
2025-06-17 01:46:23,330 - main - INFO - 🚀 Iniciando Fluyt Comercial API...    
2025-06-17 01:46:23,330 - main - INFO - ✅ Configurações validadas - Ambiente: development
2025-06-17 01:46:23,330 - main - INFO - 📊 Supabase URL: https://momwbpxqnvgehotfmvde.supabase.co
2025-06-17 01:46:23,330 - main - INFO - 🔐 JWT configurado - Expiração: 60min  
INFO:     Application startup complete.