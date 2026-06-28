import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/Header';
import { Outlet } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function DashboardLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background text-foreground">
          <AppSidebar />
          
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            
            <main className="flex-1 overflow-y-auto p-4 md:p-5 bg-muted/30 dark:bg-background">
              <div className="w-full">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
