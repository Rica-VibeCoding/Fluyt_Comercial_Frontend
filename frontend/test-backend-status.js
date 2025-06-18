// Script para verificar status do backend
async function checkBackend() {
  console.log('🔍 Verificando status do backend...\n');
  
  try {
    // 1. Verificar se o backend está rodando
    const healthResponse = await fetch('http://localhost:8000/api/v1/test/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Backend está rodando!');
      console.log('📋 Resposta:', JSON.stringify(healthData, null, 2));
    } else {
      console.log('❌ Backend retornou erro:', healthResponse.status);
    }
    
    // 2. Verificar dados iniciais
    console.log('\n🔍 Verificando dados iniciais...');
    const dadosResponse = await fetch('http://localhost:8000/api/v1/test/dados-iniciais', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (dadosResponse.ok) {
      const dados = await dadosResponse.json();
      console.log('✅ Dados iniciais obtidos!');
      
      if (dados.data) {
        console.log(`\n📊 Lojas: ${dados.data.lojas?.length || 0}`);
        console.log(`📊 Equipe: ${dados.data.equipe?.length || 0}`);
        console.log(`📊 Configurações: ${dados.data.configs?.length || 0}`);
        
        // Mostrar primeira loja
        if (dados.data.lojas?.[0]) {
          const loja = dados.data.lojas[0];
          console.log(`\n🏢 Primeira loja: ${loja.nome} (ID: ${loja.id})`);
        }
      }
    }
    
    // 3. Testar listagem de clientes
    console.log('\n🔍 Testando listagem de clientes...');
    const clientesResponse = await fetch('http://localhost:8000/api/v1/test/clientes?loja_id=317c3115-e071-40a6-9bc5-7c3227e0d82c', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (clientesResponse.ok) {
      const clientesData = await clientesResponse.json();
      console.log('✅ Endpoint de clientes respondeu!');
      console.log(`📊 Total de clientes: ${clientesData.data?.clientes?.length || 0}`);
      
      // Verificar se está usando mock
      if (clientesData.message?.includes('mock')) {
        console.log('\n⚠️  ATENÇÃO: Backend está usando dados MOCK!');
      } else {
        console.log('\n✅ Backend parece estar usando dados REAIS');
      }
      
      // Mostrar primeiro cliente
      if (clientesData.data?.clientes?.[0]) {
        const cliente = clientesData.data.clientes[0];
        console.log(`\n👤 Primeiro cliente: ${cliente.nome}`);
        console.log(`   Telefone: ${cliente.telefone}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar com backend:', error.message);
    console.log('\n💡 Verifique se o backend está rodando em http://localhost:8000');
  }
}

checkBackend();