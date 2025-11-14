import React from 'react';
import { GlobalSearch } from '@/components/shared/GlobalSearch';
import { NotificationCenter } from '@/components/shared/NotificationCenter';
import { DashboardSwitcher } from '@/components/shared/DashboardSwitcher';
import { cn } from '@/lib/utils';

interface UnifiedDashboardLayoutProps {
  children: React.ReactNode;
  role?: 'admin' | 'provider' | 'participant' | 'customer';
  className?: string;
}

const roleThemes = {
  admin: 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20',
  provider: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
  participant: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
  customer: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20'
};

export const UnifiedDashboardLayout: React.FC<UnifiedDashboardLayoutProps> = ({
  children,
  role = 'customer',
  className
}) => {
  return (
    <div className={cn('min-h-screen', roleThemes[role])}>
      {/* Unified Dashboard Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-4 px-4 md:px-6">
          {/* Left: Search */}
          <div className="flex-1 max-w-xl">
            <GlobalSearch />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <DashboardSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn('container px-4 py-6 md:px-6', className)}>
        {children}
      </main>
    </div>
  );
};
