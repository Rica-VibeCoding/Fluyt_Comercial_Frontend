export interface Cliente {
  id: string;
  nome: string;
  cpf_cnpj: string;
  rg_ie: string;
  email?: string;
  telefone: string;
  tipo_venda: 'NORMAL' | 'FUTURA';
  procedencia: string;
  vendedor_id: string;
  vendedor_nome: string;
  cep: string;
  logradouro: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface ClienteFormData {
  nome: string;
  cpf_cnpj: string;
  rg_ie: string;
  email?: string;
  telefone: string;
  tipo_venda: 'NORMAL' | 'FUTURA';
  procedencia: string;
  vendedor_id: string;
  cep: string;
  logradouro: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  observacoes?: string;
}

export interface FiltrosCliente {
  busca?: string;
  tipo_venda?: 'NORMAL' | 'FUTURA' | '';
  procedencia?: string;
  vendedor_id?: string;
  data_inicio?: string;
  data_fim?: string;
}

export interface Vendedor {
  id: string;
  nome: string;
}

export const PROCEDENCIAS = [
  'Instagram',
  'Facebook', 
  'Site',
  'Google Ads',
  'Indicação Amigo',
  'Indicação Arquiteto',
  'Feira',
  'Loja Física',
  'WhatsApp',
  'Outros'
] as const;

export const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const;