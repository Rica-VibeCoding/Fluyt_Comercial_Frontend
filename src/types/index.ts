/**
 * Barrel exports para todos os tipos TypeScript
 */

// Tipos de ambiente
export type { Ambiente, Acabamento, AmbienteFormData } from './ambiente';

// Tipos de cliente
export type { Cliente, ClienteFormData } from './cliente';

// Tipos de contrato - tipos de exemplo, não implementados ainda

// Tipos de simulador/orçamento
export type { 
  FormaPagamento, 
  Simulacao, 
  TravamentoConfig, 
  TipoFormaPagamento 
} from './simulador';

// Tipos do sistema
export type { 
  Empresa, 
  EmpresaFormData,
  Funcionario, 
  FuncionarioFormData,
  Setor, 
  SetorFormData,
  Loja, 
  LojaFormData,
  RegraComissao, 
  RegraComissaoFormData,
  Montador, 
  MontadorFormData,
  Transportadora, 
  TransportadoraFormData,
  BaseEntity,
  StatusEntity
} from './sistema';