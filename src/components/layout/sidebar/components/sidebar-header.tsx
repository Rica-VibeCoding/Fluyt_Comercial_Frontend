/**
 * Header da sidebar
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useSidebar } from '../core/sidebar-context';

interface SidebarHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function SidebarHeader({ 
  title = "D-Art",
  subtitle = "Fluyt",
  className 
}: SidebarHeaderProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className={cn("border-b px-4 py-3", className)}>
      <div className="flex items-center justify-between">
        <div className={cn(
          "transition-all duration-300",
          isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
        )}>
          <h1 className="text-lg font-bold mb-0.5 text-foreground">
            {title}
          </h1>
          <p className="text-xs font-medium text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
} 