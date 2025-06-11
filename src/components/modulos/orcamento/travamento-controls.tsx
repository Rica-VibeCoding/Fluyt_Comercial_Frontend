
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Lock, Unlock, Settings, RotateCcw } from 'lucide-react';

interface TravamentoControlsProps {
  travamentos: {
    valorNegociado: boolean;
    descontoReal: boolean;
    limiteDescontoReal: number;
    descontoRealFixo: boolean;
    valorDescontoRealFixo: number;
  };
  valorNegociado: number;
  descontoReal: number;
  onResetarTravamentos: () => void;
  onDefinirLimiteDescontoReal: (limite: number) => void;
  onEditarDescontoReal: (desconto: number, shouldLock?: boolean) => void;
}

export const TravamentoControls: React.FC<TravamentoControlsProps> = ({
  travamentos,
  valorNegociado,
  descontoReal,
  onResetarTravamentos,
  onDefinirLimiteDescontoReal,
  onEditarDescontoReal
}) => {
  const [novoLimite, setNovoLimite] = useState(travamentos.limiteDescontoReal);
  const [descontoParaTravar, setDescontoParaTravar] = useState(0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleDefinirLimite = () => {
    if (novoLimite >= 0 && novoLimite <= 100) {
      onDefinirLimiteDescontoReal(novoLimite);
    }
  };

  const handleTravarDesconto = () => {
    if (descontoParaTravar >= 0 && descontoParaTravar <= 100) {
      onEditarDescontoReal(descontoParaTravar, true);
    }
  };

  const handleDestravarDesconto = () => {
    onEditarDescontoReal(travamentos.valorDescontoRealFixo, false);
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Settings className="h-5 w-5" />
            🔒 Sistema de Travamentos Avançado
          </CardTitle>
          <Button
            variant="destructive"
            size="sm"
            onClick={onResetarTravamentos}
            className="flex items-center gap-1 text-xs"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Geral
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Atual */}
        <div className="p-4 bg-white rounded-lg border">
          <Label className="font-medium mb-2 block">Status dos Travamentos</Label>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              {travamentos.descontoRealFixo ? (
                <Lock className="h-4 w-4 text-red-500" />
              ) : (
                <Unlock className="h-4 w-4 text-green-500" />
              )}
              <span>
                Desconto Real: {travamentos.descontoRealFixo ? 'Travado' : 'Livre'}
                {travamentos.descontoRealFixo && (
                  <span className="ml-1 text-blue-600 font-medium">
                    ({travamentos.valorDescontoRealFixo.toFixed(1)}%)
                  </span>
                )}
              </span>
            </div>
            <div className="text-gray-600">
              Limite Global: {travamentos.limiteDescontoReal}%
            </div>
          </div>
        </div>

        {/* Controles de Travamento do Desconto Real */}
        <div className="p-4 bg-white rounded-lg border">
          <Label className="font-medium mb-3 block">Travamento de Desconto Real</Label>
          <div className="grid grid-cols-2 gap-4">
            {/* Travar Desconto */}
            <div className="space-y-2">
              <Label className="text-sm">Travar em (%)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={descontoParaTravar}
                  onChange={(e) => setDescontoParaTravar(Number(e.target.value))}
                  min="0"
                  max="100"
                  step="0.1"
                  className="text-sm"
                  placeholder="Ex: 15.5"
                />
                <Button
                  onClick={handleTravarDesconto}
                  size="sm"
                  variant="outline"
                  className="px-3"
                >
                  <Lock className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Destravar Desconto */}
            <div className="space-y-2">
              <Label className="text-sm">Ações</Label>
              <div className="flex gap-2">
                <Button
                  onClick={handleDestravarDesconto}
                  size="sm"
                  variant="outline"
                  disabled={!travamentos.descontoRealFixo}
                  className="flex-1"
                >
                  <Unlock className="h-4 w-4 mr-1" />
                  Destravar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Configuração de Limite */}
        <div className="p-4 bg-white rounded-lg border">
          <Label className="font-medium mb-3 block">Limite de Desconto</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-sm">Limite máximo (%)</Label>
              <Input
                type="number"
                value={novoLimite}
                onChange={(e) => setNovoLimite(Number(e.target.value))}
                min="0"
                max="100"
                step="1"
                className="text-sm"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleDefinirLimite}
                size="sm"
                variant="outline"
              >
                Aplicar
              </Button>
            </div>
          </div>
        </div>

        {/* Travamento Desconto Real Fixo - Indicador Visual */}
        {travamentos.descontoRealFixo && (
          <div className="p-4 bg-blue-100 rounded-lg border border-blue-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <Lock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <Label className="font-medium text-blue-800">Desconto Real Travado</Label>
                  <p className="text-sm text-blue-600">
                    Fixado em {travamentos.valorDescontoRealFixo.toFixed(1)}% - Redistribuição ativa
                  </p>
                </div>
              </div>
              <div className="px-3 py-2 bg-blue-200 rounded-lg">
                <span className="text-blue-800 font-bold">
                  {travamentos.valorDescontoRealFixo.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
