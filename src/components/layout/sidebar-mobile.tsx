/**
 * Sidebar mobile com Sheet (menu hambúrguer)
 */

'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarContent } from './sidebar-content';

interface SidebarMobileProps {
  onItemClick?: () => void;
}

export function SidebarMobile({ onItemClick }: SidebarMobileProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden fixed top-4 left-4 z-40"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 overflow-x-hidden">
        <SidebarContent onItemClick={onItemClick} />
      </SheetContent>
    </Sheet>
  );
}