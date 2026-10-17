import { Router } from 'lucide-react';
import { Outlet } from 'react-router';
import { AppSidebar } from '@/components/AppSidebar';
import { RouterErrorAlert } from '@/components/RouterErrorAlert';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useRouterController } from '@/controllers/use-router-controller';

export function MainLayout() {
  const { clearError, disconnect, error, pendingAction } = useRouterController();

  return (
    <SidebarProvider>
      <AppSidebar onSignOut={() => void disconnect()} signingOut={pendingAction === 'logout'} />
      <SidebarInset>
        <header className="bg-background sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator className="mr-2 h-4" orientation="vertical" />
          <Router aria-hidden="true" className="text-muted-foreground size-4" />
          <span className="text-sm font-medium">Router Management</span>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
          {error && <RouterErrorAlert message={error} onDismiss={clearError} />}
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
