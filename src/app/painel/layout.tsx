import React from 'react';
import { Sidebar } from '../../components/layout/sidebar';
import { ProgressStepper } from '../../components/layout/progress-stepper';

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <ProgressStepper />
        <main className="bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}