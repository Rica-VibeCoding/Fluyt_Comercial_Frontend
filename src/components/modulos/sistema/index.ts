/**
 * Barrel exports para componentes do sistema
 */

// Comissões
export { ComissaoForm } from './comissoes/comissao-form';
export { ComissaoTable } from './comissoes/comissao-table';
export { GestaoComissoes } from './comissoes/gestao-comissoes';

// Configurações
export { ConfigLoja } from './configuracoes/config-loja';
export { ResetDados } from './configuracoes/reset-dados';
export { TesteConectividade } from './configuracoes/teste-conectividade';

// Empresas
export { EmpresaForm } from './empresas/empresa-form';
export { EmpresaTable } from './empresas/empresa-table';
export { GestaoEmpresas } from './empresas/gestao-empresas';

// Equipe
export { FuncionarioForm } from './equipe/funcionario-form';
export { FuncionarioTable } from './equipe/funcionario-table';
export { GestaoEquipe } from './equipe/gestao-equipe';

// Lojas  
export { default as GestaoLojas } from './lojas/gestao-lojas';
export { LojaTable } from './lojas/loja-table';

// Prestadores
export { GestaoMontadores } from './prestadores/gestao-montadores';
export { GestaoTransportadoras } from './prestadores/gestao-transportadoras';
export { MontadorForm } from './prestadores/montador-form';
export { MontadorTable } from './prestadores/montador-table';
export { TransportadoraForm } from './prestadores/transportadora-form';
export { TransportadoraTable } from './prestadores/transportadora-table';

// Setores
export { GestaoSetores } from './setores/gestao-setores';
export { SetorForm } from './setores/setor-form';
export { SetorTable } from './setores/setor-table';