/**
 * Componente principal da sidebar
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { SidebarProps } from './sidebar-types';

export function Sidebar({ 
  className,
  children, 
  ...props 
}: SidebarProps) {
  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen w-64 border-r bg-background z-30 transition-all duration-300",
        className
      )} 
      {...props}
    >
      <div className="h-full flex flex-col">
        {children}
      </div>
    </aside>
  );
} 