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
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Settlements', href: '/settlements', icon: FileText },
  { name: 'API Keys', href: '/api-keys', icon: Key },
  { name: 'Profile', href: '/profile', icon: Settings },
  { name: 'Hosted Checkout (Demo)', href: '/checkout', icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-gray-950 text-gray-300 min-h-screen">
      <div className="flex items-center gap-3 px-6 py-6 bg-black border-b border-gray-800">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Wallet size={24} className="text-white" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">PayGateway</span>
      </div>
      
      <div className="flex flex-col flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm",
                isActive 
                  ? "bg-blue-600/10 text-blue-500" 
                  : "hover:bg-gray-900 hover:text-gray-100"
              )}
            >
              <item.icon size={18} className={cn(isActive ? "text-blue-500" : "text-gray-400")} />
              {item.name}
            </Link>
          );
        })}
      </div>
      
      <div className="p-6 border-t border-gray-800 text-xs text-gray-500">
        <p>Merchant ID: <span className="font-mono text-gray-400">demo-merchant-123</span></p>
      </div>
    </div>
  );
}
