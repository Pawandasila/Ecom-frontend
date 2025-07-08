'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/admin/dashboard', 
    icon: LayoutDashboard,
    badge: null
  },
  { 
    name: 'Users', 
    href: '/admin/users', 
    icon: Users,
    badge: null
  },
  { 
    name: 'Products', 
    href: '/admin/products', 
    icon: Package,
    badge: null
  },
  { 
    name: 'Orders', 
    href: '/admin/orders', 
    icon: ShoppingCart,
    badge: null
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 shadow-2xl">
      {/* Header with gradient and glow effect */}
      <div className="relative flex h-16 items-center px-6 border-b border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-xl"></div>
        <div className="relative flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
            Admin Panel
          </h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group relative flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out',
                isActive
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg shadow-blue-500/20 border border-blue-500/30'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:shadow-md hover:shadow-slate-900/20 hover:border-slate-600/50 border border-transparent'
              )}
            >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200',
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/30' 
                    : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-medium">{item.name}</span>
              </div>

              <div className="flex items-center space-x-2">
                {item.badge && (
                  <span className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold transition-all duration-200',
                    isActive
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'bg-red-500 text-white group-hover:bg-red-400'
                  )}>
                    {item.badge}
                  </span>
                )}
                <ChevronRight className={cn(
                  'h-4 w-4 transition-all duration-200',
                  isActive 
                    ? 'text-blue-300 translate-x-1' 
                    : 'text-slate-500 group-hover:text-slate-300 group-hover:translate-x-1'
                )} />
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-400 to-purple-400 shadow-lg shadow-blue-500/50"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom decoration */}
      <div className="border-t border-slate-700/50 p-4">
        <div className="h-1 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>
      </div>
    </div>
  );
}