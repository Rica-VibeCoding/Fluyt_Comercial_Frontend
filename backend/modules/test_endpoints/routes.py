"""
Rotas temporárias para testes SEM AUTENTICAÇÃO.

⚠️ REMOVER APÓS VALIDAÇÃO COMPLETA!
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from decimal import Decimal

from .schemas import (
    TestClienteCreate,
    TestClienteUpdate,
    TestAmbienteCreate, 
    TestOrcamentoCreate,
    TestCalculoEngine,
    TestResponse,
    TestRLSValidation
)
from .service import TestService
from .mock_service import MockTestService

router = APIRouter(tags=["TESTE_TEMPORARIO"])  # SEM PREFIX AQUI

# Singleton para manter estado entre requisições
_test_service_instance = None

# FORÇA RESET DO SINGLETON - REMOVER DEPOIS
import time
_timestamp_reset = time.time()

def get_test_service():
    """Retorna uma instância singleton do TestService ou MockTestService"""
    global _test_service_instance
    
    # FORÇA USAR TESTSERVICE REAL - REMOVER DEPOIS  
    _test_service_instance = None
    
    if _test_service_instance is None:
        try:
            # Tentar usar TestService real
            from .service import TestService
            service = TestService()
            _test_service_instance = service
            print(f"✅ Usando TestService REAL (Supabase)")
        except Exception as e:
            print(f"❌ ERRO ao criar TestService: {type(e).__name__}: {e}")
            print(f"⚠️  Usando MockTestService como fallback")
            from .mock_service import MockTestService
            mock_service = MockTestService()
            # Adicionar clientes de teste para debug
            mock_service.created_clientes = [
                {
                    "id": "mock-001",
                    "nome": "Cliente Teste 1",
                    "cpf_cnpj": "12345678901",
                    "telefone": "11999999999",
                    "email": "teste1@email.com",
                    "endereco": "Rua Teste, 123",
                    "cidade": "São Paulo",
                    "cep": "01234567",
                    "loja_id": "317c3115-e071-40a6-9bc5-7c3227e0d82c",
                    "tipo_venda": "NORMAL",
                    "created_at": "2025-01-01T10:00:00"
                },
                {
                    "id": "mock-002",
                    "nome": "Cliente Teste 2",
                    "cpf_cnpj": "98765432101",
                    "telefone": "11888888888",
                    "email": "teste2@email.com",
                    "endereco": "Av. Exemplo, 456",
                    "cidade": "São Paulo",
                    "cep": "09876543",
                    "loja_id": "317c3115-e071-40a6-9bc5-7c3227e0d82c",
                    "tipo_venda": "NORMAL",
                    "created_at": "2025-01-02T14:30:00"
                }
            ]
            _test_service_instance = mock_service
    
    return _test_service_instance

@router.get("/")
async def info_testes():
    """Informações sobre os endpoints de teste"""
    # Verificar qual serviço está sendo usado
    test_service = get_test_service()
    service_type = type(test_service).__name__
    
    return {
        "aviso": "⚠️ ENDPOINTS TEMPORÁRIOS SEM AUTENTICAÇÃO",
        "objetivo": "Testar funcionalidades completas do sistema",
        "remover_apos": "Validação completa",
        "service_em_uso": service_type,
        "usando_mock": service_type == "MockTestService",
        "endpoints_disponiveis": [
            "GET /test/dados-iniciais - Buscar lojas, equipe, configs",
            "POST /test/cliente - Criar cliente",
            "GET /test/clientes - Listar clientes por loja",
            "POST /test/ambiente - Criar ambiente",
            "POST /test/orcamento - Criar orçamento completo",
            "GET /test/orcamentos - Listar orçamentos por loja",
            "POST /test/calculo - Testar engine isoladamente",
            "POST /test/rls - Testar isolamento RLS",
            "POST /test/validacoes - Testar validações Pydantic"
        ]
    }

@router.get("/debug/service")
async def debug_service():
    """Debug: Verificar qual serviço está em uso e dados"""
    test_service = get_test_service()
    service_type = type(test_service).__name__
    
    # Se for MockTestService, mostrar clientes criados
    if hasattr(test_service, 'created_clientes'):
        clientes_mock = test_service.created_clientes
    else:
        clientes_mock = "N/A - TestService real"
    
    return {
        "service_type": service_type,
        "is_mock": service_type == "MockTestService",
        "clientes_mock": clientes_mock,
        "supabase_configured": hasattr(test_service, '_supabase')
    }

@router.get("/dados-iniciais", response_model=TestResponse)
async def buscar_dados_iniciais():
    """Buscar dados iniciais necessários para testes"""
    test_service = get_test_service()
    return await test_service.buscar_dados_iniciais()

@router.post("/cliente", response_model=TestResponse)
async def criar_cliente_teste(dados: TestClienteCreate):
    """Criar cliente para teste - SEM JWT"""
    test_service = get_test_service()
    return await test_service.criar_cliente_teste(dados)

@router.get("/clientes", response_model=TestResponse)
async def listar_clientes_teste(loja_id: str = Query(..., description="ID da loja")):
    """Listar clientes por loja - Teste RLS"""
    print(f"🚨 ROTA CHAMADA: listar_clientes_teste com loja_id={loja_id}")
    test_service = get_test_service()
    print(f"🚨 SERVICE TIPO: {type(test_service).__name__}")
    
    # Log adicional para debug
    if type(test_service).__name__ == "MockTestService":
        print(f"⚠️  ATENÇÃO: Usando MockTestService - dados não são do Supabase!")
    else:
        print(f"✅ Usando TestService REAL - buscando dados do Supabase")
    
    result = await test_service.listar_clientes_teste(loja_id)
    print(f"🚨 RESULTADO: {result.message}")
    
    # Log dos clientes retornados
    if result.success and result.data.get('clientes'):
        print(f"📊 Total de clientes retornados: {len(result.data['clientes'])}")
        if result.data['clientes']:
            print(f"👤 Primeiro cliente: {result.data['clientes'][0].get('nome', 'Sem nome')}")
    
    return result

@router.put("/cliente/{cliente_id}", response_model=TestResponse)
async def atualizar_cliente_teste(cliente_id: str, dados: TestClienteUpdate):
    """Atualizar cliente para teste - SEM JWT"""
    test_service = get_test_service()
    return await test_service.atualizar_cliente_teste(cliente_id, dados)

@router.delete("/cliente/{cliente_id}", response_model=TestResponse)
async def excluir_cliente_teste(cliente_id: str):
    """Excluir cliente para teste - SEM JWT"""
    test_service = get_test_service()
    return await test_service.excluir_cliente_teste(cliente_id)

@router.post("/ambiente", response_model=TestResponse)
async def criar_ambiente_teste(dados: TestAmbienteCreate):
    """Criar ambiente para teste"""
    test_service = get_test_service()
    return await test_service.criar_ambiente_teste(dados)

@router.post("/orcamento", response_model=TestResponse)
async def criar_orcamento_teste(dados: TestOrcamentoCreate):
    """Criar orçamento completo com cálculos automáticos"""
    test_service = get_test_service()
    return await test_service.criar_orcamento_teste(dados)

@router.get("/orcamentos", response_model=TestResponse)
async def listar_orcamentos_teste(loja_id: str = Query(..., description="ID da loja")):
    """Listar orçamentos por loja - Teste RLS"""
    test_service = get_test_service()
    return await test_service.listar_orcamentos_teste(loja_id)

@router.post("/calculo", response_model=TestResponse)
async def testar_calculo_engine(dados: TestCalculoEngine):
    """Testar engine de cálculo isoladamente"""
    test_service = get_test_service()
    return await test_service.calcular_custos_engine(
        valor_ambientes=dados.valor_ambientes,
        desconto_percentual=dados.desconto_percentual,
        loja_id=dados.loja_id,
        vendedor_id=dados.vendedor_id,
        custos_adicionais=dados.custos_adicionais or []
    )

@router.post("/rls", response_model=TestResponse)  
async def testar_rls_isolamento(dados: TestRLSValidation):
    """Testar isolamento RLS entre lojas"""
    test_service = get_test_service()
    return await test_service.testar_rls_isolamento(
        loja_origem=dados.loja_origem,
        loja_destino=dados.loja_destino
    )

@router.post("/validacoes")
async def testar_validacoes_pydantic():
    """Testar validações Pydantic com dados inválidos"""
    try:
        # Teste 1: Cliente com dados inválidos
        test_service = get_test_service()
        try:
            TestClienteCreate(
                nome="",  # Inválido - vazio
                cpf_cnpj="123",  # Inválido - muito curto
                telefone="abc",  # Inválido - não numérico
                endereco="",  # Inválido - vazio
                cidade="",  # Inválido - vazio
                cep="123",  # Inválido - muito curto
                loja_id=""  # Inválido - vazio
            )
        except Exception as e:
            teste1_erro = str(e)
        else:
            teste1_erro = "FALHOU - Deveria ter dado erro!"

        # Teste 2: Orçamento com valores negativos
        try:
            TestCalculoEngine(
                valor_ambientes=Decimal('-1000'),  # Inválido - negativo
                desconto_percentual=Decimal('150'),  # Inválido - > 100%
                loja_id="",  # Inválido - vazio
                vendedor_id=""  # Inválido - vazio
            )
        except Exception as e:
            teste2_erro = str(e)
        else:
            teste2_erro = "FALHOU - Deveria ter dado erro!"

        return TestResponse(
            success=True,
            message="Validações Pydantic testadas",
            data={
                "teste_cliente_invalido": teste1_erro,
                "teste_calculo_invalido": teste2_erro,
                "conclusao": "Validações funcionando se houve erros acima"
            }
        )

    except Exception as e:
        return TestResponse(
            success=False,
            message="Erro ao testar validações",
            errors=[str(e)]
        )

# Endpoints especiais para testes específicos

@router.post("/cenario-completo")
async def executar_cenario_completo_teste():
    """
    Executa um cenário completo de teste:
    1. Busca dados iniciais
    2. Cria cliente
    3. Cria ambientes  
    4. Cria orçamento
    5. Valida cálculos
    """
    try:
        resultados = []
        
        # 1. Buscar dados iniciais
        test_service = get_test_service()
        dados_iniciais = await test_service.buscar_dados_iniciais()
        resultados.append({"etapa": "dados_iniciais", "resultado": dados_iniciais})
        
        if not dados_iniciais.success or not dados_iniciais.data['lojas']:
            return TestResponse(
                success=False,
                message="Falha ao buscar dados iniciais",
                data={"resultados": resultados}
            )
        
        loja_id = dados_iniciais.data['lojas'][0]['id']
        vendedor_id = dados_iniciais.data['equipe'][0]['id'] if dados_iniciais.data['equipe'] else None
        
        if not vendedor_id:
            return TestResponse(
                success=False,
                message="Nenhum vendedor encontrado para teste",
                data={"resultados": resultados}
            )
        
        # 2. Criar cliente
        test_service = get_test_service()
        cliente_dados = TestClienteCreate(
            nome="Cliente Teste Completo",
            cpf_cnpj="12345678901",
            telefone="11999999999",
            email="teste@email.com",
            endereco="Rua Teste, 123",
            cidade="São Paulo",
            cep="01234567",
            loja_id=loja_id,
            tipo_venda="NORMAL"
        )
        
        cliente_resultado = await test_service.criar_cliente_teste(cliente_dados)
        resultados.append({"etapa": "criar_cliente", "resultado": cliente_resultado})
        
        if not cliente_resultado.success:
            return TestResponse(
                success=False,
                message="Falha ao criar cliente",
                data={"resultados": resultados}
            )
        
        cliente_id = cliente_resultado.data['cliente']['id']
        
        # 3. Criar ambientes
        test_service = get_test_service()
        ambiente1_dados = TestAmbienteCreate(
            nome_ambiente="Cozinha Teste",
            nome_cliente="Cliente Teste",
            valor_total=Decimal('25000'),
            linha_produto="Unique",
            descricao_completa="Cozinha completa teste",
            loja_id=loja_id
        )
        
        ambiente1_resultado = await test_service.criar_ambiente_teste(ambiente1_dados)
        resultados.append({"etapa": "criar_ambiente1", "resultado": ambiente1_resultado})
        
        ambiente2_dados = TestAmbienteCreate(
            nome_ambiente="Dormitório Teste",
            nome_cliente="Cliente Teste",
            valor_total=Decimal('15000'),
            linha_produto="Sublime",
            descricao_completa="Dormitório completo teste",
            loja_id=loja_id
        )
        
        ambiente2_resultado = await test_service.criar_ambiente_teste(ambiente2_dados)
        resultados.append({"etapa": "criar_ambiente2", "resultado": ambiente2_resultado})
        
        if not ambiente1_resultado.success or not ambiente2_resultado.success:
            return TestResponse(
                success=False,
                message="Falha ao criar ambientes",
                data={"resultados": resultados}
            )
        
        ambientes_ids = [
            ambiente1_resultado.data['ambiente']['id'],
            ambiente2_resultado.data['ambiente']['id']
        ]
        
        # 4. Criar orçamento
        test_service = get_test_service()
        orcamento_dados = TestOrcamentoCreate(
            cliente_id=cliente_id,
            vendedor_id=vendedor_id,
            loja_id=loja_id,
            ambientes_ids=ambientes_ids,
            desconto_percentual=Decimal('10'),
            custos_adicionais=[
                {"descricao": "Taxa projeto especial", "valor": 500},
                {"descricao": "Comissão indicador", "valor": 300}
            ]
        )
        
        orcamento_resultado = await test_service.criar_orcamento_teste(orcamento_dados)
        resultados.append({"etapa": "criar_orcamento", "resultado": orcamento_resultado})
        
        # 5. Validar cálculo específico R$ 40.000 → R$ 2.400
        test_service = get_test_service()
        calculo_teste_dados = TestCalculoEngine(
            valor_ambientes=Decimal('40000'),
            desconto_percentual=Decimal('0'),
            loja_id=loja_id,
            vendedor_id=vendedor_id,
            custos_adicionais=[]
        )
        
        calculo_teste_resultado = await test_service.calcular_custos_engine(
            valor_ambientes=calculo_teste_dados.valor_ambientes,
            desconto_percentual=calculo_teste_dados.desconto_percentual,
            loja_id=calculo_teste_dados.loja_id,
            vendedor_id=calculo_teste_dados.vendedor_id,
            custos_adicionais=calculo_teste_dados.custos_adicionais
        )
        resultados.append({"etapa": "teste_calculo_40k", "resultado": calculo_teste_resultado})
        
        # Verificar se comissão está correta (deve ser R$ 2.400)
        comissao_esperada = 2400.0
        comissao_calculada = calculo_teste_resultado.data['custos']['comissao_vendedor'] if calculo_teste_resultado.success else 0
        calculo_correto = abs(comissao_calculada - comissao_esperada) < 0.01
        
        return TestResponse(
            success=True,
            message="Cenário completo executado",
            data={
                "resultados": resultados,
                "validacao_calculo": {
                    "valor_testado": 40000,
                    "comissao_esperada": comissao_esperada,
                    "comissao_calculada": comissao_calculada,
                    "calculo_correto": calculo_correto
                },
                "resumo": {
                    "etapas_executadas": len(resultados),
                    "sucessos": sum(1 for r in resultados if r["resultado"].success),
                    "falhas": sum(1 for r in resultados if not r["resultado"].success)
                }
            }
        )
        
    except Exception as e:
        return TestResponse(
            success=False,
            message="Erro no cenário completo",
            errors=[str(e)]
        )

# =============================================================================
# ENDPOINTS DE TESTE PARA EQUIPE (CRUD TEMPORÁRIO)
# =============================================================================

@router.put("/equipe/{funcionario_id}", response_model=TestResponse)
async def atualizar_funcionario_teste(funcionario_id: str, dados: dict):
    """
    Endpoint temporário para atualizar funcionário enquanto auth não está implementada
    """
    try:
        test_service = get_test_service()
        
        # Para teste, vamos sempre usar dados simulados para evitar problemas de validação
        print(f"Simulando atualização para funcionário {funcionario_id} com dados: {dados}")
        funcionario_atual = {
            "id": funcionario_id,
            "nome": "Funcionário Teste Original",
            "email": "teste@empresa.com",
            "telefone": "11999999999",
            "salario": 3500.00,
            "setor_id": "setor-teste",
            "loja_id": "loja-teste",
            "perfil": "vendedor",
            "nivel_acesso": "usuario",
            "ativo": True
        }
        
        if not funcionario_atual:
            return TestResponse(
                success=False,
                message=f"Funcionário {funcionario_id} não encontrado",
                errors=["FUNCIONARIO_NAO_ENCONTRADO"]
            )
        
        # Simular atualização (usar dados de teste por enquanto)
        funcionario_atualizado = {
            "id": funcionario_id,
            "nome": dados.get("nome", funcionario_atual.get("nome")),
            "email": dados.get("email", funcionario_atual.get("email")),
            "telefone": dados.get("telefone", funcionario_atual.get("telefone")),
            "salario": dados.get("salario", funcionario_atual.get("salario")),
            "setor_id": dados.get("setor_id", funcionario_atual.get("setor_id")),
            "loja_id": dados.get("loja_id", funcionario_atual.get("loja_id")),
            "perfil": dados.get("perfil", funcionario_atual.get("perfil")),
            "nivel_acesso": dados.get("nivel_acesso", funcionario_atual.get("nivel_acesso")),
            "ativo": dados.get("ativo", funcionario_atual.get("ativo", True)),
            "updated_at": "2025-01-27T18:00:00"
        }
        
        return TestResponse(
            success=True,
            message="Funcionário atualizado com sucesso (TESTE)",
            data={
                "funcionario": funcionario_atualizado,
                "observacao": "Esta é uma simulação - dados não foram persistidos no banco real"
            }
        )
        
    except Exception as e:
        print(f"Erro ao atualizar funcionário teste: {e}")  # Usando print ao invés de logger
        return TestResponse(
            success=False,
            message="Erro ao atualizar funcionário",
            errors=[str(e)]
        )

@router.post("/equipe", response_model=TestResponse)
async def criar_funcionario_teste(dados: dict):
    """
    Endpoint temporário para criar funcionário enquanto auth não está implementada
    """
    try:
        import uuid
        funcionario_id = str(uuid.uuid4())
        
        funcionario_criado = {
            "id": funcionario_id,
            "nome": dados.get("nome", "Funcionário Teste"),
            "email": dados.get("email", "teste@empresa.com"),
            "telefone": dados.get("telefone", "11999999999"),
            "salario": dados.get("salario", 3500.00),
            "setor_id": dados.get("setor_id"),
            "loja_id": dados.get("loja_id"),
            "perfil": dados.get("perfil", "vendedor"),
            "nivel_acesso": dados.get("nivel_acesso", "usuario"),
            "ativo": True,
            "created_at": "2025-01-27T18:00:00",
            "updated_at": "2025-01-27T18:00:00"
        }
        
        return TestResponse(
            success=True,
            message="Funcionário criado com sucesso (TESTE)",
            data={
                "funcionario": funcionario_criado,
                "observacao": "Esta é uma simulação - dados não foram persistidos no banco real"
            }
        )
        
    except Exception as e:
        print(f"Erro ao criar funcionário teste: {e}")  # Usando print ao invés de logger
        return TestResponse(
            success=False,
            message="Erro ao criar funcionário",
            errors=[str(e)]
        )

@router.delete("/equipe/{funcionario_id}", response_model=TestResponse)
async def excluir_funcionario_teste(funcionario_id: str):
    """
    Endpoint temporário para excluir funcionário enquanto auth não está implementada
    """
    try:
        return TestResponse(
            success=True,
            message=f"Funcionário {funcionario_id} excluído com sucesso (TESTE)",
            data={
                "funcionario_id": funcionario_id,
                "observacao": "Esta é uma simulação - dados não foram removidos do banco real"
            }
        )
        
    except Exception as e:
        print(f"Erro ao excluir funcionário teste: {e}")  # Usando print ao invés de logger
        return TestResponse(
            success=False,
            message="Erro ao excluir funcionário",
            errors=[str(e)]
        )

@router.patch("/equipe/{funcionario_id}/toggle-status", response_model=TestResponse)
async def alternar_status_funcionario_teste(funcionario_id: str):
    """
    Endpoint temporário para alternar status funcionário enquanto auth não está implementada
    """
    try:
        test_service = get_test_service()
        
        # Buscar funcionário atual para saber o status
        from modules.equipe.repository import EquipeRepository
        repo = EquipeRepository()
        funcionario_atual = await repo.get_by_id(funcionario_id)
        
        if not funcionario_atual:
            return TestResponse(
                success=False,
                message=f"Funcionário {funcionario_id} não encontrado",
                errors=["FUNCIONARIO_NAO_ENCONTRADO"]
            )
        
        status_atual = funcionario_atual.get("ativo", True)
        novo_status = not status_atual
        
        return TestResponse(
            success=True,
            message=f"Status alterado: {'Ativado' if novo_status else 'Desativado'} (TESTE)",
            data={
                "funcionario_id": funcionario_id,
                "status_anterior": status_atual,
                "novo_status": novo_status,
                "observacao": "Esta é uma simulação - status não foi alterado no banco real"
            }
        )
        
    except Exception as e:
        print(f"Erro ao alternar status funcionário teste: {e}")  # Usando print ao invés de logger
        return TestResponse(
            success=False,
            message="Erro ao alternar status do funcionário",
            errors=[str(e)]
        ) 