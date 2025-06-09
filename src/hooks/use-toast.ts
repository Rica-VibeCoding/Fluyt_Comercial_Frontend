import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: any;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, action, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, title, description, action, variant };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);

    return {
      id,
      dismiss: () => setToasts(prev => prev.filter(t => t.id !== id))
    };
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    setToasts(prev => toastId ? prev.filter(t => t.id !== toastId) : []);
  }, []);

  return {
    toast,
    dismiss,
    toasts
  };
} 