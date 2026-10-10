'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  Key,
  Settings,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Settlements', href: '/settlements', icon: FileText },
  { name: 'API Keys', href: '/api-keys', icon: Key },
  { name: 'Profile', href: '/profile', icon: Settings },
  { name: 'Checkout Demo', href: '/checkout', icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 min-h-screen flex-col border-r border-white/10 bg-[var(--midnight-navy)] text-slate-200 shadow-[0_0_0_1px_rgba(148,163,184,0.08)]">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--royal-blue)] shadow-[0_12px_20px_rgba(37,99,235,0.35)]">
          <Wallet size={18} className="text-white" />
        </div>
        <div>
          <div className="text-lg font-bold tracking-tight text-white">PayGateway</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-[rgba(37,99,235,0.16)] text-white shadow-[inset_0_0_0_1px_rgba(96,165,250,0.3)]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white',
              )}
            >
              <item.icon
                size={18}
                className={cn(isActive ? 'text-blue-300' : 'text-slate-400')}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Demo Merchant</p>
      </div>
    </aside>
  );
}
