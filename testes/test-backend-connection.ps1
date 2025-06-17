# 🧪 TESTE DE CONECTIVIDADE BACKEND - WINDOWS POWERSHELL
# Arquivo: testes/test-backend-connection.ps1
# Propósito: Verificar se backend está funcionando corretamente no Windows

Write-Host "🔍 TESTANDO CONECTIVIDADE BACKEND..." -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# 1. Teste básico - Health check
Write-Host "`n1️⃣ Testando endpoint base..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Health check OK: $($response | ConvertTo-Json -Compress)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check falhou: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Teste endpoint de teste base  
Write-Host "`n2️⃣ Testando endpoint /api/v1/test/..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/test/" -Method Get -TimeoutSec 5
    Write-Host "✅ Endpoint test OK" -ForegroundColor Green
    Write-Host "Endpoints disponíveis:" -ForegroundColor Cyan
    $response.endpoints_disponiveis | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }
} catch {
    Write-Host "❌ Endpoint test falhou: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Teste específico de clientes
Write-Host "`n3️⃣ Testando endpoint clientes..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/test/clientes?loja_id=550e8400-e29b-41d4-a716-446655440001" -Method Get -TimeoutSec 5
    Write-Host "✅ Endpoint clientes OK" -ForegroundColor Green
    Write-Host "Resposta: $($response | ConvertTo-Json -Compress)" -ForegroundColor White
} catch {
    Write-Host "❌ Endpoint clientes falhou: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Teste dados iniciais
Write-Host "`n4️⃣ Testando dados iniciais..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/test/dados-iniciais" -Method Get -TimeoutSec 5
    Write-Host "✅ Dados iniciais OK" -ForegroundColor Green
    Write-Host "Lojas encontradas: $($response.data.lojas.Count)" -ForegroundColor White
    Write-Host "Equipe encontrada: $($response.data.equipe.Count)" -ForegroundColor White
} catch {
    Write-Host "❌ Dados iniciais falharam: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Teste criar cliente
Write-Host "`n5️⃣ Testando criação de cliente..." -ForegroundColor Yellow
try {
    $clienteData = @{
        nome = "Cliente Teste PowerShell"
        cpf_cnpj = "12345678901"
        telefone = "11999999999"
        email = "teste@powershell.com"
        endereco = "Rua Teste PowerShell, 123"
        cidade = "São Paulo"
        cep = "01234567"
        loja_id = "550e8400-e29b-41d4-a716-446655440001"
        tipo_venda = "NORMAL"
    }
    
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/test/cliente" -Method Post -Body ($clienteData | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 5
    Write-Host "✅ Criação de cliente OK" -ForegroundColor Green
    Write-Host "Cliente criado: $($response.data.cliente.nome)" -ForegroundColor White
} catch {
    Write-Host "❌ Criação de cliente falhou: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Testes concluídos!" -ForegroundColor Green
Write-Host "`n📋 COMANDOS PARA EXECUÇÃO MANUAL:" -ForegroundColor Cyan
Write-Host "cd C:\Users\ricar\Projetos\Fluyt_Comercial\testes" -ForegroundColor White  
Write-Host ".\test-backend-connection.ps1" -ForegroundColor White