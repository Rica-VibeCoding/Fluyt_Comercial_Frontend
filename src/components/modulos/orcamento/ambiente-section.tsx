import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Package } from 'lucide-react';
import { Ambiente } from '@/types/ambiente';

interface AmbienteSectionProps {
  ambientes: Ambiente[];
  valorTotal: number;
  clienteNome?: string;
}

export function AmbienteSection({ ambientes, valorTotal, clienteNome }: AmbienteSectionProps) {
  if (ambientes.length === 0) {
    return (
      <Card className="border-dashed border-gray-300">
        <CardContent className="p-8">
          <div className="text-center text-gray-500">
            <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Nenhum ambiente selecionado</p>
            <p className="text-sm">
              {clienteNome 
                ? `Navegue para Ambientes para adicionar ambientes para ${clienteNome}`
                : 'Selecione um cliente e navegue para Ambientes primeiro'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Building className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl">🏢 Ambientes do Projeto</CardTitle>
              {clienteNome && (
                <p className="text-sm text-muted-foreground mt-1">
                  Cliente: {clienteNome}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Valor Total dos Ambientes</p>
            <p className="text-2xl font-bold text-green-600">
              {valorTotal.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ambientes.map((ambiente) => (
            <div
              key={ambiente.id}
              className="border rounded-lg p-4 hover:border-blue-200 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-lg">{ambiente.nome}</h4>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">
                    {ambiente.valorTotal.toLocaleString('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    })}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {ambiente.acabamentos.length} acabamentos
                  </Badge>
                </div>
              </div>
              
              {/* Acabamentos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {ambiente.acabamentos.map((acabamento) => (
                  <div
                    key={acabamento.id}
                    className="bg-gray-50 rounded p-2 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{acabamento.tipo}</span>
                      <span className="text-gray-600">
                        {acabamento.valor.toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        })}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <span>{acabamento.cor}</span>
                      <span className="mx-1">•</span>
                      <span>{acabamento.material}</span>
                      <span className="mx-1">•</span>
                      <span>{acabamento.espessura}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}