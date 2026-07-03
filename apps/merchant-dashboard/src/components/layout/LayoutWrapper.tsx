'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCheckout = pathname?.startsWith('/checkout');

  if (isCheckout) {
    return <main className="min-h-screen w-full bg-gray-900">{children}</main>;
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-50 text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
