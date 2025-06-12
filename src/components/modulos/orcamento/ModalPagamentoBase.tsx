import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ModalPagamentoBaseProps {
  isOpen: boolean;
  onClose: () => void;
  titulo: string;
  isLoading?: boolean;
  salvando?: boolean;
  erroValidacao?: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isFormValido?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Componente base para todos os modais de pagamento
 * Centraliza layout, estrutura e comportamentos comuns
 */
export function ModalPagamentoBase({
  isOpen,
  onClose,
  titulo,
  isLoading = false,
  salvando = false,
  erroValidacao,
  children,
  onSubmit,
  isFormValido = false,
  maxWidth = 'lg'
}: ModalPagamentoBaseProps) {
  
  // Configurações de largura máxima
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  // Classe CSS para feedback visual durante salvamento
  const getFormClass = () => {
    if (salvando) return "bg-green-50 dark:bg-green-900/20 transition-colors duration-200";
    return "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${maxWidthClasses[maxWidth]} max-h-[85vh] flex flex-col bg-white dark:bg-slate-900`}>
        
        {/* Header padrão */}
        <DialogHeader className="border-b border-slate-200 dark:border-slate-700 p-2 pb-1">
          <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {titulo}
          </DialogTitle>
        </DialogHeader>

        {/* Conteúdo principal */}
        <div className="flex-1 overflow-hidden">
          <form onSubmit={onSubmit} className="h-full flex flex-col">
            
            {/* Área de campos - com feedback visual */}
            <div className={`flex-1 overflow-y-auto p-2 ${getFormClass()}`}>
              <div className="space-y-1">
                {children}
              </div>
            </div>

            {/* Footer padrão com botões */}
            <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 pt-1">
              <div className="flex justify-end items-center gap-1">
                
                {/* Botão Cancelar */}
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                
                {/* Botão Salvar */}
                <button 
                  type="submit"
                  disabled={isLoading || !isFormValido || !!erroValidacao}
                  className="px-4 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium border border-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  {isLoading ? 'Salvando...' : 'Salvar'}
                </button>
                
              </div>
            </div>
            
          </form>
        </div>
        
      </DialogContent>
    </Dialog>
  );
} 