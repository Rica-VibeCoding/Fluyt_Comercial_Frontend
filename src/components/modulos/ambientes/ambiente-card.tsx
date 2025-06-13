'use client';

import { useState } from 'react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { ChevronDown, ChevronRight, Trash2, Home, Package, Clock } from 'lucide-react';
import { Ambiente } from '../../../types/ambiente';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../ui/collapsible';

interface AmbienteCardProps {
  ambiente: Ambiente;
  onRemover: (id: string) => void;
}

export function AmbienteCard({ ambiente, onRemover }: AmbienteCardProps) {
  const [expandido, setExpandido] = useState(false);

  // Função para formatar data/hora no padrão solicitado: "13/06/2025 - 00:48"
  const formatarDataHora = (dataIso?: string) => {
    if (!dataIso) return null;
    
    const data = new Date(dataIso);
    
    // Formato: "DD/MM/YYYY - HH:MM"
    return data.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    }) + ' - ' + data.toLocaleTimeString('pt-BR', {
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <Collapsible open={expandido} onOpenChange={setExpandido}>
      {/* 
        MELHORIA VISUAL PRINCIPAL: 
        - Card individual com bordas e sombra (mais presença visual)
        - Padding generoso (16px) seguindo padrões GitHub
        - Estados hover bem definidos
        - Hierarquia de informação clara
      */}
      <div className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 mb-3">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors group rounded-lg">
            
            {/* SEÇÃO ESQUERDA: Ícone + Informações do Ambiente */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              
              {/* Ícone Visual do Ambiente - Inspirado no GitHub file tree */}
              <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                <Home className="h-5 w-5 text-blue-600" />
              </div>
              
              {/* Informações Principais com Hierarquia */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  {/* Nome do ambiente em destaque */}
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    {ambiente.nome}
                  </h3>
                  
                  {/* Badge com número de acabamentos */}
                  <Badge 
                    variant="secondary" 
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200"
                  >
                    <Package className="h-3 w-3 mr-1" />
                    {ambiente.acabamentos.length}
                  </Badge>

                  {/* Badge de origem (manual/importado) - Discreto */}
                  {ambiente.origem && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-1 ${
                        ambiente.origem === 'xml' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {ambiente.origem === 'xml' ? 'XML' : 'Manual'}
                    </Badge>
                  )}
                </div>
                
                {/* Informações secundárias em linha */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{ambiente.acabamentos.length} itens configurados</span>
                  
                  {/* Data/hora discreta com ícone */}
                  {(ambiente.importadoEm || ambiente.criadoEm) && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {ambiente.origem === 'xml' 
                          ? formatarDataHora(ambiente.importadoEm) 
                          : formatarDataHora(ambiente.criadoEm)
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* SEÇÃO DIREITA: Valor + Controles */}
            <div className="flex items-center gap-4 shrink-0">
              
              {/* Valor Total com destaque */}
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900 tabular-nums">
                  {ambiente.valorTotal.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </div>
                <div className="text-xs text-gray-500">valor total</div>
              </div>
              
              {/* Indicador de Expansão - Chevron mais visível */}
              <div className="flex items-center gap-2">
                {expandido ? (
                  <ChevronDown className="h-5 w-5 text-gray-400 transition-transform" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400 transition-transform" />
                )}
              </div>
              
              {/* Botão Remover com hover states melhorados */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemover(ambiente.id);
                }}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all rounded-md"
                title="Remover ambiente"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>

        {/* CONTEÚDO EXPANDIDO: Tabela de acabamentos aprimorada */}
        <CollapsibleContent>
          <div className="border-t border-gray-100 bg-gray-50/50">
            <div className="p-4">
              
                             {/* Header da tabela com contexto */}
               <div className="mb-3">
                 <h4 className="text-sm font-medium text-gray-700 mb-1">
                   Detalhes dos Acabamentos
                 </h4>
               </div>

              {/* Tabela com visual aprimorado */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="h-10 text-xs font-semibold text-gray-700 py-2">Tipo</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-gray-700 py-2">Cor</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-gray-700 py-2">Material</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-gray-700 py-2">Espessura</TableHead>
                      <TableHead className="h-10 text-xs font-semibold text-gray-700 text-right py-2">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ambiente.acabamentos.map((acabamento, index) => (
                      <TableRow key={acabamento.id} className={`
                        border-b border-gray-100 hover:bg-gray-50/50 transition-colors
                        ${index === ambiente.acabamentos.length - 1 ? 'border-b-0' : ''}
                      `}>
                        <TableCell className="py-3 text-sm font-medium text-gray-900">
                          <Badge variant="outline" className="text-xs">
                            {acabamento.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 text-sm text-gray-600">
                          {acabamento.cor}
                        </TableCell>
                        <TableCell className="py-3 text-sm text-gray-600">
                          {acabamento.material}
                        </TableCell>
                        <TableCell className="py-3 text-sm text-gray-600">
                          {acabamento.espessura}
                        </TableCell>
                        <TableCell className="py-3 text-sm text-right font-semibold tabular-nums text-gray-900">
                          {acabamento.valor.toLocaleString('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}