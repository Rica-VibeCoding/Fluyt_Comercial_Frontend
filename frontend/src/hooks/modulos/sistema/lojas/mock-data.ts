import type { Loja } from '@/types/sistema';

// Mock data para desenvolvimento
export const mockLojas: Loja[] = [
  {
    id: '1',
    nome: 'D-Art',
    codigo: 'LJ-001',
    endereco: null,
    telefone: null,
    email: null,
    gerente_id: 'gerente-1',
    gerente: 'Cleiton',
    funcionarios: 2,
    vendasMes: 0,
    metaMes: 0,
    ativa: true,
    empresaId: '7c5d7db9-b713-4207-9239-6712eb69cb84',
    empresa: 'D-Art Mobiliário Sob Medida',
    dataAbertura: null,
    createdAt: '2020-01-15T10:00:00Z'
  },
  {
    id: '2',
    nome: 'Romanza',
    codigo: 'LJ-002',
    endereco: null,
    telefone: null,
    email: null,
    gerente_id: 'gerente-2',
    gerente: 'Tom',
    funcionarios: 2,
    vendasMes: 0,
    metaMes: 0,
    ativa: true,
    empresaId: '7c5d7db9-b713-4207-9239-6712eb69cb84',
    empresa: 'D-Art Mobiliário Sob Medida',
    dataAbertura: null,
    createdAt: '2022-06-10T10:00:00Z'
  }
];