'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Users, Building2, Calculator, FileText } from 'lucide-react';

export const useStepper = () => {
  const router = useRouter();
  const pathname = usePathname();

  const steps = [
    { 
      id: 1, 
      path: '/painel/clientes', 
      label: 'Cliente', 
      description: 'Cadastro concluído',
      icon: Users
    },
    { 
      id: 2, 
      path: '/painel/ambientes', 
      label: 'Ambientes', 
      description: '4 ambientes importados',
      icon: Building2
    },
    { 
      id: 3, 
      path: '/painel/orcamento', 
      label: 'Orçamento', 
      description: 'Em andamento',
      icon: Calculator
    },
    { 
      id: 4, 
      path: '/painel/contratos', 
      label: 'Contrato', 
      description: 'Pendente',
      icon: FileText
    }
  ];

  const getCurrentStep = (): number => {
    if (pathname.includes('/clientes')) return 1;
    if (pathname.includes('/ambientes')) return 2;
    if (pathname.includes('/orcamento')) return 3;
    if (pathname.includes('/contratos')) return 4;
    return 1;
  };

  const navigateToStep = (stepId: number) => {
    const step = steps.find(s => s.id === stepId);
    if (step) {
      router.push(step.path);
    }
  };

  return {
    currentStep: getCurrentStep(),
    steps,
    navigateToStep
  };
}; 