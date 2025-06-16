/**
 * TESTE DE INTEGRAÇÃO COMPLETA - SÊNIOR
 * Testa APIs refatoradas sem dependências TypeScript
 */

// Simulação das configurações
const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  ENDPOINTS: {
    HEALTH: '/health'
  },
  REQUEST_TIMEOUT: 5000,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Função de teste simplificada
async function testBackendConnection() {
  const startTime = Date.now();
  console.log('🔗 Iniciando teste de conectividade...');

  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);
    
    const response = await fetch(url, {
      headers: API_CONFIG.DEFAULT_HEADERS,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend conectado com sucesso');
      
      return {
        success: true,
        data,
        status: response.status,
        responseTime,
        timestamp: new Date().toISOString()
      };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      console.log('❌ Timeout na conexão');
      return {
        success: false,
        error: 'Timeout na conexão com o backend',
        responseTime,
        timestamp: new Date().toISOString()
      };
    }
    
    console.log('❌ Erro de conectividade:', error.message);
    
    return {
      success: false,
      error: error.message,
      responseTime,
      timestamp: new Date().toISOString()
    };
  }
}

// Teste de múltiplos endpoints
async function testMultipleEndpoints() {
  console.log('🔍 Testando múltiplos endpoints...');
  
  const endpoints = [
    '/health',
    '/api/v1/docs',
    '/api/v1/clientes',
    '/api/v1/ambientes'
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      console.log(`📡 Testando: ${endpoint}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(url, {
        headers: API_CONFIG.DEFAULT_HEADERS,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      results.push({
        endpoint,
        success: response.ok,
        status: response.status,
        timestamp: new Date().toISOString()
      });
      
      console.log(`${response.ok ? '✅' : '❌'} ${endpoint}: ${response.status}`);
      
    } catch (error) {
      results.push({
        endpoint,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }

  return results;
}

// Teste principal
async function runFullIntegrationTest() {
  console.log('=' .repeat(60));
  console.log('🚀 TESTE DE INTEGRAÇÃO COMPLETA - AGENTE SÊNIOR');
  console.log('=' .repeat(60));

  // Teste 1: Conectividade básica
  console.log('\n📋 TESTE 1: Conectividade Backend');
  const healthResult = await testBackendConnection();
  
  // Teste 2: Múltiplos endpoints  
  console.log('\n📋 TESTE 2: Múltiplos Endpoints');
  const endpointsResult = await testMultipleEndpoints();
  
  // Teste 3: Validação da estrutura frontend
  console.log('\n📋 TESTE 3: Estrutura Frontend');
  const fs = await import('fs');
  const path = await import('path');
  
  const frontendFiles = [
    'src/lib/api-client.ts',
    'src/lib/health-check.ts', 
    'src/lib/config.ts',
    'src/app/page.tsx'
  ];
  
  const frontendStatus = frontendFiles.map(file => {
    const exists = fs.existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
    return { file, exists };
  });

  // Relatório final
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RELATÓRIO FINAL DE INTEGRAÇÃO');
  console.log('=' .repeat(60));
  
  const report = {
    timestamp: new Date().toISOString(),
    tester: 'Agente Sênior',
    tests: {
      backend_health: healthResult,
      endpoints: endpointsResult,
      frontend_files: frontendStatus
    },
    summary: {
      backend_reachable: healthResult.success,
      endpoints_tested: endpointsResult.length,
      endpoints_working: endpointsResult.filter(r => r.success).length,
      frontend_files_ok: frontendStatus.filter(f => f.exists).length,
      integration_status: 'unknown'
    }
  };
  
  // Determinar status da integração
  if (healthResult.success && frontendStatus.every(f => f.exists)) {
    report.summary.integration_status = 'ready';
    console.log('🎉 INTEGRAÇÃO PRONTA PARA USO');
  } else if (frontendStatus.every(f => f.exists)) {
    report.summary.integration_status = 'frontend_ready';  
    console.log('⚠️ FRONTEND PRONTO - BACKEND OFFLINE');
  } else {
    report.summary.integration_status = 'needs_work';
    console.log('❌ INTEGRAÇÃO PRECISA DE CORREÇÕES');
  }
  
  // Salvar relatório
  fs.writeFileSync('RELATORIO_INTEGRACAO_FINAL.json', JSON.stringify(report, null, 2));
  console.log('📄 Relatório salvo: RELATORIO_INTEGRACAO_FINAL.json');
  
  return report;
}

// Executar teste
runFullIntegrationTest().catch(console.error);