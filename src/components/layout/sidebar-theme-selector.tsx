/**
 * Seletor de temas para a sidebar
 */

'use client';

import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { sidebarThemes, applyTheme, type SidebarTheme } from './sidebar-themes';

interface SidebarThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
  isCollapsed?: boolean;
}

export function SidebarThemeSelector({ 
  currentTheme, 
  onThemeChange, 
  isCollapsed = false 
}: SidebarThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeSelect = (themeId: string) => {
    applyTheme(themeId);
    onThemeChange(themeId);
    setIsOpen(false);
  };

  const getCurrentTheme = (): SidebarTheme | undefined => {
    return sidebarThemes.find(t => t.id === currentTheme);
  };

  const currentThemeData = getCurrentTheme();

  return (
    <div className={`transition-all duration-300 ${isCollapsed ? 'flex justify-center' : ''}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title={isCollapsed ? 'Trocar tema' : undefined}
          >
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-64 p-3" align="start" side="right">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-4 w-4 text-gray-600" />
              <p className="text-sm font-medium text-gray-900">Escolher tema</p>
            </div>
            
            {/* Preview do tema atual */}
            {currentThemeData && (
              <div className="p-2 rounded-lg border bg-gray-50 mb-3">
                <p className="text-xs text-gray-500 mb-1">Tema atual:</p>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: `hsl(${currentThemeData.colors.primary})` }}
                  />
                  <span className="text-sm font-medium">{currentThemeData.name}</span>
                </div>
              </div>
            )}
            
            {/* Lista de temas */}
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {sidebarThemes.map((theme) => (
                <Button
                  key={theme.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-2 hover:bg-gray-100"
                  onClick={() => handleThemeSelect(theme.id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    {/* Preview das cores */}
                    <div className="flex gap-1">
                      <div 
                        className="w-3 h-3 rounded border border-gray-200"
                        style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                        title="Cor primária"
                      />
                      <div 
                        className="w-3 h-3 rounded border border-gray-200"
                        style={{ backgroundColor: `hsl(${theme.colors.sidebar})` }}
                        title="Fundo da sidebar"
                      />
                    </div>
                    
                    {/* Nome do tema */}
                    <span className="text-sm flex-1">{theme.name}</span>
                    
                    {/* Check se é o tema atual */}
                    {currentTheme === theme.id && (
                      <Check className="h-3 w-3 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
            
            {/* Rodapé com info */}
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Tema será salvo automaticamente
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 