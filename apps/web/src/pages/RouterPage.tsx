import { useEffect, useRef } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { DeviceTable } from '@/components/DeviceTable';
import { RouterLoginForm } from '@/components/RouterLoginForm';
import { RouterSessionStatus } from '@/components/RouterSessionStatus';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRouterController } from '@/controllers/use-router-controller';
import { cn } from '@/lib/utils';

export function RouterPage() {
  const controller = useRouterController();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || controller.session) {
      return;
    }

    initialized.current = true;
    void controller.connect();
  }, [controller.connect, controller.session]);

  return (
    <section
      className={cn(
        'bg-muted/30 flex flex-1 items-center',
        !controller.authenticated && 'min-h-svh'
      )}
    >
      <div className="mx-auto flex w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {controller.error && (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>Request failed</AlertTitle>
            <AlertDescription>{controller.error}</AlertDescription>
            <Button
              aria-label="Dismiss error message"
              className="absolute right-2 top-2"
              onClick={controller.clearError}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <X aria-hidden="true" />
            </Button>
          </Alert>
        )}

        {!controller.session && (
          <RouterSessionStatus
            connecting={controller.pendingAction === 'session'}
            hasError={controller.error !== null}
            onRetry={() => void controller.connect()}
          />
        )}

        {controller.session && !controller.authenticated && (
          <RouterLoginForm
            onDisconnect={() => void controller.disconnect()}
            onLogin={controller.login}
            onRefreshCaptcha={() => void controller.connect()}
            pendingAction={controller.pendingAction}
            session={controller.session}
          />
        )}

        {controller.session && controller.authenticated && (
          <DeviceTable
            devices={controller.devices}
            onDisconnect={() => void controller.disconnect()}
            onRefresh={() => void controller.refreshDevices()}
            pendingAction={controller.pendingAction}
          />
        )}
      </div>
    </section>
  );
}
