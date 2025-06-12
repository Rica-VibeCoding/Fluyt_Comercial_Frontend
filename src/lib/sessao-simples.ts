/**
 * SESSÃO ULTRA SIMPLES - RESET TOTAL
 * Uma única fonte de verdade, máxima simplicidade
 */

export interface ClienteSimples {
  id: string;
  nome: string;
}

export interface AmbienteSimples {
  id: string;
  nome: string;
  valor: number;
}

export interface SessaoSimples {
  cliente: ClienteSimples | null;
  ambientes: AmbienteSimples[];
  valorTotal: number;
}

class SessaoSimplesManager {
  private readonly CHAVE = 'fluyt_sessao_simples';
  
  // Carregar sessão
  public carregar(): SessaoSimples {
    if (typeof window === 'undefined') {
      return this.getEstadoVazio();
    }
    
    try {
      const dados = localStorage.getItem(this.CHAVE);
      if (dados) {
        const sessao = JSON.parse(dados) as SessaoSimples;
        console.log('📥 Sessão carregada:', sessao);
        return sessao;
      }
    } catch (error) {
      console.warn('Erro ao carregar sessão:', error);
    }
    
    return this.getEstadoVazio();
  }
  
  // Salvar sessão
  public salvar(sessao: SessaoSimples): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.CHAVE, JSON.stringify(sessao));
      console.log('💾 Sessão salva:', sessao);
    } catch (error) {
      console.warn('Erro ao salvar sessão:', error);
    }
  }
  
  // Definir cliente
  public definirCliente(cliente: ClienteSimples): SessaoSimples {
    const sessaoAtual = this.carregar();
    const novaSessao: SessaoSimples = {
      ...sessaoAtual,
      cliente,
      // Se mudou cliente, limpar ambientes
      ambientes: sessaoAtual.cliente?.id === cliente.id ? sessaoAtual.ambientes : [],
      valorTotal: sessaoAtual.cliente?.id === cliente.id ? sessaoAtual.valorTotal : 0
    };
    
    this.salvar(novaSessao);
    return novaSessao;
  }
  
  // Definir ambientes
  public definirAmbientes(ambientes: AmbienteSimples[]): SessaoSimples {
    const sessaoAtual = this.carregar();
    const valorTotal = ambientes.reduce((total, amb) => total + amb.valor, 0);
    
    const novaSessao: SessaoSimples = {
      ...sessaoAtual,
      ambientes,
      valorTotal
    };
    
    this.salvar(novaSessao);
    return novaSessao;
  }
  
  // Limpar tudo
  public limpar(): SessaoSimples {
    const sessaoVazia = this.getEstadoVazio();
    this.salvar(sessaoVazia);
    return sessaoVazia;
  }
  
  // Verificar se pode gerar orçamento
  public podeGerarOrcamento(): boolean {
    const sessao = this.carregar();
    return !!(sessao.cliente && sessao.ambientes.length > 0 && sessao.valorTotal > 0);
  }
  
  // Estado vazio
  private getEstadoVazio(): SessaoSimples {
    return {
      cliente: null,
      ambientes: [],
      valorTotal: 0
    };
  }
  
  // Debug
  public debug(): void {
    console.log('🔍 DEBUG SESSÃO SIMPLES:', this.carregar());
  }
}

// Instância singleton
export const sessaoSimples = new SessaoSimplesManager();