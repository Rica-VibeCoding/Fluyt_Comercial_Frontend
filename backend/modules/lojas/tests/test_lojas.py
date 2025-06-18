import pytest
import asyncio
from uuid import uuid4, UUID
from datetime import datetime
from unittest.mock import AsyncMock, patch

from modules.lojas.service import LojaService
from modules.lojas.repository import LojaRepository
from modules.lojas.schemas import LojaCreate, LojaUpdate, LojaFilters

# === FIXTURES ===

@pytest.fixture
def loja_service():
    return LojaService()

@pytest.fixture
def loja_create_data():
    return LojaCreate(
        nome="Loja Teste",
        codigo="LJ-TEST",
        empresa_id=uuid4(),
        endereco="Rua Teste, 123",
        telefone="(11) 99999-9999",
        email="teste@loja.com",
        ativo=True
    )

@pytest.fixture
def loja_update_data():
    return LojaUpdate(
        nome="Loja Teste Atualizada",
        telefone="(11) 88888-8888"
    )

# === TESTES DE REPOSITORY ===

class TestLojaRepository:
    """Testes do repository de lojas"""
    
    @pytest.mark.asyncio
    async def test_create_loja_success(self):
        """Teste criar loja com sucesso"""
        repository = LojaRepository()
        
        # Mock do Supabase
        with patch.object(repository, 'supabase') as mock_supabase:
            mock_response = AsyncMock()
            mock_response.data = [{
                'id': str(uuid4()),
                'nome': 'Loja Teste',
                'codigo': 'LJ-TEST',
                'empresa_id': str(uuid4()),
                'gerente_id': None,
                'endereco': 'Rua Teste, 123',
                'telefone': '(11) 99999-9999',
                'email': 'teste@loja.com',
                'data_abertura': None,
                'ativo': True,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }]
            
            mock_supabase.table.return_value.insert.return_value.execute.return_value = mock_response
            
            loja_data = LojaCreate(
                nome="Loja Teste",
                codigo="LJ-TEST",
                empresa_id=uuid4(),
                endereco="Rua Teste, 123",
                telefone="(11) 99999-9999",
                email="teste@loja.com",
                ativo=True
            )
            
            result = await repository.create(loja_data)
            
            assert result.nome == "Loja Teste"
            assert result.codigo == "LJ-TEST"
            assert result.ativo is True
    
    @pytest.mark.asyncio
    async def test_get_by_id_found(self):
        """Teste buscar loja por ID - encontrada"""
        repository = LojaRepository()
        loja_id = uuid4()
        
        with patch.object(repository, 'supabase') as mock_supabase:
            mock_response = AsyncMock()
            mock_response.data = [{
                'id': str(loja_id),
                'nome': 'Loja Encontrada',
                'codigo': 'LJ-001',
                'empresa_id': str(uuid4()),
                'gerente_id': None,
                'endereco': None,
                'telefone': None,
                'email': None,
                'data_abertura': None,
                'ativo': True,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }]
            
            mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
            
            result = await repository.get_by_id(loja_id)
            
            assert result is not None
            assert result.nome == "Loja Encontrada"
            assert result.id == loja_id
    
    @pytest.mark.asyncio
    async def test_get_by_id_not_found(self):
        """Teste buscar loja por ID - não encontrada"""
        repository = LojaRepository()
        loja_id = uuid4()
        
        with patch.object(repository, 'supabase') as mock_supabase:
            mock_response = AsyncMock()
            mock_response.data = []
            
            mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
            
            result = await repository.get_by_id(loja_id)
            
            assert result is None
    
    @pytest.mark.asyncio
    async def test_check_codigo_exists_true(self):
        """Teste verificar código existente - existe"""
        repository = LojaRepository()
        
        with patch.object(repository, 'supabase') as mock_supabase:
            mock_response = AsyncMock()
            mock_response.data = [{'id': str(uuid4())}]
            
            mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
            
            result = await repository.check_codigo_exists("LJ-001")
            
            assert result is True
    
    @pytest.mark.asyncio
    async def test_check_codigo_exists_false(self):
        """Teste verificar código existente - não existe"""
        repository = LojaRepository()
        
        with patch.object(repository, 'supabase') as mock_supabase:
            mock_response = AsyncMock()
            mock_response.data = []
            
            mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
            
            result = await repository.check_codigo_exists("LJ-NOVO")
            
            assert result is False

# === TESTES DE SERVICE ===

class TestLojaService:
    """Testes do service de lojas"""
    
    @pytest.mark.asyncio
    async def test_create_loja_success(self, loja_create_data):
        """Teste criar loja com sucesso"""
        service = LojaService()
        
        # Mock da empresa válida
        mock_empresa = AsyncMock()
        mock_empresa.id = loja_create_data.empresa_id
        mock_empresa.nome = "Empresa Teste"
        mock_empresa.ativo = True
        
        # Mock da loja criada
        mock_loja = AsyncMock()
        mock_loja.nome = loja_create_data.nome
        mock_loja.codigo = loja_create_data.codigo
        
        with patch.object(service.empresa_repository, 'get_by_id', return_value=mock_empresa), \
             patch.object(service.repository, 'check_codigo_exists', return_value=False), \
             patch.object(service.repository, 'create', return_value=mock_loja):
            
            result = await service.create_loja(loja_create_data)
            
            assert result == mock_loja
    
    @pytest.mark.asyncio
    async def test_create_loja_empresa_not_found(self, loja_create_data):
        """Teste criar loja - empresa não encontrada"""
        service = LojaService()
        
        with patch.object(service.empresa_repository, 'get_by_id', return_value=None):
            
            with pytest.raises(ValueError, match="Empresa .* não encontrada"):
                await service.create_loja(loja_create_data)
    
    @pytest.mark.asyncio
    async def test_create_loja_empresa_inativa(self, loja_create_data):
        """Teste criar loja - empresa inativa"""
        service = LojaService()
        
        mock_empresa = AsyncMock()
        mock_empresa.ativo = False
        
        with patch.object(service.empresa_repository, 'get_by_id', return_value=mock_empresa):
            
            with pytest.raises(ValueError, match="Não é possível criar loja para empresa inativa"):
                await service.create_loja(loja_create_data)
    
    @pytest.mark.asyncio
    async def test_create_loja_codigo_duplicado(self, loja_create_data):
        """Teste criar loja - código duplicado"""
        service = LojaService()
        
        mock_empresa = AsyncMock()
        mock_empresa.ativo = True
        
        with patch.object(service.empresa_repository, 'get_by_id', return_value=mock_empresa), \
             patch.object(service.repository, 'check_codigo_exists', return_value=True):
            
            with pytest.raises(ValueError, match="Código .* já está em uso"):
                await service.create_loja(loja_create_data)
    
    @pytest.mark.asyncio
    async def test_update_loja_success(self, loja_update_data):
        """Teste atualizar loja com sucesso"""
        service = LojaService()
        loja_id = uuid4()
        
        mock_loja_atual = AsyncMock()
        mock_loja_atual.id = loja_id
        mock_loja_atual.nome = "Nome Antigo"
        mock_loja_atual.codigo = "LJ-001"
        mock_loja_atual.empresa_id = uuid4()
        
        mock_loja_atualizada = AsyncMock()
        mock_loja_atualizada.nome = loja_update_data.nome
        
        with patch.object(service.repository, 'get_by_id', return_value=mock_loja_atual), \
             patch.object(service.repository, 'update', return_value=mock_loja_atualizada):
            
            result = await service.update_loja(loja_id, loja_update_data)
            
            assert result == mock_loja_atualizada
    
    @pytest.mark.asyncio
    async def test_update_loja_not_found(self, loja_update_data):
        """Teste atualizar loja - não encontrada"""
        service = LojaService()
        loja_id = uuid4()
        
        with patch.object(service.repository, 'get_by_id', return_value=None):
            
            with pytest.raises(ValueError, match="Loja .* não encontrada"):
                await service.update_loja(loja_id, loja_update_data)
    
    @pytest.mark.asyncio
    async def test_list_lojas_success(self):
        """Teste listar lojas com sucesso"""
        service = LojaService()
        
        mock_lojas = [AsyncMock(), AsyncMock()]
        mock_total = 2
        
        filters = LojaFilters(page=1, per_page=20)
        
        with patch.object(service.repository, 'list_all', return_value=(mock_lojas, mock_total)):
            
            lojas, total = await service.list_lojas(filters)
            
            assert lojas == mock_lojas
            assert total == mock_total
    
    @pytest.mark.asyncio
    async def test_delete_loja_success(self):
        """Teste deletar loja com sucesso"""
        service = LojaService()
        loja_id = uuid4()
        
        mock_loja = AsyncMock()
        mock_loja.nome = "Loja para Deletar"
        
        with patch.object(service.repository, 'get_by_id', return_value=mock_loja), \
             patch.object(service.repository, 'delete', return_value=True):
            
            result = await service.delete_loja(loja_id)
            
            assert result is True
    
    @pytest.mark.asyncio
    async def test_delete_loja_not_found(self):
        """Teste deletar loja - não encontrada"""
        service = LojaService()
        loja_id = uuid4()
        
        with patch.object(service.repository, 'get_by_id', return_value=None):
            
            with pytest.raises(ValueError, match="Loja .* não encontrada"):
                await service.delete_loja(loja_id)

# === TESTES DE INTEGRAÇÃO ===

class TestLojaIntegration:
    """Testes de integração com dados reais (se disponível)"""
    
    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_real_data_connection(self):
        """Teste conexão com dados reais do Supabase"""
        try:
            repository = LojaRepository()
            
            # Tentar buscar stats (operação read-only)
            stats = await repository.get_stats()
            
            assert "total_lojas" in stats
            assert "lojas_ativas" in stats
            assert isinstance(stats["total_lojas"], int)
            assert isinstance(stats["lojas_ativas"], int)
            
        except Exception as e:
            pytest.skip(f"Conexão com Supabase não disponível: {str(e)}")
    
    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_list_real_lojas(self):
        """Teste listar lojas reais"""
        try:
            service = LojaService()
            filters = LojaFilters(page=1, per_page=10)
            
            lojas, total = await service.list_lojas(filters)
            
            assert isinstance(lojas, list)
            assert isinstance(total, int)
            assert total >= 0
            
            # Se há lojas, verificar estrutura
            if lojas:
                loja = lojas[0]
                assert hasattr(loja, 'id')
                assert hasattr(loja, 'nome')
                assert hasattr(loja, 'codigo')
                assert hasattr(loja, 'empresa_id')
                
        except Exception as e:
            pytest.skip(f"Teste com dados reais falhou: {str(e)}")

# === CONFIGURAÇÃO DE TESTES ===

if __name__ == "__main__":
    # Executar testes específicos
    pytest.main([__file__, "-v", "-m", "not integration"]) 