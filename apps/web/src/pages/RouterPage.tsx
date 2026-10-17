import { AlertCircle, Router, X } from 'lucide-react';
import { DeviceTable } from '@/components/DeviceTable';
import { RouterConnection } from '@/components/RouterConnection';
import { RouterLoginForm } from '@/components/RouterLoginForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRouterController } from '@/controllers/use-router-controller';
import { useEffect, useRef } from 'react';

export function RouterPage() {
  const controller = useRouterController();
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) {
      return
    }

    initialized.current = true
    void controller.connect()
  }, [controller.connect])

  return (
    <main className="flex items-center min-h-screen bg-muted/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">

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

        {/* {!controller.session && (
          <RouterConnection
            connecting={controller.pendingAction === 'session'}
            onConnect={() => void controller.connect()}
          />
        )} */}

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
    </main>
  );
}
