/**
 * Header do simulador com navegação e controles principais
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { ClienteSelectorUniversal } from '@/components/shared/cliente-selector-universal';

interface SimuladorHeaderProps {
  onAvancarParaContratos: () => void;
  podeAvancar: boolean;
  formasPagamento: number;
  motivoDesabilitado?: string;
}

export function SimuladorHeader({ 
  onAvancarParaContratos, 
  podeAvancar, 
  formasPagamento,
  motivoDesabilitado 
}: SimuladorHeaderProps) {
  const router = useRouter();

  const buttonTitle = motivoDesabilitado || 
    (!podeAvancar 
      ? "Adicione ambientes para continuar" 
      : formasPagamento === 0 
        ? "Adicione pelo menos uma forma de pagamento" 
        : "Avançar para contratos");

  return (
    <Card>
      <CardContent className="p-4 min-h-[80px] flex items-center">
        <div className="flex items-center justify-between w-full">
          {/* Navegação e Cliente - ESQUERDA */}
          <div className="flex items-center gap-4">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => router.push('/painel/ambientes')}
              className="gap-2 h-12 px-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-semibold text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="h-6 w-px bg-gray-300" />
            
            <div className="w-80">
              <ClienteSelectorUniversal 
                targetRoute="/painel/orcamento/simulador"
                placeholder="Selecionar cliente..."
                integraSessao={true}
              />
            </div>
          </div>

          {/* Botão Avançar para Contratos - DIREITA */}
          <Button 
            onClick={onAvancarParaContratos} 
            size="sm" 
            disabled={!podeAvancar || formasPagamento === 0}
            className="gap-2 h-12 px-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title={buttonTitle}
          >
            Avançar para Contratos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}