'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, DollarSign, FileText, CreditCard, Building, Lock, Unlock } from 'lucide-react';
import { FormaPagamento } from '@/lib/sessao-simples';

interface ListaFormasPagamentoProps {
  formas: FormaPagamento[];
  onEditar: (forma: FormaPagamento) => void;
  onRemover: (id: string) => void;
  onToggleTravamento?: (id: string) => void;
}

// Configuração de cores profissionais por tipo
const CORES_FORMAS = {
  'a-vista': {
    bg: 'bg-green-50 dark:bg-green-900/10',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-300',
    icon: DollarSign,
    nome: 'À Vista'
  },
  'boleto': {
    bg: 'bg-blue-50 dark:bg-blue-900/10',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    icon: FileText,
    nome: 'Boleto'
  },
  'cartao': {
    bg: 'bg-purple-50 dark:bg-purple-900/10',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-300',
    icon: CreditCard,
    nome: 'Cartão'
  },
  'financeira': {
    bg: 'bg-orange-50 dark:bg-orange-900/10',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-700 dark:text-orange-300',
    icon: Building,
    nome: 'Financeira'
  }
} as const;

// Função para formatar valor em reais
const formatarValor = (valor: number): string => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

// Função para obter dados formatados por tipo
const obterDadosFormatados = (forma: FormaPagamento): string[] => {
  const dados = [];
  
  // Valor principal
  dados.push(formatarValor(forma.valor));
  
  // Dados específicos por tipo
  switch (forma.tipo) {
    case 'a-vista':
      if (forma.dados?.data) {
        const data = new Date(forma.dados.data).toLocaleDateString('pt-BR');
        dados.push(`Recebimento: ${data}`);
      }
      break;
      
    case 'boleto':
    case 'cartao':
    case 'financeira':
      if (forma.parcelas) {
        dados.push(`${forma.parcelas}x de ${formatarValor(forma.valor / forma.parcelas)}`);
      }
      break;
  }
  
  // Valor deflacionado (sempre mostrar se diferente do valor nominal)
  if (forma.valorPresente !== forma.valor) {
    dados.push(`Deflacionado: ${formatarValor(forma.valorPresente)}`);
  }
  
  return dados;
};

export function ListaFormasPagamento({ 
  formas, 
  onEditar, 
  onRemover, 
  onToggleTravamento 
}: ListaFormasPagamentoProps) {
  
  if (formas.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto">
      {formas.map((forma) => {
        const config = CORES_FORMAS[forma.tipo];
        const IconeComponent = config.icon;
        const dadosFormatados = obterDadosFormatados(forma);
        
        return (
          <Card 
            key={forma.id}
            className={`${config.bg} ${config.border} border transition-all duration-200 hover:shadow-sm`}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                
                {/* Seção esquerda: Ícone + Dados */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg ${config.bg} ${config.border} border`}>
                    <IconeComponent className={`h-4 w-4 ${config.text}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold ${config.text} mb-1`}>
                      {config.nome}
                    </h4>
                    <div className="space-y-0.5">
                      {dadosFormatados.map((dado, index) => (
                        <p 
                          key={index}
                          className={`text-xs ${index === 0 ? config.text : 'text-slate-600 dark:text-slate-400'} truncate`}
                        >
                          {dado}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Seção direita: Travamento + Ações */}
                <div className="flex items-center gap-1 ml-2">
                  
                  {/* Ícone de Travamento */}
                  {onToggleTravamento && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleTravamento(forma.id)}
                      className={`h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 ${config.text}`}
                      title={forma.travada ? 'Destravado' : 'Travado'}
                    >
                      {forma.travada ? (
                        <Lock className="h-3.5 w-3.5" />
                      ) : (
                        <Unlock className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}

                  {/* Botão Editar */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditar(forma)}
                    className={`h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 ${config.text}`}
                    title="Editar"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>

                  {/* Botão Remover */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemover(forma.id)}
                    className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                    title="Remover"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 