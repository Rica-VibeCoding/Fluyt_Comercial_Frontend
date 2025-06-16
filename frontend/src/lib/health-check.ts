/**
 * TESTES DE CONECTIVIDADE - VERSÃO SÊNIOR
 * Usa cliente API profissional
 */
import { api, ApiClientError } from './api-client';
import { API_CONFIG, logConfig } from './config';

export interface ConnectivityResult {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
  timestamp: string;
  responseTime?: number;
}

export async function testBackendConnection(): Promise<ConnectivityResult> {
  const startTime = Date.now();
  logConfig('Iniciando teste de conectividade...');

  try {
    const data = await api.get(API_CONFIG.ENDPOINTS.HEALTH);
    const responseTime = Date.now() - startTime;

    logConfig('✅ Backend conectado com sucesso', { responseTime });
    
    return {
      success: true,
      data,
      status: 200,
      responseTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    if (error instanceof ApiClientError) {
      logConfig('❌ Erro de API', { status: error.status, message: error.message });
      
      return {
        success: false,
        error: error.message,
        status: error.status,
        responseTime,
        timestamp: new Date().toISOString()
      };
    }
    
    logConfig('❌ Erro de conectividade', { error: error.message });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      responseTime,
      timestamp: new Date().toISOString()
    };
  }
}

// Função para testar múltiplos endpoints
export async function testMultipleEndpoints() {
  const endpoints = [
    '/health',
    '/api/v1/docs',
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);
      
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: API_CONFIG.DEFAULT_HEADERS,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      results.push({
        endpoint,
        success: response.ok,
        status: response.status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      results.push({
        endpoint,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      });
    }
  }

  return results;
} 