'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, DollarSign, FileText, Building } from 'lucide-react';
import { ModalAVista } from './modal-a-vista';
import { ModalBoleto } from './modal-boleto';

interface ModalFormasPagamentoProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModalFormasPagamento({ isOpen, onClose }: ModalFormasPagamentoProps) {
  const [modalAVistaAberto, setModalAVistaAberto] = useState(false);
  const [modalBoletoAberto, setModalBoletoAberto] = useState(false);
  const formasPagamento = [
    {
      id: 'a-vista',
      nome: 'À Vista',
      icone: DollarSign,
      cor: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700'
    },
    {
      id: 'boleto',
      nome: 'Boleto',
      icone: FileText,
      cor: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
    },
    {
      id: 'cartao',
      nome: 'Cartão',
      icone: CreditCard,
      cor: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700'
    },
    {
      id: 'financeira',
      nome: 'Financeira',
      icone: Building,
      cor: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700'
    }
  ];

  const handleFormaPagamento = (forma: string) => {
    console.log('Forma de pagamento selecionada:', forma);
    
    if (forma === 'a-vista') {
      setModalAVistaAberto(true);
      return;
    }
    
    if (forma === 'boleto') {
      setModalBoletoAberto(true);
      return;
    }
    
    // TODO: Implementar outros modais (cartão, financeira)
    console.log('Modal para', forma, 'ainda não implementado');
    onClose();
  };

  const handleSalvarAVista = (dados: { valor: number; data: string }) => {
    console.log('Dados À Vista salvos:', dados);
    // TODO: Adicionar à lista de formas de pagamento
    setModalAVistaAberto(false);
    onClose();
  };

  const handleSalvarBoleto = (dados: { valor: number; parcelas: any[] }) => {
    console.log('Dados Boleto salvos:', dados);
    // TODO: Adicionar à lista de formas de pagamento
    setModalBoletoAberto(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Escolha a Forma de Pagamento</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          {formasPagamento.map((forma) => {
            const IconeComponent = forma.icone;
            return (
              <Button
                key={forma.id}
                variant="outline"
                className={`h-20 flex flex-col items-center justify-center gap-2 ${forma.cor}`}
                onClick={() => handleFormaPagamento(forma.id)}
              >
                <IconeComponent className="h-6 w-6" />
                <span className="font-medium">{forma.nome}</span>
              </Button>
            );
          })}
        </div>
      </DialogContent>
      
      {/* Modal À Vista */}
      <ModalAVista
        isOpen={modalAVistaAberto}
        onClose={() => setModalAVistaAberto(false)}
        onSalvar={handleSalvarAVista}
      />

      {/* Modal Boleto */}
      <ModalBoleto
        isOpen={modalBoletoAberto}
        onClose={() => setModalBoletoAberto(false)}
        onSalvar={handleSalvarBoleto}
      />
    </Dialog>
  );
}