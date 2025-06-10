/**
 * Provider de temas da sidebar
 */

'use client';

import React, { useEffect } from 'react';
import { useSidebar } from '../core/sidebar-context';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { currentTheme } = useSidebar();

  useEffect(() => {
    // Aplicação básica de tema será implementada na etapa 2
    const root = document.documentElement;
    root.setAttribute('data-sidebar-theme', currentTheme);
  }, [currentTheme]);

  return <>{children}</>;
} 