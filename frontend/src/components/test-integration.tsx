"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { testBackendConnection, testMultipleEndpoints, ConnectivityResult } from '@/lib/health-check';
import { verificarConfiguracoes } from '@/lib/config';

/**
 * COMPONENTE DE TESTE DE INTEGRAÇÃO - FASE 1
 * Ricardo pode usar para verificar conectividade em tempo real
 */
export function TestIntegration() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<ConnectivityResult | null>(null);
  const [multipleResults, setMultipleResults] = useState<any[]>([]);

  const runHealthCheck = async () => {
    setTesting(true);
    try {
      const resultado = await testBackendConnection();
      setResult(resultado);
    } finally {
      setTesting(false);
    }
  };

  const runMultipleTests = async () => {
    setTesting(true);
    try {
      const resultados = await testMultipleEndpoints();
      setMultipleResults(resultados);
    } finally {
      setTesting(false);
    }
  };

  const config = verificarConfiguracoes();

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>🔗 Teste de Integração - Fase 1</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status da configuração */}
          <div>
            <h3 className="font-semibold mb-2">Status da Configuração</h3>
            <Badge variant={config.valido ? "default" : "destructive"}>
              {config.valido ? "✅ Configuração OK" : "❌ Problemas detectados"}
            </Badge>
            {!config.valido && (
              <ul className="mt-2 text-sm text-red-600">
                {config.problemas.map((problema, idx) => (
                  <li key={idx}>• {problema}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Botões de teste */}
          <div className="flex gap-4">
            <Button 
              onClick={runHealthCheck} 
              disabled={testing}
              variant="default"
            >
              {testing ? "Testando..." : "Testar Health Check"}
            </Button>
            
            <Button 
              onClick={runMultipleTests} 
              disabled={testing}
              variant="outline"
            >
              {testing ? "Testando..." : "Testar Múltiplos Endpoints"}
            </Button>
          </div>

          {/* Resultado do health check */}
          {result && (
            <div>
              <h3 className="font-semibold mb-2">Resultado Health Check</h3>
              <div className="bg-gray-50 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "✅ Sucesso" : "❌ Falha"}
                  </Badge>
                  {result.responseTime && (
                    <Badge variant="outline">
                      {result.responseTime}ms
                    </Badge>
                  )}
                </div>
                
                {result.data && (
                  <pre className="text-xs bg-white p-2 rounded border">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
                
                {result.error && (
                  <div className="text-red-600 text-sm">
                    <strong>Erro:</strong> {result.error}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resultados múltiplos */}
          {multipleResults.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Múltiplos Endpoints</h3>
              <div className="space-y-2">
                {multipleResults.map((res, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="font-mono text-sm">{res.endpoint}</span>
                    <Badge variant={res.success ? "default" : "destructive"}>
                      {res.success ? `✅ ${res.status}` : "❌ Falha"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}