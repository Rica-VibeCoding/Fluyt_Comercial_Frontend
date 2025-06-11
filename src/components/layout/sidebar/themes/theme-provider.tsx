/**
 * Provider de temas da sidebar
 */

'use client';

import React, { useEffect } from 'react';
import { useSidebar } from '../core/sidebar-context';
import { applyTheme, loadSavedTheme } from './theme-config';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { currentTheme, setTheme } = useSidebar();

  // Carregar tema salvo na inicialização
  useEffect(() => {
    const savedTheme = loadSavedTheme();
    if (savedTheme !== currentTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Aplicar tema quando mudança
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  return <>{children}</>;
} 