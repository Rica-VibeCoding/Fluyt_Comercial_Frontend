'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BotaoTesteBackend } from '@/components/debug/botao-teste-backend';
import { TestIntegration } from '@/components/test-integration';

export default function HomePage() {
  const router = useRouter();
  const [showTest, setShowTest] = useState(false);

  const goToClientes = () => {
    router.push('/painel/clientes');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-4xl mx-auto p-8">
        <div className="text-3xl font-bold mb-4 text-gray-800">🏢 Sistema Fluyt Comercial</div>
        <div className="text-gray-600 mb-8">Sistema de gestão comercial para móveis planejados</div>
        
        <div className="flex gap-4 justify-center mb-8">
          <Button onClick={goToClientes} size="lg">
            Acessar Sistema
          </Button>
          <Button 
            onClick={() => setShowTest(!showTest)} 
            variant="outline" 
            size="lg"
          >
            {showTest ? 'Ocultar' : 'Mostrar'} Teste Backend
          </Button>
        </div>
        
        {/* TESTE DE INTEGRAÇÃO - FASE 1 */}
        {showTest && (
          <div className="mt-8 border-2 border-blue-500 border-dashed rounded-lg bg-blue-50">
            <h2 className="text-xl font-bold mb-4 text-blue-700 p-6 pb-0">🔧 TESTE DE INTEGRAÇÃO - FASE 1</h2>
            <TestIntegration />
            <div className="p-6 pt-0">
              <div className="border-t border-blue-200 pt-4">
                <h3 className="font-semibold text-blue-700 mb-2">Teste Anterior (Compatibilidade)</h3>
                <BotaoTesteBackend />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 