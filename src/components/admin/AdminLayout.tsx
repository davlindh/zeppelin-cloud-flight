import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebarAdmin } from '@/components/admin/AppSidebarAdmin';
import { AdminHeader } from '@/components/admin/AdminHeader';

export const AdminLayout = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname.split('/')[2] || 'dashboard';
    return path;
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebarAdmin activeTab={activeTab} onTabChange={handleTabChange} />
        <main className="flex-1 flex flex-col">
          <header className="h-16 border-b flex items-center px-4 sticky top-0 bg-background z-10">
            <SidebarTrigger className="mr-4" />
            <AdminHeader />
          </header>
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
