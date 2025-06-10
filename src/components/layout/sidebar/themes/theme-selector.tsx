/**
 * Seletor básico de temas da sidebar
 */

'use client';

import React from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '../core/sidebar-context';

export function ThemeSelector() {
  const { isCollapsed } = useSidebar();

  return (
    <div className={`transition-all duration-300 ${isCollapsed ? 'flex justify-center' : ''}`}>
      <Button 
        variant="ghost" 
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        title={isCollapsed ? 'Trocar tema' : undefined}
      >
        <Palette className="h-4 w-4" />
      </Button>
    </div>
  );
} 