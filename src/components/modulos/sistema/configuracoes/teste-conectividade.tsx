import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wifi, WifiOff, CheckCircle, XCircle, Database } from 'lucide-react';
import { testConnection, checkAuthStatus, isSupabaseConfigured } from '@/lib/supabase';

interface TestResult {
  success: boolean;
  message: string;
  error?: string;
  data?: any;
}

export function TesteConectividade() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [authStatus, setAuthStatus] = useState<any>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setResult(null);
    setAuthStatus(null);

    try {
      // Teste de conectividade
      console.log('🚀 Iniciando teste de conectividade...');
      const connectionResult = await testConnection();
      setResult(connectionResult);

      // Teste de autenticação
      console.log('🔐 Verificando status de autenticação...');
      const authResult = await checkAuthStatus();
      setAuthStatus(authResult);

    } catch (error) {
      setResult({
        success: false,
        message: 'Erro durante os testes',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Teste de Conectividade Supabase
          </CardTitle>
          <CardDescription>
            Verificar se a conexão com o banco de dados Supabase está funcionando
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Botão de Teste */}
          <div className="flex justify-center">
            <Button 
              onClick={handleTestConnection}
              disabled={testing}
              className="min-w-[200px]"
              variant={!isSupabaseConfigured ? "secondary" : "default"}
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : !isSupabaseConfigured ? (
                <>
                  <WifiOff className="h-4 w-4 mr-2" />
                  Teste (Não Configurado)
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 mr-2" />
                  Testar Conectividade
                </>
              )}
            </Button>
          </div>

          {/* Resultado da Conectividade */}
          {result && (
            <Card className={`border-2 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                        Teste de Conectividade
                      </h4>
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? 'SUCESSO' : 'ERRO'}
                      </Badge>
                    </div>
                    <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                      {result.message}
                    </p>
                    {result.error && (
                      <p className="text-xs text-red-600 font-mono bg-red-100 p-2 rounded">
                        {result.error}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resultado da Autenticação */}
          {authStatus && (
            <Card className={`border-2 ${authStatus.authenticated ? 'border-blue-200 bg-blue-50' : 'border-yellow-200 bg-yellow-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {authStatus.authenticated ? (
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-yellow-600 mt-0.5" />
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${authStatus.authenticated ? 'text-blue-900' : 'text-yellow-900'}`}>
                        Status de Autenticação
                      </h4>
                      <Badge variant={authStatus.authenticated ? 'default' : 'secondary'}>
                        {authStatus.authenticated ? 'AUTENTICADO' : 'NÃO AUTENTICADO'}
                      </Badge>
                    </div>
                    <p className={`text-sm ${authStatus.authenticated ? 'text-blue-700' : 'text-yellow-700'}`}>
                      {authStatus.authenticated 
                        ? `Usuário autenticado: ${authStatus.user?.email || 'Email não disponível'}`
                        : 'Nenhuma sessão ativa encontrada'
                      }
                    </p>
                    {authStatus.error && (
                      <p className="text-xs text-red-600 font-mono bg-red-100 p-2 rounded">
                        {authStatus.error}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações de Configuração */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Configuração Atual</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p>• <strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Não configurada'}</p>
                <p>• <strong>Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '••••••••' : 'Não configurada'}</p>
                <p>• <strong>Status:</strong> {!isSupabaseConfigured ? '❌ Configuração pendente' : '✅ Configuração válida'}</p>
              </div>
            </div>
          </div>

          {/* Instruções */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">Como Configurar</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>1. Configure as variáveis no arquivo <code>.env.local</code>:</p>
                <pre className="text-xs bg-blue-100 p-2 rounded mt-2">
{`NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima`}
                </pre>
                <p>2. Reinicie o servidor de desenvolvimento</p>
                <p>3. Clique em "Testar Conectividade" para validar</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}