/**
 * Seção de formas de pagamento com lista e controles
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { FormaPagamento } from '@/types/simulador';
import { FormaPagamentoCard } from './forma-pagamento-card';

interface FormasPagamentoSectionProps {
  formasPagamento: FormaPagamento[];
  onEditarForma: (forma: FormaPagamento) => void;
  onRemoverForma: (id: string) => void;
  onLimparFormas: () => void;
  onAlternarTravamento: (id: string) => void;
  onOpenModal: () => void;
}

export function FormasPagamentoSection({
  formasPagamento,
  onEditarForma,
  onRemoverForma,
  onLimparFormas,
  onAlternarTravamento,
  onOpenModal
}: FormasPagamentoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">💳 Formas de Pagamento</CardTitle>
          <div className="flex gap-2">
            <DialogTrigger asChild>
              <Button onClick={onOpenModal} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Forma
              </Button>
            </DialogTrigger>
            
            {formasPagamento.length > 0 && (
              <Button 
                variant="outline" 
                onClick={onLimparFormas}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Limpar Tudo
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {formasPagamento.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma forma de pagamento adicionada</p>
            <p className="text-sm">Clique em "Adicionar Forma" para começar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formasPagamento.map((forma) => (
              <FormaPagamentoCard
                key={forma.id}
                forma={forma}
                onRemover={onRemoverForma}
                onEditar={onEditarForma}
                onAlternarTravamento={onAlternarTravamento}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}