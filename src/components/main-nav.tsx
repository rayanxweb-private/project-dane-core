'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { PERMISSION_MATRIX, SystemRole } from '@/constants/permissions';
import { 
  LucideLayoutDashboard, 
  LucideLayers, 
  LucideCoins, 
  LucideSettings, 
  LucideShieldAlert, 
  LucideFileSpreadsheet 
} from 'lucide-react';

export function MainNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  
  const role = (user?.role as SystemRole) || 'Viewer';
  const permissions = PERMISSION_MATRIX[role];

  const navigationItems = [
    { href: '/dashboard', label: 'Overview Control', icon: LucideLayoutDashboard, visible: true },
    { href: '/dashboard/merchants', label: 'Merchant Ring', icon: LucideLayers, visible: permissions.canApproveMerchant },
    { href: '/dashboard/transactions', label: 'Ledgers & Ledger Logs', icon: LucideCoins, visible: true },
    { href: '/dashboard/reports', label: 'Financial Compilation', icon: LucideFileSpreadsheet, visible: permissions.canViewAnalytics },
    { href: '/dashboard/audit-logs', label: 'Security & Audits', icon: LucideShieldAlert, visible: permissions.canAccessAuditLogs },
    { href: '/dashboard/settings', label: 'System Configurations', icon: LucideSettings, visible: permissions.canConfigureWebhooks },
  ];

  return (
    <nav className="flex flex-col space-y-1 w-64 bg-slate-900 border-r border-slate-800 p-4 min-h-screen text-slate-400">
      <div className="flex items-center space-x-2 px-3 py-4 mb-6 border-b border-slate-800">
        <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">D</div>
        <span className="font-bold text-sm tracking-wider text-slate-100 uppercase">DANA Enterprise</span>
      </div>
      
      <div className="space-y-1.5">
        {navigationItems.map((item) => {
          if (!item.visible) return null;
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400 font-bold' 
                  : 'hover:bg-slate-850 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
