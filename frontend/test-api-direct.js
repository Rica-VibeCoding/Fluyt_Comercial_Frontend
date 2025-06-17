// Script para testar API diretamente
const API_BASE_URL = 'http://localhost:8000';
const LOJA_ID = '317c3115-e071-40a6-9bc5-7c3227e0d82c';

async function testAPI() {
  console.log('🔍 Testando API de clientes...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/test/clientes?loja_id=${LOJA_ID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    
    if (!response.ok) {
      console.error('❌ Erro na resposta:', response.status, response.statusText);
      return;
    }

    const data = await response.json();
    console.log('\n✅ Resposta da API:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.data && data.data.clientes) {
      console.log('\n📋 Clientes encontrados:', data.data.clientes.length);
      data.data.clientes.forEach((cliente, index) => {
        console.log(`\n${index + 1}. ${cliente.nome}`);
        console.log(`   CPF/CNPJ: ${cliente.cpf_cnpj}`);
        console.log(`   Telefone: ${cliente.telefone}`);
        console.log(`   Cidade: ${cliente.cidade}`);
      });
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com API:', error.message);
    console.log('\n💡 Certifique-se de que o backend está rodando em http://localhost:8000');
  }
}

testAPI();