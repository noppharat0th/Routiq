import { useEffect, useRef } from 'react';
import { Navigate } from 'react-router';
import { RouterErrorAlert } from '@/components/RouterErrorAlert';
import { RouterLoginForm } from '@/components/RouterLoginForm';
import { RouterSessionStatus } from '@/components/RouterSessionStatus';
import { useRouterController } from '@/controllers/use-router-controller';
import { routes } from '@/routes/route-paths';

export function LoginPage() {
  const controller = useRouterController();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || controller.session) {
      return;
    }

    initialized.current = true;
    void controller.connect();
  }, [controller.connect, controller.session]);

  if (controller.authenticated) {
    return <Navigate replace to={routes.dashboard} />;
  }

  return (
    <main className="bg-muted/30 flex min-h-svh items-center px-4 py-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
        {controller.error && (
          <RouterErrorAlert message={controller.error} onDismiss={controller.clearError} />
        )}

        {!controller.session && (
          <RouterSessionStatus
            connecting={controller.pendingAction === 'session'}
            hasError={controller.error !== null}
            onRetry={() => void controller.connect()}
          />
        )}

        {controller.session && (
          <RouterLoginForm
            onDisconnect={() => void controller.disconnect()}
            onLogin={controller.login}
            onRefreshCaptcha={() => void controller.connect()}
            pendingAction={controller.pendingAction}
            session={controller.session}
          />
        )}
      </div>
    </main>
  );
}
