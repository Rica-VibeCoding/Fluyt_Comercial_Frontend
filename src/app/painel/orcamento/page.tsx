'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSessaoSimples } from '@/hooks/globais/use-sessao-simples';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OrcamentoPage() {
  const searchParams = useSearchParams();
  const { cliente, ambientes, carregarClienteDaURL } = useSessaoSimples();
  const [desconto, setDesconto] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const clienteId = searchParams.get('clienteId');
    const clienteNome = searchParams.get('clienteNome');
    
    console.log('🔍 Parâmetros da URL:', { clienteId, clienteNome });
    
    if (clienteId && clienteNome) {
      console.log('📥 Carregando cliente da URL...');
      carregarClienteDaURL(clienteId, decodeURIComponent(clienteNome));
    }
    
    setIsLoaded(true);
  }, [searchParams, carregarClienteDaURL]);
  
  // Evitar hidration mismatch - mostrar loading até carregar
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header de Navegação */}
        <div className="bg-white border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/painel">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </Link>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">Orçamento</h1>
                <p className="text-sm text-gray-600">Simulador simples</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-lg font-semibold">{cliente ? cliente.nome : 'Sem cliente'}</p>
            </div>
          </div>
        </div>
        
        {/* Layout: 1/3 esquerda + 2/3 direita - com alinhamento superior */}
        <div className="grid grid-cols-3 gap-6">
          
          {/* Coluna esquerda (1/3) - Valor Total + Ambientes */}
          <div className="col-span-1 flex flex-col">
            
            {/* Card Valor Total - altura dinâmica igual aos cards da direita */}
            <div className="flex-none h-[88px] mb-6">
              <Card className="h-full">
                <CardContent className="p-4 h-full flex flex-col justify-between">
                  <h3 className="font-semibold">Valor Total</h3>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {ambientes.reduce((total, ambiente) => total + ambiente.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Card Ambientes */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Ambientes</h3>
                
                <div className="flex justify-between border-b-2 pb-2 mb-2 font-semibold text-sm">
                  <span>Nome</span>
                  <span>Valor</span>
                </div>
                
                <div className="space-y-1">
                  {ambientes.length > 0 ? ambientes.map((ambiente) => (
                    <div key={ambiente.id} className="flex justify-between py-1 border-b">
                      <span className="font-medium">{ambiente.nome}</span>
                      <span className="text-green-600">
                        R$ {ambiente.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-center py-4">Nenhum ambiente</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
          </div>

          {/* Coluna direita (2/3) - 3 Cards superiores + Plano de Pagamento */}
          <div className="col-span-2 flex flex-col">
            
            {/* 3 Cards superiores - altura fixa igual ao Valor Total */}
            <div className="flex-none grid grid-cols-3 gap-4 h-[88px] mb-6">
              
              {/* Card Valor Negociado */}
              <div className="flex">
                <Card className="flex-1">
                  <CardContent className="p-4 h-full flex flex-col justify-between">
                    <h3 className="font-semibold">Valor Negociado</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {(() => {
                        const valorTotal = ambientes.reduce((total, ambiente) => total + ambiente.valor, 0);
                        const descontoNumero = parseFloat(desconto) || 0;
                        const valorNegociado = valorTotal - (valorTotal * descontoNumero / 100);
                        return `R$ ${valorNegociado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                      })()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Card Desconto Real */}
              <div className="flex">
                <Card className="flex-1">
                  <CardContent className="p-4 h-full flex flex-col justify-between">
                    <h3 className="font-semibold">Desconto Real</h3>
                    <p className="text-2xl text-gray-400">Calculando...</p>
                  </CardContent>
                </Card>
              </div>

              {/* Card Valor Recebido */}
              <div className="flex">
                <Card className="flex-1">
                  <CardContent className="p-4 h-full flex flex-col justify-between">
                    <h3 className="font-semibold">Valor Recebido</h3>
                    <p className="text-2xl text-gray-400">Calculando...</p>
                  </CardContent>
                </Card>
              </div>
              
            </div>

            {/* Card Plano de Pagamento */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Plano de Pagamento</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Desconto (%)</label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={desconto}
                      onChange={(e) => setDesconto(e.target.value)}
                      placeholder="0"
                      className="pr-8"
                      max="100"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                  {desconto && (
                    <p className="text-sm text-gray-600 mt-1">
                      Desconto aplicado: {desconto}%
                    </p>
                  )}
                </div>
                
              </CardContent>
            </Card>
            
          </div>
          
        </div>
        
      </div>
    </div>
  );
}